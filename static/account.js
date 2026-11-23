const QUESTIONS = [
  ['budget', '你準備好長期照顧的預算了嗎？', '想想食物、日常用品、疫苗和突發醫療開支。',
    ['已有固定預算及應急安排', '正在計算開支及預留費用', '還未評估'] ],
  ['time', '平日能安排多少照顧時間？', '陪伴、清潔、活動和覆診都需要時間和精力。',
    ['已安排每日照顧時間', '可以重新安排生活作息', '還不確定能投入多少時間'] ],
  ['screens', '居家安全措施準備得如何？', '依照動物的需要檢查窗網、門窗及露台。',
    ['已檢查及做好適用防護', '已有計劃，仍待完成', '還未檢查'] ],
  ['housing', '住處和同住的人都允許養寵嗎？', '如果租住單位，可查閱租約並取得所需同意。',
    ['已確認租約或住戶規定及同住者同意', '正在核實或取得同意', '還未確認'] ],
  ['travel', '離家時，誰會照顧牠？', '也想想出差、旅行或臨時生病的情況。',
    ['已確認可靠的代照顧安排', '有初步人選，仍待確認', '還沒想到安排'] ],
  ['furniture', '你能接受家居和生活方式的變化嗎？', '幼年或新來的動物可能需要一段時間適應。',
    ['已接受並準備調整家居及習慣', '願意調整，還要做準備', '目前還不確定'] ],
];
const ANSWERS = ['ready', 'planned', 'unsure'];
const PREFERENCES = [
  ['preferredSpecies', '想領養的動物', [['either', '貓狗都可以'], ['cat', '貓'], ['dog', '狗']]],
  ['preferredSize', '體型偏好', [['either', '不限體型'], ['small', '小型'], ['medium', '中型'], ['large', '大型']]],
];

const STYLE = `
.wfa-dialog{box-sizing:border-box;position:fixed;inset:0;margin:auto;width:min(100%,460px);max-width:100%;max-height:min(100dvh,800px);overflow:auto;border:1px solid #ead6c2;padding:0;border-radius:24px;color:var(--app-ink,#422b21);background:#fff9ed;font-family:inherit;box-shadow:0 18px 55px #5338224d}
.wfa-dialog::backdrop{background:#39281e77}
.wfa-top{position:sticky;z-index:1;top:0;display:flex;align-items:center;justify-content:space-between;min-height:56px;gap:12px;padding:calc(8px + env(safe-area-inset-top,0px)) 18px 8px;background:#fff9ed;border-bottom:1px solid #eedcca}
.wfa-top .wfa-kicker{font-size:.87rem;color:#774b36;font-weight:760}
.wfa-body{padding:21px 20px calc(23px + env(safe-area-inset-bottom,0px))}
.wfa-title{font-size:2rem;letter-spacing:-.055em;line-height:1.13;margin:0 0 9px;font-weight:850;font-family:var(--app-display,inherit)}
.wfa-intro,.wfa-note{font-size:.86rem;color:#735747;line-height:1.55;margin:0 0 15px}
.wfa-note{font-size:.78rem;margin:9px 0 0}
.wfa-button{min-height:44px;border:1px solid #edc7a6;border-radius:12px;color:#66371f;background:#fff4e5;padding:8px 12px;font-size:.89rem;font-weight:770;cursor:pointer}
.wfa-button:disabled{cursor:default;opacity:.55}
.wfa-button-main{background:#f4a261;border-color:#e69456;color:#452518}
.wfa-button-clear{background:transparent;border-color:transparent;padding-inline:8px}
.wfa-button-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.wfa-mode{display:grid;grid-template-columns:1fr 1fr;align-items:stretch;gap:4px;padding:3px;background:#f8e8d6;border-radius:14px;margin-bottom:15px}
.wfa-mode .wfa-button{border-color:transparent;background:transparent}
.wfa-mode .wfa-button[aria-pressed=true]{background:#fffaf1;border-color:#ead1ba;color:#7a3c21}
.wfa-form{display:grid;gap:10px}
.wfa-label{display:grid;gap:5px;font-size:.84rem;font-weight:710}
.wfa-field{box-sizing:border-box;background:#fffdf7;color:#472d21;border:1px solid #ead7c4;border-radius:12px;min-height:46px;max-width:100%;width:100%;font-size:16px;padding:9px 11px}
.wfa-password{display:flex;position:relative}
.wfa-password input{padding-inline-end:76px}
.wfa-password .wfa-button{position:absolute;right:2px;top:1px;bottom:1px;min-height:43px;font-size:.79rem}
.wfa-form .wfa-button-main{min-height:47px}
.wfa-message{color:#a33d2c;font-size:.83rem;line-height:1.5;margin:0;overflow-wrap:anywhere}
.wfa-message:empty{display:none}
.wfa-divider{margin:15px 0 8px;text-align:center;font-size:.78rem;color:#695446}
.wfa-guest-row{display:flex;justify-content:center;margin:5px 0 0}
.wfa-privacy{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin:6px 0 0;font-size:.81rem;color:#805035}
.wfa-privacy .wfa-terms{background:transparent;border:0;padding:0;color:inherit;font:inherit;text-decoration:underline;cursor:pointer;min-height:40px}
.wfa-privacy a{display:inline-flex;align-items:center;min-height:40px}
.wfa-progress-label{display:block;font-size:.8rem;font-weight:740;color:#77523e;margin-bottom:6px}
.wfa-progress{display:block;width:100%;height:8px;margin:0 0 16px;accent-color:#c16e43}
.wfa-choices{display:grid;gap:9px;margin:13px 0 15px;padding:0;border:0;min-width:0}
.wfa-option{box-sizing:border-box;display:flex;gap:9px;align-items:center;min-height:49px;background:#fffdf7;border:1px solid #ead7c4;border-radius:12px;padding:9px 11px;font-size:.9rem;line-height:1.35;cursor:pointer}
.wfa-option:has(input:checked){border-color:#ca7d54;background:#ffecd8}
.wfa-option input{flex:none;accent-color:#a9532a;height:18px;width:18px;margin:0}
.wfa-preferences{display:grid;gap:10px;margin:0 0 16px}
.wfa-card{display:grid;gap:9px;border:1px solid #edd8c1;background:#fffaf1;border-radius:17px;padding:14px;margin:12px 0}
.wfa-card h2{font-size:1.1rem;margin:0;line-height:1.3;overflow-wrap:anywhere}
.wfa-card p{color:#684e40;font-size:.84rem;line-height:1.45;margin:0}
.wfa-match{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.wfa-match strong{color:#834426;font-size:.94rem}
.wfa-match p{margin-top:4px}
.wfa-card .wfa-divider{margin:0}
.wfa-logout{width:fit-content;color:#8b392c}
.wfa-dialog :focus-visible,.wfa-card :focus-visible{outline:2px solid #a24e28;outline-offset:3px}
@media(max-width:559px){.wfa-dialog{margin:0 auto;width:100%;max-height:100dvh;height:100dvh;border-radius:0;border:0}.wfa-body{padding-top:23px}}
`;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action, className = '') {
  const control = el('button', `wfa-button ${className}`, text);
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
  return { google: 'Google 流程模擬帳戶', apple: 'Apple 流程模擬帳戶' }[provider] || '本機 Demo 帳戶';
}

