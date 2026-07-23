const boardPosts = {
  notice: [
    {
      title: "익명 문의 이용 전 개인정보 입력 주의 안내",
      summary: "주민등록번호, 계좌번호, 가족 연락처 등 민감정보는 본문에 남기지 마세요.",
      meta: ["공지", "운영 안내"],
    },
    {
      title: "회생의 전설 게시판 운영 방식",
      summary: "문의는 기본 비밀글로 접수되며 관리자가 확인 후 답변합니다.",
      meta: ["공지", "익명 문의"],
    },
  ],
  blog: [
    {
      title: "부산 개인회생 신청 전 확인해야 할 조건",
      summary: "소득, 채무 금액, 재산, 부양가족을 중심으로 기본 조건을 살펴봅니다.",
      meta: ["회생 블로그", "부산 개인회생"],
    },
    {
      title: "개인회생과 개인파산은 어떻게 다를까",
      summary: "두 절차의 차이를 처음 보는 사람도 이해하기 쉽게 정리했습니다.",
      meta: ["회생 블로그", "기초 지식"],
    },
  ],
  youtube: [
    {
      title: "1분 회생 상식: 개인회생 신청하면 빚이 바로 없어질까?",
      summary: "유튜브 영상 링크와 요약 설명을 게시판 콘텐츠처럼 관리합니다.",
      meta: ["유튜브", "1분 회생 상식"],
    },
    {
      title: "부산 개인회생 Q&A: 독촉 전화가 계속 올 때",
      summary: "압류와 독촉 상황에서 자주 묻는 내용을 영상으로 안내합니다.",
      meta: ["유튜브", "부산 회생 Q&A"],
    },
  ],
  review: [
    {
      title: "상담 전에 혼자 고민했던 시간이 가장 힘들었습니다",
      summary: "개인정보가 드러나지 않도록 각색된 경험 공유 예시입니다.",
      meta: ["후기", "경험 공유"],
    },
  ],
  free: [
    {
      title: "회생 절차 중 생활비 관리는 어떻게 해야 하나요?",
      summary: "자유롭게 질문과 정보를 나누는 게시판입니다.",
      meta: ["자유", "생활 고민"],
    },
  ],
};

const state = {
  questions: JSON.parse(localStorage.getItem("legendQuestions") || "[]"),
  activeBoard: "notice",
};

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const quickQuestionForm = document.querySelector("#quickQuestionForm");
const chatLog = document.querySelector("#chatLog");
const questionList = document.querySelector("#questionList");
const homeBoardList = document.querySelector("#homeBoardList");
const postList = document.querySelector("#postList");
const blogPostFeed = document.querySelector("#blogPostFeed");
const blogLoadMore = document.querySelector("#blogLoadMore");
const blogPostCount = document.querySelector("#blogPostCount");
const contactForm = document.querySelector("#contactForm");
const remoteLayer = document.querySelector(".home-inquiry-layer");
const remoteHideButton = document.querySelector("#remoteHideButton");
const remoteFab = document.querySelector("#remoteFab");
const pages = Array.from(document.querySelectorAll(".page-section"));
const pageLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const BLOG_POST_BATCH_SIZE = 24;
let visibleBlogPostCount = BLOG_POST_BATCH_SIZE;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

function saveQuestions() {
  localStorage.setItem("legendQuestions", JSON.stringify(state.questions));
}

function makeTitle(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= 26) return clean;
  return `${clean.slice(0, 26)}...`;
}

function detectCategory(text) {
  const value = text.toLowerCase();
  if (value.includes("독촉") || value.includes("압류") || value.includes("연체")) {
    return "압류/독촉";
  }
  if (value.includes("자영업") || value.includes("사업")) {
    return "자영업자";
  }
  if (value.includes("파산")) {
    return "개인파산";
  }
  return "개인회생";
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function formatCompactDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}

