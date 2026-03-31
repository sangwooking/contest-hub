import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/common/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ForumDetailPage from "./pages/ForumDetailPage";
import HomePage from "./pages/HomePage";
import HackathonsPage from "./pages/HackathonsPage";
import HackathonDetailPage from "./pages/HackathonDetailPage";
import CampPage from "./pages/CampPage";
import ForumPage from "./pages/ForumPage";
import RankingsPage from "./pages/RankingsPage";
import UserPage from "./pages/UserPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ color: "red" }}>로딩중...</div>;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="/hackathons/:slug" element={<HackathonDetailPage />} />
          <Route path="/camp" element={<CampPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/forum/:postId" element={<ForumDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/mypage/:userId" element={<UserPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}