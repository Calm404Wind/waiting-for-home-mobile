const SVG = 'http://www.w3.org/2000/svg';
const numberFormat = new Intl.NumberFormat('zh-HK');

const styles = `
.mobile-insights{--mi-paper:#fffbf6;--mi-ink:#332723;--mi-muted:#706057;--mi-border:#f2decc;--mi-accent:#a94222;--mi-orange:#e9774b;--mi-warm:#fce8d6;--mi-green:#3c7767;color:var(--mi-ink);display:grid;gap:.9rem;min-width:0}
.mobile-insights *{box-sizing:border-box}.mobile-insights :is(button,select){font:inherit;color:inherit}.mobile-insights :is(button,select,a,[tabindex]):focus-visible{outline:2px solid var(--mi-accent);outline-offset:3px}
.mi-header h2,.mi-panel h3,.mi-centre-card h4,.mi-samples h4{margin:0;line-height:1.22}.mi-header h2{font-size:1.52rem;font-weight:850}.mi-panel h3{font-size:1.145rem;font-weight:820}.mi-header p,.mi-panel>p,.mi-note{margin:.3rem 0 0;color:var(--mi-muted);font-size:.79rem;line-height:1.55}
.mi-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.25rem;background:#f7eadc;padding:.265rem;border-radius:1.04rem}.mi-tab{border:0;border-radius:.79rem;min-height:44px;background:transparent;color:#59483b;font-weight:710;font-size:.8rem;cursor:pointer}.mi-tab[aria-pressed=true]{background:#fffaf3;color:#96391c;box-shadow:0 1px 4px #79543a22}
.mi-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.55rem}.mi-filters{display:flex;gap:.33rem}.mi-filter,.mi-select{min-height:44px;border-radius:999px;border:1px solid var(--mi-border);background:var(--mi-paper);padding:.4rem .73rem;font-size:.78rem}.mi-filter{min-width:44px;cursor:pointer}.mi-filter[aria-pressed=true]{background:#fce5d4;border-color:#eebda0;color:#8d3419;font-weight:760}.mi-select{max-width:100%;padding-inline:.7rem;cursor:pointer;min-width:0}.mi-org{flex:1 1 9rem;max-width:15rem}
.mi-load{display:grid;gap:.65rem;justify-items:start;background:var(--mi-paper);border:1px solid var(--mi-border);border-radius:1.1rem;padding:1.05rem;color:var(--mi-muted);font-size:.86rem}.mi-content{min-width:0;display:grid;gap:.84rem}
.mi-summary{display:grid;grid-template-columns:1.3fr 1fr;gap:.6rem}.mi-stat{display:grid;gap:.28rem;align-content:center;min-width:0;border:1px solid var(--mi-border);border-radius:1rem;background:var(--mi-paper);padding:.68rem .78rem}.mi-stat:first-child{background:#ffead8;border-color:#f6d4b7}.mi-stat strong{font-weight:870;line-height:1;color:#493123;font-size:1.34rem;letter-spacing:-.04em;font-variant-numeric:tabular-nums}.mi-stat span{font-size:.7rem;line-height:1.3;color:var(--mi-muted);overflow-wrap:anywhere}
.mi-panel,.mi-samples{display:grid;gap:.77rem;min-width:0;border:1px solid var(--mi-border);border-radius:1.28rem;background:var(--mi-paper);padding:clamp(.76rem,3.8vw,1.05rem)}.mi-panel>p{margin:-.43rem 0 0}.mi-map{border-radius:.93rem;overflow:hidden;background:#ebf1e8;border:1px solid #e1e8dc;min-width:0}.mi-map svg,.mi-plot svg{display:block;width:100%;height:auto}.mi-terrain{fill:#fff8e8;stroke:#aabf9e;stroke-width:.8;vector-effect:non-scaling-stroke;pointer-events:none}.mi-marker{cursor:pointer}.mi-marker .mi-marker-bubble{fill:#446f62;stroke:#fff9ed;stroke-width:2;vector-effect:non-scaling-stroke}.mi-marker.mi-empty .mi-marker-bubble{fill:#9da89a}.mi-marker[aria-pressed=true] .mi-marker-bubble{fill:#bb4a26;stroke-width:2.6}.mi-marker text{fill:white;text-anchor:middle;dominant-baseline:central;font-size:9px;font-weight:800;pointer-events:none}
.mi-centre-select{width:100%;border-radius:.75rem}.mi-centre-card{display:grid;gap:.38rem;min-width:0;border-radius:.9rem;padding:.75rem;background:#faeee0}.mi-centre-card img{width:100%;max-height:8.25rem;object-fit:cover;border-radius:.55rem}.mi-centre-card h4,.mi-centre-card p{overflow-wrap:anywhere}.mi-centre-card p{margin:0;color:#57483a;font-size:.78rem;line-height:1.5}.mi-link-row{display:flex;flex-wrap:wrap;gap:.3rem .75rem}.mobile-insights a{font-size:.75rem;color:#913a20;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere;width:fit-content}
.mi-centre-card[hidden]{display:none}.mi-panel .mi-map-coverage{margin:0;color:#5e4839;font-weight:750}
.mi-age-list{display:grid;gap:.25rem}.mi-age{width:100%;display:grid;gap:.45rem;padding:.52rem;border:1px solid transparent;border-radius:.7rem;background:transparent;text-align:left;cursor:pointer}.mi-age[aria-pressed=true]{border-color:#edc4a9;background:#fff3e7}.mi-age-row{display:flex;justify-content:space-between;gap:.4rem;align-items:baseline;font-size:.78rem;line-height:1.35}.mi-age-row strong{white-space:nowrap;font-size:.82rem;font-variant-numeric:tabular-nums}.mi-age-track{height:.62rem;background:#f3e9de;border-radius:999px;overflow:hidden}.mi-age-track i{display:block;height:100%;width:var(--mi-bar);background:#d87755;border-radius:inherit}.mi-age:nth-child(2) .mi-age-track i{background:#ba5331}.mi-age:nth-child(3) .mi-age-track i{background:#e49859}.mi-age:nth-child(n+4) .mi-age-track i{background:#8b9b8b}
.mi-plot{min-width:0;background:#fff9f1;border:1px solid #f2e4d3;border-radius:.85rem;overflow:hidden}.mi-plot text{font-size:10px;fill:#6b5a4c}.mi-gridline{stroke:#ecdecd;vector-effect:non-scaling-stroke}.mi-series{fill:none;stroke-width:2.25;vector-effect:non-scaling-stroke}.mi-active-line{stroke:#be8a70;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}.mi-plot svg{cursor:crosshair}.mi-legend{display:flex;gap:.8rem;color:#624e3e;font-size:.77rem}.mi-legend i{display:inline-block;width:.65rem;height:.65rem;border-radius:50%;margin-inline-end:.3rem}.mi-month-controls{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}.mi-month-controls .mi-select{border-radius:.75rem}.mi-month-summary{font-size:.82rem;font-weight:750;color:#6a3928}.mi-table summary{cursor:pointer;color:#784830;font-size:.79rem;min-height:44px;display:list-item;padding-top:.65rem}.mi-table table{width:100%;border-collapse:collapse;font-size:.75rem;color:#564841}.mi-table :is(td,th){text-align:left;border-top:1px solid var(--mi-border);padding:.38rem .18rem}.mi-table :is(td,th):not(:first-child){text-align:right}
.mi-samples h4{font-size:1rem}.mi-sample-list{display:grid;gap:.43rem}.mi-profile{width:100%;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:.6rem;text-align:left;background:#fffaf3;border:1px solid var(--mi-border);border-radius:.73rem;padding:.53rem .64rem;cursor:pointer}.mi-profile div{display:grid;gap:.12rem;min-width:0;overflow-wrap:anywhere}.mi-profile strong{font-size:.82rem}.mi-profile small{font-size:.71rem;color:var(--mi-muted)}.mi-profile>span{font-size:1.12rem;color:#974221}
.mi-callout{display:grid;gap:.38rem;padding:.76rem .85rem;background:#fff2e5;border:1px solid #f3daca;border-radius:.88rem;color:#67483c;font-size:.83rem;line-height:1.55}.mi-callout h4,.mi-callout p{margin:0}.mi-callout h4{font-size:.9rem;color:var(--mi-ink)}.mi-wait-bar:hover,.mi-wait-bar:focus-visible{background:#fff0df;border-color:#edc4a9}.mi-wait-bar[aria-pressed=true] .mi-age-track i,.mi-wait-bar:hover .mi-age-track i,.mi-wait-bar:focus-visible .mi-age-track i{background:#a64328}.mi-wait-reading{min-height:2.1rem;margin:0;color:#734424;font-size:.8rem}
.mi-scatter .mi-axis{stroke:#cdb4a5;vector-effect:non-scaling-stroke}.mi-scatter .mi-point{cursor:pointer}.mi-scatter .mi-point:focus-visible,.mi-flow .mi-flow-node:focus-visible{outline:none;filter:drop-shadow(0 0 2px #513324)}.mi-scatter-choices{width:100%}.mi-story-card{display:grid;gap:.5rem;padding:.66rem;background:#fff3e7;border:1px solid #f1dac6;border-radius:.84rem}.mi-story-card img{width:100%;max-height:8.6rem;object-fit:cover;border-radius:.58rem}.mi-story-card h4,.mi-story-card p{margin:0}.mi-story-events{display:grid;gap:.32rem;margin:.08rem 0;padding:0;list-style:none;font-size:.76rem}.mi-story-events li{display:flex;justify-content:space-between;gap:.3rem}.mi-story-events time{font-variant-numeric:tabular-nums;white-space:nowrap}.mi-story-sheet{position:fixed;inset:auto 0 0;margin:0 auto;width:min(100%,31rem);max-height:85dvh;overflow:auto;padding:1.05rem max(.98rem,env(safe-area-inset-right)) max(1.05rem,env(safe-area-inset-bottom)) max(.98rem,env(safe-area-inset-left));border:1px solid #ebccb3;border-radius:1.35rem 1.35rem 0 0;background:#fffaf3;color:#3b2922;box-shadow:0 -.3rem 1.8rem #21161030}.mi-story-sheet::backdrop{background:#27181380}.mi-story-sheet header{display:flex;align-items:center;justify-content:space-between;gap:.5rem}.mi-story-sheet header h3{font-size:1.18rem;margin:0}.mi-story-sheet .mi-filter{font:inherit;background:#fff9f1;border:1px solid #edceb4;margin:.28rem 0;min-height:44px}.mi-story-sheet .mi-story-action{background:#ad4829;color:#fff8ee;width:100%;font-weight:700}
.mi-flow .mi-flow-node{cursor:pointer}.mi-flow .mi-flow-node text{font-size:9.5px;font-weight:700;paint-order:stroke;stroke:#fffaf2;stroke-width:3px;stroke-linejoin:round}.mi-flow .mi-flow-node:focus-visible rect,.mi-flow .mi-flow-node[aria-pressed=true] rect{stroke:#a64328;stroke-width:2}.mi-flow .mi-stage-label{font-size:9px;font-weight:800;fill:#654636}.mi-flow .mi-flow-ribbon{pointer-events:none;transition:opacity .16s}.mi-flow-controls{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}.mi-flow-controls label{font-size:.8rem;font-weight:700}.mi-flow-detail,.mi-flow-range{font-size:.76rem;color:var(--mi-muted);min-height:.9rem;line-height:1.45}.mi-flow-table td:nth-child(2),.mi-flow-table th:nth-child(2){text-align:left}.mi-flow-reset[hidden]{display:none}
@media(prefers-reduced-motion:reduce){.mi-flow .mi-flow-ribbon{transition:none}}
`;

