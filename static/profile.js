import { elapsedSummary } from './wait-labels.js';

const STYLES = `
body:has(> .animal-sheet[open]) { overflow:hidden; }
.animal-sheet,.animal-sheet * { box-sizing:border-box; }
.animal-sheet { --as-paper:var(--app-paper,#fff3e0); --as-card:rgba(255,255,255,0.86); --as-ink:var(--app-ink,#4a3b32); --as-muted:var(--app-muted,#766255); --as-line:rgba(224,126,56,0.2); --as-accent:#f4a261; --as-link:#9c421f; display:none; position:fixed; inset:0; width:min(100%,540px); max-width:100%; height:100dvh; max-height:100dvh; padding:0; margin:auto; border:0; color:var(--as-ink); background:radial-gradient(circle at 100% 0%,rgba(244,162,97,.18),transparent 18rem),var(--as-paper); overflow:hidden; font:inherit; box-shadow:0 26px 64px -16px rgba(42,24,14,.35); }
.animal-sheet[open] { display:grid; grid-template-rows:auto minmax(0,1fr) auto; }
.animal-sheet::backdrop { background:rgba(46,29,20,.54); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.animal-sheet :focus-visible { outline:2px solid var(--as-link); outline-offset:3px; }
.as-top { display:grid; grid-template-columns:44px minmax(0,1fr) auto; align-items:center; gap:5px; padding:max(8px,env(safe-area-inset-top)) 14px 8px; border-bottom:1px solid var(--as-line); background:rgba(255,248,236,.92); backdrop-filter:blur(14px); }
.as-top-title { margin:0; font-size:.95rem; font-weight:800; text-align:center; }
.as-top-actions { display:flex; align-items:center; gap:3px; }
.as-feedback { grid-column:1/-1; margin:0; padding:2px 5px 4px; color:var(--as-link); font-size:.85rem; font-weight:700; }
.as-feedback:empty { display:none; }
.as-icon { border:0; background:transparent; color:inherit; width:44px; height:44px; display:inline-grid; place-items:center; padding:0; font:inherit; cursor:pointer; border-radius:13px; transition:background-color 160ms ease,transform 140ms ease; }
.as-icon[hidden],.as-photo-slide [hidden] { display:none; }
.as-icon:hover,.as-icon[aria-pressed=true] { background:#fde6cf; color:var(--as-link); }
.as-icon:active { transform:scale(.95); }
.as-icon:disabled { opacity:.45; cursor:default; }
.as-back::before,.as-forward::before { content:''; width:9px; height:9px; border-bottom:2px solid currentColor; border-left:2px solid currentColor; transform:rotate(45deg); margin-left:3px; }
.as-forward::before { transform:rotate(225deg); margin-left:0; margin-right:3px; }
.as-like,.as-save,.as-share { display:inline-flex; align-items:center; justify-content:center; gap:5px; }
.as-like { color:var(--as-link); }
.as-like svg,.as-save svg { width:18px; height:18px; flex-shrink:0; display:block; }
.as-like[aria-pressed=true] svg { fill:currentColor; }
.as-save[aria-pressed=true] svg { fill:currentColor; }
.as-save,.as-share { width:auto; min-width:44px; padding-inline:10px; font-size:.8rem; font-weight:800; }
.as-scroll { min-height:0; overflow:auto; overscroll-behavior:contain; padding:16px 18px 28px; scroll-padding:12px; }
.as-gallery { margin:0 0 16px; }
.as-photo-strip { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; overscroll-behavior-x:contain; scroll-padding:0; scrollbar-width:none; border-radius:26px; background:#f3e4d5; box-shadow:0 12px 28px -10px rgba(74,43,24,.18); }
.as-photo-strip::-webkit-scrollbar { display:none; }
.as-photo-slide,.as-photo-empty { position:relative; flex:0 0 100%; width:100%; aspect-ratio:1.12; scroll-snap-align:start; display:grid; place-items:center; margin:0; overflow:hidden; background:#f3e5d7; color:var(--as-muted); font-size:.92rem; }
.as-photo-empty { border-radius:26px; }
.as-photo-slide img { position:absolute; width:100%; height:100%; object-fit:cover; object-position:center 35%; inset:0; }
.as-gallery-footer { min-height:46px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px 10px; align-items:center; font-size:.84rem; margin-top:4px; }
.as-gallery-controls { display:flex; align-items:center; gap:2px; }
.as-gallery-controls span { min-width:45px; text-align:center; font-variant-numeric:tabular-nums; font-weight:700; color:var(--as-muted); }
.as-gallery-footer a,.as-links a,.as-photo-list a { color:var(--as-link); font-weight:700; text-decoration:underline; text-underline-offset:.24em; }
.as-gallery-footer a { padding:9px 0; }
.as-card { padding:18px 20px; margin-bottom:14px; background:#fffdf9; border:1px solid rgba(138,102,76,.15); border-radius:22px; overflow-wrap:anywhere; box-shadow:none; }
.as-card h2,.as-card h3 { margin:0; line-height:1.2; font-family:var(--app-display,'Noto Serif TC',Georgia,serif); }
.as-card h3 { font-size:1.12rem; font-weight:900; }
.as-name { margin-top:6px!important; font-size:clamp(1.9rem,8.2vw,2.5rem); font-weight:900; letter-spacing:-.02em; font-family:var(--app-display,'Noto Serif TC',Georgia,serif); }
.as-subtitle,.as-note,.as-description { color:var(--as-muted); margin:8px 0 0; font-size:.92rem; line-height:1.68; }
.as-description { color:var(--as-ink); font-size:.94rem; line-height:1.74; }
.as-story-body { display:grid; gap:10px; margin-top:10px; }
.as-story-body p { margin:0; }
.as-story-status { margin:10px 0 0; font-size:.82rem; color:var(--as-muted); }
.as-traits { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 2px; padding:0; list-style:none; }
.as-traits li { font-size:.78rem; font-weight:700; color:#7f4b2b; background:#fff4e6; border:1px solid rgba(214,106,36,.22); border-radius:8px; padding:3px 9px; }
.as-wait-note { margin:8px 0 0; font-size:.84rem; font-weight:700; color:#b33a27; }
.as-state { display:inline-block; padding:0; background:transparent; color:#a04423; font-size:.8rem; line-height:1.35; font-weight:800; letter-spacing:.02em; }
.as-state[data-status=adopted] { background:transparent; color:#2b5c34; }
.as-facts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:14px; margin:16px 0 0; }
.as-fact { min-width:0; border-top:1px solid var(--as-line); padding:10px 0; }
.as-fact dt { font-size:.76rem; font-weight:600; color:var(--as-muted); }
.as-fact dd { margin:3px 0 0; font-size:.94rem; font-weight:800; }
.as-links { display:flex; flex-wrap:wrap; gap:6px 16px; margin:8px 0 0; font-size:.85rem; }
.as-links a { display:inline-block; padding:7px 0; }
.as-prepare { font:inherit; font-weight:700; color:var(--as-link); border:0; background:transparent; padding:7px 0; text-decoration:underline; text-underline-offset:.24em; cursor:pointer; }
.as-source-foot { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px 14px; padding:6px 4px 2px; font-size:.8rem; color:var(--as-muted); }
.as-source-foot .as-links { margin:0; font-size:.8rem; }
.as-history-list { list-style:none; margin:16px 0 0; padding:0 0 0 15px; border-left:2px solid #ecc6a4; }
.as-observation { position:relative; padding:0 0 18px 4px; }
.as-observation:last-child { padding-bottom:0; }
.as-observation::before { content:''; background:#d66a24; border:2px solid #fffdf9; box-shadow:0 0 0 2px rgba(214,106,36,.24); border-radius:50%; width:11px; height:11px; position:absolute; left:-21.5px; top:.35em; }
.as-observation-heading { display:flex; flex-wrap:wrap; align-items:center; gap:5px 9px; }
.as-observation-heading time { font-size:.88rem; font-weight:800; font-variant-numeric:tabular-nums; }
.as-photo-list { border-radius:14px; background:#fff6ea; padding:0 12px; margin:6px 0 0; font-size:.82rem; border:1px solid rgba(224,126,56,.18); }
.as-photo-list summary { cursor:pointer; color:var(--as-link); font-weight:700; padding:10px 4px; }
.as-photo-list ul { list-style:none; padding:0 4px 8px; margin:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); }
.as-photo-list li a { display:block; padding:7px 0; }
.as-photo-list .as-note { padding:0 4px 8px; margin:0; }
.as-bottom { background:rgba(255,248,236,.95); backdrop-filter:blur(14px); border-top:1px solid var(--as-line); padding:10px 18px max(12px,env(safe-area-inset-bottom)); }
.as-bottom[hidden] { display:none; }
.as-cta,.as-retry { display:flex; justify-content:center; align-items:center; text-align:center; min-height:50px; color:#ffffff; font:inherit; font-weight:800; border:0; border-radius:18px; padding:10px 18px; text-decoration:none; background:linear-gradient(135deg,#e27832 0%,#c8581d 100%); box-shadow:0 12px 24px -8px rgba(200,88,29,.42); cursor:pointer; transition:transform 150ms ease,box-shadow 160ms ease,filter 150ms ease; }
.as-cta { width:100%; }
.as-cta:disabled { opacity:.6; cursor:wait; }
.as-cta:hover,.as-retry:hover { transform:translateY(-1px); filter:brightness(1.03); box-shadow:0 15px 28px -8px rgba(200,88,29,.5); }
.as-cta:active,.as-retry:active { transform:scale(.985); }
.as-retry { margin-top:14px; }
.as-loading { min-height:170px; display:grid; align-content:center; justify-items:start; }
@media (min-width:540px) { .animal-sheet { width:min(393px,calc(100vw - 48px)); height:min(812px,calc(100dvh - 64px)); border-radius:40px; border:1px solid var(--as-line); } }
@media (prefers-reduced-motion:reduce) { .as-photo-strip { scroll-behavior:auto!important; } }
`;

