import { useEffect, useMemo, useState } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MeasurementModal from "../components/MeasurementModal";
import L from "leaflet";
import HeatmapLayer from "../components/HeatmapLayer";
import { floors } from "../data/floors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getSignalColor(rssi) {
  if (typeof rssi !== "number") return "#cbd5e1";
  if (rssi >= -50) return "#4ade80";
  if (rssi >= -60) return "#edf765f0";
  return "#f87171";
}

function createApIcon(ap, isActive) {
  const iconHtml = `
    <div class="marker ${isActive ? "active" : ""}" data-id="${ap.id}" title="${ap.id}${
    ap.note ? `｜${ap.note}` : ""
  }"></div>
    <div class="label">${ap.id}</div>
  `;

  return L.divIcon({
    className: "custom-ap-icon",
    html: iconHtml,
    iconSize: [0, 0],
  });
}

function FlyToSelected({ targetAp, width, height }) {
  const map = useMap();

  useEffect(() => {
    if (!targetAp) return;

    const pxX = (targetAp.x / 100) * width;
    const pxY = height - (targetAp.y / 100) * height;

    map.flyTo([pxY, pxX], 0.5, { duration: 0.5 });
  }, [targetAp, width, height, map]);

  return null;
}

function MapClickHandler({ width, height, activeFloor, onPointSelected }) {
  useMapEvents({
    click(e) {
      const pxY = e.latlng.lat;
      const pxX = e.latlng.lng;

      const x = (pxX / width) * 100;
      const y = ((height - pxY) / height) * 100;

      if (x < 0 || x > 100 || y < 0 || y > 100) {
        return;
      }

      onPointSelected({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        floor: activeFloor,
      });
    },
  });

  return null;
}

function Sidebar({ aps, selectedId, onSidebarSelect, floorLabel }) {
  return (
    <aside className="sidebar">
      <h2>{floorLabel} AP 清單</h2>

      <div className="ap-list">
        {aps.length === 0 ? (
          <div className="ap-empty-floor">這個樓層目前還沒有 AP 點位資料</div>
        ) : (
          aps.map((ap) => {
            const hasMetrics = typeof ap.rssi === "number" || typeof ap.csie_rssi === "number";

            return (
              <div
                key={`${ap.id}-${ap.x}-${ap.y}`}
                className={`ap-item ${selectedId === ap.id ? "active" : ""}`}
                onClick={() => onSidebarSelect(ap.id)}
              >
                <div
                  className="ap-name"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
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
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "45px 60px 1fr",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "#dea34a", fontWeight: "bold", width: "40px" }}>
                        csie
                      </span>
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
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "#65a7f1", fontWeight: "bold", width: "40px" }}>
                        5G
                      </span>
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
          })
        )}
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
            fontSize: "16px",
          }}
        >
          {ap.id}
        </h3>
        <div style={{ fontSize: "13px", color: "#e5e7eb" }}>AP 資料預留中</div>
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
          fontSize: "16px",
        }}
      >
        {ap.id}{" "}
        <span style={{ fontSize: "12px", color: "#e1e1e1", fontWeight: "normal" }}>
          {ap.note}
        </span>
      </h3>

      <div style={{ marginBottom: "10px" }}>
        <strong style={{ color: "#fe9d0d", fontSize: "16px" }}>📡 csie</strong>
        <br />
        <span style={{ fontSize: "11px", color: "#e1e1e1", fontFamily: "monospace" }}>
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
        <span style={{ fontSize: "11px", color: "#e1e1e1", fontFamily: "monospace" }}>
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

function getHealthLabel(status) {
  switch (status) {
    case "ok":
      return "系統正常";
    case "warning":
      return "系統警告";
    case "degraded":
      return "系統部分異常";
    case "down":
      return "系統無法連線";
    default:
      return "尚未檢查";
  }
}

