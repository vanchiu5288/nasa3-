from rest_framework import serializers

class IperfRequestSerializer(serializers.Serializer):
    # 強制規定必須傳入 target_ip，且必須是合法的 IPv4 或 IPv6 格式
    target_ip = serializers.IPAddressField(
        help_text="請輸入目標設備的 IP 位址（該設備需運行 iperf3 -s）"
    )
    # 你也可以擴充測量時間，並給予預設值 (5秒)
    duration = serializers.IntegerField(default=5, min_value=1, max_value=30)