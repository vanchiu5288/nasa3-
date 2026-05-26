import time

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import WifiMeasurement
from .serializers import WifiMeasurementSerializer
from .vsz_client import find_wireless_client


def rssi_to_heat_value(rssi):
    if rssi is None:
        return 0.0

    rssi = float(rssi)

    if rssi >= -35:
        return 1.0
    if rssi >= -45:
        return 0.85
    if rssi >= -55:
        return 0.65
    if rssi >= -65:
        return 0.45
    if rssi >= -75:
        return 0.25
    if rssi >= -85:
        return 0.10
    return 0.03


def snr_to_heat_value(snr):
    if snr is None:
        return 0.0

    snr = float(snr)

    value = snr / 45.0

    if value > 1.0:
        return 1.0

    if value < 0.03:
        return 0.03

    return round(value, 4)


def speed_to_heat_value(download_mbps):
    if download_mbps is None:
        return 0.0

    value = float(download_mbps) / 300.0

    if value > 1.0:
        return 1.0

    if value < 0.03:
        return 0.03

    return round(value, 4)


@api_view(["POST"])
def create_measurement(request):
    data = request.data.copy()

    floor = data.get("floor", "basement")
    x = data.get("x")
    y = data.get("y")
    metric_type = data.get("metric_type", "rssi")

    if x is None or y is None:
        return Response(
            {
                "message": "invalid data",
                "errors": {
                    "x": "x is required",
                    "y": "y is required",
                },
            },
            status=400,
        )

    try:
        x = float(x)
        y = float(y)
    except ValueError:
        return Response(
            {
                "message": "invalid data",
                "errors": {
                    "coordinate": "x and y must be numbers",
                },
            },
            status=400,
        )

    if not (0 <= x <= 100 and 0 <= y <= 100):
        return Response(
            {
                "message": "invalid data",
                "errors": {
                    "coordinate": "x and y must be between 0 and 100",
                },
            },
            status=400,
        )

    if not data.get("point_id"):
        data["point_id"] = f"{metric_type}-{floor}-{int(time.time() * 1000)}"

    data["floor"] = floor
    data["x"] = x
    data["y"] = y
    data["metric_type"] = metric_type

    # =========================
    # Case 1: 手動測速資料
    # 不需要查 vSZ
    # =========================
    if metric_type == "speed":
        if data.get("download_mbps") is None:
            return Response(
                {
                    "message": "invalid data",
                    "errors": {
                        "download_mbps": "speed measurement requires download_mbps",
                    },
                },
                status=400,
            )

        serializer = WifiMeasurementSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "created",
                    "data": serializer.data,
                },
                status=201,
            )

        return Response(
            {
                "message": "invalid data",
                "errors": serializer.errors,
            },
            status=400,
        )

    # =========================
    # Case 2: RSSI / SNR 熱力圖資料
    # 需要查 vSZ
    # =========================
    keyword = data.get("keyword") or data.get("hostname")

    if not keyword:
        return Response(
            {
                "message": "invalid data",
                "errors": {
                    "keyword": "RSSI measurement requires hostname / IP / MAC.",
                },
            },
            status=400,
        )

    try:
        client = find_wireless_client(keyword)
    except Exception as e:
        return Response(
            {
                "message": "vSZ query failed",
                "error": "查詢 vSZ monitor 失敗，請確認 SSH tunnel / VPN / cookie / endpoint。",
                "detail": str(e),
            },
            status=502,
        )

    if client is None:
        return Response(
            {
                "message": "client not found",
                "error": "vSZ monitor 找不到這台裝置。請確認已連上 Wi-Fi，或改用 IP / MAC 查詢。",
                "keyword": keyword,
            },
            status=404,
        )

    data["keyword"] = keyword

    data["username"] = client.get("username")
    data["hostname"] = client.get("hostname") or keyword
    data["ip_address"] = client.get("ip_address")
    data["client_mac"] = client.get("client_mac")

    data["ssid"] = client.get("ssid")
    data["bssid"] = client.get("bssid")
    data["ap_name"] = client.get("ap_name")
    data["ap_mac"] = client.get("ap_mac")

    data["channel"] = client.get("channel")
    data["radio_type"] = client.get("radio_type")

    data["rssi"] = client.get("rssi")
    data["snr"] = client.get("snr")

    data["rx_rate"] = client.get("rx_rate")
    data["tx_rate"] = client.get("tx_rate")

    serializer = WifiMeasurementSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "created",
                "data": serializer.data,
            },
            status=201,
        )

    return Response(
        {
            "message": "invalid data",
            "errors": serializer.errors,
        },
        status=400,
    )


