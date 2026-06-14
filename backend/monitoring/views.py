import logging
from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.utils import timezone
from .checks import run_all_checks

logger = logging.getLogger(__name__)

def health_check(request):
    overall_status, checks = run_all_checks()

    if overall_status == "degraded":
        http_status = 503
        logger.warning(f"健康檢查狀態異常 (Degraded)! 詳細檢測結果: {checks}")
    else:
        http_status = 200

    return JsonResponse(
        {
            "status": overall_status,
            "timestamp": timezone.now().isoformat(),
            "checks": checks,
        },
        status=http_status,
    )