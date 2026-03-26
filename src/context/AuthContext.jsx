import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "contest-hub-auth-user";

const MOCK_USER = {
  id: "user-001",
  email: "demo@contesthub.com",
  nickname: "박상우",
  bio: "공모전과 해커톤 프로젝트를 진행 중입니다.",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = ({ email, nickname }) => {
    const nextUser = {
      ...MOCK_USER,
      email: email?.trim() || MOCK_USER.email,
      nickname: nickname?.trim() || MOCK_USER.nickname,
    };

    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => {
    return {
      user,
      isLoggedIn: Boolean(user),
      login,
      logout,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}