import json
import logging
import requests

from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .services import authenticate_user_hybrid, generate_jwt_token


logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    """
    提供 /api/login/ 端點，接收 JSON 格式的 username 與 password
    """

    def post(self, request, *args, **kwargs):
        try:
            try:
                data = json.loads(request.body)
                username = data.get("username")
                password = data.get("password")
            except json.JSONDecodeError:
                logger.warning("登入請求失敗：收到無效的 JSON 格式 Payload")
                return JsonResponse(
                    {"status": "error", "message": "無效的 JSON 格式"},
                    status=400,
                )

            if not username or not password:
                logger.warning("登入請求失敗：前端未提供帳號或密碼")
                return JsonResponse(
                    {"status": "error", "message": "請提供帳號與密碼"},
                    status=400,
                )

            # 1. 呼叫 LDAP / hybrid 驗證服務
            success, result = authenticate_user_hybrid(username, password)

            if not success:
                logger.warning(
                    f"登入遭拒：嘗試登入帳號 [{username}] 失敗，原因: {result}"
                )
                return JsonResponse(
                    {"status": "error", "message": result},
                    status=401,
                )

            # 2. 驗證成功
            user_info = result
            token = generate_jwt_token(user_info)

            # 3. 成功配發 Token
            logger.info(f"使用者登入成功，核發 JWT Token: [{username}]")
            return JsonResponse(
                {
                    "status": "success",
                    "message": "登入成功",
                    "token": token,
                    "user": user_info,
                },
                status=200,
            )

        except Exception:
            username_log = locals().get("username", "未知帳號")
            logger.exception(
                f"登入 API 發生內部系統錯誤，嘗試登入帳號: {username_log}"
            )
            return JsonResponse(
                {
                    "status": "error",
                    "message": "內部系統錯誤，請聯繫管理員",
                },
                status=500,
            )


@method_decorator(csrf_exempt, name="dispatch")
class DiscordWebhookView(View):
    """
    提供 /api/discord-webhook/ 端點。

    前端只打這個 API，不直接碰 Discord webhook URL。
    真正的 webhook URL 放在 backend/.env.local 的 DISCORD_WEBHOOK_URL。
    """

    def post(self, request, *args, **kwargs):
        webhook_url = getattr(settings, "DISCORD_WEBHOOK_URL", "")

        if not webhook_url:
            logger.error("Discord webhook 發送失敗：尚未設定 DISCORD_WEBHOOK_URL")
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
            logger.warning("Discord webhook 請求失敗：無效的 JSON 格式")
            return JsonResponse(
                {"status": "error", "message": "無效的 JSON 格式"},
                status=400,
            )

        message = data.get("message") or data.get("content")

        if not message:
            logger.warning("Discord webhook 請求失敗：缺少 message/content")
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
            logger.exception("Discord webhook 發送失敗")
            return JsonResponse(
                {
                    "status": "error",
                    "message": f"Discord webhook 發送失敗: {str(e)}",
                },
                status=502,
            )

        logger.info("Discord webhook 通知已送出")
        return JsonResponse(
            {
                "status": "success",
                "message": "已送出 Discord 通知",
            },
            status=200,
        )