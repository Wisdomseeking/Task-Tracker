import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth, fetchProfile } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const loginRes = await api.post("/auth/login", { email, password });
      const { accessToken } = loginRes.data;
      setAuth({ id: 0, username: "", email } as any, accessToken);
      await fetchProfile();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h2>Task Manager</h2>
        <p className="sub">Log in to manage your tasks — fast and simple.</p>

        {error && <div style={{ color: "#ffb4b4", marginBottom: 10 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
            <Link to="/register" className="btn-ghost" style={{ alignSelf: "center", display: "inline-block" }}>Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
