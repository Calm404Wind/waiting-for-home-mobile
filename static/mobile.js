import { mountSwipe } from './swipe.js?v=21';
import { mountInsights } from './insights.js?v=21';
import { openAnimal } from './profile.js?v=21';
import { createAccount } from './account.js?v=21';
import { openShare, startApplication } from './actions.js?v=21';
import { mountArticles, openGuide } from './learn.js?v=21';

const byId = id => document.getElementById(id);
const views = ['home', 'discover', 'insights', 'saved', 'privacy-policy'];

async function request(method, path, { params = {}, body } = {}) {
  const url = new URL(path, location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) url.searchParams.set(key, value);
  }
  const options = { method, cache: 'no-store' };
  if (body !== undefined) {
    Object.assign(options, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  const response = await fetch(url, options);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('資料服務目前無法回應。');
  }
  if (!response.ok) {
    const error = new Error(typeof payload.detail === 'string' ? payload.detail : '未能完成此項操作。');
    error.status = response.status;
    throw error;
  }
  return payload;
}

const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  delete: path => request('DELETE', path),
};

const validId = id => typeof id === 'string' && /^listing_[\w-]{1,200}$/.test(id);
const photoUrl = path => (typeof path === 'string' && /^\/media\/[\w-]+$/.test(path) ? path : null);
const newText = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};

let swipeView, insightsView, installEvent, screen = '';
const scrollPositions = new Map();
let matchesVersion = '', matchesRequest = 0;
const mounts = new Set();
const announcements = newText('div', '', 'app-sr-only');
announcements.setAttribute('aria-live', 'polite');
document.body.append(announcements);

const account = createAccount({ api, onChange: refreshAccount, navigate: goTo });
const favorites = () => account.getUser()?.favorites || [];
const isSaved = id => favorites().some(item => item.id === id);
const isLiked = id => account.getUser()?.likes?.includes(id) ?? false;
const pending = new Set();

function updateGreeting() {
  const dateNode = byId('home-date');
  const greetNode = byId('home-greeting');
  if (dateNode) {
    try {
      const formatted = new Intl.DateTimeFormat('zh-HK', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(new Date());
      dateNode.textContent = formatted;
    } catch {
      dateNode.textContent = '香港公開領養名錄';
    }
  }
  if (greetNode) {
    const current = account.getUser();
    greetNode.textContent = current?.displayName
      ? `你好，${current.displayName}`
      : '你好';
  }
}

function refreshAccount() {
  const count = favorites().length;
  byId('header-count').textContent = String(count);
  byId('header-count').hidden = count < 1;
  updateGreeting();
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
    if (!(await account.requireUser(label))) return null;
    const path = `/api/account/${key}`;
    const result = read(item.id) ? await api.delete(path) : await api.put(path);
    account.setUser(result.user);
    const selected = read(item.id);
    announcements.textContent = `${selected ? '已' : '已取消'}${label} ${item.name || ''}`;
    return selected;
  } catch (error) {
    if (error.status === 401) await account.load({ refresh: true });
    announcements.textContent = error.message;
    return null;
  } finally {
    pending.delete(key);
  }
}

const toggleSaved = item => toggleRelation(item, 'favorites', isSaved, '收藏');
const toggleLike = item => toggleRelation(item, 'likes', isLiked, '點讚');
const onApply = item =>
  startApplication(item, {
    requireUser: account.requireUser,
    requireQuestionnaire: account.requireQuestionnaire,
  });

const openProfile = id => {
  if (validId(id)) {
    return openAnimal(id, {
      api,
      isSaved,
      toggleSaved,
      isLiked,
      toggleLike,
      onShare: openShare,
      onApply,
      onClose: () => swipeView?.refreshSaved(),
    });
  }
};

