import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from .catalog import OBS


COOKIE = 'waiting_home_mobile_session'
SESSION_AGE = timedelta(days=1)
ANSWERS = ('budget', 'time', 'screens', 'housing', 'travel', 'furniture')
SCORE = {'ready': 2, 'planned': 1, 'unsure': 0}
PREFERENCES = {'preferredSpecies': {'either', 'cat', 'dog'}, 'preferredSize': {'either', 'small', 'medium', 'large'}}
LISTING_ID = re.compile(r'listing_[a-zA-Z0-9_-]{1,200}\Z')


class Credentials(BaseModel):
    identifier: str = Field(max_length=180)
    password: str = Field(max_length=128)


class DemoProvider(BaseModel):
    provider: str


class Questionnaire(BaseModel):
    answers: dict[str, str]


def utc_now():
    return datetime.now(timezone.utc)


def hash_password(password, salt):
    return hashlib.scrypt(password.encode('utf-8'), salt=bytes.fromhex(salt), n=2**14, r=8, p=1).hex()


def parse_identifier(value):
    identifier = value.strip().casefold()
    if re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', identifier):
        return identifier
    if re.fullmatch(r'[+\d\s()-]+', identifier):
        phone = re.sub(r'\D', '', identifier)
        if 8 <= len(phone) <= 16:
            return phone[3:] if len(phone) == 11 and phone.startswith('852') else phone
    raise HTTPException(422, '請輸入有效格式的電郵或電話號碼。')


def hash_token(raw):
    return hashlib.sha256(raw.encode('ascii')).hexdigest()


def session_id(request):
    raw = request.cookies.get(COOKIE, '')
    return hash_token(raw) if re.fullmatch(r'[0-9a-f]{64}', raw) else None


def known_size(observation):
    size = str(observation.get('source_values_raw', {}).get('size_raw') or '').casefold().strip()
    matches = re.findall(r'(?<![a-z])(small|medium|large)(?![a-z])|([小中大])型', size)
    mapped = {english or {'小': 'small', '中': 'medium', '大': 'large'}[chinese] for english, chinese in matches}
    return next(iter(mapped)) if len(mapped) == 1 else None


