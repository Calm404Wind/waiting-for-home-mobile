const QUESTIONS = [
  ['budget', '長期照顧預算', '', ['已有固定預算及儲備', '正在規劃開支', '尚未評估']],
  ['time', '日常陪伴與照顧時間', '', ['每日已有固定時間', '可調整生活作息', '尚未確定']],
  ['screens', '居家門窗安全防護', '', ['已裝妥窗網／防護', '計劃安裝中', '尚未檢查']],
  ['housing', '住處規定與同住共識', '', ['公契／租約及家人均同意', '正在確認中', '尚未確認']],
  ['travel', '離家或外遊代照顧', '', ['已有可靠代照顧人選', '初步安排中', '尚未安排']],
  ['furniture', '家居與生活習慣調整', '', ['已準備好接受調整', '願意逐步適應', '尚不確定']],
];
const ANSWERS = ['ready', 'planned', 'unsure'];
const PREFERENCES = [
  ['preferredSpecies', '想領養的動物', [['either', '貓狗都可以'], ['cat', '貓'], ['dog', '狗']]],
  ['preferredSize', '體型偏好', [['either', '不限體型'], ['small', '小型'], ['medium', '中型'], ['large', '大型']]],
];

const SVGS = {
  paw: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="15.3" rx="5.2" ry="4.3"/><ellipse cx="5.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="18.5" cy="10" rx="2.1" ry="2.7"/><ellipse cx="9.2" cy="5.7" rx="2" ry="2.6"/><ellipse cx="14.8" cy="5.7" rx="2" ry="2.6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 5.8c-2.1-2.2-5.6-2.2-7.7 0L12 6.9l-1.1-1.1a5.3 5.3 0 0 0-7.7 0 5.7 5.7 0 0 0 0 7.9L12 22l8.8-8.3a5.7 5.7 0 0 0 0-7.9Z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>`,
  google: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2l-3.3 2.6C4.7 19.8 8.1 22 12 22z"/><path fill="#4A90E2" d="M6.3 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3 7.5C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.3-2.6z"/><path fill="#FBBC05" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.3 2.6c.8-2.4 3-4.2 5.7-4.2z"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 12.7c0-2.1 1.7-3.2 1.8-3.2-1-1.4-2.5-1.6-3.1-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.4-.9-2.4-3.4ZM14.4 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2Z"/></svg>`,
};

