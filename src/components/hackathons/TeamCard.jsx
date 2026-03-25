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

export default function TeamCard({ team }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        backgroundColor: "#ffffff",
        marginBottom: "12px",
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 8px",
            borderRadius: "999px",
            backgroundColor: team.isOpen ? "#dcfce7" : "#f3f4f6",
            color: team.isOpen ? "#166534" : "#4b5563",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {team.isOpen ? "모집중" : "모집완료"}
        </span>
      </div>

      <h3 style={{ margin: "0 0 8px 0" }}>{team.name}</h3>

      <p style={{ margin: "0 0 8px 0", color: "#374151" }}>
        팀 코드: {team.teamCode}
      </p>

      <p style={{ margin: "0 0 8px 0", color: "#374151" }}>
        현재 인원: {team.memberCount}명
      </p>

      <p style={{ margin: "0 0 8px 0" }}>{team.intro}</p>

      <div style={{ marginBottom: "8px" }}>
        <strong>모집 포지션:</strong>{" "}
        {team.lookingFor?.length > 0 ? team.lookingFor.join(", ") : "없음"}
      </div>

      {team.contact?.url && (
        <p style={{ margin: "0 0 8px 0" }}>
          연락 링크:{" "}
          <a href={team.contact.url} target="_blank" rel="noreferrer">
            {team.contact.url}
          </a>
        </p>
      )}

      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
        생성일: {formatDateTime(team.createdAt)}
      </p>
    </div>
  );
}