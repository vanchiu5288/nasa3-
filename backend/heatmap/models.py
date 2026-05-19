from django.db import models


class WifiMeasurement(models.Model):
    FLOOR_CHOICES = [
        ("basement", "地下室"),
        ("floor1", "一樓"),
    ]

    floor = models.CharField(
        max_length=32,
        choices=FLOOR_CHOICES,
        default="basement",
    )

    point_id = models.CharField(max_length=64)

    x = models.FloatField()
    y = models.FloatField()

    note = models.CharField(max_length=255, blank=True, null=True)

    ssid = models.CharField(max_length=128, blank=True, null=True)
    bssid = models.CharField(max_length=32, blank=True, null=True)

    channel = models.IntegerField(blank=True, null=True)

    rssi = models.FloatField(null=True, blank=True)
    rx_rate = models.FloatField(blank=True, null=True)
    tx_rate = models.FloatField(blank=True, null=True)
    
    download_mbps = models.FloatField(null=True, blank=True)
    metric_type = models.CharField(max_length=20, default="rssi")
    
    measured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-measured_at"]

    def __str__(self):
        return f"{self.floor} | {self.point_id} | ({self.x}, {self.y}) | {self.rssi} dBm"