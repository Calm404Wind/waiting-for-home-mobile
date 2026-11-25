const AFCD = 'https://www.pets.gov.hk/tc_chi/proper_care_of_pets/before_getting_a_pet.html';
const PROCESS = 'https://www.spca.org.hk/adoption/adoption-services/adoption-process/';
const CARE = 'https://www.pets.gov.hk/english/proper_care_of_pets/cats/proper-care.html';
const ADOPTION = 'https://pets.gov.hk/english/animal_health_and_welfare/adoption.html';

const ARTWORKS = {
  budget: `<svg viewBox="0 0 360 140" fill="none" aria-hidden="true">
    <circle cx="290" cy="28" r="64" fill="#FFF3E0" fill-opacity="0.45"/>
    <circle cx="64" cy="118" r="52" fill="#E07630" fill-opacity="0.16"/>
    <rect x="122" y="26" width="116" height="88" rx="22" fill="#FFFDF9" fill-opacity="0.92"/>
    <path d="M156 68c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="#D66A24" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="180" cy="80" rx="14" ry="11" fill="#F4A261"/>
    <circle cx="163" cy="64" r="5" fill="#E07630"/>
    <circle cx="197" cy="64" r="5" fill="#E07630"/>
    <circle cx="173" cy="54" r="4.5" fill="#E07630"/>
    <circle cx="187" cy="54" r="4.5" fill="#E07630"/>
  </svg>`,
  match: `<svg viewBox="0 0 360 140" fill="none" aria-hidden="true">
    <circle cx="72" cy="30" r="58" fill="#FFF3E0" fill-opacity="0.48"/>
    <circle cx="296" cy="114" r="56" fill="#C8581D" fill-opacity="0.14"/>
    <rect x="122" y="26" width="116" height="88" rx="22" fill="#FFFDF9" fill-opacity="0.92"/>
    <path d="M198.5 58.2c-4.7-4.8-12.3-4.8-17 0l-1.5 1.5-1.5-1.5c-4.7-4.8-12.3-4.8-17 0-5 5.1-5 13.3 0 18.4L180 95l18.5-18.4c5-5.1 5-13.3 0-18.4Z" fill="#FAD4B4" stroke="#C8581D" stroke-width="3.4" stroke-linejoin="round"/>
  </svg>`,
  home: `<svg viewBox="0 0 360 140" fill="none" aria-hidden="true">
    <circle cx="284" cy="34" r="60" fill="#FFF3E0" fill-opacity="0.46"/>
    <circle cx="68" cy="112" r="50" fill="#E07630" fill-opacity="0.16"/>
    <rect x="122" y="26" width="116" height="88" rx="22" fill="#FFFDF9" fill-opacity="0.92"/>
    <path d="M154 68 180 46l26 22" stroke="#C8581D" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M161 63v30h38V63" fill="#FDE8CF" stroke="#C8581D" stroke-width="3.2" stroke-linejoin="round"/>
    <rect x="174.5" y="74" width="11" height="19" rx="3" fill="#E07630"/>
  </svg>`,
};