function showPage(id, shouldScroll = true) {
  const targetId = pages.some((page) => page.id === id) ? id : "home";
  pages.forEach((page) => page.classList.toggle("active-page", page.id === targetId));

  pageLinks.forEach((link) => {
    const linkId = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active-link", linkId === targetId);
  });

  if (location.hash !== `#${targetId}`) {
    history.pushState(null, "", `#${targetId}`);
  }

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderQuestions() {
  const fallback = [
    {
      title: "카드빚 연체와 독촉 관련 문의",
      body: "카드빚이 밀렸고 독촉 전화가 계속 옵니다. 월급은 받고 있는데 개인회생 신청이 가능한지 궁금합니다.",
      nickname: "익명102",
      category: "압류/독촉",
      status: "답변완료",
      secret: true,
      createdAt: "2026-06-16T09:20:00+09:00",
    },
    {
      title: "월급이 일정할 때 개인회생 가능 여부",
      body: "정기적으로 월급은 받고 있지만 대출과 카드값이 많아 매달 상환이 어렵습니다. 이런 경우 개인회생을 검토할 수 있을까요?",
      nickname: "익명245",
      category: "개인회생",
      status: "답변대기",
      secret: true,
      createdAt: "2026-06-16T09:35:00+09:00",
    },
  ];
  const items = fallback
    .concat(state.questions)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);
  window.legendQuestionItems = items;
  const markup = items
    .map(
      (item, index) => {
        const dateParts = formatCompactDate(item.createdAt);
        return `
        <article class="question-card" role="button" tabindex="0" data-question-index="${index}" aria-label="${item.title} 문의 내용 보기">
          <span class="badge ${item.status === "답변대기" ? "waiting" : ""}">${item.status}</span>
          <div class="question-main">
            <h3><span class="category-label">${item.category}</span> ${item.secret ? "[비밀글] " : ""}${item.title}</h3>
          </div>
          <div class="question-side">
            <span class="question-nickname">${item.nickname}</span>
            <time class="question-date" datetime="${item.createdAt || ""}">
              <span>${dateParts.date}</span>
              <span>${dateParts.time}</span>
            </time>
          </div>
          <div class="question-meta" aria-hidden="true">
            <span>${item.nickname}</span>
            <span>${item.category}</span>
            <span>${formatDateTime(item.createdAt)}</span>
          </div>
        </article>
      `;
      }
    )
    .join("");
  questionList.innerHTML = items
    .map(
      (item, index) => `
        <article class="question-card" role="button" tabindex="0" data-question-index="${index}" aria-label="${item.title} 문의 내용 보기">
          <h3>${item.secret ? "[비밀글] " : ""}${item.title}</h3>
            <div class="question-meta">
              <span>${item.nickname}</span>
              <span>${item.category}</span>
              <span>${formatDateTime(item.createdAt)}</span>
            </div>
          <span class="badge ${item.status === "답변대기" ? "waiting" : ""}">${item.status}</span>
        </article>
      `
    )
    .join("");

  if (homeBoardList) {
    homeBoardList.innerHTML = items
      .slice(0, 5)
      .map((item) => {
        const dateParts = formatCompactDate(item.createdAt);
        return `
          <article class="home-board-card">
            <div>
              <span class="badge ${item.status === "답변대기" ? "waiting" : ""}">${item.status}</span>
              <strong>${item.secret ? "[비밀글] " : ""}${item.title}</strong>
            </div>
            <div class="home-board-meta">
              <span>${item.category}</span>
              <span>${item.nickname}</span>
              <time datetime="${item.createdAt || ""}">${dateParts.date} ${dateParts.time}</time>
            </div>
          </article>
        `;
      })
      .join("");
  }
}

