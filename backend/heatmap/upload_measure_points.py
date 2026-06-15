import requests
import logging

API_URL = "http://localhost:8000/api/heatmap/measurements/create/"
logger = logging.getLogger(__name__)

# 先用前端 CoordinateLogger 點出每個 M 點的 x, y，再填到這裡
# 注意：這裡的 x, y 是百分比座標，不是像素座標
COORDS = {
    # B1 / 地下室
    ("basement", "M1"): (64.9, 67.7),
    ("basement", "M2"): (54.4, 72.8),
    ("basement", "M3"): (46.1, 72.8),
    ("basement", "M4"): (31.2, 57.3),

    # 1F / 一樓
    ("floor1", "M5"): (23.6, 25.1),
    ("floor1", "M6"): (20.9, 36.7),
}

ROWS = [
    # csie-5G
    {
        "floor": "basement",
        "point_id": "M1",
        "ssid": "csie-5G",
        "connected_ap": "B02",
        "rssi": -59,
        "rx_rate": 114.0,
        "tx_rate": 108.7,
        "rx_phy": 270,
        "tx_phy": 240,
        "measured_at_text": "0320.17:25",
    },
    {
        "floor": "basement",
        "point_id": "M2",
        "ssid": "csie-5G",
        "connected_ap": "B15",
        "rssi": -49,
        "rx_rate": 201.3,
        "tx_rate": 201.7,
        "rx_phy": 360,
        "tx_phy": 400,
        "measured_at_text": "0320.16:54",
    },
    {
        "floor": "basement",
        "point_id": "M3",
        "ssid": "csie-5G",
        "connected_ap": "B15",
        "rssi": -44,
        "rx_rate": 178.2,
        "tx_rate": 194.9,
        "rx_phy": 360,
        "tx_phy": 360,
        "measured_at_text": "0320.17:05",
    },
    {
        "floor": "basement",
        "point_id": "M4",
        "ssid": "csie-5G",
        "connected_ap": "B15",
        "rssi": -62,
        "rx_rate": 97.3,
        "tx_rate": 125.9,
        "rx_phy": 216,
        "tx_phy": 216,
        "measured_at_text": "0320.17:23",
    },
    {
        "floor": "floor1",
        "point_id": "M5",
        "ssid": "csie-5G",
        "connected_ap": "R107",
        "rssi": -54,
        "rx_rate": 212.0,
        "tx_rate": 231.3,
        "rx_phy": 324,
        "tx_phy": 360,
        "measured_at_text": "0324.10:56",
    },
    {
        "floor": "floor1",
        "point_id": "M6",
        "ssid": "csie-5G",
        "connected_ap": "R107",
        "rssi": -55,
        "rx_rate": 203.8,
        "tx_rate": 232.5,
        "rx_phy": 270,
        "tx_phy": 360,
        "measured_at_text": "0324.10:52",
    },

    # csie
    {
        "floor": "basement",
        "point_id": "M1",
        "ssid": "csie",
        "connected_ap": "B02",
        "rssi": -51,
        "rx_rate": 31.1,
        "tx_rate": 44.9,
        "rx_phy": 130,
        "tx_phy": 115,
        "measured_at_text": "0320.17:27",
    },
    {
        "floor": "basement",
        "point_id": "M2",
        "ssid": "csie",
        "connected_ap": "B04",
        "rssi": -40,
        "rx_rate": 14.1,
        "tx_rate": 18.4,
        "rx_phy": 130,
        "tx_phy": 117,
        "measured_at_text": "0320.16:50",
    },
    {
        "floor": "basement",
        "point_id": "M3",
        "ssid": "csie",
        "connected_ap": "B04",
        "rssi": -64,
        "rx_rate": 4.5,
        "tx_rate": 13.6,
        "rx_phy": 104,
        "tx_phy": 117,
        "measured_at_text": "0320.17:02",
    },
    {
        "floor": "basement",
        "point_id": "M4",
        "ssid": "csie",
        "connected_ap": "B09",
        "rssi": -49,
        "rx_rate": 36.2,
        "tx_rate": 16.2,
        "rx_phy": 144,
        "tx_phy": 130,
        "measured_at_text": "0320.17:22",
    },
    {
        "floor": "floor1",
        "point_id": "M5",
        "ssid": "csie",
        "connected_ap": "R107",
        "rssi": -49,
        "rx_rate": 42.3,
        "tx_rate": 28.5,
        "rx_phy": 130,
        "tx_phy": 144,
        "measured_at_text": "0324.10:52",
    },
    {
        "floor": "floor1",
        "point_id": "M6",
        "ssid": "csie",
        "connected_ap": "R111",
        "rssi": -49,
        "rx_rate": 45.5,
        "tx_rate": 22.2,
        "rx_phy": 130,
        "tx_phy": 130,
        "measured_at_text": "0324.10:52",
    },
]


def main():
    logger.info(f"開始批次匯入測量點資料，共 {len(ROWS)} 筆")
    for row in ROWS:
        key = (row["floor"], row["point_id"])
        x, y = COORDS.get(key, (None, None))

        if x is None or y is None:
            print(f"SKIP {key}: missing x/y coordinate")
            continue

        payload = {
            "floor": row["floor"],
            "point_id": row["point_id"],
            "x": x,
            "y": y,
            "note": (
                f"{row['point_id']}｜連到 AP: {row['connected_ap']}｜"
                f"Rx PHY: {row['rx_phy']}｜Tx PHY: {row['tx_phy']}｜"
                f"測量時間: {row['measured_at_text']}"
            ),
            "ssid": row["ssid"],
            "bssid": row["connected_ap"],
            "channel": None,
            "rssi": row["rssi"],
            "rx_rate": row["rx_rate"],
            "tx_rate": row["tx_rate"],
        }

        try:
            res = requests.post(API_URL, json=payload, timeout=10)

            if res.status_code == 201:
                # 成功時記錄 info
                logger.info(f"匯入成功 (OK): {row['floor']} {row['ssid']} {row['point_id']}")
            else:
                # API 拒絕時記錄 warning
                logger.warning(f"匯入失敗 (FAIL): {row['floor']} {row['ssid']} {row['point_id']} - HTTP {res.status_code}: {res.text}")
                
        except requests.RequestException as e:
            # 發生網路問題（如 Timeout, 連線拒絕）時記錄 error
            logger.error(f"匯入異常 (ERROR): 無法連線至 API - {row['floor']} {row['point_id']} - {str(e)}")

    logger.info("批次匯入作業結束")


if __name__ == "__main__":
    main()