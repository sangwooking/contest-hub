import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/common/Layout";

import CampPage from "./pages/CampPage";
import ForumPage from "./pages/ForumPage";
import RankingsPage from "./pages/RankingsPage";
import UserPage from "./pages/UserPage";
import HomePage from "./pages/HomePage";
import HackathonsPage from "./pages/HackathonsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/camp" element={<CampPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}