import { useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const aps = [
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
    note: "B05研究室外走道",
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
    note: "大三區內",
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

const w = 1684;
const h = 1191;
const bounds = [[0, 0], [h, w]];

function getSignalColor(rssi) {
  if (rssi >= -50) return "#4ade80";
  if (rssi >= -60) return "#edf765f0";
  return "#f87171";
}

function createApIcon(ap, isActive) {
  const iconHtml = `
    <div class="marker ${isActive ? "active" : ""}" data-id="${ap.id}" title="${ap.id}｜${ap.note}"></div>
    <div class="label">${ap.id}</div>
  `;

  return L.divIcon({
    className: "custom-ap-icon",
    html: iconHtml,
    iconSize: [0, 0]
  });
}

function FlyToSelected({ selectedAp }) {
  const map = useMap();

  if (!selectedAp) return null;

  const pxX = (selectedAp.x / 100) * w;
  const pxY = h - ((selectedAp.y / 100) * h);

  map.flyTo([pxY, pxX], 1, { duration: 0.5 });
  return null;
}

function Sidebar({ aps, selectedId, onSelect }) {
  return (
    <aside className="sidebar">
      <h2>AP 清單</h2>
      <div className="ap-list">
        {aps.map((ap) => (
          <div
            key={ap.id}
            className={`ap-item ${selectedId === ap.id ? "active" : ""}`}
            onClick={() => onSelect(ap.id)}
          >
            <div
              className="ap-name"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <span>{ap.id}</span>
              <span style={{ fontSize: "12px", fontWeight: "normal", color: "#94a3b8" }}>
                {ap.note}
              </span>
            </div>

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
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState("b00");

  const selectedAp = useMemo(
    () => aps.find((ap) => ap.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
          <h1>系館地下室 AP 地圖</h1>
          <p>地下室 AP 點位示意圖</p>
        </div>

        <div className="main">
          <div className="map-area">
            <div className="map-box">
              <MapContainer
                crs={L.CRS.Simple}
                bounds={bounds}
                minZoom={-2}
                maxZoom={2}
                zoomControl={true}
                style={{ width: "100%", height: "100%" }}
              >
                <ImageOverlay url="/images/basement_page.png" bounds={bounds} />
                <FlyToSelected selectedAp={selectedAp} />

                {aps.map((ap) => {
                  const pxX = (ap.x / 100) * w;
                  const pxY = h - ((ap.y / 100) * h);

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
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          <Sidebar aps={aps} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div className="footer">
          目前為 React + Leaflet 版本，適合單張平面圖加固定 AP 點位。
          <br />
          Last Updated: 2026.03.20
        </div>
      </div>
    </div>
  );
}