const STYLE = `
.wfa-dialog {
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(100%, 460px);
  max-width: 100%;
  max-height: min(100dvh, 820px);
  overflow: auto;
  border: 1px solid rgba(224, 126, 56, 0.22);
  padding: 0;
  border-radius: 30px;
  color: var(--app-ink, #4a3b32);
  background: radial-gradient(circle at 100% 0%, rgba(244, 162, 97, 0.2), transparent 18rem), #fff3e0;
  font-family: inherit;
  box-shadow: 0 28px 68px -16px rgba(56, 34, 20, .36);
}
.wfa-dialog::backdrop {
  background: rgba(46, 29, 20, .54);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.wfa-top {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  gap: 12px;
  padding: calc(8px + env(safe-area-inset-top, 0px)) 18px 8px;
  background: rgba(255, 245, 229, .9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(224, 126, 56, 0.16);
}
.wfa-top .wfa-kicker {
  font-size: .84rem;
  color: #9c421f;
  font-weight: 800;
}
.wfa-body {
  padding: 22px 22px calc(26px + env(safe-area-inset-bottom, 0px));
}
.wfa-brand-badge {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(140deg, #f4a261 0%, #e07630 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 10px 22px rgba(224, 118, 48, 0.3);
}
.wfa-brand-badge svg { width: 25px; height: 25px; }

.wfa-welcome-kicker {
  margin: 0 0 4px;
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: #c66322;
}
.wfa-title {
  font-size: 1.75rem;
  letter-spacing: -.02em;
  line-height: 1.22;
  margin: 0 0 8px;
  font-weight: 900;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  color: #4a3b32;
}
.wfa-intro, .wfa-note {
  font-size: .88rem;
  color: #766255;
  line-height: 1.58;
  margin: 0 0 16px;
}
.wfa-note { font-size: .78rem; margin: 10px 0 0; }

.wfa-button {
  min-height: 46px;
  border: 1px solid rgba(224, 126, 56, 0.24);
  border-radius: 16px;
  color: #5c3720;
  background: rgba(255, 255, 255, 0.85);
  padding: 8px 14px;
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 160ms ease, border-color 160ms ease, transform 140ms ease, box-shadow 160ms ease;
}
.wfa-button svg { width: 17px; height: 17px; flex-shrink: 0; }
.wfa-button:hover:not(:disabled) {
  background: #ffffff;
  border-color: rgba(214, 112, 42, 0.42);
}
.wfa-button:active:not(:disabled) { transform: scale(.97); }
.wfa-button:disabled { cursor: default; opacity: .55; }

.wfa-button-main {
  background: linear-gradient(135deg, #e27832 0%, #c8581d 100%);
  border-color: transparent;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 12px 24px -8px rgba(200, 88, 29, .42);
}
.wfa-button-main:hover:not(:disabled) {
  background: linear-gradient(135deg, #e8803b 0%, #cf5f23 100%);
  border-color: transparent;
  box-shadow: 0 15px 28px -8px rgba(200, 88, 29, .5);
}

.wfa-button-clear {
  background: transparent;
  border-color: transparent;
  padding-inline: 10px;
  color: #766255;
}
.wfa-button-clear:hover:not(:disabled) {
  background: rgba(244, 162, 97, .14);
  border-color: transparent;
  color: #4a3b32;
}

.wfa-button-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.wfa-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: 4px;
  padding: 4px;
  background: rgba(242, 222, 199, 0.72);
  border-radius: 16px;
  margin-bottom: 16px;
}
.wfa-mode .wfa-button {
  min-height: 40px;
  border-radius: 12px;
  border-color: transparent;
  background: transparent;
  color: #766255;
}
.wfa-mode .wfa-button[aria-pressed=true] {
  background: #ffffff;
  color: #9c421f;
  box-shadow: 0 3px 10px rgba(112, 78, 55, .1);
}

.wfa-form { display: grid; gap: 13px; }
.wfa-label { display: grid; gap: 6px; font-size: .83rem; font-weight: 700; color: #5b473b; }
.wfa-field {
  box-sizing: border-box;
  background: #fffdf9;
  color: #4a3b32;
  border: 1px solid rgba(214, 126, 62, 0.24);
  border-radius: 16px;
  min-height: 48px;
  max-width: 100%;
  width: 100%;
  font-size: 16px;
  padding: 10px 14px;
  box-shadow: 0 3px 10px rgba(112, 78, 55, 0.04);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.wfa-field:focus {
  outline: none;
  border-color: #d88d55;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, .28);
}
.wfa-password { display: flex; position: relative; }
.wfa-password input { padding-inline-end: 82px; }
.wfa-password .wfa-button {
  position: absolute;
  right: 4px;
  top: 3px;
  bottom: 3px;
  min-height: 40px;
  font-size: .78rem;
  border-radius: 12px;
}
.wfa-form .wfa-button-main { min-height: 52px; font-size: .96rem; border-radius: 18px; }

.wfa-message {
  color: #b83b2a;
  font-size: .84rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
  overflow-wrap: anywhere;
}
.wfa-message:empty { display: none; }

.wfa-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 12px;
  font-size: .78rem;
  color: #8c7769;
}
.wfa-divider::before, .wfa-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(180, 140, 110, 0.25);
}

.wfa-guest-row { display: flex; justify-content: center; margin: 10px 0 0; }
.wfa-privacy {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 8px 0 0;
  font-size: .79rem;
  color: #856b5b;
}
.wfa-privacy .wfa-terms {
  background: transparent;
  border: 0;
  padding: 0;
  color: #9c421f;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  min-height: 40px;
}
.wfa-privacy a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: #9c421f;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Questionnaire */
.wfa-quiz-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.wfa-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 9px;
  border-radius: 9px;
  background: #fde6cf;
  color: #b8521b;
  font-size: .74rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.wfa-progress-label {
  font-size: .8rem;
  font-weight: 700;
  color: #766255;
  font-variant-numeric: tabular-nums;
}
.wfa-progress {
  display: block;
  width: 100%;
  height: 8px;
  margin: 0 0 18px;
  accent-color: #d66a24;
  border-radius: 999px;
}
.wfa-choices {
  display: grid;
  gap: 10px;
  margin: 14px 0 18px;
  padding: 0;
  border: 0;
  min-width: 0;
}
.wfa-option {
  box-sizing: border-box;
  display: flex;
  gap: 11px;
  align-items: center;
  min-height: 54px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(214, 126, 62, 0.22);
  border-radius: 18px;
  padding: 12px 15px;
  font-size: .91rem;
  font-weight: 600;
  line-height: 1.42;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 140ms ease;
}
.wfa-option:hover { background: #ffffff; border-color: rgba(214, 112, 42, 0.42); }
.wfa-option:has(input:checked) {
  border-color: #d66a24;
  background: #ffebd6;
  color: #5c2d12;
}
.wfa-option input {
  flex: none;
  accent-color: #b8521b;
  height: 18px;
  width: 18px;
  margin: 0;
}
.wfa-preferences { display: grid; gap: 12px; margin: 0 0 18px; }

/* Figma Make User Profile Card + Match Archive Card on #saved */
.wfa-profile-stack {
  display: grid;
  gap: 14px;
}
.user-profile-card {
  padding: 18px 20px;
  border-radius: 24px;
  background: #fffdf9;
  border: 1px solid rgba(138, 102, 76, 0.15);
  box-shadow: none;
}
.profile-top-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #fdebd8;
  color: #b44b18;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.38rem;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: none;
}
.user-avatar svg { width: 26px; height: 26px; }

.profile-identity {
  flex: 1;
  min-width: 0;
}
.profile-kicker {
  margin: 0;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: #c66322;
}
.profile-identity h2 {
  margin: 3px 0 0;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.36rem;
  font-weight: 900;
  line-height: 1.2;
  color: #4a3b32;
  overflow-wrap: anywhere;
}
.profile-meta {
  margin: 5px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .78rem;
  font-weight: 600;
  color: #766255;
}
.profile-meta svg { width: 14px; height: 14px; color: #b44b18; flex-shrink: 0; }

.profile-stats {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(138, 102, 76, 0.14);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  text-align: center;
}
.profile-stat-item {
  padding: 4px 2px;
  border-radius: 0;
  background: transparent;
}
.profile-stat-item strong {
  display: block;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 1.2rem;
  font-weight: 900;
  color: #4a3b32;
  font-variant-numeric: tabular-nums;
}
.profile-stat-item span {
  display: block;
  margin-top: 2px;
  font-size: .73rem;
  font-weight: 600;
  color: #766255;
}

.match-archive-card {
  width: 100%;
  min-height: 70px;
  padding: 14px 16px;
  border-radius: 22px;
  border: 1px solid rgba(138, 102, 76, 0.16);
  background: #fffdf9;
  box-shadow: none;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  color: #4a3b32;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.match-archive-card:hover {
  border-color: rgba(156, 66, 31, 0.34);
  background: #fffaf3;
}
.match-archive-card:active { transform: scale(.99); }

.match-archive-icon {
  width: 40px;
  height: 40px;
  border-radius: 13px;
  background: #fdebd8;
  color: #b44b18;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.match-archive-icon svg { width: 19px; height: 19px; }

.match-archive-copy { min-width: 0; }
.match-archive-copy strong {
  display: block;
  font-size: .94rem;
  font-weight: 800;
  color: #4a3b32;
}
.match-archive-copy p {
  margin: 3px 0 0;
  font-size: .77rem;
  color: #766255;
  line-height: 1.4;
}

.match-archive-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: .8rem;
  font-weight: 800;
  color: #9c421f;
  white-space: nowrap;
}
.match-archive-cta.is-primary {
  min-height: 36px;
  padding: 0 13px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e27832 0%, #c8581d 100%);
  color: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(175, 72, 20, 0.44);
}
.match-archive-cta svg { width: 14px; height: 14px; }

.wfa-logout {
  color: #9c421f;
  font-weight: 800;
}
.wfa-dialog :focus-visible, .wfa-profile-stack :focus-visible {
  outline: 2px solid #9c421f;
  outline-offset: 3px;
}

.wfa-result-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 22px;
  background: #fffaf2;
  border: 1px solid rgba(138, 102, 76, 0.16);
  text-align: center;
}
.wfa-result-kicker {
  margin: 0;
  font-size: .78rem;
  font-weight: 800;
  color: #b4531c;
  letter-spacing: .04em;
}
.wfa-result-score {
  margin: 0;
  font-family: var(--app-display, 'Noto Serif TC', Georgia, serif);
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  color: #4a3b32;
  font-variant-numeric: tabular-nums;
}
.wfa-result-summary {
  margin: 0;
  font-size: .88rem;
  line-height: 1.55;
  color: #5d473b;
}
.wfa-result-prefs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.wfa-result-chip {
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(214, 112, 42, 0.2);
  font-size: .78rem;
  font-weight: 700;
  color: #6b4834;
}
.wfa-result-actions {
  display: grid;
  gap: 8px;
}

@media (max-width: 559px) {
  .wfa-dialog {
    margin: 0 auto;
    width: 100%;
    max-height: 100dvh;
    height: 100dvh;
    border-radius: 0;
    border: 0;
  }
}
`;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action, className = '') {
  const control = el('button', `wfa-button ${className}`.trim(), text);
  control.type = 'button';
  if (action) control.addEventListener('click', action);
  return control;
}

