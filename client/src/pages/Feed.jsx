import { useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import PostCard from "../components/PostCard.jsx";
import { AuthContext } from "../state/AuthContext.jsx";

export default function Feed() {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPosts() {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const t = (p.title || "").toLowerCase();
      const c = (p.content || "").toLowerCase();
      const a = (p.author?.username || "").toLowerCase();
      return t.includes(q) || c.includes(q) || a.includes(q);
    });
  }, [posts, query]);

  async function handleDelete(postId) {
    if (!confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Feed</h1>
          <div className="muted">Browse posts like a Threads style timeline</div>
        </div>

        <div className="searchWrap">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, content, author"
          />
          <button className="btn btnSoft" onClick={loadPosts}>
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="muted">Loading posts...</div>}
      {error && <div className="alert">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty">No posts found.</div>
      )}

      <div className="stack">
        {filtered.map((post) => {
          const isOwner = user && post.author && post.author._id === user._id;
          const canEdit = !!user && (isOwner || user.isAdmin);
          const canDelete = !!user && (isOwner || user.isAdmin);

          return (
            <PostCard
              key={post._id}
              post={post}
              canEdit={canEdit}
              onDelete={canDelete ? handleDelete : null}
            />
          );
        })}
      </div>
    </div>
  );
}