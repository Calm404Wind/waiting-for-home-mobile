import { mountSwipe } from './swipe.js';
import { mountInsights } from './insights.js';
import { openAnimal } from './profile.js';
import { createAccount } from './account.js';
import { openShare, startApplication } from './actions.js';
import { mountArticles, openGuide } from './learn.js';

const byId = id => document.getElementById(id);
const views = ['home', 'discover', 'insights', 'saved', 'privacy-policy'];
async function request(method, path, {params = {}, body} = {}) {
    const url = new URL(path, location.origin);
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined) url.searchParams.set(key, value);
    }
    const options = {method, cache: 'no-store'};
    if (body !== undefined) Object.assign(options, {headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
    const response = await fetch(url, options);
    let payload;
    try { payload = await response.json(); } catch { throw new Error('資料服務目前無法回應。'); }
    if (!response.ok) {
      const error = new Error(typeof payload.detail === 'string' ? payload.detail : '未能完成此項操作。');
      error.status = response.status;
      throw error;
    }
    return payload;
}

const api = {
  get: (path, params) => request('GET', path, {params}),
  post: (path, body) => request('POST', path, {body}),
  put: (path, body) => request('PUT', path, {body}),
  delete: path => request('DELETE', path),
};

const validId = id => typeof id === 'string' && /^listing_[\w-]{1,200}$/.test(id);
const photoUrl = path => typeof path === 'string' && /^\/media\/[\w-]+$/.test(path) ? path : null;
const newText = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};

let swipeView, installEvent, screen = '';
let matchesVersion = '', matchesRequest = 0;
const mounts = new Set();
const announcements = newText('div', '', 'app-sr-only');
announcements.setAttribute('aria-live', 'polite');
document.body.append(announcements);
const account = createAccount({api, onChange: refreshAccount, navigate: goTo});
const favorites = () => account.getUser()?.favorites || [];
const isSaved = id => favorites().some(item => item.id === id);
const isLiked = id => account.getUser()?.likes?.includes(id) ?? false;
const pending = new Set();

function refreshAccount() {
  byId('header-count').textContent = String(favorites().length);
  byId('header-count').hidden = favorites().length < 1;
  refreshSaved();
  swipeView?.refreshSaved();
  if (screen === 'saved') refreshMatches();
}

async function toggleRelation(item, collection, read, label) {
  if (!validId(item?.id)) return null;
  const key = `${collection}/${item.id}`;
  if (pending.has(key)) return null;
  pending.add(key);
  try {
    if (!await account.requireUser(label)) return null;
    const path = `/api/account/${key}`;
    const result = read(item.id) ? await api.delete(path) : await api.put(path);
    account.setUser(result.user);
    const selected = read(item.id);
    announcements.textContent = `${selected ? '已' : '已取消'}${label} ${item.name || ''}`;
    return selected;
  } catch (error) {
    if (error.status === 401) await account.load({refresh: true});
    announcements.textContent = error.message;
    return null;
  } finally {
    pending.delete(key);
  }
}
const toggleSaved = item => toggleRelation(item, 'favorites', isSaved, '收藏');
const toggleLike = item => toggleRelation(item, 'likes', isLiked, '點讚');
const onApply = item => startApplication(item, {requireUser: account.requireUser, requireQuestionnaire: account.requireQuestionnaire});

const openProfile = id => {
  if (validId(id)) return openAnimal(id, {api, isSaved, toggleSaved, isLiked, toggleLike, onShare: openShare, onApply,
    onClose: () => swipeView?.refreshSaved()});
};

async function loadHome() {
  const feedback = byId('home-status');
  feedback.textContent = '讀取公開領養名錄…';
  try {
    const overview = await api.get('/api/overview');
    byId('cats-count').textContent = overview.counts.cat.toLocaleString('zh-HK');
    byId('dogs-count').textContent = overview.counts.dog.toLocaleString('zh-HK');
    byId('home-totals').hidden = false;
    byId('home-release').textContent = `${overview.release_date} 名錄版本，含較早的機構快照。`;
    byId('home-release').hidden = false;
    const story = overview.featured;
    if (story && photoUrl(story.photo_url)) {
      byId('story-photo').src = story.photo_url;
      byId('story-photo').alt = `${story.name} 的機構照片`;
      byId('story-name').textContent = story.name;
      byId('story-organisation').textContent = story.organisation;
      byId('story-button').onclick = () => openProfile(story.id);
      byId('home-story').hidden = false;
    }
    feedback.replaceChildren();
  } catch {
    const retry = newText('button', '重試');
    retry.type = 'button';
    retry.addEventListener('click', loadHome, { once: true });
    feedback.replaceChildren(document.createTextNode('暫時未能讀取領養資料。'), retry);
  }
}

function refreshSaved() {
  const target = byId('saved-list');
  target.replaceChildren();
  const items = favorites();
  if (!items.length) {
    const box = newText('div', '', 'saved-empty');
    const start = newText('a', '去探索', 'app-action app-action-soft');
    start.href = '#discover';
    box.append(newText('p', account.getUser() ? '還沒有收藏。在探索頁往右滑，或點開檔案收藏。' : '登入後可在這裡查看收藏。'), start);
    target.append(box);
    return;
  }
  for (const item of [...items].reverse()) target.append(createRecord(item, true));
}