const SPECIES = { cat: '貓', dog: '狗' };
const ICONS = {
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h11v17L12 17l-5.5 3.5Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 5.8c-2.1-2.2-5.6-2.2-7.7 0L12 6.9l-1.1-1.1a5.3 5.3 0 0 0-7.7 0 5.7 5.7 0 0 0 0 7.9L12 22l8.8-8.3a5.7 5.7 0 0 0 0-7.9Z"/></svg>',
};
const HISTORY_KEY = 'waitingForHomeAnimal';
const isListingId = value => typeof value === 'string' && /^listing_[\w-]{1,200}$/.test(value);
let activeProfile;
let recentOptions;
let sequence = 0;

window.addEventListener('popstate', event => {
  const entry = event.state?.[HISTORY_KEY];
  if (activeProfile?.entry && entry?.key === activeProfile.entry.key) return;
  if (isListingId(entry?.listingId) && recentOptions) {
    showAnimal(entry.listingId, recentOptions, entry);
  } else {
    activeProfile?.dialog.close();
  }
});

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, label, handler, text) {
  const control = element('button', className, text);
  control.type = 'button';
  control.setAttribute('aria-label', label);
  control.addEventListener('click', handler);
  return control;
}

function sourceUrl(value, photo = false) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = photo ? new URL(value, location.origin) : new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (photo && (url.origin !== location.origin || !url.pathname.startsWith('/media/'))) return null;
    return url.href;
  } catch { return null; }
}

