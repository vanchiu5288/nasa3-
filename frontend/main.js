const aps = [
  { id: "b00", x: 65.2, y: 51.3, note: "新館空曠區域" },
  { id: "b02", x: 74.8, y: 69.3, note: "裏新館閱讀室" },
  { id: "b05", x: 30.6, y: 42.9, note: "B05研究室外走道" },
  { id: "b04", x: 62.2, y: 73.7, note: "大三區內" },
  { id: "b15", x: 53.5, y: 69.0, note: "舊館空曠區域" }
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
  const item = document.createElement("div");
  item.className = "ap-item";
  item.dataset.id = ap.id;
  item.innerHTML = `
    <div class="ap-name">${ap.id}</div>
    <div class="ap-note">位置：${ap.note}<br>座標：${ap.x}%, ${ap.y}%</div>
  `;
  item.addEventListener("click", () => {
    setActive(ap.id);
    map.flyTo([pxY, pxX], 1, { duration: 0.5 });
  });
  apList.appendChild(item);
});

setActive("b00");