function installStyle() {
  if (document.getElementById('waiting-for-home-account-style')) return;
  const style = el('style', '', STYLE);
  style.id = 'waiting-for-home-account-style';
  document.head.append(style);
}

function userLabel(provider) {
  return { google: 'Google 模擬帳戶', apple: 'Apple 模擬帳戶' }[provider] || '本機 Demo 帳戶';
}

function readiness(questionnaire) {
  const score = questionnaire?.score;
  if (Number.isFinite(score) && score >= 0 && score <= 100) return Math.round(score);
  const answers = questionnaire?.answers;
  if (!answers || !QUESTIONS.every(([key]) => ANSWERS.includes(answers[key]))) return null;
  const weight = { ready: 2, planned: 1, unsure: 0 };
  const points = QUESTIONS.reduce((sum, [key]) => sum + weight[answers[key]], 0);
  return Math.round((points * 100) / (QUESTIONS.length * 2));
}

function hasQuestionnaire(user) {
  return Boolean(user?.questionnaire && readiness(user.questionnaire) !== null);
}

function describeError(error, fallback) {
  return error instanceof Error && error.message && error.message !== 'Failed to fetch' ? error.message : fallback;
}

function openModal(label, build) {
  installStyle();
  const previousFocus = document.activeElement;
  return new Promise(resolve => {
    let active = true;
    let locked = false;
    let result = null;
    const modal = el('dialog', 'wfa-dialog');
    modal.setAttribute('aria-label', label);
    const bar = el('div', 'wfa-top');
    const content = el('div', 'wfa-body');
    const close = button('‹ 返回', () => finish(), 'wfa-button-clear');
    bar.append(el('span', 'wfa-kicker', label), close);
    modal.append(bar, content);
    const finish = answer => {
      if (!active || locked) return;
      result = answer ?? null;
      active = false;
      modal.close();
    };
    modal.addEventListener('cancel', event => {
      event.preventDefault();
      finish();
    });
    modal.addEventListener(
      'close',
      () => {
        modal.remove();
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        resolve(result);
      },
      { once: true },
    );
    const lock = value => {
      locked = value;
      for (const control of bar.querySelectorAll('button')) control.disabled = value;
      content.toggleAttribute('inert', value);
      modal.setAttribute('aria-busy', String(value));
    };
    build({ content, bar, close, finish, lock });
    document.body.append(modal);
    modal.showModal();
  });
}

