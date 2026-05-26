"""
Django settings for config project.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-kgod#+($w)h3h7o76d!$+1^by9w^gsq7xvwan*%3f-&)!#o@yv",
)

DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
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

VSZ_BASE_URL = os.getenv("VSZ_BASE_URL", "https://localhost:7700")
VSZ_VERIFY_SSL = os.getenv("VSZ_VERIFY_SSL", "false").lower() == "true"

VSZ_COOKIE = os.getenv("VSZ_COOKIE", "")
VSZ_CSRF_TOKEN = os.getenv("VSZ_CSRF_TOKEN", "")

VSZ_COOKIE_FILE = os.getenv(
    "VSZ_COOKIE_FILE",
    str(BASE_DIR / "cookies.txt"),
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