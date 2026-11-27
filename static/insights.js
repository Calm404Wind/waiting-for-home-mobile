import { elapsedLabel, elapsedSummary } from './wait-labels.js';

const SVG = 'http://www.w3.org/2000/svg';
const numberFormat = new Intl.NumberFormat('zh-HK');

let googleMapsBundlePromise = null;
let mapsAuthFailed = false;
function loadGoogleMapsBundle(api) {
  if (!googleMapsBundlePromise) {
    googleMapsBundlePromise = (async () => {
      const cfg = await api.get('/api/maps-config');
      const key = typeof cfg?.apiKey === 'string' ? cfg.apiKey.trim() : '';
      if (!key || mapsAuthFailed) return null;
      if (!window.google?.maps?.importLibrary) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          const query = new URLSearchParams({ key, v: 'weekly', language: 'zh-HK', region: 'HK',
            loading: 'async', callback: 'waitingForHomeMapsReady' });
          window.gm_authFailure = () => {
            mapsAuthFailed = true;
            window.dispatchEvent(new Event('adoption-maps-unavailable'));
            reject(new Error('Maps unavailable'));
          };
          window.waitingForHomeMapsReady = () => {
            delete window.waitingForHomeMapsReady;
            resolve();
          };
          script.async = true;
          script.onerror = () => {
            delete window.waitingForHomeMapsReady;
            script.remove();
            reject(new Error('Maps unavailable'));
          };
          script.src = 'https://maps.googleapis.com/maps/api/js?' + query;
          document.head.append(script);
        });
      }
      const [maps, markers, core] = await Promise.all(
        ['maps', 'marker', 'core'].map(name => window.google.maps.importLibrary(name)));
      return { Map: maps.Map, AdvancedMarkerElement: markers.AdvancedMarkerElement, LatLngBounds: core.LatLngBounds };
    })().catch(error => {
      googleMapsBundlePromise = null;
      throw error;
    });
  }
  return googleMapsBundlePromise;
}

