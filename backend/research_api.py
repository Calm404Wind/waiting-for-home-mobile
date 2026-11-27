import re
from collections import Counter, defaultdict
from datetime import date
from statistics import median
from typing import Annotated, Literal

from fastapi import APIRouter, Query

from .catalog import HERO_LISTING, STATUS_LABELS, age_value
from .waiting import waiting_fields


BREED_LABELS = {'mixed': '官網標註混種', 'pure': '官網明示純種', 'unknown': '官網未明示品種類別'}
OPEN_STATUSES = {'listed', 'trial', 'fostered', 'foster_option'}
WORKING_STATUSES = OPEN_STATUSES | {'adopted', 'memorial', 'long_term', 'in_care'}
DOCUMENTED_IDENTITY = {'verified', 'source_supported'}


def breed_group(raw):
    value = str(raw or '').casefold()
    if re.search(r'混種|混种|混血|唐狗|雜種|杂种|\b(?:mixed|mix|crossbreed|mongrel)\b|\b(?:x|cross)\b', value):
        return 'mixed'
    if re.search(r'純種|纯种|\bpure[ -]?bred\b', value):
        return 'pure'
    return 'unknown'


def source_day(value):
    if isinstance(value, dict) and value.get('precision') == 'day' and value.get('from') == value.get('to'):
        try:
            return date.fromisoformat(value['from'])
        except (TypeError, ValueError):
            return None
    return None


def breed_waits(catalogue, release, species, organisation_id):
    predicate = catalogue.query_filter(release, species=species, organisation_id=organisation_id)
    rows = list(catalogue.db.observations.find(predicate, {'source_evidence': 0}))
    candidates = []
    missing_start = 0
    for obs in rows:
        evidence = waiting_fields(obs)
        if evidence['wait_days'] is None:
            missing_start += 1
        else:
            candidates.append((obs, evidence))
    groups = defaultdict(list)
    points = []
    if candidates:
        sample, _ = zip(*candidates)
        refs = catalogue.references(sample)
        media = catalogue.photo_map([row['_id'] for row in sample])
        history = defaultdict(list)
        for entry in catalogue.db.observations.find({'listing_id': {'$in': [row['listing_id'] for row in sample]}, 'visibility': 'seen'},
                    {'listing_id': 1, 'snapshot_date': 1, 'adoption_status': 1}).sort([('snapshot_date', 1), ('_id', 1)]):
            history[entry['listing_id']].append(dict(date=entry['snapshot_date'], status_label=STATUS_LABELS[entry['adoption_status']]))
        for obs, evidence in candidates:
            band, label = age_value(obs, refs[0][obs['listing_id']])
            if band not in {'young', 'adult', 'senior'}:
                continue
            group = breed_group(obs.get('breed_raw'))
            groups[group].append(evidence['wait_days'])
            estimate = obs.get('age_range_years') or {}
            birth = source_day(obs.get('birth_date_evidence'))
            age = None
            if birth:
                age = (date.fromisoformat(obs['snapshot_date']) - birth).days / 365.2425
            elif estimate.get('min') is not None and estimate.get('min') == estimate.get('max'):
                age = estimate['min']
            card = catalogue.card(obs, refs, media[obs['_id']])
            points.append({**card, **evidence, 'observations': history[card['id']], 'age_band': band, 'age_label': label,
                           'age_years': round(age, 2) if age is not None and age >= 0 else None,
                           'breed_group': group, 'is_outlier': False})
    points.sort(key=lambda point: (-point['wait_days'], point['id']))
    top_n = min(len(points), 2 if len(points) < 6 else 3 if len(points) < 16 else 5)
    for point in points[:top_n]:
        point['is_outlier'] = True
    story = None
    if species in {'', 'cat'} and organisation_id in {'', 'kirstens_zoo'}:
        detail = catalogue.detail(HERO_LISTING)
        if detail:
            story = dict(id=detail['id'], name=detail['name'], photo_url=detail['photo_url'],
                         observations=[dict(date=row['date'], status_label=row['status_label']) for row in detail['history']])
    return dict(reference_date=release['catalogue_as_of'], valid_count=len(points), missing_start=missing_start,
                missing_age=len(candidates) - len(points), official_date_count=len(candidates), outlier_count=top_n,
                groups=[dict(key=key, label=BREED_LABELS[key], value=median(values), count=len(values))
                        for key, values in groups.items()], points=points, fallback_story=story,
                statistic_label='等待天數中位數')


def snapshot_flow(catalogue, species, organisation_id):
    all_snapshots = sorted(catalogue.db.releases.distinct('catalogue_as_of'))
    basis = '同一官網刊登經跨批次核對後的狀態對照，包含狀態維持不變的檔案。以首次的領養／暫養中名錄作起點，官網未明示品種類別獨立列出。'
    choices = [dict(id=key, label=label) for key, label in BREED_LABELS.items()]
    if len(all_snapshots) < 2:
        return dict(basis=basis, nodes=[], links=[], breed_options=choices, excluded_count=0, included_count=0)
    first, last = all_snapshots[-2:]
    criteria = {'snapshot_date': {'$in': [first, last]}, 'visibility': 'seen',
                'species': species or {'$in': ['cat', 'dog']}}
    if organisation_id:
        criteria['organisation_id'] = organisation_id
    sources = defaultdict(dict)
    start_ids = set()
    for obs in catalogue.db.observations.find(criteria, {'listing_id': 1, 'snapshot_date': 1, 'adoption_status': 1,
            'breed_raw': 1, 'source_url': 1, 'identity_confidence': 1}):
        ident = obs['listing_id']
        if obs['snapshot_date'] == first and obs['adoption_status'] in OPEN_STATUSES:
            start_ids.add(ident)
        if obs.get('identity_confidence') in DOCUMENTED_IDENTITY and obs.get('source_url'):
            sources[ident][obs['snapshot_date']] = obs

    paths = Counter()
    for ident in start_ids:
        if first not in sources[ident] or last not in sources[ident]:
            continue
        start, end = sources[ident][first], sources[ident][last]
        if end['adoption_status'] not in WORKING_STATUSES:
            continue
        paths[(start['adoption_status'], breed_group(end.get('breed_raw') or start.get('breed_raw')), end['adoption_status'])] += 1

    nodes = {}
    links = Counter()
    for (start, breed, end), amount in sorted(paths.items()):
        ids = (f'first:{start}', f'breed:{breed}', f'last:{end}')
        for ident, column, label in zip(ids, (0, 1, 2), (STATUS_LABELS[start], BREED_LABELS[breed], STATUS_LABELS[end]), strict=True):
            nodes.setdefault(ident, dict(id=ident, column=column, label=label, breed_group=breed if column == 1 else None))
        links[(ids[0], ids[1], breed)] += amount
        links[(ids[1], ids[2], breed)] += amount
    included = sum(paths.values())
    return dict(basis=basis, observed_range=f'{first} → {last}', included_count=included, excluded_count=len(start_ids) - included,
                nodes=list(nodes.values()), breed_options=choices,
                links=[dict(source=source, target=target, breed_group=breed, value=value)
                       for (source, target, breed), value in links.items()])


def router(catalogue):
    api = APIRouter()

    @api.get('/api/research')
    def research(species: Literal['', 'cat', 'dog'] = '', organisation_id: Annotated[str, Query(max_length=80)] = ''):
        release = catalogue.release()
        return dict(waiting=breed_waits(catalogue, release, species, organisation_id),
                    flow=snapshot_flow(catalogue, species, organisation_id))

    return api
