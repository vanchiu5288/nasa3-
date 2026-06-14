import json
import os
import requests

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .services import authenticate_user_hybrid, generate_jwt_token


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    """
    提供 /api/login/ 端點，接收 JSON 格式的 username 與 password
    """

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse(
                {"status": "error", "message": "無效的 JSON 格式"},
                status=400,
            )

        if not username or not password:
            return JsonResponse(
                {"status": "error", "message": "請提供帳號與密碼"},
                status=400,
            )

        success, result = authenticate_user_hybrid(username, password)

        if not success:
            return JsonResponse(
                {"status": "error", "message": result},
                status=401,
            )

        user_info = result
        token = generate_jwt_token(user_info)

        return JsonResponse(
            {
                "status": "success",
                "message": "登入成功",
                "token": token,
                "user": user_info,
            },
            status=200,
        )


@method_decorator(csrf_exempt, name="dispatch")
class DiscordWebhookView(View):
    """
    提供 /api/discord-webhook/ 端點。
    前端只打這個 API，不直接碰 Discord webhook URL。
    真正的 webhook URL 放在 backend/.env 的 DISCORD_WEBHOOK_URL。
    """

    def post(self, request, *args, **kwargs):
        webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

        if not webhook_url:
            return JsonResponse(
                {
                    "status": "error",
                    "message": "後端尚未設定 DISCORD_WEBHOOK_URL",
                },
                status=500,
            )

        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse(
                {"status": "error", "message": "無效的 JSON 格式"},
                status=400,
            )

        message = data.get("message") or data.get("content")

        if not message:
            return JsonResponse(
                {"status": "error", "message": "請提供 message"},
                status=400,
            )

        try:
            response = requests.post(
                webhook_url,
                json={"content": message},
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException as e:
            return JsonResponse(
                {
                    "status": "error",
                    "message": f"Discord webhook 發送失敗: {str(e)}",
                },
                status=502,
            )

        return JsonResponse(
            {
                "status": "success",
                "message": "已送出 Discord 通知",
            },
            status=200,
        )