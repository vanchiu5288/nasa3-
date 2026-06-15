from __future__ import annotations
import re
import threading
import time
import logging
from http.cookiejar import MozillaCookieJar
from pathlib import Path
from typing import Any, Dict, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)
class VSZClientError(Exception):
    pass


def bytes_to_mb(value):
    if value is None:
        return None

    try:
        return round(float(value) / 1024 / 1024, 2)
    except (TypeError, ValueError):
        return None

def bps_to_mbps(value):
    if value is None:
        return None

    try:
        return round(float(value) / 1000, 2)
    except (TypeError, ValueError):
        return None

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

        # vSZ 回傳的即時上下行速率
        "rx_rate": bps_to_mbps(raw.get("downlinkRate")),
        "tx_rate": bps_to_mbps(raw.get("uplinkRate")),

        "traffic_mb": bytes_to_mb(raw.get("traffic")),
    }


def load_cookiejar():
    """
    保留你原本的 cookies.txt 支援。

    如果 settings.VSZ_COOKIE_FILE 有設定，而且該檔案存在，
    就載入 MozillaCookieJar 格式的 cookie。
    """
    cookie_file = getattr(settings, "VSZ_COOKIE_FILE", "")

    if not cookie_file:
        return None

    cookie_path = Path(cookie_file)

    if not cookie_path.exists():
        return None

    jar = MozillaCookieJar(str(cookie_path))
    jar.load(ignore_discard=True, ignore_expires=True)
    return jar


