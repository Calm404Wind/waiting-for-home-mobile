import json
import re
from collections import Counter, defaultdict
from datetime import date
from functools import lru_cache
from itertools import islice
from pathlib import Path
from urllib.parse import urlsplit

from pymongo import MongoClient


STATUS_LABELS = {
    'listed': '官網列為待領養', 'foster_option': '可申請領養或暫養', 'trial': '申請中／試領養',
    'in_care': '在院／可探訪', 'long_term': '助養／長期照顧', 'fostered': '暫養中',
    'memorial': '已離世', 'ambassador': '親善大使', 'adopted': '官網列為已領養', 'unknown': '待核對',
}
AGE_LABELS = {'young': '幼年 · 未滿 1 歲', 'adult': '成年 · 1 至未滿 7 歲', 'senior': '高齡 · 7 歲或以上',
              'group': '成對／多隻', 'unknown': '年齡未明或跨組'}
SPECIES = ['cat', 'dog']
HERO_LISTING = 'listing_kirstens_zoo_c604ca5964538d'
DISTRICT_SOURCE = 'https://data.gov.hk/tc-data/dataset/hk-had-json1-hong-kong-administrative-boundaries'
PHOTO_EXTENSIONS = {'.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'}
PHOTO_PACKS = {'hk_shelter_catalog_2026-10-20', 'hk_shelter_catalog_2026-11-23'}
OBS = {'_id': 1, 'listing_id': 1, 'organisation_id': 1, 'snapshot_date': 1, 'name': 1, 'species': 1,
       'adoption_status': 1, 'status_raw': 1, 'age_range_years': 1, 'birth_date_evidence': 1,
       'source_values_raw.age_raw': 1, 'source_values_raw.description_excerpt': 1, 'breed_raw': 1,
       'sex': 1, 'centre_id': 1, 'source_url': 1}
MEDIA = {'_id': 1, 'observation_id': 1, 'photo_order': 1, 'role': 1, 'archive_relative_path': 1,
         'source_photo_url': 1, 'publisher_page_url': 1, 'sha256': 1}