function node(tag, className, label) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (label !== undefined) element.textContent = label;
  return element;
}

function drawing(tag, attributes, text) {
  const element = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(className, label, action) {
  const element = node('button', className, label);
  element.type = 'button';
  element.addEventListener('click', action);
  return element;
}

function select(className, label, choices, value, change) {
  const element = node('select', className);
  element.setAttribute('aria-label', label);
  for (const [id, text] of choices) {
    const option = node('option', '', text);
    option.value = id;
    element.append(option);
  }
  element.value = value;
  element.addEventListener('change', () => change(element.value));
  return element;
}

function source(label, value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const link = node('a', '', label);
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  } catch {
    return null;
  }
}

function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
function format(value) { return finite(value) ? numberFormat.format(value) : '—'; }

function panel(title, detail) {
  const block = node('section', 'mi-panel');
  block.append(node('h3', '', title));
  if (detail) block.append(node('p', '', detail));
  return block;
}

function project(longitude, latitude) {
  return [12 + (longitude - 113.82) / .70 * 320, 10 + (22.58 - latitude) / .45 * 217];
}

function boundary(geometry) {
  if (!geometry) return '';
  if (geometry.type === 'GeometryCollection') return geometry.geometries.map(boundary).join(' ');
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  return polygons.flatMap(polygon => polygon.map(ring => ring.map(([x, y], index) => {
    const [left, top] = project(x, y);
    return `${index ? 'L' : 'M'}${left.toFixed(2)},${top.toFixed(2)}`;
  }).join('') + 'Z')).join(' ');
}

