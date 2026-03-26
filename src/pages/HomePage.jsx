import { Link } from "react-router";
import hackathons from "../data/public_hackathons.json";
import teams from "../data/public_teams.json";
import leaderboardData from "../data/public_leaderboard.json";

const FORUM_HIGHLIGHTS = [
  {
    id: "post-001",
    category: "자유",
    title: "이번 주말 해커톤 준비 같이 하실 분 있나요?",
    content:
      "주말 동안 아이디어 정리하고 간단한 와이어프레임까지 같이 잡아보실 분 찾습니다.",
    author: "ContestStarter",
    createdAt: "2026-03-26T10:30:00",
  },
  {
    id: "post-002",
    category: "질문",
    title: "공모전 기획서 분량은 어느 정도가 적당할까요?",
    content:
      "처음 제출해보는 거라 너무 길게 써야 할지, 핵심만 간단히 적어야 할지 고민됩니다.",
    author: "IdeaMaker",
    createdAt: "2026-03-25T18:10:00",
  },
  {
    id: "post-003",
    category: "정보",
    title: "발표 자료 만들 때 심사위원이 보기 좋은 구성 팁",
    content:
      "문제 정의 → 해결 방식 → 기대 효과 → 시연 흐름으로 잡으면 전달력이 훨씬 좋아집니다.",
    author: "SlideRunner",
    createdAt: "2026-03-24T14:20:00",
  },
  {
    id: "post-004",
    category: "팀빌딩",
    title: "디자이너 구하는 분들은 어떤 포트폴리오를 보시나요?",
    content:
      "팀원 모집할 때 디자이너 지원자를 볼 때 어떤 기준으로 판단하는지 궁금합니다.",
    author: "BuildTogether",
    createdAt: "2026-03-23T21:05:00",
  },
];

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

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

function truncateText(value, maxLength = 70) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function getFeaturedHackathon(list) {
  const now = Date.now();

  const candidates = list
    .filter((item) => item?.period?.submissionDeadlineAt)
    .map((item) => ({
      ...item,
      deadlineTime: new Date(item.period.submissionDeadlineAt).getTime(),
    }))
    .filter((item) => !Number.isNaN(item.deadlineTime));

  const activeCandidates = candidates
    .filter((item) => item.deadlineTime >= now)
    .sort((a, b) => a.deadlineTime - b.deadlineTime);

  if (activeCandidates.length > 0) {
    return activeCandidates[0];
  }

  return candidates.sort((a, b) => b.deadlineTime - a.deadlineTime)[0] || null;
}

function getLatestOpenTeam(list) {
  const openTeams = list.filter((team) => team.isOpen);
  const target = openTeams.length > 0 ? openTeams : list;

  return [...target].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0] || null;
}

function getTopRankingEntry(data) {
  const primaryTopEntry = (data.entries || []).find((entry) => entry.rank === 1);

  if (primaryTopEntry) {
    return {
      hackathonSlug: data.hackathonSlug,
      updatedAt: data.updatedAt,
      ...primaryTopEntry,
    };
  }

  const extraTopEntry = (data.extraLeaderboards || [])
    .flatMap((board) =>
      (board.entries || []).map((entry) => ({
        hackathonSlug: board.hackathonSlug,
        updatedAt: board.updatedAt,
        ...entry,
      }))
    )
    .find((entry) => entry.rank === 1);

  return extraTopEntry || null;
}

function getPopularForumPost(list) {
  return [...list].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0] || null;
}

function SummaryCard({ eyebrow, title, description, meta, actionLabel, to }) {
  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "22px",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        minHeight: "260px",
      }}
    >
      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "13px",
          fontWeight: 700,
          color: "#2563eb",
        }}
      >
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "0 0 12px 0",
          fontSize: "22px",
          lineHeight: 1.4,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "0 0 18px 0",
          color: "#4b5563",
          lineHeight: 1.7,
          flexGrow: 1,
        }}
      >
        {description}
      </p>

      <div
        style={{
          borderTop: "1px solid #f1f5f9",
          paddingTop: "14px",
          marginTop: "auto",
        }}
      >
        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#6b7280" }}>
          {meta}
        </p>

        <Link
          to={to}
          style={{
            display: "inline-flex",
            textDecoration: "none",
            color: "#111827",
            fontWeight: 700,
          }}
        >
          {actionLabel} →
        </Link>
      </div>
    </article>
  );
}

