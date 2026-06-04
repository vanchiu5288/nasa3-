import { useEffect, useMemo, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import { floors } from "../data/floors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// AP 狀態顏色
function getSignalColor(rssi) {
  if (typeof rssi !== "number") return "#cbd5e1";
  if (rssi >= -50) return "#4ade80";
  if (rssi >= -60) return "#edf765f0";
  return "#f87171";
}

// 根據 AP ID 自動生成固定顏色的雜湊函數
function getApColor(apId) {
  if (!apId) return "#cbd5e1";
  let hash = 0;
  for (let i = 0; i < apId.length; i++) {
    hash = apId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs((hash * 137) % 360);
  return `hsl(${h}, 85%, 55%)`;
}

// 自動找出 AP 屬於哪一個樓層的輔助函數
function findApLocation(apName) {
  if (!apName) return null;
  const normalizedApName = apName.toLowerCase();
  
  for (const [floorId, floorData] of Object.entries(floors)) {
    for (const ap of floorData.aps) {
      if (normalizedApName.includes(ap.id.toLowerCase())) {
        return { floorId, apId: ap.id };
      }
    }
  }
  return null;
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
                <div className="ap-name" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getApColor(ap.id), display: "inline-block" }}></span>
                    {ap.id}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "normal", color: "#94a3b8" }}>
                    {ap.note || ""}
                  </span>
                </div>

                {hasMetrics ? (
                  <div className="ap-stats" style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.15)", fontSize: "13px", lineHeight: 1.6 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "45px 60px 1fr", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#dea34a", fontWeight: "bold" }}>csie</span>
                      <span style={{ color: getSignalColor(ap.csie_rssi) }}>📶 {ap.csie_rssi}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "12px" }}>Rx: {ap.csie_Rx_rate} / Tx: {ap.csie_Tx_rate}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "45px 60px 1fr", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#65a7f1", fontWeight: "bold" }}>5G</span>
                      <span style={{ color: getSignalColor(ap.rssi) }}>📶 {ap.rssi}</span>
                      <span style={{ color: "#cbd5e1", fontSize: "12px" }}>Rx: {ap.Rx_rate} / Tx: {ap.Tx_rate}</span>
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
  return (
    <div style={{ minWidth: "220px", fontFamily: "sans-serif" }}>
      <h3 style={{ margin: "0 0 8px 0", borderBottom: "1px solid #ddd", paddingBottom: "6px", fontSize: "16px" }}>
        {ap.id} <span style={{ fontSize: "12px", color: "#e1e1e1", fontWeight: "normal" }}>{ap.note}</span>
      </h3>
      <div style={{ marginBottom: "10px" }}>
        <strong style={{ color: "#fe9d0d", fontSize: "16px" }}>📡 csie</strong><br />
        <span style={{ fontSize: "13px" }}>📶 RSSI: <b>{ap.csie_rssi}</b> dBm</span>
      </div>
      <div>
        <strong style={{ color: "#355ee2", fontSize: "16px" }}>📡 csie-5G</strong><br />
        <span style={{ fontSize: "13px" }}>📶 RSSI: <b>{ap.rssi}</b> dBm</span>
      </div>
    </div>
  );
}

