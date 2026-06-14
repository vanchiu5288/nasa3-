import logging
from django.db import connection
import requests
import shutil
import socket

logger = logging.getLogger(__name__)

def check_database():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        return {
            "status": "ok"
        }

    except Exception as e:
        logger.error(f"監控警報 [資料庫]: 無法連線至資料庫 - {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


def check_vsz_tunnel():
    """
    只檢查 VSZ tunnel port 是否有通。
    這裡不檢查 HTTP 狀態碼，只確認 127.0.0.1:7700 是否可以建立連線。
    """
    try:
        with socket.create_connection(("127.0.0.1", 7700), timeout=3):
            return {
                "status": "ok",
                "message": "VSZ tunnel port is reachable"
            }

    except Exception as e:
        logger.error(f"監控警報 [vSZ Tunnel]: Port 7700 連線失敗 - {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


def check_vsz_http():
    """
    檢查 VSZ tunnel 後面的 HTTP 服務是否有回應。

    注意：
    HTTP 400 不一定代表 tunnel 壞掉。
    有時候是 VSZ / oneDirector 不接受目前的 Host header 或 request path。
    所以這裡把 400 視為 ok，表示 tunnel 後面確實有服務回應。
    """
    try:
        res = requests.get("http://127.0.0.1:7700/wsg/", timeout=3)

        if res.status_code in [200, 302, 400, 401, 403]:
            
            return {
                "status": "ok",
                "status_code": res.status_code
            }
        logger.warning(f"監控警報 [vSZ HTTP]: 回傳非預期的狀態碼 HTTP {res.status_code}")
        return {
            "status": "warning",
            "status_code": res.status_code
        }

    except Exception as e:
        logger.error(f"監控警報 [vSZ HTTP]: 服務無回應 - {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


def check_disk():
    try:
        total, used, free = shutil.disk_usage("/")
        used_percent = round((used / total) * 100, 1)

        if used_percent >= 90:
            logger.warning(f"監控警報 [硬碟空間]: 空間即將耗盡，已使用 {used_percent}%")
            return {"status": "warning", "used_percent": used_percent}
            
        return {"status": "ok", "used_percent": used_percent}

    except Exception as e:
        logger.error(f"監控警報 [硬碟空間]: 讀取硬碟狀態失敗 - {str(e)}")
        return {"status": "error", "message": str(e)}


def run_all_checks():
    checks = {
        "database": check_database(),
        "vsz_tunnel": check_vsz_tunnel(),
        "vsz_http": check_vsz_http(),
        "disk": check_disk(),
    }

    has_error = any(item["status"] == "error" for item in checks.values())
    has_warning = any(item["status"] == "warning" for item in checks.values())

    if has_error:
        overall_status = "degraded"
    elif has_warning:
        overall_status = "warning"
    else:
        overall_status = "ok"

    return overall_status, checks