const styles = `
.mobile-insights{--mi-paper:#fffdf8;--mi-ink:#422b21;--mi-muted:#6c5245;--mi-border:#ecd8c2;--mi-accent:#a04423;--mi-orange:#f4a261;--mi-warm:#fce8d6;--mi-green:#1f6a52;color:var(--mi-ink);display:grid;gap:.78rem;min-width:0}
.mobile-insights *{box-sizing:border-box}:where(.mobile-insights :is(button,select)){font:inherit;color:inherit}.mobile-insights :is(button,select,a,[tabindex]):focus-visible{outline:2px solid var(--mi-accent);outline-offset:3px}
.mi-header h2,.mi-panel h3,.mi-centre-card h4,.mi-samples h4{margin:0;line-height:1.22;font-family:var(--app-display,'Noto Serif TC',Georgia,serif)}
.mi-header-row{display:flex;align-items:baseline;justify-content:space-between;gap:.6rem;flex-wrap:wrap}
.mi-header h2{font-size:1.52rem;font-weight:900;letter-spacing:-.02em}
.mi-snapshot-meta{font-size:.75rem;color:var(--mi-muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.mi-panel h3{font-size:1.08rem;font-weight:700}.mi-panel>p,.mi-note{margin:.25rem 0 0;color:var(--mi-muted);font-size:.8rem;line-height:1.52}
.mi-tabs{display:flex;gap:.2rem;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;background:transparent;padding:0;border-radius:0;border-bottom:1px solid rgba(138,102,76,.18)}.mi-tabs::-webkit-scrollbar{display:none}
.mi-tab{flex:0 0 auto;border:0;border-bottom:2.5px solid transparent;margin-bottom:-1px;border-radius:0;min-height:42px;padding:0 .68rem;background:transparent;color:#725c4e;font-weight:700;font-size:.82rem;cursor:pointer;white-space:nowrap;transition:color 160ms ease,border-color 160ms ease}.mi-tab:hover{color:var(--mi-ink)}.mi-tab[aria-pressed=true]{background:transparent;color:#9c421f;border-bottom-color:#c8581d;box-shadow:none}
.mi-controls{display:flex;align-items:center;justify-content:space-between;gap:.5rem;min-width:0}
.mi-filters{display:inline-flex;flex-shrink:0;gap:.12rem;background:transparent;padding:0;border-radius:0;border-bottom:1px solid rgba(138,102,76,.15)}
.mi-filter,.mi-select{min-height:38px;border-radius:10px;border:1px solid rgba(138,102,76,.22);background:var(--mi-paper);padding:.3rem .72rem;font-size:.81rem;transition:background-color 160ms ease,border-color 160ms ease,color 160ms ease}
.mi-filter{min-width:44px;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;border-radius:0;background:transparent;color:var(--mi-muted);cursor:pointer;font-weight:700;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;padding:.24rem .58rem}.mi-filter svg{width:19px;height:19px;display:block}.mi-filter:hover{color:var(--mi-ink)}.mi-filter[aria-pressed=true]{background:transparent;border-bottom-color:#c8581d;color:#9c421f;box-shadow:none}
.mi-select{max-width:100%;padding-inline:.72rem;cursor:pointer;min-width:0;text-overflow:ellipsis;box-shadow:none}
.mi-load{display:grid;gap:.65rem;justify-items:start;background:var(--mi-paper);border:1px solid rgba(138,102,76,.15);border-radius:1.15rem;padding:1.1rem;color:var(--mi-muted);font-size:.88rem}.mi-content{min-width:0;display:grid;gap:.78rem}
.mi-summary{display:grid;grid-template-columns:1.12fr 1fr;gap:.55rem}
.mi-stat{display:grid;gap:.18rem;align-content:center;min-width:0;border:1px solid rgba(138,102,76,.15);border-radius:.95rem;background:var(--mi-paper);padding:.64rem .82rem;box-shadow:none}
.mi-stat strong{font-family:var(--app-display,'Noto Serif TC',Georgia,serif);font-weight:900;line-height:1.05;color:#422b21;font-size:1.38rem;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.mi-stat span{font-size:.73rem;line-height:1.3;color:var(--mi-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mi-panel,.mi-samples{display:grid;gap:.72rem;min-width:0;border:1px solid rgba(138,102,76,.15);border-radius:1.2rem;background:var(--mi-paper);padding:clamp(.85rem,3.4vw,1.2rem);box-shadow:none}.mi-panel>p{margin:-.35rem 0 0}.mi-samples[hidden]{display:none}
.mi-map-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;min-height:36px}
.mi-map-head h3{margin:0;line-height:1.22;font-family:var(--app-display,'Noto Serif TC',Georgia,serif);font-size:1.08rem;font-weight:700;white-space:nowrap}
.mi-map-reset{border:0;background:transparent;color:#9c421f;border-radius:0;min-height:36px;padding:0 .15rem;font-size:.78rem;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer;white-space:nowrap}
.mi-map-reset:hover{color:#7a2e12}
.mi-map-reset[hidden]{display:none}
.mi-map-stage{position:relative;border-radius:.95rem;overflow:hidden;border:1px solid rgba(138,102,76,.18);background:#e8eaed;min-width:0}
.mi-map-canvas{width:100%;height:340px;background:#e8eaed}
.mi-map-stage{isolation:isolate}
.mi-street-canvas{background:#e8efeb}
.mi-map-loading{display:grid;place-content:center;font-size:.85rem;color:var(--mi-muted)}
.mi-street-marker{border:0;background:none}
.mi-map-expand{background:white;color:#422b21;border:1px solid #aaa;border-radius:4px;padding:6px 9px;min-height:32px;cursor:pointer}
.mi-fullscreen-dialog:modal{inset:0;margin:0;padding:0;border:none;width:100%;max-width:none;height:100%;height:100dvh;max-height:none}
.mi-fullscreen-dialog .mi-map-canvas{height:100%}
.mi-map-retry{color:var(--mi-accent);background:transparent;border:0;text-decoration:underline;cursor:pointer}
.mi-map-status{position:absolute;inset:0;display:grid;place-items:center;padding:1rem;text-align:center;font-size:.82rem;color:var(--mi-muted);background:rgba(255,253,248,.88);z-index:2}
.mi-map-status[hidden]{display:none}
.mi-pin{min-width:36px;min-height:36px;padding:2px;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;position:relative;outline:none;pointer-events:auto;transition:opacity 160ms ease}
.mi-map-stage.has-selection .mi-pin:not([aria-pressed=true]){opacity:.52}
.mi-pin-core{min-width:27px;height:27px;padding:0 7px;border-radius:999px;background:var(--mi-green);color:#fffdf8;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(24,20,18,.32);display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;font-variant-numeric:tabular-nums;line-height:1;position:relative;transition:transform 160ms cubic-bezier(.16,1,.3,1),background-color 160ms ease,box-shadow 160ms ease}
.mi-pin-core::after{content:'';position:absolute;top:calc(100% - 1px);left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#ffffff}
.mi-pin.is-empty .mi-pin-core{min-width:14px;width:14px;height:14px;padding:0;background:#64748b;font-size:0}
.mi-pin.is-empty .mi-pin-core::after{display:none}
.mi-pin-tag{position:absolute;bottom:calc(100% + 2px);left:50%;transform:translateX(-50%) translateY(2px);white-space:nowrap;background:rgba(40,24,16,.94);color:#fffaf2;font-size:.73rem;font-weight:600;padding:.24rem .56rem;border-radius:.48rem;box-shadow:0 4px 12px rgba(24,16,10,.26);opacity:0;pointer-events:none;transition:opacity 150ms ease,transform 150ms cubic-bezier(.16,1,.3,1)}
.mi-pin:hover .mi-pin-core,.mi-pin:focus-visible .mi-pin-core,.mi-pin[aria-pressed=true] .mi-pin-core{background:#a04423;transform:scale(1.14);box-shadow:0 0 0 3px rgba(244,162,97,.45),0 5px 14px rgba(88,30,12,.36)}
.mi-pin.is-empty:hover .mi-pin-core,.mi-pin.is-empty:focus-visible .mi-pin-core,.mi-pin.is-empty[aria-pressed=true] .mi-pin-core{min-width:18px;width:18px;height:18px}
.mi-pin:hover .mi-pin-tag,.mi-pin:focus-visible .mi-pin-tag,.mi-pin[aria-pressed=true] .mi-pin-tag{opacity:1;transform:translateX(-50%) translateY(-1px)}
.mi-plot svg{display:block;width:100%;height:auto}
.mi-map-hint{margin:0;font-size:.75rem;color:var(--mi-muted);text-align:center}
.mi-map-hint[hidden]{display:none}
.mi-centre-card{display:grid;gap:.48rem;min-width:0;border-radius:.95rem;padding:.88rem .95rem;background:#fffaf3;border:1px solid rgba(138,102,76,.18);scroll-margin-bottom:5.4rem}
.mi-centre-card-top{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.mi-centre-card h4{font-size:.98rem;font-weight:800}
.mi-centre-clear{border:0;background:transparent;color:#7b6457;border-radius:0;min-height:34px;padding:0 .15rem;font-size:.76rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
.mi-centre-clear:hover{color:#9c421f;text-decoration:underline;text-underline-offset:3px}
.mi-centre-card img{width:100%;max-height:7.5rem;object-fit:cover;border-radius:.6rem}.mi-centre-card h4,.mi-centre-card p{overflow-wrap:anywhere}.mi-centre-card p{margin:0;color:#5c4a3d;font-size:.79rem;line-height:1.5}
.mi-centre-sublist{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.1rem}
.mi-centre-subbtn{min-height:38px;padding:.28rem .68rem;border-radius:10px;border:1px solid rgba(138,102,76,.26);background:#fffdf9;color:#5a4538;font-size:.78rem;font-weight:700;cursor:pointer;transition:border-color 150ms ease,color 150ms ease}
.mi-centre-subbtn:hover{border-color:#c8581d;color:#9c421f}
.mobile-insights .mi-primary-cta,.mobile-insights a.mi-primary-cta{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;width:100%;min-height:46px;padding:0 1rem;margin-top:.15rem;border:0;border-radius:14px;background:linear-gradient(135deg,#e27832 0%,#c8581d 100%);color:#ffffff;font-size:.9rem;font-weight:800;text-decoration:none;cursor:pointer;box-shadow:0 8px 18px -8px rgba(175,72,20,.48);transition:filter 150ms ease,transform 150ms ease}
.mi-primary-cta:hover{filter:brightness(1.04)}
.mi-primary-cta:active{transform:scale(.99)}
.mi-link-row{display:flex;flex-wrap:wrap;gap:.35rem .95rem;margin-top:.05rem}.mobile-insights :is(.mi-link-row,.mi-panel>p,.mi-callout,.mi-table) a{font-size:.79rem;font-weight:600;color:#913a20;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;overflow-wrap:anywhere;width:fit-content}
.mi-centre-card[hidden]{display:none}
.mi-age-list{display:grid;gap:.3rem}.mi-age{width:100%;display:grid;gap:.45rem;padding:.58rem .65rem;border:1px solid transparent;border-radius:.82rem;background:transparent;text-align:left;cursor:pointer;transition:background-color 160ms ease,border-color 160ms ease}.mi-age:hover{background:#fff7ec}.mi-age[aria-pressed=true]{border-color:#e8b998;background:#fff1e2}.mi-age-row{display:flex;justify-content:space-between;gap:.4rem;align-items:baseline;font-size:.82rem;line-height:1.35}.mi-age-row strong{white-space:nowrap;font-size:.86rem;font-variant-numeric:tabular-nums}.mi-age-track{height:.66rem;background:#f2e5d6;border-radius:999px;overflow:hidden}.mi-age-track i{display:block;height:100%;width:var(--mi-bar);background:linear-gradient(90deg,#e08358,#c95f39);border-radius:inherit}.mi-age:nth-child(2) .mi-age-track i{background:linear-gradient(90deg,#c9613a,#a64222)}.mi-age:nth-child(3) .mi-age-track i{background:linear-gradient(90deg,#f0a667,#dc8643)}.mi-age:nth-child(n+4) .mi-age-track i{background:linear-gradient(90deg,#94a593,#728876)}
.mi-plot{min-width:0;background:#fffaf2;border:1px solid #f0e0ce;border-radius:.95rem;overflow:hidden}.mi-plot text{font-size:10px;fill:#6b5a4c}.mi-gridline{stroke:#ecdecd;vector-effect:non-scaling-stroke}.mi-series{fill:none;stroke-width:2.35;vector-effect:non-scaling-stroke}.mi-active-line{stroke:#be8a70;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}.mi-plot svg{cursor:crosshair}.mi-legend{display:flex;gap:.9rem;color:#624e3e;font-size:.8rem;font-weight:500}.mi-legend i{display:inline-block;width:.65rem;height:.65rem;border-radius:50%;margin-inline-end:.35rem}.mi-month-controls{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}.mi-month-controls .mi-select{border-radius:.82rem}.mi-month-summary{font-size:.85rem;font-weight:700;color:#6a3928;font-variant-numeric:tabular-nums}.mi-table summary{cursor:pointer;color:#784830;font-size:.82rem;font-weight:600;min-height:44px;display:list-item;padding-top:.65rem}.mi-table table{width:100%;border-collapse:collapse;font-size:.79rem;color:#564841;font-variant-numeric:tabular-nums}.mi-table :is(td,th){text-align:left;border-top:1px solid var(--mi-border);padding:.44rem .22rem}.mi-table :is(td,th):not(:first-child){text-align:right}
.mi-samples h4{font-size:1.02rem}.mi-sample-list{display:grid;border-top:1px solid #efe0ce}.mi-profile{width:100%;min-height:50px;display:flex;align-items:center;justify-content:space-between;gap:.65rem;text-align:left;background:transparent;border:0;border-bottom:1px solid #efe0ce;padding:.52rem .25rem;cursor:pointer;transition:background-color 150ms ease,padding-inline 150ms ease}.mi-profile:hover{background:#fff5e8;padding-inline:.45rem;border-radius:.55rem}.mi-profile div{display:grid;gap:.12rem;min-width:0;overflow-wrap:anywhere}.mi-profile strong{font-size:.86rem}.mi-profile small{font-size:.74rem;color:var(--mi-muted)}.mi-profile>span{font-size:1.1rem;color:#a04423}
.mi-callout{display:grid;gap:.4rem;padding:.85rem .95rem;background:#fffaf2;border:1px solid rgba(138,102,76,.16);border-radius:.95rem;color:#67483c;font-size:.84rem;line-height:1.58}.mi-callout h4,.mi-callout p{margin:0}.mi-callout h4{font-size:.92rem;color:var(--mi-ink)}.mi-wait-bar:hover,.mi-wait-bar:focus-visible{background:#fff1e0;border-color:#e8be9e}.mi-wait-bar[aria-pressed=true] .mi-age-track i,.mi-wait-bar:hover .mi-age-track i,.mi-wait-bar:focus-visible .mi-age-track i{background:#a04423}.mi-wait-reading{min-height:2.1rem;margin:0;color:#734424;font-size:.82rem;font-weight:500}
.mi-scatter-wrap{position:relative;min-width:0;background:#fffaf2;border:1px solid #f0e0ce;border-radius:.95rem;padding:.35rem .28rem .22rem;overflow:visible}
.mi-scatter-wrap svg{display:block;width:100%;height:auto;overflow:visible;cursor:default}
.mi-scatter-wrap text{font-size:10px;fill:#6b5a4c}
.mi-scatter-lane{fill:rgba(236,216,194,.24)}
.mi-scatter-axis{stroke:#cdb4a5;vector-effect:non-scaling-stroke}
.mi-scatter-grid{stroke:#efe2d2;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}
.mi-scatter-xlabel{font-size:10.5px;font-weight:800;fill:#422b21}
.mi-scatter-xsub{font-size:8.8px;fill:#7b6457}
.mi-scatter-dot{cursor:pointer}
.mi-scatter-dot .mi-dot-core{transition:transform 150ms cubic-bezier(.16,1,.3,1),opacity 150ms ease}
.mi-scatter-dot:hover .mi-dot-core,.mi-scatter-dot:focus-visible .mi-dot-core{transform:scale(1.22)}
.mi-scatter-dot:focus-visible,.mi-flow .mi-flow-node:focus-visible{outline:none;filter:drop-shadow(0 0 2px #513324)}
.mi-scatter-tooltip{position:absolute;z-index:8;pointer-events:none;background:rgba(42,26,18,.95);color:#fffaf2;font-size:.76rem;font-weight:700;line-height:1.3;padding:.34rem .62rem;border-radius:.55rem;white-space:nowrap;box-shadow:0 8px 20px -6px rgba(34,18,10,.4);transform:translate(-50%,calc(-100% - 10px));transition:opacity 120ms ease}
.mi-scatter-tooltip[hidden]{display:none}
.mi-scatter-legend{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.3rem .65rem;font-size:.74rem;color:#624e3e;font-weight:600}
.mi-scatter-legend span{display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap}
.mi-scatter-legend i{display:inline-block;border-radius:50%;flex-shrink:0}
.mi-scatter-legend .is-normal{width:8.5px;height:8.5px;background:#b67855}
.mi-scatter-legend .is-outlier{width:12px;height:12px;background:#c93b2b;box-shadow:0 0 0 3px rgba(201,59,43,.18)}
.mi-story-card{display:grid;gap:.68rem;padding:.15rem 0 0;background:transparent;border:0;border-radius:0}
.mi-story-card img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:center 30%;border-radius:.95rem;background:#f2e2d2;display:block}
.mi-story-head{display:grid;gap:.2rem}
.mi-story-card h4,.mi-story-card p{margin:0}
.mi-story-card h4{font-family:var(--app-display,'Noto Serif TC',Georgia,serif);font-size:1.34rem;font-weight:900;color:#3d261b;line-height:1.2}
.mi-story-meta{font-size:.82rem;color:var(--mi-muted);line-height:1.45}
.mi-story-wait{display:inline-flex;align-items:center;gap:.4rem;width:fit-content;padding:.32rem .68rem;border-radius:.62rem;background:#fdf0ed;border:1px solid rgba(201,59,43,.24);color:#b02c1e;font-size:.82rem;font-weight:800;font-variant-numeric:tabular-nums}
.mi-story-text{display:grid;gap:.55rem;padding:.78rem .88rem;border-radius:.9rem;background:#fffdf9;border:1px solid rgba(138,102,76,.16);font-size:.87rem;line-height:1.7;color:#422b21}
.mi-story-text small{font-size:.76rem;color:var(--mi-muted)}
.mi-story-events{display:grid;gap:.35rem;margin:.1rem 0;padding:.65rem .8rem;list-style:none;font-size:.79rem;border-radius:.85rem;background:#fff7ec;border:1px solid rgba(138,102,76,.14)}
.mi-story-events li{display:flex;justify-content:space-between;gap:.35rem}
.mi-story-events time{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:700}
.mi-story-sheet{position:fixed;inset:auto 0 0;margin:0 auto;width:min(100%,393px);max-height:84dvh;overflow:auto;padding:.65rem 1.05rem max(1.15rem,env(safe-area-inset-bottom));border:1px solid #ebccb3;border-bottom:0;border-radius:1.45rem 1.45rem 0 0;background:#fffaf3;color:#422b21;box-shadow:0 -.6rem 2.4rem rgba(42,24,14,.3);animation:miSheetUp 220ms cubic-bezier(.16,1,.3,1)}
@media (min-width:540px){.mi-story-sheet{bottom:max(24px,calc((100dvh - 812px)/2));width:min(393px,calc(100vw - 48px));max-height:min(700px,calc(100dvh - 110px));border-bottom:1px solid #ebccb3;border-radius:1.5rem 1.5rem 2.35rem 2.35rem}}
@keyframes miSheetUp{from{transform:translateY(28px);opacity:.6}to{transform:translateY(0);opacity:1}}
.mi-story-sheet::backdrop{background:rgba(42,24,14,.52);backdrop-filter:blur(5px)}
.mi-story-handle{width:38px;height:4px;border-radius:999px;background:rgba(138,102,76,.32);margin:0 auto .65rem}
.mi-story-sheet header{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.7rem}
.mi-story-sheet header h3{font-family:var(--app-display,'Noto Serif TC',Georgia,serif);font-size:1.18rem;font-weight:900;margin:0}
.mi-story-close{border:0;background:transparent;color:#725c4e;font-size:.84rem;font-weight:700;min-height:36px;padding:0 .35rem;cursor:pointer}
.mi-story-close:hover{color:#9c421f}
.mi-story-sheet .mi-story-action{background:linear-gradient(135deg,#e27832 0%,#c8581d 100%);border:0;border-radius:14px;color:#fff;width:100%;min-height:48px;font-size:.92rem;font-weight:800;margin-top:.2rem;cursor:pointer;box-shadow:0 10px 20px -8px rgba(175,72,20,.46)}
.mi-story-sheet .mi-story-action:hover{filter:brightness(1.04)}
.mi-flow .mi-flow-node{cursor:pointer}.mi-flow .mi-flow-node text{font-size:10px;font-weight:700;paint-order:stroke;stroke:#fffaf2;stroke-width:3.5px;stroke-linejoin:round}.mi-flow .mi-flow-node:focus-visible rect,.mi-flow .mi-flow-node[aria-pressed=true] rect{stroke:#a04423;stroke-width:2}.mi-flow .mi-stage-label{font-size:9.5px;font-weight:800;fill:#654636}.mi-flow .mi-flow-ribbon{pointer-events:none;transition:opacity .16s}.mi-flow-controls{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}.mi-flow-controls label{font-size:.82rem;font-weight:700}.mi-flow-detail,.mi-flow-range{font-size:.79rem;color:var(--mi-muted);min-height:.9rem;line-height:1.5}.mi-flow-table td:nth-child(2),.mi-flow-table th:nth-child(2){text-align:left}.mi-flow-reset{border:0;background:transparent;color:#9c421f;text-decoration:underline;text-underline-offset:3px;padding:0 .25rem}.mi-flow-reset[hidden]{display:none}
.mi-takeaway{display:grid;gap:.3rem;padding:.78rem .92rem;border-radius:.95rem;background:#fffaf2;border:1px solid rgba(138,102,76,.16);color:#422b21}
.mi-takeaway-kicker{font-size:.72rem;font-weight:800;letter-spacing:.05em;color:#a04423}
.mi-takeaway-lead{margin:0;font-size:.92rem;font-weight:800;line-height:1.48;color:#3d261b}
.mi-takeaway-sub{margin:0;font-size:.76rem;color:#6c5245;line-height:1.45}
.mi-case-entry{width:100%;display:grid;grid-template-columns:54px minmax(0,1fr) auto;align-items:center;gap:.72rem;padding:.65rem .78rem;border-radius:.95rem;border:1px solid rgba(138,102,76,.18);background:#fffdf9;text-align:left;cursor:pointer;box-shadow:none;transition:border-color 150ms ease,background-color 150ms ease}
.mi-case-entry:hover{background:#fffaf3;border-color:rgba(156,66,31,.35)}
.mi-case-thumb{width:54px;height:54px;border-radius:.72rem;object-fit:cover;background:#f2e2d2;display:block}
.mi-case-copy{display:grid;gap:.16rem;min-width:0}
.mi-case-badge{display:inline-flex;width:fit-content;padding:0;border-radius:0;background:transparent;color:#255832;font-size:.72rem;font-weight:800}
.mi-case-copy strong{font-size:.94rem;font-weight:800;color:#422b21;overflow-wrap:anywhere}
.mi-case-copy small{font-size:.75rem;color:var(--mi-muted);font-variant-numeric:tabular-nums}
.mi-case-cta{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 12px;border-radius:12px;background:linear-gradient(135deg,#e27832 0%,#c8581d 100%);color:#fff;font-size:.78rem;font-weight:800;white-space:nowrap;box-shadow:0 6px 14px -6px rgba(175,72,20,.42)}
.mi-guide-list{display:grid;gap:.7rem}
.mi-guide-card{display:grid;gap:.35rem;padding:.85rem .95rem;border-radius:.95rem;background:#fffdf9;border:1px solid rgba(138,102,76,.15)}
.mi-guide-card h4{margin:0;font-size:.92rem;font-weight:800;color:#422b21}
.mi-guide-card p{margin:0;font-size:.82rem;line-height:1.58;color:#5d473b}
.mi-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:0}
.mi-tab{min-width:0;padding-inline:.12rem;min-height:44px}
.mi-map-stage .mi-atlas{display:block;width:100%;height:auto;background:#e9f1ed}
.mi-atlas .mi-terrain{fill:#fff8e8;stroke:#b6c3b4;stroke-width:.7;vector-effect:non-scaling-stroke}
.mi-atlas .mi-marker{cursor:pointer}
.mi-atlas .mi-marker-bubble{fill:var(--mi-green);stroke:white;stroke-width:1.6}
.mi-atlas .mi-empty .mi-marker-bubble{fill:#64748b}
.mi-atlas .mi-marker[aria-pressed=true] .mi-marker-bubble,.mi-atlas .mi-marker:focus-visible .mi-marker-bubble{fill:var(--mi-accent);stroke:#422b21}
.mi-atlas text{fill:white;text-anchor:middle;dominant-baseline:central;font:700 8px sans-serif;pointer-events:none}
.mi-centre-choice{width:100%}
.mi-org{flex:1;min-width:0;max-width:14rem}.mi-org .mi-select{width:100%}
.mi-case-entry[hidden]{display:none}
@media(prefers-reduced-motion:reduce){.mi-flow .mi-flow-ribbon,.mi-pin-core,.mi-pin-tag,.mi-case-entry,.mi-primary-cta{transition:none}}
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

const HK_CENTER = { lat: 22.345, lng: 114.155 };
const HK_MAX_BOUNDS = { south: 22.12, west: 113.78, north: 22.59, east: 114.48 };

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

function districtMap(data, points, onCentre) {
  const image = drawing('svg', {class:'mi-atlas', viewBox:'0 0 344 237', role:'group', 'aria-label':'香港領養中心地圖'});
  const markers = new Map();
  for (const district of data.districts_geojson?.features || []) {
    image.append(drawing('path', {d:boundary(district.geometry), class:'mi-terrain', 'fill-rule':'evenodd', 'aria-hidden':'true'}));
  }
  const maximum = Math.max(1, ...points.map(point => point.count));
  for (const point of [...points].sort((first, second) => second.count - first.count)) {
    const [centre] = point.entries;
    const [x, y] = project(centre.longitude, centre.latitude);
    const radius = point.count ? 6 + Math.sqrt(point.count / maximum) * 7 : 4.5;
    const count = point.count ? format(point.count) + ' 則待領養檔案' : '尚無可對應的檔案';
    const marker = drawing('g', {class:point.count ? 'mi-marker' : 'mi-marker mi-empty',
      transform:`translate(${x} ${y})`, tabindex:'0', role:'button', 'aria-pressed':'false',
      'aria-label':point.name + '，' + count});
    marker.append(drawing('title', {}, point.name + ' · ' + count),
      drawing('circle', {r:Math.max(10, radius), fill:'transparent'}), drawing('circle', {r:radius, class:'mi-marker-bubble'}));
    if (point.count) marker.append(drawing('text', {x:0,y:0}, format(point.count)));
    marker.addEventListener('click', () => onCentre(point.id));
    marker.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCentre(point.id);
      }
    });
    image.append(marker);
    markers.set(point.id, marker);
  }
  return {image, markers};
}

function centreMap(data, selectedCentre, onCentre, api, species, viewListings) {
  const block = node('section', 'mi-panel');
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
    name: entries.length === 1 ? entries[0].name : `${entries[0].organisation}（同址 ${entries.length} 中心）`,
    shortName: entries.length === 1 ? (entries[0].short_name || entries[0].name) : `${entries[0].organisation} · ${entries.length}處`,
    district: entries[0].district || '',
    entries,
    count: entries.reduce((total, entry) => total + entry.count, 0),
  }));
  const shared = new Map(points.filter(point => point.entries.length > 1).map(point => [point.id, point]));

  const head = node('div', 'mi-map-head');
  head.append(node('h3', '', '領養中心分布'));
  const resetMapBtn = button('mi-map-reset', '‹ 全港概覽', () => onCentre(''));
  resetMapBtn.hidden = true;
  resetMapBtn.setAttribute('aria-label', '清除中心篩選並返回全港視角');
  head.append(resetMapBtn);
  block.append(head);

  const stage = node('div', 'mi-map-stage');
  const canvas = node('div', 'mi-map-canvas');
  canvas.setAttribute('role', 'region');
  canvas.setAttribute('aria-label', '香港領養中心 Google Maps 互動地圖');
  const atlas = districtMap(data, points, onCentre);
  const loading = node('div', 'mi-map-canvas mi-map-loading', '正在載入街道地圖…');
  loading.setAttribute('role', 'status');
  stage.append(loading);
  block.append(stage);

  const hint = node('p', 'mi-map-hint', '點選標記或選擇中心。灰點代表尚無可對應的檔案。');
  block.append(hint);
  const choices = select('mi-select mi-centre-choice', '選擇公開領養中心',
    [['', '選擇領養中心'], ...[...shared].map(([id, point]) => [id, point.name]),
      ...centres.map(centre => [centre.id, centre.name + '（' + format(centre.count) + ' 則）'])], selectedCentre, onCentre);
  if (centres.length) block.append(choices);
  const boundarySource = source('行政區邊界來源 ↗', data.districts_source_url);
  if (boundarySource) {
    boundarySource.hidden = true;
    block.append(boundarySource);
  }
  const notice = node('p', 'mi-map-hint');
  notice.setAttribute('role', 'status');
  notice.hidden = true;
  block.append(notice);

  const card = node('div', 'mi-centre-card');
  card.hidden = true;
  card.setAttribute('aria-live', 'polite');
  block.append(card);

  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let selected = selectedCentre;
  let gmap = null;
  let street = null;
  let fallbackStarted = false;
  let LatLngBoundsCtor = null;
  let destroyed = false;
  const pinButtons = new Map();
  const markerInstances = new Map();

  function fitAllPoints() {
    if (street) { street.fit(); return; }
    if (!gmap || !LatLngBoundsCtor) return;
    if (points.length >= 2) {
      const bounds = new LatLngBoundsCtor();
      for (const point of points) {
        const [c] = point.entries;
        bounds.extend({ lat: c.latitude, lng: c.longitude });
      }
      gmap.fitBounds(bounds, { top: 44, right: 32, bottom: 32, left: 32 });
      return;
    }
    if (points.length === 1) {
      const [c] = points[0].entries;
      gmap.setCenter({ lat: c.latitude, lng: c.longitude });
      gmap.setZoom(13);
      return;
    }
    gmap.setCenter(HK_CENTER);
    gmap.setZoom(10.6);
  }

  function focusSelectedPoint(id) {
    if (street) { street.focus(id); return; }
    if (!gmap || !id) return;
    const direct = points.find(p => p.id === id || p.entries.some(e => e.id === id));
    if (!direct) return;
    const [c] = direct.entries;
    const target = { lat: c.latitude, lng: c.longitude };
    const nextZoom = Math.max(gmap.getZoom() || 10.6, 13.2);
    if (typeof gmap.moveCamera === 'function') {
      gmap.moveCamera({ center: target, zoom: nextZoom });
    } else {
      gmap.setCenter(target);
      gmap.setZoom(nextZoom);
    }
  }

  function syncMarkersSelection(id) {
    street?.updateSelection(id);
    for (const [key, marker] of atlas.markers) {
      const active = key === id || shared.get(key)?.entries.some(entry => entry.id === id);
      marker.setAttribute('aria-pressed', String(Boolean(active)));
    }
    for (const [key, pin] of pinButtons) {
      const active = key === id || shared.get(key)?.entries.some(entry => entry.id === id);
      pin.setAttribute('aria-pressed', String(Boolean(active)));
      const entry = markerInstances.get(key);
      if (entry) entry.marker.zIndex = active ? 2000 : entry.baseZ;
    }
  }

  function clearGoogle() {
    for (const { marker } of markerInstances.values()) marker.map = null;
    markerInstances.clear();
    pinButtons.clear();
    gmap = null;
  }
  function makePin(point, activate) {
    const countLabel = point.count ? `${format(point.count)} 則待領養檔案` : '暫無對應檔案';
    const pin = button(`mi-pin${point.count ? '' : ' is-empty'}`, '', activate);
    pin.setAttribute('aria-label', `${point.name}，${countLabel}`);
    pin.setAttribute('aria-pressed', 'false');
    const tag = node('span', 'mi-pin-tag', point.shortName);
    tag.setAttribute('aria-hidden', 'true');
    pin.append(tag, node('span', 'mi-pin-core', point.count ? format(point.count) : ''));
    return pin;
  }
  function showNotice(text) {
    notice.textContent = text;
    notice.hidden = !text;
  }
  function useAtlas() {
    if (destroyed) return;
    street?.destroy();
    street = null;
    stage.replaceChildren(atlas.image);
    if (boundarySource) boundarySource.hidden = false;
    showNotice('街道圖暫時無法載入，現顯示行政區示意圖。');
    notice.append(button('mi-map-retry', '重試街道圖', () => {
      fallbackStarted = false;
      useStreetMap();
    }));
    syncMarkersSelection(selected);
  }
  async function useStreetMap() {
    if (destroyed || fallbackStarted) return;
    fallbackStarted = true;
    clearGoogle();
    try {
      const { createStreetMap } = await import('./street-map.js');
      if (destroyed) return;
      const streetCanvas = node('div', 'mi-map-canvas mi-street-canvas');
      streetCanvas.setAttribute('role', 'region');
      streetCanvas.setAttribute('aria-label', '香港領養中心互動街道地圖');
      stage.replaceChildren(streetCanvas);
      if (boundarySource) boundarySource.hidden = true;
      showNotice('');
      street = createStreetMap(streetCanvas, points, selected,
        point => makePin(point, () => onCentre(point.id)), useAtlas, showNotice);
    } catch {
      useAtlas();
    }
  }
  window.addEventListener('adoption-maps-unavailable', useStreetMap);
  const fallbackTimer = setTimeout(useStreetMap, 10000);
  loadGoogleMapsBundle(api)
    .then(bundle => {
      if (destroyed || fallbackStarted) return;
      if (!bundle || mapsAuthFailed) return useStreetMap();
      const { Map: GoogleMap, AdvancedMarkerElement, LatLngBounds } = bundle;
      LatLngBoundsCtor = LatLngBounds;
      stage.replaceChildren(canvas);
      if (boundarySource) boundarySource.hidden = true;

      gmap = new GoogleMap(canvas, {
        center: HK_CENTER,
        zoom: 10.6,
        mapId: 'DEMO_MAP_ID',
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        cameraControl: false,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
        restriction: {
          latLngBounds: HK_MAX_BOUNDS,
          strictBounds: false,
        },
      });

      for (const point of [...points].sort((a, b) => a.count - b.count)) {
        const [centre] = point.entries;
        const countLabel = point.count ? `${format(point.count)} 則待領養檔案` : '暫無對應檔案';
        const baseZ = point.count ? 100 + point.count : 10;

        let lastActivateAt = 0;
        const activate = event => {
          event?.stopPropagation?.();
          const now = Date.now();
          if (now - lastActivateAt < 150) return;
          lastActivateAt = now;
          onCentre(point.id);
        };

        const pin = makePin(point, activate);

        const marker = new AdvancedMarkerElement({
          map: gmap,
          position: { lat: centre.latitude, lng: centre.longitude },
          title: `${point.name}，${countLabel}`,
          zIndex: baseZ,
        });
        marker.append(pin);
        marker.addEventListener('click', activate);

        pinButtons.set(point.id, pin);
        markerInstances.set(point.id, { marker, baseZ });
      }

      syncMarkersSelection(selected);
      if (selected) focusSelectedPoint(selected);
      else fitAllPoints();
    })
    .catch(useStreetMap)
    .finally(() => clearTimeout(fallbackTimer));

  function showCentre(id) {
    const centre = centres.find(item => item.id === id);
    const group = shared.get(id);
    if (card.dataset.centre === id) return;
    card.dataset.centre = id;
    card.replaceChildren();
    if (group) {
      card.hidden = false;
      const top = node('div', 'mi-centre-card-top');
      top.append(node('h4', '', group.shortName || group.name), button('mi-centre-clear', '收起', () => onCentre('')));
      card.append(top);
      const first = group.entries[0];
      const metaParts = [first?.district, first?.address].filter(Boolean).join(' · ');
      if (metaParts) card.append(node('p', '', metaParts));
      const sublist = node('div', 'mi-centre-sublist');
      for (const entry of group.entries) {
        sublist.append(button('mi-centre-subbtn', `${entry.short_name || entry.name}（${format(entry.count)} 則）`, () => onCentre(entry.id)));
      }
      card.append(sublist);
      return;
    }
    if (!centre) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    const photoSource = source('中心照片', centre.photo_url);
    if (photoSource) {
      const photo = node('img');
      photo.src = photoSource.href;
      photo.alt = centre.name;
      photo.loading = 'lazy';
      photo.addEventListener('error', () => photo.remove(), { once: true });
      card.append(photo);
    }
    const top = node('div', 'mi-centre-card-top');
    top.append(node('h4', '', centre.short_name || centre.name), button('mi-centre-clear', '收起', () => onCentre('')));
    card.append(top);
    const metaParts = [centre.district, centre.address].filter(Boolean).join(' · ');
    if (metaParts) card.append(node('p', '', metaParts));
    card.append(node('p', '', centre.count
      ? `${format(centre.count)} 則待領養`
      : '本站尚無可對應此中心的檔案，可向機構查詢。'));
    const reference = source('機構官網 ↗', centre.source_url);
    const gmapsUrl = finite(centre.latitude) && finite(centre.longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centre.latitude},${centre.longitude}`)}`
      : centre.coordinate_source_url;
    const coordinate = source('Google Maps ↗', gmapsUrl);
    const links = node('div', 'mi-link-row');
    if (centre.count > 0) {
      card.append(button('mi-primary-cta', '查看中心檔案', viewListings));
      const query = new URLSearchParams({ centre_id: centre.id });
      if (species) query.set('species', species);
      const listings = node('a', '', `在探索查看全部 ${format(centre.count)} 則檔案`);
      listings.href = '#discover?' + query;
      links.append(listings);
    } else if (reference) {
      const primaryRef = source('前往機構官網查詢 ↗', centre.source_url);
      if (primaryRef) {
        primaryRef.className = 'mi-primary-cta';
        card.append(primaryRef);
      }
    }
    if (centre.count > 0 && reference) links.append(reference);
    if (coordinate && coordinate.href !== reference?.href) links.append(coordinate);
    if (finite(centre.latitude) && finite(centre.longitude)) {
      const viewpoint = encodeURIComponent(`${centre.latitude},${centre.longitude}`);
      links.append(source('附近街景 ↗', `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${viewpoint}`));
    }
    if (links.childElementCount) card.append(links);
  }

  function update(id, { animate = true } = {}) {
    const changed = selected !== id;
    selected = id;
    choices.value = id;
    stage.classList.toggle('has-selection', Boolean(id));
    resetMapBtn.hidden = !id;
    hint.hidden = Boolean(id);
    syncMarkersSelection(id);
    showCentre(id);
    if (changed) {
      if (id) {
        focusSelectedPoint(id);
        if (animate && !card.hidden) {
          requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
          });
        }
      } else {
        fitAllPoints();
      }
    }
  }

  function destroy() {
    destroyed = true;
    clearTimeout(fallbackTimer);
    window.removeEventListener('adoption-maps-unavailable', useStreetMap);
    street?.destroy();
    clearGoogle();
  }

  update(selectedCentre, { animate: false });
  return { block, update, shared, destroy };
}

function takeawayBanner(kicker, lead, sub = '') {
  const box = node('div', 'mi-takeaway');
  if (kicker) box.append(node('span', 'mi-takeaway-kicker', kicker));
  box.append(node('p', 'mi-takeaway-lead', lead));
  if (sub) box.append(node('p', 'mi-takeaway-sub', sub));
  return box;
}

function ageChart(data, selectedAge, onAge) {
  const block = panel('年齡分布','點選年齡組篩選下方動物');
  const rows = node('div','mi-age-list');
  const ages = data.ages || [];
  const known = ages.filter(item => ['young','adult','senior'].includes(item.key) && finite(item.count) && item.count > 0);
  const unknown = ages.find(item => item.key === 'unknown')?.count || 0;
  const grouped = ages.find(item => item.key === 'group')?.count || 0;
  const totalCount = data.total || ages.reduce((sum, item) => sum + (item.count || 0), 0);
  if (known.length) {
    const topAge = known.reduce((best, item) => item.count > best.count ? item : best, known[0]);
    const pct = totalCount ? Math.round((topAge.count / totalCount) * 100) : 0;
    const lead = `在單一年齡組別中，以「${topAge.label}」最多（${format(topAge.count)} 則，佔全部待領養檔案 ${pct}%）`;
    const sub = [unknown ? `${format(unknown)} 則年齡未明或跨組` : '', grouped ? `${format(grouped)} 則為成對或多隻檔案` : ''].filter(Boolean).join('，');
    block.append(takeawayBanner('重點結論', lead, sub));
  }
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

const AGE_BAND_COLUMNS = [
  { key: 'young', label: '幼年', sub: '<1歲' },
  { key: 'adult', label: '成年', sub: '1至未滿7歲' },
  { key: 'senior', label: '老年', sub: '≥7歲' },
];

function deterministicJitter(id) {
  let hash = 2166136261;
  const text = String(id || '');
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000 - 0.5;
}

function openStorySheet(item, openProfile, api) {
  const sheet = node('dialog', 'mi-story-sheet');
  sheet.setAttribute('aria-label', `查看牠的故事：${item.name || '動物'}`);
  const handle = node('div', 'mi-story-handle');
  handle.setAttribute('aria-hidden', 'true');
  const header = node('header');
  const closeBtn = button('mi-story-close', '關閉', () => sheet.close());
  closeBtn.setAttribute('aria-label', '關閉故事面板');
  header.append(node('h3', '', '查看牠的故事'), closeBtn);

  const card = node('article', 'mi-story-card');
  const name = item.name || '動物個案';
  const image = imageAsset(item.photo_url, name);
  if (image) card.append(image);

  const head = node('div', 'mi-story-head');
  head.append(node('h4', '', name));
  const speciesWord = item.species === 'cat' ? '貓' : item.species === 'dog' ? '狗' : '';
  const metaText = [speciesWord, item.age_label, item.breed, item.organisation].filter(Boolean).join(' · ');
  if (metaText) head.append(node('p', 'mi-story-meta', metaText));
  card.append(head);

  const elapsed = elapsedSummary(item);
  if (elapsed) card.append(node('p', 'mi-story-wait', elapsed));
  if (item.intake_evidence) {
    const evidence = node('details', 'mi-table');
    evidence.append(node('summary', '', '查看起算時間的機構原文'), node('p', '', item.intake_evidence));
    card.append(evidence);
  }

  const storyBox = node('div', 'mi-story-text');
  if (item.description) {
    storyBox.append(node('p', '', item.description));
  }
  const loadingNote = node('small', '', api ? '正在讀取機構介紹…' : '');
  if (!loadingNote.textContent) loadingNote.hidden = true;
  storyBox.append(loadingNote);
  card.append(storyBox);

  const reference = node('div', 'mi-link-row');
  const original = source('查看機構原始檔案 ↗', item.source_url);
  if (original) reference.append(original);
  card.append(reference);
  const events = (item.observations || []).filter(event => event.date && event.status_label);
  if (events.length) {
    const list = node('ol', 'mi-story-events');
    for (const event of events) {
      const row = node('li');
      const date = node('time', '', event.date);
      date.dateTime = event.date;
      row.append(date, node('span', '', event.status_label));
      list.append(row);
    }
    card.append(list);
  }

  if (item.id) {
    card.append(button('mi-story-action', '查看完整檔案', () => {
      sheet.close();
      openProfile(item.id);
    }));
  }

  sheet.append(handle, header, card);
  sheet.addEventListener('click', event => {
    if (event.target === sheet) sheet.close();
  });
  sheet.addEventListener('close', () => sheet.remove(), { once: true });
  document.body.append(sheet);
  sheet.showModal();

  if (api && item.id) {
    api.get(`/api/listings/${encodeURIComponent(item.id)}/story`)
      .then(story => {
        if (!sheet.open) return;
        const storySource = story?.source_url !== item.source_url ? source('查看機構原始檔案 ↗', story?.source_url) : null;
        if (storySource) reference.replaceChildren(storySource);
        const paragraphs = Array.isArray(story?.paragraphs)
          ? story.paragraphs
          : (item.description ? [item.description] : []);
        storyBox.replaceChildren();
        if (paragraphs.length) {
          for (const text of paragraphs) storyBox.append(node('p', '', text));
        } else {
          storyBox.append(node('small', '', '已收錄的資料未附文字介紹。'));
        }
      })
      .catch(() => {
        if (!sheet.open) return;
        loadingNote.hidden = true;
        if (!item.description) {
          storyBox.replaceChildren(node('small', '', '暫時未能讀取機構介紹。'));
        }
      });
  }
}

function scatterChart(waiting, openProfile, api) {
  const block = panel('異常等待', '按年齡組別比較有記錄的等候時間，點選紅點查看故事');
  const points = (waiting.points || []).filter(
    item => item.id && supportedDuration(item.wait_days) && ['young', 'adult', 'senior'].includes(item.age_band),
  );
  if (!points.length) {
    const notice = node('div', 'mi-callout');
    notice.append(
      node('h4', '', '這個篩選暫無可繪圖的檔案'),
      node('p', '', '散點圖需要可核對的起算時間及年齡組別。可切換物種或機構查看其他檔案。'),
    );
    block.append(notice);
    return block;
  }

  const outliers = points.filter(item => item.is_outlier);
  const longest = points[0];
  block.append(
    takeawayBanner(
      '重點結論',
      `${format(points.length)} 則可比較檔案中，${longest.name || '居首個案'}距記錄起點 ${elapsedLabel(longest)}`,
      `紅點標示按經過日數排序的前 ${format(outliers.length)} 則。`,
    ),
  );

  const legend = node('div', 'mi-scatter-legend');
  const normalKey = node('span');
  normalKey.append(node('i', 'is-normal'), document.createTextNode('一般個案（點選看天數）'));
  const outlierKey = node('span');
  outlierKey.append(node('i', 'is-outlier'), document.createTextNode(`前 ${outliers.length} 則（點選看故事）`));
  legend.append(normalKey, outlierKey);
  block.append(legend);

  const width = 344;
  const height = 216;
  const top = 19;
  const bottom = 176;
  const left = 44;
  const right = 332;
  const plotW = right - left;
  const laneW = plotW / AGE_BAND_COLUMNS.length;

  const rawMax = Math.max(...points.map(item => item.wait_days));
  const step = rawMax > 1000 ? 400 : rawMax > 500 ? 200 : rawMax > 200 ? 100 : 50;
  const maxDays = Math.max(step * 2, Math.ceil(rawMax / step) * step);
  const yScale = days => bottom - ((bottom - top) * days) / maxDays;
  const bandIndex = band => AGE_BAND_COLUMNS.findIndex(col => col.key === band);

  // Compute non-overlapping jittered positions within each age band column
  const positioned = [];
  const laneBuckets = new Map([['young', []], ['adult', []], ['senior', []]]);
  for (const item of points) laneBuckets.get(item.age_band)?.push(item);

  for (const [band, group] of laneBuckets.entries()) {
    const colIdx = bandIndex(band);
    const centerX = left + laneW * (colIdx + 0.5);
    const maxSpread = laneW * 0.34;
    const sorted = [...group].sort((a, b) => b.wait_days - a.wait_days);
    const placed = [];
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const py = yScale(item.wait_days);
      let px = centerX + deterministicJitter(item.id) * maxSpread * 2;
      if (item.is_outlier) {
        // Keep red outlier dots nicely spaced when multiple outliers share a band
        const outlierSlot = placed.filter(p => p.item.is_outlier).length;
        const offsets = [0, -24, 24, -14, 14];
        px = centerX + (offsets[outlierSlot % offsets.length] || 0);
      } else {
        for (let attempt = 0; attempt < 6; attempt++) {
          const clash = placed.some(p => Math.hypot(p.x - px, p.y - py) < (p.item.is_outlier ? 13 : 9));
          if (!clash) break;
          const nudge = (attempt % 2 === 0 ? 1 : -1) * (attempt + 1) * 7;
          px = Math.max(centerX - maxSpread, Math.min(centerX + maxSpread, px + nudge));
        }
      }
      const entry = { item, x: px, y: py };
      placed.push(entry);
      positioned.push(entry);
    }
  }

  const wrap = node('div', 'mi-scatter-wrap');
  const tooltip = node('div', 'mi-scatter-tooltip');
  tooltip.hidden = true;
  tooltip.setAttribute('role', 'status');
  tooltip.setAttribute('aria-live', 'polite');

  const graph = drawing('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'group',
    'aria-label': '依年齡組別及距記錄起點的日數繪製的散點圖',
  });

  // Subtle alternating lane band for middle column
  graph.append(
    drawing('rect', {
      x: left + laneW,
      y: top,
      width: laneW,
      height: bottom - top,
      class: 'mi-scatter-lane',
      rx: 6,
    }),
  );

  // Horizontal gridlines & Y-axis ticks
  const tickCount = Math.round(maxDays / step);
  for (let i = 0; i <= tickCount; i++) {
    const val = i * step;
    const y = yScale(val);
    graph.append(
      drawing('line', {
        x1: left,
        x2: right,
        y1: y,
        y2: y,
        class: i === 0 ? 'mi-scatter-axis' : 'mi-scatter-grid',
      }),
      drawing('text', { x: left - 6, y: y + 3.5, 'text-anchor': 'end' }, format(val)),
    );
  }
  graph.append(
    drawing('line', { x1: left, x2: left, y1: top, y2: bottom, class: 'mi-scatter-axis' }),
    drawing('text', { x: left, y: 12 }, '距記錄起點（天）'),
  );

  // X-axis age band labels
  for (const [idx, col] of AGE_BAND_COLUMNS.entries()) {
    const cx = left + laneW * (idx + 0.5);
    graph.append(
      drawing('text', { x: cx, y: bottom + 17, 'text-anchor': 'middle', class: 'mi-scatter-xlabel' }, col.label),
      drawing('text', { x: cx, y: bottom + 31, 'text-anchor': 'middle', class: 'mi-scatter-xsub' }, col.sub),
    );
  }

  let pinned = null;
  function showTip(entry) {
    const { item, x, y } = entry;
    tooltip.textContent = `${item.name} · ${elapsedLabel(item)}`;
    const pctX = Math.max(18, Math.min(82, (x / width) * 100));
    const pctY = (y / height) * 100;
    tooltip.style.left = `${pctX}%`;
    tooltip.style.top = `${pctY}%`;
    tooltip.hidden = false;
  }
  function hideTip(force = false) {
    if (force) pinned = null;
    if (pinned) showTip(pinned);
    else tooltip.hidden = true;
  }

  // Render normal points first, then red outlier points on top
  const ordered = [
    ...positioned.filter(p => !p.item.is_outlier),
    ...positioned.filter(p => p.item.is_outlier),
  ];

  for (const entry of ordered) {
    const { item, x, y } = entry;
    const isOutlier = Boolean(item.is_outlier);
    const label = isOutlier
      ? `${item.name}，距記錄起點 ${elapsedLabel(item)}，點按查看牠的故事`
      : `${item.name}，距記錄起點 ${elapsedLabel(item)}`;

    const mark = drawing('g', {
      class: `mi-scatter-dot${isOutlier ? ' is-outlier' : ''}`,
      transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`,
      role: 'button',
      tabindex: '0',
      'aria-label': label,
      'data-outlier': String(isOutlier),
      'data-wait-days': String(item.wait_days),
    });

    // Generous hit area
    mark.append(drawing('circle', { r: isOutlier ? 15 : 11, fill: 'transparent' }));

    if (isOutlier) {
      mark.append(
        drawing('circle', { r: 12.5, fill: 'rgba(201, 59, 43, 0.16)', class: 'mi-dot-halo' }),
        drawing('circle', {
          r: 7.6,
          fill: '#c93b2b',
          stroke: '#fffdf8',
          'stroke-width': 2.1,
          class: 'mi-dot-core',
        }),
      );
    } else {
      mark.append(
        drawing('circle', {
          r: 4.5,
          fill: '#b67855',
          'fill-opacity': 0.78,
          stroke: '#fffdf8',
          'stroke-width': 1.2,
          class: 'mi-dot-core',
        }),
      );
    }

    mark.addEventListener('pointerenter', () => showTip(entry));
    mark.addEventListener('focus', () => showTip(entry));
    mark.addEventListener('pointerleave', () => hideTip(false));
    mark.addEventListener('blur', () => hideTip(false));

    const activate = event => {
      event?.stopPropagation?.();
      if (isOutlier) {
        hideTip(true);
        openStorySheet(item, openProfile, api);
      } else {
        pinned = pinned === entry ? null : entry;
        hideTip();
      }
    };
    mark.addEventListener('click', activate);
    mark.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      activate(event);
    });

    graph.append(mark);
  }

  graph.addEventListener('click', () => hideTip(true));
  wrap.append(graph, tooltip);
  block.append(wrap);

  const missingDate = waiting.missing_start ?? 0;
  const missingAge = waiting.missing_age ?? 0;
  block.append(node('p', 'mi-note', `本次可比較 ${format(points.length)} 則。另有 ${format(missingDate)} 則缺起算時間，${format(missingAge)} 則有起算時間但缺單一年齡組別。每點計至該檔案的快照日，僅記月份的個案按天數範圍中點排序。`));
  return block;
}

