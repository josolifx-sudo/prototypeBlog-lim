import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/posts/${id}`);
        setTitle(res.data.post.title);
        setContent(res.data.post.content);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function submit(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      await api.put(`/posts/${id}`, { title, content });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update post");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Edit post</h1>
          <div className="muted">Update your post content</div>
        </div>
      </div>

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
              {busy ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}