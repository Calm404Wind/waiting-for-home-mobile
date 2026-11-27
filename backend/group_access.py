"""Private entry point for a shared test tunnel. The local app uses backend.server."""

import hashlib
import hmac
import html
import json
import os
import re
import secrets
import time
from collections import deque
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit

import anyio
from starlette.datastructures import MutableHeaders
from starlette.requests import Request
from starlette.responses import HTMLResponse, JSONResponse, PlainTextResponse, RedirectResponse, Response

from .accounts_api import COOKIE as PERSONAL_COOKIE
from .server import app as catalogue_app, test_host


LOGIN = '/group/login'
LOGOUT = '/group/logout'
COOKIE = '__Host-waiting-home-group'
SESSION_AGE = 7 * 24 * 3600
LOGIN_TEMPLATE = Path(__file__).with_name('group_login.html').read_text(encoding='utf-8')


def return_page(value):
    # This SPA's only document path is /. Both query and hash deeplinks are valid.
    if not isinstance(value, str) or len(value) > 2048 or not value.startswith('/'):
        return '/'
    if value.startswith('//') or '\\' in value or any(ord(char) < 32 or ord(char) == 127 for char in value):
        return '/'
    try:
        parts = urlsplit(value)
        return value if parts.path == '/' and not parts.netloc and not parts.scheme else '/'
    except ValueError:
        return '/'


