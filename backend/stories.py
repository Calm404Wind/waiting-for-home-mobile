import gzip
import json
import re
from datetime import date
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlsplit


UNKNOWN = {'', '未知', '未提供', '不詳', '未說明', 'n/a', 'none', 'null', '-', '/', '--'}
BOILERPLATE = re.compile(r'^(?:this website is designed by|all rights reserved|copyright|powered by)', re.I)
STORY_FOOTER = re.compile(r'Unable to adopt\?|Did you know you can help a (?:cat|dog) through sponsorship|'
                          r'Please consider a one-time, monthly|最後更新日期[:：]|'
                          r'This website is designed by|Copyright\s+©|All Rights Reserved', re.I)
FACT_FIELDS = {'breed_raw': '品種', 'sex_raw': '性別', 'age_raw': '年齡', 'dob_raw': '出生日期',
               'size_raw': '體型', 'weight_raw': '體重', 'color_raw': '毛色', 'origin_raw': '來源',
               'location_raw': '位置', 'neutered_raw': '絕育', 'vaccinated_raw': '疫苗',
               'microchip_status_raw': '晶片', 'health_raw': '健康情況', 'requirements_raw': '領養條件'}


def clean(value):
    if not isinstance(value, str):
        return ''
    text = ' '.join(value.split()).strip()
    return '' if text.casefold() in UNKNOWN or BOILERPLATE.match(text) else text


@lru_cache(maxsize=1)
def archive():
    path = Path(__file__).parent / 'data' / 'stories.json.gz'
    if not path.is_file():
        return {}
    with gzip.open(path, 'rt', encoding='utf-8') as handle:
        return json.load(handle)


def source_paragraphs(obs):
    record = archive().get(obs['_id'])
    if record and record[:2] == [obs['snapshot_date'], obs.get('source_url')]:
        return record[2], 'archive'
    raw = obs.get('source_values_raw') or {}
    fields = raw.get('source_fields') or {}
    notes = [clean(fields.get(k)) for k in ('其他資訊', '特徵', '簡介', '備註', '其他資料', 'My Story')]
    if any(notes):
        return list(dict.fromkeys(n for n in notes if n)), 'fields'
    excerpt = clean(raw.get('description_excerpt'))
    # Some exported excerpts contain only a copy of the directory header/specs.
    if (obs.get('organisation_id') == 'sai_kung_stray_friends' and excerpt.lower().startswith('adopt me.')
            or obs.get('organisation_id') == 'hfhd' and re.search(r'(?:待領養Available|性別[：:].{0,5}(?:Male|Fem))', excerpt, re.I)
            or obs.get('organisation_id') == 'hkaac' and re.match(r'^(?:額外醫療開支|[CD][A-Z]*\d+\s*·)', excerpt, re.I)):
        excerpt = ''
    return ([excerpt] if excerpt else []), 'excerpt'


def snapshot_story(obs):
    raw = obs.get('source_values_raw') or {}
    lines, coverage = source_paragraphs(obs)
    facts, traits = [], []
    for key, label in FACT_FIELDS.items():
        value = clean(raw.get(key))
        if not value or value in lines:
            continue
        if value in {'True', 'False'}:
            value = '是' if value == 'True' else '否'
        facts.append(dict(label=label, value=value))
    personality = clean(raw.get('temperament_raw'))
    if personality:
        parts = re.split(r'\s*[、,，]\s*', personality)
        if all(1 <= len(p) <= 12 and not re.search(r'[。.：:，！？!?]', p) for p in parts):
            traits = list(dict.fromkeys(parts))
        elif personality not in lines and not any(personality in p for p in lines):
            facts.append(dict(label='性格', value=personality))
    fields = raw.get('source_fields') or {}
    extra = clean(fields.get('Special Condition'))
    if extra and not any(fact['value'] == extra for fact in facts):
        facts.append(dict(label='機構護理備註', value=extra))
    if obs.get('organisation_id') == 'pgrs':
        appointment = re.search(r'\bfirst appointment on (\d{4}-\d{2}-\d{2})\b', ' '.join(lines), re.I)
        if appointment:
            try:
                first_visit = date.fromisoformat(appointment[1])
            except ValueError:
                first_visit = None
            if first_visit:
                facts.append(dict(label='首次預約（官網記作 First appointment）', value=first_visit.isoformat()))
    # SPCA's 'About me' can contain only comma-separated traits, or start with them.
    if traits and lines:
        lines = [line.removeprefix(personality).strip() for line in lines]
    if obs['organisation_id'] == 'spca' and lines:
        first = lines[0]
        tag_list = re.match(r'^([\u4e00-\u9fff]{2,8}(?:,\s*[\u4e00-\u9fff]{2,8})+)(?:\s+|$)', first)
        if tag_list:
            traits = list(dict.fromkeys([*traits, *re.split(r',\s*', tag_list[1])]))
            lines = [first[tag_list.end():].strip(), *lines[1:]]
    lines = [line for line in lines if line]
    url = obs.get('source_url') or ''
    return dict(source='snapshot', coverage=coverage, source_url=url if urlsplit(url).scheme in {'http', 'https'} else None,
                snapshot_date=obs['snapshot_date'], paragraphs=lines, facts=facts, traits=traits, has_narrative=bool(lines))
