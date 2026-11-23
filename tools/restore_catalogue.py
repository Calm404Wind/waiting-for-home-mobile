import argparse
import os
from pathlib import Path
from zipfile import ZipFile

from bson import json_util
from pymongo import MongoClient

from mongo_support import DATABASE, INDEXES, PLAN, write_database


DEFAULT_BACKUP = Path(__file__).resolve().parents[1] / 'data' / 'catalogue.mongodb.zip'


def main():
    parser = argparse.ArgumentParser(description='Restore the October and November adoption catalogue with its indexes.')
    parser.add_argument('backup', nargs='?', type=Path, default=DEFAULT_BACKUP)
    parser.add_argument('--database', default=os.environ.get('ADOPTION_DB_NAME', DATABASE),
                        help='Dedicated database name beginning waiting_for_home_')
    parser.add_argument('--uri', default=os.environ.get('ADOPTION_MONGO_URI', 'mongodb://127.0.0.1:27017'))
    args = parser.parse_args()
    with ZipFile(args.backup) as archive:
        manifest = json_util.loads(archive.read('manifest.json').decode('utf-8'))
        if (manifest['import_plan'] != PLAN or manifest['format'] != 'extended_jsonl'
                or set(manifest['counts']) != set(INDEXES)):
            raise ValueError('Unrecognised adoption backup schema')
        docs = {name: [json_util.loads(line.decode('utf-8')) for line in archive.open(f'collections/{name}.jsonl')]
                for name in INDEXES}
    if any(len(rows) != manifest['counts'][name] or len(rows) != len({row['_id'] for row in rows}) for name, rows in docs.items()):
        raise ValueError('Unexpected row count or duplicate document IDs')
    with MongoClient(args.uri, serverSelectionTimeoutMS=3000) as client:
        write_database(client[args.database], docs, INDEXES)
    print(json_util.dumps({'database': args.database, 'counts': manifest['counts']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
