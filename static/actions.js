import qrCode from './qr.js';

const SPECIES = {cat: '貓', dog: '狗', other: '其他動物'};
const HISTORY_KEY = 'waitingForHomePetAction';
const PREPARATION = [
  '我已預留糧食、日用品及獸醫費用，也能應付突發開支。',
  '我已安排出差或旅行期間的照顧。',
  '我能接受抓咬家具、清潔和作息調整。',
  '我已做好居家防護（例如安裝窗網），並取得家人及適用時房東的同意。',
];

const STYLES = `
.pet-action-sheet { width: min(100%, 460px); max-width: none; max-height: min(90dvh, 760px); box-sizing: border-box; margin: 0 auto; inset: auto 0 0; position: fixed; border: 1px solid #ecd8c2; border-bottom: 0; border-radius: 25px 25px 0 0; background: #fffaf1; color: #422b21; padding: 0; box-shadow: 0 -12px 48px #44241830; overscroll-behavior: contain; }
.pet-action-sheet::backdrop { background: #29181170; }
.pet-action-sheet * { box-sizing: border-box; }
.pet-action-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 18px 12px; border-bottom: 1px solid #efdecb; }
.pet-action-head h2 { margin: 0; font-size: 1.18rem; }
.pet-action-dismiss { display: grid; place-items: center; cursor: pointer; width: 44px; height: 44px; padding: 0; border: 1px solid #edd8c2; border-radius: 50%; background: #fff5e7; color: #54392c; font-size: 1.45rem; }
.pet-action-body { padding: 15px 18px max(20px, env(safe-area-inset-bottom, 0px)); }
.pet-action-note { color: #734f3f; font-size: .9rem; line-height: 1.5; margin: 0 0 12px; }
.pet-share-poster { margin: 0 0 13px; background: #fff3e2; border: 1px solid #ecd8c2; border-radius: 18px; overflow: hidden; }
.pet-share-photo { width: 100%; height: clamp(130px, 22dvh, 196px); object-fit: cover; object-position: center 43%; display: block; background: #f4dcc4; }
.pet-share-details { display: flex; align-items: center; justify-content: space-between; gap: 9px; padding: 13px; }
.pet-share-meta { min-width: 0; }
.pet-share-meta h3 { margin: 0 0 5px; font-size: clamp(1.35rem, 6vw, 1.86rem); overflow-wrap: anywhere; }
.pet-share-meta p { margin: 2px 0; font-size: .83rem; color: #795743; overflow-wrap: anywhere; }
.pet-share-qr { display: block; width: min(33%, 121px); height: auto; flex: none; background: #fff; border-radius: 3px; image-rendering: pixelated; }
.pet-action-buttons { display: flex; flex-wrap: wrap; gap: 7px; }
.pet-action-button { min-height: 44px; padding: 8px 12px; border-radius: 13px; border: 1px solid #e9c5a4; background: #fff4e5; color: #653719; text-decoration: none; font: inherit; font-size: .9rem; font-weight: 780; display: inline-flex; align-items: center; justify-content: center; text-align: center; cursor: pointer; }
.pet-action-button:hover { background: #ffead3; }
.pet-action-button.primary { background: #f4a261; border-color: #e99c60; color: #422b21; }
.pet-action-button.primary:hover { background: #f8b27b; }
.pet-action-button.primary:disabled { cursor: default; background: #e9ded3; border-color: #e9ded3; color: #705a4b; }
.pet-action-button.wide { display: flex; width: 100%; margin-top: 13px; }
.pet-action-feedback { margin: 9px 0 0; min-height: 1.3em; color: #744b38; font-size: .88rem; }
.pet-share-fallback { width: 100%; margin: 8px 0 0; padding: 8px; border: 1px solid #e6c9ae; border-radius: 7px; background: white; color: #422b21; font: inherit; font-size: .88rem; }
.pet-apply-progress { display: flex; gap: 10px; align-items: center; font-size: .86rem; color: #734f3f; padding: 7px 0 10px; }
.pet-apply-progress progress { flex: 1; min-width: 50px; accent-color: #a04423; }
.pet-apply-check { display: flex; gap: 10px; align-items: center; padding: 11px; min-height: 49px; margin: 6px 0; border: 1px solid #ecd8c2; border-radius: 12px; background: #fff7ea; line-height: 1.35; font-size: .92rem; cursor: pointer; }
.pet-apply-check input { width: 20px; height: 20px; margin: 0; flex: none; accent-color: #a04423; }
.pet-apply-check:has(input:checked) { border-color: #d9a77e; background: #ffedda; }
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
  const control = makeElement('button', `pet-action-button ${variant}`, text);
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
  } catch { return null; }
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
    const next = {...prior, [HISTORY_KEY]: entry};
    if (prior?.[HISTORY_KEY]) history.replaceState(next, '');
    else history.pushState(next, '');
  } catch { entry = null; }
  let returning = false;
  const onPopState = event => {
    if (event.state?.[HISTORY_KEY] !== entry) dialog.close();
  };
  function dismiss() {
    if (!entry || history.state?.[HISTORY_KEY] !== entry) { dialog.close(); return; }
    if (!returning) { returning = true; history.back(); }
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
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('close', () => {
    window.removeEventListener('popstate', onPopState);
    dialog.remove();
    if (activeSheet === dialog) {
      activeSheet = null;
      if (previousFocus?.isConnected) previousFocus.focus?.({preventScroll: true});
    }
  }, {once: true});
  document.body.append(dialog);
  activeSheet = dialog;
  return {dialog, body, dismiss};
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
  context.fillStyle = '#18201c';
  for (let y = 0; y < blocks; y += 1) {
    for (let x = 0; x < blocks; x += 1) {
      if (matrix.isDark(y, x)) context.fillRect((x + 4) * cellSize, (y + 4) * cellSize, cellSize, cellSize);
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
  context.drawImage(photo, (photo.naturalWidth - cropWidth) / 2, (photo.naturalHeight - cropHeight) / 2,
    cropWidth, cropHeight, 0, 0, width, height);
}

async function savePoster({name, facts, organisation, photo, code}, feedback) {
  try {
    if (photo && !photo.complete) await photo.decode().catch(() => {});
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    const photoHeight = photo?.complete && photo.naturalWidth ? 530 : 0;
    canvas.height = photoHeight + 324;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff3e2';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (photoHeight) drawPhoto(context, photo, canvas.width, photoHeight);
    context.drawImage(code, 624, photoHeight + 37, 244, 244);
    context.fillStyle = '#8a411f';
    context.font = '600 28px sans-serif';
    context.fillText('等一個家', 32, photoHeight + 61, 560);
    context.fillStyle = '#422b21';
    context.font = '700 54px sans-serif';
    context.fillText(name, 32, photoHeight + 134, 560);
    context.fillStyle = '#795743';
    context.font = '34px sans-serif';
    if (facts) context.fillText(facts, 32, photoHeight + 197, 560);
    if (organisation) context.fillText(organisation, 32, photoHeight + 250, 560);
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
    feedback.textContent = '暫時無法儲存海報。你仍可複製檔案連結。';
  }
}

export function openShare(item) {
  if (typeof item?.id !== 'string' || !/^listing_[\w-]{1,200}$/.test(item.id)) return false;
  const demoUrl = new URL('/', location.origin);
  demoUrl.hash = `animal=${encodeURIComponent(item.id)}`;
  const name = item.name || '名稱未公佈';
  const facts = [SPECIES[item.species], item.age_label].filter(Boolean).join(' · ');
  const agency = item.organisation || '';
  const original = safeUrl(item.source_url) || safeUrl(item.official_action_url);
  const imageUrl = safeUrl(item.photo_url, true) || (item.photos || []).map(photo => safeUrl(photo.url, true)).find(Boolean);
  const onThisDevice = /^(?:localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(location.hostname);
  const code = qrCanvas(onThisDevice && original ? original : demoUrl.href);
  const {dialog, body} = makeSheet('分享這則領養檔案');
  const poster = makeElement('div', 'pet-share-poster');
  let photo;
  if (imageUrl) {
    photo = makeElement('img', 'pet-share-photo');
    photo.alt = `${name} 的機構照片`;
    photo.addEventListener('error', () => { photo.hidden = true; }, {once: true});
    photo.src = imageUrl;
    poster.append(photo);
  }
  const details = makeElement('div', 'pet-share-details');
  const meta = makeElement('div', 'pet-share-meta');
  meta.append(makeElement('h3', '', name));
  for (const field of [facts, agency, item.status_label]) if (field) meta.append(makeElement('p', '', field));
  details.append(meta, code);
  poster.append(details);
  const actions = makeElement('div', 'pet-action-buttons');
  const feedback = makeElement('p', 'pet-action-feedback');
  feedback.setAttribute('role', 'status');
  const manual = makeElement('input', 'pet-share-fallback');
  manual.hidden = true;
  manual.readOnly = true;
  manual.setAttribute('aria-label', '可手動複製的連結');
  actions.append(button(onThisDevice ? '複製本機 Demo 連結' : '複製檔案連結', 'primary', () => copyUrl(demoUrl.href, feedback, manual)),
    button('儲存海報', '', () => savePoster({name, facts, organisation: agency, photo, code}, feedback)));
  if (original) actions.append(button('複製機構連結', '', () => copyUrl(original, feedback, manual)));
  if (onThisDevice) {
    body.append(makeElement('p', 'pet-action-note', original ? '海報 QR Code 開啟機構官網，可用另一部手機掃描。' : '海報 QR Code 開啟這部電腦的 Demo。'));
  }
  body.append(poster, actions, feedback, manual);
  dialog.showModal();
  return true;
}

function showChecklist(item, official) {
  const {dialog, body, dismiss} = makeSheet('申請領養前，請先確認');
  const name = item.name || '這隻動物';
  body.append(makeElement('p', 'pet-action-note', `想了解 ${name} 的領養安排？請確認以下準備，再前往機構。`));
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
  const confirm = button('確認並前往機構', 'primary wide', () => {
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

export async function startApplication(item, {requireUser, requireQuestionnaire} = {}) {
  const official = safeUrl(item?.official_action_url) || safeUrl(item?.source_url);
  if (!official || !['listed', 'foster_option'].includes(item?.status) || !requireUser || !requireQuestionnaire) return false;
  if (pendingApplication) return false;
  pendingApplication = true;
  try {
    if (!await requireUser('申請領養')) return false;
    if (!await requireQuestionnaire()) return false;
    return showChecklist(item, official);
  } finally { pendingApplication = false; }
}
