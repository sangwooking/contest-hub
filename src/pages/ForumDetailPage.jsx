import { useParams, Link } from "react-router";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getForumPostById, addForumComment } from "../data/forumStorage";

function formatDateTime(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("ko-KR");
}

export default function ForumDetailPage() {
  const { postId } = useParams();
  const { isLoggedIn, user } = useAuth();

  const initialPost = useMemo(() => {
    return getForumPostById(postId);
  }, [postId]);

  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert("댓글을 작성하려면 로그인해 주세요.");
      return;
    }

    const trimmedComment = commentText.trim();

    if (!trimmedComment) return;

    const createdComment = {
      id: `comment-${Date.now()}`,
      author: user?.nickname || "사용자",
      content: trimmedComment,
      createdAt: new Date().toISOString(),
    };

    const updatedPost = addForumComment(postId, createdComment);
    setPost(updatedPost);
    setCommentText("");
  };

  if (!post) {
    return (
      <div>
        <h1>게시글을 찾을 수 없습니다.</h1>
        <Link to="/forum">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/forum"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: 600,
          }}
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              color: "#2563eb",
              fontWeight: 700,
            }}
          >
            {post.category}
          </p>

          <h1 style={{ margin: "0 0 12px 0" }}>{post.title}</h1>

          <div style={{ color: "#6b7280", fontSize: "14px" }}>
            {post.author} · {formatDateTime(post.createdAt)}
          </div>
        </div>

        <div
          style={{
            lineHeight: 1.7,
            color: "#374151",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </div>
      </section>

      <section
        style={{
          marginTop: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
          댓글 {(post.comments || []).length}개
        </h2>

        {isLoggedIn ? (
          <form onSubmit={handleSubmitComment}>
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={4}
                placeholder="댓글을 입력하세요."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                  {user.nickname}님으로 댓글을 작성합니다.
                </p>

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #111827",
                    backgroundColor: commentText.trim() ? "#111827" : "#9ca3af",
                    color: "#ffffff",
                    cursor: commentText.trim() ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  댓글 등록
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              color: "#6b7280",
            }}
          >
            댓글을 작성하려면 로그인해 주세요.
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          {(post.comments || []).length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>
              아직 작성된 댓글이 없습니다.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {post.comments.map((comment) => (
                <article
                  key={comment.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "10px",
                    }}
                  >
                    <strong style={{ color: "#111827" }}>{comment.author}</strong>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#374151",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {comment.content}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}