def login_form(destination, feedback='', status=200):
    nonce = secrets.token_urlsafe(18)
    content = LOGIN_TEMPLATE.replace('__NONCE__', nonce).replace('<!--feedback-->',
        f'<p role="alert">{html.escape(feedback)}</p>' if feedback else '')
    content = content.replace('__NEXT__', html.escape(return_page(destination), quote=True))
    return HTMLResponse(content, status, headers={
        'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY',
        'Content-Security-Policy': f"default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-{nonce}'; "
                                   "form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    })


class GroupAccess:
    def __init__(self, application, host, config_file):
        if not host or not config_file:
            raise ValueError('Set the exact ADOPTION_TEST_ORIGIN and mounted GROUP_ACCESS_CONFIG before starting.')
        config = json.loads(Path(config_file).read_text(encoding='utf-8-sig'))
        username = config['username']
        if not isinstance(username, str) or not username.strip() or len(username) > 160:
            raise ValueError('Invalid group account configuration')
        self.username = username.encode()
        self.password_hash = bytes.fromhex(config['password_hash'])
        self.salt = bytes.fromhex(config['salt'])
        signing_key = bytes.fromhex(config['signing_key'])
        if (len(self.salt), len(self.password_hash), len(signing_key)) != (16, 32, 32):
            raise ValueError('Invalid group credential configuration')
        # Rotating the key, account or password also ends sessions issued with it.
        self.session_key = hmac.digest(signing_key, self.username + b'\0' + self.password_hash, 'sha256')
        self.host = host
        self.origin = 'https://' + host
        self.application = application
        self.attempts = deque()
        self.hash_slots = anyio.CapacityLimiter(2)

    def signature(self, payload):
        return hmac.digest(self.session_key, payload.encode('ascii'), 'sha256').hex()

    def valid_session(self, token):
        if not re.fullmatch(r'[0-9]{1,12}\.[0-9a-f]{32}\.[0-9a-f]{64}', token):
            return False
        payload, signature = token.rsplit('.', 1)
        expires = int(payload.split('.')[0])
        now = int(time.time())
        return now < expires <= now + SESSION_AGE and hmac.compare_digest(signature, self.signature(payload))

    def matches(self, username, key):
        candidate = hashlib.scrypt(key.encode(), salt=self.salt, n=16384, r=8, p=1, dklen=32)
        user_ok = hmac.compare_digest(username.encode(), self.username)
        return hmac.compare_digest(candidate, self.password_hash) and user_ok

    async def submit(self, request):
        if request.headers.get('content-type', '').partition(';')[0].strip().lower() != 'application/x-www-form-urlencoded':
            return Response(status_code=415)
        body = bytearray()
        async for chunk in request.stream():
            if len(body) + len(chunk) > 4096:
                return Response(status_code=413)
            body.extend(chunk)
        try:
            fields = parse_qs(body.decode(), keep_blank_values=True, errors='strict', max_num_fields=5)
        except (UnicodeError, ValueError):
            return Response(status_code=400)
        username, key = fields.get('username', []), fields.get('key', [])
        destination = return_page(fields.get('next', ['/'])[0])
        if len(username) != 1 or len(key) != 1 or not 1 <= len(key[0]) <= 256 or len(username[0]) > 160:
            return login_form(destination, '請輸入小組帳戶和密鑰。', 400)
        # One small shared instance. Independent of any client-supplied IP headers.
        now = time.monotonic()
        while self.attempts and self.attempts[0] <= now - 60:
            self.attempts.popleft()
        if len(self.attempts) >= 24:
            reply = login_form(destination, '嘗試次數較多，請稍後再試。', 429)
            reply.headers['Retry-After'] = '60'
            return reply
        self.attempts.append(now)
        if not await anyio.to_thread.run_sync(self.matches, username[0], key[0], limiter=self.hash_slots):
            return login_form(destination, '帳戶或密鑰不正確，請再試一次。', 401)
        if now in self.attempts:
            self.attempts.remove(now)
        payload = f'{int(time.time()) + SESSION_AGE}.{secrets.token_hex(16)}'
        reply = RedirectResponse(destination, status_code=303)
        reply.set_cookie(COOKIE, payload + '.' + self.signature(payload), max_age=SESSION_AGE,
                         path='/', httponly=True, secure=True, samesite='lax')
        return reply

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'lifespan':
            return await self.application(scope, receive, send)
        if scope['type'] != 'http':
            return await send({'type': 'websocket.close', 'code': 1008})
        request = Request(scope, receive)
        authenticated = False

        async def private_send(message):
            if message['type'] == 'http.response.start':
                headers = MutableHeaders(scope=message)
                headers['Cache-Control'] = 'private, no-store'
                headers['X-Content-Type-Options'] = 'nosniff'
                if authenticated:
                    headers['X-Group-Access'] = 'active'
            await send(message)

        hosts = request.headers.getlist('host')
        path, method = scope['path'], scope['method']
        if len(hosts) != 1 or hosts[0].lower() not in (self.host, self.host + ':443'):
            reply = Response(status_code=400)
        elif scope['scheme'] != 'https' and request.headers.get('x-forwarded-proto', '').lower() != 'https':
            reply = PlainTextResponse('HTTPS required', status_code=403)
        elif method not in ('GET', 'HEAD') and path in (LOGIN, LOGOUT) and request.headers.getlist('origin') != [self.origin]:
            reply = Response(status_code=403)
        elif path == LOGIN and method in ('GET', 'HEAD'):
            destination = return_page(request.query_params.get('next'))
            if self.valid_session(request.cookies.get(COOKIE, '')):
                reply = RedirectResponse(destination, status_code=303)
            else:
                reply = login_form(destination)
        elif path == LOGIN and method == 'POST':
            reply = await self.submit(request)
        elif path == LOGOUT and method == 'POST':
            reply = RedirectResponse(LOGIN, status_code=303)
            reply.delete_cookie(COOKIE, path='/', secure=True, httponly=True, samesite='lax')
            reply.delete_cookie(PERSONAL_COOKIE, path='/', secure=True, httponly=True, samesite='strict')
        elif path in (LOGIN, LOGOUT):
            reply = Response(status_code=405, headers={'Allow': 'POST' if path == LOGOUT else 'GET, HEAD, POST'})
        elif self.valid_session(request.cookies.get(COOKIE, '')):
            authenticated = True
            return await self.application(scope, receive, private_send)
        elif path == '/api' or path.startswith('/api/'):
            reply = JSONResponse({'code': 'group_login_required', 'detail': '請先登入小組測試。'}, status_code=401)
        elif path == '/' and method in ('GET', 'HEAD'):
            destination = '/' + ('?' + request.url.query if request.url.query else '')
            reply = RedirectResponse(LOGIN + '?' + urlencode({'next': return_page(destination)}), status_code=303)
        else:
            reply = Response(status_code=401)
        return await reply(scope, receive, private_send)


app = GroupAccess(catalogue_app, test_host, os.environ.get('GROUP_ACCESS_CONFIG'))