function centreMap(data, selectedCentre, onCentre) {
  const block = panel('公開領養中心', '數字是官網明列待領養且能對應到此中心的貓狗檔案。灰點表示地址已核對，目前沒有可對應的檔案。');
  const centres = data.centres || [];
  const located = centres.filter(item => finite(item.longitude) && finite(item.latitude));
  const byCoordinate = new Map();
  for (const centre of located) {
    const key = `${centre.longitude},${centre.latitude}`;
    if (!byCoordinate.has(key)) byCoordinate.set(key, []);
    byCoordinate.get(key).push(centre);
  }
  const points = [...byCoordinate].map(([key, entries]) => ({
    id: entries.length === 1 ? entries[0].id : `location:${key}`,
    name: entries.length === 1 ? entries[0].name : `${entries[0].organisation} · 同址 ${entries.length} 個中心`,
    entries,
    count: entries.reduce((total, entry) => total + entry.count, 0),
  }));
  const shared = new Map(points.filter(point => point.entries.length > 1).map(point => [point.id, point]));
  const maximum = Math.max(1, ...points.map(point => point.count));
  const coverage = data.map_coverage;
  if (coverage?.mapped_centres) {
    block.append(node('p','mi-map-coverage',
      `${format(coverage.mapped_organisations)} 家機構 · ${format(coverage.mapped_centres)} 個中心 · ${format(coverage.map_points)} 個地圖點`));
  }
  const map = node('div', 'mi-map');
  const image = drawing('svg', {viewBox:'0 0 344 237', role:'group', 'aria-label':'香港領養中心地圖'});
  for (const district of data.districts_geojson?.features || []) {
    image.append(drawing('path', {d:boundary(district.geometry), class:'mi-terrain', 'fill-rule':'evenodd', 'aria-hidden':'true'}));
  }
  const markers = new Map();
  let selected = selectedCentre;
  for (const point of points.sort((a,b) => b.count - a.count)) {
    const [centre] = point.entries;
    const [x, y] = project(centre.longitude, centre.latitude);
    const radius = point.entries.length > 1 && !point.count ? 8 : 5.5 + Math.sqrt(point.count / maximum) * 8.5;
    const countLabel = point.count ? `${format(point.count)} 則已對應檔案` : '暫無已對應檔案';
    const marker = drawing('g', {class:`mi-marker${point.count ? '' : ' mi-empty'}`, transform:`translate(${x} ${y})`, tabindex:'0', role:'button',
      'aria-label':`${point.name}，${countLabel}`, 'aria-pressed':'false'});
    marker.append(drawing('circle',{r:Math.max(12, radius), fill:'transparent'}), drawing('circle',{r:radius, class:'mi-marker-bubble'}));
    if (point.count || point.entries.length > 1) marker.append(drawing('text',{x:0,y:0},point.count ? format(point.count) : `${point.entries.length}處`));
    marker.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') showCentre(point.id); });
    marker.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') showCentre(selected); });
    marker.addEventListener('focus', () => showCentre(point.id));
    marker.addEventListener('blur', () => showCentre(selected));
    marker.addEventListener('click', event => {
      const official = point.entries.length === 1 && source('機構官網', centre.source_url);
      if (event.pointerType === 'mouse' && official) {
        showCentre(point.id);
        window.open(official.href, '_blank', 'noopener,noreferrer');
      } else {
        onCentre(point.id);
      }
    });
    marker.addEventListener('keydown', event => {
      if (!['Enter',' '].includes(event.key)) return;
      event.preventDefault();
      onCentre(point.id);
    });
    image.append(marker);
    markers.set(point.id, marker);
  }
  if (located.length || data.districts_geojson?.features?.length) {
    map.append(image);
    block.append(map);
  }
  const choices = select('mi-select mi-centre-select','選擇公開領養中心',
    [['','選擇中心'],...[...shared.values()].map(point => [point.id,point.name]),
      ...centres.map(item => [item.id,`${item.name} · ${item.count ? format(item.count) + ' 則' : '暫無已對應檔案'}`])],selectedCentre,onCentre);
  if (centres.length) block.append(choices);
  const card = node('div','mi-centre-card');
  card.setAttribute('aria-live','polite');
  block.append(card);
  const sourceLinks = node('div','mi-link-row');
  const original = source('行政區邊界來源',data.districts_source_url);
  if (original) sourceLinks.append(original);
  block.append(sourceLinks);

  function update(id) {
    selected = id;
    choices.value = id;
    for (const [key,marker] of markers) {
      const active = key === id || shared.get(key)?.entries.some(entry => entry.id === id);
      marker.setAttribute('aria-pressed',String(Boolean(active)));
    }
    showCentre(id);
  }

  function showCentre(id) {
    const centre = centres.find(item => item.id === id);
    const group = shared.get(id);
    if (card.dataset.centre === id) return;
    card.dataset.centre = id;
    card.hidden = false;
    card.replaceChildren();
    if (group) {
      card.append(node('h4','',group.name),node('p','','選擇中心以查看舖號、檔案及官網。'));
      for (const entry of group.entries) card.append(button('mi-filter',entry.name,() => onCentre(entry.id)));
      return;
    }
    if (!centre) {
      const unmatched = data.unknown_centre + data.centre_unavailable_count;
      if (!located.length) card.append(node('p','','這個篩選範圍暫無已核對的公開中心座標。'));
      if (unmatched > 0) card.append(node('p','',`${format(unmatched)} 則檔案暫未能標到地圖上。可用上方機構篩選查看名錄。`));
      card.hidden = !card.childElementCount;
      return;
    }
    const photoSource = source('中心照片',centre.photo_url);
    if (photoSource) {
      const photo = node('img');
      photo.src = photoSource.href;
      photo.alt = centre.name;
      photo.loading = 'lazy';
      photo.addEventListener('error', () => photo.remove(), {once:true});
      card.append(photo);
    }
    card.append(node('h4','',centre.name),node('p','',centre.count ? `${format(centre.count)} 則檔案已對應到此中心` : '本次範圍暫無檔案可核實屬於此中心。'));
    if (centre.organisation_listing_count > centre.count) {
      card.append(node('p','',`此機構在本次範圍共有 ${format(centre.organisation_listing_count)} 則官網明列待領養檔案。`));
    }
    if (centre.address) card.append(node('p','',centre.address));
    if (!located.includes(centre)) card.append(node('p','','此中心座標待核。'));
    const reference = source('查看機構公開資料',centre.source_url);
    const coordinate = source('座標來源',centre.coordinate_source_url);
    const links = node('div','mi-link-row');
    if (reference) links.append(reference);
    if (coordinate && coordinate.href !== reference?.href) links.append(coordinate);
    if (links.childElementCount) card.append(links);
  }
  update(selectedCentre);
  return {block, update, shared};
}