function link(label, raw, className) {
  const value = sourceUrl(raw);
  if (!value) return null;
  const anchor = element('a', className, label);
  anchor.href = value;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function appendSource(root, label, url) {
  const anchor = link(label, url);
  if (anchor) root.append(anchor);
}

function gallery(item, name) {
  const area = element('section', 'as-gallery');
  area.setAttribute('aria-label', `${name} 的機構照片`);
  const images = [];
  const seen = new Set();
  for (const photo of item.photos || []) {
    const url = sourceUrl(photo.url, true);
    const key = photo.sha256 || url;
    if (!url || seen.has(key)) continue;
    seen.add(key);
    images.push({ url, source: photo.source_url });
  }
  const cover = sourceUrl(item.photo_url, true);
  if (!images.length && cover) images.push({ url:cover });
  if (!images.length) {
    area.append(element('p', 'as-photo-empty', '這則檔案暫無可顯示的照片'));
    return area;
  }

  const strip = element('div', 'as-photo-strip');
  strip.tabIndex = images.length > 1 ? 0 : -1;
  strip.setAttribute('aria-label', '照片輪播');
  for (const [index, photo] of images.entries()) {
    const slide = element('figure', 'as-photo-slide');
    const placeholder = element('span', '', '照片暫不可讀');
    placeholder.hidden = true;
    const picture = element('img');
    picture.alt = `${name} 的機構照片${images.length > 1 ? ` ${index + 1}` : ''}`;
    picture.draggable = false;
    picture.loading = index ? 'lazy' : 'eager';
    picture.addEventListener('error', () => { picture.hidden = true; placeholder.hidden = false; });
    picture.src = photo.url;
    slide.append(placeholder, picture);
    strip.append(slide);
  }
  const footer = element('div', 'as-gallery-footer');
  const controls = element('div', 'as-gallery-controls');
  const original = element('span');
  const indexLabel = element('span');
  indexLabel.setAttribute('aria-live', 'polite');
  let current = 0;
  let frame = 0;
  const previous = button('as-icon as-back', '上一張照片', () => go(current - 1));
  const next = button('as-icon as-forward', '下一張照片', () => go(current + 1));
  if (images.length > 1) controls.append(previous, indexLabel, next);
  else controls.append(element('span', '', '機構照片'));
  footer.append(controls, original);
  area.append(strip, footer);

  function show(index) {
    current = index;
    indexLabel.textContent = `${current + 1} / ${images.length}`;
    previous.disabled = current === 0;
    next.disabled = current === images.length - 1;
    original.replaceChildren();
    appendSource(original, '照片來源 ↗', images[current].source);
  }
  function go(index) {
    if (index < 0 || index >= images.length) return;
    strip.scrollTo({ left:index * strip.clientWidth, behavior:'auto' });
    show(index);
  }
  strip.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!strip.clientWidth) return;
      const index = Math.max(0, Math.min(images.length - 1, Math.round(strip.scrollLeft / strip.clientWidth)));
      if (index !== current) show(index);
    });
  }, { passive:true });
  strip.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  show(0);
  return area;
}

