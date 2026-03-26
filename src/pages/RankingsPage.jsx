import { useMemo, useState } from "react";
import { Link } from "react-router";
import leaderboardData from "../data/public_leaderboard.json";

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

function formatScore(score) {
  if (score === undefined || score === null || Number.isNaN(Number(score))) {
    return "-";
  }

  const numericScore = Number(score);

  if (Number.isInteger(numericScore)) {
    return numericScore.toString();
  }

  if (numericScore >= 10) {
    return numericScore.toFixed(1);
  }

  return numericScore.toFixed(4);
}

function buildLeaderboardList(data) {
  return [
    {
      hackathonSlug: data.hackathonSlug,
      updatedAt: data.updatedAt,
      entries: data.entries || [],
    },
    ...(data.extraLeaderboards || []),
  ];
}

function getLatestUpdatedAtTimestamp(boards) {
  if (!boards.length) return null;

  const timestamps = boards
    .map((board) => new Date(board.updatedAt).getTime())
    .filter((time) => !Number.isNaN(time));

  if (!timestamps.length) return null;

  return Math.max(...timestamps);
}

export default function RankingsPage() {
  const [selectedSlug, setSelectedSlug] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [sortType, setSortType] = useState("rank");

  const leaderboardList = useMemo(
    () => buildLeaderboardList(leaderboardData),
    []
  );

  const hackathonOptions = useMemo(() => {
    return leaderboardList.map((board) => board.hackathonSlug);
  }, [leaderboardList]);

  const filteredLeaderboards = useMemo(() => {
    const keywordLower = normalizeText(keyword);

    return leaderboardList
      .filter((board) => {
        const matchesSlug =
          selectedSlug === "all" ? true : board.hackathonSlug === selectedSlug;

        const matchesKeyword = keywordLower
          ? (board.entries || []).some((entry) =>
              normalizeText(
                [
                  entry.teamName,
                  board.hackathonSlug,
                  entry.score,
                  entry.scoreBreakdown?.participant,
                  entry.scoreBreakdown?.judge,
                  entry.artifacts?.planTitle,
                ].join(" ")
              ).includes(keywordLower)
            )
          : true;

        return matchesSlug && matchesKeyword;
      })
      .map((board) => {
        const nextEntries = [...(board.entries || [])];

        nextEntries.sort((a, b) => {
          if (sortType === "score") {
            return Number(b.score || 0) - Number(a.score || 0);
          }

          if (sortType === "latest") {
            return (
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
            );
          }

          return Number(a.rank || 9999) - Number(b.rank || 9999);
        });

        return {
          ...board,
          entries: nextEntries,
        };
      });
  }, [leaderboardList, selectedSlug, keyword, sortType]);

  const totalBoards = filteredLeaderboards.length;

  const totalEntries = filteredLeaderboards.reduce((acc, board) => {
    return acc + (board.entries?.length || 0);
  }, 0);

  const topScore = filteredLeaderboards.reduce((best, board) => {
    const boardTopScore = Math.max(
      ...((board.entries || []).map((entry) => Number(entry.score || 0)))
    );

    if (!Number.isFinite(boardTopScore)) return best;
    return Math.max(best, boardTopScore);
  }, 0);

  const latestUpdatedAt = getLatestUpdatedAtTimestamp(filteredLeaderboards);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>랭킹</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          공모전별 리더보드를 모아 보고 팀 점수와 제출 결과를 확인할 수 있습니다.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>리더보드 수</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {totalBoards}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>팀 수</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {totalEntries}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>최고 점수</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
            {totalEntries > 0 ? formatScore(topScore) : "-"}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#6b7280" }}>최근 업데이트</p>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
            {latestUpdatedAt ? formatDateTime(latestUpdatedAt) : "-"}
          </p>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>필터</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label
              htmlFor="rankings-slug"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              공모전 선택
            </label>
            <select
              id="rankings-slug"
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="all">전체 공모전</option>
              {hackathonOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rankings-keyword"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              팀 검색
            </label>
            <input
              id="rankings-keyword"
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="팀명, 기획서명, 점수 검색"
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

          <div>
            <label
              htmlFor="rankings-sort"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              정렬
            </label>
            <select
              id="rankings-sort"
              value={sortType}
              onChange={(event) => setSortType(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="rank">기본 순위순</option>
              <option value="score">점수 높은순</option>
              <option value="latest">최신 제출순</option>
            </select>
          </div>
        </div>
      </section>

      {filteredLeaderboards.length === 0 ? (
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "28px 20px",
            backgroundColor: "#ffffff",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>조건에 맞는 리더보드가 없습니다.</p>
          <p style={{ margin: 0 }}>공모전 선택이나 검색어를 바꿔서 다시 확인해보세요.</p>
        </section>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredLeaderboards.map((board) => (
            <section
              key={board.hackathonSlug}
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
                <div>
                  <h2 style={{ margin: "0 0 6px 0" }}>{board.hackathonSlug}</h2>
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    업데이트: {formatDateTime(board.updatedAt)}
                  </p>
                </div>

                <Link
                  to={`/hackathons/${board.hackathonSlug}`}
                  style={{
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  해당 공모전 보기
                </Link>
              </div>

              {(board.entries || []).length === 0 ? (
                <p style={{ margin: 0, color: "#6b7280" }}>
                  리더보드 항목이 없습니다.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {board.entries.map((entry, index) => (
                    <article
                      key={`${board.hackathonSlug}-${entry.teamName}-${index}`}
                      style={{
                        border: "1px solid #f1f5f9",
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
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              color: "#2563eb",
                              fontWeight: 700,
                            }}
                          >
                            #{entry.rank}
                          </p>
                          <h3 style={{ margin: 0 }}>{entry.teamName}</h3>
                        </div>

                        <div
                          style={{
                            padding: "8px 12px",
                            borderRadius: "999px",
                            border: "1px solid #dbeafe",
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                          }}
                        >
                          점수 {formatScore(entry.score)}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                            제출일
                          </p>
                          <p style={{ margin: 0 }}>{formatDateTime(entry.submittedAt)}</p>
                        </div>

                        {entry.scoreBreakdown?.participant !== undefined && (
                          <div>
                            <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                              참가자 점수
                            </p>
                            <p style={{ margin: 0 }}>
                              {formatScore(entry.scoreBreakdown.participant)}
                            </p>
                          </div>
                        )}

                        {entry.scoreBreakdown?.judge !== undefined && (
                          <div>
                            <p style={{ margin: "0 0 6px 0", color: "#6b7280" }}>
                              심사위원 점수
                            </p>
                            <p style={{ margin: 0 }}>
                              {formatScore(entry.scoreBreakdown.judge)}
                            </p>
                          </div>
                        )}
                      </div>

                      {entry.artifacts && (
                        <div
                          style={{
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontWeight: 700,
                            }}
                          >
                            제출 산출물
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            {entry.artifacts.planTitle && (
                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "999px",
                                  backgroundColor: "#f3f4f6",
                                  fontSize: "14px",
                                }}
                              >
                                {entry.artifacts.planTitle}
                              </span>
                            )}

                            {entry.artifacts.webUrl && (
                              <a
                                href={entry.artifacts.webUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#2563eb",
                                  fontWeight: 600,
                                }}
                              >
                                웹 보기
                              </a>
                            )}

                            {entry.artifacts.pdfUrl && (
                              <a
                                href={entry.artifacts.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#111827",
                                  fontWeight: 600,
                                }}
                              >
                                PDF 보기
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}