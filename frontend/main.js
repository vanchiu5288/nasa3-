const aps = [
  { id: "b00", x: 54.0, y: 37.0, note: "靠演講廳右側走道附近" },
  { id: "b02", x: 77.5, y: 28.5, note: "地下室右上區域" },
  { id: "b05", x: 33.5, y: 66.0, note: "地下室左下走道旁" },
  { id: "b151", x: 69.0, y: 57.5, note: "地下室右側中段入口附近" }
];

const mapBox = document.getElementById("mapBox");
const apList = document.getElementById("apList");

function setActive(id) {
  document.querySelectorAll(".marker").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  document.querySelectorAll(".ap-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === id);
  });
}

aps.forEach((ap) => {
  const marker = document.createElement("div");
  marker.className = "marker";
  marker.dataset.id = ap.id;
  marker.style.left = ap.x + "%";
  marker.style.top = ap.y + "%";
  marker.title = ap.id + "｜" + ap.note;
  marker.addEventListener("click", () => setActive(ap.id));
  mapBox.appendChild(marker);

  const label = document.createElement("div");
  label.className = "label";
  label.style.left = ap.x + "%";
  label.style.top = ap.y + "%";
  label.textContent = ap.id;
  mapBox.appendChild(label);

  const item = document.createElement("div");
  item.className = "ap-item";
  item.dataset.id = ap.id;
  item.innerHTML = `
    <div class="ap-name">${ap.id}</div>
    <div class="ap-note">位置：${ap.note}<br>座標：${ap.x}%, ${ap.y}%</div>
  `;
  item.addEventListener("click", () => {
    setActive(ap.id);
  });

  apList.appendChild(item);
});

setActive("b00");