function state(label, status) {
  const badge = element('span', 'as-state', label || '狀態待核');
  if (status) badge.dataset.status = status;
  return badge;
}

function timeline(item) {
  const section = element('section', 'as-card');
  section.append(element('h3', '', '官網狀態紀錄'));
  if (item.adopted_date_label) {
    section.append(element('p', 'as-note', `機構記錄的領養日期 ${item.adopted_date_label}`));
  } else if (item.status === 'adopted') {
    section.append(element('p', 'as-note', '官網已列為已領養。實際領養日期未公佈。'));
  }
  if (!item.history?.length) {
    section.append(element('p', 'as-note', '這則檔案暫無可核對的觀察紀錄。'));
    return section;
  }
  const list = element('ol', 'as-history-list');
  for (const observation of item.history) {
    const row = element('li', 'as-observation');
    const header = element('div', 'as-observation-heading');
    const observedAt = element('time', '', observation.date_label || observation.date || '觀察日期未標示');
    if (typeof observation.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(observation.date)) observedAt.dateTime = observation.date;
    header.append(observedAt, state(observation.status_label));
    row.append(header);
    const urls = element('div', 'as-links');
    appendSource(urls, '原始紀錄 ↗', observation.source_url);
    if (observation.listing_url !== observation.source_url) appendSource(urls, '官網名錄 ↗', observation.listing_url);
    if (urls.childElementCount) row.append(urls);

    const refs = element('ul');
    for (const [index, photo] of (observation.source_photos ?? observation.photos ?? []).entries()) {
      const entry = element('li');
      appendSource(entry, `照片來源 ${index + 1}`, photo.source_url);
      if (entry.childElementCount) refs.append(entry);
    }
    if (refs.childElementCount || observation.status_raw) {
      const detail = element('details', 'as-photo-list');
      detail.append(element('summary', '', refs.childElementCount ? `查看 ${refs.childElementCount} 筆照片來源` : '查看狀態原文'));
      if (observation.status_raw) detail.append(element('p', 'as-note', observation.status_raw));
      if (refs.childElementCount) detail.append(refs);
      row.append(detail);
    }
    list.append(row);
  }
  section.append(list);
  if (item.identity_note) section.append(element('p', 'as-note', item.identity_note));
  return section;
}

