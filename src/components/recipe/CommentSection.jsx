import { useState } from "react";
import { Trash2, Send } from "lucide-react";

function CommentSection({ comments, currentUserId, onSubmit, onDelete, loading }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text.trim());
    setText("");
    setSubmitting(false);
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2>Comments</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {currentUserId ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-input"
            placeholder="Share a tip, suggestion, or feedback…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={submitting || !text.trim()}
            style={{ alignSelf: "flex-end" }}
          >
            <Send size={15} />
            {submitting ? "Posting…" : "Post"}
          </button>
        </form>
      ) : (
        <p className="comment-login-prompt">
          <a href="/login">Log in</a> to leave a comment.
        </p>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12 }}>
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">
                {(c.profiles?.full_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">
                    {c.profiles?.full_name || "Anonymous"}
                  </span>
                  <span className="comment-date">
                    {new Date(c.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="comment-text">{c.body}</p>
              </div>
              {currentUserId === c.user_id && (
                <button
                  className="delete-btn"
                  onClick={() => onDelete(c.id)}
                  title="Delete comment"
                  style={{ flexShrink: 0, alignSelf: "flex-start" }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
