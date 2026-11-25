import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo.errors import PyMongoError
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .accounts_api import router as accounts_router
from .catalog import MEDIA, Catalogue
from .research_api import router as research_router


BACKEND = Path(__file__).resolve().parent
ROOT = BACKEND.parent
STATIC = ROOT / 'static'
catalogue = Catalogue(
    os.environ.get('ADOPTION_MONGO_URI', 'mongodb://127.0.0.1:27017'),
    os.environ.get('ADOPTION_DB_NAME', 'waiting_for_home_20261123'),
    Path(os.environ.get('ADOPTION_ARCHIVE_ROOT', str(ROOT / 'archive'))).expanduser(),
    BACKEND / 'data',
)
Species = Literal['', 'cat', 'dog']
BrowseStatus = Literal['listed', 'adopted', 'all']


@asynccontextmanager
async def lifespan(_app):
    yield
    catalogue.client.close()


app = FastAPI(title='等一個家｜手機 Demo', lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(GZipMiddleware, minimum_size=1400)
allowed_hosts = os.environ.get('ADOPTION_ALLOWED_HOSTS', '127.0.0.1,localhost')
app.add_middleware(TrustedHostMiddleware, allowed_hosts=[host.strip() for host in allowed_hosts.split(',') if host.strip()])
app.mount('/static', StaticFiles(directory=STATIC), name='static')
app.include_router(accounts_router(catalogue))
app.include_router(research_router(catalogue))


@app.middleware('http')
async def same_origin_writes(request, call_next):
    if request.method in {'POST', 'PUT', 'DELETE'}:
        origin = request.headers.get('origin')
        if origin and origin != f'{request.url.scheme}://{request.url.netloc}':
            return JSONResponse({'detail': '請在《等一個家》Demo 內操作。'}, status_code=403)
    response = await call_next(request)
    if request.url.path.startswith(('/api/account', '/api/auth')):
        response.headers['Cache-Control'] = 'no-store'
    return response


@app.exception_handler(PyMongoError)
async def database_error(_request: Request, _error: PyMongoError):
    return JSONResponse({'detail': '無法連接領養資料庫，請稍後再試。'}, status_code=503)


@app.exception_handler(LookupError)
async def release_error(_request: Request, _error: LookupError):
    return JSONResponse({'detail': '找不到已匯入的領養資料版本。'}, status_code=503)


@app.get('/')
def index():
    return FileResponse(STATIC / 'index.html', headers={'Cache-Control': 'no-cache'})


@app.get('/manifest.webmanifest')
def manifest():
    return FileResponse(STATIC / 'manifest.webmanifest', media_type='application/manifest+json')


@app.get('/sw.js')
def worker():
    return FileResponse(STATIC / 'sw.js', media_type='text/javascript', headers={'Cache-Control': 'no-cache'})


@app.get('/api/health')
def health():
    release = catalogue.release()
    return {'ok': True, 'source': 'mongodb', 'release_date': release['catalogue_as_of']}


@app.get('/api/overview')
def overview():
    return catalogue.overview()


@app.get('/api/maps-config')
def maps_config():
    return {'apiKey': os.environ.get('ADOPTION_GOOGLE_MAPS_BROWSER_KEY', '')}


@app.get('/api/listings')
def listings(species: Species = '', organisation_id: Annotated[str, Query(max_length=80)] = '',
             status: BrowseStatus = 'listed', q: Annotated[str, Query(max_length=100)] = '',
             page: Annotated[int, Query(ge=1, le=10000)] = 1, page_size: Annotated[int, Query(ge=1, le=60)] = 12,
             centre_id: Annotated[str, Query(max_length=100)] = '',
             age_key: Literal['', 'young', 'adult', 'senior', 'group', 'unknown'] = ''):
    return catalogue.items(species, organisation_id, status, q, page, page_size, centre_id, age_key)


@app.get('/api/listings/{listing_id}')
def listing(listing_id: str):
    result = catalogue.detail(listing_id)
    if result is None:
        raise HTTPException(404, '找不到這則動物檔案。')
    return result


@app.get('/api/dashboard')
def dashboard(species: Species = '', organisation_id: Annotated[str, Query(max_length=80)] = ''):
    return catalogue.dashboard(species, organisation_id)


@app.get('/media/{media_id}')
def media(media_id: str):
    doc = catalogue.db.media.find_one({'_id': media_id}, MEDIA)
    file = catalogue.media_path(doc)
    if file is None:
        raise HTTPException(404, '找不到可檢視的照片。')
    return FileResponse(file, headers={'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff'})
