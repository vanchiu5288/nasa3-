"""
Django settings for config project.
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# ============================================================
# Base paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# Load environment files
# ============================================================
# 先讀 .env，再讀 .env.local，讓 .env.local 優先覆蓋。
# 正式機器上的秘密資料建議放在 .env.local，不要放 GitHub。
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / ".env.local", override=True)


# ============================================================
# Helper functions
# ============================================================

def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in ("1", "true", "yes", "on")


def env_list(name: str, default: str = "") -> list[str]:
    value = os.getenv(name, default)

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def env_int(name: str, default: int) -> int:
    value = os.getenv(name)

    if value is None or value.strip() == "":
        return default

    return int(value)


# ============================================================
# App
# ============================================================

APP_NAME = os.getenv("APP_NAME", "nasa3")


# ============================================================
# Security
# ============================================================

# 支援兩種名稱：
# 1. SECRET_KEY
# 2. DJANGO_SECRET_KEY
#
# 建議你的 .env.local 使用 SECRET_KEY。
SECRET_KEY = (
    os.getenv("SECRET_KEY")
    or os.getenv("DJANGO_SECRET_KEY")
    or "django-insecure-dev-only-change-me"
)

DEBUG = env_bool("DEBUG", False)

ALLOWED_HOSTS = env_list(
    "ALLOWED_HOSTS",
    "apmap.csie.org,localhost,127.0.0.1",
)

CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    "https://apmap.csie.org,http://apmap.csie.org,http://localhost:5173,http://127.0.0.1:5173",
)

# 如果前面有 nginx / reverse proxy，讓 Django 知道原始請求是 HTTPS。
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# 正式環境建議 cookie 只走 HTTPS。
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", not DEBUG)
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", not DEBUG)


# ============================================================
# Application definition
# ============================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",

    "heatmap",
    "iperf_api",
    "monitoring",
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# CORS
# ============================================================
# 開發環境 DEBUG=True 時，可以全開。
# 正式環境 DEBUG=False 時，預設不全開，而是吃 CORS_ALLOWED_ORIGINS。

CORS_ALLOW_ALL_ORIGINS = env_bool("CORS_ALLOW_ALL_ORIGINS", DEBUG)

CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "https://apmap.csie.org,http://apmap.csie.org,http://localhost:5173,http://127.0.0.1:5173",
)

CORS_ALLOW_CREDENTIALS = env_bool("CORS_ALLOW_CREDENTIALS", True)


# ============================================================
# REST Framework
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}


# ============================================================
# Discord webhook
# ============================================================

DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")


# ============================================================
# vSZ / Ruckus API settings
# ============================================================

VSZ_BASE_URL = os.getenv("VSZ_BASE_URL", "https://127.0.0.1:7700")

# .env.local 裡 VSZ_INSECURE_TLS=1 時，代表不要驗證 SSL。
VSZ_INSECURE_TLS = env_bool("VSZ_INSECURE_TLS", True)
VSZ_VERIFY_SSL = not VSZ_INSECURE_TLS

VSZ_USERNAME = os.getenv("VSZ_USERNAME", "")
VSZ_PASSWORD = os.getenv("VSZ_PASSWORD", "")

VSZ_LOGIN_PATH = os.getenv(
    "VSZ_LOGIN_PATH",
    "/cas/login?service=%2Fwsg%2Flogin%2Fcas",
)

# 手動 cookie fallback，用不到也可以留著。
VSZ_COOKIE = os.getenv("VSZ_COOKIE", "")
VSZ_CSRF_TOKEN = os.getenv("VSZ_CSRF_TOKEN", "")

VSZ_COOKIE_FILE = os.getenv(
    "VSZ_COOKIE_FILE",
    str(BASE_DIR / "cookies.txt"),
)


# ============================================================
# Backend bind settings
# ============================================================

BACKEND_HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = env_int("BACKEND_PORT", 8000)


# ============================================================
# LDAP
# ============================================================

LDAP_SERVER = os.getenv("LDAP_SERVER", "")
LDAP_PORT = env_int("LDAP_PORT", 636)
LDAP_BASE_DN = os.getenv("LDAP_BASE_DN", "")
LDAP_CA_CERT_PATH = os.getenv(
    "LDAP_CA_CERT_PATH",
    str(BASE_DIR / "nasaldap_ca.crt"),
)


# ============================================================
# Database
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ============================================================
# Password validation
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ============================================================
# Internationalization
# ============================================================

LANGUAGE_CODE = "zh-hant"

TIME_ZONE = "Asia/Taipei"

USE_I18N = True

USE_TZ = True


# ============================================================
# Static files
# ============================================================

STATIC_URL = "/static/"

# collectstatic 會收集到這裡。
STATIC_ROOT = BASE_DIR / "staticfiles"


# ============================================================
# Default primary key field type
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"