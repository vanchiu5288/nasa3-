import json
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch

class LoginAPITestCase(TestCase):
    def setUp(self):
        # 建立測試用的 Client，用來發送 HTTP 請求
        self.client = Client()
        # 取得登入 API 的 URL 路徑 (對應到 urls.py 裡的 name='ldap_login')
        self.login_url = reverse('ldap_login')
        
        # 定義正確與錯誤的測試資料
        self.valid_payload = {
            "username": "b11902991",
            "password": "b11902991"
        }
        self.invalid_payload = {
            "username": "b11902991",
            "password": "wrongpassword"
        }
        
        # 模擬 LDAP 回傳的使用者資訊
        self.mock_user_info = {
            "username": "b11902991",
            "gid": 450
        }

    # 1. 測試成功登入的情境
    @patch('auth_api.views.authenticate_via_ldap')
    def test_login_success(self, mock_authenticate):
        # 設定 mock 函式的回傳值：(是否成功, 使用者資訊)
        mock_authenticate.return_value = (True, self.mock_user_info)
        
        # 發送 POST 請求
        response = self.client.post(
            self.login_url,
            data=json.dumps(self.valid_payload),
            content_type='application/json'
        )
        
        # 驗證結果
        self.assertEqual(response.status_code, 200)
        
        response_data = response.json()
        self.assertEqual(response_data['status'], 'success')
        self.assertEqual(response_data['message'], '登入成功')
        self.assertIn('token', response_data)  # 檢查是否有核發 token
        self.assertEqual(response_data['user']['username'], 'b11902991')

    # 2. 測試密碼錯誤的情境
    @patch('auth_api.views.authenticate_via_ldap')
    def test_login_wrong_password(self, mock_authenticate):
        # 設定 mock 函式的回傳值：(是否成功, 錯誤訊息)
        mock_authenticate.return_value = (False, "帳號或密碼錯誤")
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(self.invalid_payload),
            content_type='application/json'
        )
        
        # 驗證結果
        self.assertEqual(response.status_code, 401)
        
        response_data = response.json()
        self.assertEqual(response_data['status'], 'error')
        self.assertEqual(response_data['message'], '帳號或密碼錯誤')

    # 3. 測試缺少必填欄位的情境
    def test_login_missing_fields(self):
        # 故意不給 password
        incomplete_payload = {"username": "b11902991"}
        
        response = self.client.post(
            self.login_url,
            data=json.dumps(incomplete_payload),
            content_type='application/json'
        )
        
        # 驗證結果
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], '請提供帳號與密碼')

    # 4. 測試非 JSON 格式的情境
    def test_login_invalid_json(self):
        response = self.client.post(
            self.login_url,
            data="this is not a json string",
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], '無效的 JSON 格式')