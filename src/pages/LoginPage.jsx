import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) return;

    // 최소 구현: 회원가입/로그인 동일 처리
    login({
      email: form.email,
      nickname: form.nickname || "사용자",
    });

    navigate("/user"); // 로그인 후 마이페이지 이동
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>
          {mode === "login" ? "로그인" : "회원가입"}
        </h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          지금은 최소 구현 단계로 간단하게 로그인/회원가입이 동작합니다.
        </p>
      </div>

      <section
        style={{
          maxWidth: "520px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              이메일
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              비밀번호
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              style={inputStyle}
            />
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                닉네임
              </label>
              <input
                name="nickname"
                type="text"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임 입력"
                style={inputStyle}
              />
            </div>
          )}

          <button type="submit" style={buttonStyle}>
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          {mode === "login" ? (
            <p>
              계정이 없나요?{" "}
              <button onClick={() => setMode("signup")} style={linkButton}>
                회원가입
              </button>
            </p>
          ) : (
            <p>
              이미 계정이 있나요?{" "}
              <button onClick={() => setMode("login")} style={linkButton}>
                로그인
              </button>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#111827",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const linkButton = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};