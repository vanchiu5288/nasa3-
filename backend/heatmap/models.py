from django.db import models


class WifiMeasurement(models.Model):
    FLOOR_CHOICES = [
        ("basement", "地下室"),
        ("floor1", "一樓"),
        ("floor2", "二樓"),
        ("floor3", "三樓"),
        ("floor4", "四樓"),
        ("floor5", "五樓"),
        ("floor6", "六樓"),
    ]

    floor = models.CharField(
        max_length=32,
        choices=FLOOR_CHOICES,
        default="basement",
    )

    # 使用者點的測量點，例如 basement-001；可以讓後端自動產生，所以建議可空
    point_id = models.CharField(max_length=64, blank=True, null=True)

    # 使用者在平面圖上點的位置，建議存百分比座標 0~100
    x = models.FloatField()
    y = models.FloatField()

    note = models.CharField(max_length=255, blank=True, null=True)

    # 使用者輸入的查詢關鍵字：hostname / IP / MAC
    keyword = models.CharField(max_length=255, blank=True, null=True)

    # vSZ monitor 讀到的 client 資訊
    username = models.CharField(max_length=255, blank=True, null=True)
    hostname = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.CharField(max_length=100, blank=True, null=True)
    client_mac = models.CharField(max_length=64, blank=True, null=True)

    # Wi-Fi / AP 資訊
    ssid = models.CharField(max_length=128, blank=True, null=True)

    # bssid 通常可視為該 client 連上的 AP radio MAC
    bssid = models.CharField(max_length=64, blank=True, null=True)

    # 為了語意清楚，也另外存 ap_name / ap_mac
    ap_name = models.CharField(max_length=128, blank=True, null=True)
    ap_mac = models.CharField(max_length=64, blank=True, null=True)

    channel = models.IntegerField(blank=True, null=True)
    radio_type = models.CharField(max_length=64, blank=True, null=True)

    # 訊號資料
    rssi = models.FloatField(null=True, blank=True)
    snr = models.FloatField(null=True, blank=True)

    # 速率資料
    rx_rate = models.FloatField(blank=True, null=True)
    tx_rate = models.FloatField(blank=True, null=True)

    # 額外測速資料，如果你之後有自己跑 speedtest 或 iperf，可以放這裡
    download_mbps = models.FloatField(null=True, blank=True)

    # 目前這筆資料主要用哪種 metric 畫熱力圖
    metric_type = models.CharField(max_length=20, default="rssi")

    measured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-measured_at"]

    def __str__(self):
        name = self.hostname or self.keyword or self.point_id or "unknown"
        return f"{self.floor} | {name} | ({self.x:.2f}, {self.y:.2f}) | {self.rssi} dBm"