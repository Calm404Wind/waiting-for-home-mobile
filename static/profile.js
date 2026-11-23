const STYLES = `
body:has(> .animal-sheet[open]) { overflow:hidden; }
.animal-sheet,.animal-sheet * { box-sizing:border-box; }
.animal-sheet { --as-paper:var(--app-paper,#fff8ef); --as-card:var(--app-surface,#fffdf9); --as-ink:var(--app-ink,#382921); --as-muted:var(--app-muted,#69574b); --as-line:var(--app-edge,#ead9c8); --as-accent:var(--app-orange,#f4a261); --as-link:var(--app-accent,#8b422e); display:none; position:fixed; inset:0; width:min(100%,var(--phone-width,460px)); max-width:100%; height:100dvh; max-height:100dvh; padding:0; margin:auto; border:0; color:var(--as-ink); background:var(--as-paper); overflow:hidden; font:inherit; }
.animal-sheet[open] { display:grid; grid-template-rows:auto minmax(0,1fr) auto; }
.animal-sheet::backdrop { background:#4d382b77; }
.animal-sheet :focus-visible { outline:2px solid var(--as-link); outline-offset:3px; }
.as-top { display:grid; grid-template-columns:44px minmax(0,1fr) auto; align-items:center; gap:5px; padding:max(7px,env(safe-area-inset-top)) 12px 7px; border-bottom:1px solid var(--as-line); background:var(--as-card); }
.as-top-title { margin:0; font-size:.94rem; font-weight:750; text-align:center; }
.as-top-actions { display:flex; align-items:center; }
.as-feedback { grid-column:1/-1; margin:0; padding:2px 5px 4px; color:var(--as-link); font-size:.86rem; }
.as-feedback:empty { display:none; }
.as-icon { border:0; background:transparent; color:inherit; width:44px; height:44px; display:inline-grid; place-items:center; padding:0; font:inherit; cursor:pointer; border-radius:50%; }
.as-icon[hidden],.animal-sheet img[hidden] { display:none; }
.as-icon:hover,.as-icon[aria-pressed=true] { background:#f9e4d1; }
.as-icon:disabled { opacity:.45; cursor:default; }
.as-back::before,.as-forward::before { content:''; width:9px; height:9px; border-bottom:2px solid currentColor; border-left:2px solid currentColor; transform:rotate(45deg); margin-left:3px; }
.as-forward::before { transform:rotate(225deg); margin-left:0; margin-right:3px; }
.as-like { font-size:1.43rem; line-height:1; color:var(--as-link); }
.as-save,.as-share { width:auto; min-width:44px; font-size:.8rem; font-weight:750; }
.as-scroll { min-height:0; overflow:auto; overscroll-behavior:contain; padding:14px 16px 24px; scroll-padding:12px; }
.as-gallery { margin:0 0 14px; }
.as-photo-strip { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; overscroll-behavior-x:contain; scroll-padding:0; scrollbar-width:none; border-radius:24px; background:#f3e4d5; }
.as-photo-strip::-webkit-scrollbar { display:none; }
.as-photo-slide,.as-photo-empty { position:relative; flex:0 0 100%; width:100%; aspect-ratio:1.15; scroll-snap-align:start; display:grid; place-items:center; margin:0; overflow:hidden; background:#f3e5d7; color:var(--as-muted); font-size:.92rem; }
.as-photo-empty { border-radius:24px; }
.as-photo-slide img { position:absolute; width:100%; height:100%; object-fit:contain; inset:0; }
.as-gallery-footer { min-height:46px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px 10px; align-items:center; font-size:.84rem; }
.as-gallery-controls { display:flex; align-items:center; gap:2px; }
.as-gallery-controls span { min-width:45px; text-align:center; font-variant-numeric:tabular-nums; }
.as-gallery-footer a,.as-links a,.as-photo-list a { color:var(--as-link); text-decoration:underline; text-underline-offset:.21em; }
.as-gallery-footer a { padding:9px 0; }
.as-card { padding:17px; margin-bottom:13px; background:var(--as-card); border:1px solid var(--as-line); border-radius:21px; overflow-wrap:anywhere; }
.as-card h2,.as-card h3 { margin:0; line-height:1.18; }
.as-card h3 { font-size:1.18rem; }
.as-name { margin-top:9px!important; font-size:clamp(2rem,10vw,3rem); font-family:Georgia,"Noto Serif TC","Songti TC","PMingLiU",serif; }
.as-subtitle,.as-note,.as-description { color:var(--as-muted); margin:7px 0 0; font-size:.92rem; line-height:1.55; }
.as-state { display:inline-flex; align-items:center; border-radius:999px; padding:4px 9px; background:#fbe6d4; color:#673727; font-size:.81rem; line-height:1.35; font-weight:650; }
.as-state[data-status=adopted] { background:#eaf0df; color:#405537; }
.as-facts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:12px; margin:15px 0 0; }
.as-fact { min-width:0; border-top:1px solid var(--as-line); padding:8px 0; }
.as-fact dt { font-size:.78rem; color:var(--as-muted); }
.as-fact dd { margin:2px 0 0; font-size:.93rem; font-weight:650; }
.as-links { display:flex; flex-wrap:wrap; gap:5px 14px; margin:5px 0 0; font-size:.86rem; }
.as-links a { display:inline-block; padding:7px 0; }
.as-history-list { list-style:none; margin:16px 0 0; padding:0 0 0 13px; border-left:2px solid #eed3bb; }
.as-observation { position:relative; padding:0 0 16px 4px; }
.as-observation:last-child { padding-bottom:0; }
.as-observation::before { content:''; background:#c26442; border:2px solid var(--as-card); border-radius:50%; width:11px; height:11px; position:absolute; left:-19.5px; top:.37em; }
.as-observation-heading { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; }
.as-observation-heading time { font-size:.88rem; font-weight:650; }
.as-photo-list { border-radius:12px; background:#fff4e8; padding:0 8px; margin:5px 0 0; font-size:.82rem; }
.as-photo-list summary { cursor:pointer; color:var(--as-link); font-weight:650; padding:10px 4px; }
.as-photo-list ul { list-style:none; padding:0 4px 8px; margin:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); }
.as-photo-list li a { display:block; padding:7px 0; }
.as-photo-list .as-note { padding:0 4px 8px; margin:0; }
.as-bottom { background:var(--as-card); border-top:1px solid var(--as-line); padding:9px 16px max(10px,env(safe-area-inset-bottom)); }
.as-bottom[hidden] { display:none; }
.as-cta,.as-retry { display:flex; justify-content:center; align-items:center; text-align:center; min-height:46px; color:#42291d; font:inherit; font-weight:750; border:1px solid #e69454; border-radius:15px; padding:7px 13px; text-decoration:none; background:var(--as-accent); cursor:pointer; }
.as-cta { width:100%; }
.as-cta:disabled { opacity:.6; cursor:wait; }
.as-cta:hover,.as-retry:hover { background:#ed9050; }
.as-retry { margin-top:14px; }
.as-loading { min-height:170px; display:grid; align-content:center; justify-items:start; }
@media (prefers-reduced-motion:reduce) { .as-photo-strip { scroll-behavior:auto!important; } }
`;

