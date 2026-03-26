import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import teamsData from "../../data/public_teams.json";

export default function SubmitSection({ hackathon, onSubmitted }) {
  const { isLoggedIn, user } = useAuth();

  const config = hackathon?.submissionConfig || {
    allowedFileTypes: ["zip", "pdf"],
    maxFileSizeMB: 20,
    description: "파일을 제출하세요.",
  };
  const availableTeams = useMemo(() => {
  return teamsData.filter((team) => team.hackathonSlug === hackathon?.slug);
}, [hackathon?.slug]);

const [teamName, setTeamName] = useState("");
useEffect(() => {
  if (availableTeams.length === 1) {
    setTeamName(availableTeams[0].name || availableTeams[0].teamName || "");
  }
}, [availableTeams]);
const [notes, setNotes] = useState("");
const [file, setFile] = useState(null);
const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop().toLowerCase();

    if (!config.allowedFileTypes.includes(ext)) {
      alert(`허용된 파일 형식: ${config.allowedFileTypes.join(", ")}`);
      return;
    }

    if (selectedFile.size > config.maxFileSizeMB * 1024 * 1024) {
      alert(`파일 크기는 ${config.maxFileSizeMB}MB 이하만 가능합니다.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!isLoggedIn) {
    alert("로그인 후 제출 가능합니다.");
    return;
  }

  if (!teamName.trim()) {
    alert("팀명을 입력해주세요.");
    return;
  }
  const matchedTeam = availableTeams.find((team) => {
  const currentName = (team.name || team.teamName || "").trim().toLowerCase();
  return currentName === teamName.trim().toLowerCase();
});

if (!matchedTeam) {
  alert("현재 공모전 참가팀 중에서 팀을 선택해주세요.");
  return;
}

  if (!file) {
    alert("파일을 선택해주세요.");
    return;
  }

  const submission = {
    hackathonSlug: hackathon.slug,
    teamName: matchedTeam.name || matchedTeam.teamName,
    teamCode: matchedTeam.teamCode,
    submittedAt: new Date().toISOString(),
    notes,
    artifactName: file.name,
    artifactType: file.name.split(".").pop().toLowerCase(),
    submittedBy: user?.nickname || "익명",
    metrics: {
      accuracy: Math.floor(Math.random() * 21) + 80,
      speed: Math.floor(Math.random() * 21) + 80,
      presentation: Math.floor(Math.random() * 21) + 80,
    },
  };

  try {
    const prev = JSON.parse(localStorage.getItem("hackathonSubmissions") || "[]");

    const filtered = prev.filter(
      (item) =>
        !(
          item.hackathonSlug === submission.hackathonSlug &&
          item.teamName?.trim().toLowerCase() === submission.teamName.trim().toLowerCase()
        )
    );

    const updated = [...filtered, submission];

    localStorage.setItem("hackathonSubmissions", JSON.stringify(updated));

    window.dispatchEvent(new Event("hackathon-submission-updated"));

    if (onSubmitted) {
      onSubmitted(submission);
    }

    setSubmitted(true);
    setNotes("");
    setFile(null);
  } catch (error) {
    console.error("제출 저장 실패:", error);
    alert("제출 저장 중 오류가 발생했습니다.");
  }
};

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* 제출 가이드 */}
      <section style={cardStyle}>
        <h2>제출 가이드</h2>
        <p style={{ color: "#374151" }}>{config.description}</p>

        <ul style={{ marginTop: "10px", color: "#6b7280" }}>
          <li>허용 파일: {config.allowedFileTypes.join(", ")}</li>
          <li>최대 용량: {config.maxFileSizeMB}MB</li>
        </ul>
      </section>

      {/* 제출 폼 */}
      <section style={cardStyle}>
        <h2>제출하기</h2>

        {!isLoggedIn && (
          <p style={{ color: "#dc2626" }}>
            제출하려면 로그인해야 합니다.
          </p>
        )}

        {submitted ? (
          <div style={{ color: "#047857", fontWeight: 600 }}>
  제출이 완료되었습니다. 리더보드에 반영됩니다.
</div>
        ) : (
          
          <form onSubmit={handleSubmit}>
          {availableTeams.length === 0 && (
  <p style={{ color: "#dc2626", marginBottom: "12px" }}>
    현재 이 공모전에 등록된 참가팀이 없습니다.
  </p>
)}
          <div style={{ marginBottom: "16px" }}>
  <label style={labelStyle}>팀 선택 *</label>
  <select
    value={teamName}
    onChange={(e) => setTeamName(e.target.value)}
    style={inputStyle}
  >
    <option value="">참가팀을 선택하세요</option>
    {availableTeams.map((team) => {
      const displayName = team.name || team.teamName || "이름 없는 팀";
      return (
        <option key={team.teamCode} value={displayName}>
          {displayName}
        </option>
      );
    })}
  </select>
</div>
            {/* notes */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>메모 (선택)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="추가 설명이나 참고사항을 입력하세요."
                style={inputStyle}
              />
            </div>

            {/* file */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>파일 업로드 *</label>
              <input
  type="file"
  accept={config.allowedFileTypes.map((ext) => `.${ext}`).join(",")}
  onChange={handleFileChange}
/>
            </div>

            <button
  type="submit"
  style={{
    ...buttonStyle,
    opacity: availableTeams.length === 0 ? 0.5 : 1,
    cursor: availableTeams.length === 0 ? "not-allowed" : "pointer",
  }}
  disabled={availableTeams.length === 0}
>
  제출하기
</button>
          </form>
        )}
      </section>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  backgroundColor: "#ffffff",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};