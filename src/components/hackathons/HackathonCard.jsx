import { Link } from "react-router";
import hackathons from "../../data/public_hackathons.json";

function getStatusLabel(status) {
  if (status === "ongoing") return "진행중";
  if (status === "upcoming") return "예정";
  if (status === "ended") return "종료";
  return status;
}

export default function HackathonCard({ hackathon }) {
  return (
    <Link
      to={`/hackathons/${hackathon.slug}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: "#fff",
        }}
      >
        <img
          src={hackathon.thumbnailUrl}
          alt={hackathon.title}
          style={{
            width: "100%",
            maxWidth: "360px",
            height: "180px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        />

        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 8px",
              borderRadius: "999px",
              backgroundColor: "#f3f4f6",
              fontSize: "12px",
              marginRight: "8px",
            }}
          >
            {getStatusLabel(hackathon.status)}
          </span>
        </div>

        <h3 style={{ margin: "0 0 8px 0" }}>{hackathon.title}</h3>

        <p style={{ margin: "0 0 8px 0", color: "#555" }}>
          마감일: {new Date(hackathon.period.submissionDeadlineAt).toLocaleString("ko-KR")}
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {hackathon.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                backgroundColor: "#eef2ff",
                borderRadius: "999px",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}