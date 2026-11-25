import qrCode from './qr.js';

const SPECIES = { cat: '貓咪', dog: '狗狗', other: '其他動物' };
const HISTORY_KEY = 'waitingForHomePetAction';
const PREPARATION = [
  '已預留日常糧食及突發醫療開支',
  '已安排外遊或離家時的照顧',
  '能接受清潔、抓咬與作息調整',
  '已備妥窗網防護並獲家人／業主同意',
];

const PAW_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="15.3" rx="5.2" ry="4.3"/><ellipse cx="5.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="18.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="9.2" cy="5.7" rx="2" ry="2.6"/><ellipse cx="14.8" cy="5.7" rx="2" ry="2.6"/></svg>`;

const STYLES = `
.pet-action-sheet {
  width: min(100%, 480px);
  max-width: none;
  max-height: min(92dvh, 800px);
  box-sizing: border-box;
  margin: 0 auto;
  inset: auto 0 0;
  position: fixed;
  border: 1px solid rgba(224, 126, 56, 0.22);
  border-bottom: 0;
  border-radius: 30px 30px 0 0;
  background: #fff8ec;
  color: #4a3b32;
  padding: 0;
  box-shadow: 0 -18px 56px rgba(52, 28, 16, 0.28);
  overscroll-behavior: contain;
}
.pet-action-sheet::before {
  content: '';
  display: block;
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: #dfc3a6;
  margin: 10px auto 0;
}
.pet-action-sheet::backdrop {
  background: rgba(46, 29, 20, 0.54);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.pet-action-sheet * { box-sizing: border-box; }
.pet-action-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 20px 12px;
  border-bottom: 1px solid rgba(224, 126, 56, 0.16);
}
.pet-action-head h2 {
  margin: 0;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.18rem;
  font-weight: 900;
}
.pet-action-dismiss {
  display: grid;
  place-items: center;
  cursor: pointer;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(224, 126, 56, 0.22);
  border-radius: 50%;
  background: #ffffff;
  color: #54392c;
  font-size: 1.35rem;
  transition: background-color 160ms ease, transform 140ms ease;
}
.pet-action-dismiss:hover { background: #fde6cf; }
.pet-action-dismiss:active { transform: scale(0.95); }
.pet-action-body { padding: 16px 20px max(24px, env(safe-area-inset-bottom, 0px)); }
.pet-action-note { color: #766255; font-size: .86rem; line-height: 1.55; margin: 0 0 12px; }

/* Figma Make Share Poster Card */
.pet-share-poster {
  position: relative;
  margin: 0 0 14px;
  padding: 18px;
  background:
    radial-gradient(circle at 50% -20%, rgba(244, 162, 97, 0.34), transparent 14rem),
    linear-gradient(165deg, #fff5e5 0%, #fde8cc 100%);
  border: 1px solid rgba(214, 112, 42, 0.24);
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 12px 28px -10px rgba(92, 58, 36, 0.18);
}
.poster-brand-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: .06em;
  color: #b45a20;
  margin: 0 0 12px;
}
.poster-brand-row svg { width: 15px; height: 15px; color: #e07630; }

.pet-share-photo-wrap {
  width: 100%;
  height: clamp(160px, 24dvh, 215px);
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(145deg, #f6dfc6, #eab98f);
  position: relative;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px -8px rgba(74, 43, 24, 0.2);
}
.pet-share-photo-wrap svg { width: 44px; height: 44px; color: rgba(156, 66, 31, 0.32); }
.pet-share-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 36%;
  display: block;
}

.pet-share-details {
  margin-top: 14px;
  padding: 13px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(224, 126, 56, 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.pet-share-meta { min-width: 0; }
.poster-kicker {
  margin: 0 0 3px !important;
  font-size: .7rem !important;
  font-weight: 800;
  letter-spacing: .08em;
  color: #c66322 !important;
}
.pet-share-meta h3 {
  margin: 0 0 4px;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: clamp(1.35rem, 5.5vw, 1.7rem);
  font-weight: 900;
  color: #4a3b32;
  overflow-wrap: anywhere;
}
.pet-share-meta p {
  margin: 2px 0;
  font-size: .8rem;
  font-weight: 600;
  color: #766255;
  overflow-wrap: anywhere;
}
.pet-share-qr {
  display: block;
  width: min(30%, 104px);
  height: auto;
  flex: none;
  background: #fff;
  border-radius: 12px;
  image-rendering: pixelated;
  box-shadow: 0 4px 12px rgba(74, 43, 24, 0.1);
}

.pet-action-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.pet-action-button {
  min-height: 46px;
  padding: 8px 15px;
  border-radius: 16px;
  border: 1px solid rgba(214, 126, 62, 0.25);
  background: #ffffff;
  color: #5c3720;
  text-decoration: none;
  font: inherit;
  font-size: .88rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: background-color 160ms ease, transform 140ms ease, box-shadow 160ms ease;
}
.pet-action-button:hover { background: #fff3e2; }
.pet-action-button:active { transform: scale(0.97); }
.pet-action-button.primary {
  background: linear-gradient(135deg, #e27832 0%, #c8581d 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 10px 22px -6px rgba(200, 88, 29, 0.4);
}
.pet-action-button.primary:hover {
  background: linear-gradient(135deg, #e8803b 0%, #cf5f23 100%);
}
.pet-action-button.primary:disabled {
  cursor: default;
  background: #e9ded3;
  border-color: #e9ded3;
  color: #705a4b;
  box-shadow: none;
}
.pet-action-button.wide { display: flex; width: 100%; margin-top: 14px; min-height: 50px; }
.pet-action-feedback { margin: 10px 0 0; min-height: 1.3em; color: #9c421f; font-size: .86rem; font-weight: 700; }
.pet-share-fallback {
  width: 100%;
  margin: 8px 0 0;
  padding: 9px 12px;
  border: 1px solid rgba(214, 126, 62, 0.28);
  border-radius: 12px;
  background: white;
  color: #4a3b32;
  font: inherit;
  font-size: .86rem;
}

.pet-apply-progress {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: .84rem;
  font-weight: 700;
  color: #766255;
  padding: 6px 0 11px;
  font-variant-numeric: tabular-nums;
}
.pet-apply-progress progress { flex: 1; min-width: 50px; height: 8px; accent-color: #d66a24; }
.pet-apply-check {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 13px 14px;
  min-height: 54px;
  margin: 8px 0;
  border: 1px solid rgba(214, 126, 62, 0.2);
  border-radius: 18px;
  background: #ffffff;
  line-height: 1.44;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}
.pet-apply-check:hover { background: #fff8ed; }
.pet-apply-check input { width: 20px; height: 20px; margin: 0; flex: none; accent-color: #b8521b; }
.pet-apply-check:has(input:checked) { border-color: #d66a24; background: #ffebd6; color: #5c2d12; }
`;

let activeSheet;
let pendingApplication;
let sheetSequence = 0;

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, variant, onClick) {
  const control = makeElement('button', `pet-action-button ${variant}`.trim(), text);
  control.type = 'button';
  control.addEventListener('click', onClick);
  return control;
}

function safeUrl(value, media = false) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = media ? new URL(value, location.origin) : new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (media && (url.origin !== location.origin || !url.pathname.startsWith('/media/'))) return null;
    return url.href;
  } catch {
    return null;
  }
}

function makeSheet(title) {
  if (!document.getElementById('pet-action-styles')) {
    const style = makeElement('style', '', STYLES);
    style.id = 'pet-action-styles';
    document.head.append(style);
  }
  const previousFocus = document.activeElement;
  activeSheet?.close();
  const dialog = makeElement('dialog', 'pet-action-sheet');
  let entry = `${Date.now()}-${++sheetSequence}`;
  try {
    const prior = history.state;
    const next = { ...prior, [HISTORY_KEY]: entry };
    if (prior?.[HISTORY_KEY]) history.replaceState(next, '');
    else history.pushState(next, '');
  } catch {
    entry = null;
  }
  let returning = false;
  const onPopState = event => {
    if (event.state?.[HISTORY_KEY] !== entry) dialog.close();
  };
  function dismiss() {
    if (!entry || history.state?.[HISTORY_KEY] !== entry) {
      dialog.close();
      return;
    }
    if (!returning) {
      returning = true;
      history.back();
    }
  }
  const heading = makeElement('h2', '', title);
  heading.id = 'pet-action-title';
  dialog.setAttribute('aria-labelledby', heading.id);
  const close = makeElement('button', 'pet-action-dismiss', '×');
  close.type = 'button';
  close.setAttribute('aria-label', '關閉');
  close.autofocus = true;
  close.addEventListener('click', dismiss);
  const header = makeElement('header', 'pet-action-head');
  const body = makeElement('div', 'pet-action-body');
  header.append(heading, close);
  dialog.append(header, body);
  if (entry) window.addEventListener('popstate', onPopState);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dismiss();
  });
  dialog.addEventListener(
    'close',
    () => {
      window.removeEventListener('popstate', onPopState);
      dialog.remove();
      if (activeSheet === dialog) {
        activeSheet = null;
        if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
      }
    },
    { once: true },
  );
  document.body.append(dialog);
  activeSheet = dialog;
  return { dialog, body, dismiss };
}

function qrCanvas(url, cellSize = 5) {
  const matrix = qrCode(0, 'M');
  matrix.addData(url);
  matrix.make();
  const blocks = matrix.getModuleCount();
  const canvas = makeElement('canvas', 'pet-share-qr');
  canvas.width = (blocks + 8) * cellSize;
  canvas.height = canvas.width;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '掃描 QR Code 開啟動物檔案');
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#4a3b32';
  for (let y = 0; y < blocks; y += 1) {
    for (let x = 0; x < blocks; x += 1) {
      if (matrix.isDark(y, x)) {
        context.fillRect((x + 4) * cellSize, (y + 4) * cellSize, cellSize, cellSize);
      }
    }
  }
  return canvas;
}

async function copyUrl(url, feedback, manual) {
  try {
    await navigator.clipboard.writeText(url);
    manual.hidden = true;
    feedback.textContent = '已複製連結。';
  } catch {
    manual.value = url;
    manual.hidden = false;
    manual.focus();
    manual.select();
    feedback.textContent = '可手動複製下方連結。';
  }
}

function drawPhoto(context, photo, width, height) {
  if (!photo?.naturalWidth) return;
  const ratio = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const cropWidth = width / ratio;
  const cropHeight = height / ratio;
  context.drawImage(
    photo,
    (photo.naturalWidth - cropWidth) / 2,
    (photo.naturalHeight - cropHeight) / 2,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );
}

async function savePoster({ name, facts, organisation, photo, code }, feedback) {
  try {
    if (photo && !photo.complete) await photo.decode().catch(() => {});
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    const photoHeight = photo?.complete && photo.naturalWidth ? 540 : 0;
    canvas.height = photoHeight + 330;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff3e0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (photoHeight) drawPhoto(context, photo, canvas.width, photoHeight);
    context.drawImage(code, 624, photoHeight + 40, 240, 240);
    context.fillStyle = '#c8581d';
    context.font = '700 26px sans-serif';
    context.fillText('等一個家 · 動物專屬資料卡', 36, photoHeight + 66, 560);
    context.fillStyle = '#4a3b32';
    context.font = '900 54px sans-serif';
    context.fillText(name, 36, photoHeight + 140, 560);
    context.fillStyle = '#766255';
    context.font = '600 32px sans-serif';
    if (facts) context.fillText(facts, 36, photoHeight + 202, 560);
    if (organisation) context.fillText(organisation, 36, photoHeight + 254, 560);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('poster export');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const filename = name.replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 50) || '動物';
    anchor.download = `等一個家-${filename}.png`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = '已開始下載海報。';
  } catch {
    feedback.textContent = '暫時無法儲存海報，你仍可複製下方檔案連結。';
  }
}

export function openShare(item) {
  if (typeof item?.id !== 'string' || !/^listing_[\w-]{1,200}$/.test(item.id)) return false;
  const demoUrl = new URL('/', location.origin);
  demoUrl.hash = `animal=${encodeURIComponent(item.id)}`;
  const name = item.name || '名稱未公佈';
  const facts = [SPECIES[item.species], item.age_label, item.breed].filter(Boolean).join(' · ');
  const agency = item.organisation || '';
  const original = safeUrl(item.source_url) || safeUrl(item.official_action_url);
  const imageUrl =
    safeUrl(item.photo_url, true) || (item.photos || []).map(p => safeUrl(p.url, true)).find(Boolean);
  const onThisDevice = /^(?:localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(location.hostname);
  const code = qrCanvas(onThisDevice && original ? original : demoUrl.href);

  const { dialog, body } = makeSheet('分享資料卡');
  const poster = makeElement('div', 'pet-share-poster');

  const brand = makeElement('p', 'poster-brand-row');
  const pawHolder = makeElement('span');
  pawHolder.innerHTML = PAW_SVG;
  brand.append(pawHolder.firstElementChild, document.createTextNode('等一個家'));
  poster.append(brand);

  const photoWrap = makeElement('div', 'pet-share-photo-wrap');
  const fallbackPaw = makeElement('span');
  fallbackPaw.innerHTML = PAW_SVG;
  photoWrap.append(fallbackPaw.firstElementChild);

  let photo;
  if (imageUrl) {
    photo = makeElement('img', 'pet-share-photo');
    photo.alt = `${name} 的機構照片`;
    photo.referrerPolicy = 'no-referrer';
    photo.addEventListener('error', () => {
      photo.hidden = true;
    }, { once: true });
    photo.src = imageUrl;
    photoWrap.append(photo);
  }
  poster.append(photoWrap);

  const details = makeElement('div', 'pet-share-details');
  const meta = makeElement('div', 'pet-share-meta');
  meta.append(makeElement('h3', '', name));
  for (const field of [facts, agency]) {
    if (field) meta.append(makeElement('p', '', field));
  }
  details.append(meta, code);
  poster.append(details);

  const actions = makeElement('div', 'pet-action-buttons');
  const feedback = makeElement('p', 'pet-action-feedback');
  feedback.setAttribute('role', 'status');
  const manual = makeElement('input', 'pet-share-fallback');
  manual.hidden = true;
  manual.readOnly = true;
  manual.setAttribute('aria-label', '可手動複製的連結');

  actions.append(
    button('複製連結', 'primary', () => copyUrl(demoUrl.href, feedback, manual)),
    button('下載海報', '', () => savePoster({ name, facts, organisation: agency, photo, code }, feedback)),
  );
  if (original) {
    actions.append(button('官網連結', '', () => copyUrl(original, feedback, manual)));
  }

  body.append(poster, actions, feedback, manual);
  dialog.showModal();
  return true;
}

function showChecklist(item, official) {
  const { dialog, body, dismiss } = makeSheet('申請前確認');
  const name = item.name || '這隻動物';
  body.append(makeElement('p', 'pet-action-note', `前往官網了解 ${name} 前，請確認：`));
  const progressWrap = makeElement('div', 'pet-apply-progress');
  const progress = makeElement('progress');
  progress.max = PREPARATION.length;
  progress.setAttribute('aria-label', '領養準備確認進度');
  const count = makeElement('span');
  count.setAttribute('aria-live', 'polite');
  progressWrap.append(progress, count);
  body.append(progressWrap);

  const choices = PREPARATION.map(text => {
    const label = makeElement('label', 'pet-apply-check');
    const input = document.createElement('input');
    input.type = 'checkbox';
    label.append(input, makeElement('span', '', text));
    body.append(label);
    return input;
  });

  const confirm = button('確認並前往機構官網 ↗', 'primary wide', () => {
    if (confirm.disabled) return;
    const out = document.createElement('a');
    out.href = official;
    out.target = '_blank';
    out.rel = 'noopener noreferrer';
    out.click();
    dismiss();
  });

  function update() {
    const completed = choices.filter(input => input.checked).length;
    progress.value = completed;
    count.textContent = `${completed} / ${PREPARATION.length} 項已確認`;
    confirm.disabled = completed !== PREPARATION.length;
  }
  for (const choice of choices) choice.addEventListener('change', update);
  update();
  body.append(confirm);
  dialog.showModal();
  return true;
}

export async function startApplication(item, { requireUser, requireQuestionnaire } = {}) {
  const official = safeUrl(item?.official_action_url) || safeUrl(item?.source_url);
  if (!official || !['listed', 'foster_option'].includes(item?.status) || !requireUser || !requireQuestionnaire) {
    return false;
  }
  if (pendingApplication) return false;
  pendingApplication = true;
  try {
    if (!(await requireUser('申請領養'))) return false;
    if (!(await requireQuestionnaire())) return false;
    return showChecklist(item, official);
  } finally {
    pendingApplication = false;
  }
}