function createRecord(item, deletable) {
    const record = newText('article', '', 'saved-card');
    const open = newText('button', '', 'saved-open');
    open.type = 'button';
    open.setAttribute('aria-label', `查看 ${item.name} 的動物檔案`);
    const thumbnail = newText(photoUrl(item.photo_url) ? 'img' : 'span', '', 'saved-image');
    if (thumbnail.tagName === 'IMG') {
      thumbnail.src = item.photo_url;
      thumbnail.alt = '';
      thumbnail.loading = 'lazy';
    }
    const words = newText('span', '', 'saved-text');
    const species = { cat: '貓', dog: '狗' }[item.species];
    words.append(newText('strong', item.name), newText('small', [species, item.organisation].filter(Boolean).join(' · ')));
    open.append(thumbnail, words);
    open.onclick = () => openProfile(item.id);
    record.append(open);
    if (deletable) {
      const remove = newText('button', '移除', 'saved-remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', `移除 ${item.name} 收藏`);
      remove.onclick = () => toggleSaved(item);
      record.append(remove);
    }
    return record;
}

async function refreshMatches() {
  const current = account.getUser();
  const section = byId('matches-root');
  const root = byId('matches-list');
  const note = byId('matches-note');
  const key = current?.questionnaire ? JSON.stringify([current.id, current.questionnaire.answers]) : '';
  section.hidden = !key;
  if (!key) {
    matchesVersion = '';
    ++matchesRequest;
    root.replaceChildren();
    return;
  }
  if (key === matchesVersion) return;
  matchesVersion = key;
  const attempt = ++matchesRequest;
  note.textContent = '核對公開名錄的物種與體型…';
  root.replaceChildren();
  try {
    const data = await api.get('/api/account/matches');
    if (attempt !== matchesRequest) return;
    const unknown = data.missing_size > 0 ? ` ${data.missing_size} 則官網未明示體型。` : '';
    note.textContent = `依問卷的物種和體型偏好，共 ${data.total} 則符合。顯示最多 8 則。${unknown}`;
    if (data.items.length) root.replaceChildren(...data.items.map(item => createRecord(item, false)));
    else root.replaceChildren(newText('p', '目前這組偏好沒有可核對的待領養檔案。'));
  } catch {
    if (attempt !== matchesRequest) return;
    matchesVersion = '';
    note.textContent = '暫時無法載入符合偏好的檔案。';
  }
}

function goTo(view) {
  if (location.hash === `#${view}`) navigate();
  else location.hash = view;
}

function navigate() {
  const target = location.hash.slice(1);
  let animal = '';
  if (target.startsWith('animal=')) {
    try { animal = decodeURIComponent(target.slice(7)); } catch { animal = ''; }
    if (!validId(animal)) animal = '';
  }
  const next = animal ? 'discover' : (views.includes(target) ? target : 'home');
  if (animal) history.replaceState(history.state, '', '#discover');
  if (next === screen) {
    if (animal) openProfile(animal);
    return;
  }
  screen = next;
  for (const view of views) byId(view).hidden = screen !== view;
  for (const tab of document.querySelectorAll('[data-screen]')) {
    if (tab.dataset.screen === (screen === 'privacy-policy' ? 'saved' : screen)) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  byId('app-content').scrollTop = 0;
  if (!mounts.has(screen)) {
    mounts.add(screen);
    if (screen === 'home') loadHome();
    if (screen === 'discover') swipeView = mountSwipe(byId('swipe-root'), {api, openProfile, isSaved, toggleSaved,
      onGuide: openGuide, onShare: openShare, onApply});
    if (screen === 'insights') mountInsights(byId('insights-root'), { api, openProfile });
  }
  if (screen === 'saved') { refreshSaved(); refreshMatches(); }
  if (animal) openProfile(animal);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installEvent = event;
});
window.addEventListener('appinstalled', () => { byId('install-box').hidden = true; });
byId('install-box').hidden = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
byId('install-button').addEventListener('click', async () => {
  if (!installEvent) {
    byId('install-detail').hidden = !byId('install-detail').hidden;
    return;
  }
  const event = installEvent;
  installEvent = null;
  try { await event.prompt(); }
  catch { byId('install-detail').hidden = false; }
});

window.addEventListener('hashchange', navigate);
account.view(byId('account-root'), byId('account-footer'));
mountArticles(byId('home-articles'));
refreshAccount();
navigate();
const initialEntry = !location.hash;
account.load().then(user => {
  if (!initialEntry || user || screen !== 'home' || !navigator.onLine) return;
  const key = 'waiting-for-home-mobile:entered';
  try { if (localStorage.getItem(key)) return; } catch { /* The welcome page still works without persistent storage. */ }
  account.openLogin().then(() => {
    try { localStorage.setItem(key, '1'); } catch { /* The session remains usable. */ }
  });
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
