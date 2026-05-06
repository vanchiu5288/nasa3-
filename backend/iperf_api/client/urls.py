from django.urls import path
from .views import RunSpeedTestView, HttpSpeedTestView

urlpatterns = [
    # 當外部 POST /api/iperf/run/ 時，交給 RunSpeedTestView 處理
    path('run/', RunSpeedTestView.as_view(), name='run-iperf'),
    path('download/', HttpSpeedTestView.as_view(), name='speedtest-download'),
]