export function createAccount({ api, onChange, navigate }) {
  let user = null;
  let loadRequest = null;
  let loaded = false;
  let accountView = null;
  let logoutView = null;
  let loginRequest = null;
  let quizRequest = null;
  let quizDraft = {};

  function setUser(value) {
    const oldId = user?.id;
    user = value ?? null;
    if (oldId && oldId !== user?.id) quizDraft = {};
    loaded = true;
    renderAccount();
    onChange?.(user);
    return user;
  }

  function loginPromptCopy(reason) {
    if (reason === '申請領養') {
      return {
        title: '登入以繼續申請',
        intro: '申請領養前請先登入，完成準備確認後即可前往機構官網。',
      };
    }
    if (reason === '保存配對結果') {
      return {
        title: '登入以保存配對結果',
        intro: '登入後會立即儲存你的自評分數，並顯示符合偏好的待領養貓狗。',
      };
    }
    if (reason === '收藏') {
      return {
        title: '登入以收藏動物',
        intro: '登入後即可將喜歡的貓狗加入收藏清單，隨時回來查看。',
      };
    }
    if (reason === '點讚') {
      return {
        title: '登入以記錄點讚',
        intro: '登入後即可為喜歡的動物點讚。',
      };
    }
    return {
      title: '登入「等一個家」',
      intro: reason ? `${reason}前請先登入。` : '登入以保存收藏清單、點讚與領養準備度結果。',
    };
  }

  async function saveQuestionnairePayload(payload) {
    const result = await api.put('/api/account/questionnaire', { answers: payload });
    if (!hasQuestionnaire(result.user)) throw new Error('問卷尚未儲存，請再試一次。');
    const saved = setUser(result.user);
    quizDraft = {};
    return saved;
  }

  function load({ refresh = false } = {}) {
    if (loaded && !refresh) return Promise.resolve(user);
    if (loadRequest) return loadRequest;
    loadRequest = api
      .get('/api/account')
      .then(payload => setUser(payload.user))
      .catch(() => user)
      .finally(() => {
        loadRequest = null;
      });
    return loadRequest;
  }

  function openLogin({ reason = '', mode = 'login', onboarding = true, allowGuest = true } = {}) {
    if (loginRequest) return loginRequest;
    const copy = loginPromptCopy(reason);
    loginRequest = openModal('登入／註冊', ({ content, finish, lock }) => {
      const badge = el('div', 'wfa-brand-badge');
      badge.innerHTML = SVGS.paw;

      const heading = el('h2', 'wfa-title', copy.title);
      const intro = el('p', 'wfa-intro', copy.intro);

      const issue = el('p', 'wfa-message');
      issue.setAttribute('role', 'alert');

      const segment = el('div', 'wfa-mode');
      segment.setAttribute('aria-label', '選擇帳戶操作');
      const login = button('登入', () => setMode('login'));
      const register = button('註冊', () => setMode('register'));
      segment.append(login, register);

      const form = el('form', 'wfa-form');
      const identifier = el('input', 'wfa-field');
      identifier.name = 'identifier';
      identifier.autocomplete = 'username';
      identifier.required = true;
      identifier.maxLength = 120;
      identifier.placeholder = '8 位香港手機號或電郵';
      identifier.autofocus = true;
      const nameLabel = el('label', 'wfa-label', '手機號／電郵');
      nameLabel.append(identifier);

      const passLabel = el('label', 'wfa-label', '密碼');
      const passwordRow = el('span', 'wfa-password');
      const password = el('input', 'wfa-field');
      password.name = 'password';
      password.type = 'password';
      password.required = true;
      password.maxLength = 128;
      const toggle = button(
        '顯示密碼',
        () => {
          const visible = password.type === 'password';
          password.type = visible ? 'text' : 'password';
          toggle.textContent = visible ? '隱藏密碼' : '顯示密碼';
          toggle.setAttribute('aria-pressed', String(visible));
        },
        'wfa-button-clear',
      );
      toggle.setAttribute('aria-pressed', 'false');
      passwordRow.append(password, toggle);
      passLabel.append(passwordRow);

      const submit = el('button', 'wfa-button wfa-button-main');
      submit.type = 'submit';
      const submitLabel = el('span', '', '登入');
      const submitArrow = el('span');
      submitArrow.innerHTML = SVGS.arrow;
      submit.append(submitLabel, submitArrow.firstElementChild);

      form.append(nameLabel, passLabel, issue, submit);

      function setMode(next) {
        mode = next;
        login.setAttribute('aria-pressed', String(mode === 'login'));
        register.setAttribute('aria-pressed', String(mode === 'register'));
        submitLabel.textContent = mode === 'register' ? '建立本機帳戶' : '登入';
        password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
        password.minLength = mode === 'register' ? 8 : 0;
        password.placeholder = mode === 'register' ? '設定至少 8 個字元密碼' : '輸入密碼';
        issue.textContent = '';
      }

      let busy = false;
      async function authenticate(path, payload, newAccount) {
        if (busy) return;
        busy = true;
        issue.textContent = '';
        lock(true);
        const previous = submitLabel.textContent;
        submitLabel.textContent = '連接中…';
        let authenticated;
        try {
          const result = await api.post(path, payload);
          if (!result.user) throw new Error('帳戶服務未傳回資料。');
          authenticated = setUser(result.user);
        } catch (error) {
          issue.textContent = describeError(error, '暫時無法登入，請稍後再試。');
        } finally {
          busy = false;
          submitLabel.textContent = previous;
          lock(false);
        }
        if (authenticated) {
          finish({ user: authenticated, onboarding: newAccount || Boolean(authenticated.needsOnboarding) });
        }
      }

      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = identifier.value.trim();
        if (!value) {
          issue.textContent = '請輸入手機號或電郵。';
          identifier.focus();
          return;
        }
        authenticate(`/api/auth/${mode}`, { identifier: value, password: password.value }, mode === 'register');
      });

      const choices = el('div', 'wfa-button-grid');
      for (const [provider, display, svg] of [
        ['google', 'Google 模擬', SVGS.google],
        ['apple', 'Apple 模擬', SVGS.apple],
      ]) {
        const providerBtn = button('', () => authenticate('/api/auth/demo-provider', { provider }, true));
        const iconHolder = el('span');
        iconHolder.innerHTML = svg;
        providerBtn.append(iconHolder.firstElementChild, el('span', '', display));
        choices.append(providerBtn);
      }

      const privacy = el('div', 'wfa-privacy');
      const privacyLink = el('a', '', '資料與隱私');
      privacyLink.href = '#privacy-policy';
      privacyLink.addEventListener('click', () => finish());
      const terms = button(
        '用戶協議',
        () =>
          openModal('Demo 使用約定', ({ content: termsBody }) => {
            termsBody.append(
              el('h2', 'wfa-title', '使用約定'),
              el('p', 'wfa-intro', '本專案展示香港公開救援機構的動物檔案及領養準備流程。動物最新狀態、中心地址及申請要求均以各機構官方網站公布為準。'),
              el('p', 'wfa-intro', '本機帳戶用於保存收藏清單與準備度問卷。點擊領養按鈕將帶你前往機構官方頁面查閱正式申請方式。'),
            );
          }),
        'wfa-terms',
      );
      privacy.append(el('span', '', '登入即代表同意'), terms, privacyLink);

      content.append(badge, heading, intro, segment, form, el('p', 'wfa-divider', '或模擬登入'), choices);
      if (allowGuest) {
        const guest = el('div', 'wfa-guest-row');
        guest.append(button('訪客瀏覽 ›', () => finish(), 'wfa-button-clear'));
        content.append(guest);
      }
      content.append(privacy);
      setMode(mode === 'register' ? 'register' : 'login');
    })
      .then(async result => {
        if (!result) return null;
        if (onboarding && result.onboarding && !hasQuestionnaire(result.user)) {
          await openQuestionnaire();
        }
        return user;
      })
      .finally(() => {
        loginRequest = null;
      });
    return loginRequest;
  }

  async function requireUser(reason = '繼續') {
    const active = await load();
    if (active) return active;
    return openLogin({ reason, onboarding: !String(reason).includes('領養'), allowGuest: false });
  }

  function buildPayload(source) {
    return Object.fromEntries([
      ...QUESTIONS.map(([key]) => [key, source[key]]),
      ...PREFERENCES.map(([key, , options]) => [
        key,
        options.some(([value]) => value === source[key]) ? source[key] : 'either',
      ]),
    ]);
  }

  function preferenceLabel(key, value) {
    const pref = PREFERENCES.find(([id]) => id === key);
    if (!pref) return '';
    const match = pref[2].find(([id]) => id === value);
    return match ? `${pref[1]}：${match[1]}` : '';
  }

  function openQuestionnaire({ required = false } = {}) {
    if (required && !user) return Promise.resolve(null);
    if (quizRequest) return quizRequest;
    const original = user?.questionnaire?.answers ?? {};
    const answers = { ...original, ...quizDraft };
    let step = QUESTIONS.findIndex(([key]) => !ANSWERS.includes(answers[key]));
    if (step < 0) {
      if (user) step = hasQuestionnaire(user) ? 0 : QUESTIONS.length;
      else step = QUESTIONS.length + 1;
    }
    const modalPromise = openModal(required ? '領養前準備評估' : '領養準備度自評', ({ content, bar, close, finish, lock }) => {
      if (!required) bar.append(button('稍後再填', () => finish(), 'wfa-button-clear'));
      close.textContent = required ? '‹ 返回檔案' : '‹ 返回';
      const error = el('p', 'wfa-message');
      error.setAttribute('role', 'alert');
      let busy = false;

      const render = (moveFocus = false) => {
        const answered = QUESTIONS.filter(([name]) => ANSWERS.includes(answers[name])).length;
        const choosingPreferences = step === QUESTIONS.length;
        const showingGuestResult = !user && step === QUESTIONS.length + 1;

        if (showingGuestResult) {
          const payload = buildPayload(answers);
          quizDraft = { ...payload };
          const score = readiness({ answers: payload }) ?? 0;
          const summaryText =
            score >= 80
              ? '你的領養準備相當充分，可立即查看符合偏好的待領養貓狗。'
              : score >= 50
                ? '大部分照顧條件已有規劃，建議再核對尚在考慮中的細節。'
                : '建議先閱讀首頁「領養前必讀」，做好居家與預算準備再申請。';

          const resultCard = el('div', 'wfa-result-card');
          const resultTitle = el('p', 'wfa-result-kicker', '領養準備度自評完成');
          resultTitle.tabIndex = -1;
          const scoreNode = el('p', 'wfa-result-score', `${score}%`);
          const summaryNode = el('p', 'wfa-result-summary', summaryText);
          const prefWrap = el('div', 'wfa-result-prefs');
          for (const [key] of PREFERENCES) {
            const text = preferenceLabel(key, payload[key]);
            if (text) prefWrap.append(el('span', 'wfa-result-chip', text));
          }
          resultCard.append(resultTitle, scoreNode, summaryNode, prefWrap);

          const savePrompt = el('p', 'wfa-intro', '登入以保存配對結果，並自動為你篩選合適的香港待領養貓狗。');
          const resultActions = el('div', 'wfa-result-actions');
          const loginSave = button(
            '登入以保存配對結果',
            () => finish({ saveAfterLogin: true, payload }),
            'wfa-button-main',
          );
          const subActions = el('div', 'wfa-button-grid');
          subActions.append(
            button('修改答案', () => {
              step = 0;
              render(true);
            }),
            button('暫不登入', () => finish()),
          );
          resultActions.append(loginSave, subActions);
          content.replaceChildren(resultCard, savePrompt, error, resultActions);
          if (moveFocus) resultTitle.focus();
          return;
        }

        const headRow = el('div', 'wfa-quiz-head');
        const stepBadge = el(
          'span',
          'wfa-step-badge',
          choosingPreferences ? '偏好設定' : `0${step + 1} / 0${QUESTIONS.length}`,
        );
        const label = el(
          'span',
          'wfa-progress-label',
          choosingPreferences ? `已完成 ${answered} 項準備題` : `已完成 ${answered} / ${QUESTIONS.length} 項`,
        );
        headRow.append(stepBadge, label);

        const progress = el('progress', 'wfa-progress');
        progress.max = QUESTIONS.length;
        progress.value = answered;
        progress.setAttribute('aria-label', '準備問卷完成進度');

        const actions = el('div', 'wfa-button-grid');
        const prev = button('上一題', () => {
          step--;
          render(true);
        });
        prev.disabled = step === 0;
        const next = button(
          choosingPreferences
            ? user
              ? '完成並儲存'
              : '查看評估結果'
            : step === QUESTIONS.length - 1
              ? '下一步：領養偏好'
              : '下一題',
          advance,
          'wfa-button-main',
        );
        actions.append(prev, next);

        if (choosingPreferences) {
          const question = el('h2', 'wfa-title', '你想遇見怎樣的動物？');
          question.tabIndex = -1;
          const preferences = el('div', 'wfa-preferences');
          for (const [key, title, options] of PREFERENCES) {
            const row = el('label', 'wfa-label', title);
            const control = el('select', 'wfa-field');
            for (const [value, name] of options) {
              const option = el('option', '', name);
              option.value = value;
              control.append(option);
            }
            control.value = options.some(([value]) => value === answers[key]) ? answers[key] : 'either';
            answers[key] = control.value;
            control.addEventListener('change', () => {
              answers[key] = control.value;
              quizDraft = { ...answers };
            });
            row.append(control);
            preferences.append(row);
          }
          const tip = el(
            'p',
            'wfa-intro',
            user ? '用於篩選名錄中的相符動物。' : '無需先登入，完成後可即時查看準備度分數。',
          );
          content.replaceChildren(headRow, progress, question, tip, preferences, error, actions);
          if (moveFocus) question.focus();
          return;
        }

        const [key, title, tip, options] = QUESTIONS[step];
        const question = el('h2', 'wfa-title', title);
        question.tabIndex = -1;
        const choices = el('fieldset', 'wfa-choices');
        choices.setAttribute('aria-label', title);
        next.disabled = !ANSWERS.includes(answers[key]);

        for (const [index, text] of options.entries()) {
          const row = el('label', 'wfa-option');
          const input = el('input');
          input.type = 'radio';
          input.name = `wfa-question-${key}`;
          input.value = ANSWERS[index];
          input.checked = answers[key] === input.value;
          input.addEventListener('change', () => {
            answers[key] = input.value;
            quizDraft = { ...answers };
            progress.value = QUESTIONS.filter(([name]) => ANSWERS.includes(answers[name])).length;
            label.textContent = `已完成 ${progress.value} / ${QUESTIONS.length} 項`;
            next.disabled = false;
            error.textContent = '';
          });
          row.append(input, el('span', '', text));
          choices.append(row);
        }
        const nodes = tip ? [headRow, progress, question, el('p', 'wfa-intro', tip), choices, error, actions] : [headRow, progress, question, choices, error, actions];
        content.replaceChildren(...nodes);
        if (moveFocus) question.focus();
      };

      async function advance() {
        if (busy) return;
        error.textContent = '';
        if (step < QUESTIONS.length) {
          if (!ANSWERS.includes(answers[QUESTIONS[step][0]])) return;
          step++;
          render(true);
          return;
        }
        const incomplete = QUESTIONS.findIndex(([key]) => !ANSWERS.includes(answers[key]));
        if (incomplete >= 0) {
          step = incomplete;
          render(true);
          error.textContent = '請填完餘下題目。';
          return;
        }
        const payload = buildPayload(answers);
        quizDraft = { ...payload };
        if (!user) {
          step = QUESTIONS.length + 1;
          render(true);
          return;
        }
        busy = true;
        lock(true);
        let complete;
        try {
          complete = await saveQuestionnairePayload(payload);
        } catch (issue) {
          error.textContent = describeError(issue, '暫時無法儲存問卷，請稍後再試。');
        } finally {
          busy = false;
          lock(false);
        }
        if (complete) finish(complete);
      }

      render();
    });

    quizRequest = modalPromise
      .finally(() => {
        quizRequest = null;
        renderAccount();
      })
      .then(async outcome => {
        if (!outcome?.saveAfterLogin) return outcome;
        const loggedIn = await openLogin({
          reason: '保存配對結果',
          onboarding: false,
          allowGuest: false,
        });
        if (!loggedIn) return null;
        try {
          return await saveQuestionnairePayload(outcome.payload);
        } catch (failure) {
          return openModal('儲存自評結果', ({ content, lock, finish }) => {
            const error = el('p', 'wfa-message', describeError(failure, '結果尚未儲存，請再試一次。'));
            error.setAttribute('role', 'alert');
            const retry = button('重新儲存', async () => {
              lock(true);
              let saved;
              try {
                saved = await saveQuestionnairePayload(outcome.payload);
              } catch (issue) {
                error.textContent = describeError(issue, '結果尚未儲存，請再試一次。');
              } finally {
                lock(false);
              }
              if (saved) finish(saved);
            }, 'wfa-button-main');
            content.append(el('h2', 'wfa-title', '自評結果尚未儲存'), error, retry);
          });
        }
      });
    return quizRequest;
  }

  async function requireQuestionnaire() {
    const active = await requireUser('申請領養');
    if (!active) return null;
    if (hasQuestionnaire(active)) return active;
    if (readiness({ answers: quizDraft }) !== null) {
      try {
        return await saveQuestionnairePayload(buildPayload(quizDraft));
      } catch {
        // Fall back to interactive questionnaire if saving draft fails
      }
    }
    return openQuestionnaire({ required: true });
  }

  async function logout() {
    const result = await api.post('/api/auth/logout', {});
    setUser(result.user);
    navigate?.('home');
    return openLogin();
  }

  function renderAccount() {
    if (!accountView) return;
    installStyle();

    const stack = el('div', 'wfa-profile-stack');
    const profileCard = el('section', 'user-profile-card');
    const topRow = el('div', 'profile-top-row');
    const avatar = el('div', 'user-avatar');

    if (!user) {
      avatar.innerHTML = SVGS.paw;
      const identity = el('div', 'profile-identity');
      identity.append(el('h2', '', '訪客'));
      const loc = el('p', 'profile-meta');
      const pinWrap = el('span');
      pinWrap.innerHTML = SVGS.pin;
      loc.append(pinWrap.firstElementChild, el('span', '', '登入以保存收藏與配對'));
      identity.append(loc);

      const loginBtn = button('登入', () => openLogin(), 'wfa-button-main');
      topRow.append(avatar, identity, loginBtn);
      profileCard.append(topRow);

      const draftScore = readiness({ answers: quizDraft });
      const archiveBtn = el('button', 'match-archive-card');
      archiveBtn.type = 'button';
      archiveBtn.addEventListener('click', () => openQuestionnaire());
      const iconBox = el('span', 'match-archive-icon');
      iconBox.innerHTML = SVGS.heart;
      const copyBox = el('span', 'match-archive-copy');
      copyBox.append(
        el('strong', '', draftScore !== null ? `領養準備度自評 · ${draftScore}%` : '領養準備度自評'),
        el(
          'p',
          '',
          draftScore !== null
            ? '已完成自評，點此登入以保存配對結果'
            : '訪客可直接填寫 6 題，完成後再選擇登入保存',
        ),
      );
      const ctaSpan = el('span', 'match-archive-cta');
      const arrowWrap = el('span');
      arrowWrap.innerHTML = SVGS.arrow;
      ctaSpan.append(el('span', '', draftScore !== null ? '保存' : '開始'), arrowWrap.firstElementChild);
      archiveBtn.append(iconBox, copyBox, ctaSpan);

      stack.append(profileCard, archiveBtn);
      accountView.replaceChildren(stack);
      logoutView?.replaceChildren();
      return;
    }

    const display = user.displayName || '我的帳戶';
    const initial = display.trim().slice(0, 1).toUpperCase();
    avatar.textContent = initial || '家';

    const identity = el('div', 'profile-identity');
    identity.append(el('h2', '', display));
    const loc = el('p', 'profile-meta');
    const pinWrap = el('span');
    pinWrap.innerHTML = SVGS.pin;
    loc.append(pinWrap.firstElementChild, el('span', '', `香港 · ${userLabel(user.provider)}`));
    identity.append(loc);

    topRow.append(avatar, identity);
    profileCard.append(topRow);

    const score = readiness(user.questionnaire);
    const favCount = Array.isArray(user.favorites) ? user.favorites.length : 0;
    const likeCount = Array.isArray(user.likes) ? user.likes.length : 0;

    const statsRow = el('div', 'profile-stats');
    for (const [val, labelText] of [
      [String(favCount), '收藏'],
      [String(likeCount), '點讚'],
      [score === null ? '待測' : `${score}%`, '準備度'],
    ]) {
      const cell = el('div', 'profile-stat-item');
      cell.append(el('strong', '', val), el('span', '', labelText));
      statsRow.append(cell);
    }
    profileCard.append(statsRow);

    const archiveBtn = el('button', 'match-archive-card');
    archiveBtn.type = 'button';
    archiveBtn.addEventListener('click', () => openQuestionnaire());
    const iconBox = el('span', 'match-archive-icon');
    iconBox.innerHTML = SVGS.heart;
    const copyBox = el('span', 'match-archive-copy');
    copyBox.append(
      el('strong', '', '領養準備度自評'),
      el('p', '', score === null ? '6 題評估並配對合適貓狗' : `準備度 ${score}% · 點擊更新偏好`),
    );
    const ctaSpan = el('span', score === null ? 'match-archive-cta is-primary' : 'match-archive-cta');
    const arrowWrap = el('span');
    arrowWrap.innerHTML = SVGS.arrow;
    ctaSpan.append(el('span', '', score === null ? '開始自評' : '更新'), arrowWrap.firstElementChild);
    archiveBtn.append(iconBox, copyBox, ctaSpan);

    stack.append(profileCard, archiveBtn);

    const issue = el('p', 'wfa-message');
    issue.setAttribute('role', 'alert');
    const out = button(
      '退出登入',
      async () => {
        out.disabled = true;
        try {
          await logout();
        } catch (problem) {
          issue.textContent = describeError(problem, '暫時無法登出，請再試一次。');
          out.disabled = false;
        }
      },
      'wfa-button-clear wfa-logout',
    );

    if (logoutView) logoutView.replaceChildren(issue, out);
    else stack.append(issue, out);
    accountView.replaceChildren(stack);
  }

  return {
    load,
    setUser,
    getUser: () => user,
    requireUser,
    requireQuestionnaire,
    openLogin,
    openQuestionnaire,
    view(root, bottom = null) {
      accountView = root;
      logoutView = bottom;
      renderAccount();
    },
  };
}