function renderBlogPosts() {
  if (!blogPostFeed) return;
  const posts = Array.isArray(window.NAVER_BLOG_POSTS) ? window.NAVER_BLOG_POSTS : [];

  if (!posts.length) {
    blogPostFeed.innerHTML = `<article><span>네이버 블로그</span><h3>등록된 포스팅이 없습니다.</h3><p>블로그 글을 불러오면 이 영역에 표시됩니다.</p></article>`;
    if (blogLoadMore) blogLoadMore.hidden = true;
    if (blogPostCount) blogPostCount.textContent = "";
    return;
  }

  const visiblePosts = posts.slice(0, visibleBlogPostCount);
  blogPostFeed.innerHTML = visiblePosts
    .map(
      (post) => `
        <a class="blog-post-card" href="${escapeHtml(post.link)}" target="_blank" rel="noopener noreferrer">
          <div class="blog-post-top">
            <span class="blog-post-category">${escapeHtml(post.category)}</span>
            <time>${escapeHtml(post.date)}</time>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.summary)}</p>
          <strong>원문 보기</strong>
        </a>
      `
    )
    .join("");

  if (blogPostCount) {
    blogPostCount.textContent = `${visiblePosts.length} / ${posts.length}개 표시`;
  }
  if (blogLoadMore) {
    const hasMore = visiblePosts.length < posts.length;
    blogLoadMore.hidden = !hasMore;
    blogLoadMore.textContent = hasMore ? `포스팅 ${Math.min(BLOG_POST_BATCH_SIZE, posts.length - visiblePosts.length)}개 더 보기` : "전체 포스팅 표시 완료";
  }
}

function renderPosts() {
  const posts = boardPosts[state.activeBoard];
  postList.innerHTML = posts
    .map(
      (post) => `
        <article class="post-card">
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
          <div class="post-meta">
            ${post.meta.map((label) => `<span class="badge">${label}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute("href").replace("#", "");
  if (!pages.some((page) => page.id === id)) return;

  event.preventDefault();
  showPage(id);
});

quickQuestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(quickQuestionForm);
  const question = String(formData.get("question") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim() || "익명";
  const secret = true;
  if (!question) return;

  const item = {
    title: makeTitle(question),
    body: question,
    nickname,
    category: detectCategory(question),
    status: "답변대기",
    secret,
    createdAt: new Date().toISOString(),
  };
  state.questions.push(item);
  saveQuestions();
  renderQuestions();
  quickQuestionForm.reset();
  quickQuestionForm.elements.secret.checked = true;
});