const articles = [
  {
    kicker: '開支預算',
    art: 'budget',
    title: '養寵長期開支估算',
    summary: '日常糧食、定期疫苗與突發醫療儲備。',
    sections: [
      ['每月與年度固定開支', '預算飼料、日用品、每年體檢疫苗及外遊代照顧；同時確認機構領養費涵蓋的絕育或晶片項目。'],
      ['突發醫療儲備', '隨年紀增長或轉季可能需獸醫診治，建議預留應急資金並先向機構了解已知健康紀錄。'],
    ],
    source: ['漁護署｜飼養寵物前須知 ↗', AFCD],
  },
  {
    kicker: '性格配對',
    art: 'match',
    title: '品種與年齡之外看甚麼？',
    summary: '從活動量、性格與家庭作息找到合拍夥伴。',
    sections: [
      ['觀察性格與照顧需求', '細閱機構對個性與活動量的描述；欄位未明處可直接向義工或暫養家庭查詢。'],
      ['預約見面與溝通作息', '如實告知家庭成員、現有寵物及每日陪伴時間，親身互動比品種標籤更重要。'],
    ],
    source: ['漁護署｜領養動物資訊 ↗', ADOPTION],
  },
  {
    kicker: '居家安全',
    art: 'home',
    title: '公契、家訪與窗網須知',
    summary: '確認住處規定與門窗防護，安心迎接新成員。',
    sections: [
      ['核對大廈公契與租約', '確認租約、公契及同住家人意願，並了解機構是否需查閱住址證明或安排家訪。'],
      ['安裝穩固窗網與圍欄', '按機構規格檢查窗戶、露台及大門防護；若有原住寵物可預先準備隔離空間。'],
    ],
    source: ['愛護動物協會｜領養程序 ↗', PROCESS],
  },
];

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function source(title, url) {
  const anchor = node('a', title, 'learn-source');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function sheet(kickerText, title, render) {
  const dialog = node('dialog', '', 'learn-modal');
  const bar = node('header', '', 'learn-bar');
  const close = node('button', '‹ 返回', 'app-action app-action-soft');
  close.type = 'button';
  close.autofocus = true;
  close.onclick = () => dialog.close();
  bar.append(node('strong', kickerText), close);
  const body = node('div', '', 'learn-body');
  const heading = node('h2', title);
  heading.id = 'learn-dialog-title';
  dialog.setAttribute('aria-labelledby', heading.id);
  body.append(heading);
  render(body);
  dialog.append(bar, body);
  document.body.append(dialog);
  const before = document.activeElement;
  dialog.addEventListener(
    'close',
    () => {
      dialog.remove();
      if (before instanceof HTMLElement && before.isConnected) before.focus({ preventScroll: true });
    },
    { once: true },
  );
  dialog.showModal();
}

function openArticle(article) {
  sheet(article.kicker || '領養前閱讀', article.title, body => {
    for (const [heading, copy] of article.sections) {
      body.append(node('h3', heading), node('p', copy));
    }
    body.append(source(...article.source));
  });
}

let stopActiveCarousel = null;

export function mountArticles(root) {
  if (stopActiveCarousel) {
    stopActiveCarousel();
    stopActiveCarousel = null;
  }
  root.replaceChildren();
  if (!articles.length) return;

  const carousel = node('div', '', 'learn-carousel');
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', '播片');
  carousel.setAttribute('aria-label', '領養前必讀輪播');

  const viewport = node('div', '', 'learn-viewport');
  const track = node('div', '', 'learn-track');

  let index = 0;
  let paused = false;
  let swiped = false;

  const slides = articles.map((article, i) => {
    const slide = node('button', '', `learn-slide learn-slide-${article.art}`);
    slide.type = 'button';
    slide.setAttribute('aria-label', `${article.kicker}：${article.title}`);

    const art = node('div', '', 'article-art');
    art.innerHTML = ARTWORKS[article.art] || '';

    const body = node('div', '', 'learn-slide-body');
    const copy = node('div', '', 'learn-slide-copy');
    copy.append(
      node('span', article.kicker, 'article-kicker'),
      node('h3', article.title),
      node('p', article.summary),
    );
    const chevron = node('span', '›', 'learn-slide-chevron');
    chevron.setAttribute('aria-hidden', 'true');
    body.append(copy, chevron);

    slide.append(art, body);
    slide.addEventListener('click', event => {
      if (swiped) {
        swiped = false;
        event.preventDefault();
        return;
      }
      openArticle(article);
    });
    slide.dataset.slideIndex = String(i);
    track.append(slide);
    return slide;
  });

  viewport.append(track);

  const controls = node('div', '', 'learn-controls');
  const dotsWrap = node('div', '', 'learn-dots');
  const dots = articles.map((article, i) => {
    const dotBtn = node('button', '', 'learn-dot-btn');
    dotBtn.type = 'button';
    dotBtn.setAttribute('aria-label', `切換至第 ${i + 1} 篇：${article.title}`);
    const pill = node('span', '', 'learn-dot-pill');
    pill.setAttribute('aria-hidden', 'true');
    dotBtn.append(pill);
    dotBtn.onclick = () => {
      goToSlide(i);
      restartTimer();
    };
    dotsWrap.append(dotBtn);
    return dotBtn;
  });

  const arrowsWrap = node('div', '', 'learn-arrows');
  const prevBtn = node('button', '‹', 'learn-arrow-btn');
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', '上一篇領養須知');
  prevBtn.onclick = () => {
    goToSlide(index - 1);
    restartTimer();
  };

  const nextBtn = node('button', '›', 'learn-arrow-btn');
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', '下一篇領養須知');
  nextBtn.onclick = () => {
    goToSlide(index + 1);
    restartTimer();
  };
  arrowsWrap.append(prevBtn, nextBtn);
  controls.append(dotsWrap, arrowsWrap);

  carousel.append(viewport, controls);
  root.append(carousel);

  function goToSlide(nextIndex) {
    const total = articles.length;
    index = ((nextIndex % total) + total) % total;
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.inert = !active;
      slide.tabIndex = active ? 0 : -1;
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timerId = 0;

  function canAutoPlay() {
    if (paused || reducedMotion.matches || document.hidden) return false;
    const homeScreen = document.getElementById('home');
    if (homeScreen && homeScreen.hidden) return false;
    if (document.querySelector('dialog[open]')) return false;
    return true;
  }

  function restartTimer() {
    if (timerId) clearInterval(timerId);
    timerId = window.setInterval(() => {
      if (canAutoPlay()) goToSlide(index + 1);
    }, 3800);
  }

  let startX = 0;
  let startY = 0;
  let tracking = false;

  viewport.addEventListener('pointerdown', event => {
    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
    swiped = false;
  });

  viewport.addEventListener('pointerup', event => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped = true;
      goToSlide(dx < 0 ? index + 1 : index - 1);
      restartTimer();
    }
  });

  viewport.addEventListener('pointercancel', () => {
    tracking = false;
  });

  carousel.addEventListener('mouseenter', () => { paused = true; });
  carousel.addEventListener('mouseleave', () => { paused = false; });
  carousel.addEventListener('focusin', () => { paused = true; });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) paused = false;
  });

  goToSlide(0);
  restartTimer();

  stopActiveCarousel = () => {
    if (timerId) clearInterval(timerId);
  };
}

export function openGuide() {
  sheet('領養流程', '四步完成領養', body => {
    const stepsWrap = node('div', '', 'process-steps');
    const steps = [
      ['01', '確認住處與共識', '查閱公契或租約，與家人確認照顧分工與預算。'],
      ['02', '篩選公開名錄', '滑動瀏覽貓狗檔案，核對官網連結與觀察紀錄。'],
      ['03', '預約見面與家訪', '填交申請、親身互動，並按要求備妥窗網防護。'],
      ['04', '辦理手續回家', '完成審核後接回新成員，預留首兩週安靜適應。'],
    ];
    for (const [num, title, copy] of steps) {
      const card = node('article', '', 'process-step-card');
      const badge = node('span', num, 'process-step-num');
      const content = node('div');
      content.append(node('h3', title), node('p', copy));
      card.append(badge, content);
      stepsWrap.append(card);
    }
    body.append(stepsWrap, source('機構領養程序示例 ↗', PROCESS), source('貓隻照顧指南 ↗', CARE));
  });
}
