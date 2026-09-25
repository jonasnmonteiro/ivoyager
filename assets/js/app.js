const baseRatesToUsd = {
  USD: 1.0,
  BRL: 5.42,
  EUR: 0.859,
  ARS_BLUE: 1420.00,
  ARS_OFFICIAL: 980.00,
  CLP: 945.00,
  PYG: 7680.00,
  UYU: 41.50,
  GBP: 0.77,
  CAD: 1.38,
  USDT: 1.0
};

const currencyLabels = {
  USD: 'USD',
  BRL: 'BRL',
  EUR: 'EUR',
  ARS_BLUE: 'ARS Blue',
  ARS_OFFICIAL: 'ARS Official',
  CLP: 'CLP',
  PYG: 'PYG',
  UYU: 'UYU',
  GBP: 'GBP',
  CAD: 'CAD',
  USDT: 'USDT'
};

const methodConfigs = {
  global_account: { name: 'Global Account', iof: 0.011, spread: 0.015 },
  credit_card: { name: 'Traditional Card', iof: 0.0438, spread: 0.045 },
  cash: { name: 'Cash in Person', iof: 0.011, spread: 0.025 },
  crypto_p2p: { name: 'Crypto P2P', iof: 0.0, spread: 0.005 }
};

function getCrossRate(fromCode, toCode) {
  const fromUsd = baseRatesToUsd[fromCode] || 1.0;
  const toUsd = baseRatesToUsd[toCode] || 1.0;
  return toUsd / fromUsd;
}

function updateVetDefaultRate() {
  const home = document.getElementById('vet-home-currency').value;
  const target = document.getElementById('vet-target-currency').value;
  const rate = getCrossRate(home, target);
  document.getElementById('vet-exchange-rate').value = rate >= 1 ? rate.toFixed(2) : rate.toFixed(6);
  calculateVET();
}

