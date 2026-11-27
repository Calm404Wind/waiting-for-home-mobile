"""Optional refresh of an individual biography on its original publisher's website."""
import re
from datetime import datetime, timezone
from functools import lru_cache
from html.parser import HTMLParser
from http.client import HTTPException
from time import monotonic, time
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from .stories import STORY_FOOTER


PROFILE_URLS = {
    'hkdr': r'https://hongkongdogrescue\.com/dogs/[^/?#]+/?',
    'spca': r'https://www\.spca\.org\.hk/zh-hant/what-we-do/animals-for-adoption-details/?\?code=\d+',
    'kirstens_zoo': r'https://kirstenszoo\.com/animals/[^/?#]+/?',
    'hkscda': r'https://hkscda\.com/animal/id/\d+/?',
    'pgrs': r'https://www\.pgrs\.life/pet-info/\?pet_id=[a-zA-Z0-9]+',
    'love_cats': r'https://www\.lovecatshk\.com/cats/[^/?#]+/?',
}
MAX_BYTES = 1_500_000
BLOCK = {'p', 'div', 'li', 'section', 'article', 'td', 'th', 'tr', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5'}
VOID = {'br', 'hr', 'img', 'meta', 'link', 'input', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'}


class StoryText(HTMLParser):
    """Collect lines and heading text, retaining only the article regions we use."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.lines = []
        self.pending = []

    def flush(self):
        tagged = self.pending
        self.pending = []
        if tagged:
            value = ' '.join(''.join(text for text, _, _ in tagged).split())
            if value:
                self.lines.append((value, any(title for _, title, _ in tagged), next((area for _, _, area in tagged if area), '')))

    def handle_starttag(self, tag, attrs):
        if tag in BLOCK or tag in {'br', 'hr'}:
            self.flush()
        if tag in VOID:
            return
        attrs = dict(attrs)
        classes = (attrs.get('class') or '').split()
        inherited = self.stack[-1] if self.stack else ('', False, False, '')
        area = next((c for c in classes if c in {'dog-content', 'dog_desc', 'dog_description', 'dogdescription', 'info'}), inherited[3])
        self.stack.append((tag, inherited[1] or tag in {'script', 'style', 'noscript', 'nav', 'footer', 'svg'},
                           inherited[2] or tag in {'h1', 'h2', 'h3', 'h4'}, area))

    def handle_endtag(self, tag):
        if tag in BLOCK:
            self.flush()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if self.stack and not self.stack[-1][1]:
            self.pending.append((data, self.stack[-1][2], self.stack[-1][3]))


def extract(text, org, name):
    parser = StoryText()
    parser.feed(text)
    parser.close()
    parser.flush()
    lines = parser.lines
    # Some portals change their templates or return an HTML status/directory page.
    # Require an exact animal name on the page and the organisation-specific region.
    target = (name or '').strip().casefold()
    if not target or not any(line.strip(' !！').casefold() == target for line, _, _ in lines):
        return []
    if org in {'hkdr', 'kirstens_zoo'}:
        if not any(heading and line.strip(' !！').casefold() == target for line, heading, _ in lines):
            return []
        areas = {'info'} if org == 'kirstens_zoo' else {'dog-content', 'dog_desc', 'dog_description', 'dogdescription'}
        body = [line for line, heading, area in lines if area in areas and not heading]
    else:
        entries = [line for line, _, _ in lines]
        labels = {'spca': ('關於我',), 'love_cats': ('關於牠', '性格特點'), 'hkscda': ('其他資料', '簡介', '備註'),
                  'pgrs': ('其他資訊',)}[org]
        body = []
        active = False
        for line in entries:
            if line.rstrip('：:') in labels:
                active = True
                continue
            inline = next((prefix for label in labels for prefix in (label + '：', label + ':') if line.startswith(prefix)), None)
            if inline:
                body.append(line[len(inline):].strip())
                active = False
                continue
            if active and re.match(r'^(?:Facebook|參考資料|還未準備好|立即查詢|立即申請|申請領養|返回|領養須知|相關動物|更多等待|分享|Back to Top)', line, re.I):
                break
            if active:
                body.append(line)
    result = []
    for line in body:
        if STORY_FOOTER.search(line):
            prefix = STORY_FOOTER.split(line, 1)[0].strip()
            if len(prefix) >= 10:
                result.append(prefix)
            break
        if len(line) >= 10 and line.casefold() != target and not re.match(r'https?://|^(?:Copyright|All Rights Reserved)', line, re.I):
            result.append(line)
    return list(dict.fromkeys(result))[:20]


def allowed(url, org):
    pattern = PROFILE_URLS.get(org)
    return bool(pattern and re.fullmatch(pattern, url or ''))


class PublisherRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, url):
        original = urlsplit(req.full_url)
        destination = urlsplit(url)
        if (destination.netloc != original.netloc or destination.scheme != 'https'
                or destination.path.rstrip('/') != original.path.rstrip('/') or destination.query != original.query):
            raise URLError('redirect changed publisher or profile')
        return super().redirect_request(req, fp, code, msg, headers, url)


@lru_cache(maxsize=128)
def retrieve(org, url, name, period):
    if not allowed(url, org):
        return None
    req = Request(url, headers={'User-Agent': 'WaitingForHomeHK/1.0', 'Accept': 'text/html',
                                'Accept-Language': 'zh-HK,zh-TW;q=0.9,en;q=0.8'})
    deadline = monotonic() + 6
    try:
        with build_opener(PublisherRedirect).open(req, timeout=4) as response:
            if not allowed(response.url, org) or response.headers.get_content_type() not in {'text/html', 'application/xhtml+xml'}:
                return None
            raw = bytearray()
            while True:
                chunk = response.read1(32_768)
                if len(raw) + len(chunk) > MAX_BYTES or monotonic() > deadline:
                    return None
                if not chunk:
                    break
                raw.extend(chunk)
            lines = extract(raw.decode(response.headers.get_content_charset() or 'utf-8', errors='replace'), org, name)
    except (OSError, ValueError, LookupError, URLError, HTTPException):
        return None
    return (lines, datetime.now(timezone.utc).isoformat()) if lines else None


def refresh_story(story, obs):
    result = retrieve(obs['organisation_id'], story['source_url'], obs.get('name'), int(time() // 3600))
    if not result:
        return {**story, 'live_unavailable': True}
    return {**story, 'source': 'live', 'coverage': 'live', 'paragraphs': result[0], 'has_narrative': True, 'fetched_at': result[1]}
