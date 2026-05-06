import subprocess
import json
import logging

logger = logging.getLogger(__name__)

def execute_iperf_test(target_ip, duration=5):
    """
    呼叫系統底層的 iperf3 進行測速，並解析 JSON 輸出。
    """
    try:
        # 組合 Linux 指令: iperf3 -c <ip> -t 5 -J (輸出 JSON 格式)
        cmd = ['iperf3', '-c', str(target_ip), '-t', str(duration), '-J']
        
        # 執行指令。設定 timeout 避免目標機器無回應導致 API 卡死
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=duration + 5)

        # 檢查指令是否執行失敗 (例如目標沒有開啟 iperf3 -s)
        if result.returncode != 0:
            logger.error(f"iperf3 執行失敗: {result.stderr}")
            return {
                "success": False, 
                "error": "連線失敗。請確認目標 IP 正確，且已執行 'iperf3 -s'。"
            }

        # 解析 iperf3 吐出來的 JSON
        raw_data = json.loads(result.stdout)

        # 從 JSON 樹狀結構中挖出接收端的 bits_per_second
        bps = raw_data['end']['sum_received']['bits_per_second']
        
        # 轉換成 Mbps (Megabits per second) 並取小數點後兩位
        mbps = round(bps / 1_000_000, 2)

        return {
            "success": True,
            "target_ip": target_ip,
            "download_mbps": mbps
        }

    except subprocess.TimeoutExpired:
        return {"success": False, "error": "測速連線逾時，目標機器未回應。"}
    except Exception as e:
        logger.error(f"解析 iperf3 結果時發生未預期錯誤: {e}")
        return {"success": False, "error": "系統發生未預期錯誤。"}