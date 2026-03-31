import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import teamsData from "../data/public_teams.json";
import DataBoundary from "../components/common/DataBoundary";
import StatusMessage from "../components/common/StatusMessage";

function formatDateTime(value) {
  if (!value) return "-";

  if (typeof value === "object" && value?.toDate) {
    return value.toDate().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MENU_LIST = [
  { key: "profile", label: "사용자 정보" },
  { key: "guestbook", label: "방명록" },
  { key: "messages", label: "쪽지함" },
  { key: "history", label: "참여/수상내역" },
];

export default function UserPage() {
  const { userId } = useParams();
  const { user, isLoggedIn, logout, loading, error } = useAuth();

  const [selectedMenu, setSelectedMenu] = useState("profile");
  const [pageUser, setPageUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [guestbookList, setGuestbookList] = useState([]);
  const [guestbookLoading, setGuestbookLoading] = useState(true);
  const [guestbookInput, setGuestbookInput] = useState("");
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);

  const targetUserId = userId || user?.uid || null;

  useEffect(() => {
    const fetchPageUser = async () => {
      if (!targetUserId) {
        setPageUser(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);

        const userRef = doc(db, "users", targetUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setPageUser({
            id: userSnap.id,
            nickname: data.nickname || "닉네임 없음",
            email: data.email || "-",
            bio: data.bio || "자기소개가 없습니다.",
            profileImage: data.profileImage || data.photoURL || "",
            messages: data.messages || [],
            participations: data.participations || [],
            awards: data.awards || [],
          });
        } else {
          setPageUser({
            id: targetUserId,
            nickname: user?.nickname || "닉네임 없음",
            email: user?.email || "-",
            bio: user?.bio || "자기소개가 없습니다.",
            profileImage: user?.profileImage || user?.photoURL || "",
            messages: [],
            participations: [],
            awards: [],
          });
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        setPageUser(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchPageUser();
  }, [targetUserId, user]);

  useEffect(() => {
    if (!targetUserId) {
      setGuestbookList([]);
      setGuestbookLoading(false);
      return;
    }

    setGuestbookLoading(true);

    const guestbookRef = collection(db, "users", targetUserId, "guestbook");
    const guestbookQuery = query(guestbookRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      guestbookQuery,
      (snapshot) => {
        const nextList = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setGuestbookList(nextList);
        setGuestbookLoading(false);
      },
      (error) => {
        console.error("방명록 실시간 조회 실패:", error);
        setGuestbookList([]);
        setGuestbookLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId]);

  const myTeams = useMemo(() => {
    if (!isLoggedIn) return [];
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

  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !user || !targetUserId) {
      alert("로그인 후 작성할 수 있습니다.");
      return;
    }

    if (!guestbookInput.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setGuestbookSubmitting(true);

      await addDoc(collection(db, "users", targetUserId, "guestbook"), {
        writerId: user.uid,
        writerNickname: user.nickname || user.displayName || "사용자",
        writerEmail: user.email || "",
        writerProfileImage: user.profileImage || user.photoURL || "",
        content: guestbookInput.trim(),
        createdAt: serverTimestamp(),
      });

      setGuestbookInput("");
    } catch (error) {
      console.error("방명록 작성 실패:", error);
      alert("방명록 등록에 실패했습니다.");
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
  <div style={{ marginBottom: "20px" }}>
    <h1 style={{ marginBottom: "8px" }}>마이페이지</h1>
    <p style={{ margin: 0, color: "#6b7280" }}>
      내 정보와 활동 현황을 확인할 수 있습니다.
    </p>
  </div>

<<<<<<< HEAD
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
=======
  <DataBoundary
    loading={loading}
    error={error}
    isEmpty={!isLoggedIn}
    loadingTitle="로그인 정보를 확인하는 중입니다"
    loadingMessage="사용자 정보를 불러오고 있어요."
    errorTitle="로그인 정보를 불러오지 못했습니다"
    emptyTitle="로그인이 필요합니다"
    emptyMessage="마이페이지를 보려면 먼저 로그인해 주세요."
    emptyAction={
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
    }
  >
    </DataBoundary>
>>>>>>> feature/C
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div>
        <h1 style={{ marginBottom: "12px" }}>마이페이지</h1>
        <p style={{ color: "#6b7280" }}>사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

<<<<<<< HEAD
  const renderTabContent = () => {
    if (selectedMenu === "profile") {
      return (
        <div style={{ display: "grid", gap: "20px" }}>
          <div
=======
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
            <strong>닉네임:</strong> {user?.nickname || "없음"}
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>이메일:</strong> {user?.email || "없음"}
          </p>
          <p style={{ margin: "0 0 20px 0" }}>
            <strong>소개:</strong> {user?.bio || "자기소개가 없습니다."}
          </p>

          <button
            type="button"
            onClick={logout}
>>>>>>> feature/C
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
                {pageUser?.profileImage ? (
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
                  <strong>닉네임:</strong> {pageUser?.nickname || "닉네임 없음"}
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>이메일:</strong> {pageUser?.email || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>소개:</strong> {pageUser?.bio || "자기소개가 없습니다."}
                </p>
              </div>
            </div>

            {!userId || pageUser?.id === user?.uid ? (
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
              <div style={{ borderRadius: "10px", padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>작성 모집글</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{activitySummary.total}</p>
              </div>
              <div style={{ borderRadius: "10px", padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>모집중</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{activitySummary.open}</p>
              </div>
              <div style={{ borderRadius: "10px", padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>모집마감</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{activitySummary.closed}</p>
              </div>
              <div style={{ borderRadius: "10px", padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>자유 모집글</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{activitySummary.free}</p>
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

          <form onSubmit={handleGuestbookSubmit} style={{ marginBottom: "20px" }}>
            <textarea
              value={guestbookInput}
              onChange={(e) => setGuestbookInput(e.target.value)}
              placeholder={
                pageUser?.id === user?.uid
                  ? "내 방명록에 남길 글을 입력하세요."
                  : `${pageUser?.nickname || "사용자"}님의 방명록에 글을 남겨보세요.`
              }
              style={{
                width: "100%",
                minHeight: "110px",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
                resize: "vertical",
                marginBottom: "12px",
                fontFamily: "inherit",
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
                로그인한 사용자는 누구나 방명록을 남길 수 있습니다.
              </p>

<<<<<<< HEAD
              <button
                type="submit"
                disabled={guestbookSubmitting}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  cursor: guestbookSubmitting ? "default" : "pointer",
                  fontWeight: 600,
                  opacity: guestbookSubmitting ? 0.7 : 1,
                }}
              >
                {guestbookSubmitting ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </form>

          {guestbookLoading ? (
            <p style={{ margin: 0, color: "#6b7280" }}>방명록을 불러오는 중입니다...</p>
          ) : guestbookList.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>아직 작성된 방명록이 없습니다.</p>
=======
          {myTeams.length === 0 ? (
            <StatusMessage
              type="empty"
              title="작성한 모집글이 없어요"
              message="아직 작성한 모집글이 없습니다."
            />
>>>>>>> feature/C
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {guestbookList.map((item) => (
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
                    <strong>{item.writerNickname || "사용자"}</strong>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>

                  <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                    {item.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedMenu === "messages") {
      return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", backgroundColor: "#ffffff" }}>
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
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", backgroundColor: "#ffffff" }}>
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
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "17px" }}>{item.title}</h3>
                    <p style={{ margin: "0 0 6px 0", color: "#374151" }}>
                      <strong>역할:</strong> {item.role}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280" }}>{item.period}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", backgroundColor: "#ffffff" }}>
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
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "17px" }}>{item.title}</h3>
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