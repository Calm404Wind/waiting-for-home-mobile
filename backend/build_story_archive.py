"""Build the edition-specific narrative index from the project's archived profiles.

Usage: python -m backend.build_story_archive PATH_TO_EDITION_FOLDERS
Run from the repository root. Inputs are the October and November scraper outputs
under hk_shelter_catalog_YYYY_MM_DD, plus the tracked MongoDB export.
"""
import argparse
import gzip
import json
import re
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

from .stories import STORY_FOOTER


# These collectors distinguish individual animals, or (LAP) per-animal anchors.
PROFILE_ORGS = {'spca', 'hkdr', 'lap', 'saa', 'love_cats', 'kirstens_zoo', 'hkscda', 'hkpaws', 'pgrs'}


def indexed_stories(folder, bundle):
    with ZipFile(bundle) as export:
        rows = [json.loads(line) for line in export.open('collections/observations.jsonl')]
    index = {}
    for day in sorted({row['snapshot_date'] for row in rows}):
        captured = {}
        edition = folder / ('hk_shelter_catalog_' + day.replace('-', '_'))
        if not edition.is_dir():
            raise FileNotFoundError(edition)
        for file in sorted(edition.glob('*/profiles.json')):
            for profile in json.loads(file.read_text(encoding='utf-8-sig')):
                org = str(profile.get('organisation_id', '')).lower()
                url = profile.get('source_url')
                name = (profile.get('name') or '').strip()
                if org not in PROFILE_ORGS or not url or not name:
                    continue
                raw = profile.get('description_raw') or profile.get('description') or ''
                if not isinstance(raw, str):
                    continue
                raw = STORY_FOOTER.split(raw, 1)[0].strip()
                if org == 'kirstens_zoo':
                    raw = raw.removeprefix(name).strip()
                raw = re.sub(r'^Background Story\b\s*', '', raw, flags=re.I)
                parts = [' '.join(p.split()) for p in raw.splitlines()]
                parts = [p for p in dict.fromkeys(parts) if len(p) >= 5 and not re.match(r'^(?:https?://\S+|Powered by .+)$', p, re.I)]
                if parts:
                    captured[org, url, name.casefold()] = parts
        for row in rows:
            if row['snapshot_date'] != day or row.get('visibility') != 'seen':
                continue
            url = row.get('source_url')
            parts = captured.get((row['organisation_id'], url, (row.get('name') or '').strip().casefold()))
            if parts:
                index[row['_id']] = [day, url, parts]
    return index


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path)
    opts = parser.parse_args()
    data = indexed_stories(opts.folder, Path('data/catalogue.mongodb.zip'))
    if not data:
        raise SystemExit('No observation-matched profiles found')
    encoded = json.dumps(data, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode()
    with (Path(__file__).parent / 'data' / 'stories.json.gz').open('wb') as handle:
        with gzip.GzipFile(fileobj=handle, mode='wb', mtime=0, filename='') as out:
            out.write(encoded)
    print(dict(Counter(row[0] for row in data.values())))
