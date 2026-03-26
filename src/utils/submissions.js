const KEY = "contesthub_submissions";

export function getSubmissions() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSubmissions(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function createSubmission({ hackathonSlug, user, notes, file }) {
  const all = getSubmissions();

  const newItem = {
    id: crypto.randomUUID(),
    hackathonSlug,
    userId: user.id,
    userNickname: user.nickname,
    notes,
    fileName: file.name,
    fileSize: file.size,
    score: Math.floor(60 + Math.random() * 40), // 60~100
    createdAt: new Date().toISOString(),
  };

  saveSubmissions([newItem, ...all]);

  return newItem;
}

export function getSubmissionsBySlug(slug) {
  return getSubmissions().filter((s) => s.hackathonSlug === slug);
}
