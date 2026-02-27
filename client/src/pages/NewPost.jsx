import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function NewPost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      const res = await api.post("/posts", { title, content });
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">New post</h1>
          <div className="muted">Create a post for everyone to read</div>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="card">
        <div className="cardBody">
          <form className="form" onSubmit={submit}>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="label">Content</label>
            <textarea
              className="textarea"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="btn btnDark" disabled={busy}>
              {busy ? "Posting..." : "Publish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}