function appendFactRow(facts, seenLabels, label, value) {
  if (typeof label !== 'string' || typeof value !== 'string') return;
  const cleanLabel = label.trim();
  const cleanValue = value.trim();
  if (!cleanLabel || !cleanValue) return;
  const normKey = cleanLabel === '所在中心' ? '中心' : cleanLabel;
  if (seenLabels.has(normKey)) return;
  seenLabels.add(normKey);
  const fact = element('div', 'as-fact');
  fact.append(element('dt', '', cleanLabel), element('dd', '', cleanValue));
  facts.append(fact);
}

function view(body, footer, item, onApply, fetchCurrentStory) {
  const name = item.name || '名稱未公佈';
  const summary = element('section', 'as-card');
  const heading = element('h2', 'as-name', name);
  heading.id = 'mobile-animal-name';
  summary.append(state(item.status_label, item.status), heading);
  const description = [SPECIES[item.species], item.organisation].filter(Boolean).join(' · ');
  if (description) summary.append(element('p', 'as-subtitle', description));
  const elapsed = elapsedSummary(item);
  if (elapsed) summary.append(element('p', 'as-wait-note', elapsed));

  const facts = element('dl', 'as-facts');
  const seenLabels = new Set();
  const members = item.animal_names?.length > 1 ? item.animal_names.join('、') : null;
  for (const [label, value] of [
    ['年齡', item.age_label],
    ['性別', item.sex],
    ['品種', item.breed],
    ['體型', item.size],
    ['中心', item.centre],
    ['檔案成員', members],
  ]) {
    appendFactRow(facts, seenLabels, label, value);
  }
  summary.append(facts);
  facts.hidden = facts.childElementCount === 0;

  const about = element('section', 'as-card');
  about.append(element('h3', '', '機構介紹'));
  const traitsHost = element('div');
  const storyBody = element('div', 'as-story-body');
  if (item.description) {
    storyBody.append(element('p', 'as-description', item.description));
  }
  const storyStatus = element(
    'p',
    'as-story-status',
    item.source_url ? '正在讀取機構介紹…' : '',
  );
  storyStatus.setAttribute('role', 'status');
  if (!storyStatus.textContent) storyStatus.hidden = true;
  const refreshStory = button('as-prepare', '讀取最新官網介紹', async () => {
    refreshStory.disabled = true;
    storyStatus.hidden = false;
    storyStatus.textContent = '正在查閱機構目前公開的介紹…';
    try {
      const latest = await fetchCurrentStory();
      if (about.isConnected) storyView.hydrateStory(latest);
    } catch (cause) {
      if (!about.isConnected) return;
      if (cause?.code === 'test-access') storyView.markStoryFallback(cause);
      else storyStatus.textContent = '暫時未能讀取官網更新。';
    } finally {
      refreshStory.disabled = false;
    }
  }, '讀取最新官網介紹');
  refreshStory.hidden = true;
  about.append(traitsHost, storyBody, storyStatus, refreshStory);

  const originalStory = element('div', 'as-links');
  appendSource(originalStory, '閱讀機構原文 ↗', item.source_url);
  if (originalStory.childElementCount) about.append(originalStory);
  const sourceFoot = element('div', 'as-source-foot');
  const urls = element('div', 'as-links');
  appendSource(urls, '機構原始檔案 ↗', item.source_url);
  if (item.centre_evidence_url !== item.source_url) appendSource(urls, '位置來源 ↗', item.centre_evidence_url);
  if (item.contact_url !== item.source_url) appendSource(urls, '聯絡機構 ↗', item.contact_url);
  const listed = ['listed', 'foster_option'].includes(item.status);
  const official = sourceUrl(item.official_action_url) || sourceUrl(item.source_url);
  body.replaceChildren(gallery(item, name), summary, about, timeline(item));
  if (urls.childElementCount) {
    sourceFoot.append(element('span', '', '資料出處'), urls);
    body.append(sourceFoot);
  }
  if (listed && official) {
    const label = item.status === 'foster_option' ? '向中心查詢領養或暫養' : '向中心查詢';
    const cta = onApply
      ? button('as-cta', label, () => onApply(item, cta), label)
      : link(label, official, 'as-cta');
    footer.replaceChildren(cta);
    footer.hidden = false;
  }

  const storyView = {
    hydrateStory(story) {
      refreshStory.hidden = !story?.can_refresh;
      for (const extra of story?.facts || []) {
        appendFactRow(facts, seenLabels, extra.label, extra.value);
      }
      facts.hidden = facts.childElementCount === 0;

      traitsHost.replaceChildren();
      if (story?.traits?.length) {
        const list = element('ul', 'as-traits');
        list.setAttribute('aria-label', '性格與特徵');
        for (const trait of story.traits) {
          list.append(element('li', '', trait));
        }
        traitsHost.append(list);
      }

      if (sourceUrl(story?.source_url) && story.source_url !== item.source_url) {
        originalStory.replaceChildren();
        appendSource(originalStory, '閱讀機構原文 ↗', story.source_url);
        if (!originalStory.isConnected) about.append(originalStory);
      }
      const paragraphs = Array.isArray(story?.paragraphs)
        ? story.paragraphs
        : (item.description ? [item.description] : []);
      storyBody.replaceChildren();
      if (paragraphs.length) {
        for (const text of paragraphs) {
          storyBody.append(element('p', 'as-description', text));
        }
        const archiveDate = story?.snapshot_date ? `（${story.snapshot_date} 快照）` : '';
        storyStatus.textContent = story?.source === 'live'
          ? '文字來自機構目前公開的網頁。'
          : `文字來自已收錄的機構資料${archiveDate}。`;
        storyStatus.hidden = false;
      } else {
        storyStatus.hidden = false;
        storyStatus.textContent = '已收錄的資料未附文字介紹。';
      }
      if (story?.live_unavailable) storyStatus.textContent += ' 暫時未能取得官網更新，現顯示本期存檔。';
    },
    markStoryFallback(cause) {
      storyStatus.hidden = false;
      if (cause?.code === 'test-access') {
        const signIn = element('a', '', cause.action);
        signIn.href = cause.href;
        storyStatus.replaceChildren(document.createTextNode(cause.message + ' '), signIn);
      } else {
        storyStatus.textContent = storyBody.childElementCount
          ? '目前顯示已收錄的機構簡介。'
          : '暫無可顯示的機構介紹。';
      }
    },
  };
  return storyView;
}