@api_view(["GET"])
def measurement_list(request):
    measurements = WifiMeasurement.objects.all()

    floor = request.GET.get("floor")
    ssid = request.GET.get("ssid")
    bssid = request.GET.get("bssid")
    metric = request.GET.get("metric")
    keyword = request.GET.get("keyword")
    limit = request.GET.get("limit", 500)

    if floor:
        measurements = measurements.filter(floor=floor)

    if ssid:
        measurements = measurements.filter(ssid=ssid)

    if bssid:
        measurements = measurements.filter(bssid=bssid)

    if metric:
        measurements = measurements.filter(metric_type=metric)

    if keyword:
        measurements = measurements.filter(keyword__icontains=keyword)

    try:
        limit = int(limit)
    except ValueError:
        limit = 500

    if limit <= 0:
        limit = 500

    if limit > 2000:
        limit = 2000

    measurements = measurements[:limit]
    serializer = WifiMeasurementSerializer(measurements, many=True)

    return Response(
        {
            "count": len(serializer.data),
            "data": serializer.data,
        }
    )


@api_view(["GET"])
def heatmap_data(request):
    measurements = WifiMeasurement.objects.all()

    floor = request.GET.get("floor")
    ssid = request.GET.get("ssid")
    bssid = request.GET.get("bssid")
    metric = request.GET.get("metric", "rssi")
    min_rssi = request.GET.get("min_rssi")
    max_rssi = request.GET.get("max_rssi")
    limit = request.GET.get("limit", 5000)

    if floor:
        measurements = measurements.filter(floor=floor)

    if ssid:
        measurements = measurements.filter(ssid=ssid)

    if bssid:
        measurements = measurements.filter(bssid=bssid)

    if metric == "speed":
        measurements = measurements.filter(
            metric_type="speed",
            download_mbps__isnull=False,
        )

    elif metric == "snr":
        measurements = measurements.filter(
            snr__isnull=False,
        )

    else:
        measurements = measurements.filter(
            rssi__isnull=False,
        )

        if min_rssi:
            try:
                measurements = measurements.filter(rssi__gte=float(min_rssi))
            except ValueError:
                pass

        if max_rssi:
            try:
                measurements = measurements.filter(rssi__lte=float(max_rssi))
            except ValueError:
                pass

    try:
        limit = int(limit)
    except ValueError:
        limit = 5000

    if limit <= 0:
        limit = 5000

    if limit > 10000:
        limit = 10000

    measurements = measurements[:limit]

    data = []

    for item in measurements:
        if metric == "speed":
            value = speed_to_heat_value(item.download_mbps)
            raw_value = item.download_mbps

        elif metric == "snr":
            value = snr_to_heat_value(item.snr)
            raw_value = item.snr

        else:
            value = round(rssi_to_heat_value(item.rssi), 4)
            raw_value = item.rssi

        data.append(
            {
                "id": item.id,
                "floor": item.floor,
                "x": item.x,
                "y": item.y,

                "value": value,
                "raw_value": raw_value,
                "metric_type": item.metric_type,

                "point_id": item.point_id,
                "note": item.note,

                "keyword": item.keyword,
                "hostname": item.hostname,
                "username": item.username,
                "ip_address": item.ip_address,
                "client_mac": item.client_mac,

                "ssid": item.ssid,
                "bssid": item.bssid,
                "ap_name": item.ap_name,
                "ap_mac": item.ap_mac,

                "channel": item.channel,
                "radio_type": item.radio_type,

                "rssi": item.rssi,
                "snr": item.snr,
                "rx_rate": item.rx_rate,
                "tx_rate": item.tx_rate,
                "download_mbps": item.download_mbps,

                "measured_at": item.measured_at.isoformat(),
            }
        )

    return Response(
        {
            "count": len(data),
            "metric": metric,
            "coordinate": "xy-percent",
            "floor": floor,
            "ssid": ssid,
            "data": data,
        }
    )
    
@api_view(["DELETE"])
def delete_measurement(request, measurement_id):
    try:
        measurement = WifiMeasurement.objects.get(id=measurement_id)
    except WifiMeasurement.DoesNotExist:
        return Response(
            {
                "message": "not found",
                "error": f"Measurement id={measurement_id} 不存在。",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    measurement.delete()

    return Response(
        {
            "message": "deleted",
            "id": measurement_id,
        },
        status=status.HTTP_200_OK,
    )