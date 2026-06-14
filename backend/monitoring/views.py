from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.utils import timezone
from .checks import run_all_checks


def health_check(request):
    overall_status, checks = run_all_checks()

    http_status = 503 if overall_status == "degraded" else 200

    return JsonResponse(
        {
            "status": overall_status,
            "timestamp": timezone.now().isoformat(),
            "checks": checks,
        },
        status=http_status,
    )