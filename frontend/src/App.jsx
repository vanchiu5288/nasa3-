import React, { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import AutomaticHeatmap from "./pages/AutomaticHeatmap";
import ManualSpeedTest from "./pages/ManualSpeedTest";
import MeasurementRecords from "./pages/MeasurementRecords";

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>
              📊
            </span>
            {!isCollapsed && (
              <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>
                系統 AP 熱力圖
              </span>
            )}
          </NavLink>

          <NavLink to="/manual-test" style={navLinkStyle}>
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>
              📍
            </span>
            {!isCollapsed && (
              <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>
                手動測速地圖
              </span>
            )}
          </NavLink>
          <NavLink to="/records" style={navLinkStyle}>
            <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>
              🧾
            </span>
            {!isCollapsed && (
              <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: "bold" }}>
                資料紀錄
              </span>
            )}
          </NavLink>
        </div>
      </nav>

      <main style={{ flex: 1, position: "relative", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<AutomaticHeatmap />} />
          <Route path="/manual-test" element={<ManualSpeedTest />} />
          <Route path="/records" element={<MeasurementRecords />} />
        </Routes>
      </main>
    </div>
  );
}
