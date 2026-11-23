const PAGE_SIZE = 14;
const SPECIES = [['', '全部'], ['cat', '貓咪'], ['dog', '狗狗'], ['other', '其他']];
const number = new Intl.NumberFormat('zh-HK');
const style = `
.swipe-screen { --deck-ink:#342820; --deck-muted:#6b574b; --deck-apricot:#f4a261; --deck-border:#eadac8; --deck-paper:#fffbf4; color:var(--deck-ink); padding:.15rem 0 1rem; overflow-x:clip; }
.swipe-screen [hidden] { display:none!important; }
.swipe-screen h1,.swipe-screen h2,.swipe-screen p { margin:0; }
.swipe-screen button { font:inherit; cursor:pointer; }
.swipe-heading { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.85rem; }
.swipe-heading h1 { font-size:clamp(1.75rem,7vw,2.1rem); letter-spacing:-.055em; line-height:1.1; }
.swipe-heading-actions { display:flex; align-items:center; gap:.35rem; }
.swipe-search-toggle { min-width:44px; min-height:44px; padding:.25rem .65rem; background:var(--deck-paper); color:var(--deck-ink); border:1px solid var(--deck-border); border-radius:12px; font-size:.84rem!important; font-weight:750!important; }
.swipe-search { display:block; margin-bottom:.65rem; }
.swipe-search input { width:100%; min-height:44px; border:1px solid var(--deck-border); padding:.45rem .75rem; border-radius:12px; background:var(--deck-paper); color:var(--deck-ink); font:inherit; }
.swipe-filterbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.6rem .4rem; margin-bottom:.65rem; }
.swipe-filters { display:flex; gap:.38rem; }
.swipe-chip { min-height:40px; border-radius:999px; padding:.35rem .75rem; border:1px solid var(--deck-border); background:var(--deck-paper); color:var(--deck-ink); white-space:nowrap; font-size:.88rem!important; font-weight:700!important; }
.swipe-chip[aria-pressed='true'] { background:#fbe1c9; border-color:#efa875; color:#753e29; }
.swipe-progress { font-size:.81rem; color:var(--deck-muted); font-variant-numeric:tabular-nums; }
.swipe-stage { position:relative; height:clamp(18rem, 48svh, 31rem); isolation:isolate; margin-bottom:.9rem; }
.swipe-stack,.swipe-card { position:absolute; inset:0; border-radius:23px; overflow:hidden; }
.swipe-stack { background:#e7d4bf; z-index:-1; transform:translateY(7px) scale(.955); }
.swipe-stack img { width:100%; height:100%; object-fit:cover; display:block; filter:brightness(.82); }
.swipe-card { background:#e5d7c7; box-shadow:0 12px 26px #603e2329; user-select:none; cursor:grab; touch-action:pan-y; }
.swipe-card[data-dragging='true'] { cursor:grabbing; transition:none; }
.swipe-card[data-exit] { transition:transform .24s ease,opacity .24s ease; opacity:.15; pointer-events:none; }
.swipe-card[data-exit='filter'] { opacity:0; transform:translateX(-13%) scale(.98); }
.swipe-card[data-returning='true'] { transition:transform .18s ease; }
.swipe-hit { position:absolute; inset:0; display:block; border:0; background:transparent; padding:0; width:100%; border-radius:inherit; color:inherit; }
.swipe-hit:focus-visible { outline:3px solid var(--deck-apricot); outline-offset:-4px; }
.swipe-portrait { width:100%; height:100%; display:block; object-fit:cover; pointer-events:none; }
.swipe-cover { position:absolute; inset:0; display:grid; place-items:center; background:linear-gradient(145deg,#f6e5d0,#e7c2a4); font-size:.94rem; color:#694b35; pointer-events:none; }
.swipe-cover.swipe-image-ready { display:none; }
.swipe-shade { position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,#37271677 0%,transparent 30%,transparent 49%,#26180fd9 100%); }
.swipe-status { position:absolute; top:.95rem; left:.96rem; pointer-events:none; background:#fffbf3; color:#604536; border-radius:999px; padding:.38rem .67rem; font-size:.76rem; font-weight:800; }
.swipe-copy { position:absolute; inset:auto 1rem 1.15rem; pointer-events:none; color:white; display:grid; gap:.2rem; }
.swipe-copy h2 { line-height:1.05; overflow-wrap:anywhere; font-family:'Noto Serif TC','Songti TC','PMingLiU',Georgia,serif; font-size:clamp(2rem,9vw,2.8rem); }
.swipe-copy p { font-size:.9rem; font-weight:650; overflow-wrap:anywhere; }
.swipe-copy .swipe-place { font-size:.82rem; font-weight:500; color:#fff4e8; }
.swipe-reaction { position:absolute; top:24%; right:1.05rem; transform:rotate(12deg); border:3px solid #fff6e9; color:#fff6e9; background:#8a4b2bd9; padding:.3rem .65rem; border-radius:10px; font-weight:850; font-size:1.3rem; opacity:0; pointer-events:none; }
.swipe-reaction[data-side='left'] { right:auto; left:1.05rem; transform:rotate(-12deg); background:#3d3430dd; }
.swipe-actions { display:grid; grid-template-columns:1fr 1.14fr 1fr; gap:.4rem; align-items:stretch; text-align:center; }
.swipe-action { display:grid; justify-items:center; align-content:center; gap:.15rem; min-height:61px; border:1px solid var(--deck-border); border-radius:16px; background:var(--deck-paper); color:var(--deck-ink); font-size:.83rem!important; font-weight:750!important; padding:.35rem .28rem; }
.swipe-action strong { font-size:1.18rem; font-family:system-ui,sans-serif; line-height:1; }
.swipe-action.swipe-cta { background:#f4a261; border-color:#e99a59; color:#4b2d1d; }
.swipe-action.swipe-saved { background:#fae3d0; color:#873b39; }
.swipe-action[aria-disabled='true'] { cursor:default; opacity:.66; }
.swipe-extra { display:flex; gap:.4rem; margin-top:.4rem; }
.swipe-extra button { flex:1; min-height:44px; padding:.35rem .5rem; border-radius:13px; border:1px solid var(--deck-border); background:var(--deck-paper); color:var(--deck-ink); font-size:.83rem; font-weight:740; }
.swipe-extra button.swipe-apply { border-color:#e99a59; background:#fff0dc; color:#743e29; }
.swipe-extra button[aria-disabled='true'] { cursor:default; opacity:.66; }
.swipe-hint { margin-top:.55rem!important; text-align:center; font-size:.8rem; color:var(--deck-muted); }
.swipe-empty { display:grid; place-content:center; gap:.7rem; text-align:center; min-height:16rem; padding:1.4rem; border-radius:22px; border:1px solid var(--deck-border); background:var(--deck-paper); }
.swipe-empty h2 { font-size:1.25rem; }
.swipe-empty p { color:var(--deck-muted); }
.swipe-empty .swipe-chip { justify-self:center; }
.swipe-visually-hidden { position:absolute; height:1px; width:1px; overflow:hidden; clip-path:inset(50%); }
@media(max-width:350px){.swipe-chip {padding-inline:.55rem}.swipe-progress{font-size:.76rem}}
@media(prefers-reduced-motion:reduce){.swipe-card[data-exit],.swipe-card[data-returning='true']{transition:none}}
`;