function ageChart(data, selectedAge, onAge) {
  const block = panel('名錄年齡分布','每則公開刊登計一次。可點選年齡組查看部分檔案。');
  const rows = node('div','mi-age-list');
  const ages = data.ages || [];
  const maximum = Math.max(1,...ages.map(item => item.count || 0));
  const keys = new Map();
  for (const age of ages) {
    const bar = button('mi-age','',() => onAge(age.key));
    bar.setAttribute('aria-pressed',String(age.key === selectedAge));
    bar.setAttribute('aria-label',`${age.label}，${format(age.count)} 則檔案`);
    const row = node('span','mi-age-row');
    row.append(node('span','',age.label),node('strong','',format(age.count)));
    const track = node('span','mi-age-track');
    track.setAttribute('aria-hidden','true');
    const fill = node('i');
    fill.style.setProperty('--mi-bar',`${Math.max(0, age.count || 0) * 100 / maximum}%`);
    track.append(fill);
    bar.append(row,track);
    rows.append(bar);
    keys.set(age.key,bar);
  }
  if (!ages.length) rows.append(node('p','mi-note','這個篩選範圍暫無年齡資料。'));
  block.append(rows);
  return {block, update(id) {
    for (const [key,bar] of keys) bar.setAttribute('aria-pressed',String(key === id));
  }};
}

function supportedDuration(value) {
  return finite(value) && value >= 0;
}

function imageAsset(value, alt) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const image = node('img');
    image.src = url.href;
    image.alt = alt;
    image.loading = 'lazy';
    image.addEventListener('error', () => image.remove(), {once:true});
    return image;
  } catch {
    return null;
  }
}

function waitCoverage(waiting) {
  const detail = [];
  if (finite(waiting.valid_count)) detail.push(`可核對等待天數：${format(waiting.valid_count)} 則`);
  if (finite(waiting.missing_start)) detail.push(`缺有效起算日：${format(waiting.missing_start)} 則`);
  return detail.join(' · ');
}

function waitingChart(waiting) {
  const statistic = waiting.statistic_label || '等待天數';
  const block = panel('等待天數',`按有資料支持的品種分組查看${statistic}。點選或指向柱形可讀取數值。`);
  const coverage = waitCoverage(waiting);
  if (coverage) block.append(node('p','mi-note',coverage));
  const groups = (waiting.groups || []).filter(group => supportedDuration(group.value) && group.label);
  if (!groups.length) {
    const gap = node('div','mi-callout');
    gap.append(node('h4','','這個篩選範圍暫無可計算的等待天數'),
      node('p','','等待天數需要機構提供可核對的開放領養或起算日期。兩次官網快照只記錄當天觀察到的狀態。'));
    block.append(gap);
    return block;
  }
  const list = node('div','mi-age-list');
  const reading = node('p','mi-wait-reading');
  reading.setAttribute('aria-live','polite');
  const max = Math.max(1,...groups.map(group => group.value));
  const rows = new Map();
  let selected, pointer;

  function update() {
    const active = pointer ?? selected;
    for (const [index, bar] of rows) bar.setAttribute('aria-pressed',String(index === selected));
    const group = groups[active];
    reading.textContent = group ? `${group.label}：${format(group.value)} 天${finite(group.count) ? ` · ${format(group.count)} 則樣本` : ''}` : '點選柱形查看分組天數。';
  }

  for (const [index, group] of groups.entries()) {
    const bar = button('mi-age mi-wait-bar','',() => { selected = selected === index ? undefined : index; update(); });
    bar.setAttribute('aria-label',`${group.label}，${format(group.value)} 天`);
    const legend = node('span','mi-age-row');
    legend.append(node('span','',group.label),node('strong','',`${format(group.value)} 天`));
    const track = node('span','mi-age-track');
    track.setAttribute('aria-hidden','true');
    const fill = node('i');
    fill.style.setProperty('--mi-bar',`${group.value * 100 / max}%`);
    track.append(fill);
    bar.append(legend,track);
    for (const type of ['pointerenter','focus']) bar.addEventListener(type,() => { pointer = index; update(); });
    for (const type of ['pointerleave','blur']) bar.addEventListener(type,() => { if (pointer === index) pointer = undefined; update(); });
    rows.set(index,bar);
    list.append(bar);
  }
  update();
  block.append(list,reading);
  return block;
}

function storyBody(item, openProfile, action = '查看這隻動物的完整檔案') {
  const card = node('article','mi-story-card');
  const name = item.name || '動物個案';
  const image = imageAsset(item.photo_url,name);
  if (image) card.append(image);
  card.append(node('h4','',name));
  if (supportedDuration(item.wait_days)) card.append(node('p','',`可核對等待 ${format(item.wait_days)} 天`));
  const events = (item.observations || []).filter(event => event.date && event.status_label);
  if (events.length) {
    const list = node('ol','mi-story-events');
    for (const event of events) {
      const row = node('li');
      const date = node('time','',event.date);
      date.dateTime = event.date;
      row.append(date,node('span','',event.status_label));
      list.append(row);
    }
    card.append(list);
  }
  if (item.id) card.append(button('mi-filter mi-story-action',action,() => openProfile(item.id)));
  return card;
}

function openStorySheet(item, openProfile) {
  const sheet = node('dialog','mi-story-sheet');
  sheet.setAttribute('aria-label',`${item.name || '動物'}的領養故事`);
  const header = node('header');
  header.append(node('h3','','領養故事'),button('mi-filter','關閉',() => sheet.close()));
  sheet.append(header,storyBody(item,id => { sheet.close(); openProfile(id); }));
  sheet.addEventListener('close',() => sheet.remove(),{once:true});
  document.body.append(sheet);
  sheet.showModal();
}