class VSZClient:
    """
    vSZ API client。

    支援兩種模式：

    1. 自動登入模式：
       settings.py / .env 裡有 VSZ_USERNAME 與 VSZ_PASSWORD。
       這是比較推薦的方式。

    2. 手動 cookie 模式：
       沒有 VSZ_USERNAME / VSZ_PASSWORD 時，會退回使用：
       - settings.VSZ_COOKIE
       - settings.VSZ_CSRF_TOKEN
       - settings.VSZ_COOKIE_FILE
    """

    def __init__(self) -> None:
        self.base_url = getattr(settings, "VSZ_BASE_URL", "").rstrip("/")
        self.verify_ssl = getattr(settings, "VSZ_VERIFY_SSL", False)

        self.username = getattr(settings, "VSZ_USERNAME", "")
        self.password = getattr(settings, "VSZ_PASSWORD", "")

        # 你的查詢 API 是 v11_1，所以 login 預設也先用 v11_1。
        # 如果你的瀏覽器 Network 看到登入 endpoint 是 v11_0，
        # 可以在 settings.py 裡設：
        # VSZ_LOGIN_PATH = "/wsg/api/public/v11_0/session"
        self.login_path = getattr(
            settings,
            "VSZ_LOGIN_PATH",
            "/wsg/api/public/v11_1/session",
        )

        self.manual_cookie = getattr(settings, "VSZ_COOKIE", "")
        self.manual_csrf_token = getattr(settings, "VSZ_CSRF_TOKEN", "")

        self.session = requests.Session()
        self.lock = threading.Lock()
        self.logged_in = False
        self.csrf_token = ""

        if not self.base_url:
            raise VSZClientError("Missing VSZ_BASE_URL in Django settings")

        self._load_manual_cookie_if_available()

    def _url(self, path: str) -> str:
        return f"{self.base_url}/{path.lstrip('/')}"

    def _load_manual_cookie_if_available(self) -> None:
        """
        如果有 cookies.txt,就載入到 session。
        這是為了保留你原本的使用方式。
        """
        cookiejar = load_cookiejar()
        if cookiejar is not None:
            self.session.cookies = cookiejar

    def _has_login_credentials(self) -> bool:
        return bool(self.username and self.password)

    def _extract_csrf_token(self, response: requests.Response) -> str:
        """
        嘗試從 response headers、JSON、HTML meta 裡抓 CSRF token。

        vSZ /wsg/ 頁面常見格式：
        <meta name="X-CSRF-Token" content="...">
        """
        header_candidates = [
            "X-CSRF-Token",
            "X-XSRF-TOKEN",
            "X-CSRF",
        ]

        for key in header_candidates:
            value = response.headers.get(key)
            if value:
                return value

        text = response.text or ""

        # 抓：
        # <meta name="X-CSRF-Token" content="xxxx">
        meta_patterns = [
            r'<meta[^>]+name=["\']X-CSRF-Token["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']X-CSRF-Token["\']',
            r'<meta[^>]+name=["\']csrf-token["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']csrf-token["\']',
        ]

        for pattern in meta_patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return match.group(1)

        try:
            data = response.json()
        except ValueError:
            return ""

        if not isinstance(data, dict):
            return ""

        json_candidates = [
            "csrfToken",
            "csrf_token",
            "csrf",
            "token",
            "requestToken",
        ]

        for key in json_candidates:
            value = data.get(key)
            if value:
                return str(value)

        return ""

    def _default_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "*/*",
            "Content-Type": "text/plain;charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": self.base_url,
            "Referer": f"{self.base_url}/wsg/",
        }

        csrf_token = self.csrf_token or self.manual_csrf_token
        if csrf_token:
            headers["X-CSRF-Token"] = csrf_token

        if self.manual_cookie:
            headers["Cookie"] = self.manual_cookie

        return headers

    def login(self) -> None:
        """
        CAS 表單登入流程：

        1. GET /cas/login?service=%2Fwsg%2Flogin%2Fcas
        取得 CAS login form 與 hidden execution token。

        2. POST username/password/execution/_eventId
        讓 CAS 建立登入 session。

        3. requests.Session 會自動保存 cookie。
        """
        logger.info("vSZ Client 開始執行登入流程...")
        if not self._has_login_credentials():
            # 沒有帳密就使用手動 cookie 模式
            if self.manual_cookie or load_cookiejar() is not None:
                logger.info("未提供帳密，但發現手動 Cookie 檔案，將使用 Cookie 模式")
                self.logged_in = True
                return
            logger.error("vSZ 登入失敗：缺少帳號密碼，且無手動 Cookie 可用")
            raise VSZClientError(
                "Missing VSZ_USERNAME / VSZ_PASSWORD, and no manual VSZ_COOKIE or VSZ_COOKIE_FILE is available"
            )

        login_url = self._url(self.login_path)

        # Step 1: 先 GET CAS login page，拿 hidden form values
        get_response = self.session.get(
            login_url,
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Referer": f"{self.base_url}/wsg/",
            },
            verify=self.verify_ssl,
            timeout=15,
            allow_redirects=True,
        )

        if get_response.status_code != 200:
            logger.error(f"vSZ CAS 登入頁面載入失敗 (HTTP {get_response.status_code})")
            raise VSZClientError(
                "CAS login page failed: "
                f"status={get_response.status_code}, "
                f"body={get_response.text[:500]}"
            )

        html = get_response.text

        def get_hidden_value(name: str) -> str:
            """
            從 CAS HTML form 裡抓 hidden input value。
            """
            pattern = (
                r'name=["\']'
                + re.escape(name)
                + r'["\'][^>]*value=["\']([^"\']*)["\']'
            )
            match = re.search(pattern, html)
            if match:
                return match.group(1)

            # 有些 HTML 會把 value 放在 name 前面，所以反向再找一次
            pattern_reverse = (
                r'value=["\']([^"\']*)["\'][^>]*name=["\']'
                + re.escape(name)
                + r'["\']'
            )
            match = re.search(pattern_reverse, html)
            if match:
                return match.group(1)

            return ""

        execution = get_hidden_value("execution")
        lt = get_hidden_value("lt")

        if not execution:
            # 如果已經有 CAS / WSG session，GET /cas/login 可能會直接導到 /wsg/
            # 這時候頁面不會再有 execution hidden field。
            # 所以改成嘗試直接開 /wsg/ 並抓 CSRF token。
            logger.warning("在 CAS 登入頁找不到 execution 隱藏欄位，嘗試直接獲取 /wsg/ CSRF token")
            wsg_response = self.session.get(
                self._url("/wsg/"),
                headers={
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": login_url,
                },
                verify=self.verify_ssl,
                timeout=15,
                allow_redirects=True,
            )

            if wsg_response.status_code == 200:
                self.csrf_token = self._extract_csrf_token(wsg_response)

                if self.csrf_token:
                    logger.info("成功繞過 CAS，直接透過 /wsg/ 取得 CSRF token 並登入")
                    self.logged_in = True
                    return
            logger.error("無法抓取 CAS 隱藏欄位，且無法從 /wsg/ 提取 CSRF token")
            raise VSZClientError(
                "Cannot find CAS hidden field: execution, and cannot extract CSRF token from /wsg/. "
                "This means the login page format is different than expected or login did not complete."
            )

        # Step 2: POST CAS login form
        payload = {
            "username": self.username,
            "password": self.password,
            "execution": execution,
            "_eventId": "submit",
            "submit": "LOGIN",
        }

        # 有些 CAS 版本會有 lt，有就帶上
        if lt:
            payload["lt"] = lt

        post_response = self.session.post(
            login_url,
            data=payload,
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": self.base_url,
                "Referer": login_url,
            },
            verify=self.verify_ssl,
            timeout=15,
            allow_redirects=True,
        )

        if post_response.status_code not in (200, 302):
            logger.error(f"vSZ CAS 登入送出失敗 (HTTP {post_response.status_code})")
            raise VSZClientError(
                "CAS login submit failed: "
                f"status={post_response.status_code}, "
                f"body={post_response.text[:500]}"
            )

        # Step 3: 進入 /wsg/，讓 vSZ service 建立自己的 session
        wsg_response = self.session.get(
            self._url("/wsg/"),
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Referer": login_url,
            },
            verify=self.verify_ssl,
            timeout=15,
            allow_redirects=True,
        )

        if wsg_response.status_code != 200:
            logger.error(f"vSZ 登入後重導向至 /wsg/ 失敗 (HTTP {wsg_response.status_code})")
            raise VSZClientError(
                "Open /wsg/ after CAS login failed: "
                f"status={wsg_response.status_code}, "
                f"body={wsg_response.text[:500]}"
            )

        # 如果登入後還停在 CAS login 頁，代表帳密錯或 CAS payload 不完整
        body_preview = wsg_response.text[:1000].lower()
        if "name=\"username\"" in body_preview or "cas/css" in body_preview or "login" in body_preview and "password" in body_preview:
            logger.error("vSZ 登入未完成，可能帳號密碼錯誤，畫面仍停留在登入頁")
            raise VSZClientError(
                "CAS login did not complete. Still seeing login page. "
                "Please check VSZ_USERNAME, VSZ_PASSWORD, or CAS form payload."
            )

        # 嘗試抓 CSRF token
        self.csrf_token = self._extract_csrf_token(wsg_response)

        # 最後確認至少有 cookie
        if not list(self.session.cookies):
            logger.error("vSZ CAS 登入流程結束，但未儲存任何 Cookie，登入可能失效")
            raise VSZClientError(
                "CAS login finished but no cookies were stored. "
                "Login probably did not actually succeed."
            )
        logger.info("vSZ Client 登入成功！")
        self.logged_in = True

    def request(
        self,
        method: str,
        path: str,
        *,
        retry_login: bool = True,
        **kwargs: Any,
    ) -> requests.Response:
        """
        發送 vSZ request。

        如果還沒登入，會先登入。
        如果 session 過期，遇到 401 / 403 會重新登入一次。
        """
        with self.lock:
            if not self.logged_in:
                self.login()

        url = self._url(path)

        headers = self._default_headers()
        extra_headers = kwargs.pop("headers", None)

        if extra_headers:
            headers.update(extra_headers)

        try:
            response = self.session.request(
                method=method.upper(),
                url=url,
                headers=headers,
                verify=self.verify_ssl,
                timeout=kwargs.pop("timeout", 15),
                **kwargs,
            )
        except requests.RequestException as e:
            logger.exception(f"向 vSZ 發送請求時發生網路底層錯誤: {url}")
            raise

        if response.status_code in (401, 403) and retry_login:
            logger.warning(f"vSZ 請求回傳 {response.status_code}，Session 可能已過期，正在嘗試重新登入...")
            with self.lock:
                self.logged_in = False
                self.login()

            headers = self._default_headers()
            if extra_headers:
                headers.update(extra_headers)

            response = self.session.request(
                method=method.upper(),
                url=url,
                headers=headers,
                verify=self.verify_ssl,
                timeout=15,
                **kwargs,
            )
            if response.status_code == 200:
                logger.info("vSZ 重新登入並重試請求成功！")

        return response

    def get_json(self, path: str, **kwargs: Any) -> Dict[str, Any]:
        response = self.request("GET", path, **kwargs)
        response.raise_for_status()
        return response.json()

    def post_json(self, path: str, payload: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        response = self.request("POST", path, json=payload, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_text(self, path: str, **kwargs: Any) -> str:
        response = self.request("GET", path, **kwargs)
        response.raise_for_status()
        return response.text


_vsz_client: Optional[VSZClient] = None
_client_lock = threading.Lock()


def get_vsz_client() -> VSZClient:
    global _vsz_client

    with _client_lock:
        if _vsz_client is None:
            _vsz_client = VSZClient()
        return _vsz_client


def reset_vsz_client() -> None:
    """
    測試或重新載入設定時可以用。
    一般 view 不一定需要呼叫。
    """
    global _vsz_client

    with _client_lock:
        _vsz_client = None


def find_wireless_client(keyword):
    """
    用 keyword 查詢 vSZ wireless client。

    keyword 可以是：
    - hostname
    - IP
    - username
    - client MAC
    """
    client = get_vsz_client()

    url_path = f"/wsg/api/public/v11_1/query/client?_dc={int(time.time() * 1000)}"

    payload = {
        # 如果之後你要限制 domain，可以把這段打開並填入 domain UUID。
        # "filters": [
        #     {
        #         "type": "DOMAIN",
        #         "value": "8b2081d5-9662-40d9-a3db-2a3cf4dde3f7",
        #     }
        # ],

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
        "limit": 100,
    }

    response = client.request(
        "POST",
        url_path,
        json=payload,
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