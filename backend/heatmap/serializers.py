from rest_framework import serializers
from .models import WifiMeasurement


class WifiMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WifiMeasurement
        fields = [
            "id",
            "floor",
            "point_id",
            "x",
            "y",
            "note",
            "ssid",
            "bssid",
            "channel",
            "rssi",
            "rx_rate",
            "tx_rate",
            "measured_at",
        ]