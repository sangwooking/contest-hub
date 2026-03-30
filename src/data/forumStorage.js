const STORAGE_KEY = "forum-posts";

const INITIAL_POSTS = [
  {
    id: "post-001",
    category: "자유",
    title: "이번 주말 해커톤 준비 같이 하실 분 있나요?",
    content:
      "주말 동안 아이디어 정리하고 간단한 와이어프레임까지 같이 잡아보실 분 찾습니다.",
    author: "ContestStarter",
    createdAt: "2026-03-26T10:30:00",
    comments: [],
  },
  {
    id: "post-002",
    category: "질문",
    title: "공모전 기획서 분량은 어느 정도가 적당할까요?",
    content:
      "처음 제출해보는 거라 너무 길게 써야 할지, 핵심만 간단히 적어야 할지 고민됩니다.",
    author: "IdeaMaker",
    createdAt: "2026-03-25T18:10:00",
    comments: [],
  },
  {
    id: "post-003",
    category: "정보",
    title: "발표 자료 만들 때 심사위원이 보기 좋은 구성 팁",
    content:
      "문제 정의 → 해결 방식 → 기대 효과 → 시연 흐름으로 잡으면 전달력이 훨씬 좋아집니다.",
    author: "SlideRunner",
    createdAt: "2026-03-24T14:20:00",
    comments: [],
  },
  {
    id: "post-004",
    category: "팀빌딩",
    title: "디자이너 구하는 분들은 어떤 포트폴리오를 보시나요?",
    content:
      "팀원 모집할 때 디자이너 지원자를 볼 때 어떤 기준으로 판단하는지 궁금합니다.",
    author: "BuildTogether",
    createdAt: "2026-03-23T21:05:00",
    comments: [],
  },
];

function hasWindow() {
  return typeof window !== "undefined";
}

export function getForumPosts() {
  if (!hasWindow()) return INITIAL_POSTS;

  const storedPosts = window.localStorage.getItem(STORAGE_KEY);

  if (!storedPosts) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }

  try {
    const parsedPosts = JSON.parse(storedPosts);

    if (!Array.isArray(parsedPosts)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }

    return parsedPosts;
  } catch (error) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
}

export function saveForumPosts(posts) {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function createForumPost(post) {
  const currentPosts = getForumPosts();
  const nextPosts = [post, ...currentPosts];
  saveForumPosts(nextPosts);
  return nextPosts;
}

export function getForumPostById(postId) {
  const posts = getForumPosts();
  return posts.find((post) => post.id === postId);
}

export function addForumComment(postId, comment) {
  const currentPosts = getForumPosts();

  const nextPosts = currentPosts.map((post) => {
    if (post.id !== postId) return post;

    return {
      ...post,
      comments: [...(post.comments || []), comment],
    };
  });

  saveForumPosts(nextPosts);

  return nextPosts.find((post) => post.id === postId);
}