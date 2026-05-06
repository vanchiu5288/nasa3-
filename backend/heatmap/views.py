from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import WifiMeasurement
from .serializers import WifiMeasurementSerializer


def rssi_to_heat_value(rssi):
    """
    RSSI 轉 heatmap value。
    數值越大代表訊號越好。
    """
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


@api_view(["POST"])
def create_measurement(request):
    """
    POST /api/heatmap/measurements/create/

    新增一筆 Wi-Fi 測量資料。
    """

    serializer = WifiMeasurementSerializer(data=request.data)

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
    """
    GET /api/heatmap/measurements/
    GET /api/heatmap/measurements/?floor=basement
    GET /api/heatmap/measurements/?floor=floor1
    """

    measurements = WifiMeasurement.objects.all()

    floor = request.GET.get("floor")
    ssid = request.GET.get("ssid")
    bssid = request.GET.get("bssid")
    limit = request.GET.get("limit", 500)

    if floor:
        measurements = measurements.filter(floor=floor)

    if ssid:
        measurements = measurements.filter(ssid=ssid)

    if bssid:
        measurements = measurements.filter(bssid=bssid)

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
    """
    GET /api/heatmap/
    GET /api/heatmap/?floor=basement
    GET /api/heatmap/?floor=floor1

    回傳給前端 leaflet.heat 使用的資料。
    """

    measurements = WifiMeasurement.objects.all()

    floor = request.GET.get("floor")
    ssid = request.GET.get("ssid")
    bssid = request.GET.get("bssid")
    min_rssi = request.GET.get("min_rssi")
    max_rssi = request.GET.get("max_rssi")
    limit = request.GET.get("limit", 5000)

    if floor:
        measurements = measurements.filter(floor=floor)

    if ssid:
        measurements = measurements.filter(ssid=ssid)

    if bssid:
        measurements = measurements.filter(bssid=bssid)

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
        data.append(
            {
                "id": item.id,
                "floor": item.floor,
                "x": item.x,
                "y": item.y,
                "value": round(rssi_to_heat_value(item.rssi), 4),
                "rssi": item.rssi,
                "point_id": item.point_id,
                "note": item.note,
                "ssid": item.ssid,
                "bssid": item.bssid,
                "channel": item.channel,
                "rx_rate": item.rx_rate,
                "tx_rate": item.tx_rate,
                "measured_at": item.measured_at.isoformat(),
            }
        )

    return Response(
        {
            "count": len(data),
            "metric": "rssi",
            "coordinate": "xy-percent",
            "floor": floor,
            "data": data,
        }
    )