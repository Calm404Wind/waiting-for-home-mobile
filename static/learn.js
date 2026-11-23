const AFCD = 'https://www.pets.gov.hk/tc_chi/proper_care_of_pets/before_getting_a_pet.html';
const PROCESS = 'https://www.spca.org.hk/adoption/adoption-services/adoption-process/';
const CARE = 'https://www.pets.gov.hk/english/proper_care_of_pets/cats/proper-care.html';
const ADOPTION = 'https://pets.gov.hk/english/animal_health_and_welfare/adoption.html';

const articles = [
  {title:'領養前，怎樣估算養寵開支？', summary:'日常開支、醫療儲備與外遊照顧。',
    sections: [['列一張每月預算','列出飼料、日用品、清潔及日常照顧，再加上每年定期檢查、交通和外遊照顧。先了解機構的領養費和費用所涵蓋的項目。'],
      ['預留醫療開支','動物可能隨年紀增長而需要獸醫護理。可向機構詢問已知健康紀錄，再按自己的預算和照顧能力作決定。']], source:['漁護署｜飼養寵物前', AFCD]},
  {title:'看品種之外，還要看甚麼？', summary:'從活動量、個性與家庭安排了解動物。',
    sections: [['先看實際照顧需要','閱讀機構對動物個性、活動量和生活環境的描述。遇到檔案欄位未明，可直接向照顧牠的機構詢問。'],
      ['問機構能否安排見面','把家中成員、其他寵物、你每天能陪伴的時間告訴機構。品種欄和外表無法代替一隻動物的觀察與健康紀錄。']], source:['漁護署｜領養動物資訊', ADOPTION]},
  {title:'家訪和窗網，要先準備甚麼？', summary:'核對住所規定，再向領養機構確認。',
    sections: [['確認你的住所','先確認租約、大廈規則及家人意願。詢問機構是否要查看住址證明、物業確認或安排家訪。'],
      ['逐一檢查開口與通道','向領養機構確認窗戶、陽台、門口和其他可外出的通道需要甚麼防護。有其他寵物也可在見面前告知機構。']], source:['香港愛護動物協會｜領養程序', PROCESS]},
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

function sheet(title, render) {
  const dialog = node('dialog', '', 'learn-modal');
  const bar = node('header', '', 'learn-bar');
  const close = node('button', '返回', 'app-action app-action-soft');
  close.type = 'button';
  close.autofocus = true;
  close.onclick = () => dialog.close();
  bar.append(close, node('strong', '領養前閱讀'));
  const body = node('div', '', 'learn-body');
  const heading = node('h2', title);
  heading.id = 'learn-dialog-title';
  dialog.setAttribute('aria-labelledby', heading.id);
  body.append(heading);
  render(body);
  dialog.append(bar, body);
  document.body.append(dialog);
  const before = document.activeElement;
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (before instanceof HTMLElement && before.isConnected) before.focus({preventScroll: true});
  }, {once: true});
  dialog.showModal();
}

export function mountArticles(root) {
  for (const article of articles) {
    const control = node('button', '', 'learn-tile');
    control.type = 'button';
    control.append(node('strong', article.title), node('span', article.summary));
    control.onclick = () => sheet(article.title, body => {
      for (const [heading, copy] of article.sections) body.append(node('h3', heading), node('p', copy));
      body.append(source(...article.source));
    });
    root.append(control);
  }
}

export function openGuide() {
  sheet('領養流程指南', body => {
    for (const [title, copy] of [
      ['先確認住所和照顧安排','查閱租約或住所規定，和家人討論日常分工及預算。'],
      ['閱讀動物檔案','用探索頁找到想認識的動物，從來源頁核對近期狀態和聯絡方式。'],
      ['聯絡機構，了解見面和家訪','不同機構會列出自己的程序。詢問見面、住址證明、家訪和防護設施等要求。'],
      ['跟進正式領養','由機構提供申請及審核安排。完成流程後再按機構建議讓動物適應新家。'],
    ]) {
      body.append(node('h3', title), node('p', copy));
      if (title.startsWith('聯絡')) {
        const tip = node('details', '', 'learn-tip');
        tip.append(node('summary', '？ 家訪前可先問甚麼'), node('p', '可先問窗網、陽台防護和其他寵物的安排，避免到訪當日才發現需要補準備。'));
        body.append(tip);
      }
    }
    body.append(source('查看機構的程序示例', PROCESS), source('查看貓隻照顧資料', CARE));
  });
}
