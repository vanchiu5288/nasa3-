"""
Django settings for config project.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env.local")
load_dotenv(BASE_DIR / ".env",override=True)

# SECURITY
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-kgod#+($w)h3h7o76d!$+1^by9w^gsq7xvwan*%3f-&)!#o@yv",
)
#DEBUG = True
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "apmap.csie.org,localhost,127.0.0.1,0.0.0.0"
    ).split(",")
    if host.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://apmap.csie.org,https://apmap.csie.org,http://localhost,http://127.0.0.1"
    ).split(",")
    if origin.strip()
]


# Application definition
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


# CORS
# 開發時可以先全開
CORS_ALLOW_ALL_ORIGINS = True

# 如果你之後想收斂權限，可以改用這個，並把上面的 CORS_ALLOW_ALL_ORIGINS 關掉
# CORS_ALLOW_ALL_ORIGINS = False
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]


# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}


# vSZ / Ruckus API settings
# 開發時，如果你用 SSH tunnel：
# ssh ta221@172.16.215.1 -L 7700:10.3.7.250:8443
# 那 VSZ_BASE_URL 就用 https://localhost:7700

VSZ_BASE_URL = os.environ.get("VSZ_BASE_URL", "https://127.0.0.1:7700")

# 你的 tunnel 如果是自簽憑證，verify 要 False。
# .env 裡 VSZ_INSECURE_TLS=1 時，這裡會變成 False。
VSZ_VERIFY_SSL = os.environ.get("VSZ_INSECURE_TLS", "1") != "1"

# 自動登入用
VSZ_USERNAME = os.environ.get("VSZ_USERNAME", "")
VSZ_PASSWORD = os.environ.get("VSZ_PASSWORD", "")

# 登入 API path。
# 如果 DevTools 看到是 v11_0，就改 .env 的 VSZ_LOGIN_PATH。
VSZ_LOGIN_PATH = os.environ.get(
    "VSZ_LOGIN_PATH",
    "/wsg/api/public/v11_1/session",
)

# 手動 cookie fallback，用不到也可以留著
VSZ_COOKIE = os.environ.get("VSZ_COOKIE", "")
VSZ_CSRF_TOKEN = os.environ.get("VSZ_CSRF_TOKEN", "")
VSZ_COOKIE_FILE = os.environ.get(
    "VSZ_COOKIE_FILE",
    "/home/wifi1/nasa3-/backend/cookies.txt",
)


# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
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

# Internationalization
LANGUAGE_CODE = "zh-hant"

TIME_ZONE = "Asia/Taipei"

USE_I18N = True

USE_TZ = True


# Static files
STATIC_URL = "static/"


# Django 6.0 建議明確設定
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