export function closeAnimal() {
  if (!activeProfile?.dialog.open) return false;
  const profile = activeProfile;
  if (profile.entry && history.state?.[HISTORY_KEY]?.key === profile.entry.key) {
    if (!profile.returning) { profile.returning = true; history.back(); }
  } else {
    profile.dialog.close();
  }
  return true;
}

export function openAnimal(listingId, options) {
  if (!isListingId(listingId) || !options?.api?.get) return false;
  if (activeProfile?.dialog.open && activeProfile.dialog.dataset.listingId === listingId) return true;
  recentOptions = options;
  let entry = { listingId, key: `${Date.now()}-${++sequence}` };
  try {
    const precedingState = history.state;
    const nextState = { ...precedingState, [HISTORY_KEY]: entry };
    if (precedingState?.[HISTORY_KEY]) history.replaceState(nextState, '');
    else history.pushState(nextState, '');
  } catch {
    entry = null;
  }
  showAnimal(listingId, options, entry);
  return true;
}

function showAnimal(listingId, { api, isSaved, toggleSaved, isLiked, toggleLike, onShare, onApply, onClose }, entry) {
  if (activeProfile?.dialog.open && activeProfile.dialog.dataset.listingId === listingId && activeProfile.entry?.key === entry?.key) return;
  const previousFocus = document.activeElement;
  activeProfile?.dialog.close();
  if (!document.getElementById('animal-sheet-styles')) {
    const style = element('style', '', STYLES);
    style.id = 'animal-sheet-styles';
    document.head.append(style);
  }
  const dialog = element('dialog', 'animal-sheet');
  dialog.dataset.listingId = listingId;
  dialog.setAttribute('aria-label', '動物檔案');
  const top = element('header', 'as-top');
  const back = button('as-icon as-back', '返回', closeAnimal);
  back.autofocus = true;
  let item;
  const actions = element('div', 'as-top-actions');
  const feedback = element('p', 'as-feedback');
  feedback.setAttribute('role', 'status');
  async function runAction(control, action, message) {
    if (!item || control.disabled) return;
    feedback.textContent = '';
    control.disabled = true;
    try { await action(item); }
    catch { if (dialog.open) feedback.textContent = message; }
    finally {
      if (dialog.open) {
        control.disabled = false;
        updateActions();
      }
    }
  }
  const share = button('as-icon as-share', '分享這則檔案', () => runAction(share, onShare, '暫時無法開啟分享。'), '分享');
  const like = button('as-icon as-like', '點讚這則檔案', () => runAction(like, toggleLike, '暫時無法更新點讚。'));
  const save = button('as-icon as-save', '收藏這則檔案', () => runAction(save, toggleSaved, '暫時無法更新收藏。'));
  for (const control of [share, like, save]) control.hidden = true;
  function updateActions() {
    const saved = Boolean(isSaved?.(listingId));
    const liked = Boolean(isLiked?.(listingId));
    save.innerHTML = `${ICONS.bookmark}<span>${saved ? '已收藏' : '收藏'}</span>`;
    save.setAttribute('aria-pressed', String(saved));
    save.setAttribute('aria-label', saved ? '取消收藏' : '收藏這則檔案');
    like.innerHTML = ICONS.heart;
    like.setAttribute('aria-pressed', String(liked));
    like.setAttribute('aria-label', liked ? '取消點讚' : '點讚這則檔案');
  }
  actions.append(share, like, save);
  top.append(back, element('p', 'as-top-title', '動物檔案'), actions, feedback);
  const body = element('div', 'as-scroll');
  const footer = element('div', 'as-bottom');
  footer.hidden = true;
  dialog.append(top, body, footer);
  document.body.append(dialog);
  const profile = { dialog, entry, returning:false };
  activeProfile = profile;
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeAnimal();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (activeProfile !== profile) return;
    activeProfile = null;
    if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll:true });
    onClose?.();
  }, { once:true });
  dialog.showModal();

  async function load() {
    body.setAttribute('aria-busy', 'true');
    const pending = element('p', 'as-card as-loading', '正在載入動物檔案…');
    pending.setAttribute('role', 'status');
    body.replaceChildren(pending);
    let fetched = false;
    try {
      item = await api.get(`/api/listings/${encodeURIComponent(listingId)}`);
      if (!dialog.open) return;
      fetched = true;
      if (item?.id !== listingId) throw new Error('Unexpected profile response');
      const viewHandle = view(
        body,
        footer,
        item,
        onApply && ((_item, control) => runAction(control, onApply, '暫時無法開啟申請流程。')),
        () => api.get(`/api/listings/${encodeURIComponent(listingId)}/story`, {refresh:true}),
      );
      dialog.removeAttribute('aria-label');
      dialog.setAttribute('aria-labelledby', 'mobile-animal-name');
      share.hidden = !onShare;
      like.hidden = !toggleLike;
      save.hidden = !toggleSaved;
      updateActions();

      api.get(`/api/listings/${encodeURIComponent(listingId)}/story`)
        .then(story => {
          if (!dialog.open || dialog.dataset.listingId !== listingId) return;
          viewHandle.hydrateStory(story);
        })
        .catch(cause => {
          if (!dialog.open || dialog.dataset.listingId !== listingId) return;
          viewHandle.markStoryFallback(cause);
        });
    } catch (cause) {
      if (!dialog.open) return;
      const error = element('div', 'as-card as-loading');
      error.setAttribute('role', 'alert');
      footer.hidden = true;
      for (const control of [share, like, save]) control.hidden = true;
      if (cause.code === 'test-access') {
        const verify = element('a', 'as-retry', cause.action + '並返回檔案');
        verify.href = cause.href;
        error.append(element('p', '', cause.message), verify);
      } else if (cause.status === 404) {
        error.append(element('p', '', '目前的領養名錄找不到這則動物檔案。'),
          button('as-retry', '返回', closeAnimal, '返回'));
      } else {
        let message = '未能連接動物檔案，請檢查網絡後重試。';
        if (fetched || cause.status === 200) message = '已收到檔案回應，但未能顯示內容。請重新載入。';
        else if (cause.status) message = '動物檔案服務暫時無法提供資料，請稍後重試。';
        error.append(element('p', '', message), button('as-retry', '重新載入', load, '重新載入'));
      }
      body.replaceChildren(error);
    } finally { body.setAttribute('aria-busy', 'false'); }
  }
  void load();
}
