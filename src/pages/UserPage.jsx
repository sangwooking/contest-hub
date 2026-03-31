import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import teamsData from "../data/public_teams.json";

function formatDateTime(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getRecruitType(team) {
  if (team.hackathonSlug === "free-recruit") return "자유 모집";
  if (team.hackathonSlug === "open-hackathon") return "공모전 자유";
  return "해커톤 모집";
}

function getHackathonLabel(team) {
  if (team.hackathonSlug === "free-recruit") return "자유 모집";
  if (team.hackathonSlug === "open-hackathon") return "공모전 자유";
  return team.hackathonSlug;
}

const MENU_LIST = [
  { key: "profile", label: "사용자 정보" },
  { key: "guestbook", label: "방명록" },
  { key: "messages", label: "쪽지함" },
  { key: "history", label: "참여/수상내역" },
];

export default function UserPage() {
  const { userId } = useParams();
  const { user, isLoggedIn, logout } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState("profile");

  const pageUser = useMemo(() => {
    if (!isLoggedIn) return null;

    // 현재는 Firebase 상세 조회 연결 전 최소 구현
    // userId가 있더라도 지금은 로그인 유저 정보 기반으로 먼저 보여주고,
    // 나중에 Firebase users 컬렉션 조회로 바꾸기 쉽게 구조만 잡아둠
    return {
      id: userId || user?.uid || "me",
      nickname: user?.nickname || "닉네임 없음",
      email: user?.email || "-",
      bio: user?.bio || "자기소개가 없습니다.",
      profileImage: user?.profileImage || user?.photoURL || "",
      guestbook: user?.guestbook || [],
      messages: user?.messages || [],
      participations: user?.participations || [],
      awards: user?.awards || [],
    };
  }, [isLoggedIn, user, userId]);

  const myTeams = useMemo(() => {
    if (!isLoggedIn) return [];

    // 최소 구현용
    return teamsData.slice(0, 3);
  }, [isLoggedIn]);

  const activitySummary = useMemo(() => {
    const openCount = myTeams.filter((team) => team.isOpen).length;
    const closedCount = myTeams.filter((team) => !team.isOpen).length;
    const freeCount = myTeams.filter(
      (team) => team.hackathonSlug === "free-recruit"
    ).length;

    return {
      total: myTeams.length,
      open: openCount,
      closed: closedCount,
      free: freeCount,
    };
  }, [myTeams]);

  const guestbookList = useMemo(() => {
    if (!pageUser) return [];

    if (pageUser.guestbook.length > 0) return pageUser.guestbook;

    return [
      {
        id: 1,
        writer: "홍길동",
        content: "프로필 잘 보고 갑니다!",
        createdAt: "2026-03-31",
      },
      {
        id: 2,
        writer: "김개발",
        content: "다음 공모전도 응원할게요.",
        createdAt: "2026-03-29",
      },
    ];
  }, [pageUser]);

  const messageList = useMemo(() => {
    if (!pageUser) return [];

    if (pageUser.messages.length > 0) return pageUser.messages;

    return [
      {
        id: 1,
        sender: "이협업",
        content: "혹시 팀원 모집 아직 하고 계신가요?",
        createdAt: "2026-03-30",
      },
      {
        id: 2,
        sender: "박프론트",
        content: "랭킹 보고 들어왔습니다. 같이 프로젝트 해보고 싶어요.",
        createdAt: "2026-03-28",
      },
    ];
  }, [pageUser]);

  const historyData = useMemo(() => {
    if (!pageUser) {
      return { participations: [], awards: [] };
    }

    return {
      participations:
        pageUser.participations.length > 0
          ? pageUser.participations
          : [
              {
                id: 1,
                title: "2026 AI Hackathon",
                role: "Frontend",
                period: "2026.03",
              },
              {
                id: 2,
                title: "2025 Public Data Contest",
                role: "Team Member",
                period: "2025.11",
              },
            ],
      awards:
        pageUser.awards.length > 0
          ? pageUser.awards
          : [
              {
                id: 1,
                title: "2025 Public Data Contest",
                awardName: "우수상",
                year: "2025",
              },
            ],
    };
  }, [pageUser]);

  if (!isLoggedIn) {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ marginBottom: "8px" }}>마이페이지</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            마이페이지를 보려면 먼저 로그인해 주세요.
          </p>
        </div>

        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "24px",
            backgroundColor: "#ffffff",
            maxWidth: "560px",
          }}
        >
          <p style={{ margin: "0 0 16px 0", color: "#374151", lineHeight: 1.6 }}>
            로그인하면 내 프로필, 방명록, 쪽지함, 참여/수상내역을 확인할 수 있어.
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "#111827",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            로그인하러 가기
          </Link>
        </section>
      </div>
    );
  }

  const renderTabContent = () => {
    if (selectedMenu === "profile") {
      return (
        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>프로필</h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "999px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                {pageUser.profileImage ? (
                  <img
                    src={pageUser.profileImage}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "프로필"
                )}
              </div>

              <div>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>닉네임:</strong> {pageUser.nickname}
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>이메일:</strong> {pageUser.email}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>소개:</strong> {pageUser.bio}
                </p>
              </div>
            </div>

            {!userId || pageUser.id === user?.uid ? (
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #dc2626",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                로그아웃
              </button>
            ) : null}
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>활동 요약</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>작성 모집글</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                  {activitySummary.total}
                </p>
              </div>

              <div
                style={{
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>모집중</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                  {activitySummary.open}
                </p>
              </div>

              <div
                style={{
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>모집마감</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                  {activitySummary.closed}
                </p>
              </div>

              <div
                style={{
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>자유 모집글</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                  {activitySummary.free}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedMenu === "guestbook") {
      return (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>방명록</h2>

          <div style={{ display: "grid", gap: "14px" }}>
            {guestbookList.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>방명록이 없습니다.</p>
            ) : (
              guestbookList.map((item) => (
                <article
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
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
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{item.writer}</strong>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                    {item.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      );
    }

    if (selectedMenu === "messages") {
      return (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>쪽지함</h2>

          <div style={{ display: "grid", gap: "14px" }}>
            {messageList.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>받은 쪽지가 없습니다.</p>
            ) : (
              messageList.map((item) => (
                <article
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
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
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{item.sender}</strong>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                    {item.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      );
    }

    if (selectedMenu === "history") {
      return (
        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>참여 내역</h2>

            {historyData.participations.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>참여 내역이 없습니다.</p>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {historyData.participations.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "17px" }}>
                      {item.title}
                    </h3>
                    <p style={{ margin: "0 0 6px 0", color: "#374151" }}>
                      <strong>역할:</strong> {item.role}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280" }}>{item.period}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>수상 내역</h2>

            {historyData.awards.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>수상 내역이 없습니다.</p>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {historyData.awards.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "17px" }}>
                      {item.title}
                    </h3>
                    <p style={{ margin: "0 0 6px 0", color: "#374151" }}>
                      <strong>수상:</strong> {item.awardName}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280" }}>{item.year}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>
          {userId ? "사용자 페이지" : "마이페이지"}
        </h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          프로필 정보와 활동 내역을 확인할 수 있습니다.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <aside
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "16px",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "14px", fontSize: "18px" }}>
            목차
          </h2>

          <div style={{ display: "grid", gap: "10px" }}>
            {MENU_LIST.map((menu) => (
              <button
                key={menu.key}
                type="button"
                onClick={() => setSelectedMenu(menu.key)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border:
                    selectedMenu === menu.key
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    selectedMenu === menu.key ? "#111827" : "#f8fafc",
                  color: selectedMenu === menu.key ? "#ffffff" : "#111827",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {menu.label}
              </button>
            ))}
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>{renderTabContent()}</div>
      </section>
    </div>
  );
}