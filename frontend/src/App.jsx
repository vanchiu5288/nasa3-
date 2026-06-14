import React, { useState, useEffect } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import AutomaticHeatmap from "./pages/AutomaticHeatmap";
import ManualSpeedTest from "./pages/ManualSpeedTest";
import MeasurementRecords from "./pages/MeasurementRecords";
import SignalDotMap from "./pages/SignalDotMap";
import Login from "./pages/Login"; // 確保你有引入 Login 元件！

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 1. 初始狀態：檢查 localStorage 中是否已經有 token
  // 如果有 token，就當作已經登入 (這可以讓使用者按 F5 重新整理時不會被踢出)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // 2. 登入處理函式 (傳給 Login 元件使用)
  const handleLogin = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "登入失敗");
      }
      
      // 登入成功：儲存 token 並更新狀態
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
    } catch (err) {
      throw err; // 將錯誤丟回給 Login 元件去顯示
    }
  };

  // 3. 登出處理函式
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "flex-start",
    padding: "12px",
    color: isActive ? "#fff" : "#cbd5e1",
    backgroundColor: isActive ? "#0284c7" : "transparent",
    textDecoration: "none",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
    overflow: "hidden",
  });

  // ==========================================
  // 【關鍵邏輯】如果尚未登入，只顯示登入頁面
  // ==========================================
  if (!isAuthenticated) {
    // 這裡我們直接回傳 Login 元件，不渲染外層的 nav 和 main
    // 這樣使用者就完全看不到側邊欄或任何其他路由了
    return <Login onLogin={handleLogin} />;
  }

  // ==========================================
  // 如果已經登入，顯示完整的系統介面 (包含選單與路由)
  // ==========================================
  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      <nav
        style={{
          width: isCollapsed ? "70px" : "260px",
          backgroundColor: "#1e293b",
          borderRight: "1px solid #334155",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          padding: "15px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "0 15px",
            marginBottom: "30px",
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "20px",
              padding: "5px",
              borderRadius: "4px",
            }}
            title={isCollapsed ? "展開選單" : "收合選單"}
          >
            {isCollapsed ? "☰" : "◀"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "0 10px",
          }}
        >
          <NavLink to="/" end style={navLinkStyle}>
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>📊</span>
            {!isCollapsed && <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>系統 AP 熱力圖</span>}
          </NavLink>

          <NavLink to="/dot-map" style={navLinkStyle}>
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>🟢</span>
            {!isCollapsed && <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>AP 連線紀錄點狀圖</span>}
          </NavLink>

          <NavLink to="/records" style={navLinkStyle}>
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>🧾</span>
            {!isCollapsed && <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>資料紀錄</span>}
          </NavLink>
        </div>

        {/* ========================================== */}
        {/* 新增：側邊欄底部的登出按鈕 */}
        {/* ========================================== */}
        <div style={{ marginTop: "auto", padding: "0 10px" }}>
           <button 
             onClick={handleLogout}
             style={{
               width: "100%",
               padding: "12px",
               background: "transparent",
               border: "1px solid rgba(255, 255, 255, 0.3)",
               color: "#f6f6f6",
               borderRadius: "8px",
               cursor: "pointer",
               fontWeight: "bold",
               transition: "all 0.2s"
             }}
           >
             {isCollapsed ? "🚪" : "登出"}
           </button>
        </div>
      </nav>

      <main style={{ flex: 1, position: "relative", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<AutomaticHeatmap />} />
          <Route path="/records" element={<MeasurementRecords />} />
          <Route path="/dot-map" element={<SignalDotMap />} />
          <Route path="/manual-test" element={<ManualSpeedTest />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}