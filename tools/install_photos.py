"""Restore the original catalogue photo paths from downloaded Release packs."""

import argparse
import hashlib
import json
import re
import shutil
import tempfile
import zlib
from pathlib import Path, PurePosixPath
from zipfile import ZipFile


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOTS = {'hk_shelter_catalog_2026-10-20', 'hk_shelter_catalog_2026-11-23'}
IMAGE_TYPES = {'.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'}
CHUNK_SIZE = 1024 * 1024


def sha256(path):
    with path.open('rb') as handle:
        return hashlib.file_digest(handle, 'sha256').hexdigest()


def crc32(path):
    checksum = 0
    with path.open('rb') as handle:
        while chunk := handle.read(CHUNK_SIZE):
            checksum = zlib.crc32(chunk, checksum)
    return checksum


def restored_path(root, name):
    relative = PurePosixPath(name)
    parts = relative.parts
    if (relative.as_posix() != name or len(parts) < 3 or parts[0] not in SNAPSHOTS or parts[1] != 'photos'
            or '..' in parts or '\\' in name or ':' in name or relative.suffix.lower() not in IMAGE_TYPES):
        raise ValueError(f'Invalid photo path in release: {name}')
    path = root.joinpath(*parts)
    if not path.resolve().is_relative_to(root):
        raise ValueError(f'Photo path points outside the archive directory: {name}')
    return path


def verify_assets(assets_dir, root, manifest):
    files = set()
    archives = []
    for asset in manifest['assets']:
        name = asset['name']
        if not re.fullmatch(r'photos-\d{2}\.zip', name):
            raise ValueError(f'Invalid release asset name: {name}')
        path = assets_dir / name
        if not path.is_file():
            raise FileNotFoundError(f'Download {name} into {assets_dir}')
        if path.stat().st_size != asset['bytes'] or sha256(path) != asset['sha256']:
            raise ValueError(f'{name} failed its size or SHA-256 check')
        with ZipFile(path) as archive:
            entries = archive.infolist()
            if len(entries) != asset['photos']:
                raise ValueError(f'{name} has an unexpected number of files')
            for entry in entries:
                restored_path(root, entry.filename)
                if entry.filename in files:
                    raise ValueError(f'Photo appears in two ZIP entries: {entry.filename}')
                files.add(entry.filename)
        archives.append(path)
    if len(files) != manifest['unique_photo_payloads'] or len(files) + len(manifest['aliases']) != manifest['restored_paths']:
        raise ValueError('Unexpected photo count in release')
    for alias, original in manifest['aliases'].items():
        restored_path(root, alias)
        if alias in files or original not in files:
            raise ValueError(f'Invalid equivalent photo path: {alias}')
    return archives


def copy_file(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as temporary:
        temporary_path = Path(temporary.name)
        try:
            shutil.copyfileobj(source, temporary, length=CHUNK_SIZE)
        except BaseException:
            temporary.close()
            temporary_path.unlink(missing_ok=True)
            raise
    try:
        temporary_path.replace(destination)
    finally:
        temporary_path.unlink(missing_ok=True)


def extract_archives(root, archives):
    for path in archives:
        with ZipFile(path) as archive:
            for entry in archive.infolist():
                destination = restored_path(root, entry.filename)
                if destination.is_file():
                    if destination.stat().st_size != entry.file_size or crc32(destination) != entry.CRC:
                        raise FileExistsError(f'Existing photo does not match the pack: {destination}')
                    continue
                with archive.open(entry) as source:
                    copy_file(source, destination)
        print(f'Restored {path.name}', flush=True)


def restore_aliases(root, aliases):
    for alias, original in aliases.items():
        destination = restored_path(root, alias)
        source = restored_path(root, original)
        if destination.is_file():
            if not destination.samefile(source) and sha256(destination) != sha256(source):
                raise FileExistsError(f'Existing photo does not match the pack: {destination}')
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            destination.hardlink_to(source)
        except OSError:
            with source.open('rb') as handle:
                copy_file(handle, destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assets-dir', type=Path, default=PROJECT_ROOT / 'photo-packs',
                        help='directory containing the downloaded photos-*.zip files')
    parser.add_argument('--archive-dir', type=Path, default=PROJECT_ROOT / 'archive',
                        help='directory to restore (set ADOPTION_ARCHIVE_ROOT to match if customised)')
    parser.add_argument('--verify-only', action='store_true', help='verify the packs without restoring photos')
    args = parser.parse_args()
    manifest = json.loads((PROJECT_ROOT / 'data' / 'photos-manifest.json').read_text('utf-8'))
    if manifest['manifest_version'] != 1:
        parser.error('Unsupported photo manifest')
    root = args.archive_dir.resolve()
    try:
        archives = verify_assets(args.assets_dir, root, manifest)
        if not args.verify_only:
            extract_archives(root, archives)
            restore_aliases(root, manifest['aliases'])
    except (OSError, ValueError) as err:
        parser.exit(1, f'{err}\n')
    verb = 'Verified' if args.verify_only else 'Restored'
    print(f'{verb} {manifest["restored_paths"]:,} original photo paths across {len(archives)} packs.')


if __name__ == '__main__':
    main()
