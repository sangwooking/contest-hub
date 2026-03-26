import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/common/Layout";
import { AuthProvider } from "./context/AuthContext";

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

export default function App() {
  return (
    <AuthProvider>
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
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}