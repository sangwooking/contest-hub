import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

const INITIAL_POSTS = [
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
      "처음 제출해보는 거라 너무 길게 써야 할지, 핵심만 간단히 적어야 할지 고민됩니다.",
    author: "IdeaMaker",
    createdAt: "2026-03-25T18:10:00",
  },
  {
    id: "post-003",
    category: "정보",
    title: "발표 자료 만들 때 심사위원이 보기 좋은 구성 팁",
    content:
      "문제 정의 → 해결 방식 → 기대 효과 → 시연 흐름으로 잡으면 전달력이 훨씬 좋아집니다.",
    author: "SlideRunner",
    createdAt: "2026-03-24T14:20:00",
  },
  {
    id: "post-004",
    category: "팀빌딩",
    title: "디자이너 구하는 분들은 어떤 포트폴리오를 보시나요?",
    content:
      "팀원 모집할 때 디자이너 지원자를 볼 때 어떤 기준으로 판단하는지 궁금합니다.",
    author: "BuildTogether",
    createdAt: "2026-03-23T21:05:00",
  },
];

const CATEGORY_OPTIONS = ["전체", "자유", "질문", "정보", "팀빌딩"];

function formatDateTime(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function buildSearchTarget(post) {
  return normalizeText(
    [post.category, post.title, post.content, post.author].join(" ")
  );
}

export default function ForumPage() {
  const { user, isLoggedIn } = useAuth();

  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [showWriteForm, setShowWriteForm] = useState(false);

  const [newPost, setNewPost] = useState({
    category: "자유",
    title: "",
    content: "",
  });

  const filteredPosts = useMemo(() => {
    const keywordLower = normalizeText(keyword);

    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "전체" ? true : post.category === selectedCategory;

      const matchesKeyword = keywordLower
        ? buildSearchTarget(post).includes(keywordLower)
        : true;

      return matchesCategory && matchesKeyword;
    });
  }, [posts, selectedCategory, keyword]);

  const summary = useMemo(() => {
    return {
      total: posts.length,
      info: posts.filter((post) => post.category === "정보").length,
      question: posts.filter((post) => post.category === "질문").length,
      teambuilding: posts.filter((post) => post.category === "팀빌딩").length,
    };
  }, [posts]);

  const handleChangeNewPost = (event) => {
    const { name, value } = event.target;

    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPost = (event) => {
    event.preventDefault();

    const trimmedTitle = newPost.title.trim();
    const trimmedContent = newPost.content.trim();

    if (!trimmedTitle || !trimmedContent) return;

    const createdPost = {
      id: `post-${Date.now()}`,
      category: newPost.category,
      title: trimmedTitle,
      content: trimmedContent,
      author: isLoggedIn ? user.nickname : "익명",
      createdAt: new Date().toISOString(),
      isPreview: true,
    };

    setPosts((prev) => [createdPost, ...prev]);
    setNewPost({
      category: "자유",
      title: "",
      content: "",
    });
    setShowWriteForm(false);
  };

  const canSubmit = newPost.title.trim() && newPost.content.trim();

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>커뮤니티</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          공모전, 해커톤, 팀빌딩과 관련된 이야기를 자유롭게 나눌 수 있습니다.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>전체 글</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {summary.total}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>정보 글</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {summary.info}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>질문 글</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {summary.question}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>팀빌딩 글</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {summary.teambuilding}
          </p>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0 }}>게시글 필터</h2>

          <button
            type="button"
            onClick={() => setShowWriteForm((prev) => !prev)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #2563eb",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {showWriteForm ? "글쓰기 닫기" : "글쓰기"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label
              htmlFor="forum-category"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              카테고리
            </label>
            <select
              id="forum-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
              }}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="forum-keyword"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              검색
            </label>
            <input
              id="forum-keyword"
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="제목, 내용, 작성자 검색"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </section>

      {showWriteForm && (
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>게시글 작성</h2>

          <form onSubmit={handleSubmitPost}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <label
                  htmlFor="post-category"
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  카테고리
                </label>
                <select
                  id="post-category"
                  name="category"
                  value={newPost.category}
                  onChange={handleChangeNewPost}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {CATEGORY_OPTIONS.filter((item) => item !== "전체").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="post-author"
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  작성자
                </label>
                <input
                  id="post-author"
                  type="text"
                  value={isLoggedIn ? user.nickname : "익명"}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#f9fafb",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="post-title"
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  제목 *
                </label>
                <input
                  id="post-title"
                  name="title"
                  type="text"
                  value={newPost.title}
                  onChange={handleChangeNewPost}
                  placeholder="게시글 제목을 입력하세요."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="post-content"
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  내용 *
                </label>
                <textarea
                  id="post-content"
                  name="content"
                  value={newPost.content}
                  onChange={handleChangeNewPost}
                  rows={6}
                  placeholder="내용을 입력하세요."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ margin: 0, color: "#374151" }}>
                지금은 최소 구현 단계라서 실제 서버 저장 대신 <strong>작성 즉시 목록 상단에 반영</strong>되도록 구성했어.
              </p>
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #111827",
                  backgroundColor: canSubmit ? "#111827" : "#9ca3af",
                  color: "#ffffff",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                게시글 등록
              </button>
            </div>
          </form>
        </section>
      )}

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0 }}>게시글 목록</h2>
          <p style={{ margin: 0, color: "#6b7280" }}>총 {filteredPosts.length}개</p>
        </div>

        {filteredPosts.length === 0 ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>조건에 맞는 게시글이 없습니다.</p>
            <p style={{ margin: 0 }}>카테고리나 검색어를 바꿔서 다시 확인해보세요.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  border: post.isPreview ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "18px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "13px",
                        color: "#2563eb",
                        fontWeight: 700,
                      }}
                    >
                      {post.category}
                    </p>
                    <h3 style={{ margin: 0, fontSize: "20px" }}>
                     <Link
                        to={`/forum/${post.id}`}
                        style={{
                          textDecoration: "none",
                          color: "#111827",
                        }}
                       >
                        {post.title}
                      </Link>
                    </h3>
                  </div>

                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      border: "1px solid #d1d5db",
                      backgroundColor: "#f9fafb",
                      color: "#374151",
                    }}
                  >
                    {post.author}
                  </div>
                </div>

                <p style={{ margin: "0 0 12px 0", color: "#374151", lineHeight: 1.6 }}>
                  {post.content}
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid #f1f5f9",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  작성일: {formatDateTime(post.createdAt)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}