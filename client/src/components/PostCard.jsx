import { Link } from "react-router-dom";

export default function PostCard({ post, onDelete, canEdit }) {
  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardMeta">
          <div className="cardTitle">
            <Link to={`/posts/${post._id}`} className="linkTitle">
              {post.title}
            </Link>
          </div>
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
          {onDelete && (
            <button className="btn btnDanger" onClick={() => onDelete(post._id)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="cardBody">
        <p className="preview">{post.content}</p>
      </div>
    </div>
  );
}