function scatterChart(waiting, openProfile) {
  const block = panel('你願意領養牠嗎？','觀察有支持的等待時間與年齡。點選長候個案可打開牠的領養故事。');
  const points = (waiting.points || []).filter(item => item.id && supportedDuration(item.wait_days) && supportedDuration(item.age_years));
  if (!points.length) {
    const notice = node('div','mi-callout');
    notice.append(node('h4','','等待散點圖目前缺乏可核對數據'),
      node('p','','等待天數和年齡須在同一檔案都有記錄。空白欄位會保留，等機構補充後才繪圖。'));
    block.append(notice);
    const story = waiting.fallback_story;
    if (story?.id) {
      block.append(node('p','mi-note','這個個案顯示兩次實際的官網觀察。等待天數未能計算。'),storyBody(story,openProfile));
    }
    return block;
  }
  const top = 19, bottom = 151, left = 35, right = 329;
  const maxAge = Math.max(1,Math.ceil(Math.max(...points.map(item => item.age_years))));
  const maxDays = Math.max(7,Math.ceil(Math.max(...points.map(item => item.wait_days)) / 7) * 7);
  const x = age => left + (right-left) * age / maxAge;
  const y = days => bottom - (bottom-top) * days / maxDays;
  const longest = points.reduce((best,item) => item.wait_days > best.wait_days ? item : best);
  const frame = node('div','mi-plot mi-scatter');
  const graph = drawing('svg',{viewBox:'0 0 344 181',role:'group','aria-label':'按動物年齡及等待天數排列的散點圖'});
  graph.append(drawing('path',{d:`M${left},${top}V${bottom}H${right}`,fill:'none',class:'mi-axis'}),
    drawing('text',{x:left,y:11},'等待天數'),drawing('text',{x:right,y:173,'text-anchor':'end'},`${maxAge} 歲`),
    drawing('text',{x:left,y:173},'0 歲'),drawing('text',{x:left-4,y:top+4,'text-anchor':'end'},format(maxDays)));
  const marks = new Map();
  const choices = select('mi-select mi-scatter-choices','選擇動物個案',
    [['','選擇個案'],...points.map(item => [item.id,`${item.name || '動物'} · ${format(item.wait_days)} 天`])],'',id => setActive(id));
  const story = node('div');
  const label = drawing('text',{'text-anchor':'middle','aria-hidden':'true'});
  function setActive(id) {
    choices.value = id;
    const item = points.find(point => point.id === id);
    for (const [key,mark] of marks) mark.setAttribute('aria-pressed',String(key === id));
    label.textContent = id ? '' : `已等待 ${format(longest.wait_days)} 天`;
    story.replaceChildren(...(item ? [storyBody(item,() => openStorySheet(item,openProfile),'打開領養故事')] : []));
  }

  for (const item of [...points.filter(point => point !== longest),longest]) {
    const maximum = item === longest;
    const position = [x(item.age_years),y(item.wait_days)];
    const mark = drawing('g',{class:'mi-point',transform:`translate(${position[0]} ${position[1]})`,role:'button',tabindex:'0',
      'aria-label':`${item.name}，已等待 ${format(item.wait_days)} 天`,'aria-pressed':'false'});
    mark.append(drawing('circle',{r:11,fill:'transparent'}),drawing('circle',{r:maximum ? 8 : 4.5,fill:maximum ? '#b64836' : '#a56b55',stroke:'#fff7f0'}));
    if (maximum) {
      const image = imageAsset(item.photo_url,item.name);
      if (image) {
        const clip = drawing('clipPath',{id:'mi-longest-point-image'});
        clip.append(drawing('circle',{r:10}));
        const crop = drawing('image',{href:image.src,x:-10,y:-10,width:20,height:20,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#mi-longest-point-image)'});
        crop.addEventListener('error',() => crop.remove(),{once:true});
        mark.append(clip,crop);
      }
      label.setAttribute('x',String(Math.max(69,Math.min(278,position[0]))));
      label.setAttribute('y',String(Math.min(bottom-3,position[1]+28)));
    }
    const action = () => { setActive(item.id); openStorySheet(item,openProfile); };
    mark.addEventListener('click',action);
    mark.addEventListener('keydown',event => {
      if (!['Enter',' '].includes(event.key)) return;
      event.preventDefault();
      action();
    });
    marks.set(item.id,mark);
    graph.append(mark);
  }
  graph.append(label);
  frame.append(graph);
  setActive('');
  block.append(frame,choices,story);
  return block;
}

const flowColumns = new Map([[0,0],[1,1],[2,2],['0',0],['1',1],['2',2],['start',0],['breed',1],['end',2]]);

function flowColor(breed) {
  if (breed === 'mixed' || breed === 'crossbreed') return '#bf5939';
  if (['pure','purebred'].includes(breed)) return '#487d68';
  return '#947587';
}

function flowLayout(levels, links) {
  const top = 26;
  const gap = 15;
  const height = Math.max(170,top + Math.max(...levels.map(items => items.length)) * 27 + 30);
  const inner = height - top - 10;
  const widths = [10,12,10];
  const x = [9,165,325];
  const items = levels.flat();
  const byId = new Map(items.map(item => [item.id,item]));
  for (const item of items) {
    const entering = links.filter(link => link.target === item.id).reduce((sum,link) => sum+link.value,0);
    const leaving = links.filter(link => link.source === item.id).reduce((sum,link) => sum+link.value,0);
    item.amount = Math.max(entering,leaving);
  }
  const totals = levels.map(entries => entries.reduce((sum,item) => sum+item.amount,0));
  const scale = Math.min(...levels.map((entries,index) => entries.length ? (inner-gap*(entries.length-1))/totals[index] : Infinity));
  for (const [index, entries] of levels.entries()) {
    let y = top+(inner-scale*totals[index]-gap*Math.max(0,entries.length-1))/2;
    for (const item of entries) {
      const rawSize = item.amount*scale;
      item.x = x[index];
      item.y = y;
      item.width = widths[index];
      item.size = rawSize;
      item.tall = Math.max(7,rawSize);
      item.input = y;
      item.output = y;
      y += rawSize+gap;
    }
  }
  for (const edge of links) {
    const start = byId.get(edge.source), end = byId.get(edge.target);
    const width = edge.value*scale;
    const left = start.x+start.width, right = end.x, middle = (left+right)/2;
    const sy = start.output+width/2, ey = end.input+width/2;
    edge.draw = { d:`M${left},${sy} C${middle},${sy} ${middle},${ey} ${right},${ey}`, width };
    start.output += width;
    end.input += width;
  }
  return {height,items};
}

function flowChart(flow, priorBreed, onBreed) {
  const block = panel('生命流向',flow.basis || '以同一則已核對刊登在兩個快照的觀察狀態配對。線條表示刊登紀錄，取樣範圍以資料來源為準。');
  const rawNodes = new Map((flow.nodes || []).filter(item => item.id && item.label && flowColumns.has(item.column)).map(item => [item.id,{...item,column:flowColumns.get(item.column)}]));
  const all = [];
  for (const link of flow.links || []) {
    const first = rawNodes.get(link.source), second = rawNodes.get(link.target);
    if (!first || !second || second.column-first.column !== 1 || !finite(link.value) || link.value <= 0) continue;
    const breedGroup = link.breed_group || (first.column === 1 ? first.breed_group : second.breed_group);
    all.push({...link,breedGroup});
  }
  const observed = [flow.observed_range,finite(flow.included_count) ? `全品種可比對 ${format(flow.included_count)} 則` : '',finite(flow.excluded_count) ? `未納入 ${format(flow.excluded_count)} 則` : ''].filter(Boolean).join(' · ');
  if (observed) block.append(node('p','mi-flow-range',observed));
  const choices = [['','全部品種'],...(flow.breed_options || []).filter(item => item.id && item.label).map(item => [item.id,item.label])];
  let breed = choices.some(([id]) => id === priorBreed) ? priorBreed : '';
  const controls = node('div','mi-flow-controls');
  const chooser = select('mi-select','按品種篩選生命流向',choices,breed,value => { breed = value; onBreed(value); draw(); });
  chooser.id = 'mi-flow-breed';
  const label = node('label','','品種');
  label.htmlFor = chooser.id;
  const reset = button('mi-filter mi-flow-reset','清除聚焦',() => focus(''));
  reset.hidden = true;
  controls.append(label,chooser,reset);
  const output = node('div');
  const detail = node('p','mi-flow-detail');
  detail.setAttribute('aria-live','polite');
  block.append(controls,output,detail);
  let focus = () => {};

  function draw() {
    output.replaceChildren();
    detail.textContent = '';
    reset.hidden = true;
    const links = all.filter(link => !breed || link.breedGroup === breed).map(link => ({...link}));
    if (!links.length) {
      const gap = node('div','mi-callout');
      gap.append(node('h4','','這個篩選範圍暫無可比對的流向'),node('p','','圖表需要兩次觀察能連到同一則官網刊登。可切換品種、物種或機構重新查看。'));
      output.append(gap);
      return;
    }
    const visibleCount = links.filter(link => rawNodes.get(link.source).column === 0).reduce((sum,link) => sum + link.value,0);
    const linkedIds = new Set(links.flatMap(link => [link.source,link.target]));
    const levels = [0,1,2].map(stage => [...rawNodes.values()].filter(item => item.column === stage && linkedIds.has(item.id)).map(item => ({...item})));
    const {height,items} = flowLayout(levels,links);
    const wrap = node('div','mi-plot mi-flow');
    const chart = drawing('svg',{viewBox:`0 0 344 ${height}`,role:'group','aria-label':'兩次刊登快照的可比對流向圖'});
    chart.append(drawing('text',{x:9,y:14,class:'mi-stage-label'},flow.start_label || '較早快照'),
      drawing('text',{x:171,y:14,class:'mi-stage-label','text-anchor':'middle'},'品種分組'),
      drawing('text',{x:335,y:14,class:'mi-stage-label','text-anchor':'end'},flow.end_label || '較新快照'));
    const labels = new Map();
    const ribbons = [];
    let selected = '', transient = '';

    function update() {
      const active = transient || selected;
      for (const [link, path] of ribbons) {
        const related = link.source === active || link.target === active;
        path.setAttribute('opacity',String(active ? related ? .84 : .11 : .37));
        path.setAttribute('stroke-width',String(Math.max(1,link.draw.width)*(active && related ? 1.08 : 1)));
      }
      for (const [id, element] of labels) element.setAttribute('aria-pressed',String(id === selected));
      reset.hidden = !selected;
      const item = items.find(entry => entry.id === active);
      detail.textContent = item ? `${item.label}：${format(item.amount)} 則刊登` : `本圖顯示 ${format(visibleCount)} 則刊登。點選或指向節點可查看相連的路徑。`;
    }

    focus = id => {
      selected = selected === id ? '' : id;
      transient = '';
      update();
    };
    for (const link of links) {
      const path = drawing('path',{d:link.draw.d,fill:'none',stroke:flowColor(link.breedGroup),class:'mi-flow-ribbon',
        'stroke-width':Math.max(1,link.draw.width)});
      ribbons.push([link,path]);
      chart.append(path);
    }
    for (const item of items) {
      const control = drawing('g',{class:'mi-flow-node',role:'button',tabindex:0,
        'aria-label':`${item.label}，${format(item.amount)} 則刊登`,'aria-pressed':false});
      const y = item.y+(item.size-item.tall)/2;
      control.append(drawing('rect',{x:item.x-4,y:y-4,width:item.width+8,height:item.tall+8,fill:'transparent',rx:3}),
        drawing('rect',{x:item.x,y,width:item.width,height:item.tall,fill:item.column === 1 ? flowColor(item.breed_group) : '#8b7366',rx:2}),
        drawing('text',{x:item.column === 2 ? item.x-4 : item.x+item.width+4,y:item.y+item.size/2+3,
          'text-anchor':item.column === 2 ? 'end' : 'start'},item.label));
      control.addEventListener('click',() => focus(item.id));
      for (const type of ['pointerenter','focus']) control.addEventListener(type,() => { transient = item.id; update(); });
      for (const type of ['pointerleave','blur']) control.addEventListener(type,() => { if (transient === item.id) transient = ''; update(); });
      control.addEventListener('keydown',event => {
        if (!['Enter',' '].includes(event.key)) return;
        event.preventDefault();
        focus(item.id);
      });
      labels.set(item.id,control);
      chart.append(control);
    }
    wrap.append(chart);
    const table = node('table','mi-flow-table');
    table.setAttribute('aria-label','流向圖線條的連接與計數');
    const head = node('thead'), row = node('tr');
    for (const text of ['由','到','刊登數']) {
      const column = node('th','',text);
      column.scope = 'col';
      row.append(column);
    }
    head.append(row);
    const body = node('tbody');
    for (const link of links) {
      const row = node('tr');
      row.append(node('td','',rawNodes.get(link.source).label),node('td','',rawNodes.get(link.target).label),node('td','',format(link.value)));
      body.append(row);
    }
    table.append(head,body);
    const details = node('details','mi-table');
    details.append(node('summary','','查看路徑計數表'),table);
    output.append(wrap,details);
    update();
  }
  draw();
  return block;
}

function monthIndex(value) {
  const match = /^([0-9]{4})-(0[1-9]|1[0-2])$/.exec(value || '');
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
}

function trendChart(data, species, lastMonth, onMonth) {
  const block = panel('月度領養趨勢','資料來自香港拯救貓狗協會的機構月報，缺少數值的月份保留空檔。');
  const rows = (data.timeline || []).map(row => ({...row,index:monthIndex(row.period)})).filter(row => row.index !== null).sort((a,b) => a.index - b.index);
  const series = [{key:'cat',label:'貓',color:'#ab482c'},{key:'dog',label:'狗',color:'#3c7767'}].filter(item => !species || item.key === species);
  const values = rows.flatMap(row => series.map(item => row[item.key])).filter(finite);
  if (!values.length) {
    block.append(node('p','','這個物種暫無可顯示的月度資料。'));
    return block;
  }
  const first = rows[0].index;
  const last = rows.at(-1).index;
  const left = 31, right = 330, top = 12, bottom = 132;
  const tickSize = Math.max(5, Math.ceil(Math.max(...values) / 4 / 5) * 5);
  const vertical = value => bottom - (bottom - top) * value / (tickSize * 4);
  const horizontal = index => left + (right - left) * (index - first) / Math.max(1,last - first);
  const plot = node('div','mi-plot');
  const graph = drawing('svg',{viewBox:'0 0 344 161',role:'img','aria-label':'月度領養折線圖，請使用月份選單查閱各月數字'});
  for (let index=0;index<=4;index++) {
    const value = index * tickSize;
    const y = vertical(value);
    graph.append(drawing('line',{x1:left,x2:right,y1:y,y2:y,class:'mi-gridline'}),drawing('text',{x:left-5,y:y+3,'text-anchor':'end'},format(value)));
  }
  const visibleTicks = [0, Math.floor((rows.length - 1) / 2), rows.length - 1];
  for (const index of new Set(visibleTicks)) {
    const row = rows[index];
    graph.append(drawing('text',{x:horizontal(row.index),y:149,'text-anchor':index===0?'start':index===rows.length-1?'end':'middle'},row.period));
  }
  const legend = node('div','mi-legend');
  for (const item of series) {
    const key = node('span');
    const chip = node('i');
    chip.style.backgroundColor = item.color;
    key.append(chip,document.createTextNode(item.label));
    legend.append(key);
    const steps = [];
    let previous = null;
    for (const row of rows) {
      const value = row[item.key];
      if (!finite(value)) { previous = null; continue; }
      const x = horizontal(row.index), y = vertical(value);
      steps.push(`${previous !== null && row.index === previous + 1 ? 'L' : 'M'}${x},${y}`);
      graph.append(drawing('circle',{cx:x,cy:y,r:2.3,fill:item.color}));
      previous = row.index;
    }
    graph.append(drawing('path',{d:steps.join(' '),stroke:item.color,class:'mi-series'}));
  }
  const marker = drawing('g',{'aria-hidden':'true'});
  graph.append(marker);
  plot.append(graph);
  const controls = node('div','mi-month-controls');
  const month = select('mi-select','選擇領養報告月份',rows.map(row => [row.period,row.period]),lastMonth,value => choose(rows.find(row => row.period === value)));
  const summary = node('span','mi-month-summary');
  summary.setAttribute('aria-live','polite');
  controls.append(month,summary);
  const links = node('div','mi-link-row');

  function choose(row) {
    if (!row) return;
    onMonth(row.period);
    month.value = row.period;
    const x = horizontal(row.index);
    marker.replaceChildren(drawing('line',{x1:x,x2:x,y1:top,y2:bottom,class:'mi-active-line'}));
    for (const item of series) {
      if (finite(row[item.key])) marker.append(drawing('circle',{cx:x,cy:vertical(row[item.key]),r:4.5,fill:item.color,stroke:'#fff9f1','stroke-width':1.5}));
    }
    summary.textContent = series.map(item => `${item.label} ${finite(row[item.key]) ? format(row[item.key]) : '未記錄'}`).join(' · ');
    const reference = source(row.source_url ? '查看所選月份的機構月報' : '查看機構月報來源',row.source_url || data.timeline_source_url);
    links.replaceChildren(...(reference ? [reference] : []));
  }
  graph.addEventListener('click', event => {
    const box = graph.getBoundingClientRect();
    if (!box.width) return;
    const x = (event.clientX - box.left) / box.width * 344;
    const closest = rows.reduce((best,row) => Math.abs(horizontal(row.index) - x) < Math.abs(horizontal(best.index) - x) ? row : best);
    choose(closest);
  });
  choose(rows.find(row => row.period === lastMonth) || rows.at(-1));

  const details = node('details','mi-table');
  details.append(node('summary','','查看月份數據表'));
  const table = node('table');
  table.setAttribute('aria-label','機構月份領養數據');
  const head = node('thead');
  const headings = node('tr');
  for (const name of ['月份',...series.map(item => item.label)]) { const label = node('th','',name); label.scope = 'col'; headings.append(label); }
  head.append(headings);
  const body = node('tbody');
  for (const row of rows) {
    const item = node('tr');
    item.append(node('td','',row.period),...series.map(entry => node('td','',format(row[entry.key]))));
    body.append(item);
  }
  table.append(head,body);
  details.append(table);
  block.append(legend,plot,controls,links,details);
  return block;
}

function listingSample(root, entries, openProfile, scope) {
  root.replaceChildren(node('h4','','範圍內的刊登檔案'));
  const list = node('div','mi-sample-list');
  if (scope) root.append(node('p','mi-note',`${scope} · 刊登樣本`));
  if (!entries.length) list.append(node('p','mi-note','這批樣本暫無符合的檔案。'));
  for (const item of entries.slice(0,6)) {
    const row = button('mi-profile','',() => openProfile(item.id));
    const copy = node('div');
    copy.append(node('strong','',item.name || '未命名'),node('small','',[item.organisation,item.age_label].filter(Boolean).join(' · ')));
    const arrow = node('span','','›'); arrow.setAttribute('aria-hidden','true');
    row.append(copy,arrow);
    list.append(row);
  }
  root.append(list);
}

export function mountInsights(root, {api, openProfile}) {
  const sheet = node('style'); sheet.textContent = styles;
  const screen = node('section','mobile-insights');
  const header = node('header','mi-header');
  header.append(node('h2','','領養數據'),node('p','','按物種和機構查看公開名錄、個案和領養觀察。'));
  const tabs = node('nav','mi-tabs'); tabs.setAttribute('aria-label','數據圖表');
  const controls = node('div','mi-controls');
  const filters = node('div','mi-filters'); filters.setAttribute('aria-label','按物種篩選');
  const orgSpace = node('div','mi-org');
  const content = node('div','mi-content');
  controls.append(filters,orgSpace);
  screen.append(header,tabs,controls,content);
  root.replaceChildren(sheet,screen);

  let current = 'map', species = '', organisation = '', centre = '', age = '', month = '', breed = '', request = 0, data, research;
  const options = new Map();
  const speciesButtons = new Map();
  const researchTabs = new Set(['waiting','story','flow']);
  for (const [id,label] of [['map','中心地圖'],['waiting','等待天數'],['story','領養故事'],['flow','生命流向'],['age','年齡分布'],['trend','領養趨勢']]) {
    const tab = button('mi-tab',label,() => {
      if (current === id) return;
      const before = current;
      current = id;
      updateButtons();
      if (organisation && (before === 'trend' || id === 'trend')) refresh();
      else if (data) draw();
    });
    tab.setAttribute('aria-pressed',String(current === id));
    options.set(id,tab);
    tabs.append(tab);
  }
  for (const [id,label] of [['','全部'],['cat','貓'],['dog','狗']]) {
    const filter = button('mi-filter',label,() => {
      if (species === id) return;
      species = id;
      centre = ''; age = '';
      updateButtons();
      refresh();
    });
    filter.setAttribute('aria-pressed',String(species === id));
    speciesButtons.set(id,filter);
    filters.append(filter);
  }

  function updateButtons() {
    for (const [id,element] of options) element.setAttribute('aria-pressed',String(id === current));
    for (const [id,element] of speciesButtons) element.setAttribute('aria-pressed',String(id === species));
    orgSpace.hidden = current === 'trend';
  }

  function stat(label, value) {
    const entry = node('div','mi-stat');
    entry.append(node('strong','',format(value)),node('span','',label));
    return entry;
  }

  function drawResearch() {
    const key = `${species}\n${organisation}`;
    if (research?.key !== key) research = {key};
    if (research.error) {
      const error = node('div','mi-load','暫時無法讀取此圖表的查核資料。');
      error.append(button('mi-filter','重試',() => { research = undefined; draw(); }));
      content.append(error);
      return;
    }
    if (!research.payload) {
      const loading = node('p','mi-load','正在讀取圖表資料…');
      loading.setAttribute('role','status');
      content.append(loading);
      if (research.loading) return;
      const slot = research;
      slot.loading = true;
      api.get('/api/research',{species,organisation_id:organisation}).then(payload => {
        slot.payload = payload || {};
      }).catch(() => {
        slot.error = true;
      }).finally(() => {
        slot.loading = false;
        if (research === slot && data && researchTabs.has(current)) draw();
      });
      return;
    }
    const waiting = research.payload.waiting || {}, flow = research.payload.flow || {};
    if (current === 'waiting') content.append(waitingChart(waiting));
    if (current === 'story') content.append(scatterChart(waiting,openProfile));
    if (current === 'flow') content.append(flowChart(flow,breed,value => { breed = value; }));
  }

  function draw() {
    orgSpace.replaceChildren(select('mi-select','按機構篩選',
      [['','全部機構'],...(data.organisations || []).map(item => [item.id,item.name])],organisation,value => {
        organisation = value;
        centre = ''; age = '';
        refresh();
      }));
    orgSpace.firstElementChild.style.width = '100%';
    content.replaceChildren();
    if (researchTabs.has(current)) {
      drawResearch();
      return;
    }
    if (current === 'trend') {
      content.append(trendChart(data,species,month,value => { month = value; }));
      return;
    }
    const summary = node('div','mi-summary');
    summary.append(stat('官網明列待領養檔案',data.total),stat(current === 'map' ? '可標到地圖的檔案' : '年齡未明或跨組',
      current === 'map' ? data.map_coverage?.plotted_listings ?? data.total - data.unknown_centre - data.centre_unavailable_count :
        data.ages?.find(item => item.key === 'unknown')?.count));
    content.append(summary);
    const snapshot = [data.release_date && `快照 ${data.release_date}`,data.older_count > 0 && `含 ${format(data.older_count)} 則沿用檔案`].filter(Boolean).join(' · ');
    if (snapshot) content.append(node('p','mi-note',snapshot));
    const sample = node('section','mi-samples');
    const allListings = data.listings || [];
    let map;
    const updateSample = () => {
      const selected = current === 'map' ? centre : age;
      const group = map?.shared.get(selected);
      const active = current === 'map' ? data.centres?.find(item => item.id === selected) : data.ages?.find(item => item.key === selected);
      const ids = group ? group.entries.map(item => item.id) : [selected];
      const entries = selected ? allListings.filter(item => ids.includes(current === 'map' ? item.centre_id : item.age_key)) : allListings;
      listingSample(sample,entries,openProfile,group?.name || active?.name || active?.label || '本次篩選');
    };
    if (current === 'map') {
      map = centreMap(data,centre,id => { centre = centre === id ? '' : id; map.update(centre); updateSample(); });
      content.append(map.block);
    } else {
      const chart = ageChart(data,age,id => { age = age === id ? '' : id; chart.update(age); updateSample(); });
      content.append(chart.block);
    }
    content.append(sample);
    updateSample();
  }

  async function refresh() {
    const token = ++request;
    data = null;
    content.setAttribute('aria-busy','true');
    content.replaceChildren(node('p','mi-load','正在讀取資料…'));
    try {
      const result = await api.get('/api/dashboard',{species,organisation_id:current === 'trend' ? '' : organisation});
      if (token !== request) return;
      data = result;
      draw();
    } catch {
      if (token !== request) return;
      const error = node('div','mi-load','暫時無法讀取領養資料。');
      error.append(button('mi-filter','重試',refresh));
      content.replaceChildren(error);
    } finally {
      if (token === request) content.removeAttribute('aria-busy');
    }
  }
  updateButtons();
  refresh();
  return () => { request++; research = undefined; };
}
