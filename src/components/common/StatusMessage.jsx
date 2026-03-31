import { Link } from "react-router";

const typeMap = {
  loading: {
    label: "불러오는 중",
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1d4ed8",
  },
  empty: {
    label: "데이터 없음",
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#92400e",
  },
  error: {
    label: "오류 발생",
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#b91c1c",
  },
};

export default function StatusMessage({
  type = "empty",
  title = "안내",
  message = "표시할 내용이 없습니다.",
  action,
  actionTo,
  actionLabel,
}) {
  const current = typeMap[type] || typeMap.empty;

  return (
    <section
      style={{
        border: `1px solid ${current.border}`,
        backgroundColor: current.bg,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "inline-block",
          marginBottom: "12px",
          padding: "6px 10px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: 700,
          color: current.text,
          backgroundColor: "#ffffff",
        }}
      >
        {current.label}
      </div>

      <h2 style={{ margin: "0 0 8px 0", fontSize: "22px" }}>{title}</h2>
      <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>{message}</p>

      {action ? (
        <div style={{ marginTop: "16px" }}>{action}</div>
      ) : actionTo && actionLabel ? (
        <div style={{ marginTop: "16px" }}>
          <Link
            to={actionTo}
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
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}