const flowColumns = new Map([[0,0],[1,1],[2,2],['0',0],['1',1],['2',2],['start',0],['breed',1],['end',2]]);

function flowShortLabel(label) {
  const map = {
    '官網列為待領養': '待領養',
    '可申請領養或暫養': '領養/暫養',
    '申請中／試領養': '試領養',
    '官網列為已領養': '已領養',
    '官網標註混種': '混種',
    '官網明示純種': '純種',
    '官網未明示品種類別': '未標品種',
  };
  return map[label] || label;
}

function flowColor(breed) {
  if (breed === 'mixed' || breed === 'crossbreed') return '#bf5939';
  if (['pure','purebred'].includes(breed)) return '#487d68';
  return '#947587';
}

function flowLayout(levels, links) {
  const top = 28;
  const gap = 20;
  const height = Math.max(196,top + Math.max(...levels.map(items => items.length)) * 34 + 34);
  const inner = height - top - 14;
  const widths = [10,12,10];
  const x = [8,166,326];
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
      item.tall = Math.max(8,rawSize);
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

function featuredCaseEntry(story, openProfile) {
  if (!story?.id) return null;
  const card = button('mi-case-entry', '', () => openProfile(story.id));
  card.setAttribute('aria-label', `查看已領養個案 ${story.name || '動物'} 的完整檔案`);
  const thumb = imageAsset(story.photo_url, story.name || '已領養動物');
  if (thumb) {
    thumb.className = 'mi-case-thumb';
    card.append(thumb);
  } else {
    card.append(node('span', 'mi-case-thumb', ''));
  }
  const copy = node('div', 'mi-case-copy');
  const events = (story.observations || []).filter(e => e.date && e.status_label);
  const timelineText = events.length >= 2
    ? `${events[0].date.slice(5)} 待領養 → ${events.at(-1).date.slice(5)} 已領養`
    : '已由兩次官網快照核對';
  copy.append(
    node('span', 'mi-case-badge', '已領養個案'),
    node('strong', '', story.name || '動物個案'),
    node('small', '', timelineText),
  );
  card.append(copy, node('span', 'mi-case-cta', '查看檔案'));
  return card;
}

function flowChart(flow, waiting, priorBreed, onBreed, openProfile) {
  const block = panel('生命流向','先看兩期快照結論，再點圖檢視細分路徑');
  const rawNodes = new Map((flow.nodes || []).filter(item => item.id && item.label && flowColumns.has(item.column)).map(item => [item.id,{...item,column:flowColumns.get(item.column)}]));
  const all = [];
  for (const link of flow.links || []) {
    const first = rawNodes.get(link.source), second = rawNodes.get(link.target);
    if (!first || !second || second.column-first.column !== 1 || !finite(link.value) || link.value <= 0) continue;
    const breedGroup = link.breed_group || (first.column === 1 ? first.breed_group : second.breed_group);
    all.push({...link,breedGroup});
  }

  const summary = node('div');
  block.append(summary);

  const caseEntry = featuredCaseEntry(waiting?.fallback_story, openProfile);
  if (caseEntry) block.append(caseEntry);

  const choices = [['','全部品種'],...(flow.breed_options || []).filter(item => item.id && item.label).map(item => [item.id,item.label])];
  let breed = choices.some(([id]) => id === priorBreed) ? priorBreed : '';
  const controls = node('div','mi-flow-controls');
  const chooser = select('mi-select','按品種篩選生命流向',choices,breed,value => { breed = value; onBreed(value); draw(); });
  chooser.id = 'mi-flow-breed';
  const label = node('label','','品種篩選');
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
    const visibleCount = links.filter(link => rawNodes.get(link.source).column === 0).reduce((sum,link) => sum + link.value,0);
    const laterCount = status => links.filter(link => link.target === 'last:' + status).reduce((total,edge) => total + edge.value,0);
    const trial = laterCount('trial');
    const sub = [flow.observed_range, trial ? `較新快照有 ${format(trial)} 則列為申請中／試領養` : ''].filter(Boolean);
    summary.replaceChildren(takeawayBanner('重點結論',
      `兩次快照可比對 ${format(visibleCount)} 則刊登，其中 ${format(laterCount('adopted'))} 則在較新快照列為已領養`, sub.join(' · ')));
    if (caseEntry) caseEntry.hidden = Boolean(breed);
    if (!links.length) {
      const gap = node('div','mi-callout');
      gap.append(node('h4','','這個篩選範圍暫無可比對的流向'),node('p','','圖表需要兩次觀察能連到同一則官網刊登。可切換品種或物種重新查看。'));
      output.append(gap);
      return;
    }
    const linkedIds = new Set(links.flatMap(link => [link.source,link.target]));
    const levels = [0,1,2].map(stage => [...rawNodes.values()].filter(item => item.column === stage && linkedIds.has(item.id)).map(item => ({...item})));
    const {height,items} = flowLayout(levels,links);
    const wrap = node('div','mi-plot mi-flow');
    const chart = drawing('svg',{viewBox:`0 0 344 ${height}`,role:'group','aria-label':'兩次刊登快照的可比對流向圖'});
    chart.append(drawing('text',{x:8,y:15,class:'mi-stage-label'},flow.start_label || '較早快照'),
      drawing('text',{x:172,y:15,class:'mi-stage-label','text-anchor':'middle'},'品種分組'),
      drawing('text',{x:336,y:15,class:'mi-stage-label','text-anchor':'end'},flow.end_label || '較新快照'));
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
      detail.textContent = item ? `${item.label}：${format(item.amount)} 則刊登` : `本圖顯示 ${format(visibleCount)} 則刊登，點選節點可查看相連路徑。`;
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
      const shortName = flowShortLabel(item.label);
      const labelX = item.column === 0 ? item.x + item.width + 5 : item.column === 1 ? item.x + item.width / 2 : item.x - 5;
      const anchor = item.column === 0 ? 'start' : item.column === 1 ? 'middle' : 'end';
      const labelY = item.column === 1 ? Math.max(26, y - 5) : item.y + item.size / 2 + 3.5;
      control.append(drawing('rect',{x:item.x-5,y:y-5,width:item.width+10,height:item.tall+10,fill:'transparent',rx:3}),
        drawing('rect',{x:item.x,y,width:item.width,height:item.tall,fill:item.column === 1 ? flowColor(item.breed_group) : '#8b7366',rx:2}),
        drawing('text',{x:labelX,y:labelY,'text-anchor':anchor},`${shortName} ${format(item.amount)}`));
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
    details.append(node('summary','','查看完整路徑計數表'),table);
    output.append(wrap,details);
    update();
  }
  draw();
  return block;
}

