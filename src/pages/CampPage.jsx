import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import teamsData from "../data/public_teams.json";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function formatDateTime(value) {
  if (!value) return "-";

  // Firestore Timestamp 대응
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

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function getHackathonOptions(teams) {
  const uniqueSlugs = [
    ...new Set(
      teams
        .map((team) => team.hackathonSlug)
        .filter(
          (slug) =>
            slug &&
            slug !== "free-recruit" &&
            slug !== "open-hackathon"
        )
    ),
  ];

  return uniqueSlugs.sort();
}

function inferRecruitType(team) {
  if (team.recruitType) return team.recruitType;
  if (team.hackathonSlug === "free-recruit") return "free";
  return "hackathon";
}

function getDisplayHackathonLabel(team) {
  if (team.hackathonSlug === "free-recruit") return "자유 모집";
  if (team.hackathonSlug === "open-hackathon") return "공모전 자유";
  return team.hackathonSlug || "공모전 자유";
}

function buildSearchTarget(team) {
  const recruitType = inferRecruitType(team);
  const displayLabel = getDisplayHackathonLabel(team);

  return normalizeText(
    [
      team.name,
      team.intro,
      team.hackathonSlug,
      displayLabel,
      recruitType === "free"
        ? "자유모집 자유 모집"
        : "해커톤모집 해커톤 모집 공모전모집 공모전 모집",
      ...(team.lookingFor || []),
      team.contact?.url,
      team.authorNickname,
      team.leaderNickname,
      team.creatorNickname,
    ].join(" ")
  );
}

function TeamRecruitCard({ team, onDelete, onClose, onContact, onEdit, currentUser }) {
  const recruitType = inferRecruitType(team);
  const hackathonLabel = getDisplayHackathonLabel(team);

  const isOwner =
    currentUser &&
    (team.authorId === currentUser.uid ||
      team.leaderId === currentUser.uid ||
      team.creatorId === currentUser.uid);

  return (
    <article
      style={{
        border: team.isPreview ? "1px solid #2563eb" : "1px solid #e5e7eb",
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
              color: recruitType === "free" ? "#7c3aed" : "#2563eb",
              fontWeight: 700,
            }}
          >
            {hackathonLabel}
          </p>
          <h3 style={{ margin: 0, fontSize: "20px" }}>{team.name}</h3>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              border: "1px solid #d1d5db",
              backgroundColor: recruitType === "free" ? "#f5f3ff" : "#eff6ff",
              color: recruitType === "free" ? "#6d28d9" : "#1d4ed8",
            }}
          >
            {recruitType === "free" ? "자유모집" : "해커톤모집"}
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
      </div>

      <p style={{ margin: "0 0 12px 0", color: "#374151", lineHeight: 1.6 }}>
        {team.intro}
      </p>

      <div style={{ marginBottom: "10px" }}>
        <p style={{ margin: "0 0 6px 0" }}>
          <strong>현재 인원:</strong> {team.memberCount ?? "-"}명
        </p>
        <p style={{ margin: "0 0 6px 0" }}>
          <strong>모집 포지션:</strong>{" "}
          {team.lookingFor && team.lookingFor.length > 0
            ? team.lookingFor.join(", ")
            : "없음"}
        </p>
        {(team.authorNickname || team.leaderNickname || team.creatorNickname) && (
          <p style={{ margin: 0 }}>
            <strong>작성자:</strong>{" "}
            {team.authorNickname ||
              team.leaderNickname ||
              team.creatorNickname}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "14px",
          paddingTop: "14px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: "14px" }}>
          작성일: {formatDateTime(team.createdAt)}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {recruitType === "hackathon" &&
          team.hackathonSlug &&
          team.hackathonSlug !== "open-hackathon" ? (
            <Link
              to={`/hackathons/${team.hackathonSlug}`}
              style={{
                textDecoration: "none",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              해당 해커톤 보기
            </Link>
          ) : null}

          {team.contact?.url && (
            <button
              type="button"
              onClick={() => onContact?.(team.contact.url)}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: "#111827",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              연락하기
            </button>
          )}

          {isOwner && team.isOpen && (
            <button
              type="button"
              onClick={() => onClose?.(team)}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: "#b45309",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              모집마감
            </button>
          )}
          {isOwner && (
  <button
    type="button"
    onClick={() => onEdit?.(team)}
    style={{
      border: "none",
      backgroundColor: "transparent",
      color: "#2563eb",
      fontWeight: 600,
      cursor: "pointer",
      padding: 0,
    }}
  >
    수정
  </button>
)}

          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete?.(team)}
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: "#dc2626",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CampPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
    const selectedSlugFromQuery =
    searchParams.get("hackathon") || searchParams.get("slug") || "all";
  const shouldOpenCreateForm = searchParams.get("create") === "1";
  
  const [showCreateForm, setShowCreateForm] = useState(shouldOpenCreateForm);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSlug, setSelectedSlug] = useState(selectedSlugFromQuery);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [noticeModal, setNoticeModal] = useState({
    open: false,
    mode: null, // "create" | "contact"
    targetUrl: "",
  });

  const [newPost, setNewPost] = useState({
    teamName: "",
    recruitType: "hackathon",
    hackathonSlug: selectedSlugFromQuery !== "all" ? selectedSlugFromQuery : "",
    intro: "",
    isOpen: true,
    lookingFor: "",
    contactUrl: "",
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const snapshot = await getDocs(collection(db, "teams"));

      const teamList = snapshot.docs.map((teamDoc) => ({
        id: teamDoc.id,
        teamCode: teamDoc.id,
        isCustom: true,
        ...teamDoc.data(),
      }));

      teamList.sort((a, b) => {
        const aTime =
          typeof a.createdAt === "object" && a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : new Date(a.createdAt || 0).getTime();

        const bTime =
          typeof b.createdAt === "object" && b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : new Date(b.createdAt || 0).getTime();

        return bTime - aTime;
      });

      setTeams(teamList);
    } catch (err) {
      console.error(err);
      setError("팀 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const allTeamsSource = useMemo(() => {
    return [...teams, ...teamsData];
  }, [teams]);

  const hackathonOptions = useMemo(
    () => getHackathonOptions(allTeamsSource),
    [allTeamsSource]
  );

  const filteredTeams = useMemo(() => {
    const keywordLower = normalizeText(keyword);

    return allTeamsSource.filter((team) => {
      const recruitType = inferRecruitType(team);

      const matchesSlug =
        selectedSlug === "all"
          ? true
          : recruitType === "hackathon" && team.hackathonSlug === selectedSlug;

      const matchesOpen = showOnlyOpen ? team.isOpen : true;

      const searchTarget = buildSearchTarget(team);
      const matchesKeyword = keywordLower
        ? searchTarget.includes(keywordLower)
        : true;

      return matchesSlug && matchesOpen && matchesKeyword;
    });
  }, [allTeamsSource, selectedSlug, showOnlyOpen, keyword]);

  const hackathonRecruitTeams = filteredTeams.filter(
    (team) => inferRecruitType(team) === "hackathon"
  );

  const freeRecruitTeams = filteredTeams.filter(
    (team) => inferRecruitType(team) === "free"
  );

  const handleSlugChange = (event) => {
    const nextSlug = event.target.value;
    setSelectedSlug(nextSlug);

    const nextParams = new URLSearchParams(searchParams);

    if (nextSlug === "all") {
      nextParams.delete("hackathon");
      nextParams.delete("slug");
    } else {
      nextParams.set("hackathon", nextSlug);
      nextParams.delete("slug");
    }

    setSearchParams(nextParams);

    setNewPost((prev) => ({
      ...prev,
      hackathonSlug:
        prev.recruitType === "hackathon"
          ? nextSlug === "all"
            ? ""
            : nextSlug
          : prev.hackathonSlug,
    }));
  };

  const handleCreateInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setNewPost((prev) => {
      const nextValue = type === "checkbox" ? checked : value;

      if (name === "recruitType") {
        return {
          ...prev,
          recruitType: nextValue,
          hackathonSlug:
            nextValue === "free"
              ? ""
              : prev.hackathonSlug || (selectedSlug !== "all" ? selectedSlug : ""),
        };
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const openCreateNoticeModal = () => {
    if (!isLoggedIn) {
      alert("로그인한 사용자만 팀 모집글을 작성할 수 있습니다.");
      navigate("/login");
      return;
    }

    setNoticeModal({
      open: true,
      mode: "create",
      targetUrl: "",
    });
  };

  const openContactNoticeModal = (url) => {
    setNoticeModal({
      open: true,
      mode: "contact",
      targetUrl: url || "",
    });
  };

  const closeNoticeModal = () => {
    setNoticeModal({
      open: false,
      mode: null,
      targetUrl: "",
    });
  };

  const saveTeamPost = async () => {
  if (!isLoggedIn || !user) {
    alert("로그인 후 이용하세요");
    navigate("/login");
    return;
  }

  if (!newPost.teamName.trim() || !newPost.intro.trim()) {
    alert("팀명과 소개는 필수입니다.");
    return;
  }

  const normalizedRecruitType = newPost.recruitType;
  const normalizedHackathonSlug =
    normalizedRecruitType === "free"
      ? "free-recruit"
      : newPost.hackathonSlug.trim() || "open-hackathon";

  const payload = {
    name: newPost.teamName.trim(),
    intro: newPost.intro.trim(),
    recruitType: normalizedRecruitType,
    hackathonSlug: normalizedHackathonSlug,
    isOpen: newPost.isOpen,
    lookingFor: newPost.lookingFor
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    contact: newPost.contactUrl.trim()
      ? {
          type: "link",
          url: newPost.contactUrl.trim(),
        }
      : null,
  };

  try {
    if (isEditMode && editingTeamId) {
      await updateDoc(doc(db, "teams", editingTeamId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });

      alert("팀 모집글이 수정되었습니다.");
    } else {
      await addDoc(collection(db, "teams"), {
        ...payload,
        authorId: user.uid,
        authorNickname: user.nickname || "사용자",
        leaderId: user.uid,
        leaderNickname: user.nickname || "사용자",
        creatorId: user.uid,
        creatorEmail: user.email || "",
        creatorNickname: user.nickname || "사용자",
        members: [],
        applicants: [],
        memberCount: 1,
        createdAt: serverTimestamp(),
      });

      alert("팀 생성 완료!");
    }

    setNewPost({
      teamName: "",
      recruitType: "hackathon",
      hackathonSlug: selectedSlug !== "all" ? selectedSlug : "",
      intro: "",
      isOpen: true,
      lookingFor: "",
      contactUrl: "",
    });

    setIsEditMode(false);
    setEditingTeamId(null);
    setShowCreateForm(false);

    await fetchTeams();
  } catch (error) {
    console.error(error);
    alert(isEditMode ? "수정 실패" : "팀 생성 실패");
  }
};

  const confirmNoticeModal = async () => {
    const { mode, targetUrl } = noticeModal;
    closeNoticeModal();

    if (mode === "create") {
  await saveTeamPost();
  return;
}

    if (mode === "contact" && targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDeletePost = async (team) => {
    const ok = window.confirm("이 모집글을 삭제할까요?");
    if (!ok) return;

    if (!team.id) {
      alert("기본 데이터는 삭제할 수 없습니다.");
      return;
    }

    try {
      await deleteDoc(doc(db, "teams", team.id));
      await fetchTeams();
    } catch (error) {
      console.error(error);
      alert("삭제에 실패했습니다.");
    }
  };

const handleEditPost = (team) => {
  setIsEditMode(true);
  setEditingTeamId(team.id);

  setNewPost({
    teamName: team.name || "",
    recruitType: team.recruitType || "hackathon",
    hackathonSlug:
      team.hackathonSlug === "free-recruit"
        ? ""
        : team.hackathonSlug === "open-hackathon"
        ? ""
        : team.hackathonSlug || "",
    intro: team.intro || "",
    isOpen: team.isOpen ?? true,
    lookingFor: Array.isArray(team.lookingFor)
      ? team.lookingFor.join(", ")
      : "",
    contactUrl: team.contact?.url || "",
  });

  setShowCreateForm(true);
};

  const handleCloseRecruit = async (team) => {
    if (!team.id) {
      alert("기본 데이터는 수정할 수 없습니다.");
      return;
    }

    try {
      await updateDoc(doc(db, "teams", team.id), {
        isOpen: false,
      });
      await fetchTeams();
    } catch (error) {
      console.error(error);
      alert("모집 마감 처리에 실패했습니다.");
    }
  };

  const formIsValid = newPost.teamName.trim() && newPost.intro.trim();

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>팀원 모집 캠프</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          해커톤 모집글과 자유 모집글을 나눠서 보고, 원하는 팀을 찾을 수 있습니다.
        </p>
      </div>

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
          <h2 style={{ margin: 0 }}>필터</h2>

          <button
            type="button"
            onClick={() => {
  setShowCreateForm((prev) => !prev);

  if (showCreateForm) {
    setIsEditMode(false);
    setEditingTeamId(null);
  }
}}
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
            {showCreateForm ? "작성 폼 닫기" : "팀 모집글 작성"}
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
              htmlFor="camp-slug"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              해커톤 필터
            </label>
            <select
              id="camp-slug"
              value={selectedSlug}
              onChange={handleSlugChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="all">전체 해커톤</option>
              {hackathonOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="camp-keyword"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              검색
            </label>
            <input
              id="camp-keyword"
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="팀명, 소개, 포지션, 모집 유형 검색"
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

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "14px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showOnlyOpen}
            onChange={(event) => setShowOnlyOpen(event.target.checked)}
          />
          모집중인 팀만 보기
        </label>
      </section>

      {showCreateForm && (
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
  {isEditMode ? "팀 모집글 수정" : "팀 모집글 생성"}
</h2>

          {!isLoggedIn && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ margin: 0, color: "#374151" }}>
                팀 모집글 작성은 로그인한 사용자만 가능합니다.
              </p>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label
                htmlFor="teamName"
                style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
              >
                팀명 *
              </label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                value={newPost.teamName}
                onChange={handleCreateInputChange}
                placeholder="예: Team Next"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="recruitType"
                style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
              >
                모집 유형 *
              </label>
              <select
                id="recruitType"
                name="recruitType"
                value={newPost.recruitType}
                onChange={handleCreateInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="hackathon">해커톤 모집</option>
                <option value="free">자유 모집</option>
              </select>
            </div>

            {newPost.recruitType === "hackathon" && (
              <div>
                <label
                  htmlFor="hackathonSlug"
                  style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
                >
                  해커톤 선택
                </label>
                <select
                  id="hackathonSlug"
                  name="hackathonSlug"
                  value={newPost.hackathonSlug}
                  onChange={handleCreateInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">선택 안 함 (공모전 자유)</option>
                  {hackathonOptions.map((slug) => (
                    <option key={slug} value={slug}>
                      {slug}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                htmlFor="intro"
                style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
              >
                팀 소개 *
              </label>
              <textarea
                id="intro"
                name="intro"
                value={newPost.intro}
                onChange={handleCreateInputChange}
                rows={4}
                placeholder="팀 소개와 진행 방향을 적어주세요."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="lookingFor"
                style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
              >
                모집 포지션
              </label>
              <input
                id="lookingFor"
                name="lookingFor"
                type="text"
                value={newPost.lookingFor}
                onChange={handleCreateInputChange}
                placeholder="예: Frontend, Backend, Designer"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contactUrl"
                style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
              >
                연락 링크
              </label>
              <input
                id="contactUrl"
                name="contactUrl"
                type="url"
                value={newPost.contactUrl}
                onChange={handleCreateInputChange}
                placeholder="https://open.kakao.com/..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="isOpen"
              checked={newPost.isOpen}
              onChange={handleCreateInputChange}
            />
            현재 모집중
          </label>

          <div style={{ marginTop: "16px" }}>
            <button
  type="button"
  onClick={openCreateNoticeModal}
  disabled={!formIsValid}
  style={{
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #111827",
    backgroundColor: formIsValid ? "#111827" : "#9ca3af",
    color: "#ffffff",
    cursor: formIsValid ? "pointer" : "not-allowed",
    fontSize: "14px",
    fontWeight: 600,
  }}
>
  {isEditMode ? "모집글 수정" : "모집글 생성"}
</button>
          </div>
        </section>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          alignItems: "start",
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
            <h2 style={{ margin: 0 }}>해커톤 모집</h2>
            <p style={{ margin: 0, color: "#6b7280" }}>
              총 {hackathonRecruitTeams.length}개
            </p>
          </div>

          {loading ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: 0 }}>팀 목록을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : hackathonRecruitTeams.length === 0 ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>해커톤 모집글이 없습니다.</p>
              <p style={{ margin: 0 }}>필터를 변경하거나 새 모집글을 작성해보세요.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {hackathonRecruitTeams.map((team) => (
                <TeamRecruitCard
                  key={team.id || `${team.teamCode}-${String(team.createdAt)}`}
                  team={team}
                  onDelete={handleDeletePost}
                  onClose={handleCloseRecruit}
                  onContact={openContactNoticeModal}
                  currentUser={user}
                  onEdit={handleEditPost}
                />
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
            <h2 style={{ margin: 0 }}>자유 모집</h2>
            <p style={{ margin: 0, color: "#6b7280" }}>
              총 {freeRecruitTeams.length}개
            </p>
          </div>

          {loading ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: 0 }}>팀 목록을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : freeRecruitTeams.length === 0 ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>자유 모집글이 없습니다.</p>
              <p style={{ margin: 0 }}>새 자유 모집글을 작성해보세요.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {freeRecruitTeams.map((team) => (
                <TeamRecruitCard
                  key={team.id || `${team.teamCode}-${String(team.createdAt)}`}
                  team={team}
                  onDelete={handleDeletePost}
                  onClose={handleCloseRecruit}
                  onContact={openContactNoticeModal}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {noticeModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "14px" }}>
              {noticeModal.mode === "create"
  ? isEditMode
    ? "팀 모집글 수정 전 유의사항"
    : "팀 모집글 작성 전 유의사항"
  : "팀 문의 전 유의사항"}
            </h2>

            <p style={{ marginTop: 0, marginBottom: "12px", color: "#4b5563" }}>
              자세한 내용은 나중에 추가하고, 지금은 임시 안내 문구를 넣어둔 상태입니다.
            </p>

            <ul
              style={{
                paddingLeft: "20px",
                marginTop: 0,
                marginBottom: "20px",
                lineHeight: 1.7,
              }}
            >
              <li>공모전 주제와 팀 목표를 먼저 확인해 주세요.</li>
              <li>모집 포지션과 역할 분담을 명확히 작성하거나 확인해 주세요.</li>
              <li>연락 가능한 시간과 협업 방식을 미리 조율해 주세요.</li>
              <li>예의 없는 문의나 장난성 신청은 제한될 수 있습니다.</li>
            </ul>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={closeNoticeModal}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={confirmNoticeModal}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #2563eb",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                확인하고 계속
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}