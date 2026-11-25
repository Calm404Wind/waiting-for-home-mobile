const baseUrl = 'https://mapapi.hkmapservice.gov.hk/gs/api/v1.0.0/xyz';
const sourcePage = 'https://portal.csdi.gov.hk/csdi-webpage/apidoc/ImageryMapAPI';
const disclaimer = 'https://api.portal.hkmapservice.gov.hk/disclaimer';

// The official imagery example credits Lands Department and NASA/USGS
// on the map face. The CSDI source also identifies the Landsat and MODIS datasets.
const attribution = [
  `<a href="${disclaimer}" target="_blank" rel="noopener" title="地政總署版權及免責聲明">`,
  '<img src="/static/landsd-logo.jpg" alt="" width="19" height="19" style="vertical-align:middle"> © 香港地政總署</a>',
  ` · <a href="${sourcePage}" target="_blank" rel="noopener" title="航攝和衛星影像來源及使用條款">影像 © NASA/USGS</a>`,
].join('');

export function createAerialLayer(L) {
  const options = {
    maxZoom: 20,
    keepBuffer: 1,
    updateWhenIdle: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
  };
  const imagery = L.tileLayer(`${baseUrl}/imagery/WGS84/{z}/{x}/{y}.png`, { ...options, attribution });
  const labels = L.tileLayer(`${baseUrl}/label/hk/tc/WGS84/{z}/{x}/{y}.png`, { ...options, zIndex: 2 });
  return L.layerGroup([imagery, labels]);
}