if (blogLoadMore) {
  blogLoadMore.addEventListener("click", () => {
    visibleBlogPostCount += BLOG_POST_BATCH_SIZE;
    renderBlogPosts();
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");
    state.activeBoard = tab.dataset.board;
    renderPosts();
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("상담 신청 예시가 접수되었습니다. 실제 배포 시 관리자 페이지에 저장됩니다.");
  contactForm.reset();
});

function openRemoteInquiry() {
  if (!remoteLayer) return;
  remoteLayer.classList.remove("collapsed");
  const input = document.querySelector("#quickQuestion");
  if (input) input.focus({ preventScroll: true });
}

function closeRemoteInquiry() {
  if (!remoteLayer) return;
  remoteLayer.classList.add("collapsed");
}

window.openRemoteInquiry = openRemoteInquiry;

if (remoteHideButton) {
  remoteHideButton.addEventListener("click", closeRemoteInquiry);
}

if (remoteFab) {
  remoteFab.addEventListener("click", openRemoteInquiry);
}


const youtubeVideos = {
  long: [
    { title: "개인파산 요건 및 특징 4가지 | 개인회생과 비교, 모르고 신청하면 면책 못 받습니다", category: "bankruptcy", views: "153", published: "4시간 전", url: "https://www.youtube.com/watch?v=20riPnESScQ" },
    { title: "개인회생 변제금 상승시키는 청산가치? | 청산가치 산입되는 6가지 경우", category: "personal", views: "205", published: "8일 전", url: "https://www.youtube.com/watch?v=6BeheKhvj8g" },
    { title: "개인워크아웃 신청 전 반드시 보세요 | 개인회생과 비교한 진짜 차이 4가지", category: "personal", views: "1.2천", published: "2주 전", url: "https://www.youtube.com/watch?v=W783G_GkNZk" },
    { title: "2026년 새출발기금 채무조정 제도 완전 정리 | 소상공인이라면 반드시 확인하세요", category: "personal", views: "877", published: "3주 전", url: "https://www.youtube.com/watch?v=7k2Fp9l-BzY" },
    { title: "개인회생 신청 전 신복위 먼저 가야 한다? | 채무조정 전치주의 시행되면 생기는 일", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=fV26reFSuBI" },
    { title: "개인회생 신청 전 이것 하면 청산가치 올라갑니다 | 월 변제금 높아지는 5가지 행위", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=weBF5DKQbHA" },
    { title: "개인회생에서 부정적 영향을 주는 3가지 유형", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=KQ2F3Ca2_pM" },
    { title: "법인회생 잘못 밟으면 중간에 폐지됩니다 신청부터 종결까지 12단계 완전 정복", category: "corporate", views: "1.6천", published: "2주 전", url: "https://www.youtube.com/watch?v=zQxxeckZUzY" },
    { title: "개인회생 월 변제금 이것 모르면 폐지됩니다 | 신청부터 완료까지 단계별 주의사항", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=oOs1fblidN4" },
    { title: "2026년 개인회생 비용 전격 공개 | 개인회생 신청 99,000원?", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=hOqu6UliiJY" },
    { title: "개인회생 단점 4가지 | 신청 전 반드시 알아야 할 것들", category: "personal", views: "9.5천", published: "2개월 전", url: "https://www.youtube.com/watch?v=10EIMUOTxo4" },
    { title: "개인회생 할 때 체납세금 5,000만 원 탕감 가능!", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=MFbX_CLfvHs" },
    { title: "개인회생 변제계획 1년간 성실히 이행하면?! 신용 회복됩니다!", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=_JD3UKCNVWs" },
    { title: "개인회생·개인파산 전, 이 7가지 하면 기각·면책불허가 된다고?!", category: "bankruptcy", views: "", published: "최근", url: "https://www.youtube.com/watch?v=yFz902TGvlQ" },
    { title: "개인파산 해도 없어지지 않는 채무 8가지 | 면책 전 반드시 확인하세요", category: "bankruptcy", views: "5.7천", published: "3개월 전", url: "https://www.youtube.com/watch?v=fU1zDYoeWTw" },
    { title: "개인회생 신청 전 반드시 확인해야 할 5가지 | 모르고 신청하면 손해입니다", category: "personal", views: "901", published: "1개월 전", url: "https://www.youtube.com/watch?v=NHT3-yf9ips" },
    { title: "개인회생 하면, 연대보증인도 빚 갚아야 하나요?", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=_ZPTnApC3_4" },
    { title: "2026년 추가 생계비 인정 기준 변경 총정리ㅣ개인회생 신청 전 꼭 확인하세요!", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=OnBIvi1ZeI0" },
    { title: "2026년부터 변경된 추가생계비 기준(주거비 편)", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=7SDLxEjBu1A" },
    { title: "법인파산 절차 어떻게 진행될까?ㅣ부산회생법원 기준 9단계 총정리", category: "corporate", views: "2.3천", published: "3개월 전", url: "https://www.youtube.com/watch?v=vNz969x9ag4" },
    { title: "개인회생하면 집 뺏길까? 변호사가 알려드립니다!", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=6hZgTdwdTzU" },
    { title: "통장 압류 막는 법? 2026년 확 바뀌는 회생 뉴스 3가지", category: "personal", views: "", published: "최근", url: "https://www.youtube.com/watch?v=SU3iZxKAebk" },
    { title: "[총정리] 신속채무조정 vs 워크아웃 vs 개인회생, 나에게 딱 맞는 제도는?", category: "personal", views: "506", published: "5개월 전", url: "https://www.youtube.com/watch?v=Z79HHb5DLrU" },
    { title: "개인회생 중 월급이 압류됐다면? (2026년 개정판)", category: "personal", views: "189", published: "6개월 전", url: "https://www.youtube.com/watch?v=8mdAtFL66r0" },
  ],  shorts: [
    { title: "개인회생 변제금 상승 이유", category: "personal", views: "474", published: "최근", url: "https://www.youtube.com/shorts/EhEhwJDPALU" },
    { title: "가족 몰래 개인회생 가능한가요?", category: "personal", views: "497", published: "최근", url: "https://www.youtube.com/shorts/dIAHQJ0rMQc" },
    { title: "주식·코인 투자 손실도 산정되나요?", category: "personal", views: "1.5천", published: "최근", url: "https://www.youtube.com/shorts/SY7Kh8kxCYQ" },
    { title: "개인회생 배우자 재산, 청산가치에 들어갈까?", category: "personal", views: "311", published: "최근", url: "https://www.youtube.com/shorts/6DskwJIO-n0" },
    { title: "개인워크아웃 신청 전 확인", category: "personal", views: "263", published: "최근", url: "https://www.youtube.com/shorts/MK20JcZQzKA" },
    { title: "법인회생 절차 핵심만 정리", category: "corporate", views: "302", published: "최근", url: "https://www.youtube.com/shorts/XmKNcXo1lgw" },
    { title: "개인파산 전 알아야 할 면책 포인트", category: "bankruptcy", views: "481", published: "최근", url: "https://www.youtube.com/shorts/P9WVKVER1wM" },
  ],};

const videoState = {
  selectedFilters: [],
};

function formatViewCount(value) {
  const number = Number(value || 0);
  if (!number) return "조회수 확인 중";
  if (number >= 10000) return `${(number / 10000).toFixed(number >= 100000 ? 0 : 1)}만`;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}천`;
  return String(number);
}

function formatRelativeTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "업로드일 확인 중";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < month) return `${Math.floor(diff / day)}일 전`;
  if (diff < year) return `${Math.floor(diff / month)}개월 전`;
  return `${Math.floor(diff / year)}년 전`;
}

function getVideoItems(type) {
  const selected = videoState.selectedFilters;
  const items = youtubeVideos[type] || [];
  if (!selected.length) return items;

  return items.filter((item) => {
    const tags = getVideoTags(item);
    return selected.some((filter) => tags.includes(filter.key) || item.category === filter.category);
  });
}


function getVideoTags(item) {
  if (Array.isArray(item.tags) && item.tags.length) return item.tags;
  const title = item.title || "";
  const tags = new Set();

  if (/급여|월급|직장|소득/.test(title)) tags.add("salary");
  if (/자영업|사업자|사업장|매출/.test(title)) tags.add("self-employed");
  if (/프리랜서/.test(title)) tags.add("freelancer");
  if (/최근대출|대출|새출발/.test(title)) tags.add("recent-loan");
  if (/세금|조세|생계비/.test(title)) tags.add("tax");
  if (/압류|추심|독촉|연체|계좌/.test(title)) tags.add("collection");
  if (/주식|코인|도박|사행/.test(title)) tags.add("investment");
  if (/부동산|집|재산/.test(title)) tags.add("real-estate");
  if (/자동차|차량/.test(title)) tags.add("car");
  if (/배우자|가족|부양/.test(title)) tags.add("family");
  if (/무직|소득 없/.test(title)) tags.add("unemployed");
  if (/고령|노령/.test(title)) tags.add("senior");
  if (/질병|장애|병원/.test(title)) tags.add("illness");
  if (/기초생활|수급자/.test(title)) tags.add("basic-aid");
  if (/면책불허|면책|파산|관재/.test(title)) tags.add("discharge-denial");
  if (/사기|손해배상/.test(title)) tags.add("fraud-debt");
  if (/처분|청산가치|재산/.test(title)) tags.add("asset-transfer");
  if (/개인사업자|사업자/.test(title)) tags.add("sole-proprietor");
  if (/전문직|의사|약사|변호사/.test(title)) tags.add("professional");
  if (/고소득/.test(title)) tags.add("high-income");
  if (/부동산.*과다|과다채무/.test(title)) tags.add("real-estate-heavy");
  if (/병원|의원/.test(title)) tags.add("clinic");
  if (/약국|학원|음식점/.test(title)) tags.add("academy-restaurant");
  if (/보증/.test(title)) tags.add("guarantee");
  if (/법인|기업|폐업|회생절차/.test(title)) tags.add("business-failure");

  if (!tags.size) {
    if (item.category === "corporate") tags.add("business-failure");
    if (item.category === "bankruptcy") tags.add("discharge-denial");
    if (item.category === "personal") tags.add("salary");
  }
  return Array.from(tags);
}
function getCategoryLabel(category) {
  return {
    personal: "01 개인회생",
    bankruptcy: "02 개인파산",
    corporate: "03 법인회생·법인파산",
  }[category] || "상황별";
}

function getYouTubeVideoId(url) {
  const match = String(url || "").match(/(?:watch\?v=|youtu\.be\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : "";
}
function renderFeaturedRecommendVideos() {
  const row = document.querySelector("[data-featured-video-row]");
  if (!row) return;

  const items = getVideoItems("long").slice(0, 12);
  if (!items.length) {
    row.innerHTML = `<p class="video-empty">표시할 추천 동영상이 없습니다.</p>`;
    return;
  }

  row.innerHTML = items
    .map((item) => {
      const videoId = getYouTubeVideoId(item.url);
      const thumbnail = item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : "");
      const fallbackThumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
      const fallbackAttr = thumbnail && fallbackThumbnail && thumbnail !== fallbackThumbnail
        ? ` onerror="this.onerror=null;this.src='${fallbackThumbnail}'"`
        : "";
      const thumbnailImage = thumbnail
        ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(item.title)} 썸네일" loading="lazy"${fallbackAttr}>`
        : "";
      const sourceText = `회생의 전설 · ${item.published}`;
      const viewText = item.views ? `조회 ${item.views}` : "";

      return `
        <a class="featured-recommend-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" data-category="${escapeHtml(item.category)}">
          <div class="featured-recommend-thumb">${thumbnailImage}<span>▶</span></div>
          <div class="featured-recommend-copy">
            <span class="featured-recommend-source">${escapeHtml(sourceText)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            ${viewText ? `<p>${escapeHtml(viewText)}</p>` : ""}
          </div>
        </a>
      `;
    })
    .join("");

  row.dispatchEvent(new Event("scroll"));
}
function renderVideos() {
  renderFeaturedRecommendVideos();
}

async function hydrateYouTubeVideosFromApi() {
  const apiKey = window.YOUTUBE_API_KEY;
  if (!apiKey) return;
  try {
    const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=legend_of_revival&key=${apiKey}`);
    const channelData = await channelResponse.json();
    const uploads = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return;

    const playlistItems = [];
    let pageToken = "";
    do {
      const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";
      const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=50${tokenParam}&key=${apiKey}`);
      const playlistData = await playlistResponse.json();
      playlistItems.push(...(playlistData.items || []));
      pageToken = playlistData.nextPageToken || "";
    } while (pageToken);

    const ids = playlistItems.map((item) => item.snippet?.resourceId?.videoId).filter(Boolean);
    if (!ids.length) return;

    const videoItems = [];
    for (let index = 0; index < ids.length; index += 50) {
      const chunk = ids.slice(index, index + 50);
      const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${chunk.join(",")}&key=${apiKey}`);
      const videoData = await videoResponse.json();
      videoItems.push(...(videoData.items || []));
    }

    const apiItems = videoItems.map((item) => {
      const title = item.snippet.title;
      const seconds = parseYouTubeDuration(item.contentDetails?.duration || "PT0S");
      return {
        title,
        category: inferVideoCategory(title),
        views: formatViewCount(item.statistics?.viewCount),
        published: formatRelativeTime(item.snippet.publishedAt),
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        isShort: seconds > 0 && seconds <= 65,
      };
    });

    youtubeVideos.long = apiItems.filter((item) => !item.isShort);
    youtubeVideos.shorts = apiItems.filter((item) => item.isShort);
    renderVideos();
  } catch (error) {
    console.warn("YouTube API data could not be loaded.", error);
  }
}

function parseYouTubeDuration(value) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function inferVideoCategory(title) {
  if (/법인|기업|사업자|폐업/.test(title)) return "corporate";
  if (/파산|면책|관재/.test(title)) return "bankruptcy";
  return "personal";
}
function normalizeSocialProfiles() {
  const grid = document.querySelector(".social-profile-grid");
  if (!grid) return;

  const profiles = Array.from(grid.querySelectorAll(".threads-profile-card"));
  const items = [
    {
      match: "youtube.com/@legend_of_revival/videos",
      title: "유튜브",
      handle: "@legend_of_revival",
      action: "구독",
    },
    {
      match: "instagram.com/yulmaru119",
      title: "인스타",
      handle: "@yulmaru119",
      action: "팔로우",
    },
    {
      match: "threads.com/@k__law_firm",
      title: "Threads",
      handle: "@k__law_firm",
      action: "팔로우",
    },
    {
      match: "lawtalk.co.kr",
      title: "로톡",
      handle: "임재현 변호사",
      action: "상담",
    },
    {
      match: "tiktok.com/@yulmaru119",
      title: "틱톡",
      handle: "@yulmaru119",
      action: "보기",
    },
    {
      match: "pf.kakao.com/_xoxgqxan",
      title: "카톡",
      handle: "채널 상담",
      action: "채팅",
    },
    {
      match: "blog.naver.com/yulma_821",
      title: "네이버 블로그",
      handle: "yulma_821",
      action: "보기",
    },
  ];

  profiles
    .filter((profile) => profile.href.includes("tv.naver.com"))
    .forEach((profile) => profile.remove());

  items.forEach((item) => {
    const profile = profiles.find((card) => card.href.includes(item.match));
    if (!profile || !profile.isConnected) return;

    const title = profile.querySelector("strong");
    const handle = profile.querySelector("div p");
    const action = profile.querySelector("span");
    const bio = profile.querySelector(".threads-bio");

    if (title) title.textContent = item.title;
    if (handle) handle.textContent = item.handle;
    if (action) action.textContent = item.action;
    if (bio) bio.remove();

    grid.appendChild(profile);
  });
}

normalizeSocialProfiles();
renderBlogPosts();
renderPosts();
renderQuestions();
showPage(location.hash.replace("#", "") || "home", false);

window.addEventListener("popstate", () => {
  showPage(location.hash.replace("#", "") || "home", false);
});


function handleVideoFilterSelection(chip) {
  if (!chip) return;
  const chips = Array.from(document.querySelectorAll(".video-filter-chip"));
  const key = chip.dataset.videoKey;
  const category = chip.dataset.videoCategory;
  const isSelected = videoState.selectedFilters.some((item) => item.key === key);

  videoState.selectedFilters = isSelected ? [] : [{ key, category }];

  chips.forEach((item) => {
    const selected = videoState.selectedFilters.some((filter) => filter.key === item.dataset.videoKey);
    item.classList.toggle("is-selected", selected);
    item.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  renderVideos();
}

function enableDragScroll(selector) {
  document.querySelectorAll(selector).forEach((scroller) => {
    let isDown = false;
    let startX = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let moved = false;
    let startTarget = null;
    let momentumFrame = 0;
    const isSituationScroller = scroller.classList.contains("job-chip-row");

    const stopMomentum = () => {
      if (momentumFrame) cancelAnimationFrame(momentumFrame);
      momentumFrame = 0;
    };

    const glide = () => {
      if (Math.abs(velocity) < 0.12) {
        momentumFrame = 0;
        return;
      }
      scroller.scrollLeft -= velocity;
      velocity *= 0.92;
      momentumFrame = requestAnimationFrame(glide);
    };

    scroller.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      stopMomentum();
      isDown = true;
      moved = false;
      startTarget = event.target;
      startX = event.clientX;
      lastX = event.clientX;
      lastTime = performance.now();
      velocity = 0;
      scroller.classList.add("is-dragging");
      scroller.setPointerCapture?.(event.pointerId);
    });

    scroller.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      const now = performance.now();
      const deltaX = event.clientX - lastX;
      const totalWalk = event.clientX - startX;
      const elapsed = Math.max(now - lastTime, 16);

      if (Math.abs(totalWalk) > 5) {
        moved = true;
        event.preventDefault();
      }

      scroller.scrollLeft -= deltaX;
      velocity = (deltaX / elapsed) * 16;
      lastX = event.clientX;
      lastTime = now;
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      scroller.addEventListener(eventName, (event) => {
        if (!isDown) return;
        isDown = false;
        scroller.classList.remove("is-dragging");
        scroller.releasePointerCapture?.(event.pointerId);

        if (eventName === "pointerup" && isSituationScroller && !moved) {
          const chip = startTarget?.closest?.(".video-filter-chip");
          handleVideoFilterSelection(chip);
          return;
        }

        if (moved) glide();
      });
    });

    scroller.addEventListener("click", (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  });
}
function initJobChipSliderControls() {
  document.querySelectorAll("[data-job-slider]").forEach((slider) => {
    const scroller = slider.querySelector(".job-chip-row");
    const nextButton = slider.querySelector("[data-job-next]");
    if (!scroller || !nextButton) return;

    const update = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const canScroll = maxScroll > 4;
      const atEnd = scroller.scrollLeft >= maxScroll - 3;
      slider.classList.toggle("is-scroll-locked", !canScroll);
      slider.classList.toggle("is-at-end", canScroll && atEnd);
      nextButton.disabled = !canScroll || atEnd;
    };

    nextButton.addEventListener("click", () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const distance = Math.max(scroller.clientWidth * 0.82, 300);
      scroller.scrollTo({
        left: Math.min(scroller.scrollLeft + distance, maxScroll),
        behavior: "smooth"
      });
    });

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    requestAnimationFrame(update);
  });
}
function initFeaturedRecommendControls() {
  const panel = document.querySelector(".featured-recommend-panel");
  const scroller = panel?.querySelector(".featured-recommend-row");
  const prevButton = panel?.querySelector("[data-featured-prev]");
  const nextButton = panel?.querySelector("[data-featured-next]");
  if (!panel || !scroller || !prevButton || !nextButton) return;

  const getMaxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

  const update = () => {
    const maxScroll = getMaxScroll();
    const canScroll = maxScroll > 4;
    const atStart = scroller.scrollLeft <= 3;
    const atEnd = scroller.scrollLeft >= maxScroll - 3;
    panel.classList.toggle("is-featured-scrollable", canScroll);
    prevButton.disabled = !canScroll || atStart;
    nextButton.disabled = !canScroll || atEnd;
  };

  const move = (direction) => {
    const maxScroll = getMaxScroll();
    const distance = Math.max(scroller.clientWidth * 0.78, 260);
    scroller.scrollTo({
      left: Math.min(Math.max(scroller.scrollLeft + direction * distance, 0), maxScroll),
      behavior: "smooth"
    });
  };

  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  scroller.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  requestAnimationFrame(update);
}
function initJobChips() {
  document.querySelectorAll(".video-filter-chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
}

renderVideos();
hydrateYouTubeVideosFromApi();
initJobChips();
initJobChipSliderControls();
initFeaturedRecommendControls();
enableDragScroll(".job-chip-row");
enableDragScroll(".featured-recommend-row");