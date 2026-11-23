from datetime import datetime, timezone

from bson import json_util
from pymongo import UpdateOne


DATABASE = 'waiting_for_home_20261123'
PLAN = 'jour4046_two_catalogue_snapshots_v1'

# Keys keep references queryable while allowing shared history URLs and source record codes.
INDEXES = {
    'organisations': [dict(keys=[['name', 1]], name='by_name')],
    'centres': [dict(keys=[['organisation_id', 1], ['name', 1]], name='by_organisation')],
    'listings': [dict(keys=[['organisation_id', 1], ['source_namespace', 1], ['source_key', 1]], name='unique_resolved_source_key', unique=True),
                 dict(keys=[['legacy_record_ids', 1]], name='by_legacy_id')],
    'animals': [dict(keys=[['species', 1], ['name', 1]], name='by_species_name')],
    'listing_members': [dict(keys=[['listing_id', 1], ['animal_id', 1]], name='unique_membership', unique=True),
                        dict(keys=[['animal_id', 1]], name='by_animal')],
    'runs': [dict(keys=[['snapshot_date', 1], ['organisation_id', 1]], name='by_snapshot_org')],
    'observations': [dict(keys=[['listing_id', 1], ['run_id', 1]], name='unique_listing_run', unique=True),
                     dict(keys=[['run_id', 1], ['adoption_status', 1], ['species', 1]], name='by_run_status_species'),
                     dict(keys=[['legacy_record_id', 1], ['snapshot_date', 1]], name='by_legacy_snapshot')],
    'media': [dict(keys=[['observation_id', 1], ['source_photo_url', 1], ['role', 1]], name='unique_observed_photo', unique=True,
                   partialFilterExpression={'observation_id': {'$type': 'string'}}),
              dict(keys=[['centre_id', 1], ['source_photo_url', 1], ['role', 1]], name='unique_centre_photo', unique=True,
                   partialFilterExpression={'centre_id': {'$type': 'string'}}),
              dict(keys=[['observation_id', 1], ['photo_order', 1]], name='by_observation_order'),
              dict(keys=[['sha256', 1]], name='by_photo_checksum')],
    'metrics': [dict(keys=[['publisher_id', 1], ['metric_code', 1], ['period_label', 1], ['species', 1]], name='by_time_series')],
    'releases': [],
}


def comparable(value):
    if isinstance(value, datetime):
        aware = value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return aware.replace(microsecond=aware.microsecond // 1000 * 1000)
    if isinstance(value, dict):
        return {key: comparable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [comparable(item) for item in value]
    return value


def write_database(db, docs, indexes):
    if not db.name.startswith('waiting_for_home_'):
        raise ValueError('Choose a dedicated waiting_for_home_ database name for this import.')
    existing = set(db.list_collection_names())
    unknown = existing - set(docs)
    if unknown:
        raise RuntimeError(f'Unexpected collections in target database: {sorted(unknown)}')

    # A retry can fill missing documents, but pauses if an existing record has been edited.
    for collection in existing:
        expected = {doc['_id']: comparable(doc) for doc in docs[collection]}
        for saved in db[collection].find():
            if saved['_id'] not in expected or comparable(saved) != expected[saved['_id']]:
                raise RuntimeError(f'Existing document differs, choose a new database: {collection}/{saved["_id"]}')

    for collection, records in docs.items():
        target = db[collection]
        for index in indexes.get(collection, []):
            settings = {key: value for key, value in index.items() if key != 'keys'}
            target.create_index([tuple(key) for key in index['keys']], **settings)
        if not records and collection not in db.list_collection_names():
            db.create_collection(collection)
        for offset in range(0, len(records), 500):
            batch = records[offset:offset + 500]
            target.bulk_write([UpdateOne({'_id': doc['_id']}, {'$setOnInsert': doc}, upsert=True) for doc in batch], ordered=False)
        if target.count_documents({}) != len(records):
            raise RuntimeError(f'Unexpected document count: {collection}')


def ejson(value):
    return json_util.dumps(value, ensure_ascii=False, separators=(',', ':'))