const SPECIES = { cat: '貓', dog: '狗' };
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
    const picture = element('img');
    picture.alt = `${name} 的機構照片${images.length > 1 ? ` ${index + 1}` : ''}`;
    picture.draggable = false;
    picture.loading = index ? 'lazy' : 'eager';
    picture.addEventListener('error', () => { picture.hidden = true; });
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
    appendSource(original, '照片原始來源', images[current].source);
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
    appendSource(urls, '當次原始檔案', observation.source_url);
    if (observation.listing_url !== observation.source_url) appendSource(urls, '當次官網名錄', observation.listing_url);
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

function view(body, footer, item, onApply) {
  const name = item.name || '名稱未公佈';
  const summary = element('section', 'as-card');
  const heading = element('h2', 'as-name', name);
  heading.id = 'mobile-animal-name';
  summary.append(state(item.status_label, item.status), heading);
  const description = [SPECIES[item.species], item.organisation].filter(Boolean).join(' · ');
  if (description) summary.append(element('p', 'as-subtitle', description));

  const facts = element('dl', 'as-facts');
  const members = item.animal_names?.length > 1 ? item.animal_names.join('、') : null;
  for (const [label, value] of [['年齡', item.age_label], ['性別', item.sex], ['品種', item.breed], ['中心', item.centre], ['檔案成員', members]]) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const fact = element('div', 'as-fact');
    fact.append(element('dt', '', label), element('dd', '', value));
    facts.append(fact);
  }
  if (facts.childElementCount) summary.append(facts);
  const urls = element('div', 'as-links');
  appendSource(urls, '動物原始檔案', item.source_url);
  if (item.centre_evidence_url !== item.source_url) appendSource(urls, '位置查核來源', item.centre_evidence_url);
  if (item.contact_url !== item.source_url) appendSource(urls, '機構聯絡方式', item.contact_url);
  if (urls.childElementCount) summary.append(urls);

  body.replaceChildren(gallery(item, name), summary);
  if (item.description) {
    const about = element('section', 'as-card');
    about.append(element('h3', '', '機構介紹'), element('p', 'as-description', item.description));
    body.append(about);
  }
  body.append(timeline(item));
  if (['listed', 'foster_option'].includes(item.status)) {
    const destination = sourceUrl(item.official_action_url) || sourceUrl(item.source_url);
    let cta = destination && link(item.status === 'listed' ? '前往機構查詢領養' : '前往機構查詢領養或暫養', destination, 'as-cta');
    if (destination && onApply) {
      cta = button('as-cta', '申請領養', () => onApply(item, cta), '申請領養');
    }
    if (cta) { footer.replaceChildren(cta); footer.hidden = false; }
  }
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
    save.textContent = saved ? '已收藏' : '收藏';
    save.setAttribute('aria-pressed', String(saved));
    save.setAttribute('aria-label', saved ? '取消收藏' : '收藏這則檔案');
    like.textContent = liked ? '♥' : '♡';
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
    try {
      item = await api.get(`/api/listings/${encodeURIComponent(listingId)}`);
      if (!dialog.open) return;
      view(body, footer, item, onApply && ((_item, control) => runAction(control, onApply, '暫時無法開啟申請流程。')));
      dialog.removeAttribute('aria-label');
      dialog.setAttribute('aria-labelledby', 'mobile-animal-name');
      share.hidden = !onShare;
      like.hidden = !toggleLike;
      save.hidden = !toggleSaved;
      updateActions();
    } catch {
      if (!dialog.open) return;
      const error = element('div', 'as-card as-loading');
      error.append(element('p', '', '暫時讀不到這則動物檔案。'), button('as-retry', '重新載入', load, '重新載入'));
      body.replaceChildren(error);
    } finally { body.setAttribute('aria-busy', 'false'); }
  }
  void load();
}
