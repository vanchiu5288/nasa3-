import { useEffect, useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const basementAps = [
  {
    id: "b00", x: 65.2, y: 51.3,
    note: "新館空曠區域",
    csie_bssid: "30-87-D9-31-6B-29",
    csie_rssi: -59,
    csie_Rx_rate: 9.4,
    csie_Tx_rate: 11.6,
    bssid: "30-87-D9-71-6B-2C",
    rssi: -36,
    Rx_rate: 168.2,
    Tx_rate: 159.9
  },
  {
    id: "b02", x: 74.8, y: 69.3,
    note: "裏新館閱讀室",
    csie_bssid: "F8-E7-1E-26-45-39",
    csie_rssi: -37,
    csie_Rx_rate: 49.2,
    csie_Tx_rate: 38.2,
    bssid: "F8-E7-1E-66-45-3C",
    rssi: -37,
    Rx_rate: 220.7,
    Tx_rate: 188.4
  },
  {
    id: "b05", x: 30.6, y: 42.9,
    note: "研究室外走道",
    csie_bssid: "30-87-D9-31-7F-C9",
    csie_rssi: -35,
    csie_Rx_rate: 19.4,
    csie_Tx_rate: 4.2,
    bssid: "30-87-D9-71-7F-CC",
    rssi: -36,
    Rx_rate: 218.2,
    Tx_rate: 275.9
  },
  {
    id: "b04", x: 62.2, y: 73.7,
    note: "研究生休息區",
    csie_bssid: "34-8F-27-1E-7A-89",
    csie_rssi: -34,
    csie_Rx_rate: 47.5,
    csie_Tx_rate: 27.0,
    bssid: "34-8F-27-5E-7A-8C",
    rssi: -35,
    Rx_rate: 241.1,
    Tx_rate: 212.5
  },
  {
    id: "b09", x: 38.0, y: 63.0,
    note: "大三區內",
    csie_bssid: "30-87-D9-31-96-E9",
    csie_rssi: -34,
    csie_Rx_rate: 41.7,
    csie_Tx_rate: 24.3,
    bssid: "30-87-D9-71-96-EC",
    rssi: -57,
    Rx_rate: 150.3,
    Tx_rate: 176.4
  },
  {
    id: "b15", x: 53.5, y: 69.0,
    note: "舊館空曠區域",
    csie_bssid: "30-87-D9-31-96-49",
    csie_rssi: -52,
    csie_Rx_rate: 13.9,
    csie_Tx_rate: 60.0,
    bssid: "30-87-D9-71-96-4C",
    rssi: -39,
    Rx_rate: 194.4,
    Tx_rate: 194.4
  }
];

const firstFloorAps = [
  {
    id: "R101",
    x: 41.6, y: 62.8,
    note: "101教室",
    csie_bssid: "30-87-D9-31-55-49",
    csie_rssi: -31,
    csie_Rx_rate: 43.4,
    csie_Tx_rate: 41.7,
    bssid: "30-87-D9-71-55-4C",
    rssi: -34,
    Rx_rate: 250,
    Tx_rate: 241.3
  },
  { id: "R102",
    x: 68.7,
    y: 79.8,
    note: "102教室",
    csie_bssid: "30-87-D9-31-79-E9",
    csie_rssi: -41,
    csie_Rx_rate: 40.1,
    csie_Tx_rate: 31.1,
    bssid: "30-87-D9-71-79-EC",
    rssi: -30,
    Rx_rate: 256.4,
    Tx_rate: 231.5
  },
  { id: "R103-front",
    x: 8.3,
    y: 69.2,
    note: "103教室前面",
    csie_bssid: "",
    csie_rssi: -1,
    csie_Rx_rate: -1,
    csie_Tx_rate: -1,
    bssid: "30-87-D9-71-98-CC",
    rssi: -40,
    Rx_rate: 172.2,
    Tx_rate: 159
  },
  { id: "R103-rear", x: 21.5, y: 73.0, note: "" },
  { id: "R104",
    x: 74.2,
    y: 66.0,
    note: "104教室",
    csie_bssid: "34-8F-27-1A-E4-C9",
    csie_rssi: -27,
    csie_Rx_rate: 24.4,
    csie_Tx_rate: 56.4,
    bssid: "34-8F-27-5A-E4-CC",
    rssi: -33,
    Rx_rate: 162.4,
    Tx_rate: 92.7
  },
  { id: "R105",
    x: 17.6,
    y: 44.8,
    note: "105教室",
    csie_bssid: "30-87-D9-31-6B-A9",
    csie_rssi: -29,
    csie_Rx_rate: 55.5,
    csie_Tx_rate: 31.8,
    bssid: "30-87-D9-31-6B-AC",
    rssi: -33,
    Rx_rate: 244.7,
    Tx_rate: 264.9
  },
  { id: "R106",
    x: 70.2,
    y: 46.8,
    note: "106教室",
    csie_bssid: "30-87-D9-31-52-49",
    csie_rssi: -60,
    csie_Rx_rate: 25.7,
    csie_Tx_rate: 27.2,
    bssid: "30-87-D9-71-99-4C",
    rssi: -62,
    Rx_rate: 141,
    Tx_rate: 157.7
  },
  { id: "R107",
    x: 17.8,
    y: 22.2,
    note: "107教室",
    csie_bssid: "30-87-D9-31-59-89",
    csie_rssi: -40,
    csie_Rx_rate: 49.7,
    csie_Tx_rate: 27.3,
    bssid: "30-87-D9-71-59-8C",
    rssi: -40,
    Rx_rate: 253.4,
    Tx_rate: 236.3
  },
  { id: "R108",
    x: 74.5,
    y: 27.7,
    note: ""
  },
  { id: "R110",
    x: 82.0,
    y: 39.3,
    note: "110教室",
    csie_bssid: "	30-87-D9-31-52-49",
    csie_rssi: -25,
    csie_Rx_rate: 68.4,
    csie_Tx_rate: 35.4,
    bssid: "30-87-D9-71-52-4C",
    rssi: -35,
    Rx_rate: 273.4,
    Tx_rate: 235.5
  },
  { id: "R111",
    x: 28.6,
    y: 29.2,
    note: "111教室",
    csie_bssid: "	30-87-D9-31-83-09",
    csie_rssi: -31,
    csie_Rx_rate: 37,
    csie_Tx_rate: 54.3,
    bssid: "30-87-D9-71-83-0C",
    rssi: -38,
    Rx_rate: 227.1,
    Tx_rate: 239.1
  }
];

const floors = {
  basement: {
    id: "basement",
    title: "系館地下室 AP 地圖",
    subtitle: "地下室 AP 點位示意圖",
    imageUrl: "/images/basement_page.png",
    width: 1684,
    height: 1191,
    aps: basementAps
  },
  floor1: {
    id: "floor1",
    title: "系館一樓 AP 地圖",
    subtitle: "一樓 AP 點位示意圖",
    imageUrl: "/images/floor1_page.png",
    width: 2048,
    height: 1448,
    aps: firstFloorAps
  }
};

function getSignalColor(rssi) {
  if (typeof rssi !== "number") return "#cbd5e1";
  if (rssi >= -50) return "#4ade80";
  if (rssi >= -60) return "#edf765f0";
  return "#f87171";
}

function createApIcon(ap, isActive) {
  const iconHtml = `
    <div class="marker ${isActive ? "active" : ""}" data-id="${ap.id}" title="${ap.id}${ap.note ? `｜${ap.note}` : ""}"></div>
    <div class="label">${ap.id}</div>
  `;

  return L.divIcon({
    className: "custom-ap-icon",
    html: iconHtml,
    iconSize: [0, 0]
  });
}

function FlyToSelected({ targetAp, width, height }) {
  const map = useMap();

  useEffect(() => {
    if (!targetAp) return;

    const pxX = (targetAp.x / 100) * width;
    const pxY = height - ((targetAp.y / 100) * height);

    map.flyTo([pxY, pxX], 0.5, { duration: 0.5 });
  }, [targetAp, width, height, map]);

  return null;
}

function HeatmapLayer({ points, width, height }) {
  const map = useMap();

  useEffect(() => {
    const paneName = "heatmap-pane";
    let pane = map.getPane(paneName);

    if (!pane) {
      pane = map.createPane(paneName);
      pane.style.zIndex = "350";
      pane.style.pointerEvents = "none";
    }

    const heatData = (points || [])
      .filter((p) => {
        return (
          typeof p.x === "number" &&
          typeof p.y === "number" &&
          typeof p.value === "number"
        );
      })
      .map((p) => {
        const pxX = (p.x / 100) * width;
        const pxY = height - ((p.y / 100) * height);
        return [pxY, pxX, p.value];
      });

    if (heatData.length === 0) {
      pane.style.clipPath = "";
      return;
    }

    function updateClip() {
      const topLeft = map.latLngToContainerPoint([height, 0]);
      const bottomRight = map.latLngToContainerPoint([0, width]);
      const size = map.getSize();

      const top = Math.max(0, topLeft.y);
      const left = Math.max(0, topLeft.x);
      const right = Math.max(0, size.x - bottomRight.x);
      const bottom = Math.max(0, size.y - bottomRight.y);

      pane.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    }

    const layer = L.heatLayer(heatData, {
      pane: paneName,
      radius: 60,
      blur: 40,
      minOpacity: 0.18,
      maxZoom: 2,
      max: 1.0,
      gradient: {
        0.05: "#1e3a8a",  // 深藍，很差
        0.20: "#2563eb",  // 藍，差
        0.40: "#22c55e",  // 綠，普通
        0.65: "#facc15",  // 黃，良好
        0.85: "#fb923c",  // 橘，很好
        1.00: "#ef4444",  // 紅，最強
      },
    });

    layer.addTo(map);
    updateClip();

    map.on("zoom move resize", updateClip);

    return () => {
      map.off("zoom move resize", updateClip);
      map.removeLayer(layer);
    };
  }, [points, width, height, map]);

  return null;
}

function CoordinateLogger({ width, height, activeFloor }) {
  useMapEvents({
    click(e) {
      const pxY = e.latlng.lat;
      const pxX = e.latlng.lng;

      const x = (pxX / width) * 100;
      const y = ((height - pxY) / height) * 100;

      console.log(
        `[${activeFloor}] x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`
      );
    },
  });

  return null;
}

function Sidebar({ aps, selectedId, onSidebarSelect, floorLabel }) {
  return (
    <aside className="sidebar">
      <h2>{floorLabel} AP 清單</h2>

      <div className="ap-list">
        {aps.map((ap) => {
          const hasMetrics = typeof ap.rssi === "number" || typeof ap.csie_rssi === "number";

          return (
            <div
              key={ap.id}
              className={`ap-item ${selectedId === ap.id ? "active" : ""}`}
              onClick={() => onSidebarSelect(ap.id)}
            >
              <div
                className="ap-name"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
              >
                <span>{ap.id}</span>
                <span style={{ fontSize: "12px", fontWeight: "normal", color: "#94a3b8" }}>
                  {ap.note || ""}
                </span>
              </div>

              {hasMetrics ? (
                <div
                  className="ap-stats"
                  style={{
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px dashed rgba(255,255,255,0.15)",
                    fontSize: "13px",
                    lineHeight: 1.6
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "45px 60px 1fr",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ color: "#dea34a", fontWeight: "bold", width: "40px" }}>csie</span>
                    <span style={{ color: getSignalColor(ap.csie_rssi), width: "70px" }}>
                      📶 {ap.csie_rssi}
                    </span>
                    <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                      Rx: {ap.csie_Rx_rate} / Tx: {ap.csie_Tx_rate}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "45px 60px 1fr",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ color: "#65a7f1", fontWeight: "bold", width: "40px" }}>5G</span>
                    <span style={{ color: getSignalColor(ap.rssi), width: "70px" }}>
                      📶 {ap.rssi}
                    </span>
                    <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                      Rx: {ap.Rx_rate} / Tx: {ap.Tx_rate}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="ap-empty">數值暫時留白</div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ApPopup({ ap }) {
  const hasMetrics = typeof ap.rssi === "number" || typeof ap.csie_rssi === "number";

  if (!hasMetrics) {
    return (
      <div style={{ minWidth: "180px", fontFamily: "sans-serif" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            borderBottom: "1px solid #ddd",
            paddingBottom: "6px",
            fontSize: "16px"
          }}
        >
          {ap.id}
        </h3>

        <div style={{ fontSize: "13px", color: "#e5e7eb" }}>
          AP 資料預留中
        </div>
      </div>
    );
  }

  return (
    <div style={{ minWidth: "220px", fontFamily: "sans-serif" }}>
      <h3
        style={{
          margin: "0 0 8px 0",
          borderBottom: "1px solid #ddd",
          paddingBottom: "6px",
          fontSize: "16px"
        }}
      >
        {ap.id}{" "}
        <span
          style={{
            fontSize: "12px",
            color: "#e1e1e1",
            fontWeight: "normal"
          }}
        >
          {ap.note}
        </span>
      </h3>

      <div style={{ marginBottom: "10px" }}>
        <strong style={{ color: "#fe9d0d", fontSize: "16px" }}>📡 csie</strong>
        <br />
        <span
          style={{
            fontSize: "11px",
            color: "#e1e1e1",
            fontFamily: "monospace"
          }}
        >
          {ap.csie_bssid}
        </span>
        <br />
        <span style={{ fontSize: "13px" }}>
          📶 RSSI: <b>{ap.csie_rssi}</b> dBm
        </span>
        <br />
        <span style={{ fontSize: "12px", color: "#e1e1e1" }}>
          ⬇️ Rx: {ap.csie_Rx_rate} | ⬆️ Tx: {ap.csie_Tx_rate} Mbps
        </span>
      </div>

      <div>
        <strong style={{ color: "#355ee2", fontSize: "16px" }}>📡 csie-5G</strong>
        <br />
        <span
          style={{
            fontSize: "11px",
            color: "#e1e1e1",
            fontFamily: "monospace"
          }}
        >
          {ap.bssid}
        </span>
        <br />
        <span style={{ fontSize: "13px" }}>
          📶 RSSI: <b>{ap.rssi}</b> dBm
        </span>
        <br />
        <span style={{ fontSize: "12px", color: "#e1e1e1" }}>
          ⬇️ Rx: {ap.Rx_rate} | ⬆️ Tx: {ap.Tx_rate} Mbps
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFloor, setActiveFloor] = useState("basement");
  const [selectedId, setSelectedId] = useState(null);
  const [flyToId, setFlyToId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const [heatmapSsid, setHeatmapSsid] = useState("csie-5G");

  const [heatPoints, setHeatPoints] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);

  const floor = floors[activeFloor];
  const bounds = [[0, 0], [floor.height, floor.width]];

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        setHeatmapLoading(true);
        setHeatmapError(null);

        const params = new URLSearchParams({
          floor: activeFloor,
          ssid: heatmapSsid,
        });

        const res = await fetch(`${API_BASE_URL}/api/heatmap/?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setHeatPoints(json.data || []);
      } catch (err) {
        console.error("Failed to fetch heatmap:", err);
        setHeatmapError("無法載入熱力圖資料");
        setHeatPoints([]);
      } finally {
        setHeatmapLoading(false);
      }
    }

    fetchHeatmap();
  }, [activeFloor, heatmapSsid]);

  const flyToAp = useMemo(
    () => floor.aps.find((ap) => ap.id === flyToId) ?? null,
    [floor, flyToId]
  );

  function handleSidebarSelect(apId) {
    if (mapInstance) {
      mapInstance.closePopup();
    }

    setSelectedId(apId);
    setFlyToId(apId);
  }

  function handleSwitchFloor(nextFloor) {
    if (mapInstance) {
      mapInstance.closePopup();
    }

    setActiveFloor(nextFloor);
    setSelectedId(null);
    setFlyToId(null);
  }

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
          <div className="header-top">
            <div>
              <h1>{floor.title}</h1>
              <p>{floor.subtitle}</p>
            </div>

            <div className="floor-switch">
              <button
                className={activeFloor === "basement" ? "active" : ""}
                onClick={() => handleSwitchFloor("basement")}
                type="button"
              >
                地下室
              </button>

              <button
                className={activeFloor === "floor1" ? "active" : ""}
                onClick={() => handleSwitchFloor("floor1")}
                type="button"
              >
                一樓
              </button>
            </div>
            <div className="heatmap-switch">
              <button
                className={heatmapSsid === "csie" ? "active" : ""}
                onClick={() => setHeatmapSsid("csie")}
                type="button"
              >
                csie 熱力圖
              </button>

              <button
                className={heatmapSsid === "csie-5G" ? "active" : ""}
                onClick={() => setHeatmapSsid("csie-5G")}
                type="button"
              >
                csie-5G 熱力圖
              </button>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="map-area">
            <div className="map-box">
              <MapContainer
                key={floor.id}
                crs={L.CRS.Simple}
                bounds={bounds}
                minZoom={-2}
                maxZoom={2}
                zoomControl={true}
                style={{ width: "100%", height: "100%" }}
                whenCreated={setMapInstance}
              >
                <ImageOverlay url={floor.imageUrl} bounds={bounds} />

                <CoordinateLogger
                  width={floor.width}
                  height={floor.height}
                  activeFloor={activeFloor}
                />

                <HeatmapLayer
                  points={heatPoints}
                  width={floor.width}
                  height={floor.height}
                />

                <FlyToSelected targetAp={flyToAp} width={floor.width} height={floor.height} />

                {floor.aps.map((ap) => {
                  const pxX = (ap.x / 100) * floor.width;
                  const pxY = floor.height - ((ap.y / 100) * floor.height);

                  return (
                    <Marker
                      key={ap.id}
                      position={[pxY, pxX]}
                      icon={createApIcon(ap, selectedId === ap.id)}
                      eventHandlers={{
                        click: () => setSelectedId(ap.id)
                      }}
                    >
                      <Popup>
                        <ApPopup ap={ap} />
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {heatmapLoading && (
                <div className="map-status">熱力圖載入中...</div>
              )}

              {heatmapError && (
                <div className="map-status error">{heatmapError}</div>
              )}
            </div>
          </div>

          <Sidebar
            aps={floor.aps}
            selectedId={selectedId}
            onSidebarSelect={handleSidebarSelect}
            floorLabel={activeFloor === "basement" ? "地下室" : "一樓"}
          />
        </div>

        <div className="footer">
          目前支援地下室與一樓平面圖切換；熱力圖資料由 Django API 提供。
          <br />
          Last Updated: 2026.04.21
        </div>
      </div>
    </div>
  );
}