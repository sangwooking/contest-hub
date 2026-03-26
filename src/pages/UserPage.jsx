import { useMemo } from "react";
import { Link } from "react-router";
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

export default function UserPage() {
  const { user, isLoggedIn, logout } = useAuth();

  const myTeams = useMemo(() => {
    if (!isLoggedIn) return [];

    // 최소 구현용:
    // 실제 작성자 데이터가 아직 없으니 앞에서부터 일부를 내 글처럼 보여줌
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
            로그인하면 내 프로필, 내가 올린 팀 모집글, 활동 현황을 확인할 수 있어.
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

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>마이페이지</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          내 정보와 활동 현황을 확인할 수 있습니다.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>프로필</h2>

          <p style={{ margin: "0 0 12px 0" }}>
            <strong>닉네임:</strong> {user.nickname}
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>이메일:</strong> {user.email}
          </p>
          <p style={{ margin: "0 0 20px 0" }}>
            <strong>소개:</strong> {user.bio || "자기소개가 없습니다."}
          </p>

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
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>내 활동 요약</h2>

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
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        <div
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
            <h2 style={{ margin: 0 }}>내 팀 모집글</h2>
            <Link
              to="/camp"
              style={{
                textDecoration: "none",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              전체 모집 보러가기
            </Link>
          </div>

          {myTeams.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>
              아직 작성한 모집글이 없습니다.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {myTeams.map((team) => (
                <article
                  key={team.teamCode}
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
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      marginBottom: "10px",
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
                        {getHackathonLabel(team)}
                      </p>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>{team.name}</h3>
                    </div>

                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "1px solid #d1d5db",
                        backgroundColor: team.isOpen ? "#ecfdf5" : "#f3f4f6",
                        color: team.isOpen ? "#047857" : "#6b7280",
                      }}
                    >
                      {team.isOpen ? "모집중" : "모집마감"}
                    </div>
                  </div>

                  <p style={{ margin: "0 0 10px 0", color: "#374151", lineHeight: 1.6 }}>
                    {team.intro}
                  </p>

                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>유형:</strong> {getRecruitType(team)}
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>모집 포지션:</strong>{" "}
                    {team.lookingFor?.length ? team.lookingFor.join(", ") : "없음"}
                  </p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                    작성일: {formatDateTime(team.createdAt)}
                  </p>
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
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>바로가기</h2>

          <div style={{ display: "grid", gap: "12px" }}>
            <Link
              to="/camp"
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              }}
            >
              팀 모집 캠프로 이동
            </Link>

            <Link
              to="/hackathons"
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              }}
            >
              공모전 목록 보러가기
            </Link>

            <Link
              to="/rankings"
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              }}
            >
              랭킹 페이지 보러가기
            </Link>

            <Link
              to="/forum"
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "#111827",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              }}
            >
              커뮤니티 보러가기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}