import { useContext, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../state/AuthContext.jsx";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMsg("");
      const res = await api.put("/users/me", { username });
      setUser(res.data.user);
      setMsg("Profile updated");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Profile</h1>
          <div className="muted">Manage your basic account info</div>
        </div>
      </div>

      {msg && <div className="success">{msg}</div>}
      {error && <div className="alert">{error}</div>}

      <div className="card">
        <div className="cardBody">
          <div className="profileGrid">
            <div>
              <div className="label">Email</div>
              <div className="pill">{user.email}</div>
            </div>
            <div>
              <div className="label">Role</div>
              <div className="pill">{user.isAdmin ? "Admin" : "User"}</div>
            </div>
          </div>

          <form className="form" onSubmit={save}>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            <button className="btn btnDark" disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}