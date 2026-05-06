from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import IperfRequestSerializer
from .services import execute_iperf_test
import os
from django.http import HttpResponse
from rest_framework.views import APIView

class RunSpeedTestView(APIView):

    def post(self, request):
        # 1. 驗證資料
        serializer = IperfRequestSerializer(data=request.data)
        if not serializer.is_valid():
            # 資料有誤 (例如亂填 IP)，退回 HTTP 400
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        target_ip = serializer.validated_data['target_ip']
        duration = serializer.validated_data.get('duration', 5)

        # 2. 呼叫底層執行測速
        test_result = execute_iperf_test(target_ip, duration)

        # 3. 判斷成功與否並回傳
        if test_result.get('success'):
            return Response(test_result, status=status.HTTP_200_OK)
        else:
            # 測試失敗 (例如目標沒開 iperf)，回傳 HTTP 503
            return Response(test_result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
class HttpSpeedTestView(APIView):

    def get(self, request):
        file_size = 100 * 1024 * 1024 
        dummy_data = os.urandom(file_size)
        
        response = HttpResponse(dummy_data, content_type='application/octet-stream')
        # 極度重要：禁止瀏覽器快取這個檔案，否則第二次測速會瞬間完成（因為根本沒走網路）
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response