import { Link, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "홈" },
  { to: "/hackathons", label: "공모전" },
  { to: "/camp", label: "팀 모집" },
  { to: "/forum", label: "커뮤니티" },
  { to: "/rankings", label: "랭킹" },
];

function isActivePath(currentPath, targetPath) {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export default function Layout({ children }) {
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#111827",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 800,
                fontSize: "20px",
              }}
            >
              Contest Hub
            </Link>

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {navItems.map((item) => {
                const active = isActivePath(location.pathname, item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: active ? "#1d4ed8" : "#374151",
                      backgroundColor: active ? "#eff6ff" : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {isLoggedIn ? (
              <>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#4b5563",
                    fontWeight: 600,
                  }}
                >
                  안녕하세요, {user?.nickname || "사용자"}님!
                </span>

                <Link
                  to="/user"
                  style={{
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 700,
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  마이페이지
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #dc2626",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 20px 40px",
        }}
      >
        {children}
      </main>

      <footer
        style={{
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          © 2026 Contest Hub
        </div>
      </footer>
    </div>
  );
}