import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../state/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1 className="h1">Welcome back</h1>
        <div className="muted">Login to create posts and comment</div>

        {error && <div className="alert">{error}</div>}

        <form className="form" onSubmit={submit}>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btnDark btnFull" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="muted">
          No account yet? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}