export default function AutomaticHeatmap() {
  const [activeFloor, setActiveFloor] = useState("basement");
  const [selectedId, setSelectedId] = useState(null);
  const [flyToId, setFlyToId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const [heatmapSsid, setHeatmapSsid] = useState("csie-5G");
  const [heatPoints, setHeatPoints] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState(null);

  const floor = floors[activeFloor];
  const bounds = [
    [0, 0],
    [floor.height, floor.width],
  ];

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        setHeatmapLoading(true);
        setHeatmapError(null);

        const params = new URLSearchParams({
          floor: activeFloor,
          ssid: heatmapSsid,
          metric: "rssi",
        });

        const res = await fetch(`${API_BASE_URL}/api/heatmap/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
  }, [activeFloor, heatmapSsid, reloadKey]);

  const flyToAp = useMemo(
    () => floor.aps.find((ap) => ap.id === flyToId) ?? null,
    [floor, flyToId]
  );

  function handleSidebarSelect(apId) {
    if (mapInstance) mapInstance.closePopup();
    setSelectedId(apId);
    setFlyToId(apId);
  }

  function handleSwitchFloor(nextFloor) {
    if (mapInstance) mapInstance.closePopup();
    setActiveFloor(nextFloor);
    setSelectedId(null);
    setFlyToId(null);
    setSelectedPoint(null);
  }

  async function handleCheckSystemHealth() {
    try {
      setCheckingHealth(true);
      setHealthResult(null);

      const res = await fetch(`${API_BASE_URL}/api/monitoring/health/`);
      const json = await res.json();

      setHealthResult(json);

      if (json.status === "ok") {
        alert("系統正常");
        return;
      }

      const failedChecks = Object.entries(json.checks || {})
        .filter(([, value]) => value.status !== "ok")
        .map(([key, value]) => `${key}: ${value.status}${value.status_code ? ` (${value.status_code})` : ""}`)
        .join("\n");

      alert(`系統異常：${json.status}\n\n${failedChecks || "沒有詳細錯誤資訊"}`);
    } catch (err) {
      console.error("Health check failed:", err);
      alert("系統異常：無法連線到後端 health check API");
    } finally {
      setCheckingHealth(false);
    }
  }

  return (
    <div className="wrap" style={{ height: "100%" }}>
      <div className="panel">
        <div className="header">
          <div className="header-top">
            <div>
              <h1>{floor.title}（系館 AP 熱力圖）</h1>
              <p>顯示 AP 回報的訊號強度熱力分佈。</p>
            </div>

            <div className="floor-switch">
              <select value={activeFloor} onChange={(e) => handleSwitchFloor(e.target.value)}>
                {Object.values(floors).map((floorOption) => (
                  <option key={floorOption.id} value={floorOption.id}>
                    {floorOption.label}
                  </option>
                ))}
              </select>
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
                ref={setMapInstance}
              >
                <ImageOverlay url={floor.imageUrl} bounds={bounds} />

                <MapClickHandler
                  width={floor.width}
                  height={floor.height}
                  activeFloor={activeFloor}
                  onPointSelected={setSelectedPoint}
                />

                <HeatmapLayer points={heatPoints} width={floor.width} height={floor.height} />
                <FlyToSelected targetAp={flyToAp} width={floor.width} height={floor.height} />

                {floor.aps.map((ap) => {
                  const pxX = (ap.x / 100) * floor.width;
                  const pxY = floor.height - (ap.y / 100) * floor.height;

                  return (
                    <Marker
                      key={`${ap.id}-${ap.x}-${ap.y}`}
                      position={[pxY, pxX]}
                      icon={createApIcon(ap, selectedId === ap.id)}
                      eventHandlers={{
                        click: () => setSelectedId(ap.id),
                      }}
                    >
                      <Popup>
                        <ApPopup ap={ap} />
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              <button
                type="button"
                className={`floating-health-button ${healthResult?.status || ""}`}
                onClick={handleCheckSystemHealth}
                disabled={checkingHealth}
                title="檢查系統狀態"
              >
                {checkingHealth ? "檢查中" : "系統檢查"}
              </button>

              {healthResult && (
                <div className={`floating-health-result ${healthResult.status}`}>
                  {getHealthLabel(healthResult.status)}
                </div>
              )}

              {selectedPoint && (
                <MeasurementModal
                  point={selectedPoint}
                  floor={activeFloor}
                  apiBaseUrl={API_BASE_URL}
                  onClose={() => setSelectedPoint(null)}
                  onSaved={() => setReloadKey((v) => v + 1)}
                />
              )}

              {heatmapLoading && <div className="map-status">熱力圖載入中...</div>}
              {heatmapError && <div className="map-status error">{heatmapError}</div>}
            </div>
          </div>

          <Sidebar
            aps={floor.aps}
            selectedId={selectedId}
            onSidebarSelect={handleSidebarSelect}
            floorLabel={floor.label}
          />
        </div>

        <div className="footer">
          系統 AP 熱力圖使用後端 `/api/heatmap/?metric=rssi` 回傳資料。
        </div>
      </div>
    </div>
  );
}
