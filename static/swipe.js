const PAGE_SIZE = 14;
const SPECIES = [['', '全部'], ['cat', '貓咪'], ['dog', '狗狗'], ['other', '其他']];
const number = new Intl.NumberFormat('zh-HK');

const ICONS = {
  guide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5h9l3 3V21H6Z"/><path d="M14.8 3.5v4h3.1M9 12.5c1.4-1.5 4.6-1.5 6 0-1.3 2-3 3.1-3 3.1S10.3 14.5 9 12.5Z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h11v17L12 17l-5.5 3.5Z"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M20 19v-4a6 6 0 0 0-6-6H4"/></svg>`,
  paw: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="15.3" rx="5.2" ry="4.3"/><ellipse cx="5.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="18.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="9.2" cy="5.7" rx="2" ry="2.6"/><ellipse cx="14.8" cy="5.7" rx="2" ry="2.6"/></svg>`,
  cat: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 3.4c-.5-.3-1.2.1-1.2.7v6.6C4 16 7.5 20 12 20s8-4 8-9.3V4.1c0-.6-.7-1-1.2-.7L15.1 6a9.6 9.6 0 0 0-6.2 0L5.2 3.4Z"/><circle cx="9.2" cy="12" r="1.25" fill="#fffdf9"/><circle cx="14.8" cy="12" r="1.25" fill="#fffdf9"/><path d="M12 14.8 10.7 13.5h2.6L12 14.8Z" fill="#fffdf9"/></svg>`,
  dog: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.6 5.4c-1.8.8-3 3.2-2.7 6.3.2 1.7 1.3 2.5 2.4 2.1.4-.1.7-.4.9-.8.6 3.9 3 6.5 5.8 6.5s5.2-2.6 5.8-6.5c.2.4.5.7.9.8 1.1.4 2.2-.4 2.4-2.1.3-3.1-.9-5.5-2.7-6.3-1-.4-2.1-.1-2.8.6a8.6 8.6 0 0 0-7.2 0c-.7-.7-1.8-1-2.8-.6Z"/><circle cx="9.5" cy="11.2" r="1.2" fill="#fffdf9"/><circle cx="14.5" cy="11.2" r="1.2" fill="#fffdf9"/><ellipse cx="12" cy="14.3" rx="1.8" ry="1.25" fill="#fffdf9"/></svg>`,
};

