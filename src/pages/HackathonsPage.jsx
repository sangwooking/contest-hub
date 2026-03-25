import hackathons from "../data/public_hackathons.json";
import HackathonCard from "../components/hackathons/HackathonCard";

export default function HackathonsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>공모전 목록</h1>

      {hackathons.length === 0 ? (
        <p>등록된 공모전이 없습니다.</p>
      ) : (
        hackathons.map((hackathon) => (
          <HackathonCard key={hackathon.slug} hackathon={hackathon} />
        ))
      )}
    </div>
  );
}