export default function SignalDotMap() {
  const [activeFloor, setActiveFloor] = useState("basement");
  const [selectedId, setSelectedId] = useState(null);
  const [flyToId, setFlyToId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const [connectionPoints, setConnectionPoints] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [highlightedApId, setHighlightedApId] = useState(null);

  const [keywordInput, setKeywordInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchWarning, setSearchWarning] = useState(null);

  const [reportStatus, setReportStatus] = useState("idle");

  const floor = floors[activeFloor];
  const bounds = [[0, 0], [floor.height, floor.width]];

  useEffect(() => {
    async function fetchPoints() {
      try {
        setDataLoading(true);
        setDataError(null);
        
        const res = await fetch(`${API_BASE_URL}/api/heatmap/?floor=${activeFloor}&metric=rssi`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setConnectionPoints(json.data || []);
      } catch (err) {
        console.error("Failed to fetch connection points:", err);
        setDataError("無法載入連線分佈資料");
        setConnectionPoints([]);
      } finally {
        setDataLoading(false);
      }
    }
    fetchPoints();
  }, [activeFloor]);

  const flyToAp = useMemo(
    () => floor.aps.find((ap) => ap.id === flyToId) ?? null,
    [floor, flyToId]
  );

  async function handleSearch(e) {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    try {
      setSearchLoading(true);
      setSearchResult(null);
      setSearchWarning(null);
      setReportStatus("idle");

      const res = await fetch(`${API_BASE_URL}/api/heatmap/user-connection/?keyword=${encodeURIComponent(keywordInput.trim())}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("找不到符合條件的設備");
        throw new Error("查詢失敗，請確認後端連線");
      }

      const data = await res.json(); 
      setSearchResult(data);

      const location = findApLocation(data.ap_name);

      if (location) {
        if (location.floorId !== activeFloor) {
          setActiveFloor(location.floorId);
        }
        setSelectedId(location.apId);
        setHighlightedApId(location.apId);
        setFlyToId(location.apId);
      } else {
        setSearchWarning(`設備目前連線至 ${data.ap_name}，但該 AP 尚未標示於地圖中。`);
        setHighlightedApId(null);
        setSelectedId(null);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSearchLoading(false);
    }
  }

  // 實際的回報功能 (需要搜尋到設備)
  async function handleReportSignal() {
    if (!searchResult) return;
    executeWebhookReport({
      content: `⚠️ **Wi-Fi 訊號異常回報** ⚠️\n` +
               `- 回報時間: \`${new Date().toLocaleString()}\`\n` +
               `- 設備名稱: \`${searchResult.hostname || searchResult.username || "未知"}\`\n` +
               `- 使用者名稱: \`${searchResult.username || "未知"}\`\n` +
               `- 所在 AP: \`${searchResult.ap_name}\` (SSID: ${searchResult.ssid})\n` +
               `- 當前訊號 (RSSI): \`${searchResult.rssi} dBm\`\n` +
               `- 當前樓層: ${floor.label}`
    });
  }

  
  async function handleTestReport() {
    executeWebhookReport({
      content: `⚠️ **[Webhook 測試] Wi-Fi 訊號異常回報** ⚠️\n` +
               `- 測試發送時間: \`${new Date().toLocaleString()}\`\n` +
               `- 設備名稱: \`NULL\`\n` +
               `- 使用者名稱: \`NULL\`\n` +
               `- 所在 AP: \`${selectedId || 'NULL'}\`\n` +
               `- 當前訊號 (RSSI): \`NULL\`\n` +
               `- 當前樓層: ${floor.label}`
    });
  }

  async function executeWebhookReport(payload) {
    try {
      setReportStatus("submitting");
      
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Webhook 傳送失敗");
      
      setReportStatus("success");
      setTimeout(() => setReportStatus("idle"), 3000); 
    } catch (err) {
      console.error("Report failed:", err);
      setReportStatus("error");
      setTimeout(() => setReportStatus("idle"), 3000);
    }
  }

  function handleSidebarSelect(apId) {
    if (mapInstance) mapInstance.closePopup();
    setSelectedId(apId);
    setHighlightedApId(apId);
    setFlyToId(apId);
  }

  function handleResetMap() {
    setHighlightedApId(null);
    setSelectedId(null);
    setFlyToId(null);

    if (mapInstance) {
      mapInstance.fitBounds(bounds);
    }
  }

  function handleSwitchFloor(nextFloor) {
    if (mapInstance) mapInstance.closePopup();
    setActiveFloor(nextFloor);
    setSelectedId(null);
    setHighlightedApId(null);
    setFlyToId(null);
  }

  return (
    <div className="wrap" style={{ height: "100%" }}>
      <div className="panel">
        <div className="header">
          <div className="header-top" style={{ gap: "20px", flexWrap: "wrap" }}>
            <div>
              <h1>{floor.title}（使用者連線紀錄點狀圖）</h1>
              <p>點擊AP可察看地圖上此AP的連線紀錄</p>
            </div>

            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155" }}>
              <input
                type="text"
                placeholder="輸入 Hostname / MAC / IP"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                style={{ background: "none", border: "none", color: "#fff", outline: "none", fontSize: "14px", width: "220px" }}
              />
              <button type="submit" disabled={searchLoading} style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
                {searchLoading ? "查詢中..." : "搜尋設備"}
              </button>
            </form>

            <div className="floor-switch">
              <select value={activeFloor} onChange={(e) => handleSwitchFloor(e.target.value)}>
                {Object.values(floors).map((floorOption) => (
                  <option key={floorOption.id} value={floorOption.id}>{floorOption.label}</option>
                ))}
              </select>
            </div>
            
            {/* 【新增】獨立的 Webhook 測試按鈕 */}
            <button 
              onClick={handleTestReport}
              disabled={reportStatus !== "idle"}
              style={{
                backgroundColor: reportStatus === 'success' ? '#16a34a' : reportStatus === 'error' ? '#dc2626' : '#8b5cf6',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: reportStatus !== "idle" ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
            >
              {reportStatus === 'idle' && '測試 Webhook'}
              {reportStatus === 'submitting' && '傳送中...'}
              {reportStatus === 'success' && '✅ 測試成功'}
              {reportStatus === 'error' && '❌ 測試失敗'}
            </button>

            {highlightedApId && (
              <button 
                onClick={handleResetMap} 
                style={{ backgroundColor: "#475569", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
              >
                Reset
              </button>
            )}
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
                eventHandlers={{
                  click: handleResetMap
                }}
              >
                <ImageOverlay url={floor.imageUrl} bounds={bounds} />
                <FlyToSelected targetAp={flyToAp} width={floor.width} height={floor.height} />

                {connectionPoints.map((p, idx) => {
                  if (typeof p.x !== "number" || typeof p.y !== "number") return null;

                  const pxX = (p.x / 100) * floor.width;
                  const pxY = floor.height - (p.y / 100) * floor.height;

                  const location = findApLocation(p.ap_name);
                  const shortApId = location ? location.apId : p.ap_name;

                  const isCurrentApPoints = shortApId === highlightedApId;
                  const shouldHighlight = highlightedApId === null || isCurrentApPoints;

                  return (
                    <CircleMarker
                      key={`conn-${idx}`}
                      center={[pxY, pxX]}
                      radius={isCurrentApPoints ? 8 : 5} 
                      pathOptions={{
                        color: isCurrentApPoints ? "#ffffff" : "transparent",
                        weight: 1.5,
                        fillColor: getApColor(shortApId), 
                        fillOpacity: shouldHighlight ? 0.85 : 0.15,
                      }}
                    >
                      <Popup>
                        <div style={{ color: "#ffffff" }}>
                          <b>連線紀錄</b><br />
                          目標 AP: {p.ap_name || "未知"}<br />
                          訊號強度: {p.raw_value} dBm 
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {floor.aps.map((ap) => {
                  const pxX = (ap.x / 100) * floor.width;
                  const pxY = floor.height - (ap.y / 100) * floor.height;

                  return (
                    <Marker
                      key={`${ap.id}-${ap.x}-${ap.y}`}
                      position={[pxY, pxX]}
                      icon={createApIcon(ap, selectedId === ap.id)}
                      eventHandlers={{
                        click: (e) => {
                          L.DomEvent.stopPropagation(e);
                          setSelectedId(ap.id);
                          setHighlightedApId(ap.id);
                        },
                      }}
                    >
                      <Popup>
                        <ApPopup ap={ap} />
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {dataLoading && <div className="map-status">連線資料載入中...</div>}
              {dataError && <div className="map-status error">{dataError}</div>}
              
              {searchResult && (
                <div className="map-status" style={{ 
                  bottom: "20px", top: "auto", height: "auto", 
                  backgroundColor: "rgba(15, 23, 42, 0.95)", 
                  border: "1px solid #0284c7", padding: "16px", 
                  borderRadius: "12px", display: "flex", flexDirection: "column", 
                  gap: "8px", alignItems: "flex-start", textAlign: "left", 
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
                  maxWidth: "400px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px", color: "#38bdf8" }}>
                      🎯 尋獲設備：{searchResult.hostname || searchResult.username || "未知名稱"}
                    </div>
                    <button onClick={() => { setSearchResult(null); setReportStatus("idle"); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>✕</button>
                  </div>
                  
                  <div style={{ fontSize: "14px", color: "#e2e8f0" }}>
                    📍 連線 AP：<b>{searchResult.ap_name}</b> (SSID: {searchResult.ssid})
                  </div>
                  {searchWarning && (
                    <div style={{ fontSize: "12px", color: "#facc15", padding: "4px", backgroundColor: "rgba(250, 204, 21, 0.1)", borderRadius: "4px" }}>
                      ⚠️ {searchWarning}
                    </div>
                  )}

                  <div style={{ 
                    fontSize: "13px", color: "#94a3b8", display: "grid", 
                    gridTemplateColumns: "1fr 1fr", gap: "8px 16px", 
                    width: "100%", marginTop: "4px" 
                  }}>
                    <span>🌐 IP: {searchResult.ip_address || "N/A"}</span>
                    <span>🏷️ MAC: {searchResult.client_mac || "N/A"}</span>
                    <span style={{ color: getSignalColor(searchResult.rssi) }}>📶 RSSI: {searchResult.rssi} dBm</span>
                    <span>📊 SNR: {searchResult.snr} dB</span>
                    <span>⬇️ Rx: {searchResult.rx_rate} Mbps</span>
                    <span>⬆️ Tx: {searchResult.tx_rate} Mbps</span>
                  </div>

                  <div style={{ 
                    width: "100%", 
                    marginTop: "12px", 
                    borderTop: "1px dashed #334155", 
                    paddingTop: "12px", 
                    display: "flex", 
                    justifyContent: "flex-end" 
                  }}>
                    <button 
                      onClick={handleReportSignal}
                      disabled={reportStatus !== "idle"}
                      style={{
                        backgroundColor: reportStatus === 'success' ? '#16a34a' : reportStatus === 'error' ? '#dc2626' : '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: reportStatus !== "idle" ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {reportStatus === 'idle' && '回報 AP 異常'}
                      {reportStatus === 'submitting' && '傳送中...'}
                      {reportStatus === 'success' && '✅ 已回報管理員'}
                      {reportStatus === 'error' && '❌ 回報失敗'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          <Sidebar
            aps={floor.aps}
            selectedId={selectedId}
            onSidebarSelect={handleSidebarSelect}
            floorLabel={floor.label}
          />
        </div>
      </div>
    </div>
  );
}