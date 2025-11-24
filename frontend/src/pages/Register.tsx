import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { setAuth, fetchProfile } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      const loginRes = await api.post("/auth/login", { email, password });
      const { accessToken } = loginRes.data;
      setAuth({ id: 0, username, email } as any, accessToken);
      await fetchProfile();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h2>Create account</h2>
        <p className="sub">Start using Task Manager in seconds.</p>

        {error && <div style={{ color: "#ffb4b4", marginBottom: 10 }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-field">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? "Registering…" : "Register"}</button>
            <Link to="/login" className="btn-ghost" style={{ alignSelf: "center", display: "inline-block" }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