function el(tag, className = '', value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function button(label, className, onClick) {
  const node = el('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function action(symbol, label, className, onClick) {
  const node = button('', `swipe-action ${className}`.trim(), onClick);
  const icon = el('strong', '', symbol);
  icon.setAttribute('aria-hidden', 'true');
  node.append(icon, el('span', '', label));
  return node;
}

function safePhoto(path) {
  if (!path) return null;
  try {
    const url = new URL(path, location.origin);
    return url.origin === location.origin && url.pathname.startsWith('/media/') ? url.href : null;
  } catch {
    return null;
  }
}

export function mountSwipe(root, {api, openProfile, isSaved, toggleSaved, onGuide, onShare, onApply}) {
  const scope = el('section', 'swipe-screen');
  scope.setAttribute('aria-label', '滑動探索領養');
  const css = el('style', '', style);
  const heading = el('div', 'swipe-heading');
  const searchLabel = el('label', 'swipe-search');
  const search = document.createElement('input');
  const filterBar = el('div', 'swipe-filterbar');
  const filters = el('div', 'swipe-filters');
  const progress = el('span', 'swipe-progress');
  const area = el('div');
  const actions = el('div', 'swipe-actions');
  const extra = el('div', 'swipe-extra');
  const hint = el('p', 'swipe-hint', '左滑略過，右滑收藏。點相片可看完整檔案。');
  const announced = el('div', 'swipe-visually-hidden');
  announced.setAttribute('aria-live', 'polite');
  progress.setAttribute('aria-live', 'polite');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', '按物種篩選');
  search.type = 'search';
  search.maxLength = 100;
  search.placeholder = '按動物名字搜尋';
  search.autocomplete = 'off';
  searchLabel.append(el('span', 'swipe-visually-hidden', '動物名字'), search);
  searchLabel.hidden = true;
  const searchToggle = button('搜尋', 'swipe-search-toggle', () => {
    searchLabel.hidden = !searchLabel.hidden;
    searchToggle.setAttribute('aria-expanded', String(!searchLabel.hidden));
    if (!searchLabel.hidden) search.focus();
  });
  searchToggle.setAttribute('aria-expanded', 'false');
  const headingActions = el('div', 'swipe-heading-actions');
  if (onGuide) {
    const guide = button('流程', 'swipe-search-toggle', onGuide);
    guide.setAttribute('aria-label', '領養流程指南');
    headingActions.append(guide);
  }
  headingActions.append(searchToggle);
  heading.append(el('h1', '', '滑動探索'), headingActions);
  filterBar.append(filters, progress);
  scope.append(heading, searchLabel, filterBar, area, actions, extra, hint, announced);
  root.replaceChildren(css, scope);

  let species = '', query = '', currentPage = 0, total = 0, nextIndex = 0;
  let items = [], busy = false, disposed = false, requestId = 0, error = null;
  let animating = false, saving = null, searchTimer, timer;
  const chips = new Map();
  for (const [value, label] of SPECIES) {
    const chip = button(label, 'swipe-chip', () => {
      if (species === value) return;
      species = value;
      chips.forEach((chip, choice) => chip.setAttribute('aria-pressed', String(choice === value)));
      start(true);
    });
    chip.setAttribute('aria-pressed', String(value === species));
    chips.set(value, chip);
    filters.append(chip);
  }

  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const value = search.value.trim();
      if (query === value) return;
      query = value;
      start();
    }, 260);
  });

  function start(transition = false) {
    requestId += 1;
    const active = requestId;
    const current = area.querySelector('.swipe-card');
    clearTimeout(timer);
    saving = null;
    animating = false;
    busy = false;
    if (transition && current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animating = true;
      current.style.transform = '';
      current.dataset.exit = 'filter';
      timer = setTimeout(() => {
        if (!disposed && active === requestId) reset();
      }, 210);
      return;
    }
    reset();
  }

  function reset() {
    currentPage = 0;
    nextIndex = 0;
    total = 0;
    items = [];
    animating = false;
    error = null;
    if (species === 'other') render();
    else load();
  }

  async function load() {
    if (busy || disposed) return;
    const active = requestId;
    busy = true;
    error = null;
    render();
    try {
      const requestedPage = currentPage + 1;
      const data = await api.get('/api/listings', {species, q:query, status:'listed', page:requestedPage, page_size:PAGE_SIZE});
      if (disposed || active !== requestId) return;
      currentPage = requestedPage;
      total = data.total;
      items.push(...data.items);
      if (!data.items.length && nextIndex > 0) total = nextIndex;
    } catch (failure) {
      if (disposed || active !== requestId) return;
      error = failure instanceof Error ? failure.message : '請再試一次。';
    } finally {
      if (!disposed && active === requestId) {
        busy = false;
        render();
      }
    }
  }

  function depart(direction, item, card) {
    animating = true;
    announced.textContent = direction === 'right' ? `已收藏 ${item.name}` : `已略過 ${item.name}`;
    card.dataset.exit = direction;
    card.style.transform = `translateX(${direction === 'right' ? '110%' : '-110%'}) rotate(${direction === 'right' ? 14 : -14}deg)`;
    const active = requestId;
    timer = setTimeout(() => {
      if (disposed || active !== requestId) return;
      animating = false;
      nextIndex += 1;
      if (nextIndex === items.length && nextIndex < total) load();
      else render();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  }

  function returnCard(card) {
    card.dataset.returning = 'true';
    card.style.transform = '';
    card.querySelector('.swipe-reaction').style.opacity = '0';
  }

  async function changeSaved(item, card, advance) {
    if (animating || saving) return;
    const active = {request: requestId, index: nextIndex};
    const restoreSaveFocus = document.activeElement?.classList.contains('swipe-save');
    saving = active;
    returnCard(card);
    for (const control of [...actions.children, ...extra.children]) control.setAttribute('aria-disabled', 'true');
    let result = null;
    try {
      result = await toggleSaved(item);
    } catch {
      if (saving === active) announced.textContent = '暫時未能更新收藏。';
    } finally {
      if (saving === active) saving = null;
    }
    if (disposed || active.request !== requestId || active.index !== nextIndex) return;
    if (result === true && advance) depart('right', item, card);
    else {
      if (result === false) announced.textContent = `已取消收藏 ${item.name}`;
      showActions(item, card);
      if (restoreSaveFocus) actions.querySelector('.swipe-save')?.focus({preventScroll: true});
    }
  }

  function move(direction, card) {
    const item = items[nextIndex];
    if (animating || !item) return;
    if (saving) {
      returnCard(card);
      return;
    }
    if (direction === 'right' && !isSaved(item.id)) changeSaved(item, card, true);
    else depart(direction, item, card);
  }

  function showActions(item, card) {
    const saved = isSaved(item.id);
    const save = action(saved ? '♥' : '♡', saved ? '已收藏' : '收藏', saved ? 'swipe-save swipe-saved' : 'swipe-save', () => changeSaved(item, card, !saved));
    save.setAttribute('aria-pressed', String(saved));
    actions.replaceChildren(action('×', '略過', '', () => move('left', card)),
      action('i', '查看檔案', 'swipe-cta', () => { if (!animating && !saving) openProfile(item.id); }), save);
    const selected = (handler) => () => {
      if (animating || saving) return;
      Promise.resolve().then(() => handler(item)).catch(() => { announced.textContent = '暫時未能開啟，請再試一次。'; });
    };
    const controls = [];
    if (onShare) controls.push(button('分享海報', '', selected(onShare)));
    if (onApply && item.status === 'listed') controls.push(button('申請領養', 'swipe-apply', selected(onApply)));
    extra.replaceChildren(...controls);
    extra.hidden = !controls.length;
  }

  function cardFor(item) {
    const deck = el('div', 'swipe-stage');
    const card = el('article', 'swipe-card');
    const cover = el('div', 'swipe-cover', '暫無機構相片');
    const photo = safePhoto(item.photo_url);
    const hit = button('', 'swipe-hit', event => {
      if (animating || saving || event.detail && ignoredClick) return;
      openProfile(item.id);
    });
    hit.setAttribute('aria-label', `查看 ${item.name} 的檔案`);
    if (photo) {
      const image = el('img', 'swipe-portrait');
      image.alt = '';
      image.draggable = false;
      image.addEventListener('load', () => cover.classList.add('swipe-image-ready'), {once:true});
      image.addEventListener('error', () => image.remove(), {once:true});
      image.src = photo;
      hit.append(image);
    }
    const copy = el('div', 'swipe-copy');
    const type = item.species === 'cat' ? '貓咪' : item.species === 'dog' ? '狗狗' : '';
    copy.append(el('h2', '', item.name),
      el('p', '', [type, item.age_label].filter(Boolean).join(' · ')),
      el('p', 'swipe-place', [item.organisation, item.snapshot_date].filter(Boolean).join(' · ')));
    const reaction = el('div', 'swipe-reaction');
    reaction.setAttribute('aria-hidden', 'true');
    card.append(cover, hit, el('div', 'swipe-shade'), el('span', 'swipe-status', item.status_label), copy, reaction);
    const stack = el('div', 'swipe-stack');
    stack.setAttribute('aria-hidden', 'true');
    const following = safePhoto(items[nextIndex + 1]?.photo_url);
    if (following) {
      const image = document.createElement('img');
      image.alt = '';
      image.decoding = 'async';
      image.addEventListener('error', () => image.remove(), {once:true});
      image.src = following;
      stack.append(image);
    }
    deck.append(stack, card);

    let gesture = null, ignoredClick = false;
    card.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || animating || saving) return;
      ignoredClick = false;
      card.dataset.returning = 'false';
      gesture = { id:event.pointerId, x:event.clientX, y:event.clientY, active:false };
    });
    card.addEventListener('pointermove', event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      if (!gesture.active && (Math.abs(x) < 11 || Math.abs(y) > Math.abs(x))) return;
      if (!gesture.active) {
        gesture.active = true;
        ignoredClick = true;
        card.dataset.dragging = 'true';
        card.setPointerCapture(event.pointerId);
      }
      card.style.transform = `translate(${x}px, ${y * .16}px) rotate(${Math.max(-16,Math.min(16,x / 13))}deg)`;
      reaction.textContent = x < 0 ? '略過' : '收藏';
      reaction.dataset.side = x < 0 ? 'left' : 'right';
      reaction.style.opacity = String(Math.min(1, Math.abs(x) / 94));
    });
    const end = (event, cancelled) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const x = event.clientX - gesture.x;
      const ready = gesture.active && !cancelled && Math.abs(x) >= Math.min(92, card.clientWidth / 4);
      gesture = null;
      card.dataset.dragging = 'false';
      if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (ready) move(x < 0 ? 'left' : 'right', card);
      else returnCard(card);
    };
    card.addEventListener('pointerup', event => end(event, false));
    card.addEventListener('pointercancel', event => end(event, true));
    card.addEventListener('pointerleave', () => { if (gesture && !gesture.active) gesture = null; });
    return {card, deck};
  }

  function render() {
    const item = items[nextIndex];
    progress.textContent = item ? `${number.format(nextIndex + 1)} / ${number.format(total)}` : species === 'other' ? '0 / 0' : '';
    actions.hidden = !item;
    extra.hidden = !item;
    hint.hidden = !item;
    if (item) {
      const {card, deck} = cardFor(item);
      area.replaceChildren(deck);
      showActions(item, card);
      return;
    }
    const empty = el('div', 'swipe-empty');
    if (error) {
      empty.append(el('h2', '', '未能載入檔案'), el('p', '', error), button('重試', 'swipe-chip', load));
    } else if (busy) {
      empty.append(el('p', '', '正在載入機構名錄…'));
    } else if (total) {
      empty.append(el('h2', '', '已瀏覽這批檔案'), button('重新瀏覽', 'swipe-chip', () => start()));
    } else if (species === 'other') {
      empty.append(el('h2', '', '這個類別暫無領養檔案'), el('p', '', '目前的公開名錄涵蓋貓和狗，可切換類別繼續探索。'));
    } else {
      empty.append(el('h2', '', '找不到符合條件的檔案'), el('p', '', '可切換物種或修改搜尋名稱。'));
    }
    area.replaceChildren(empty);
  }
  start();
  return {
    refreshSaved() {
      const card = area.querySelector('.swipe-card');
      if (!animating && !saving && card && items[nextIndex]) showActions(items[nextIndex], card);
    },
    destroy() {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(searchTimer);
    },
  };
}