function guidePanel(data, waiting, flow, openProfile) {
  const block = panel('資料如何解讀','了解各圖表的口徑限制與空缺原因');
  const list = node('div', 'mi-guide-list');

  const waitCard = node('article', 'mi-guide-card');
  const plottedWaits = (waiting?.points || []).length;
  const missingDate = waiting?.missing_start ?? 0;
  const missingAge = waiting?.missing_age ?? 0;
  waitCard.append(
    node('h4', '', '「異常等待」如何比較不同動物？'),
    node('p', '', `這個篩選共有 ${format(plottedWaits + missingDate + missingAge)} 則待領養檔案。${format(plottedWaits)} 則同時有可核對的起算時間與年齡組別，可列入散點圖。另有 ${format(missingDate)} 則缺起算時間，${format(missingAge)} 則有起算時間但無法歸入單一年齡組別。`),
    node('p', '', '按每則檔案的快照日，計算自機構記錄的開放領養、入所或獲救起點經過的日數。只有月份的個案會顯示天數範圍，畫點和排名用範圍中點。紅點標示本次篩選中經過時間最長的個案。'),
  );
  list.append(waitCard);

  const flowCard = node('article', 'mi-guide-card');
  const included = finite(flow?.included_count) ? format(flow.included_count) : '—';
  const excluded = finite(flow?.excluded_count) ? format(flow.excluded_count) : '—';
  const range = flow?.observed_range || '兩次公開快照';
  flowCard.append(
    node('h4', '', '「生命流向」如何比對兩期快照？'),
    node('p', '', `以 ${range} 期間能對上同一官網刊登編號的 ${included} 則檔案作跨期對照；其餘 ${excluded} 則因僅出現於單一期快照或無法對應同一刊登而未納入流向圖。`),
  );
  list.append(flowCard);

  const mapCard = node('article', 'mi-guide-card');
  const plotted = data?.map_coverage?.plotted_listings ?? (data?.total - (data?.unknown_centre || 0) - (data?.centre_unavailable_count || 0));
  const unplotted = Math.max(0, (data?.total || 0) - (plotted || 0));
  mapCard.append(
    node('h4', '', '「中心地圖」涵蓋哪些檔案？'),
    node('p', '', `此範圍有 ${format(plotted)} 則檔案可對應到地圖上的中心。其餘 ${format(unplotted)} 則暫無可核實的中心位置，可在「探索」查看。`),
  );
  list.append(mapCard);

  block.append(list);

  const caseEntry = featuredCaseEntry(waiting?.fallback_story, openProfile);
  if (caseEntry) {
    block.append(node('p', 'mi-note', '可核對跨期狀態變化的代表個案：'), caseEntry);
  }
  return block;
}

