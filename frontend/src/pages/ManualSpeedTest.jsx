import { useEffect, useRef, useState } from "react";
import { ImageOverlay, MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import HeatmapLayer from "../components/HeatmapLayer";
import { floors } from "../data/floors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function MapClickHandler({ width, height, activeFloor, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const pxY = e.latlng.lat;
      const pxX = e.latlng.lng;

      const x = (pxX / width) * 100;
      const y = ((height - pxY) / height) * 100;

      onLocationSelect({
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

async function measureDownloadSpeed(downloadUrl) {
  const res = await fetch(`${downloadUrl}?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  let receivedBytes = 0;
  const start = performance.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.length;
  }

  const seconds = (performance.now() - start) / 1000;
  const mbps = (receivedBytes * 8) / seconds / 1_000_000;
  return Number(mbps.toFixed(2));
}

function MeasurementPopup({ location, ssid, onSsidChange, onSaved, onClose }) {
  const markerRef = useRef(null);

  const [note, setNote] = useState("");
  const [speed, setSpeed] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (markerRef.current) markerRef.current.openPopup();
  }, [location]);

  async function handleTest() {
    try {
      setTesting(true);
      setError("");
      setSpeed(null);

      const mbps = await measureDownloadSpeed(`${API_BASE_URL}/api/iperf/download/`);
      setSpeed(mbps);
    } catch (err) {
      console.error(err);
      setError(`測速失敗：${err.message}`);
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (speed === null) {
      setError("請先完成測速再儲存。");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/heatmap/measurements/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          point_id: `speed-${location.floor}-${Date.now()}`,
          floor: location.floor,
          x: location.x,
          y: location.y,
          ssid,
          note,
          download_mbps: speed,
          metric_type: "speed",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(JSON.stringify(json));
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError(`儲存失敗：${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Marker
      position={[location.lat, location.lng]}
      ref={markerRef}
      eventHandlers={{
        popupclose: onClose,
      }}
    >
      <Popup minWidth={280}>
        <div className="speed-popup">
          <h4>新增測速點</h4>
          <div>樓層：{location.floor}</div>
          <div>
            X: {location.x} / Y: {location.y}
          </div>

          <div className="field">
            <label>SSID</label>
            <select value={ssid} onChange={(e) => onSsidChange(e.target.value)}>
              <option value="csie">csie</option>
              <option value="csie-5G">csie-5G</option>
            </select>
          </div>

          <div className="field">
            <label>備註</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：走道、角落、教室內"
            />
          </div>

          <div className="speed-actions">
            <button type="button" onClick={handleTest} disabled={testing}>
              {testing ? "測速中..." : "開始測速"}
            </button>

            <button type="button" onClick={handleSave} disabled={saving || speed === null}>
              {saving ? "儲存中..." : "儲存此點"}
            </button>
          </div>

          {speed !== null && (
            <div className="speed-result">
              下載速度：<strong>{speed} Mbps</strong>
            </div>
          )}

          {error && <div className="speed-error">{error}</div>}
        </div>
      </Popup>
    </Marker>
  );
}

export default function ManualSpeedTest() {
  const [activeFloor, setActiveFloor] = useState("basement");
  const [mapInstance, setMapInstance] = useState(null);

  const [heatmapSsid, setHeatmapSsid] = useState("csie-5G");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [speedHeatPoints, setSpeedHeatPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const floor = floors[activeFloor];
  const bounds = [
    [0, 0],
    [floor.height, floor.width],
  ];

  useEffect(() => {
    async function fetchSpeedHeatmap() {
      try {
        setLoading(true);
        setHeatmapError(null);

        const params = new URLSearchParams({
          floor: activeFloor,
          ssid: heatmapSsid,
          metric: "speed",
        });

        const res = await fetch(`${API_BASE_URL}/api/heatmap/?${params.toString()}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(JSON.stringify(json));
        }

        setSpeedHeatPoints(json.data || []);
      } catch (err) {
        console.error("無法抓取測速熱力圖", err);
        setHeatmapError("無法載入歷史測速資料");
        setSpeedHeatPoints([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSpeedHeatmap();
  }, [activeFloor, heatmapSsid, reloadKey]);

  function handleSwitchFloor(nextFloor) {
    if (mapInstance) mapInstance.closePopup();
    setActiveFloor(nextFloor);
    setSelectedLocation(null);
  }

  return (
    <div className="wrap" style={{ height: "100%" }}>
      <div className="panel">
        <div className="header">
          <div className="header-top">
            <div>
              <h1>{floor.title}（手動測速地圖）</h1>
              <p>點擊地圖任一位置進行測速，儲存後會加入 speed heatmap。</p>
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
                csie
              </button>

              <button
                className={heatmapSsid === "csie-5G" ? "active" : ""}
                onClick={() => setHeatmapSsid("csie-5G")}
                type="button"
              >
                csie-5G
              </button>
            </div>
          </div>
        </div>

        <div className="main manual-main">
          <div className="map-area manual-map-area">
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
                  onLocationSelect={setSelectedLocation}
                />

                <HeatmapLayer
                  points={speedHeatPoints}
                  width={floor.width}
                  height={floor.height}
                  paneName="speed-heatmap-pane"
                />

                {selectedLocation && (
                  <MeasurementPopup
                    location={selectedLocation}
                    ssid={heatmapSsid}
                    onSsidChange={setHeatmapSsid}
                    onSaved={() => setReloadKey((v) => v + 1)}
                    onClose={() => setSelectedLocation(null)}
                  />
                )}
              </MapContainer>

              {loading && <div className="map-status">載入歷史測速資料中...</div>}
              {heatmapError && <div className="map-status error">{heatmapError}</div>}
            </div>
          </div>

          <aside className="sidebar">
            <h2>操作說明</h2>
            <div className="ap-list">
              <div className="ap-item">1. 選擇樓層</div>
              <div className="ap-item">2. 選擇 SSID</div>
              <div className="ap-item">3. 點擊地圖位置</div>
              <div className="ap-item">4. 測速後按「儲存此點」</div>
            </div>
          </aside>
        </div>

        <div className="footer">
          手動測速地圖使用 `/api/iperf/download/` 測速，並寫入
          `/api/heatmap/measurements/create/`。
        </div>
      </div>
    </div>
  );
}
