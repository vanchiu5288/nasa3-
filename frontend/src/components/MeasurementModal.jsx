import { useState } from "react";

export default function MeasurementModal({
  point,
  floor,
  onClose,
  onSaved,
  apiBaseUrl,
}) {
  const [keyword, setKeyword] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!keyword.trim()) {
      alert("請輸入 hostname / IP / MAC");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/heatmap/measurements/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          floor,
          x: point.x,
          y: point.y,
          keyword: keyword.trim(),
          note,
          metric_type: "rssi",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json.error || json.message || "記錄失敗");
        return;
      }

      const saved = json.data || json;

      alert(
        `已記錄：RSSI ${saved.rssi ?? "N/A"} dBm, SNR ${saved.snr ?? "N/A"} dB, AP ${
          saved.ap_name ?? "N/A"
        }`
      );

      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(`連線後端失敗：${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>新增 Wi-Fi 測量點</h2>

        <p>
          座標：{point.x.toFixed(2)}%, {point.y.toFixed(2)}%
        </p>

        <label>Hostname / IP / MAC</label>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例如 DESKTOP-T4H、10.5.6.125、00:11:22:33:44:55"
        />

        <label>備註</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如 R103 後方座位"
        />

        <div className="modal-actions">
          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "記錄中..." : "記錄測量"}
          </button>

          <button type="button" onClick={onClose} disabled={loading}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}