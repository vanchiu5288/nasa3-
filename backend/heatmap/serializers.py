from rest_framework import serializers
from .models import WifiMeasurement


class WifiMeasurementSerializer(serializers.ModelSerializer):
    point_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    keyword = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    hostname = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ip_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    client_mac = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    ssid = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bssid = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ap_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ap_mac = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    channel = serializers.IntegerField(required=False, allow_null=True)
    radio_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    rssi = serializers.FloatField(required=False, allow_null=True)
    snr = serializers.FloatField(required=False, allow_null=True)

    rx_rate = serializers.FloatField(required=False, allow_null=True)
    tx_rate = serializers.FloatField(required=False, allow_null=True)
    download_mbps = serializers.FloatField(required=False, allow_null=True)

    metric_type = serializers.CharField(required=False, default="rssi")

    class Meta:
        model = WifiMeasurement
        fields = [
            "id",

            "point_id",
            "floor",
            "x",
            "y",
            "note",

            "keyword",

            "username",
            "hostname",
            "ip_address",
            "client_mac",

            "ssid",
            "bssid",
            "ap_name",
            "ap_mac",

            "channel",
            "radio_type",

            "rssi",
            "snr",

            "rx_rate",
            "tx_rate",
            "download_mbps",

            "metric_type",
            "measured_at",
        ]

        read_only_fields = [
            "id",
            "measured_at",
        ]

    def validate(self, attrs):
        x = attrs.get("x")
        y = attrs.get("y")

        if x is not None and not (0 <= x <= 100):
            raise serializers.ValidationError({
                "x": "x 必須是 0 到 100 之間的百分比座標。"
            })

        if y is not None and not (0 <= y <= 100):
            raise serializers.ValidationError({
                "y": "y 必須是 0 到 100 之間的百分比座標。"
            })

        metric_type = attrs.get("metric_type", "rssi")

        allowed_metric_types = ["rssi", "snr", "speed"]
        if metric_type not in allowed_metric_types:
            raise serializers.ValidationError({
                "metric_type": f"metric_type 只能是 {allowed_metric_types}。"
            })

        return attrs