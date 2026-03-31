import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/common/StatusMessage";

function getFirebaseErrorMessage(message) {
  if (!message) return "로그인 또는 회원가입 중 문제가 발생했습니다.";
  if (message.includes("auth/invalid-credential")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (message.includes("auth/email-already-in-use")) {
    return "이미 가입된 이메일입니다.";
  }
  if (message.includes("auth/weak-password")) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (message.includes("auth/invalid-email")) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  return "로그인 또는 회원가입 중 문제가 발생했습니다.";
}

export default function LoginPage() {
  const { login, signup, clearError } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    clearError();


  if (!form.email.trim() || !form.password.trim()) {
    alert("이메일과 비밀번호를 입력해주세요");
    return;
  }

  if (mode === "signup") {
    const result = await signup({
      email: form.email,
      password: form.password,
      nickname: form.nickname,
    });

    if (!result.ok) {
      alert(result.message);

      return;
    }
  }
    if (mode === "signup" && !form.nickname.trim()) {
      setError("회원가입 시 닉네임을 입력해 주세요.");
      return;
    }

    if (mode === "signup") {
      const result = await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      });

      if (!result.ok) {
        setError(getFirebaseErrorMessage(result.message));
        return;
      }
    } else {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      if (!result.ok) {
        setError(getFirebaseErrorMessage(result.message));
        return;
      }
    }

    navigate("/user");
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "8px" }}>
          {mode === "login" ? "로그인" : "회원가입"}
        </h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          이메일과 비밀번호로 로그인하거나 회원가입할 수 있습니다.
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

        {error && (
          <div style={{ marginTop: "16px" }}>
            <StatusMessage
              type="error"
              title={mode === "login" ? "로그인 실패" : "회원가입 실패"}
              message={error}
            />
          </div>
        )}

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          {mode === "login" ? (
            <p>
              계정이 없나요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  clearError();
                }}
                style={linkButton}
              >
                회원가입
              </button>
            </p>
          ) : (
            <p>
              이미 계정이 있나요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  clearError();
                }}
                style={linkButton}
              >
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