function calculateVET() {
  const homeCurr = document.getElementById('vet-home-currency').value;
  const targetCurr = document.getElementById('vet-target-currency').value;
  const foreignAmount = parseFloat(document.getElementById('vet-foreign-amount').value) || 0;
  const rate = parseFloat(document.getElementById('vet-exchange-rate').value) || 1;
  const method = document.getElementById('vet-payment-method').value;
  const config = methodConfigs[method] || methodConfigs.global_account;

  const grossInHome = rate > 0 ? (foreignAmount / rate) : 0;
  const spreadAmount = grossInHome * config.spread;
  const subtotal = grossInHome + spreadAmount;
  const iofAmount = subtotal * config.iof;
  const totalInHome = subtotal + iofAmount;
  const effectiveVetRate = foreignAmount > 0 ? (totalInHome / foreignAmount) : (1 / rate);

  document.getElementById('res-gross').textContent = `${homeCurr} ${grossInHome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('res-spread').textContent = `${homeCurr} ${spreadAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('res-iof').textContent = `${homeCurr} ${iofAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('res-vet').textContent = `${homeCurr} ${effectiveVetRate.toFixed(6)} per ${currencyLabels[targetCurr]}`;
  document.getElementById('res-total').textContent = `${homeCurr} ${totalInHome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function convertUniversalCrossRate() {
  const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
  const from = document.getElementById('conv-from').value;
  const to = document.getElementById('conv-to').value;

  const rate = getCrossRate(from, to);
  const invRate = getCrossRate(to, from);
  const convertedTotal = amount * rate;

  let typeBadge = 'Commercial Rate';
  if (from.includes('BLUE') || to.includes('BLUE')) {
    typeBadge = 'Parallel Market (Blue)';
  } else if (from === 'USDT' || to === 'USDT') {
    typeBadge = 'Crypto P2P Stablecoin';
  }

  document.getElementById('conv-src').textContent = `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabels[from]}`;
  document.getElementById('conv-rate').textContent = `1 ${currencyLabels[from]} = ${rate >= 1 ? rate.toFixed(4) : rate.toFixed(6)} ${currencyLabels[to]}`;
  document.getElementById('conv-inv-rate').textContent = `1 ${currencyLabels[to]} = ${invRate >= 1 ? invRate.toFixed(4) : invRate.toFixed(6)} ${currencyLabels[from]}`;
  document.getElementById('conv-type').textContent = typeBadge;
  document.getElementById('conv-dest').textContent = `${convertedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabels[to]}`;
}

function swapCurrencies() {
  const fromSelect = document.getElementById('conv-from');
  const toSelect = document.getElementById('conv-to');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convertUniversalCrossRate();
}

const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerToggle = document.getElementById('hamburger-toggle');

if (hamburgerToggle && mobileMenu) {
  hamburgerToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    navButtons.forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`[data-tab="${targetTab}"]`).forEach(b => b.classList.add('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    const targetEl = document.getElementById(targetTab);
    if (targetEl) targetEl.classList.add('active');
    if (mobileMenu) mobileMenu.classList.remove('open');

    if (targetTab === 'tab-radar' && mapInstance) {
      setTimeout(() => { mapInstance.invalidateSize(); }, 200);
    }
  });
});

let cartItems = [];

function renderCart() {
  const tbody = document.getElementById('cart-items-body');
  if (!tbody) return;

  if (cartItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No items added yet. Add a product above to start calculating!</td></tr>';
    document.getElementById('cart-total-items').textContent = '0 items';
    document.getElementById('cart-gross-brl').textContent = 'R$ 0.00';
    document.getElementById('cart-tax-brl').textContent = 'R$ 0.00';
    document.getElementById('cart-final-brl').textContent = 'R$ 0.00';
    document.getElementById('split-per-person').textContent = 'R$ 0.00';
    return;
  }

  let totalGross = 0;
  let totalFinal = 0;
  let totalCount = 0;

  tbody.innerHTML = '';
  cartItems.forEach((item, index) => {
    totalGross += item.grossBrl;
    totalFinal += item.finalBrl;
    totalCount += item.quantity;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.name}</strong></td>
      <td class="mono-cell">${item.quantity}</td>
      <td class="mono-cell">${item.price.toFixed(2)} ${currencyLabels[item.currency]}</td>
      <td><span class="tag-badge">${methodConfigs[item.method].name}</span></td>
      <td class="mono-cell" style="color: var(--primary-dark);">R$ ${item.finalBrl.toFixed(2)}</td>
      <td><button class="btn btn-danger" onclick="deleteCartItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  const totalTax = totalFinal - totalGross;
  const people = parseInt(document.getElementById('split-people').value) || 1;
  const perPerson = totalFinal / people;

  document.getElementById('cart-total-items').textContent = totalCount + (totalCount === 1 ? ' item' : ' items');
  document.getElementById('cart-gross-brl').textContent = 'R$ ' + totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('cart-tax-brl').textContent = 'R$ ' + totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('cart-final-brl').textContent = 'R$ ' + totalFinal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('split-per-person').textContent = 'R$ ' + perPerson.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addCartItem() {
  const name = document.getElementById('item-name').value.trim() || 'Trip Purchase';
  const price = parseFloat(document.getElementById('item-price').value) || 0;
  const quantity = parseInt(document.getElementById('item-qty').value) || 1;
  const currency = document.getElementById('item-curr').value;
  const method = document.getElementById('item-method').value;

  if (price <= 0) {
    alert('Please enter a valid price for the item.');
    return;
  }

  const rateToBrl = getCrossRate(currency, 'BRL');
  const config = methodConfigs[method] || methodConfigs.global_account;
  const grossBrl = (price * quantity) * rateToBrl;
  const spreadBrl = grossBrl * config.spread;
  const subtotal = grossBrl + spreadBrl;
  const iofBrl = subtotal * config.iof;
  const finalBrl = subtotal + iofBrl;

  cartItems.push({
    id: Date.now().toString(),
    name,
    price,
    quantity,
    currency,
    method,
    grossBrl,
    finalBrl
  });

  document.getElementById('item-name').value = '';
  document.getElementById('item-price').value = '';
  document.getElementById('item-qty').value = '1';
  renderCart();
}

function deleteCartItem(index) {
  cartItems.splice(index, 1);
  renderCart();
}
window.deleteCartItem = deleteCartItem;

function clearCart() {
  cartItems = [];
  renderCart();
}

function exportCsv() {
  if (cartItems.length === 0) {
    alert('No items in the shopping cart to export.');
    return;
  }

  let csv = 'Product Name,Quantity,Original Price,Currency,Payment Method,Final BRL (with VET)\n';
  cartItems.forEach(item => {
    csv += `"${item.name}",${item.quantity},${item.price.toFixed(2)},${currencyLabels[item.currency]},"${methodConfigs[item.method].name}",${item.finalBrl.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ivoyager_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const addItemBtn = document.getElementById('add-item-btn');
if (addItemBtn) addItemBtn.addEventListener('click', addCartItem);

const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCsv);

const splitPeopleInput = document.getElementById('split-people');
if (splitPeopleInput) splitPeopleInput.addEventListener('input', renderCart);

let mapInstance = null;
let markersLayer = null;
let routePolyline = null;
let currentUserCoords = { lat: -31.4167, lon: -64.1833 };
let customPoiList = [];
let isPinDropperActive = false;

const savedPoisStorageKey = 'ivoyager_custom_pois';
function loadSavedPois() {
  try {
    const stored = localStorage.getItem(savedPoisStorageKey);
    if (stored) {
      customPoiList = JSON.parse(stored);
    }
  } catch {
    customPoiList = [];
  }
}

function saveCustomPoisLocally() {
  try {
    localStorage.setItem(savedPoisStorageKey, JSON.stringify(customPoiList));
  } catch {
  }
}

const cityHubs = {
  cordoba: {
    name: 'Cordoba (Plaza San Martin & Peatonal)',
    lat: -31.4167,
    lon: -64.1833,
    spots: [
      { name: 'Cambio Barujel Cordoba', type: 'Bureau de Change', lat: -31.4168, lon: -64.1825, address: 'San Jeronimo 281, Centro' },
      { name: 'Western Union Peatonal 9 de Julio', type: 'Western Union Agent', lat: -31.4145, lon: -64.1848, address: '9 de Julio 150, Centro' },
      { name: 'Exprinter Casa de Cambio', type: 'Bureau de Change', lat: -31.4158, lon: -64.1832, address: 'Rivadavia 45, Centro' },
      { name: 'Bancor Plaza San Martin ATM', type: 'Bank / ATM', lat: -31.4172, lon: -64.1840, address: 'San Jeronimo 166, Centro' }
    ]
  },
  buenos_aires: {
    name: 'Buenos Aires (Calle Florida)',
    lat: -34.6037,
    lon: -58.3816,
    spots: [
      { name: 'Western Union Florida', type: 'Western Union Agent', lat: -34.6025, lon: -58.3789, address: 'Florida 520, Microcentro' },
      { name: 'Cambio Alpe', type: 'Bureau de Change', lat: -34.6041, lon: -58.3762, address: 'Sarmiento 480, CABA' },
      { name: 'Banco Nacion ATM', type: 'Bank / ATM', lat: -34.6080, lon: -58.3702, address: 'Bartolome Mitre 326' },
      { name: 'Galerias Pacifico Exchange', type: 'Bureau de Change', lat: -34.5998, lon: -58.3745, address: 'Av. Cordoba 550' }
    ]
  },
  mendoza: {
    name: 'Mendoza (Av. San Martin)',
    lat: -32.8895,
    lon: -68.8458,
    spots: [
      { name: 'Cambio Santiago Mendoza', type: 'Bureau de Change', lat: -32.8902, lon: -68.8445, address: 'San Martin 1199, Mendoza' },
      { name: 'Western Union Peatonal Sarmiento', type: 'Western Union Agent', lat: -32.8888, lon: -68.8432, address: 'Sarmiento 55, Mendoza' },
      { name: 'Banco Macro ATM Mendoza', type: 'Bank / ATM', lat: -32.8910, lon: -68.8460, address: 'Av. San Martin 1280' }
    ]
  },
  bariloche: {
    name: 'Bariloche (Calle Mitre)',
    lat: -41.1335,
    lon: -71.3103,
    spots: [
      { name: 'Cambio Andino Bariloche', type: 'Bureau de Change', lat: -41.1340, lon: -71.3090, address: 'Mitre 102, Centro' },
      { name: 'Western Union Bariloche Centro', type: 'Western Union Agent', lat: -41.1328, lon: -71.3120, address: 'Villegas 222, Centro' },
      { name: 'Banco Patagonia ATM Mitre', type: 'Bank / ATM', lat: -41.1345, lon: -71.3080, address: 'Mitre 440, Bariloche' }
    ]
  },
  ciudad_del_este: {
    name: 'Ciudad del Este (Shopping China)',
    lat: -25.5097,
    lon: -54.6111,
    spots: [
      { name: 'Shopping China Casa de Cambio', type: 'Bureau de Change', lat: -25.5085, lon: -54.6120, address: 'Av. Luis Maria Argaña' },
      { name: 'Maxicambios Monalisa', type: 'Bureau de Change', lat: -25.5122, lon: -54.6095, address: 'Monalisa Mall Floor 1' },
      { name: 'Western Union Paraguay', type: 'Western Union Agent', lat: -25.5140, lon: -54.6140, address: 'Av. San Blas 102' }
    ]
  },
  santiago: {
    name: 'Santiago (Calle Agustinas)',
    lat: -33.4419,
    lon: -70.6505,
    spots: [
      { name: 'Cambios Brollano', type: 'Bureau de Change', lat: -33.4412, lon: -70.6515, address: 'Agustinas 1050, Centro' },
      { name: 'Afex Agustinas', type: 'Bureau de Change', lat: -33.4425, lon: -70.6495, address: 'Agustinas 1070, Centro' },
      { name: 'Western Union Santiago Centro', type: 'Western Union Agent', lat: -33.4405, lon: -70.6480, address: 'Huerfanos 835' }
    ]
  },
  montevideo: {
    name: 'Montevideo (Ciudad Vieja)',
    lat: -34.9065,
    lon: -56.2010,
    spots: [
      { name: 'Cambio Gales Ciudad Vieja', type: 'Bureau de Change', lat: -34.9072, lon: -56.2025, address: 'Peatonal Sarandi 430' },
      { name: 'Western Union 18 de Julio', type: 'Western Union Agent', lat: -34.9058, lon: -56.1985, address: 'Av. 18 de Julio 890' },
      { name: 'Cambio Aspen Plaza Independencia', type: 'Bureau de Change', lat: -34.9060, lon: -56.1998, address: 'Plaza Independencia 750' }
    ]
  },
  sao_paulo: {
    name: 'Sao Paulo (Av. Paulista)',
    lat: -23.5615,
    lon: -46.6560,
    spots: [
      { name: 'Confidence Cambio Paulista', type: 'Bureau de Change', lat: -23.5620, lon: -46.6545, address: 'Av. Paulista 1499' },
      { name: 'Western Union Conjunto Nacional', type: 'Western Union Agent', lat: -23.5585, lon: -46.6602, address: 'Av. Paulista 2073' },
      { name: 'Banco24Horas ATM Multi-Currency', type: 'Bank / ATM', lat: -23.5645, lon: -46.6520, address: 'Shopping Cidade Sao Paulo' }
    ]
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  loadSavedPois();
  const defaultHub = cityHubs.cordoba;
  mapInstance = L.map('map').setView([defaultHub.lat, defaultHub.lon], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  mapInstance.on('click', (e) => {
    if (isPinDropperActive) {
      document.getElementById('custom-poi-lat').value = e.latlng.lat.toFixed(6);
      document.getElementById('custom-poi-lon').value = e.latlng.lng.toFixed(6);
      document.getElementById('poi-creator-panel').classList.add('visible');
    }
  });

  updateRadarView('cordoba');
}

async function traceWalkingRoute(destLat, destLon, destName) {
  const origin = currentUserCoords;
  const osrmUrl = `https://router.project-osrm.org/route/v1/walking/${origin.lon},${origin.lat};${destLon},${destLat}?overview=full&geometries=geojson`;

  let routeCoords = [[origin.lat, origin.lon], [destLat, destLon]];
  let distanceMeters = Math.round(calculateDistance(origin.lat, origin.lon, destLat, destLon));
  let durationMinutes = Math.max(1, Math.round((distanceMeters / (4500 / 60))));

  try {
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const r = data.routes[0];
        distanceMeters = Math.round(r.distance);
        durationMinutes = Math.max(1, Math.round(r.duration / 60));
        routeCoords = r.geometry.coordinates.map(c => [c[1], c[0]]);
      }
    }
  } catch {
  }

  if (routePolyline && mapInstance) {
    mapInstance.removeLayer(routePolyline);
  }

  if (mapInstance) {
    routePolyline = L.polyline(routeCoords, {
      color: '#F7931E',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(mapInstance);

    mapInstance.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
  }

  const routePanel = document.getElementById('route-info-panel');
  if (routePanel) {
    routePanel.classList.add('visible');
    document.getElementById('route-destination-title').textContent = `Walking Route to: ${destName}`;
    document.getElementById('route-metric-distance').textContent = `Distance: ${distanceMeters < 1000 ? distanceMeters + ' m' : (distanceMeters / 1000).toFixed(2) + ' km'}`;
    document.getElementById('route-metric-duration').textContent = `Estimated: ~${durationMinutes} min walk`;

    const encodedName = encodeURIComponent(destName);
    document.getElementById('link-google-maps').href = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${destLat},${destLon}&travelmode=walking`;
    document.getElementById('link-apple-maps').href = `https://maps.apple.com/?saddr=${origin.lat},${origin.lon}&daddr=${destLat},${destLon}&dirflg=w&q=${encodedName}`;
    document.getElementById('link-waze').href = `https://waze.com/ul?ll=${destLat},${destLon}&navigate=yes`;
  }
}
window.traceWalkingRoute = traceWalkingRoute;

function clearRoute() {
  if (routePolyline && mapInstance) {
    mapInstance.removeLayer(routePolyline);
    routePolyline = null;
  }
  const routePanel = document.getElementById('route-info-panel');
  if (routePanel) routePanel.classList.remove('visible');
}

const clearRouteBtn = document.getElementById('clear-route-btn');
if (clearRouteBtn) clearRouteBtn.addEventListener('click', clearRoute);

function updateRadarView(cityKey, userLocation = null) {
  if (!markersLayer || !mapInstance) return;

  const hub = cityHubs[cityKey];
  markersLayer.clearLayers();
  clearRoute();

  const centerLat = userLocation ? userLocation.lat : (hub ? hub.lat : -31.4167);
  const centerLon = userLocation ? userLocation.lon : (hub ? hub.lon : -64.1833);
  currentUserCoords = { lat: centerLat, lon: centerLon };

  mapInstance.setView([centerLat, centerLon], 15);

  if (userLocation) {
    L.marker([centerLat, centerLon]).addTo(markersLayer)
      .bindPopup('<strong>Your Location (Origin)</strong>').openPopup();
  }

  let spots = hub ? [...hub.spots] : [
    { name: 'City Center Bureau de Change', type: 'Bureau de Change', lat: centerLat + 0.0015, lon: centerLon + 0.0012, address: 'Central Avenue' },
    { name: 'Western Union Agent', type: 'Western Union Agent', lat: centerLat - 0.0018, lon: centerLon - 0.0010, address: 'Main Plaza' },
    { name: 'International ATM Bank', type: 'Bank / ATM', lat: centerLat + 0.0022, lon: centerLon - 0.0015, address: 'Financial District' }
  ];

  customPoiList.forEach(poi => {
    spots.push({
      name: poi.name,
      type: `Custom (${poi.category})`,
      lat: poi.lat,
      lon: poi.lon,
      address: poi.notes || 'User Saved Pin',
      isCustom: true
    });
  });

  const spotsWithDistance = spots.map(spot => {
    const dist = calculateDistance(centerLat, centerLon, spot.lat, spot.lon);
    return { ...spot, distanceMeters: dist };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  const container = document.getElementById('radar-spots-container');
  if (!container) return;
  container.innerHTML = '';

  spotsWithDistance.forEach(spot => {
    const marker = L.marker([spot.lat, spot.lon]).addTo(markersLayer);
    const popupContent = `
      <div style="min-width: 180px;">
        <strong style="font-size: 13px; color: #0F172A;">${spot.name}</strong><br>
        <span style="font-size: 12px; color: #475569;">${spot.type}</span><br>
        <span style="font-size: 11px; color: #64748B;">${spot.address}</span><br>
        <div style="margin-top: 8px;">
          <button class="btn" style="padding: 4px 8px; font-size: 11px; width: 100%;" onclick="traceWalkingRoute(${spot.lat}, ${spot.lon}, '${spot.name.replace(/'/g, "\\'")}')">Trace Walking Route</button>
        </div>
      </div>
    `;
    marker.bindPopup(popupContent);

    const distText = spot.distanceMeters < 1000 
      ? `${Math.round(spot.distanceMeters)}m` 
      : `${(spot.distanceMeters / 1000).toFixed(2)}km`;

    const item = document.createElement('div');
    item.className = 'radar-item';
    item.innerHTML = `
      <div class="radar-info">
        <strong>${spot.name}</strong>
        <span>${spot.type} &bull; ${spot.address}</span>
      </div>
      <div class="radar-distance">${distText} away</div>
    `;
    item.addEventListener('click', () => {
      mapInstance.setView([spot.lat, spot.lon], 17);
      marker.openPopup();
    });
    container.appendChild(item);
  });
}

async function searchLocation() {
  const query = document.getElementById('map-search-input').value.trim();
  if (!query) {
    alert('Please enter a location or city name to search.');
    return;
  }

  const btn = document.getElementById('map-search-btn');
  btn.textContent = 'Searching...';

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      updateRadarView(null, { lat, lon });
    } else {
      alert('Location not found. Please try a different query (e.g. Cordoba, Bariloche, Mendoza).');
    }
  } catch {
    alert('Geocoding service error. Please try again.');
  } finally {
    btn.textContent = 'Search Location';
  }
}

const mapSearchBtn = document.getElementById('map-search-btn');
if (mapSearchBtn) mapSearchBtn.addEventListener('click', searchLocation);

const mapSearchInput = document.getElementById('map-search-input');
if (mapSearchInput) {
  mapSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchLocation();
  });
}

const radarCitySelect = document.getElementById('radar-city-select');
if (radarCitySelect) {
  radarCitySelect.addEventListener('change', (e) => {
    updateRadarView(e.target.value);
  });
}

const locateMeBtn = document.getElementById('locate-me-btn');
if (locateMeBtn) {
  locateMeBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          updateRadarView(null, userLoc);
        },
        () => {
          alert('Could not retrieve your GPS position. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  });
}

const togglePinDropBtn = document.getElementById('toggle-pin-drop-btn');
const poiCreatorPanel = document.getElementById('poi-creator-panel');

if (togglePinDropBtn && poiCreatorPanel) {
  togglePinDropBtn.addEventListener('click', () => {
    isPinDropperActive = !isPinDropperActive;
    if (isPinDropperActive) {
      togglePinDropBtn.textContent = 'Active: Click Map to Drop';
      togglePinDropBtn.style.backgroundColor = 'var(--primary)';
      togglePinDropBtn.style.color = '#FFFFFF';
      document.getElementById('custom-poi-lat').value = currentUserCoords.lat.toFixed(6);
      document.getElementById('custom-poi-lon').value = currentUserCoords.lon.toFixed(6);
      poiCreatorPanel.classList.add('visible');
    } else {
      togglePinDropBtn.textContent = '+ Drop Custom Pin';
      togglePinDropBtn.style.backgroundColor = 'transparent';
      togglePinDropBtn.style.color = 'var(--primary-dark)';
      poiCreatorPanel.classList.remove('visible');
    }
  });

  document.getElementById('cancel-poi-btn').addEventListener('click', () => {
    isPinDropperActive = false;
    togglePinDropBtn.textContent = '+ Drop Custom Pin';
    togglePinDropBtn.style.backgroundColor = 'transparent';
    togglePinDropBtn.style.color = 'var(--primary-dark)';
    poiCreatorPanel.classList.remove('visible');
  });

  document.getElementById('save-poi-btn').addEventListener('click', () => {
    const name = document.getElementById('custom-poi-name').value.trim();
    const category = document.getElementById('custom-poi-category').value;
    const lat = parseFloat(document.getElementById('custom-poi-lat').value);
    const lon = parseFloat(document.getElementById('custom-poi-lon').value);
    const notes = document.getElementById('custom-poi-notes').value.trim();

    if (!name || isNaN(lat) || isNaN(lon)) {
      alert('Please provide a name and valid coordinates for your custom pin.');
      return;
    }

    customPoiList.push({
      id: 'poi-' + Date.now(),
      name,
      category,
      lat,
      lon,
      notes,
      createdAt: Date.now()
    });

    saveCustomPoisLocally();

    document.getElementById('custom-poi-name').value = '';
    document.getElementById('custom-poi-notes').value = '';
    poiCreatorPanel.classList.remove('visible');
    isPinDropperActive = false;
    togglePinDropBtn.textContent = '+ Drop Custom Pin';
    togglePinDropBtn.style.backgroundColor = 'transparent';
    togglePinDropBtn.style.color = 'var(--primary-dark)';

    const selectEl = document.getElementById('radar-city-select');
    updateRadarView(selectEl ? selectEl.value : 'cordoba', currentUserCoords);
  });
}

const exportGeojsonBtn = document.getElementById('export-geojson-btn');
if (exportGeojsonBtn) {
  exportGeojsonBtn.addEventListener('click', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: customPoiList.map(poi => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [poi.lon, poi.lat]
        },
        properties: {
          id: poi.id,
          name: poi.name,
          category: poi.category,
          notes: poi.notes,
          createdAt: poi.createdAt
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivoyager_custom_spots_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

const vetHomeCurrency = document.getElementById('vet-home-currency');
if (vetHomeCurrency) vetHomeCurrency.addEventListener('change', updateVetDefaultRate);

const vetTargetCurrency = document.getElementById('vet-target-currency');
if (vetTargetCurrency) vetTargetCurrency.addEventListener('change', updateVetDefaultRate);

const vetPaymentMethod = document.getElementById('vet-payment-method');
if (vetPaymentMethod) vetPaymentMethod.addEventListener('change', calculateVET);

const vetForeignAmount = document.getElementById('vet-foreign-amount');
if (vetForeignAmount) vetForeignAmount.addEventListener('input', calculateVET);

const vetExchangeRate = document.getElementById('vet-exchange-rate');
if (vetExchangeRate) vetExchangeRate.addEventListener('input', calculateVET);

const vetCalcBtn = document.getElementById('vet-calc-btn');
if (vetCalcBtn) vetCalcBtn.addEventListener('click', calculateVET);

const convFrom = document.getElementById('conv-from');
if (convFrom) convFrom.addEventListener('change', convertUniversalCrossRate);

const convTo = document.getElementById('conv-to');
if (convTo) convTo.addEventListener('change', convertUniversalCrossRate);

const convAmount = document.getElementById('conv-amount');
if (convAmount) convAmount.addEventListener('input', convertUniversalCrossRate);

const convBtn = document.getElementById('conv-btn');
if (convBtn) convBtn.addEventListener('click', convertUniversalCrossRate);

const swapCurrenciesBtn = document.getElementById('swap-currencies-btn');
if (swapCurrenciesBtn) swapCurrenciesBtn.addEventListener('click', swapCurrencies);

function applyTickerUpdates(updates) {
  updates.forEach(item => {
    const pairKey = item.pair.replace('/', '-').replace(' ', '_');
    const rateText = item.rate >= 10 ? item.rate.toFixed(2) : item.rate.toFixed(4);
    const changeText = `${item.change24h >= 0 ? '+' : ''}${item.change24h.toFixed(2)}%`;
    const changeClass = `change ${item.direction === 'up' ? 'up' : item.direction === 'down' ? 'down' : ''}`;

    const rateEl = document.getElementById(`tick-${pairKey}-rate`);
    const changeEl = document.getElementById(`tick-${pairKey}-change`);
    if (rateEl) rateEl.textContent = rateText;
    if (changeEl) {
      changeEl.textContent = changeText;
      changeEl.className = changeClass;
    }

    const dupRateEl = document.getElementById(`tick-dup-${pairKey}-rate`);
    const dupChangeEl = document.getElementById(`tick-dup-${pairKey}-change`);
    if (dupRateEl) dupRateEl.textContent = rateText;
    if (dupChangeEl) {
      dupChangeEl.textContent = changeText;
      dupChangeEl.className = changeClass;
    }
  });
}

function initWebSocketTicker() {
  const aboutStatus = document.getElementById('about-ws-status');

  if (typeof io !== 'undefined') {
    try {
      const socket = io({
        path: '/socket.io/',
        timeout: 3000,
        reconnectionAttempts: 2
      });

      socket.on('connect', () => {
        if (aboutStatus) aboutStatus.textContent = 'Operational (ivoyager-ticker-ws connected)';
      });

      socket.on('ticker:snapshot', (snapshot) => {
        applyTickerUpdates(snapshot);
      });

      socket.on('ticker:update', (updates) => {
        applyTickerUpdates(updates);
      });

      socket.on('connect_error', () => {
        startSimulatedTicker();
      });
      return;
    } catch {
      startSimulatedTicker();
    }
  } else {
    startSimulatedTicker();
  }
}

function startSimulatedTicker() {
  const aboutStatus = document.getElementById('about-ws-status');
  if (aboutStatus) aboutStatus.textContent = 'Operational (Client Simulation Mode)';

  const simulatedState = {
    'USD/ARS_BLUE': { rate: 1420.0, change: 1.25 },
    'USDT/ARS_P2P': { rate: 1445.0, change: 0.85 },
    'USD/BRL': { rate: 5.4200, change: -0.32 },
    'EUR/BRL': { rate: 6.3100, change: 0.15 },
    'BRL/ARS': { rate: 261.99, change: 1.10 }
  };

  setInterval(() => {
    const updates = Object.entries(simulatedState).map(([pair, item]) => {
      const delta = (Math.random() - 0.49) * 0.002;
      const oldRate = item.rate;
      item.rate = Number((item.rate * (1 + delta)).toFixed(pair.includes('BRL') && !pair.includes('ARS') ? 4 : 2));
      item.change = Number((item.change + delta * 10).toFixed(2));
      const direction = item.rate > oldRate ? 'up' : item.rate < oldRate ? 'down' : 'neutral';
      return {
        pair,
        rate: item.rate,
        change24h: item.change,
        direction
      };
    });
    applyTickerUpdates(updates);
  }, 2500);
}

const wikivoyageGuides = {
  cordoba: {
    cityName: 'Cordoba',
    country: 'Argentina',
    summary: 'Argentinas second-largest city, known for its colonial Jesuit architecture, vibrant student population, and surrounding Sierras.',
    safetyTips: [
      'Keep valuables concealed in crowded peatonal walkways around 9 de Julio.',
      'Avoid desolate streets in the immediate vicinity of the Rio Suquia after dark.',
      'Use radio-taxis or registered remises at night.'
    ],
    localScams: [
      'Mustard or ketchup spill distraction scam in central plazas.',
      'Counterfeit 1000 and 2000 ARS banknotes given as change by informal vendors.'
    ],
    emergencyContacts: { Police: '911', Ambulance: '107 (SAME)', 'Tourist Police': '+54 351 434-2121' },
    sections: [
      { title: 'Understand', content: 'Founded in 1573, Cordoba is a major cultural and educational center. The historic Jesuit Block is a UNESCO World Heritage Site.' },
      { title: 'Get around', content: 'Public transit uses the RedBus contactless card, purchasable at kiosks. Taxis and remises are widely available.' },
      { title: 'See & Do', content: 'Visit Plaza San Martin, the historic Cathedral, Paseo del Buen Pastor in Nueva Cordoba, and the artisan fair in Guemes on weekends.' },
      { title: 'Eat & Drink', content: 'Traditional Argentine asado, empanadas cordobesas (with sweet raisins and sugar crust), and Fernet with Coca-Cola.' }
    ]
  },
  buenos_aires: {
    cityName: 'Buenos Aires',
    country: 'Argentina',
    summary: 'The cosmopolitan capital of Argentina, celebrated for European architecture, tango, world-class gastronomy, and vibrant cultural barrios.',
    safetyTips: [
      'Remain vigilant for motorcycle snatch-thieves (motochorros) in San Telmo, La Boca, and Retiro.',
      'Avoid wandering off the tourist Caminito strip in La Boca.',
      'Only hail official Radio Taxi cabs or use Uber / Cabify.'
    ],
    localScams: [
      'Mustard spray scam near Plaza de Mayo and Florida Street.',
      'Taxi switch trick returning counterfeit 1000 ARS notes.'
    ],
    emergencyContacts: { Police: '911', Ambulance: '107 (SAME)', 'Tourist Police': '+54 11 5030-9920' },
    sections: [
      { title: 'Understand', content: 'Known as the Paris of South America with 48 diverse barrios including San Telmo, Recoleta, and Palermo.' },
      { title: 'Get around', content: 'Extensive Subte underground metro and Colectivo buses using rechargeable SUBE card.' },
      { title: 'See & Do', content: 'Teatro Colon, Recoleta Cemetery, Palermo Soho, and San Telmo Sunday antique market.' },
      { title: 'Eat & Drink', content: 'Classic Parrillas (ojo de bife, bife de chorizo), medialunas, and Argentine Malbec.' }
    ]
  },
  mendoza: {
    cityName: 'Mendoza',
    country: 'Argentina',
    summary: 'Argentinas premier wine capital at the foot of the Andes, famous for Malbec vineyards, olive groves, and high-altitude mountaineering.',
    safetyTips: [
      'Keep backpacks secure along the central Av. San Martin commercial corridor.',
      'Exercise caution during late evening hours around Parque General San Martin.'
    ],
    localScams: [
      'Overcharging for wine tour packages at unlicensed kiosks near the bus terminal.'
    ],
    emergencyContacts: { Police: '911', Ambulance: '107', 'Tourist Police': '+54 261 413-2135' },
    sections: [
      { title: 'Understand', content: 'A desert oasis transformed by historical canal irrigation into a world wine capital.' },
      { title: 'Get around', content: 'Tranvia Urbano light rail and buses using SUBE card. Wine routes require tour remises or bicycles.' },
      { title: 'See & Do', content: 'Bodega winery tours in Lujan de Cuyo, Maipu, and Uco Valley; Aconcagua provincial park.' },
      { title: 'Eat & Drink', content: 'Chivo al asador (roast goat), empanadas mendocinas, and award-winning Malbec.' }
    ]
  },
  santiago: {
    cityName: 'Santiago',
    country: 'Chile',
    summary: 'The dynamic capital of Chile, nestled between the snow-capped Andes mountains and coastal mountain range.',
    safetyTips: [
      'Beware of pickpockets on the Metro during rush hour (Line 1).',
      'Avoid Plaza Baquedano/Italia during unscheduled street protests.',
      'Keep belongings close in Bellavista nightlife district late at night.'
    ],
    localScams: [
      'Rigged taxi meters and counterfeit 10,000 / 20,000 CLP bills returned as change.'
    ],
    emergencyContacts: { Police: '133 (Carabineros)', Ambulance: '131 (SAMU)', Fire: '132 (Bomberos)' },
    sections: [
      { title: 'Understand', content: 'Modern financial hub of the southern cone with historic civic centers.' },
      { title: 'Get around', content: 'Clean and modern Metro subway and Red Movilidad buses using Bip! card.' },
      { title: 'See & Do', content: 'Cerro San Cristobal, Sky Costanera observation deck, and historic Barrio Lastarria.' },
      { title: 'Eat & Drink', content: 'Pastel de choclo, fresh Pacific seafood (machas a la parmesana), and Pisco Sour.' }
    ]
  }
};

function renderWikivoyageGuide(cityKey) {
  const guide = wikivoyageGuides[cityKey] || wikivoyageGuides.cordoba;
  const summaryEl = document.getElementById('guide-city-summary');
  if (summaryEl) summaryEl.textContent = guide.summary;

  const safetyList = document.getElementById('guide-safety-list');
  if (safetyList) safetyList.innerHTML = guide.safetyTips.map(tip => `<li>${tip}</li>`).join('');

  const scamsList = document.getElementById('guide-scams-list');
  if (scamsList) scamsList.innerHTML = guide.localScams.map(scam => `<li>${scam}</li>`).join('');

  const contactsContainer = document.getElementById('guide-emergency-contacts');
  if (contactsContainer) {
    contactsContainer.innerHTML = Object.entries(guide.emergencyContacts).map(([name, num]) => `
      <div class="feature-item" style="padding: 6px 0;">
        <span>${name}:</span>
        <strong>${num}</strong>
      </div>
    `).join('');
  }

  const sectionsContainer = document.getElementById('guide-sections-container');
  if (sectionsContainer) {
    sectionsContainer.innerHTML = guide.sections.map(sec => `
      <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
        <strong style="font-size: 13px; color: var(--text-main); display: block; margin-bottom: 4px;">${sec.title}</strong>
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">${sec.content}</p>
      </div>
    `).join('');
  }
}

const guideCitySelect = document.getElementById('guide-city-select');
if (guideCitySelect) {
  guideCitySelect.addEventListener('change', (e) => {
    renderWikivoyageGuide(e.target.value);
  });
}

const signLexicon = [
  { category: 'traffic', spanish: 'Pare', portuguese: 'Pare (Parada Obrigatória)', english: 'Stop', explanation: 'Mandatory full vehicle stop at junction or intersection.' },
  { category: 'traffic', spanish: 'Ceda el paso', portuguese: 'Dê a preferência', english: 'Yield / Give Way', explanation: 'Slow down and yield right of way to crossing traffic.' },
  { category: 'traffic', spanish: 'Telepeaje', portuguese: 'Pedágio Automático (Sem Parar / Tag)', english: 'Electronic Toll Collection (RFID)', explanation: 'Automatic toll lane reserved for vehicles with active windshield tags.' },
  { category: 'traffic', spanish: 'Peaje', portuguese: 'Pedágio', english: 'Toll Booth', explanation: 'Highway toll payment plaza.' },
  { category: 'traffic', spanish: 'Calzada resbaladiza', portuguese: 'Pista escorregadia', english: 'Slippery Road Surface', explanation: 'Warning of reduced traction in rain, ice, or gravel.' },
  { category: 'traffic', spanish: 'Contramano', portuguese: 'Contramão (Sentido Proibido)', english: 'Wrong Way / No Entry', explanation: 'One-way street in the opposite direction. Do not enter.' },
  { category: 'traffic', spanish: 'Velocidad máxima', portuguese: 'Velocidade máxima', english: 'Speed Limit', explanation: 'Maximum legal speed in kilometers per hour (km/h).' },
  { category: 'traffic', spanish: 'Desvío', portuguese: 'Desvio', english: 'Detour', explanation: 'Temporary route redirection due to roadworks.' },
  { category: 'transit', spanish: 'Boletería', portuguese: 'Bilheteria', english: 'Ticket Office', explanation: 'Counter for purchasing transit, bus, or train tickets.' },
  { category: 'transit', spanish: 'Andén', portuguese: 'Plataforma / Cais', english: 'Platform', explanation: 'Train or intercity coach boarding platform.' },
  { category: 'transit', spanish: 'Subte', portuguese: 'Metrô subterrâneo', english: 'Subway / Metro', explanation: 'Buenos Aires underground rapid transit system.' },
  { category: 'transit', spanish: 'Colectivo', portuguese: 'Ônibus urbano', english: 'City Bus', explanation: 'Standard urban public transit bus.' },
  { category: 'transit', spanish: 'Terminal de Ómnibus', portuguese: 'Rodoviária', english: 'Bus Terminal', explanation: 'Long-distance intercity coach station.' },
  { category: 'transit', spanish: 'Migraciones', portuguese: 'Controle de Imigração', english: 'Immigration Control', explanation: 'Passport inspection checkpoint at borders.' },
  { category: 'transit', spanish: 'Aduana', portuguese: 'Alfândega', english: 'Customs', explanation: 'Tax and baggage declaration checkpoint.' },
  { category: 'dining', spanish: 'Cubierto', portuguese: 'Taxa de serviço / Couvert de mesa', english: 'Cover Charge (Table Fee)', explanation: 'Cover Charge / fixed per-person restaurant fee for bread, butter, and service (not a tip).' },
  { category: 'dining', spanish: 'Propina', portuguese: 'Gorjeta', english: 'Tip / Gratuity', explanation: 'Customary tip for waitstaff, generally 10% in Argentina and Chile.' },
  { category: 'dining', spanish: 'Bife de chorizo', portuguese: 'Contrafilé argentino', english: 'Sirloin / Strip Steak', explanation: 'Signature thick cut of tender Argentine beef.' },
  { category: 'dining', spanish: 'Agua sin gas', portuguese: 'Água sem gás', english: 'Still Water', explanation: 'Non-carbonated bottled mineral water.' },
  { category: 'dining', spanish: 'Agua con gas', portuguese: 'Água com gás', english: 'Sparkling Water', explanation: 'Carbonated bottled mineral water.' },
  { category: 'emergency', spanish: 'Policía Turística', portuguese: 'Polícia Turística', english: 'Tourist Police', explanation: 'Specialized police division assisting foreign visitors.' },
  { category: 'emergency', spanish: 'Farmacia de turno', portuguese: 'Farmácia de plantão 24h', english: 'On-Duty 24h Pharmacy', explanation: 'Designated rotating pharmacy open overnight.' },
  { category: 'emergency', spanish: 'Guardia', portuguese: 'Pronto-Socorro / Emergência médica', english: 'Emergency Room', explanation: 'Hospital emergency intake and trauma unit.' }
];

let currentSignCategory = 'all';

function renderSignTranslator() {
  const inputEl = document.getElementById('sign-search-input');
  const query = (inputEl ? inputEl.value : '').toLowerCase().trim();
  const container = document.getElementById('sign-results-container');
  if (!container) return;

  const filtered = signLexicon.filter(item => {
    const matchesCat = currentSignCategory === 'all' || item.category === currentSignCategory;
    if (!matchesCat) return false;
    if (!query) return true;
    return item.spanish.toLowerCase().includes(query) ||
           item.portuguese.toLowerCase().includes(query) ||
           item.english.toLowerCase().includes(query) ||
           item.explanation.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 16px;">No terms found matching your query.</p>';
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="sign-card">
      <div class="sign-header">
        <strong style="font-size: 14px; color: var(--text-main);">${item.spanish}</strong>
        <span class="guide-badge" style="background: rgba(247, 147, 30, 0.12); color: var(--primary);">${item.category}</span>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
        <strong>PT:</strong> ${item.portuguese} &bull; <strong>EN:</strong> ${item.english}
      </div>
      <p style="font-size: 11px; color: var(--text-subtle); line-height: 1.4;">${item.explanation}</p>
    </div>
  `).join('');
}

const signSearchInput = document.getElementById('sign-search-input');
if (signSearchInput) signSearchInput.addEventListener('input', renderSignTranslator);

const scanSignCameraBtn = document.getElementById('scan-sign-camera-btn');
const signCameraInput = document.getElementById('sign-camera-input');
const signOcrStatus = document.getElementById('sign-ocr-status');

if (scanSignCameraBtn && signCameraInput && signOcrStatus) {
  scanSignCameraBtn.addEventListener('click', () => {
    signCameraInput.click();
  });

  signCameraInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    signOcrStatus.style.display = 'block';
    signOcrStatus.textContent = 'Initializing on-device WASM OCR engine (Tesseract.js)...';

    try {
      if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract OCR engine is still loading. Please check internet connection.');
      }

      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round((m.progress || 0) * 100);
            signOcrStatus.textContent = `Scanning sign on-device (WASM): ${progress}%`;
          } else if (m.status) {
            signOcrStatus.textContent = `OCR Status: ${m.status}...`;
          }
        }
      });

      const rawText = (result && result.data && result.data.text) ? result.data.text.trim() : '';
      if (rawText) {
        const firstLine = rawText.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
        document.getElementById('sign-search-input').value = firstLine || rawText;
        signOcrStatus.textContent = `OCR Complete: Recognized "${firstLine || rawText}"`;
        renderSignTranslator();
        setTimeout(() => {
          signOcrStatus.style.display = 'none';
        }, 5000);
      } else {
        signOcrStatus.textContent = 'No text detected in image. Please try a clearer photo.';
      }
    } catch (err) {
      signOcrStatus.textContent = `OCR Error: ${err.message || 'Failed to process image'}`;
    }
  });
}

document.querySelectorAll('.guide-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.guide-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentSignCategory = pill.getAttribute('data-category');
    renderSignTranslator();
  });
});

const tollCorridorPresets = {
  ruta_9: { toll: 12000, distance: 700, currency: 'ARS' },
  ruta_7: { toll: 18500, distance: 1050, currency: 'ARS' },
  autovia_2: { toll: 8400, distance: 400, currency: 'ARS' },
  ruta_68_cl: { toll: 7200, distance: 120, currency: 'CLP' },
  custom: { toll: 0, distance: 700, currency: 'ARS' }
};

function updateCorridorPreset() {
  const corridor = document.getElementById('fuel-corridor').value;
  const customGroup = document.getElementById('custom-toll-group');
  if (corridor === 'custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
    const preset = tollCorridorPresets[corridor];
    if (preset) {
      document.getElementById('fuel-distance').value = preset.distance;
      document.getElementById('fuel-currency').value = preset.currency;
    }
  }
  calculateRouteMobility();
}

function calculateRouteMobility() {
  const distEl = document.getElementById('fuel-distance');
  const effEl = document.getElementById('fuel-efficiency');
  const priceEl = document.getElementById('fuel-price');
  const currEl = document.getElementById('fuel-currency');
  const corridorEl = document.getElementById('fuel-corridor');

  if (!distEl || !effEl || !priceEl || !currEl || !corridorEl) return;

  const dist = parseFloat(distEl.value) || 0;
  const eff = parseFloat(effEl.value) || 0;
  const price = parseFloat(priceEl.value) || 0;
  const curr = currEl.value;
  const corridor = corridorEl.value;

  let tollCost = 0;
  if (corridor === 'custom') {
    tollCost = parseFloat(document.getElementById('fuel-custom-toll').value) || 0;
  } else {
    tollCost = tollCorridorPresets[corridor]?.toll || 0;
  }

  const liters = (dist * eff) / 100;
  const fuelCost = liters * price;
  const totalLocal = fuelCost + tollCost;

  const rateToBrl = getCrossRate(curr, 'BRL');
  const totalBrl = totalLocal * rateToBrl;

  document.getElementById('fuel-res-liters').textContent = `${liters.toFixed(2)} Liters`;
  document.getElementById('fuel-res-fuel-cost').textContent = `${curr} ${fuelCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('fuel-res-toll-cost').textContent = `${curr} ${tollCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('fuel-res-total-local').textContent = `${curr} ${totalLocal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('fuel-res-total-brl').textContent = `R$ ${totalBrl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const fuelCorridor = document.getElementById('fuel-corridor');
if (fuelCorridor) fuelCorridor.addEventListener('change', updateCorridorPreset);

const calcFuelBtn = document.getElementById('calc-fuel-btn');
if (calcFuelBtn) calcFuelBtn.addEventListener('click', calculateRouteMobility);

const fuelDistance = document.getElementById('fuel-distance');
if (fuelDistance) fuelDistance.addEventListener('input', calculateRouteMobility);

const fuelEfficiency = document.getElementById('fuel-efficiency');
if (fuelEfficiency) fuelEfficiency.addEventListener('input', calculateRouteMobility);

const fuelPrice = document.getElementById('fuel-price');
if (fuelPrice) fuelPrice.addEventListener('input', calculateRouteMobility);

const fuelCurrency = document.getElementById('fuel-currency');
if (fuelCurrency) fuelCurrency.addEventListener('change', calculateRouteMobility);

const fuelCustomToll = document.getElementById('fuel-custom-toll');
if (fuelCustomToll) fuelCustomToll.addEventListener('input', calculateRouteMobility);

const airportHubData = {
  EZE: {
    name: 'Ministro Pistarini International Airport (Ezeiza)',
    city: 'Buenos Aires, Argentina',
    distance: '32 km southwest of Downtown Buenos Aires',
    options: [
      { mode: 'Manuel Tienda Leon Coach', duration: '45-60 min', fare: 'ARS 12,500 (~USD 10)', details: 'Official express direct coach to Retiro terminal / Puerto Madero. Clean, air-conditioned, departures every 30 min.' },
      { mode: 'Linea 8 Semirapido Bus', duration: '60-80 min', fare: 'ARS 950 (~USD 0.80)', details: 'Budget public transit bus direct to Plaza de Mayo and Congreso via highway. Requires SUBE card.' },
      { mode: 'Official Airport Radio Taxi / Remis', duration: '40-55 min', fare: 'ARS 35,000 - 45,000 (~USD 30-40)', details: 'Pre-paid ticket booth inside arrivals terminal (Remis Transfer Express, Taxi Ezeiza). Avoid unlicensed solicitations.' }
    ]
  },
  AEP: {
    name: 'Aeroparque Jorge Newbery',
    city: 'Buenos Aires, Argentina',
    distance: '4 km northeast of Palermo / Downtown Buenos Aires',
    options: [
      { mode: 'ArBus / City Bus (Linea 33, 37, 45, 160)', duration: '20-35 min', fare: 'ARS 450 (~USD 0.40)', details: 'Direct public bus connections to Palermo, Plaza Italia, Retiro, and Microcentro. Requires SUBE card.' },
      { mode: 'Official City Radio Taxi', duration: '15-25 min', fare: 'ARS 8,000 - 14,000 (~USD 7-12)', details: 'Official metered taxi rank outside Terminal A. Uber and Cabify pickup available at designated parking lane.' }
    ]
  },
  COR: {
    name: 'Ingeniero Ambrosio Taravella Airport (Pajas Blancas)',
    city: 'Cordoba, Argentina',
    distance: '10 km north of Cordoba City Center',
    options: [
      { mode: 'Aerobus Line 25', duration: '35-45 min', fare: 'ARS 1,800 (~USD 1.50)', details: 'Direct express public bus connecting Airport to Cordoba Bus Terminal (Terminal de Ómnibus) and Plaza San Martin. Requires RedBus card.' },
      { mode: 'Official Auto-Remis & Radio Taxi', duration: '20-30 min', fare: 'ARS 12,000 - 18,000 (~USD 10-15)', details: 'Official counters inside arrival concourse (Auto-Remis Cordoba). Metered and flat rates.' }
    ]
  },
  SCL: {
    name: 'Arturo Merino Benitez International Airport',
    city: 'Santiago, Chile',
    distance: '17 km northwest of Santiago Downtown',
    options: [
      { mode: 'Centropuerto & Turbus Airport Shuttle', duration: '30-45 min', fare: 'CLP 2,200 (~USD 2.40)', details: 'Frequent express coaches connecting airport to Metro stations Pajaritos and Los Heroes (Line 1). Every 10 min.' },
      { mode: 'Official Taxi Oficial / Taxi Basico', duration: '25-35 min', fare: 'CLP 22,000 - 28,000 (~USD 24-30)', details: 'Authorized reservation desks inside arrival baggage hall. Avoid informal drivers outside the terminal.' }
    ]
  }
};

function renderAirportHub(hubKey) {
  const hub = airportHubData[hubKey] || airportHubData.EZE;
  const distEl = document.getElementById('airport-distance');
  if (distEl) distEl.textContent = hub.distance;

  const container = document.getElementById('airport-transit-options');
  if (!container) return;
  container.innerHTML = hub.options.map(opt => `
    <div style="background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 13px; color: var(--text-main);">${opt.mode}</strong>
        <span class="guide-badge" style="background: rgba(5, 150, 105, 0.12); color: var(--success);">${opt.duration}</span>
      </div>
      <div style="font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 4px;">
        Est. Fare: ${opt.fare}
      </div>
      <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${opt.details}</p>
    </div>
  `).join('');
}

const airportHubSelect = document.getElementById('airport-hub-select');
if (airportHubSelect) {
  airportHubSelect.addEventListener('change', (e) => {
    renderAirportHub(e.target.value);
  });
}

renderWikivoyageGuide('cordoba');
renderSignTranslator();
calculateRouteMobility();
renderAirportHub('EZE');
updateVetDefaultRate();
convertUniversalCrossRate();
initMap();
initWebSocketTicker();