function monthIndex(value) {
  const match = /^([0-9]{4})-(0[1-9]|1[0-2])$/.exec(value || '');
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
}

function trendChart(data, species, lastMonth, onMonth) {
  const block = panel('月度領養趨勢','香港拯救貓狗協會月報紀錄');
  const rows = (data.timeline || []).map(row => ({...row,index:monthIndex(row.period)})).filter(row => row.index !== null).sort((a,b) => a.index - b.index);
  const series = [{key:'cat',label:'貓',color:'#ab482c'},{key:'dog',label:'狗',color:'#3c7767'}].filter(item => !species || item.key === species);
  const values = rows.flatMap(row => series.map(item => row[item.key])).filter(finite);
  if (!values.length) {
    block.append(node('p','','這個物種暫無可顯示的月度資料。'));
    return block;
  }
  const latestRow = rows.at(-1);
  const rowSum = row => series.reduce((sum, item) => sum + (finite(row[item.key]) ? row[item.key] : 0), 0);
  const peakRow = rows.reduce((best, row) => rowSum(row) > rowSum(best) ? row : best, rows[0]);
  const latestParts = series.map(item => `${item.label} ${finite(latestRow[item.key]) ? format(latestRow[item.key]) : '—'}`).join('、');
  block.append(takeawayBanner(
    '重點結論',
    `最新月報 ${latestRow.period} 錄得 ${latestParts} 隻獲領養`,
    `期內高峰為 ${peakRow.period}（共 ${format(rowSum(peakRow))} 隻）`,
  ));
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

function listingSample(root, scope, openProfile, api, filters) {
  const heading = node('h4', '', scope ? `${scope} · 待領養` : '待領養動物');
  heading.tabIndex = -1;
  const list = node('div', 'mi-sample-list');
  const note = node('p', 'mi-note');
  note.setAttribute('role', 'status');
  const more = button('mi-filter', '顯示更多檔案', load);
  let page = 0;
  root.replaceChildren(heading, list, note, more);
  async function load() {
    more.disabled = true;
    more.hidden = !page;
    note.textContent = '正在讀取檔案…';
    try {
      const result = await api.get('/api/listings', {...filters, page:page + 1, page_size:12});
      if (!root.contains(list) || !root.isConnected) return;
      let firstNewRow;
      for (const item of result.items) {
        const row = button('mi-profile', '', () => openProfile(item.id));
        const copy = node('div');
        const speciesTag = item.species === 'cat' ? '貓' : item.species === 'dog' ? '狗' : '';
        copy.append(node('strong', '', item.name || '未命名'), node('small', '', [speciesTag, item.age_label].filter(Boolean).join(' · ')));
        const arrow = node('span', '', '›');
        arrow.setAttribute('aria-hidden', 'true');
        row.append(copy, arrow);
        list.append(row);
        firstNewRow ??= row;
      }
      if (page && firstNewRow) firstNewRow.focus();
      page++;
      note.textContent = result.total ? `已顯示 ${format(list.childElementCount)} / ${format(result.total)} 則檔案` : '這個篩選暫無符合的檔案。';
      more.textContent = '顯示更多檔案';
      more.hidden = !result.items.length || list.childElementCount >= result.total;
    } catch {
      if (!root.contains(list) || !root.isConnected) return;
      note.textContent = '暫時未能讀取這一頁檔案。';
      more.textContent = '重新載入檔案';
      more.hidden = false;
    } finally {
      more.disabled = false;
    }
  }
  load();
}

export function mountInsights(root, {api, openProfile}) {
  const sheet = node('style'); sheet.textContent = styles;
  const screen = node('section','mobile-insights');
  const header = node('header','mi-header');
  const headerRow = node('div','mi-header-row');
  const snapshotMeta = node('span','mi-snapshot-meta','');
  headerRow.append(node('h2','','領養數據'),snapshotMeta);
  header.append(headerRow);
  const tabs = node('nav','mi-tabs'); tabs.setAttribute('aria-label','數據圖表');
  const controls = node('div','mi-controls');
  const filters = node('div','mi-filters'); filters.setAttribute('aria-label','按物種篩選');
  const orgSpace = node('div','mi-org');
  const content = node('div','mi-content');
  controls.append(filters,orgSpace);
  screen.append(header,tabs,controls,content);
  root.replaceChildren(sheet,screen);

  let current = 'map', species = '', organisation = '', centre = '', age = '', month = '', breed = '', request = 0, data, research, activeMapCleanup = null;
  const options = new Map();
  const speciesButtons = new Map();
  const researchTabs = new Set(['outliers','flow','guide']);
  function showTab(id) {
    if (current === id) return;
    const previous = current;
    current = id;
    updateButtons();
    if (organisation && (previous === 'trend' || id === 'trend')) refresh();
    else if (data) draw();
  }
  for (const [id,label,short] of [['map','中心地圖','地圖'],['outliers','異常等待','等待'],['age','年齡分布','年齡'],['trend','領養趨勢','趨勢'],['flow','生命流向','流向'],['guide','資料解讀','解讀']]) {
    const tab = button('mi-tab',short,() => showTab(id));
    tab.setAttribute('aria-label', label);
    tab.title = label;
    tab.setAttribute('aria-pressed',String(current === id));
    options.set(id,tab);
    tabs.append(tab);
  }
  const speciesSvgs = {
    cat: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 3.4c-.5-.3-1.2.1-1.2.7v6.6C4 16 7.5 20 12 20s8-4 8-9.3V4.1c0-.6-.7-1-1.2-.7L15.1 6a9.6 9.6 0 0 0-6.2 0L5.2 3.4Z"/><circle cx="9.2" cy="12" r="1.25" fill="#fffdf9"/><circle cx="14.8" cy="12" r="1.25" fill="#fffdf9"/><path d="M12 14.8 10.7 13.5h2.6L12 14.8Z" fill="#fffdf9"/></svg>',
    dog: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.6 5.4c-1.8.8-3 3.2-2.7 6.3.2 1.7 1.3 2.5 2.4 2.1.4-.1.7-.4.9-.8.6 3.9 3 6.5 5.8 6.5s5.2-2.6 5.8-6.5c.2.4.5.7.9.8 1.1.4 2.2-.4 2.4-2.1.3-3.1-.9-5.5-2.7-6.3-1-.4-2.1-.1-2.8.6a8.6 8.6 0 0 0-7.2 0c-.7-.7-1.8-1-2.8-.6Z"/><circle cx="9.5" cy="11.2" r="1.2" fill="#fffdf9"/><circle cx="14.5" cy="11.2" r="1.2" fill="#fffdf9"/><ellipse cx="12" cy="14.3" rx="1.8" ry="1.25" fill="#fffdf9"/></svg>',
  };
  for (const [id,label] of [['','全部'],['cat','貓咪'],['dog','狗狗']]) {
    const filter = button('mi-filter',speciesSvgs[id] ? '' : label,() => {
      if (species === id) return;
      species = id;
      centre = ''; age = '';
      updateButtons();
      refresh();
    });
    if (speciesSvgs[id]) {
      filter.innerHTML = speciesSvgs[id];
      filter.setAttribute('aria-label', label);
      filter.title = label;
    }
    filter.setAttribute('aria-pressed',String(species === id));
    speciesButtons.set(id,filter);
    filters.append(filter);
  }

  function updateButtons() {
    orgSpace.hidden = current === 'trend';
    for (const [id,element] of options) element.setAttribute('aria-pressed',String(id === current));
    for (const [id,element] of speciesButtons) element.setAttribute('aria-pressed',String(id === species));
  }

  function stat(label, value) {
    const entry = node('div','mi-stat');
    entry.append(node('strong','',format(value)),node('span','',label));
    return entry;
  }

  function drawResearch() {
    const key = species + '/' + organisation;
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
    if (current === 'outliers') content.append(scatterChart(waiting, openProfile, api));
    if (current === 'flow') content.append(flowChart(flow,waiting,breed,value => { breed = value; },openProfile));
    if (current === 'guide') content.append(guidePanel(data,waiting,flow,openProfile));
  }

  function clearActiveMap() {
    if (activeMapCleanup) {
      activeMapCleanup();
      activeMapCleanup = null;
    }
  }

  function draw() {
    clearActiveMap();
    orgSpace.replaceChildren(select('mi-select','按機構篩選',
      [['','全部機構'],...(data.organisations || []).map(item => [item.id,item.name])],organisation,value => {
        organisation = value;
        centre = ''; age = '';
        refresh();
      }));
    content.replaceChildren();
    snapshotMeta.textContent = data.release_date ? `快照 ${data.release_date}` : '';
    if (researchTabs.has(current)) {
      drawResearch();
      return;
    }
    if (current === 'trend') {
      content.append(trendChart(data,species,month,value => { month = value; }));
      return;
    }
    const summary = node('div','mi-summary');
    summary.append(stat('待領養檔案',data.total),stat(current === 'map' ? '有中心位置的檔案' : '年齡未明或跨組',
      current === 'map' ? data.map_coverage?.plotted_listings ?? data.total - data.unknown_centre - data.centre_unavailable_count :
        data.ages?.find(item => item.key === 'unknown')?.count));
    content.append(summary);
    const sample = node('section','mi-samples');
    let map;
    const updateSample = () => {
      const selected = current === 'map' ? centre : age;
      if (current === 'map' && !selected) {
        sample.hidden = true;
        sample.replaceChildren();
        return;
      }
      const group = map?.shared.get(selected);
      const active = current === 'map' ? data.centres?.find(item => item.id === selected) : data.ages?.find(item => item.key === selected);
      if (current === 'map' && (group || !active?.count)) {
        sample.hidden = true;
        sample.replaceChildren();
        return;
      }
      sample.hidden = false;
      const filters = {species, organisation_id:organisation};
      if (selected) filters[current === 'map' ? 'centre_id' : 'age_key'] = selected;
      listingSample(sample, active?.short_name || active?.name || active?.label, openProfile, api, filters);
    };
    if (current === 'map') {
      const viewListings = () => {
        if (sample.hidden) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        sample.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        sample.querySelector('h4')?.focus({preventScroll:true});
      };
      map = centreMap(data,centre,id => { centre = centre === id ? '' : id; map.update(centre); updateSample(); },api,species,viewListings);
      activeMapCleanup = map.destroy;
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
    clearActiveMap();
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
  return {
    showMap() { showTab('map'); },
    destroy() { request++; clearActiveMap(); research = undefined; },
  };
}
