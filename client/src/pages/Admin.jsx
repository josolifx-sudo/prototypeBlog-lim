import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [u, p] = await Promise.all([api.get("/users"), api.get("/posts")]);
      setUsers(u.data.users);
      setPosts(p.data.posts);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAdmin(userId, current) {
    try {
      const res = await api.put(`/users/${userId}`, { isAdmin: !current });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.user : u)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update user");
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  }

  async function deletePost(postId) {
    if (!confirm("Admin delete this post?")) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete post");
    }
  }

  if (loading) return <div className="muted">Loading admin dashboard...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Admin dashboard</h1>
          <div className="muted">Manage users, posts, and moderation</div>
        </div>
        <button className="btn btnSoft" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Users</div>
            <div className="muted">{users.length} total</div>
          </div>
          <div className="cardBody">
            <div className="table">
              <div className="tableRow tableHead">
                <div>Email</div>
                <div>Username</div>
                <div>Role</div>
                <div>Actions</div>
              </div>

              {users.map((u) => (
                <div className="tableRow" key={u._id}>
                  <div className="mono">{u.email}</div>
                  <div>{u.username}</div>
                  <div>
                    <span className="pill">{u.isAdmin ? "Admin" : "User"}</span>
                  </div>
                  <div className="rowActions">
                    <button className="btn btnSoft" onClick={() => toggleAdmin(u._id, u.isAdmin)}>
                      Toggle admin
                    </button>
                    <button className="btn btnDanger" onClick={() => deleteUser(u._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Posts</div>
            <div className="muted">{posts.length} total</div>
          </div>
          <div className="cardBody">
            <div className="stack">
              {posts.map((p) => (
                <div className="moderationItem" key={p._id}>
                  <div>
                    <div className="moderationTitle">{p.title}</div>
                    <div className="muted">
                      by {p.author?.username || "Unknown"} • {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn btnDanger" onClick={() => deletePost(p._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}