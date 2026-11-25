import './vendor/leaflet/leaflet.js';
import { createAerialLayer } from './hk-aerial.js';

// Both basemaps and the centre pins use the same geographic coordinates.
export function createStreetMap(canvas, points, selected, makePin, onUnavailable, onNotice) {
  const L = window.L;
  const map = L.map(canvas, {
    center: [22.345, 114.155], zoom: 10, minZoom: 10, maxZoom: 19,
    maxBounds: [[21.99, 113.64], [22.72, 114.62]], maxBoundsViscosity: 0.9,
    zoomControl: false, zoomSnap: 0.25,
    attributionControl: true,
  });
  map.attributionControl.setPrefix(false);
  L.control.zoom({position: 'bottomright', zoomInTitle: '放大地圖', zoomOutTitle: '縮小地圖'}).addTo(map);
  const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
  });
  const aerial = createAerialLayer(L);
  const layers = L.control.layers({'街道': streets, '航拍': aerial}, {}, {collapsed: false}).addTo(map);
  layers.getContainer().setAttribute('aria-label', '選擇底圖');

  // Ignore occasional missing edge tiles. Fall back only when the active view
  // finishes loading without a single usable basemap tile.
  const imagery = aerial.getLayers ? aerial.getLayers()[0] : aerial;
  let disposed = false;
  const stage = canvas.parentElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'mi-fullscreen-dialog';
  dialog.setAttribute('aria-label', '全螢幕領養中心地圖');
  stage.append(dialog);
  const expand = L.control({position: 'topleft'});
  const expandButton = document.createElement('button');
  expandButton.type = 'button';
  expandButton.className = 'mi-map-expand';
  expandButton.textContent = '全螢幕';
  expand.onAdd = () => expandButton;
  expand.addTo(map);
  L.DomEvent.disableClickPropagation(expandButton);
  expandButton.addEventListener('click', () => {
    if (dialog.open) { dialog.close(); return; }
    dialog.append(canvas);
    expandButton.textContent = '退出全螢幕';
    dialog.showModal();
    map.invalidateSize();
    expandButton.focus({preventScroll: true});
  });
  dialog.addEventListener('close', () => {
    if (disposed) return;
    stage.prepend(canvas);
    expandButton.textContent = '全螢幕';
    map.invalidateSize();
  });
  function checkTiles(layer) {
    if (disposed || !map.hasLayer(layer) || !canvas.clientWidth) return;
    const tiles = [...(layer.getContainer()?.querySelectorAll('img.leaflet-tile') || [])];
    if (!tiles.length || tiles.some(tile => tile.naturalWidth > 0)) return;
    if (layer === streets) {
      onUnavailable();
    } else {
      map.removeLayer(aerial);
      streets.addTo(map);
      onNotice('航拍影像暫時無法載入，已切換至街道圖。');
    }
  }
  // Leaflet still touches the active map after firing 'load'. Finish that
  // callback before removing a failed layer or switching to the diagram.
  streets.on('load', () => queueMicrotask(() => checkTiles(streets)));
  imagery.on('load', () => queueMicrotask(() => checkTiles(imagery)));
  streets.addTo(map);

  const pins = points.map(point => {
    const {latitude, longitude} = point.entries[0];
    const pin = makePin(point);
    pin.addEventListener('click', () => { if (dialog.open) dialog.close(); }, {capture: true});
    L.DomEvent.disableClickPropagation(pin);
    const marker = L.marker([latitude, longitude], {
      icon: L.divIcon({html: pin, className: 'mi-street-marker', iconSize: [36, 36], iconAnchor: [18, 18]}),
      keyboard: false, riseOnHover: true, zIndexOffset: point.count || 0,
    }).addTo(map);
    return {point, marker, pin};
  });

  function updateSelection(id) {
    for (const {point, marker, pin} of pins) {
      const active = point.id === id || point.entries.some(entry => entry.id === id);
      pin.setAttribute('aria-pressed', String(active));
      marker.setZIndexOffset(active ? 2000 : point.count || 0);
    }
  }
  function focus(id) {
    const match = pins.find(({point}) => point.id === id || point.entries.some(entry => entry.id === id));
    if (match) map.setView(match.marker.getLatLng(), Math.max(map.getZoom(), 14), {animate: false});
  }
  function fit() {
    if (pins.length > 1) {
      map.fitBounds(L.latLngBounds(pins.map(({marker}) => marker.getLatLng())), {
        padding: [32, 48], maxZoom: 14, animate: false,
      });
    } else {
      map.setView(pins[0]?.marker.getLatLng() || [22.345, 114.155], pins.length ? 14 : 10, {animate: false});
    }
  }
  updateSelection(selected);
  if (selected) focus(selected);
  else fit();
  const resize = new ResizeObserver(() => {
    if (canvas.clientWidth && canvas.clientHeight) map.invalidateSize({pan: false});
  });
  resize.observe(canvas);
  return { updateSelection, focus, fit, destroy() {
    disposed = true;
    resize.disconnect();
    if (dialog.open) dialog.close();
    dialog.remove();
    map.remove();
  }};
}
