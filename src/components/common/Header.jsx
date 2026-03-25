import { Link } from "react-router";

export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid #ddd", padding: "10px 20px" }}>
      <nav style={{ display: "flex", gap: "15px" }}>
        <Link to="/">홈</Link>
        <Link to="/hackathons">공모전</Link>
        <Link to="/camp">팀 모집</Link>
        <Link to="/forum">커뮤니티</Link>
        <Link to="/rankings">랭킹</Link>
        <Link to="/user">마이페이지</Link>
      </nav>
    </header>
  );
}