def http_url(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = urlsplit(value)
    except ValueError:
        return None
    return value if parsed.scheme in {'http', 'https'} and parsed.netloc else None


def date_label(raw, fallback):
    if raw and len(raw) > 19 and raw[10] == 'T' and raw.endswith('+08:00'):
        return f'{raw[:10]} {raw[11:16]}（香港）'
    return fallback


def age_value(obs, listing):
    if listing.get('group_kind') in {'group_or_pair', 'pair'}:
        return 'group', '成對／多隻'
    duration = obs.get('age_range_years') or {}
    low, high = duration.get('min'), duration.get('max')
    if low is None or high is None:
        birth = obs.get('birth_date_evidence') or {}
        if birth.get('from') and birth.get('to'):
            snapshot = date.fromisoformat(obs['snapshot_date'])
            low = (snapshot - date.fromisoformat(birth['to'])).days / 365.2425
            high = (snapshot - date.fromisoformat(birth['from'])).days / 365.2425
            if high >= 0:
                low = max(0, low)
    original = (obs.get('source_values_raw') or {}).get('age_raw')
    if low is None or high is None or not (0 <= low <= high <= 40):
        return 'unknown', original or '年齡未明'
    classify = lambda amount: 'young' if amount < 1 else 'adult' if amount < 7 else 'senior'
    band = classify(low) if classify(low) == classify(high) else 'unknown'
    if original:
        return band, original
    if high < 1:
        first, last, unit = int(low * 12), int(high * 12), '個月'
    else:
        first, last, unit = int(low), int(high), '歲'
    if not first and not last and unit == '個月':
        label = '不足 1 個月'
    else:
        label = f'約 {first} {unit}' if first == last else f'約 {first}–{last} {unit}'
    return band, label


class Catalogue:
    def __init__(self, uri, database, archive_root, data_dir):
        self.client = MongoClient(uri, serverSelectionTimeoutMS=2300)
        self.db = self.client[database]
        self.archive_root = archive_root.resolve()
        self.data_dir = data_dir

    def release(self):
        release = self.db.releases.find_one(sort=[('catalogue_as_of', -1)])
        if not release:
            raise LookupError('找不到已匯入的領養資料版本。')
        return release

    def query_filter(self, release, species='', organisation_id='', status='listed', q='', centre_id=''):
        predicate = {'run_id': {'$in': release['run_ids']}, 'species': species or {'$in': SPECIES}, 'visibility': 'seen'}
        if organisation_id:
            predicate['organisation_id'] = organisation_id
        if centre_id:
            predicate['centre_id'] = centre_id
        if status != 'all':
            predicate['adoption_status'] = status
        if q.strip():
            pattern = {'$regex': re.escape(q.strip()), '$options': 'i'}
            term = q.strip().casefold()
            geography = self.geography('centre_coordinates.json') or {}
            centres = set(self.db.centres.distinct('_id', {'name': pattern}))
            centres.update(ident for ident, coord in geography.items()
                           if any(term in (coord.get(field) or '').casefold() for field in ('short_name', 'district_name')))
            orgs = self.db.organisations.distinct('_id', {'name': pattern})
            exact_id = {'$regex': '^' + re.escape(q.strip()) + '$', '$options': 'i'}
            predicate['$or'] = [{'name': pattern}, {'legacy_record_id': exact_id}, {'centre_id': {'$in': list(centres)}},
                                {'organisation_id': {'$in': orgs}}]
        return predicate

    def media_path(self, media):
        stored = (media or {}).get('archive_relative_path')
        if not stored:
            return None
        root = self.archive_root
        relative = Path(stored)
        if relative.is_absolute() or len(relative.parts) < 3 or relative.parts[1] != 'photos':
            return None
        if relative.parts[0] not in PHOTO_PACKS:
            return None
        allowed = (root / relative.parts[0] / 'photos').resolve()
        path = (root / relative).resolve()
        if not path.is_relative_to(allowed) or path.suffix.lower() not in PHOTO_EXTENSIONS or not path.is_file():
            return None
        return path

    def photo_map(self, ids):
        grouped = defaultdict(list)
        if ids:
            rows = self.db.media.find({'observation_id': {'$in': ids}}, MEDIA).sort([('photo_order', 1), ('_id', 1)])
            for photo in rows:
                grouped[photo['observation_id']].append(photo)
        return grouped

    def photos(self, media, max_photos=None):
        result, locations = [], set()
        for photo in sorted(media, key=lambda row: (row.get('role') != 'primary', row.get('photo_order', 0))):
            key = photo.get('sha256') or photo.get('archive_relative_path') or photo.get('source_photo_url')
            if key in locations or not self.media_path(photo):
                continue
            locations.add(key)
            result.append(dict(url='/media/' + photo['_id'], source_url=http_url(photo.get('source_photo_url')),
                               publisher_url=http_url(photo.get('publisher_page_url')), sha256=photo.get('sha256')))
            if max_photos and len(result) >= max_photos:
                break
        return result

    def references(self, docs):
        listing_ids = list({obs['listing_id'] for obs in docs})
        organisation_ids = list({obs['organisation_id'] for obs in docs})
        listings = {row['_id']: row for row in self.db.listings.find({'_id': {'$in': listing_ids}}, {'group_kind': 1, 'identity_review': 1})}
        orgs = {row['_id']: row for row in self.db.organisations.find({'_id': {'$in': organisation_ids}})}
        centre_ids = list({obs['centre_id'] for obs in docs if obs.get('centre_id')})
        centres = {row['_id']: row['name'] for row in self.db.centres.find({'_id': {'$in': centre_ids}}, {'name': 1})}
        return listings, orgs, centres

    def card(self, obs, refs, media=None):
        listings, orgs, centres = refs
        age_key, age_label = age_value(obs, listings[obs['listing_id']])
        primary = self.photos(media, 1) if media else []
        state = obs['adoption_status']
        centre_id = obs.get('centre_id')
        coord = (self.geography('centre_coordinates.json') or {}).get(centre_id, {})
        return dict(id=obs['listing_id'], name=obs.get('name') or '名稱未公佈', species=obs['species'], age_label=age_label,
                    age_key=age_key, organisation=orgs[obs['organisation_id']]['name'], organisation_id=obs['organisation_id'],
                    status=state, status_label=STATUS_LABELS[state], photo_url=primary[0]['url'] if primary else None,
                    centre_id=centre_id, centre_name=centres.get(centre_id), district=coord.get('district_name'),
                    sex_key=obs.get('sex') if obs.get('sex') in {'male', 'female'} else None,
                    breed=obs.get('breed_raw'), description=(obs.get('source_values_raw') or {}).get('description_excerpt'),
                    source_url=http_url(obs.get('source_url')), snapshot_date=obs['snapshot_date'])

    def items(self, species, organisation_id, status, q, page, page_size, centre_id='', age_key=''):
        release = self.release()
        predicate = self.query_filter(release, species, organisation_id, status, q, centre_id)
        cursor = self.db.observations.find(predicate, OBS).sort([('snapshot_date', -1), ('name', 1), ('_id', 1)])
        offset = (page - 1) * page_size
        if age_key or q.strip():
            docs = list(cursor)
            refs = self.references(docs)
            if age_key:
                docs = [obs for obs in docs if age_value(obs, refs[0][obs['listing_id']])[0] == age_key]
            if q.strip():
                term = q.strip().casefold()
                docs.sort(key=lambda obs: (obs.get('name') or '').strip().casefold() != term)
            total = len(docs)
            docs = docs[offset:offset + page_size]
        else:
            total = self.db.observations.count_documents(predicate)
            docs = list(cursor.skip(offset).limit(page_size))
            refs = self.references(docs)
        organisations = self.organisation_options(release)
        photos = self.photo_map([row['_id'] for row in docs])
        return dict(items=[self.card(obs, refs, photos[obs['_id']]) for obs in docs], total=total, page=page, page_size=page_size,
                    organisations=organisations, release_date=release['catalogue_as_of'])

    def organisation_options(self, release):
        org_ids = self.db.observations.distinct('organisation_id', self.query_filter(release, status='all'))
        return [dict(id=row['_id'], name=row['name']) for row in self.db.organisations.find({'_id': {'$in': org_ids}}).sort('name', 1)]

    def detail(self, listing_id):
        history = list(self.db.observations.find({'listing_id': listing_id}).sort([('snapshot_date', 1), ('_id', 1)]))
        if not history:
            return None
        latest = history[-1]
        refs = self.references([latest])
        photos = self.photo_map([row['_id'] for row in history])
        result = self.card(latest, refs, photos[latest['_id']])
        captions = []
        for obs in history:
            media = photos[obs['_id']]
            captions.append(dict(date=obs['snapshot_date'], date_label=date_label(obs.get('observed_at_raw'), obs['snapshot_date']),
                                 status_label=STATUS_LABELS[obs['adoption_status']], status_raw=obs.get('status_raw'),
                                 source_url=http_url(obs.get('source_url')), listing_url=http_url(obs.get('listing_url')),
                                 photo_count=len(media), photos=self.photos(media),
                                 source_photos=[dict(source_url=http_url(row['source_photo_url']), sha256=row.get('sha256'))
                                                for row in media if http_url(row.get('source_photo_url'))]))
        male_female = {'male': '雄性', 'female': '雌性'}
        org = refs[1][latest['organisation_id']]
        contacts = org.get('public_contacts', [])
        contact = next((http_url(row.get('source_url')) for row in contacts
                        if row.get('source_type', '').startswith('機構') and http_url(row.get('source_url'))), None)
        member_ids = self.db.listing_members.distinct('animal_id', {'listing_id': listing_id})
        members = [row['name'] for row in self.db.animals.find({'_id': {'$in': member_ids}}).sort('name', 1)]
        adoption = latest.get('adopted_at') or {}
        centre_evidence = latest.get('centre_evidence') or {}
        decision = refs[0][listing_id].get('identity_review', {}).get('resolution')
        note = '官網只提供這次可核對的觀察。' if len(history) == 1 else '兩次觀察對應同一則已比對的官網刊登。'
        if decision in {'pending', 'conflict', 'source_key_collision'}:
            note = '來源身份仍有待核對的欄位，時間線只顯示已連到此檔案的觀察。'
        result.update(sex=male_female.get(latest.get('sex')), centre=result['centre_name'],
                      contact_url=contact or http_url(org.get('website_url')),
                      centre_evidence_url=http_url(centre_evidence.get('location_reference_url')),
                      official_action_url=result['source_url'] if result['status'] in {'listed', 'foster_option'} else None,
                      photos=self.photos(photos[latest['_id']]), listing_url=http_url(latest.get('listing_url')),
                      history=captions, animal_names=members, adopted_date_label=adoption.get('raw'), identity_note=note)
        return result

    @lru_cache(maxsize=4)
    def geography(self, filename):
        file = self.data_dir / filename
        return json.loads(file.read_text(encoding='utf-8')) if file.is_file() else None

    def timeline(self):
        rows = list(self.db.metrics.find({'publisher_id': 'hkscda', 'metric_code': 'adoptions', 'species': {'$in': SPECIES}})
                    .sort([('period_label', 1), ('species', 1)]))
        values = {}
        for row in rows:
            month = row['period_label']
            entry = values.setdefault(month, dict(period=month, cat=None, dog=None, source_url=http_url(row['source_url'])))
            entry[row['species']] = row['value']
        if not values:
            return [], None
        start, stop = min(values), max(values)
        low = date.fromisoformat(start + '-01')
        high = date.fromisoformat(stop + '-01')
        series = []
        for year in range(low.year, high.year + 1):
            for month in range(low.month if year == low.year else 1, (high.month if year == high.year else 12) + 1):
                key = f'{year:04d}-{month:02d}'
                series.append(values.get(key, dict(period=key, cat=None, dog=None, source_url=None)))
        return series, values[stop]['source_url']

    def dashboard(self, species, organisation_id):
        release = self.release()
        docs = list(self.db.observations.find(self.query_filter(release, species, organisation_id), OBS)
                    .sort([('snapshot_date', -1), ('name', 1), ('_id', 1)]))
        refs = self.references(docs)
        ages, placement, by_organisation, groups = Counter(), Counter(), Counter(), Counter()
        sample = []
        for obs in docs:
            card = self.card(obs, refs)
            ages[card['age_key']] += 1
            placement[card['centre_id']] += 1
            by_organisation[card['organisation_id']] += 1
            key = (card['age_key'], card['centre_id'])
            if groups[key] < 3:
                sample.append(card)
                groups[key] += 1
        dimensions = self.geography('centre_coordinates.json') or {}
        centres = []
        all_orgs = {row['_id']: row['name'] for row in self.db.organisations.find({}, {'name': 1})}
        centre_filter = {'organisation_id': organisation_id} if organisation_id else {}
        for centre in self.db.centres.find(centre_filter).sort('name', 1):
            coord = dimensions.get(centre['_id'], {})
            centres.append(dict(id=centre['_id'], name=centre['name'], short_name=coord.get('short_name') or centre['name'],
                                district=coord.get('district_name'), organisation=all_orgs[centre['organisation_id']],
                                organisation_id=centre['organisation_id'], address=centre['public_address'],
                                longitude=coord.get('longitude'), latitude=coord.get('latitude'), count=placement[centre['_id']],
                                organisation_listing_count=by_organisation[centre['organisation_id']],
                                source_url=http_url(centre['source_url']), photo_url=http_url(coord.get('photo_url')),
                                coordinate_source_url=http_url(coord.get('map_source_url') or coord.get('source_url'))))
        mapped = [centre for centre in centres if centre['longitude'] is not None and centre['latitude'] is not None]
        plotted = sum(centre['count'] for centre in mapped)
        map_coverage = dict(plotted_listings=plotted, mapped_organisations=len({centre['organisation_id'] for centre in mapped}),
                            mapped_centres=len(mapped),
                            map_points=len({(centre['longitude'], centre['latitude']) for centre in mapped}))
        timeline, series_source = self.timeline()
        return dict(total=len(docs), unknown_centre=placement[None], centre_unavailable_count=len(docs) - placement[None] - plotted,
                    map_coverage=map_coverage,
                    release_date=release['catalogue_as_of'], older_count=sum(row['snapshot_date'] < release['catalogue_as_of'] for row in docs),
                    centres=centres, districts_geojson=self.geography('districts.geojson'), districts_source_url=DISTRICT_SOURCE,
                    ages=[dict(key=code, label=label, count=ages[code]) for code, label in AGE_LABELS.items()],
                    timeline=timeline, timeline_source_url=series_source, timeline_source_label='香港拯救貓狗協會每月領養報告',
                    listings=sample, organisations=self.organisation_options(release))

    def overview(self):
        release = self.release()
        counts = {species: self.db.observations.count_documents(self.query_filter(release, species=species)) for species in SPECIES}
        overview = dict(release_date=release['catalogue_as_of'], counts=counts, total_listed=sum(counts.values()),
                        organisation_count=len(self.organisation_options(release)), centre_count=self.db.centres.count_documents({}),
                        hero_waiting=None, featured=None)
        # Archive-free installs can still explore the catalogue without a featured photo.
        if any((self.archive_root / pack / 'photos').is_dir() for pack in PHOTO_PACKS):
            predicate = self.query_filter(release)
            predicate['name'] = {'$type': 'string', '$nin': ['', '名稱未公佈']}
            order = [('snapshot_date', -1), ('species', -1), ('name', 1), ('_id', 1)]
            with self.db.observations.find(predicate, OBS).sort(order) as cursor:
                while batch := list(islice(cursor, 24)):
                    photos = self.photo_map([row['_id'] for row in batch])
                    candidate = next((row for row in batch if self.photos(photos[row['_id']], 1)), None)
                    if candidate:
                        overview['hero_waiting'] = self.card(candidate, self.references([candidate]), photos[candidate['_id']])
                        break
        case = self.detail(HERO_LISTING)
        if case:
            overview['featured'] = {key: case[key] for key in ('id', 'name', 'species', 'photo_url', 'organisation', 'status_label', 'snapshot_date')}
            overview['featured']['observations'] = [dict(date=row['date'], status_label=row['status_label']) for row in case['history']]
        return overview
