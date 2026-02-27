import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../state/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      const res = await api.post("/auth/register", { email, username, password });
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1 className="h1">Create your account</h1>
        <div className="muted">Register to post and join discussions</div>

        {error && <div className="alert">{error}</div>}

        <form className="form" onSubmit={submit}>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="label">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btnDark btnFull" disabled={busy}>
            {busy ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}