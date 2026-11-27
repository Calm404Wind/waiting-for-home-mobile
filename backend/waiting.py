import calendar
import re
from datetime import date

from .stories import source_paragraphs


EN_MONTHS = {name.lower(): i for i in range(1, 13) for name in (calendar.month_name[i], calendar.month_abbr[i])}
MONTH = '(?:' + '|'.join(EN_MONTHS) + ')'
STAMP = re.compile(r'\b(?P<en_month>' + MONTH + r')\s+(?:(?P<en_day>\d{1,2})(?:st|nd|rd|th)?[,]?\s+)?(?P<en_year>20\d{2})\b'
                   r'|\b(?P<uk_day>\d{1,2})(?:st|nd|rd|th)?\s+(?P<uk_month>' + MONTH + r')\s+(?P<uk_year>20\d{2})\b'
                   r'|(?<!\d)(?P<year>20\d{2})(?:\s*年\s*|[-/])(?P<month>\d{1,2})(?:\s*月(?:\s*(?P<cday>\d{1,2})\s*[日號号])?|[-/](?P<iday>\d{1,2})(?!\d))', re.I)
EN_EVENT = re.compile(r'\b(?P<rescue>rescu(?:ed|e))\b|\b(?P<arrive>arrived|admitted|taken in|came (?:to|into) (?:our care|HKDR|the shelter))\b', re.I)
ZH_EVENT = re.compile(r'(?P<rescue>救起|拯救(?:咗|了|返)?|救我|救咗我|救回|救返|獲救|營救)|'
                      r'(?P<arrive>收容|收留|帶(?:我哋?|牠們?|佢哋?|我們)?(?:返|嚟|到|回)愛協|來到(?:愛協|SAA))')
UNRELATED = re.compile(r'\b(?:first appointment|born|birthday|adopted|foster|updated|vaccinat\w*)\b|'
                       r'出生|生日|出世|最後更新|更新日期|首次求診|首次就診|開始暫養|成功領養', re.I)


def iso(value):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def bounds(match):
    data = match.groupdict()
    if data['year']:
        year, month = int(data['year']), int(data['month'])
        day = data['cday'] or data['iday']
    else:
        year = int(data['en_year'] or data['uk_year'])
        month = EN_MONTHS[(data['en_month'] or data['uk_month']).lower()]
        day = data['en_day'] or data['uk_day']
    try:
        first = date(year, month, int(day) if day else 1)
        last = first if day else first.replace(day=calendar.monthrange(year, month)[1])
        return first, last
    except ValueError:
        return None


def dated_event(sentence, stamp):
    left = sentence[:stamp.start()]
    right = sentence[stamp.end():]
    # A dated appointment followed by an undated rescue is common in PGRS.
    # A bilingual biography can also discuss DOB, fostering or later adoption.
    if UNRELATED.search(left.rsplit(',', 1)[-1].rsplit('，', 1)[-1][-35:]) or UNRELATED.search(right[:22].split(',')[0].split('，')[0]):
        return None
    english = list(EN_EVENT.finditer(left))
    if english and re.fullmatch(r'\s*(?:(?:in|on|at|around|early|late|mid)\s+|in\s+[a-z -]{1,32}\s+(?:in|on)\s+)?',
                                left[english[-1].end():], re.I):
        return '官網記載的救援日期' if english[-1]['rescue'] else '官網記載的到達日期'
    chinese = ZH_EVENT.search(right[:95])
    if chinese and not UNRELATED.search(right[:chinese.start()]):
        return '官網記載的救援日期' if chinese['rescue'] else '官網記載的收容日期'
    if re.search(r'(?:獲救|拯救|收容|入所)(?:日期|時間)?[：:\s於在]*$', left):
        return '官網記載的救援／收容日期'
    return None


def source_event(obs):
    for key, label in (('eligible_at', '官網記載的開放領養日期'), ('intake_at', '官網記載的收容日期')):
        value = obs.get(key) or {}
        lo, hi = iso(value.get('from')), iso(value.get('to'))
        if lo and hi and lo <= hi and (lo == hi or (value.get('precision') == 'month' and lo.day == 1
                                     and hi == lo.replace(day=calendar.monthrange(lo.year, lo.month)[1]))):
            yield lo, hi, label, value.get('raw') or lo.isoformat()
    raw = obs.get('source_values_raw') or {}
    parts, _ = source_paragraphs(obs)
    if not parts or parts[-1].endswith(('…', '...')):
        parts = [*parts, raw.get('origin_raw'), raw.get('health_raw')]
    for part in filter(None, parts):
        for sentence in re.split(r'[。！？!?;；\n]+|(?<=\.)\s+', part):
            stamps = list(STAMP.finditer(sentence))
            for n, stamp in enumerate(stamps):
                # Only the local clause around this date may identify its event.
                left = stamps[n - 1].end() if n else 0
                right = stamps[n + 1].start() if n + 1 < len(stamps) else len(sentence)
                scope = sentence[left:right]
                label = dated_event(scope, STAMP.search(scope))
                dates = bounds(stamp)
                if dates and label:
                    yield *dates, label, scope.strip()


def waiting_fields(obs):
    snapshot = iso(obs.get('snapshot_date'))
    empty = dict(reference_date=obs.get('snapshot_date'), intake_date=None, intake_precision=None, intake_basis=None,
                 intake_evidence=None, wait_days=None, wait_days_min=None, wait_days_max=None)
    if not snapshot:
        return empty
    birth = iso((obs.get('birth_date_evidence') or {}).get('from'))
    for lo, hi, label, wording in source_event(obs):
        if lo > snapshot or (birth and hi < birth):
            continue
        precision = 'day' if lo == hi else 'month'
        # For a partial month only plausible days up to the observation are possible.
        minimum = (snapshot - min(hi, snapshot)).days
        maximum = (snapshot - max(lo, birth or lo)).days
        return dict(reference_date=snapshot.isoformat(), intake_date=lo.isoformat() if precision == 'day' else lo.strftime('%Y-%m'),
                    intake_precision=precision, intake_basis=label, intake_evidence=wording,
                    wait_days=(minimum + maximum) // 2, wait_days_min=minimum, wait_days_max=maximum)
    return empty
