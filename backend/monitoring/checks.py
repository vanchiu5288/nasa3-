from django.db import connection
import requests
import shutil


def check_database():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        return {
            "status": "ok"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def check_vsz_tunnel():
    try:
        res = requests.get("http://127.0.0.1:7700/wsg/", timeout=3)

        if res.status_code in [200, 302, 401, 403]:
            return {
                "status": "ok",
                "status_code": res.status_code
            }

        return {
            "status": "error",
            "status_code": res.status_code
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def check_disk():
    try:
        total, used, free = shutil.disk_usage("/")
        used_percent = round((used / total) * 100, 1)

        return {
            "status": "ok" if used_percent < 90 else "warning",
            "used_percent": used_percent
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def run_all_checks():
    checks = {
        "database": check_database(),
        "vsz_tunnel": check_vsz_tunnel(),
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