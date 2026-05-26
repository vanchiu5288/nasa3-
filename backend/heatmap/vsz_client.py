from django.conf import settings
from http.cookiejar import MozillaCookieJar
from pathlib import Path
import time
import requests


def bytes_to_mb(value):
    if value is None:
        return None

    try:
        return round(float(value) / 1024 / 1024, 2)
    except (TypeError, ValueError):
        return None


def load_cookiejar():
    cookie_file = getattr(settings, "VSZ_COOKIE_FILE", "")

    if not cookie_file:
        return None

    cookie_path = Path(cookie_file)

    if not cookie_path.exists():
        return None

    jar = MozillaCookieJar(str(cookie_path))
    jar.load(ignore_discard=True, ignore_expires=True)
    return jar


def normalize_mac(value):
    if not value:
        return ""

    return str(value).strip().lower().replace("-", ":")


def normalize_client(raw):
    return {
        "username": raw.get("userName"),
        "hostname": raw.get("hostname"),
        "ip_address": raw.get("ipAddress"),
        "client_mac": raw.get("clientMac"),

        "ssid": raw.get("ssid"),
        "bssid": raw.get("bssid"),

        "ap_name": raw.get("apName"),
        "ap_mac": raw.get("apMac"),

        "rssi": raw.get("rssi"),
        "snr": raw.get("snr"),

        "radio_type": raw.get("radioType"),
        "channel": raw.get("channel"),

        # 這裡用 vSZ 回傳的即時上下行速率
        "rx_rate": raw.get("downlinkRate"),
        "tx_rate": raw.get("uplinkRate"),

        "traffic_mb": bytes_to_mb(raw.get("traffic")),
    }


def find_wireless_client(keyword):
    base_url = settings.VSZ_BASE_URL.rstrip("/")
    verify_ssl = settings.VSZ_VERIFY_SSL

    url = f"{base_url}/wsg/api/public/v11_1/query/client?_dc={int(time.time() * 1000)}"

    session = requests.Session()

    cookiejar = load_cookiejar()
    if cookiejar is not None:
        session.cookies = cookiejar

    headers = {
        "Accept": "*/*",
        "Content-Type": "text/plain;charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": base_url,
        "Referer": f"{base_url}/wsg/",
    }

    if getattr(settings, "VSZ_CSRF_TOKEN", ""):
        headers["X-CSRF-Token"] = settings.VSZ_CSRF_TOKEN

    if getattr(settings, "VSZ_COOKIE", ""):
        headers["Cookie"] = settings.VSZ_COOKIE

    payload = {
        "filters": [
            {
                "type": "DOMAIN",
                "value": "8b2081d5-9662-40d9-a3db-2a3cf4dde3f7",
            }
        ],
        "fullTextSearch": {
            "type": "AND",
            "value": str(keyword),
        },
        "attributes": ["*"],
        "sortInfo": {
            "sortColumn": "clientMac",
            "dir": "ASC",
        },
        "page": 1,
        "limit": 20,
    }

    response = session.post(
        url,
        json=payload,
        headers=headers,
        verify=verify_ssl,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()
    clients = data.get("list", [])

    if not clients:
        return None

    keyword_text = str(keyword).strip().lower()
    keyword_mac = normalize_mac(keyword)

    for raw in clients:
        hostname = str(raw.get("hostname") or "").strip().lower()
        ip = str(raw.get("ipAddress") or "").strip().lower()
        client_mac = normalize_mac(raw.get("clientMac"))
        username = str(raw.get("userName") or "").strip().lower()

        if keyword_text in [hostname, ip, username] or keyword_mac == client_mac:
            return normalize_client(raw)

    return normalize_client(clients[0])