function readiness(questionnaire) {
  const score = questionnaire?.score;
  if (Number.isFinite(score) && score >= 0 && score <= 100) return Math.round(score);
  const answers = questionnaire?.answers;
  if (!answers || !QUESTIONS.every(([key]) => ANSWERS.includes(answers[key]))) return null;
  const weight = { ready: 2, planned: 1, unsure: 0 };
  const points = QUESTIONS.reduce((sum, [key]) => sum + weight[answers[key]], 0);
  return Math.round(points * 100 / (QUESTIONS.length * 2));
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
    const close = button('返回', () => finish(), 'wfa-button-clear');
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
    modal.addEventListener('close', () => {
      modal.remove();
      if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
      resolve(result);
    }, {once:true});
    const lock = value => {
      locked = value;
      for (const control of bar.querySelectorAll('button')) control.disabled = value;
      content.toggleAttribute('inert', value);
      modal.setAttribute('aria-busy', String(value));
    };
    build({content, bar, close, finish, lock});
    document.body.append(modal);
    modal.showModal();
  });
}

export function createAccount({api, onChange, navigate}) {
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
    if (oldId !== user?.id) quizDraft = {};
    loaded = true;
    renderAccount();
    onChange?.(user);
    return user;
  }

  function load({refresh = false} = {}) {
    if (loaded && !refresh) return Promise.resolve(user);
    if (loadRequest) return loadRequest;
    loadRequest = api.get('/api/account').then(payload => setUser(payload.user)).catch(() => user).finally(() => {
      loadRequest = null;
    });
    return loadRequest;
  }

  function openLogin({reason = '', mode = 'login', onboarding = true, allowGuest = true} = {}) {
    if (loginRequest) return loginRequest;
    loginRequest = openModal('登入／註冊', ({content, finish, lock}) => {
      const issue = el('p', 'wfa-message');
      issue.setAttribute('role', 'alert');
      const intro = el('p', 'wfa-intro', reason ? `${reason}前先登入帳戶。` : '登入後可使用收藏和領養準備功能。');
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
      identifier.placeholder = '手機號或電郵';
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
      const toggle = button('顯示密碼', () => {
        const visible = password.type === 'password';
        password.type = visible ? 'text' : 'password';
        toggle.textContent = visible ? '隱藏密碼' : '顯示密碼';
        toggle.setAttribute('aria-pressed', String(visible));
      }, 'wfa-button-clear');
      toggle.setAttribute('aria-pressed', 'false');
      passwordRow.append(password, toggle);
      passLabel.append(passwordRow);
      const submit = el('button', 'wfa-button wfa-button-main', '登入');
      submit.type = 'submit';
      form.append(nameLabel, passLabel, issue, submit);

      function setMode(next) {
        mode = next;
        login.setAttribute('aria-pressed', String(mode === 'login'));
        register.setAttribute('aria-pressed', String(mode === 'register'));
        submit.textContent = mode === 'register' ? '建立本機帳戶' : '登入';
        password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
        password.minLength = mode === 'register' ? 8 : 0;
        password.placeholder = mode === 'register' ? '至少 8 個字元' : '輸入密碼';
        issue.textContent = '';
      }

      let busy = false;
      async function authenticate(path, payload, newAccount) {
        if (busy) return;
        busy = true;
        issue.textContent = '';
        lock(true);
        const previous = submit.textContent;
        submit.textContent = '連接中…';
        let authenticated;
        try {
          const result = await api.post(path, payload);
          if (!result.user) throw new Error('帳戶服務未傳回資料。');
          authenticated = setUser(result.user);
        } catch (error) {
          issue.textContent = describeError(error, '暫時無法登入，請稍後再試。');
        } finally {
          busy = false;
          submit.textContent = previous;
          lock(false);
        }
        if (authenticated) finish({user: authenticated, onboarding: newAccount || Boolean(authenticated.needsOnboarding)});
      }

      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = identifier.value.trim();
        if (!value) {
          issue.textContent = '請輸入手機號或電郵。';
          identifier.focus();
          return;
        }
        authenticate(`/api/auth/${mode}`, {identifier: value, password: password.value}, mode === 'register');
      });
      const choices = el('div', 'wfa-button-grid');
      for (const [provider, display] of [['google', 'Google'], ['apple', 'Apple']]) {
        choices.append(button(`${display} 模擬`, () => authenticate('/api/auth/demo-provider', {provider}, true)));
      }
      const privacy = el('div', 'wfa-privacy');
      const privacyLink = el('a', '', '資料與隱私');
      privacyLink.href = '#privacy-policy';
      privacyLink.addEventListener('click', () => finish());
      const terms = button('用戶協議', () => openModal('Demo 使用約定', ({content: termsBody}) => {
        termsBody.append(el('h2', 'wfa-title', '使用約定'),
          el('p', 'wfa-intro', '此課堂 Demo 展示公開動物檔案及領養準備流程。動物狀態、中心地址及申請要求以機構的官網資料為準。'),
          el('p', 'wfa-intro', '本機帳戶用於保存收藏和準備問卷。領養按鈕會帶你到機構網站，你可以在該站查看正式申請方式。'));
      }), 'wfa-terms');
      privacy.append(terms, privacyLink);
      content.append(el('h2', 'wfa-title', '歡迎來到等一個家'), intro, segment, form,
        el('p', 'wfa-divider', '本機模擬第三方登入'), choices);
      if (allowGuest) {
        const guest = el('div', 'wfa-guest-row');
        guest.append(button('以訪客身份瀏覽', () => finish(), 'wfa-button-clear'));
        content.append(guest);
      }
      content.append(privacy);
      setMode(mode === 'register' ? 'register' : 'login');
    }).then(async result => {
      if (!result) return null;
      if (onboarding && result.onboarding && !hasQuestionnaire(result.user)) {
        await openQuestionnaire();
      }
      return user;
    }).finally(() => { loginRequest = null; });
    return loginRequest;
  }

  async function requireUser(reason = '繼續') {
    const active = await load();
    if (active) return active;
    return openLogin({reason, onboarding: !String(reason).includes('領養'), allowGuest: false});
  }

  function openQuestionnaire({required = false} = {}) {
    if (!user) return Promise.resolve(null);
    if (quizRequest) return quizRequest;
    const original = user.questionnaire?.answers ?? {};
    const answers = {...original, ...quizDraft};
    let step = QUESTIONS.findIndex(([key]) => !ANSWERS.includes(answers[key]));
    if (step < 0) step = hasQuestionnaire(user) ? 0 : QUESTIONS.length;
    quizRequest = openModal(required ? '領養前準備' : '領養準備問卷', ({content, bar, close, finish, lock}) => {
      if (!required) bar.append(button('跳過', () => finish(), 'wfa-button-clear'));
      close.textContent = required ? '返回檔案' : '返回';
      const error = el('p', 'wfa-message');
      error.setAttribute('role', 'alert');
      let busy = false;

      const render = (moveFocus = false) => {
        const answered = QUESTIONS.filter(([name]) => ANSWERS.includes(answers[name])).length;
        const choosingPreferences = step === QUESTIONS.length;
        const label = el('span', 'wfa-progress-label', choosingPreferences ? `領養偏好 · 已完成 ${answered} 項準備題` :
          `第 ${step + 1}／${QUESTIONS.length} 題 · 已完成 ${answered} 項`);
        const progress = el('progress', 'wfa-progress');
        progress.max = QUESTIONS.length;
        progress.value = answered;
        progress.setAttribute('aria-label', '準備問卷完成進度');
        const actions = el('div', 'wfa-button-grid');
        const prev = button('上一題', () => { step--; render(true); });
        prev.disabled = step === 0;
        const next = button(choosingPreferences ? '完成問卷' : step === QUESTIONS.length - 1 ? '下一步' : '下一題', advance, 'wfa-button-main');
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
              quizDraft = {...answers};
            });
            row.append(control);
            preferences.append(row);
          }
          const tip = el('p', 'wfa-intro', '可直接儲存預設選項。這些偏好用來推薦檔案，準備度只按前六題計算。');
          content.replaceChildren(label, progress, question, tip, preferences, error, actions);
          if (moveFocus) question.focus();
          return;
        }
        const [key, title, tip, options] = QUESTIONS[step];
        const description = el('p', 'wfa-intro', tip);
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
            quizDraft = {...answers};
            progress.value = QUESTIONS.filter(([name]) => ANSWERS.includes(answers[name])).length;
            label.textContent = `第 ${step + 1}／${QUESTIONS.length} 題 · 已完成 ${progress.value} 項`;
            next.disabled = false;
            error.textContent = '';
          });
          row.append(input, el('span', '', text));
          choices.append(row);
        }
        content.replaceChildren(label, progress, question, description, choices, error, actions);
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
        busy = true;
        lock(true);
        let complete;
        try {
          const payload = Object.fromEntries([...QUESTIONS, ...PREFERENCES].map(([key]) => [key, answers[key]]));
          const result = await api.put('/api/account/questionnaire', {answers: payload});
          if (!hasQuestionnaire(result.user)) throw new Error('問卷尚未儲存，請再試一次。');
          complete = setUser(result.user);
          quizDraft = {};
        } catch (issue) {
          error.textContent = describeError(issue, '暫時無法儲存問卷，請稍後再試。');
        } finally {
          busy = false;
          lock(false);
        }
        if (complete) finish(complete);
      }

      render();
    }).finally(() => { quizRequest = null; });
    return quizRequest;
  }

  async function requireQuestionnaire() {
    const active = await requireUser('申請領養');
    if (!active) return null;
    return hasQuestionnaire(active) ? active : openQuestionnaire({required: true});
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
    if (!user) {
      const guest = el('section', 'wfa-card');
      guest.append(el('h2', '', '訪客瀏覽'), el('p', '', '登入後可收藏動物、填寫準備問卷和使用申請流程。'),
        button('登入／註冊', () => openLogin(), 'wfa-button-main'));
      accountView.replaceChildren(guest);
      logoutView?.replaceChildren();
      return;
    }
    const card = el('section', 'wfa-card');
    const title = el('h2', '', user.displayName || '我的帳戶');
    const score = readiness(user.questionnaire);
    const match = el('div', 'wfa-match');
    const labels = el('div');
    labels.append(el('strong', '', '我的匹配檔案'), el('p', '', score === null ? '待完善' : `領養準備度 ${score}%`));
    const action = button(score === null ? '填寫問卷' : '更新問卷', () => openQuestionnaire());
    match.append(labels, action);
    const issue = el('p', 'wfa-message');
    issue.setAttribute('role', 'alert');
    const out = button('退出登入', async () => {
      out.disabled = true;
      try { await logout(); }
      catch (problem) {
        issue.textContent = describeError(problem, '暫時無法登出，請再試一次。');
        out.disabled = false;
      }
    }, 'wfa-button-clear wfa-logout');
    card.append(title, el('p', '', userLabel(user.provider)), match);
    if (score !== null) card.append(el('p', 'wfa-note', '六項自我評估等權計分。已準備得 2 分、規劃中得 1 分，尚待確認得 0 分。領養審核由機構處理。'));
    if (logoutView) logoutView.replaceChildren(issue, out);
    else card.append(issue, out);
    accountView.replaceChildren(card);
  }

  return {load, setUser, getUser: () => user, requireUser, requireQuestionnaire, openLogin, openQuestionnaire,
    view(root, bottom = null) { accountView = root; logoutView = bottom; renderAccount(); }};
}