export default function HomePage() {
  const featuredHackathon = getFeaturedHackathon(hackathons);
  const latestTeamPost = getLatestOpenTeam(teams);
  const topRankingEntry = getTopRankingEntry(leaderboardData);
  const popularForumPost = getPopularForumPost(FORUM_HIGHLIGHTS);

  return (
    <div>
      <section
        style={{
          padding: "32px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
          border: "1px solid #dbeafe",
          marginBottom: "28px",
        }}
      >
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          Contest Hub
        </p>

        <h1 style={{ margin: "0 0 14px 0", fontSize: "36px", lineHeight: 1.3 }}>
          이번 주 주목할 공모전과 팀 모집, 랭킹, 커뮤니티를 한눈에 확인해보세요.
        </h1>
{/*
        <p
          style={{
            margin: 0,
            color: "#475569",
            lineHeight: 1.7,
            maxWidth: "760px",
          }}
        >
          중간에 글 추가
        </p>
*/}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        <SummaryCard
          eyebrow="이번 주 인기 공모전"
          title={featuredHackathon?.title || "표시할 공모전이 없습니다."}
          description={
            featuredHackathon
              ? `${featuredHackathon.tags?.join(" · ") || "태그 없음"} · 가장 가까운 일정의 공모전을 메인에서 바로 확인할 수 있습니다.`
              : "아직 공모전 데이터가 없습니다."
          }
          meta={
            featuredHackathon
              ? `마감일 ${formatDate(featuredHackathon.period?.submissionDeadlineAt)}`
              : "공모전 정보를 준비 중입니다."
          }
          actionLabel="공모전 보러가기"
          to={featuredHackathon?.links?.detail || "/hackathons"}
        />

        <SummaryCard
          eyebrow="팀 모집 최신글"
          title={latestTeamPost?.name || "표시할 팀 모집 글이 없습니다."}
          description={
            latestTeamPost
              ? `${truncateText(latestTeamPost.intro, 78)}`
              : "아직 팀 모집 글이 없습니다."
          }
          meta={
            latestTeamPost
              ? `모집 포지션 ${latestTeamPost.lookingFor?.join(", ") || "없음"} · ${formatDateTime(latestTeamPost.createdAt)}`
              : "팀 모집 정보를 준비 중입니다."
          }
          actionLabel="팀 모집 보러가기"
          to={latestTeamPost ? `/camp?slug=${latestTeamPost.hackathonSlug}` : "/camp"}
        />

        <SummaryCard
          eyebrow="랭킹 TOP"
          title={
            topRankingEntry
              ? `${topRankingEntry.rank}위 ${topRankingEntry.teamName}`
              : "표시할 랭킹이 없습니다."
          }
          description={
            topRankingEntry
              ? `${topRankingEntry.hackathonSlug} 리더보드에서 현재 대표 팀으로 보여줄 수 있는 1위 기록입니다.`
              : "아직 랭킹 데이터가 없습니다."
          }
          meta={
            topRankingEntry
              ? `점수 ${topRankingEntry.score} · 제출 ${formatDateTime(topRankingEntry.submittedAt)}`
              : "랭킹 정보를 준비 중입니다."
          }
          actionLabel="랭킹 보러가기"
          to="/rankings"
        />

        <SummaryCard
          eyebrow="게시판 인기글"
          title={popularForumPost?.title || "표시할 게시글이 없습니다."}
          description={
            popularForumPost
              ? truncateText(popularForumPost.content, 78)
              : "아직 게시글이 없습니다."
          }
          meta={
            popularForumPost
              ? `${popularForumPost.category} · ${popularForumPost.author} · ${formatDateTime(popularForumPost.createdAt)}`
              : "게시판 정보를 준비 중입니다."
          }
          actionLabel="게시판 보러가기"
          to={popularForumPost ? `/forum/${popularForumPost.id}` : "/forum"}
        />
      </section>
    </div>
  );
}
