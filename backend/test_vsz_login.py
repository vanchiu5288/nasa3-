import os
import django
from dotenv import load_dotenv

load_dotenv("/home/vanchiu/nasa3-/backend/.env.local")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.conf import settings
from heatmap.vsz_client import get_vsz_client, find_wireless_client

print("VSZ_BASE_URL:", settings.VSZ_BASE_URL)
print("VSZ_VERIFY_SSL:", settings.VSZ_VERIFY_SSL)
print("VSZ_LOGIN_PATH:", getattr(settings, "VSZ_LOGIN_PATH", None))
print("VSZ_USERNAME exists:", bool(getattr(settings, "VSZ_USERNAME", "")))
print("VSZ_PASSWORD exists:", bool(getattr(settings, "VSZ_PASSWORD", "")))

client = get_vsz_client()

print("\n嘗試登入...")
client.login()

print("logged_in:", client.logged_in)
print("cookies after login:")
for cookie in client.session.cookies:
    print(cookie.name, "=", cookie.value[:20] + "..." if len(cookie.value) > 20 else cookie.value)

print("\n測試 GET /wsg/")
response = client.request("GET", "/wsg/")
print("GET /wsg/ status:", response.status_code)
print(response.text[:500])

print("\n測試 find_wireless_client")
result = find_wireless_client("LAPTOP-CNOAALII")
print(result)