def router(catalogue):
    account_db = catalogue.client[os.environ.get('ADOPTION_ACCOUNT_DB', 'waiting_for_home_mobile_accounts')]
    api = APIRouter(prefix='/api')

    @lru_cache(maxsize=1)
    def setup():
        account_db.users.create_index('identifier', unique=True, sparse=True)
        account_db.sessions.create_index('expires_at', expireAfterSeconds=0)

    def current(request):
        sid = session_id(request)
        if not sid:
            return None
        session = account_db.sessions.find_one({'_id': sid, 'expires_at': {'$gt': utc_now()}})
        return account_db.users.find_one({'_id': session['user_id']}) if session else None

    def active(request):
        user = current(request)
        if not user:
            raise HTTPException(401, '請先登入。')
        return user

    def card_summary(ids):
        if not ids:
            return []
        found = {}
        rows = catalogue.db.observations.find({'listing_id': {'$in': ids}}, OBS).sort([('snapshot_date', -1), ('_id', 1)])
        for obs in rows:
            found.setdefault(obs['listing_id'], obs)
        docs = [found[item] for item in ids if item in found]
        references = catalogue.references(docs)
        media = catalogue.photo_map([row['_id'] for row in docs])
        return [catalogue.card(row, references, media[row['_id']]) for row in docs]

    def expose(user):
        if not user:
            return {'user': None}
        return {'user': dict(id=user['_id'], displayName=user['display_name'], provider=user['provider'],
                             questionnaire=user.get('questionnaire'), favorites=card_summary(user.get('favorites', [])),
                             likes=user.get('likes', []))}

    def revoke(request):
        key = session_id(request)
        if key:
            account_db.sessions.delete_one({'_id': key})

    def sign_in(request, response, user):
        token = secrets.token_hex(32)
        account_db.sessions.insert_one({'_id': hash_token(token), 'user_id': user['_id'], 'expires_at': utc_now() + SESSION_AGE})
        revoke(request)
        response.set_cookie(COOKIE, token, max_age=int(SESSION_AGE.total_seconds()), httponly=True,
                            secure=request.url.scheme == 'https', samesite='strict')
        return expose(user)

    @api.get('/account')
    def account(request: Request):
        return expose(current(request))

    @api.post('/auth/register')
    def register(body: Credentials, request: Request, response: Response):
        setup()
        identifier = parse_identifier(body.identifier)
        if len(body.password) < 8:
            raise HTTPException(422, '示範密碼最少需要 8 個字元。')
        salt = secrets.token_hex(16)
        user = {'_id': secrets.token_hex(16), 'identifier': identifier, 'display_name': '領養探索者', 'provider': 'local',
                'salt': salt, 'password_hash': hash_password(body.password, salt), 'created_at': utc_now(),
                'favorites': [], 'likes': []}
        try:
            account_db.users.insert_one(user)
        except DuplicateKeyError:
            raise HTTPException(409, '這個帳號已註冊，請改用登入。') from None
        return sign_in(request, response, user)

    @api.post('/auth/login')
    def login(body: Credentials, request: Request, response: Response):
        setup()
        identifier = parse_identifier(body.identifier)
        user = account_db.users.find_one({'identifier': identifier, 'provider': 'local'})
        actual = hash_password(body.password, user['salt'] if user else '00' * 16)
        if not hmac.compare_digest(actual, user['password_hash'] if user else '00' * 64) or not user:
            raise HTTPException(401, '帳號或密碼不正確。')
        return sign_in(request, response, user)

    @api.post('/auth/demo-provider')
    def provider_login(body: DemoProvider, request: Request, response: Response):
        setup()
        display = {'google': 'Google 示範帳號', 'apple': 'Apple 示範帳號'}.get(body.provider)
        if display is None:
            raise HTTPException(422, '請選擇 Google 或 Apple 示範。')
        user = {'_id': secrets.token_hex(16), 'display_name': display, 'provider': body.provider,
                'created_at': utc_now(), 'favorites': [], 'likes': []}
        account_db.users.insert_one(user)
        return sign_in(request, response, user)

    @api.post('/auth/logout')
    def logout(request: Request, response: Response):
        revoke(request)
        response.delete_cookie(COOKIE, httponly=True, samesite='strict')
        return expose(None)

    @api.put('/account/questionnaire')
    def questionnaire(body: Questionnaire, request: Request):
        user = active(request)
        answers = body.answers
        if (set(answers) - (set(ANSWERS) | set(PREFERENCES)) or any(answers.get(key) not in SCORE for key in ANSWERS)
                or any(answers.get(key, 'either') not in choices for key, choices in PREFERENCES.items())):
            raise HTTPException(422, '請完成六項準備問題，再儲存問卷。')
        score = round(100 * sum(SCORE[answers[key]] for key in ANSWERS) / (2 * len(ANSWERS)))
        result = dict(answers=answers, score=score, completedAt=utc_now().isoformat(timespec='seconds'))
        updated = account_db.users.find_one_and_update({'_id': user['_id']}, {'$set': {'questionnaire': result}},
                                                      return_document=ReturnDocument.AFTER)
        return expose(updated)

    @api.get('/account/matches')
    def matches(request: Request):
        user = active(request)
        questionnaire = user.get('questionnaire')
        if not questionnaire:
            return {'items': [], 'hasQuestionnaire': False, 'missing_size': 0, 'total': 0}
        answers = questionnaire['answers']
        species = answers.get('preferredSpecies', 'either')
        size = answers.get('preferredSize', 'either')
        release = catalogue.release()
        predicate = catalogue.query_filter(release, species=species if species != 'either' else '')
        docs = list(catalogue.db.observations.find(predicate, {**OBS, 'source_values_raw.size_raw': 1})
                    .sort([('snapshot_date', -1), ('name', 1), ('_id', 1)]))
        missing = 0
        if size != 'either':
            missing = sum(not known_size(row) for row in docs)
            docs = [row for row in docs if known_size(row) == size]
        sample = docs[:8]
        references = catalogue.references(sample)
        media = catalogue.photo_map([row['_id'] for row in sample])
        return {'items': [catalogue.card(row, references, media[row['_id']]) for row in sample], 'hasQuestionnaire': True,
                'missing_size': missing, 'total': len(docs), 'release_date': release['catalogue_as_of']}

    @api.put('/account/{collection}/{listing_id}')
    @api.delete('/account/{collection}/{listing_id}')
    def set_relation(collection: str, listing_id: str, request: Request):
        user = active(request)
        if collection not in {'favorites', 'likes'} or not LISTING_ID.fullmatch(listing_id):
            raise HTTPException(404, '找不到這則檔案。')
        predicate = {'_id': user['_id']}
        if request.method == 'PUT':
            if not catalogue.db.listings.find_one({'_id': listing_id}, {'_id': 1}):
                raise HTTPException(404, '找不到這則檔案。')
            predicate['$or'] = [{collection: listing_id}, {f'{collection}.119': {'$exists': False}}]
            change = {'$addToSet': {collection: listing_id}}
        else:
            change = {'$pull': {collection: listing_id}}
        updated = account_db.users.find_one_and_update(predicate, change, return_document=ReturnDocument.AFTER)
        if not updated:
            raise HTTPException(409, '清單已滿，請先移除幾個檔案。')
        return expose(updated)

    return api
