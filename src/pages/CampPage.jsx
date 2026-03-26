import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import teamsData from "../data/public_teams.json";
import { useAuth } from "../context/AuthContext";

const CAMP_STORAGE_KEY = "contest-hub-camp-posts";

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
    ].join(" ")
  );
}

function getStoredCampPosts() {
  const savedValue = localStorage.getItem(CAMP_STORAGE_KEY);

  if (!savedValue) return [];

  try {
    const parsed = JSON.parse(savedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.removeItem(CAMP_STORAGE_KEY);
    return [];
  }
}

function TeamRecruitCard({ team, onDelete, onClose }) {
  const recruitType = inferRecruitType(team);
  const hackathonLabel = getDisplayHackathonLabel(team);

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
        {team.authorNickname && (
          <p style={{ margin: 0 }}>
            <strong>작성자:</strong> {team.authorNickname}
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
            <a
              href={team.contact.url}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 600,
              }}
            >
              연락하기
            </a>
          )}

          {team.isCustom && team.isOpen && (
            <button
              type="button"
              onClick={() => onClose?.(team.teamCode)}
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

          {team.isCustom && (
            <button
              type="button"
              onClick={() => onDelete?.(team.teamCode)}
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
  const { user, isLoggedIn } = useAuth();

  const selectedSlugFromQuery =
    searchParams.get("hackathon") || searchParams.get("slug") || "all";
  const shouldOpenCreateForm = searchParams.get("create") === "1";

  const [selectedSlug, setSelectedSlug] = useState(selectedSlugFromQuery);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(shouldOpenCreateForm);
  const [customTeams, setCustomTeams] = useState(() => getStoredCampPosts());

  const [newPost, setNewPost] = useState({
    teamName: "",
    recruitType: "hackathon",
    hackathonSlug: selectedSlugFromQuery !== "all" ? selectedSlugFromQuery : "",
    intro: "",
    isOpen: true,
    lookingFor: "",
    contactUrl: "",
  });

  useEffect(() => {
    localStorage.setItem(CAMP_STORAGE_KEY, JSON.stringify(customTeams));
  }, [customTeams]);

  const allTeamsSource = useMemo(() => {
    return [...customTeams, ...teamsData];
  }, [customTeams]);

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
          hackathonSlug: nextValue === "free" ? "" : prev.hackathonSlug,
        };
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const handleCreatePost = () => {
    if (!newPost.teamName.trim() || !newPost.intro.trim()) {
      alert("팀명과 소개는 필수입니다.");
      return;
    }

    const normalizedRecruitType = newPost.recruitType;
    const normalizedHackathonSlug =
      normalizedRecruitType === "free"
        ? "free-recruit"
        : newPost.hackathonSlug.trim() || "open-hackathon";

    const createdTeam = {
      teamCode: `custom-team-${Date.now()}`,
      hackathonSlug: normalizedHackathonSlug,
      recruitType: normalizedRecruitType,
      name: newPost.teamName.trim(),
      isOpen: newPost.isOpen,
      memberCount: 1,
      lookingFor: newPost.lookingFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      intro: newPost.intro.trim(),
      contact: newPost.contactUrl.trim()
        ? {
            type: "link",
            url: newPost.contactUrl.trim(),
          }
        : null,
      createdAt: new Date().toISOString(),
      authorId: user?.id || "guest-user",
      authorNickname: user?.nickname || "게스트",
      leaderId: user?.id || "guest-user",
      isCustom: true,
    };

    setCustomTeams((prev) => [createdTeam, ...prev]);

    setNewPost({
      teamName: "",
      recruitType: normalizedRecruitType,
      hackathonSlug:
        normalizedRecruitType === "hackathon" && selectedSlug !== "all"
          ? selectedSlug
          : "",
      intro: "",
      isOpen: true,
      lookingFor: "",
      contactUrl: "",
    });

    setShowCreateForm(false);
  };

  const handleDeletePost = (teamCode) => {
    const ok = window.confirm("이 모집글을 삭제할까요?");
    if (!ok) return;

    setCustomTeams((prev) => prev.filter((team) => team.teamCode !== teamCode));
  };

  const handleCloseRecruit = (teamCode) => {
    setCustomTeams((prev) =>
      prev.map((team) =>
        team.teamCode === teamCode ? { ...team, isOpen: false } : team
      )
    );
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
            onClick={() => setShowCreateForm((prev) => !prev)}
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
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>팀 모집글 생성</h2>

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
                로그인하지 않아도 작성은 가능하지만, 작성자는 게스트로 저장됩니다.
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
              onClick={handleCreatePost}
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
              모집글 생성
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

          {hackathonRecruitTeams.length === 0 ? (
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
                  key={`${team.teamCode}-${team.createdAt}`}
                  team={team}
                  onDelete={handleDeletePost}
                  onClose={handleCloseRecruit}
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

          {freeRecruitTeams.length === 0 ? (
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
                  key={`${team.teamCode}-${team.createdAt}`}
                  team={team}
                  onDelete={handleDeletePost}
                  onClose={handleCloseRecruit}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}