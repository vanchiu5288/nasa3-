const aps = [
  { id: "b00", x: 65.2, y: 51.3,
    note: "新館空曠區域",
    csie_bssid: "30‑87‑D9‑31‑6B‑29",
    csie_rssi: -59,
    csie_Rx_rate: 9.4,
    csie_Tx_rate: 11.6,
    bssid: "30‑87‑D9‑71‑6B‑2C",
    rssi: -36,
    Rx_rate:168.2,
    Tx_rate: 159.9
  },
  { id: "b02", x: 74.8, y: 69.3, 
    note: "裏新館閱讀室",
    csie_bssid: "F8‑E7‑1E‑26‑45‑39",
    csie_rssi: -37,
    csie_Rx_rate: 49.2,
    csie_Tx_rate: 38.2,
    bssid: "F8‑E7‑1E‑66‑45‑3C",
    rssi: -37,
    Rx_rate:220.7,
    Tx_rate: 188.4
  },
  { id: "b05", x: 30.6, y: 42.9, 
    note: "B05研究室外走道",
    csie_bssid: "30‑87‑D9‑31‑7F‑C9",
    csie_rssi: -35,
    csie_Rx_rate: 19.4,
    csie_Tx_rate: 4.2,
    bssid: "30‑87‑D9‑71‑7F‑CC",
    rssi: -36,
    Rx_rate: 218.2,
    Tx_rate: 275.9
  },
  { id: "b04", x: 62.2, y: 73.7, 
    note: "大三區內",
    csie_bssid: "34‑8F‑27‑1E‑7A‑89",
    csie_rssi: -34,
    csie_Rx_rate: 47.5,
    csie_Tx_rate: 27.0,
    bssid: "34‑8F‑27‑5E‑7A‑8C",
    rssi: -35,
    Rx_rate: 241.1,
    Tx_rate: 212.5
  },
  { id: "b15", x: 53.5, y: 69.0, 
    note: "舊館空曠區域",
    csie_bssid: "30‑87‑D9‑31‑96‑49",
    csie_rssi: -52,
    csie_Rx_rate: 13.9,
    csie_Tx_rate: 60.0,
    bssid: "30‑87‑D9‑71‑96‑4C",
    rssi: -39,
    Rx_rate: 194.4,
    Tx_rate: 194.4
  }
];

const apList = document.getElementById("apList");
const map = L.map('mapBox', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomControl: true
});

const w = 1684; 
const h = 1191;
const bounds = [[0, 0], [h, w]];

L.imageOverlay('images/basement_page.png', bounds).addTo(map);
map.fitBounds(bounds);

function setActive(id) {
  document.querySelectorAll(".marker").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  document.querySelectorAll(".ap-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });
}

aps.forEach((ap) => {
  const pxX = (ap.x / 100) * w;
  const pxY = h - ((ap.y / 100) * h);
  const iconHtml = `
    <div class="marker" data-id="${ap.id}" title="${ap.id}｜${ap.note}"></div>
    <div class="label">${ap.id}</div>
  `;

  const customIcon = L.divIcon({
      className: 'custom-ap-icon', // 外層容器的 class，預設為透明無樣式
      html: iconHtml,
      iconSize: [0, 0] // 設為 0x0，讓裡面的 .marker 自己用 CSS 置中
  });
  const marker = L.marker([pxY, pxX], { icon: customIcon }).addTo(map);
  marker.on('click', () => {
      setActive(ap.id);
  });
  const popupContent = `
    <div style="min-width: 220px; font-family: sans-serif;">
      <h3 style="margin: 0 0 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 6px; font-size: 16px;">
        ${ap.id} <span style="font-size: 12px; color: #e1e1e1; font-weight: normal;">${ap.note}</span>
      </h3>
      
      <div style="margin-bottom: 10px;">
        <strong style="color: #fe9d0d; font-size: 16px;">📡 csie</strong><br>
        <span style="font-size: 11px; color: #e1e1e1; font-family: monospace;">${ap.csie_bssid}</span><br>
        <span style="font-size: 13px;">📶 RSSI: <b>${ap.csie_rssi}</b> dBm</span><br>
        <span style="font-size: 12px; color: #e1e1e1;">⬇️ Rx: ${ap.csie_Rx_rate} | ⬆️ Tx: ${ap.csie_Tx_rate} Mbps</span>
      </div>

      <div>
        <strong style="color: #355ee2; font-size: 16px;">📡 csie-5G</strong><br>
        <span style="font-size: 11px; color: #e1e1e1; font-family: monospace;">${ap.bssid}</span><br>
        <span style="font-size: 13px;">📶 RSSI: <b>${ap.rssi}</b> dBm</span><br>
        <span style="font-size: 12px; color: #e1e1e1;">⬇️ Rx: ${ap.Rx_rate} | ⬆️ Tx: ${ap.Tx_rate} Mbps</span>
      </div>
    </div>
  `;
  marker.bindPopup(popupContent); 

  marker.on('click', () => {
      setActive(ap.id);
  });
  const item = document.createElement("div");
  item.className = "ap-item";
  item.dataset.id = ap.id;
  item.innerHTML = `
    <div class="ap-name" style="display: flex; justify-content: space-between; align-items: baseline;">
      <span>${ap.id}</span>
      <span style="font-size: 12px; font-weight: normal; color: #94a3b8;">${ap.note}</span>
    </div>
    
    <div class="ap-stats" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); font-size: 13px; line-height: 1.6;">
      <div style="display: grid; grid-template-columns: 45px 60px 1fr; align-items: center; gap: 8px;">
        <span style="color: #dea34a; font-weight: bold; width: 40px;">csie</span>
        <span style="color: ${ap.csie_rssi >= -50 ? '#4ade80' : ap.csie_rssi >= -60 ? '#edf765f0' : '#f87171'}; width: 70px;">📶 ${ap.csie_rssi}</span>
        <span style="color: #cbd5e1; font-size: 12px;">Rx: ${ap.csie_Rx_rate} / Tx: ${ap.csie_Tx_rate}</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 45px 60px 1fr; align-items: center; gap: 8px;">
        <span style="color: #65a7f1; font-weight: bold; width: 40px;">5G</span> 
        <span style="color: ${ap.rssi >= -50 ? '#4ade80' : ap.rssi >= -60 ? '#edf765f0' : '#f87171'}; width: 70px;">📶 ${ap.rssi}</span>
        <span style="color: #cbd5e1; font-size: 12px;">Rx: ${ap.Rx_rate} / Tx: ${ap.Tx_rate}</span>
      </div>
    </div>
  `;
  item.addEventListener("click", () => {
    setActive(ap.id);
    map.flyTo([pxY, pxX], 1, { duration: 0.5 });
    marker.openPopup();
  });
  apList.appendChild(item);
});

setActive("b00");