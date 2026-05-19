from rest_framework import serializers
from .models import WifiMeasurement

class WifiMeasurementSerializer(serializers.ModelSerializer):
    point_id = serializers.CharField(required=False, allow_blank=True)
    rssi = serializers.IntegerField(required=False, allow_null=True)
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
            "ssid",
            "bssid",
            "channel",
            "rssi",
            "rx_rate",
            "tx_rate",
            "download_mbps",
            "metric_type",
            "measured_at",
        ]

    def validate(self, attrs):
        metric_type = attrs.get("metric_type", "rssi")

        if metric_type == "rssi":
            if attrs.get("rssi") is None:
                raise serializers.ValidationError({
                    "rssi": "RSSI 測量資料必須提供 rssi。"
                })

        if metric_type == "speed":
            if attrs.get("download_mbps") is None:
                raise serializers.ValidationError({
                    "download_mbps": "測速資料必須提供 download_mbps。"
                })

        return attrs