const style = `
.swipe-screen {
  --deck-ink: #4a3b32;
  --deck-muted: #766255;
  --deck-apricot: #f4a261;
  --deck-border: rgba(224, 126, 56, 0.2);
  --deck-paper: rgba(255, 255, 255, 0.88);
  color: var(--deck-ink);
  padding: .1rem 0 1.2rem;
  overflow-x: clip;
  max-width: 520px;
  margin: 0 auto;
}
.swipe-screen [hidden] { display: none !important; }
.swipe-screen h1, .swipe-screen h2, .swipe-screen p { margin: 0; }
.swipe-screen button { font: inherit; cursor: pointer; }

.swipe-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .65rem;
  margin-bottom: .35rem;
}
.swipe-kicker {
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: #c66322;
  margin-bottom: 2px !important;
}
.swipe-heading h1 {
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: clamp(1.42rem, 5.2vw, 1.78rem);
  font-weight: 900;
  letter-spacing: -.02em;
  line-height: 1.12;
}
.swipe-heading-actions {
  display: flex;
  align-items: center;
  gap: .35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.swipe-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 38px;
  padding: .2rem .45rem;
  background: transparent;
  color: #9c421f;
  border: 0;
  border-radius: 10px;
  font-size: .82rem !important;
  font-weight: 700 !important;
  white-space: nowrap;
  box-shadow: none;
  transition: background-color 160ms ease, opacity 140ms ease;
}
.swipe-pill-btn svg { width: 15px; height: 15px; color: #9c421f; flex-shrink: 0; }
.swipe-pill-btn:hover { background: rgba(156, 66, 31, 0.08); }
.swipe-pill-btn:active { opacity: .76; }

.swipe-search { display: block; margin-bottom: .65rem; }
.swipe-search input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--deck-border);
  padding: .5rem .9rem;
  border-radius: 16px;
  background: #fffdf9;
  color: var(--deck-ink);
  font: inherit;
  box-shadow: 0 4px 14px rgba(112, 78, 55, 0.05);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.swipe-search input:focus {
  outline: none;
  border-color: #d88d55;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, .28);
}
.swipe-centre { display:flex; align-items:center; gap:.4rem .8rem; flex-wrap:wrap; margin-bottom:.6rem; font-size:.88rem; }
.swipe-centre-name { flex:1 1 10rem; font-weight:750; }
.swipe-centre select { font:inherit; border:1px solid var(--deck-border); border-radius:8px; padding:7px; background:#fffdf9; color:inherit; }
.swipe-centre a { color:#9c421f; padding:10px 0; }

.swipe-filterbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .4rem;
  margin-bottom: .58rem;
}
.swipe-filters {
  display: flex;
  gap: .12rem;
  background: transparent;
  padding: 0;
  border-radius: 0;
  border-bottom: 1px solid rgba(138, 102, 76, 0.18);
}
.swipe-chip {
  min-height: 38px;
  border-radius: 0;
  padding: .22rem .64rem;
  border: 0;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--deck-muted);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .84rem !important;
  font-weight: 700 !important;
  transition: color 160ms ease, border-color 160ms ease;
}
.swipe-chip.is-icon {
  min-width: 42px;
  padding: .3rem .52rem;
}
.swipe-chip svg {
  width: 20px;
  height: 20px;
  display: block;
}
.swipe-chip:hover { color: var(--deck-ink); }
.swipe-chip[aria-pressed='true'] {
  background: transparent;
  border-bottom-color: #c8581d;
  color: #9c421f;
  box-shadow: none;
}
.swipe-progress {
  font-size: .8rem;
  font-weight: 700;
  color: var(--deck-muted);
  font-variant-numeric: tabular-nums;
  padding: 0 2px;
  border-radius: 0;
  background: transparent;
  border: 0;
}

/* Figma Make Pet Card Stack (Top Photo + White-Cream Details Panel) */
.swipe-stage {
  position: relative;
  isolation: isolate;
  margin-bottom: .45rem;
  padding-bottom: 8px;
}
.swipe-stack {
  position: absolute;
  inset: 8px 12px 0;
  border-radius: 26px;
  overflow: hidden;
  background: #edd7c0;
  border: 1px solid rgba(224, 126, 56, 0.18);
  z-index: -1;
  transform: translateY(5px) scale(.968);
  opacity: .72;
  box-shadow: 0 12px 26px -12px rgba(74, 43, 24, .18);
}
.swipe-stack img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: blur(2px) brightness(.9);
}

.swipe-card {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  background: #fffdf9;
  border: 1px solid rgba(224, 126, 56, 0.22);
  box-shadow: 0 18px 36px -14px rgba(92, 58, 36, .22);
  user-select: none;
  cursor: grab;
  touch-action: pan-y;
}
.swipe-card[data-dragging='true'] { cursor: grabbing; transition: none; }
.swipe-card[data-exit] {
  transition: transform .24s cubic-bezier(0.16, 1, 0.3, 1), opacity .22s ease;
  opacity: .12;
  pointer-events: none;
}
.swipe-card[data-exit='filter'] {
  opacity: 0;
  transform: translateX(-12%) scale(.98);
}
.swipe-card[data-returning='true'] {
  transition: transform .2s cubic-bezier(0.16, 1, 0.3, 1);
}

.swipe-hit {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  border: 0;
  background: transparent;
  padding: 0;
  width: 100%;
  border-radius: inherit;
  color: inherit;
}
.swipe-hit:focus-visible { outline: 3px solid var(--deck-apricot); outline-offset: -4px; }

.pet-photo {
  position: relative;
  height: clamp(355px, 44svh, 405px);
  background: linear-gradient(145deg, #f8e2c8 0%, #eab98f 100%);
  overflow: hidden;
}
.swipe-portrait {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center 26%;
  pointer-events: none;
}
.pet-saved-tag {
  position: absolute;
  top: .85rem;
  left: .85rem;
  z-index: 3;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 0 .68rem;
  border-radius: 10px;
  background: rgba(255, 250, 241, .92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #a94f09;
  font-size: .74rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(38, 20, 10, .14);
}
.pet-saved-tag svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.swipe-cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(145deg, #f7e4ce, #ebc19e);
  font-size: .88rem;
  font-weight: 700;
  color: #7d563d;
  pointer-events: none;
}
.swipe-cover svg { width: 40px; height: 40px; opacity: .45; }
.swipe-cover.swipe-image-ready { display: none; }

.photo-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(34, 19, 10, .28) 0%, rgba(34, 19, 10, 0) 34%, rgba(34, 19, 10, 0) 68%, rgba(34, 19, 10, .46) 100%);
}

.swipe-status {
  position: absolute;
  top: .9rem;
  left: .9rem;
  z-index: 1;
  pointer-events: none;
  background: rgba(255, 252, 246, .92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #6b3b20;
  border-radius: 12px;
  padding: .34rem .72rem;
  font-size: .75rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(38, 20, 10, .14);
}

.pet-share-btn {
  position: absolute;
  top: .85rem;
  right: .85rem;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 38px;
  padding: 0 .78rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, .45);
  background: rgba(42, 26, 16, .58);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fffaf3;
  font-size: .78rem;
  font-weight: 700;
  transition: background-color 150ms ease, transform 140ms ease;
}
.pet-share-btn svg { width: 14px; height: 14px; }
.pet-share-btn:hover { background: rgba(42, 26, 16, .78); }
.pet-share-btn:active { transform: scale(.95); }

.snapshot-badge {
  position: absolute;
  bottom: .75rem;
  right: .85rem;
  z-index: 1;
  pointer-events: none;
  background: rgba(36, 22, 14, .66);
  backdrop-filter: blur(6px);
  color: #fffaf2;
  border-radius: 10px;
  padding: .26rem .6rem;
  font-size: .72rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.pet-details {
  padding: 10px 14px 11px;
  display: grid;
  gap: 3px;
  background: #fffdf9;
  pointer-events: none;
}
.pet-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.pet-title-main {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex-wrap: nowrap;
  overflow: hidden;
}
.pet-title-main h2 {
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.24rem;
  font-weight: 900;
  line-height: 1.18;
  color: var(--deck-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
}
.pet-meta-line {
  margin-top: 0 !important;
  font-size: .77rem;
  font-weight: 700;
  color: var(--deck-muted);
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
  min-width: 0;
}
.pet-species-icon {
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: translateY(1px);
}
.pet-species-icon.is-cat { color: #cf641f; }
.pet-species-icon.is-dog { color: #cb4634; }
.pet-species-icon svg { width: 15px; height: 15px; display: block; }

.sex-badge {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .88rem;
  font-weight: 900;
  flex-shrink: 0;
}
.sex-male { background: #e8f2fc; color: #256399; }
.sex-female { background: #fceaf0; color: #b84268; }

.pet-org-line {
  font-size: .75rem;
  font-weight: 600;
  color: #9c421f;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pet-excerpt {
  font-size: .76rem;
  line-height: 1.38;
  color: var(--deck-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pet-card-foot {
  margin-top: 2px;
  padding-top: 9px;
  border-top: 1px solid rgba(224, 126, 56, 0.14);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: .76rem;
  font-weight: 700;
  color: #b45622;
}

.swipe-reaction {
  position: absolute;
  top: 16%;
  right: 1.1rem;
  z-index: 3;
  transform: rotate(11deg);
  border: 3px solid #fff6e9;
  color: #fff6e9;
  background: rgba(184, 72, 30, .9);
  padding: .32rem .75rem;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.2rem;
  opacity: 0;
  pointer-events: none;
  letter-spacing: .06em;
}
.swipe-reaction[data-side='left'] {
  right: auto;
  left: 1.1rem;
  transform: rotate(-11deg);
  background: rgba(66, 48, 38, .9);
}

.swipe-gesture-tip {
  margin: .35rem 0 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0 .2rem;
  text-align: center;
  font-size: .74rem;
  font-weight: 600;
  color: #8b7262;
  letter-spacing: .01em;
  line-height: 1.35;
}
.swipe-gesture-tip button {
  min-height: 36px;
  border: 0;
  border-radius: 8px;
  padding: .25rem .3rem;
  background: transparent;
  color: #7d4427;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: .2em;
  cursor: pointer;
}

.swipe-area-wrap {
  position: relative;
}
.swipe-undo-toast {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px 8px 14px;
  border-radius: 16px;
  background: rgba(54, 34, 24, 0.94);
  color: #fff8ef;
  box-shadow: 0 10px 26px -8px rgba(34, 20, 12, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: .84rem;
  font-weight: 600;
}
.swipe-undo-toast[hidden] {
  display: none !important;
}
.swipe-undo-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.swipe-undo-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 11px;
  background: #f4a261;
  color: #361e10;
  font-size: .82rem;
  font-weight: 800;
  transition: background-color 150ms ease, transform 140ms ease;
}
.swipe-undo-btn:hover {
  background: #f7b37b;
}
.swipe-undo-btn:active {
  transform: scale(0.96);
}
.swipe-undo-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.swipe-hint {
  margin-top: .65rem !important;
  text-align: center;
  font-size: .76rem;
  color: var(--deck-muted);
}

.swipe-empty {
  display: grid;
  place-content: center;
  gap: .75rem;
  text-align: center;
  min-height: 18rem;
  padding: 1.8rem;
  border-radius: 28px;
  border: 1px solid var(--deck-border);
  background: var(--deck-paper);
  box-shadow: 0 8px 24px rgba(112, 78, 55, .07);
}
.swipe-empty h2 {
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.3rem;
}
.swipe-empty p {
  color: var(--deck-muted);
  font-size: .9rem;
  line-height: 1.55;
}
.swipe-empty .swipe-chip {
  justify-self: center;
  background: #ffecd7;
  border-color: #efcca9;
  color: #7d3819;
  padding: .5rem 1.2rem;
}
.swipe-visually-hidden {
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 350px) {
  .swipe-chip { padding-inline: .6rem; }
}
@media (prefers-reduced-motion: reduce) {
  .swipe-card[data-exit], .swipe-card[data-returning='true'] { transition: none; }
}
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

function iconPill(svgHtml, text, className, onClick) {
  const node = button('', className, onClick);
  const iconWrap = el('span');
  iconWrap.innerHTML = svgHtml;
  const svg = iconWrap.firstElementChild;
  if (svg) node.append(svg);
  node.append(el('span', '', text));
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

export function mountSwipe(root, { api, openProfile, isSaved, toggleSaved, onGuide, onShare, initialRoute = {} }) {
  const scope = el('section', 'swipe-screen');
  scope.setAttribute('aria-label', '滑動探索領養');
  const css = el('style', '', style);

  const heading = el('header', 'swipe-heading');
  const titleBlock = el('div');
  titleBlock.append(el('h1', '', '探索'));

  const searchLabel = el('label', 'swipe-search');
  const search = document.createElement('input');
  const centreBar = el('div', 'swipe-centre');
  const centreLabel = el('strong', 'swipe-centre-name', '所選領養中心');
  const ageFilter = el('select');
  ageFilter.setAttribute('aria-label', '按年齡篩選中心檔案');
  for (const [value, label] of [['', '所有年齡'], ['young', '幼年'], ['adult', '成年'], ['senior', '高齡'], ['group', '成對／多隻'], ['unknown', '年齡未明或跨組']]) {
    ageFilter.add(new Option(label, value));
  }
  const clearCentre = el('a', '', '移除中心篩選');
  clearCentre.href = '#discover';
  centreBar.append(centreLabel, ageFilter, clearCentre);
  const filterBar = el('div', 'swipe-filterbar');
  const filters = el('div', 'swipe-filters');
  const progress = el('span', 'swipe-progress');
  const areaWrap = el('div', 'swipe-area-wrap');
  const area = el('div');
  const undoToast = el('div', 'swipe-undo-toast');
  undoToast.setAttribute('role', 'status');
  undoToast.hidden = true;
  const undoText = el('span', 'swipe-undo-text', '');
  const undoBtn = iconPill(ICONS.undo, '復原', 'swipe-undo-btn', () => undoSkip());
  undoToast.append(undoText, undoBtn);
  areaWrap.append(area, undoToast);

  const gestureTip = el('div', 'swipe-gesture-tip');
  gestureTip.setAttribute('role', 'group');
  gestureTip.setAttribute('aria-label', '卡片操作');
  const skipButton = button('← 左滑略過', '', () => move('left', area.querySelector('.swipe-card')));
  const saveButton = button('右滑收藏 →', '', () => move('right', area.querySelector('.swipe-card')));
  gestureTip.append(skipButton, '·', saveButton, '·', el('span', '', '點卡片看檔案'));
  const announced = el('div', 'swipe-visually-hidden');

  announced.setAttribute('aria-live', 'polite');
  progress.setAttribute('aria-live', 'polite');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', '按物種篩選');

  search.type = 'search';
  search.maxLength = 100;
  search.placeholder = '搜尋名字、機構或地區';
  search.autocomplete = 'off';
  searchLabel.append(el('span', 'swipe-visually-hidden', search.placeholder), search);
  searchLabel.hidden = true;

  const searchToggle = iconPill(ICONS.search, '搜尋', 'swipe-pill-btn', () => {
    searchLabel.hidden = !searchLabel.hidden;
    searchToggle.setAttribute('aria-expanded', String(!searchLabel.hidden));
    if (!searchLabel.hidden) search.focus();
  });
  searchToggle.setAttribute('aria-expanded', 'false');

  const headingActions = el('div', 'swipe-heading-actions');
  if (onGuide) {
    const guide = iconPill(ICONS.guide, '流程', 'swipe-pill-btn', onGuide);
    guide.setAttribute('aria-label', '領養流程指南');
    headingActions.append(guide);
  }
  headingActions.append(searchToggle);
  heading.append(titleBlock, headingActions);

  filterBar.append(filters, progress);
  scope.append(heading, centreBar, searchLabel, filterBar, areaWrap, gestureTip, announced);
  root.replaceChildren(css, scope);

  let species = '', query = '', currentPage = 0, total = 0, nextIndex = 0;
  let items = [], skippedStack = [], busy = false, disposed = false, requestId = 0, error = null;
  let animating = false, saving = null, searchTimer, timer, undoTimer;
  let routeCentre = '', routeSpecies = '';
  let plainSettings = { species: '', query: '', searchOpen: false };

  function hideUndoToast() {
    clearTimeout(undoTimer);
    undoToast.hidden = true;
  }

  function showUndoToast(item) {
    clearTimeout(undoTimer);
    undoText.textContent = `已略過 ${item.name}`;
    undoBtn.setAttribute('aria-label', `復原已略過的 ${item.name}`);
    undoToast.hidden = false;
    undoTimer = setTimeout(() => {
      undoToast.hidden = true;
    }, 6000);
  }

  function undoSkip() {
    if (animating || saving || !skippedStack.length) return;
    const refocus = document.activeElement === undoBtn;
    const last = skippedStack.pop();
    hideUndoToast();
    nextIndex = last.index;
    announced.textContent = `已復原 ${last.item.name}`;
    render();
    if (refocus) area.querySelector('.swipe-hit')?.focus({ preventScroll: true });
  }

  const chips = new Map();
  for (const [value, label] of SPECIES) {
    const isSpeciesIcon = value === 'cat' || value === 'dog';
    const chip = button(isSpeciesIcon ? '' : label, isSpeciesIcon ? 'swipe-chip is-icon' : 'swipe-chip', () => {
      if (species === value) return;
      species = value;
      chips.forEach((c, choice) => c.setAttribute('aria-pressed', String(choice === value)));
      start(true);
    });
    if (isSpeciesIcon) {
      chip.innerHTML = ICONS[value];
      chip.setAttribute('aria-label', label);
      chip.title = label;
    }
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
  ageFilter.addEventListener('change', () => start());

  function setRoute(route = {}, first = false) {
    const centre = route.centreId || '';
    const selected = ['cat', 'dog'].includes(route.species) ? route.species : '';
    if (!first && centre === routeCentre && selected === routeSpecies) return;
    if (centre && !routeCentre) {
      plainSettings = { species, query: search.value.trim(), searchOpen: !searchLabel.hidden };
    }
    clearTimeout(searchTimer);
    routeCentre = centre;
    routeSpecies = selected;
    species = selected || (centre ? '' : plainSettings.species);
    query = centre ? '' : plainSettings.query;
    search.value = query;
    searchLabel.hidden = centre ? true : !plainSettings.searchOpen;
    searchToggle.setAttribute('aria-expanded', String(!searchLabel.hidden));
    ageFilter.value = '';
    centreBar.hidden = !centre;
    centreLabel.textContent = '所選領養中心';
    chips.forEach((chip, choice) => chip.setAttribute('aria-pressed', String(choice === species)));
    start();
  }

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
    skippedStack = [];
    hideUndoToast();
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
      const data = await api.get('/api/listings', {
        species,
        centre_id: routeCentre,
        age_key: ageFilter.value,
        q: query,
        status: 'listed',
        page: requestedPage,
        page_size: PAGE_SIZE,
      });
      if (disposed || active !== requestId) return;
      currentPage = requestedPage;
      total = data.total;
      items.push(...data.items);
      if (routeCentre && data.items[0]?.centre_name) centreLabel.textContent = data.items[0].centre_name;
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
    const departedIndex = nextIndex;
    announced.textContent = direction === 'right' ? `已收藏 ${item.name}` : `已略過 ${item.name}`;
    if (direction === 'left') {
      skippedStack.push({ index: departedIndex, item });
    } else {
      hideUndoToast();
    }
    card.dataset.exit = direction;
    card.style.transform = `translateX(${direction === 'right' ? '110%' : '-110%'}) rotate(${direction === 'right' ? 14 : -14}deg)`;
    const active = requestId;
    timer = setTimeout(() => {
      if (disposed || active !== requestId) return;
      animating = false;
      nextIndex += 1;
      if (nextIndex === items.length && nextIndex < total) load();
      else render();
      if (direction === 'left') showUndoToast(item);
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  }

  function returnCard(card) {
    card.dataset.returning = 'true';
    card.style.transform = '';
    const r = card.querySelector('.swipe-reaction');
    if (r) r.style.opacity = '0';
  }

  function syncSavedBadge(item, card) {
    const badge = card?.querySelector('.pet-saved-tag');
    if (badge) badge.hidden = !isSaved(item.id);
  }

  async function changeSaved(item, card) {
    if (animating || saving) return;
    const active = { request: requestId, index: nextIndex };
    saving = active;
    returnCard(card);
    let result = null;
    try {
      result = await toggleSaved(item);
    } catch {
      if (saving === active) announced.textContent = '暫時未能更新收藏。';
    } finally {
      if (saving === active) saving = null;
    }
    if (disposed || active.request !== requestId || active.index !== nextIndex) return;
    if (result === true) depart('right', item, card);
    else {
      if (result === false) announced.textContent = `已取消收藏 ${item.name}`;
      syncSavedBadge(item, card);
    }
  }

  function move(direction, card) {
    const item = items[nextIndex];
    if (animating || !item || !card) return;
    if (saving) {
      returnCard(card);
      return;
    }
    if (direction === 'right' && !isSaved(item.id)) changeSaved(item, card);
    else depart(direction, item, card);
  }

  function cardFor(item) {
    const deck = el('div', 'swipe-stage');
    const card = el('article', 'swipe-card');

    let ignoredClick = false;
    const hit = button('', 'swipe-hit', event => {
      if (animating || saving || (event.detail && ignoredClick)) return;
      openProfile(item.id);
    });
    hit.setAttribute('aria-label', `查看 ${item.name} 的完整檔案，左方向鍵略過，右方向鍵收藏`);
    hit.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move('left', card);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move('right', card);
      }
    });

    const photoBox = el('div', 'pet-photo');
    const savedTag = el('span', 'pet-saved-tag');
    savedTag.innerHTML = `${ICONS.bookmark}<span>已收藏</span>`;
    savedTag.hidden = !isSaved(item.id);
    photoBox.append(savedTag);
    const cover = el('div', 'swipe-cover');
    const pawHolder = el('span');
    pawHolder.innerHTML = ICONS.paw;
    cover.append(pawHolder, el('span', '', '暫無機構相片'));

    const photo = safePhoto(item.photo_url);
    if (photo) {
      const image = el('img', 'swipe-portrait');
      image.alt = `${item.name} 的待領養相片`;
      image.draggable = false;
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('load', () => cover.classList.add('swipe-image-ready'), { once: true });
      image.addEventListener('error', () => image.remove(), { once: true });
      image.src = photo;
      photoBox.append(image);
    }

    photoBox.append(cover, el('div', 'photo-scrim'));

    if (onShare) {
      const shareBtn = iconPill(ICONS.share, '分享', 'pet-share-btn', event => {
        event.stopPropagation();
        if (animating || saving) return;
        onShare(item);
      });
      shareBtn.setAttribute('aria-label', `分享 ${item.name} 的資料卡`);
      photoBox.append(shareBtn);
    }

    const details = el('div', 'pet-details');
    const titleRow = el('div', 'pet-title-row');
    const titleMain = el('div', 'pet-title-main');
    const metaText = [item.age_label, item.breed].filter(Boolean).join(' · ');
    titleMain.append(el('h2', '', item.name));
    if (item.species === 'cat' || item.species === 'dog' || metaText) {
      const metaLine = el('p', 'pet-meta-line');
      if (item.species === 'cat' || item.species === 'dog') {
        const iconSpan = el('span', `pet-species-icon is-${item.species}`);
        iconSpan.innerHTML = ICONS[item.species];
        iconSpan.setAttribute('aria-label', item.species === 'cat' ? '貓咪' : '狗狗');
        metaLine.append(iconSpan);
      }
      if (metaText) metaLine.append(el('span', '', metaText));
      titleMain.append(metaLine);
    }
    titleRow.append(titleMain);

    if (item.sex_key === 'male' || item.sex_key === 'female') {
      const isMale = item.sex_key === 'male';
      const sexBadge = el('span', `sex-badge ${isMale ? 'sex-male' : 'sex-female'}`, isMale ? '♂' : '♀');
      sexBadge.setAttribute('aria-label', isMale ? '雄性' : '雌性');
      titleRow.append(sexBadge);
    }
    details.append(titleRow);

    const orgLine = [item.organisation, item.centre_name].filter(Boolean);
    const uniqueOrg = orgLine.length === 2 && orgLine[1].includes(orgLine[0]) ? [orgLine[1]] : orgLine;
    if (uniqueOrg.length) {
      details.append(el('p', 'pet-org-line', uniqueOrg.join(' · ')));
    }

    if (item.description) {
      details.append(el('p', 'pet-excerpt', item.description));
    }

    const reaction = el('div', 'swipe-reaction');
    reaction.setAttribute('aria-hidden', 'true');

    card.append(photoBox, details, hit, reaction);

    const stack = el('div', 'swipe-stack');
    stack.setAttribute('aria-hidden', 'true');
    const following = safePhoto(items[nextIndex + 1]?.photo_url);
    if (following) {
      const image = document.createElement('img');
      image.alt = '';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => image.remove(), { once: true });
      image.src = following;
      stack.append(image);
    }
    deck.append(stack, card);

    let gesture = null;
    card.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || animating || saving) return;
      if (event.target instanceof Element && event.target.closest('.pet-share-btn')) return;
      ignoredClick = false;
      card.dataset.returning = 'false';
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false };
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
      card.style.transform = `translate(${x}px, ${y * 0.16}px) rotate(${Math.max(-16, Math.min(16, x / 13))}deg)`;
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
    card.addEventListener('pointerleave', () => {
      if (gesture && !gesture.active) gesture = null;
    });
    return { card, deck };
  }

  function render() {
    const item = items[nextIndex];
    const refocus = document.activeElement.classList.contains('swipe-hit') && area.contains(document.activeElement);
    progress.textContent = item
      ? `${number.format(nextIndex + 1)} / ${number.format(total)}`
      : '';
    progress.hidden = !progress.textContent;
    gestureTip.hidden = !item;
    if (item) {
      skipButton.setAttribute('aria-label', `略過 ${item.name}`);
      saveButton.setAttribute('aria-label', `收藏並看下一則，${item.name}`);
      const { deck } = cardFor(item);
      area.replaceChildren(deck);
      if (refocus) deck.querySelector('.swipe-hit').focus({ preventScroll: true });
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
      empty.append(el('h2', '', '這個類別暫無領養檔案'), el('p', '', '目前名錄收錄貓咪和狗狗。'),
        button('查看全部', 'swipe-chip', () => chips.get('').click()));
    } else {
      empty.append(el('h2', '', '找不到符合條件的檔案'), el('p', '', '可調整篩選或搜尋其他名字、機構或地區。'));
      if (query) empty.append(button('清除搜尋', 'swipe-chip', () => {
        search.value = query = '';
        start();
      }));
    }
    area.replaceChildren(empty);
    if (refocus) empty.querySelector('button')?.focus({ preventScroll: true });
  }

  setRoute(initialRoute, true);
  return {
    setRoute,
    refreshSaved() {
      const card = area.querySelector('.swipe-card');
      if (!animating && !saving && card && items[nextIndex]) syncSavedBadge(items[nextIndex], card);
    },
    destroy() {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(searchTimer);
      clearTimeout(undoTimer);
    },
  };
}
