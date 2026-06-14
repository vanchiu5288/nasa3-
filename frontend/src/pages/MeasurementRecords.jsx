import { Fragment, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getCurrentUsername() {
  const token = localStorage.getItem("token");
  if (!token) return "";
  try {
    return JSON.parse(atob(token.split(".")[1])).username || "";
  } catch (e) {
    return "";
  }
}

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("zh-TW", {
      hour12: false,
    });
  } catch {
    return value;
  }
}

export default function MeasurementRecords() {
  const [records, setRecords] = useState([]);
  const [floor, setFloor] = useState("");
  const [ssid, setSsid] = useState("");
  const { username: currentUsername, is_admin: isAdmin } = getJwtPayload();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  

  function getJwtPayload() {
  const token = localStorage.getItem("token");
  if (!token) return { username: "", is_admin: false };
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return { username: "", is_admin: false };
  }
}

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      
      if (floor) params.set("floor", floor);
      if (ssid) params.set("ssid", ssid);
      if (!isAdmin && currentUsername) {
        params.set("keyword", currentUsername);
      } else if (isAdmin && keyword.trim()) {
        params.set("keyword", keyword.trim());
      }
      params.set("limit", "1000");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/heatmap/measurements/?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` } 
      });
      
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || json.message || `HTTP ${res.status}`);
      }

      const filteredData = (json.data || []).filter(
        (item) => item.ssid !== "CSIE_guest" && item.ssid !== "CSIE_guest-5G"
      );

      setRecords(filteredData);
    } catch (err) {
      console.error(err);
      setError(`載入紀錄失敗：${err.message || err}`);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(record) {
    const ok = window.confirm(
      `確定要刪除這筆資料嗎？\n\nID: ${record.id}\nHostname: ${
        record.hostname || record.keyword || "-"
      }\nRSSI: ${record.rssi ?? "-"}`
    );

    if (!ok) return;

    try {
      setDeletingId(record.id);

      const res = await fetch(`${API_BASE_URL}/api/heatmap/measurements/${record.id}/`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || json.message || `HTTP ${res.status}`);
      }

      setRecords((prev) => prev.filter((item) => item.id !== record.id));
    } catch (err) {
      console.error(err);
      alert(`刪除失敗：${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [floor, ssid]);

  const stats = useMemo(() => {
    const rssiRecords = records.filter((r) => typeof r.rssi === "number");

    const avgRssi =
      rssiRecords.length > 0
        ? rssiRecords.reduce((sum, r) => sum + r.rssi, 0) / rssiRecords.length
        : null;

    return {
      total: records.length,
      avgRssi,
    };
  }, [records]);

  return (
    <div className="wrap" style={{ height: "100%" }}>
      <div className="panel">
        <div className="header">
          <div className="header-top">
            <div>
              <h1>{isAdmin ? "全站熱力圖資料紀錄" : "我的熱力圖資料紀錄"}</h1>
              <p>
                查看每一筆上傳到熱力圖的資料，包含 vSZ 回傳的 client、AP、RSSI、SNR
                等資訊。
              </p>
            </div>
          </div>
        </div>

        <div className="records-toolbar">
          <select value={floor} onChange={(e) => setFloor(e.target.value)}>
            <option value="">全部樓層</option>
            <option value="basement">地下室</option>
            <option value="floor1">一樓</option>
            <option value="floor2">二樓</option>
            <option value="floor3">三樓</option>
            <option value="floor4">四樓</option>
            <option value="floor5">五樓</option>
            <option value="floor6">六樓</option>
          </select>

          <select value={ssid} onChange={(e) => setSsid(e.target.value)}>
            <option value="">全部 SSID</option>
            <option value="csie">csie</option>
            <option value="csie-5G">csie-5G</option>
          </select>
          {isAdmin && (
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadRecords();
              }}
              placeholder=" keyword / hostname"
            />
          )}

          <button type="button" onClick={loadRecords}>
            查詢
          </button>
        </div>

        <div className="records-summary">
          <span>共 {stats.total} 筆</span>
          <span>
            平均 RSSI：
            {stats.avgRssi === null ? "-" : `${stats.avgRssi.toFixed(1)} dBm`}
          </span>
        </div>

        <div className="records-content">
          {loading && <div className="records-status">載入中...</div>}
          {error && <div className="records-status error">{error}</div>}

          {!loading && !error && records.length === 0 && (
            <div className="records-empty">目前沒有資料。</div>
          )}

          {!loading && !error && records.length > 0 && (
            <div className="records-table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>時間</th>
                    <th>樓層</th>
                    <th>座標</th>
                    <th>Hostname</th>
                    <th>IP</th>
                    <th>Client MAC</th>
                    <th>SSID</th>
                    <th>AP</th>
                    <th>RSSI</th>
                    <th>SNR</th>
                    <th>操作</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => {
                    const expanded = expandedId === record.id;

                    return (
                      <Fragment key={record.id}>
                        <tr>
                          <td>{record.id}</td>
                          <td>{formatDate(record.measured_at)}</td>
                          <td>{formatValue(record.floor)}</td>
                          <td>
                            {Number(record.x).toFixed(2)}, {Number(record.y).toFixed(2)}
                          </td>
                          <td>{formatValue(record.hostname || record.keyword)}</td>
                          <td>{formatValue(record.ip_address)}</td>
                          <td className="mono">{formatValue(record.client_mac)}</td>
                          <td>{formatValue(record.ssid)}</td>
                          <td>{formatValue(record.ap_name)}</td>
                          <td>{record.rssi ?? "-"}</td>
                          <td>{record.snr ?? "-"}</td>
                          <td>
                            <div className="records-actions">
                              <button
                                type="button"
                                onClick={() => setExpandedId(expanded ? null : record.id)}
                              >
                                {expanded ? "收合" : "詳細"}
                              </button>

                              <button
                                type="button"
                                className="danger"
                                disabled={deletingId === record.id}
                                onClick={() => deleteRecord(record)}
                              >
                                {deletingId === record.id ? "刪除中" : "刪除"}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="records-detail-row">
                            <td colSpan="12">
                              <div className="records-detail">
                                <div>
                                  <strong>基本資料</strong>
                                  <p>point_id: {formatValue(record.point_id)}</p>
                                  <p>keyword: {formatValue(record.keyword)}</p>
                                  <p>note: {formatValue(record.note)}</p>
                                  <p>metric_type: {formatValue(record.metric_type)}</p>
                                  <p>measured_at: {formatDate(record.measured_at)}</p>
                                </div>

                                <div>
                                  <strong>vSZ Client</strong>
                                  <p>username: {formatValue(record.username)}</p>
                                  <p>hostname: {formatValue(record.hostname)}</p>
                                  <p>ip_address: {formatValue(record.ip_address)}</p>
                                  <p>client_mac: {formatValue(record.client_mac)}</p>
                                </div>

                                <div>
                                  <strong>Wi-Fi / AP</strong>
                                  <p>ssid: {formatValue(record.ssid)}</p>
                                  <p>bssid: {formatValue(record.bssid)}</p>
                                  <p>ap_name: {formatValue(record.ap_name)}</p>
                                  <p>ap_mac: {formatValue(record.ap_mac)}</p>
                                  <p>channel: {formatValue(record.channel)}</p>
                                  <p>radio_type: {formatValue(record.radio_type)}</p>
                                </div>

                                <div>
                                  <strong>Metrics</strong>
                                  <p>rssi: {formatValue(record.rssi)} dBm</p>
                                  <p>snr: {formatValue(record.snr)} dB</p>
                                  <p>rx_rate: {formatValue(record.rx_rate)}</p>
                                  <p>tx_rate: {formatValue(record.tx_rate)}</p>
                                  <p>download_mbps: {formatValue(record.download_mbps)}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="footer">
          此頁資料來自 `/api/heatmap/measurements/`，刪除資料會同步影響熱力圖顯示。
        </div>
      </div>
    </div>
  );
}