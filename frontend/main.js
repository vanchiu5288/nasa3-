const aps = [
  { id: "b00", x: 54.0, y: 37.0, note: "靠演講廳右側走道附近" },
  { id: "b02", x: 77.5, y: 28.5, note: "地下室右上區域" },
  { id: "b05", x: 33.5, y: 66.0, note: "地下室左下走道旁" },
  { id: "b151", x: 69.0, y: 57.5, note: "地下室右側中段入口附近" }
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