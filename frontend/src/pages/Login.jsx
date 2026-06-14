import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("請輸入帳號與密碼");
      return;
    }

    setIsLoading(true);
    try {
      // 這裡呼叫你傳入的登入邏輯 (例如呼叫後端 API)
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || "登入失敗，請檢查帳號密碼");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card panel">
        <div className="login-header">
          <p>請輸入 nasa3! 帳號與密碼</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">帳號</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button 
            type="submit" 
            className="login-submit" 
            disabled={isLoading}
          >
            {isLoading ? "登入中..." : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}