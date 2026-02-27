import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../state/AuthContext.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addComment() {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/posts/${id}/comments`, { content: commentText.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentText("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add comment");
    }
  }

  async function deleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete comment");
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  }

  if (loading) return <div className="muted">Loading...</div>;
  if (error) return <div className="alert">{error}</div>;
  if (!post) return <div className="muted">Post not found.</div>;

  const isOwner = user && post.author && post.author._id === user._id;
  const canEdit = !!user && (isOwner || user.isAdmin);
  const canDelete = !!user && (isOwner || user.isAdmin);

  return (
    <div className="stack">
      <div className="card">
        <div className="cardHeader">
          <div className="cardMeta">
            <div className="cardTitle">{post.title}</div>
            <div className="cardSub">
              <span className="pill">{post.author?.username || "Unknown"}</span>
              <span className="dot">•</span>
              <span className="muted">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="cardActions">
            {canEdit && (
              <Link to={`/edit/${post._id}`} className="btn btnSoft">
                Edit
              </Link>
            )}
            {canDelete && (
              <button className="btn btnDanger" onClick={deletePost}>
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="cardBody">
          <p className="content">{post.content}</p>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Comments</div>
          <div className="muted">{comments.length} total</div>
        </div>

        <div className="cardBody">
          {!user ? (
            <div className="muted">
              You must <Link to="/login">login</Link> to comment.
            </div>
          ) : (
            <div className="commentComposer">
              <textarea
                className="textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
              />
              <div className="rowRight">
                <button className="btn btnDark" onClick={addComment}>
                  Post comment
                </button>
              </div>
            </div>
          )}

          <div className="commentList">
            {comments.length === 0 && <div className="muted">No comments yet.</div>}

            {comments.map((c) => {
              const commentOwner = user && c.author && c.author._id === user._id;
              const canRemove = user && (user.isAdmin || commentOwner);

              return (
                <div className="comment" key={c._id}>
                  <div className="commentTop">
                    <div className="commentMeta">
                      <span className="pill">{c.author?.username || "Unknown"}</span>
                      <span className="dot">•</span>
                      <span className="muted">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>

                    {canRemove && (
                      <button className="btn btnTinyDanger" onClick={() => deleteComment(c._id)}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="commentText">{c.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}