import { useParams, Link } from "react-router";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const MOCK_POSTS = [
  {
    id: "post-001",
    category: "자유",
    title: "이번 주말 해커톤 준비 같이 하실 분 있나요?",
    content:
      "주말 동안 아이디어 정리하고 간단한 와이어프레임까지 같이 잡아보실 분 찾습니다.",
    author: "ContestStarter",
    createdAt: "2026-03-26T10:30:00",
  },
  {
    id: "post-002",
    category: "질문",
    title: "공모전 기획서 분량은 어느 정도가 적당할까요?",
    content:
      "처음 제출해보는 거라 너무 길게 써야 할지 고민됩니다.",
    author: "IdeaMaker",
    createdAt: "2026-03-25T18:10:00",
  },
];

function formatDateTime(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("ko-KR");
}

export default function ForumDetailPage() {
  const { postId } = useParams();
  const { isLoggedIn, user } = useAuth();

  const post = useMemo(() => {
    return MOCK_POSTS.find((item) => item.id === postId);
  }, [postId]);

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

      {/* 댓글 영역 (최소 버전) */}
      <section
        style={{
          marginTop: "20px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>댓글 (준비중)</h2>

        {isLoggedIn ? (
          <p style={{ color: "#6b7280" }}>
            {user.nickname}님, 댓글 기능은 다음 단계에서 구현됩니다.
          </p>
        ) : (
          <p style={{ color: "#6b7280" }}>
            댓글을 작성하려면 로그인해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}