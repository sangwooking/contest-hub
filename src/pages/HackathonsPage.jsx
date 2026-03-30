import { useState } from "react";
import hackathons from "../data/public_hackathons.json";
import HackathonCard from "../components/hackathons/HackathonCard";

export default function HackathonsPage() {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");

  const allTags = [
    "전체",
    ...new Set(hackathons.flatMap((h) => h.tags || [])),
  ];

  const filteredHackathons = hackathons.filter((item) => {
    const matchTag =
      selectedTag === "전체" || item.tags?.includes(selectedTag);

    const matchStatus =
      selectedStatus === "전체" || item.status === selectedStatus;

    return matchTag && matchStatus;
  });

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>공모전 목록</h1>

      {/* 🔥 필터 UI */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="전체">전체</option>
          <option value="upcoming">모집중</option>
          <option value="ongoing">진행중</option>
          <option value="ended">종료</option>
        </select>
      </div>

      {filteredHackathons.length === 0 ? (
        <p>조건에 맞는 공모전이 없습니다.</p>
      ) : (
        filteredHackathons.map((hackathon) => (
          <HackathonCard key={hackathon.slug} hackathon={hackathon} />
        ))
      )}
    </div>
  );
}