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
const contactForm = document.querySelector("#contactForm");
const remoteLayer = document.querySelector(".home-inquiry-layer");
const remoteHideButton = document.querySelector("#remoteHideButton");
const remoteFab = document.querySelector("#remoteFab");
const pages = Array.from(document.querySelectorAll(".page-section"));
const pageLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

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
renderPosts();
renderQuestions();
showPage(location.hash.replace("#", "") || "home", false);

window.addEventListener("popstate", () => {
  showPage(location.hash.replace("#", "") || "home", false);
});

function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".hero-slider-dots span"));
  if (slides.length <= 1) return;

  let current = 0;

  function showSlide(next) {
    slides[current].classList.remove("active");
    slides[current].setAttribute("aria-hidden", "true");
    if (dots[current]) dots[current].classList.remove("active");

    current = next % slides.length;

    slides[current].classList.add("active");
    slides[current].setAttribute("aria-hidden", "false");
    if (dots[current]) dots[current].classList.add("active");
  }

  setInterval(() => showSlide(current + 1), 4200);
}

initHeroSlider();