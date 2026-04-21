import { useEffect, useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap} from "react-leaflet";
import L from "leaflet";

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
    x: 43.6, y: 59.2, 
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
  { id: "R102", x: 74.4, y: 79.2, note: "" },
  { id: "R103-front", x: 8.3, y: 69.2, note: "" },
  { id: "R103-rear", x: 21.5, y: 73.0, note: "" },
  { id: "R104", x: 74.2, y: 66.0, note: "" },
  { id: "R105", x: 17.6, y: 44.8, note: "" },
  { id: "R106", x: 70.2, y: 46.8, note: "" },
  { id: "R107", x: 17.8, y: 22.2, note: "" },
  { id: "R108", x: 74.5, y: 27.7, note: "" },
  { id: "R110", x: 82.0, y: 39.3, note: "" },
  { id: "R111", x: 28.6, y: 29.2, note: "" }
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

  const floor = floors[activeFloor];
  const bounds = [[0, 0], [floor.height, floor.width]];

  // const selectedAp = useMemo(
  //   () => floor.aps.find((ap) => ap.id === selectedId) ?? null,
  //   [floor, selectedId]
  // );

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
          目前支援地下室與一樓平面圖切換；一樓 AP 先以相同紅色點位標示，詳細數值可後續再補。
          <br />
          Last Updated: 2026.04.21
        </div>
      </div>
    </div>
  );
}