async function loadHome() {
  const feedback = byId('home-status');
  feedback.textContent = '正在讀取公開領養名錄…';
  try {
    const overview = await api.get('/api/overview');
    const fmt = n => (typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('zh-HK') : '—');
    const total = overview.total_listed ?? (overview.counts.cat + overview.counts.dog);

    const cats = overview.counts.cat ?? 0;
    const dogs = overview.counts.dog ?? 0;
    const speciesTotal = cats + dogs || 1;
    const catPct = Math.round((cats / speciesTotal) * 1000) / 10;
    const dogPct = Math.round((100 - catPct) * 10) / 10;

    byId('orgs-count').textContent = fmt(overview.organisation_count);
    byId('total-count').textContent = fmt(total);
    byId('cats-count').textContent = fmt(cats);
    byId('dogs-count').textContent = fmt(dogs);
    byId('centres-count').textContent = fmt(overview.centre_count);
    byId('cats-stat')?.setAttribute('aria-label', `貓咪 ${fmt(cats)} 則檔案`);
    byId('dogs-stat')?.setAttribute('aria-label', `狗狗 ${fmt(dogs)} 則檔案`);
    const catsRatio = byId('cats-ratio');
    const dogsRatio = byId('dogs-ratio');
    if (catsRatio) catsRatio.style.width = `${catPct}%`;
    if (dogsRatio) dogsRatio.style.width = `${dogPct}%`;
    byId('home-totals').hidden = false;
    byId('home-release').textContent = `快照 ${overview.release_date}`;

    const hero = overview.hero_waiting;
    const heroPhoto = byId('hero-photo');
    const heroBtn = byId('hero-photo-btn');
    const heroCaption = byId('hero-photo-caption');
    if (hero && photoUrl(hero.photo_url)) {
      heroPhoto.alt = `等待領養的 ${hero.name}`;
      heroPhoto.onload = () => {
        heroPhoto.hidden = false;
      };
      heroPhoto.onerror = () => {
        heroPhoto.hidden = true;
      };
      heroPhoto.src = hero.photo_url;
      heroCaption.textContent = hero.name;
      heroCaption.hidden = false;
      heroBtn.setAttribute('aria-label', `查看 ${hero.name} 的動物檔案`);
      heroBtn.onclick = () => openProfile(hero.id);
    } else {
      heroBtn.setAttribute('aria-label', '探索待領養動物');
      heroBtn.onclick = () => goTo('discover');
    }

    const story = overview.featured;
    if (story && validId(story.id)) {
      const storyPhoto = byId('story-photo');
      storyPhoto.hidden = !photoUrl(story.photo_url);
      if (!storyPhoto.hidden) {
        storyPhoto.alt = `${story.name} 的機構照片`;
        storyPhoto.onerror = () => { storyPhoto.hidden = true; };
        storyPhoto.src = story.photo_url;
      }
      const shortStatus = label => (label || '').replace(/^官網列為/, '');
      byId('story-name').textContent = [story.name, shortStatus(story.status_label)].filter(Boolean).join(' · ');
      byId('story-organisation').textContent = story.organisation;
      if (Array.isArray(story.observations) && story.observations.length >= 2) {
        const first = story.observations[0];
        const last = story.observations[story.observations.length - 1];
        byId('story-timeline').textContent = `${first.date.slice(5)} ${shortStatus(first.status_label)} → ${last.date.slice(5)} ${shortStatus(last.status_label)}`;
      }
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
    box.append(
      newText('p', account.getUser() ? '尚未收藏動物' : '登入後可收藏動物'),
      start,
    );
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
    thumbnail.referrerPolicy = 'no-referrer';
    thumbnail.addEventListener('error', () => thumbnail.replaceWith(newText('span', '', 'saved-image')), { once: true });
  }
  const words = newText('span', '', 'saved-text');
  const species = { cat: '貓咪', dog: '狗狗' }[item.species];
  words.append(
    newText('strong', item.name),
    newText('small', [species, item.age_label, item.organisation].filter(Boolean).join(' · ')),
  );
  open.append(thumbnail, words);
  open.onclick = () => openProfile(item.id);
  record.append(open);
  if (deletable) {
    const remove = newText('button', '移除', 'saved-remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `移除 ${item.name} 收藏`);
    remove.onclick = () => toggleSaved(item);
    record.append(remove);
  } else {
    const chevron = newText('span', '›', 'saved-chevron');
    chevron.setAttribute('aria-hidden', 'true');
    record.append(chevron);
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
    note.textContent = `共 ${data.total} 則相符，顯示前 8 則`;
    if (data.items.length) root.replaceChildren(...data.items.map(item => createRecord(item, false)));
    else root.replaceChildren(newText('p', '暫無相符檔案。', 'source-note'));
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

function navigate(event) {
  const target = location.hash.slice(1);
  let animal = '';
  if (target.startsWith('animal=')) {
    try {
      animal = decodeURIComponent(target.slice(7));
    } catch {
      animal = '';
    }
    if (!validId(animal)) animal = '';
  }
  const [view, query = ''] = target.split('?', 2);
  const params = new URLSearchParams(query);
  const next = animal ? 'discover' : views.includes(view) ? view : 'home';
  const mapShortcut = next === 'insights' && params.get('tab') === 'map';
  if (next === 'privacy-policy' && event?.oldURL && screen !== next) {
    byId('privacy-back').hash = new URL(event.oldURL).hash || '#home';
  }
  const route = {
    centreId: params.get('centre_id') || '',
    species: ['cat', 'dog'].includes(params.get('species')) ? params.get('species') : '',
  };
  if (animal) history.replaceState(history.state, '', '#discover');
  if (next === screen) {
    if (animal) openProfile(animal);
    else if (next === 'discover') swipeView?.setRoute(route);
    else if (mapShortcut) insightsView?.showMap();
    return;
  }
  const content = byId('app-content');
  if (screen) scrollPositions.set(screen, content.scrollTop);
  screen = next;
  for (const view of views) byId(view).hidden = screen !== view;
  const activeTab = screen === 'privacy-policy' ? 'saved' : screen;
  for (const tab of document.querySelectorAll('[data-screen]')) {
    if (tab.dataset.screen === activeTab) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  if (!mounts.has(screen)) {
    mounts.add(screen);
    if (screen === 'home') loadHome();
    if (screen === 'discover') {
      swipeView = mountSwipe(byId('swipe-root'), {
        initialRoute: route,
        api,
        openProfile,
        isSaved,
        toggleSaved,
        onGuide: openGuide,
        onShare: openShare,
        onApply,
      });
    }
    if (screen === 'insights') insightsView = mountInsights(byId('insights-root'), { api, openProfile });
  } else if (screen === 'discover' && !animal) {
    swipeView.setRoute(route);
  }
  if (mapShortcut) insightsView.showMap();
  content.scrollTop = mapShortcut || route.centreId ? 0 : scrollPositions.get(screen) || 0;
  if (screen === 'saved') {
    refreshSaved();
    refreshMatches();
  }
  if (animal) openProfile(animal);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installEvent = event;
});
window.addEventListener('appinstalled', () => {
  byId('install-box').hidden = true;
});
byId('install-box').hidden = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
byId('install-button').addEventListener('click', async () => {
  if (!installEvent) {
    byId('install-detail').hidden = !byId('install-detail').hidden;
    return;
  }
  const event = installEvent;
  installEvent = null;
  try {
    await event.prompt();
  } catch {
    byId('install-detail').hidden = false;
  }
});

byId('saved-guide-btn')?.addEventListener('click', openGuide);

function updatePhoneClock() {
  const node = byId('iphone-time');
  if (!node) return;
  try {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    node.textContent = `${h}:${m}`;
  } catch {
    node.textContent = '9:41';
  }
}

window.addEventListener('hashchange', navigate);
account.view(byId('account-root'), byId('account-footer'));
mountArticles(byId('home-articles'));
updatePhoneClock();
setInterval(updatePhoneClock, 30000);
updateGreeting();
refreshAccount();
navigate();

account.load().catch(() => {});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
