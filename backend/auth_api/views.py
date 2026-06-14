import json
import logging
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .services import authenticate_user_hybrid, generate_jwt_token

logger = logging.getLogger(__name__)

# 因為是 API 端點，通常需要關閉 CSRF 檢查（由 JWT 來負責安全驗證）
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    """
    提供 /api/login 端點，接收 JSON 格式的 username 與 password
    """
    def post(self, request, *args, **kwargs):
        try:
            try:
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
            except json.JSONDecodeError:
                logger.warning("登入請求失敗：收到無效的 JSON 格式 Payload")
                return JsonResponse({"status": "error", "message": "無效的 JSON 格式"}, status=400)
                
            if not username or not password:
                logger.warning("登入請求失敗：前端未提供帳號或密碼")
                return JsonResponse({"status": "error", "message": "請提供帳號與密碼"}, status=400)
                
            # 1. 呼叫 LDAP 驗證服務
            success, result = authenticate_user_hybrid(username, password)
            
            if not success:
                logger.warning(f"登入遭拒 (API 層次): 嘗試登入帳號 [{username}] 失敗，原因: {result}")
                return JsonResponse({"status": "error", "message": result}, status=401)
                
            # 2. 驗證成功
            user_info = result
            token = generate_jwt_token(user_info)
            
            # 3. 成功配發 Token
            logger.info(f"使用者登入成功，核發 JWT Token: [{username}]")
            return JsonResponse({
                "status": "success",
                "message": "登入成功",
                "token": token,
                "user": user_info
            }, status=200)
            
        except Exception as e:
            # 捕捉任何其他未預期的例外狀況，例如伺服器記憶體不足、Redis 斷線等
            username_log = locals().get('username', '未知帳號')
            logger.exception(f"登入 API 發生內部系統嚴重錯誤 (嘗試登入帳號: {username_log})")
            return JsonResponse({"status": "error", "message": "內部系統錯誤，請聯繫管理員"}, status=500)