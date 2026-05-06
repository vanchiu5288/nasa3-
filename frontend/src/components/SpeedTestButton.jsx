import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function SpeedTestButton({ onTestComplete }) {
  const [loading, setLoading] = useState(false);
  const [speedResult, setSpeedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSpeedTest = async () => {
    setLoading(true);
    setSpeedResult(null);
    setErrorMsg('');

    try {
      // 1. 記錄開始時間
      const startTime = performance.now();
      
      // 2. 向 Django 請求下載測速檔案 
      // 加上 ?t=時間戳記 是為了再次確保瀏覽器絕對不會拿快取的檔案來騙我們
      const response = await fetch(`${API_BASE_URL}/api/iperf/download/?t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error('Server Error');
      }

      // 3. 把資料載入到記憶體中 (這段期間就是在吃使用者的實際網速)
      const blob = await response.blob();
      
      // 4. 記錄結束時間
      const endTime = performance.now();

      // 5. 計算速度
      const durationInSeconds = (endTime - startTime) / 1000;
      
      // 取得下載的位元組大小 (Bytes)，轉為 Bits (1 Byte = 8 Bits)
      const bitsLoaded = blob.size * 8; 
      
      // 計算 bps (Bits per second) 接著轉換為 Mbps (Megabits per second)
      const speedBps = bitsLoaded / durationInSeconds;
      const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

      setSpeedResult(speedMbps);
      
      if (onTestComplete) {
        onTestComplete(speedMbps);
      }

    } catch (error) {
      console.error(error);
      setErrorMsg('Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '300px' }}>
      <h3>Speed Test</h3>
      
      <button 
        onClick={handleSpeedTest} 
        disabled={loading}
        style={{ padding: '10px', backgroundColor: '#66a6eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Loading...' : 'Start'}
      </button>

      <div style={{ marginTop: '15px' }}>
        {speedResult && (
          <p style={{ color: '#34d752', fontWeight: 'bold' }}>
            下載速度: {speedResult} Mbps
          </p>
        )}
        {errorMsg && (
          <p style={{ color: '#da3e3e' }}>
            錯誤: {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SpeedTestButton;

/*
function SpeedTestButton({ onTestComplete }) {
  // 準備狀態 (State) 來存放畫面需要的資訊
  const [loading, setLoading] = useState(false);
  const [speedResult, setSpeedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 當使用者點擊按鈕時觸發的函式
  const handleSpeedTest = async () => {
    setLoading(true);
    setSpeedResult(null);
    setErrorMsg('');

    try {
      // 1. 向 Django API 發射 POST 請求
      const response = await fetch('http://127.0.0.1:8000/api/iperf/run/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 這是我們要傳給後端的資料 (跟你用 curl 打的 -d 一樣)
        body: JSON.stringify({ 
          target_ip: '127.0.0.1', // 測試階段先打自己
          duration: 3 
        }),
      });

      // 2. 把 Django 回傳的 JSON 解析出來
      const data = await response.json();

      // 3. 判斷 API 是否成功
      if (response.ok && data.success) {
        setSpeedResult(data.download_mbps); 
        if (onTestComplete) {
          onTestComplete(data.download_mbps); 
        }
      } else {
        setErrorMsg(data.error || 'Speedtest failed.');
      }

    } catch (error) {
      setErrorMsg('Failed to connect to server.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '300px' }}>
      <h3>Speed Test</h3>
      
      
      <button 
        onClick={handleSpeedTest} 
        disabled={loading}
        style={{ padding: '10px', backgroundColor: '#66a6eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Loading...' : 'Start'}
      </button>

      
      <div style={{ marginTop: '15px' }}>
        {speedResult && (
          <p style={{ color: '#34d752', fontWeight: 'bold' }}>
            下載速度: {speedResult} Mbps
          </p>
        )}
        {errorMsg && (
          <p style={{ color: '#da3e3e' }}>
            錯誤: {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SpeedTestButton;
*/