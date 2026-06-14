import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .services import authenticate_via_ldap, generate_jwt_token

# 因為是 API 端點，通常需要關閉 CSRF 檢查（由 JWT 來負責安全驗證）
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    """
    提供 /api/login 端點，接收 JSON 格式的 username 與 password
    """
    def post(self, request, *args, **kwargs):
        try:
            # 解析前端傳入的 JSON Payload
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "無效的 JSON 格式"}, status=400)
            
        # 欄位檢查
        if not username or not password:
            return JsonResponse({"status": "error", "message": "請提供帳號與密碼"}, status=400)
            
        # 1. 呼叫 LDAP 驗證服務
        success, result = authenticate_via_ldap(username, password)
        
        if not success:
            # 驗證失敗，回傳 401 Unauthorized 錯誤訊息 (如密碼錯誤或無法連線)
            return JsonResponse({"status": "error", "message": result}, status=401)
            
        # 2. 驗證成功，此時 result 為 user_info 字典，接著核發 JWT Token
        user_info = result
        token = generate_jwt_token(user_info)
        
        # 3. 回傳成功的 Response 給前端
        return JsonResponse({
            "status": "success",
            "message": "登入成功",
            "token": token,
            "user": user_info
        }, status=200)