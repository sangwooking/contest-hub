import { useMemo, useRef } from "react";
import { Link, useParams } from "react-router";
import hackathonDetailData from "../data/public_hackathon_detail.json";
import leaderboardData from "../data/public_leaderboard.json";
import teamsData from "../data/public_teams.json";
import TeamCard from "../components/hackathons/TeamCard";

function findHackathonDetailBySlug(slug) {
  const detailList = [
    {
      slug: hackathonDetailData.slug,
      title: hackathonDetailData.title,
      sections: hackathonDetailData.sections,
    },
    ...(hackathonDetailData.extraDetails || []),
  ];

  return detailList.find((item) => item.slug === slug);
}

function findLeaderboardBySlug(slug) {
  const leaderboardList = [
    {
      hackathonSlug: leaderboardData.hackathonSlug,
      updatedAt: leaderboardData.updatedAt,
      entries: leaderboardData.entries,
    },
    ...(leaderboardData.extraLeaderboards || []),
  ];

  return leaderboardList.find((item) => item.hackathonSlug === slug);
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

export default function HackathonDetailPage() {
  const { slug } = useParams();

  const detail = useMemo(() => findHackathonDetailBySlug(slug), [slug]);
  const relatedLeaderboard = useMemo(() => findLeaderboardBySlug(slug), [slug]);
  const relatedTeams = teamsData.filter(
  (team) => team.hackathonSlug === slug
);

  const overviewRef = useRef(null);
  const infoRef = useRef(null);
  const evalRef = useRef(null);
  const scheduleRef = useRef(null);
  const prizeRef = useRef(null);
  const teamsRef = useRef(null);
  const submitRef = useRef(null);
  const leaderboardRef = useRef(null);

  const sectionRefs = {
    overview: overviewRef,
    info: infoRef,
    eval: evalRef,
    schedule: scheduleRef,
    prize: prizeRef,
    teams: teamsRef,
    submit: submitRef,
    leaderboard: leaderboardRef,
  };

  const tabs = [
    { key: "overview", label: "개요" },
    { key: "info", label: "안내" },
    { key: "eval", label: "평가" },
    { key: "schedule", label: "일정" },
    { key: "prize", label: "상금" },
    { key: "teams", label: "팀" },
    { key: "submit", label: "제출" },
    { key: "leaderboard", label: "리더보드" },
  ];

  const scrollToSection = (key) => {
    const targetRef = sectionRefs[key];
    targetRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!detail) {
    return (
      <div>
        <Link
          to="/hackathons"
          style={{
            display: "inline-block",
            marginBottom: "16px",
            textDecoration: "none",
            color: "#2563eb",
          }}
        >
          ← 공모전 목록으로
        </Link>

        <h1 style={{ marginBottom: "12px" }}>공모전을 찾을 수 없습니다.</h1>
        <p>잘못된 주소이거나 존재하지 않는 공모전입니다.</p>
      </div>
    );
  }

  const { sections } = detail;

  const sectionStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "#ffffff",
    marginBottom: "20px",
    scrollMarginTop: "90px",
  };

  const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: "12px",
  };

  return (
    <div>
      <Link
        to="/hackathons"
        style={{
          display: "inline-block",
          marginBottom: "16px",
          textDecoration: "none",
          color: "#2563eb",
        }}
      >
        ← 공모전 목록으로
      </Link>

      <h1 style={{ marginBottom: "20px" }}>{detail.title}</h1>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#ffffff",
          padding: "12px 0",
          marginBottom: "24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => scrollToSection(tab.key)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#ffffff",
              color: "#111827",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section ref={overviewRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>개요</h2>
        <p style={{ marginBottom: "12px" }}>{sections.overview?.summary}</p>
        <p style={{ margin: 0 }}>
          개인 참여: {sections.overview?.teamPolicy?.allowSolo ? "가능" : "불가"} / 최대 팀원 수:{" "}
          {sections.overview?.teamPolicy?.maxTeamSize ?? "-"}명
        </p>
      </section>

      <section ref={infoRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>안내</h2>

        {(sections.info?.notice || []).length > 0 ? (
          <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
            {sections.info.notice.map((item, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p>안내 정보가 없습니다.</p>
        )}

        {sections.info?.links && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>관련 링크</p>

            {sections.info.links.rules && (
              <p style={{ margin: "0 0 8px 0" }}>
                규정:{" "}
                <a
                  href={sections.info.links.rules}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sections.info.links.rules}
                </a>
              </p>
            )}

            {sections.info.links.faq && (
              <p style={{ margin: 0 }}>
                FAQ:{" "}
                <a
                  href={sections.info.links.faq}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sections.info.links.faq}
                </a>
              </p>
            )}
          </div>
        )}
      </section>

      <section ref={evalRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>평가</h2>

        <p style={{ marginBottom: "8px" }}>
          <strong>평가 지표:</strong> {sections.eval?.metricName || "-"}
        </p>

        <p style={{ marginBottom: "12px" }}>
          {sections.eval?.description || "평가 설명이 없습니다."}
        </p>

        {sections.eval?.limits && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>제한 사항</p>
            <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
              {sections.eval.limits.maxRuntimeSec && (
                <li>최대 실행 시간: {sections.eval.limits.maxRuntimeSec}초</li>
              )}
              {sections.eval.limits.maxSubmissionsPerDay && (
                <li>일 최대 제출 횟수: {sections.eval.limits.maxSubmissionsPerDay}회</li>
              )}
            </ul>
          </div>
        )}

        {sections.eval?.scoreDisplay?.breakdown && (
          <div>
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>점수 구성</p>
            <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
              {sections.eval.scoreDisplay.breakdown.map((item) => (
                <li key={item.key}>
                  {item.label}: {item.weightPercent}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section ref={scheduleRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>일정</h2>

        {(sections.schedule?.milestones || []).length > 0 ? (
          <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
            {sections.schedule.milestones.map((milestone, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {milestone.name} - {formatDateTime(milestone.at)}
              </li>
            ))}
          </ul>
        ) : (
          <p>일정 정보가 없습니다.</p>
        )}
      </section>

      <section ref={prizeRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>상금</h2>

        {(sections.prize?.items || []).length > 0 ? (
          <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
            {sections.prize.items.map((item, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {item.place}: {item.amountKRW?.toLocaleString("ko-KR")}원
              </li>
            ))}
          </ul>
        ) : (
          <p>상금 정보가 없습니다.</p>
        )}
      </section>

      <section ref={teamsRef} style={sectionStyle}>
  <h2 style={sectionTitleStyle}>팀</h2>

  <p style={{ marginBottom: "12px" }}>
    팀 모집 활성화: {sections.teams?.campEnabled ? "예" : "아니오"}
  </p>

  {relatedTeams.length > 0 ? (
    <div>
      {relatedTeams.map((team) => (
        <TeamCard key={team.teamCode} team={team} />
      ))}
    </div>
  ) : (
    <p>현재 등록된 팀 모집글이 없습니다.</p>
  )}

  {sections.teams?.listUrl && (
  <p style={{ marginTop: "12px" }}>
    전체 팀 모집 페이지:{" "}
    <Link to={`/camp?hackathon=${slug}`}>
      팀 모집 더 보기
    </Link>
  </p>
)}
</section>

      <section ref={submitRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>제출</h2>

        <p style={{ marginBottom: "8px" }}>
          허용 형식: {(sections.submit?.allowedArtifactTypes || []).join(", ") || "-"}
        </p>

        {(sections.submit?.guide || []).length > 0 ? (
          <ul style={{ marginTop: 0, paddingLeft: "20px", marginBottom: "16px" }}>
            {sections.submit.guide.map((item, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p>제출 안내가 없습니다.</p>
        )}

        {sections.submit?.submissionItems && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ marginBottom: "8px", fontWeight: 600 }}>제출 항목</p>
            <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
              {sections.submit.submissionItems.map((item) => (
                <li key={item.key}>
                  {item.title} ({item.format})
                </li>
              ))}
            </ul>
          </div>
        )}

        {sections.submit?.submissionUrl && (
          <p style={{ margin: 0 }}>
            제출 경로: <Link to={sections.submit.submissionUrl}>{sections.submit.submissionUrl}</Link>
          </p>
        )}
      </section>

      <section ref={leaderboardRef} style={sectionStyle}>
        <h2 style={sectionTitleStyle}>리더보드</h2>

        <p style={{ marginBottom: "12px" }}>
          {sections.leaderboard?.note || "리더보드 안내가 없습니다."}
        </p>

        {relatedLeaderboard ? (
          <div>
            <p style={{ marginBottom: "12px", color: "#6b7280" }}>
              업데이트: {formatDateTime(relatedLeaderboard.updatedAt)}
            </p>

            {(relatedLeaderboard.entries || []).length > 0 ? (
              <div style={{ display: "grid", gap: "12px" }}>
                {relatedLeaderboard.entries.map((entry, index) => (
                  <div
                    key={`${entry.teamName}-${index}`}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontWeight: 700 }}>
                      #{entry.rank} {entry.teamName}
                    </p>

                    <p style={{ margin: "0 0 8px 0" }}>
                      점수: {entry.score}
                    </p>

                    <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>
                      제출일: {formatDateTime(entry.submittedAt)}
                    </p>

                    {entry.scoreBreakdown && (
                      <div style={{ marginBottom: "8px" }}>
                        <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>
                          점수 상세
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                          {entry.scoreBreakdown.participant !== undefined && (
                            <li>참가자 점수: {entry.scoreBreakdown.participant}</li>
                          )}
                          {entry.scoreBreakdown.judge !== undefined && (
                            <li>심사위원 점수: {entry.scoreBreakdown.judge}</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {entry.artifacts && (
                      <div>
                        <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>
                          제출 산출물
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                          {entry.artifacts.planTitle && (
                            <li>기획서: {entry.artifacts.planTitle}</li>
                          )}
                          {entry.artifacts.webUrl && (
                            <li>
                              웹 링크:{" "}
                              <a
                                href={entry.artifacts.webUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {entry.artifacts.webUrl}
                              </a>
                            </li>
                          )}
                          {entry.artifacts.pdfUrl && (
                            <li>
                              PDF:{" "}
                              <a
                                href={entry.artifacts.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {entry.artifacts.pdfUrl}
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>리더보드 항목이 없습니다.</p>
            )}
          </div>
        ) : (
          <p>현재 공개된 리더보드 데이터가 없습니다.</p>
        )}

        {sections.leaderboard?.publicLeaderboardUrl && (
          <p style={{ marginTop: "12px", marginBottom: 0 }}>
            리더보드 경로:{" "}
            <Link to={sections.leaderboard.publicLeaderboardUrl}>
              {sections.leaderboard.publicLeaderboardUrl}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}