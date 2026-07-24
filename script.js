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
const heroLeadForm = document.querySelector("#heroLeadForm");
const heroLeadStatus = document.querySelector("#heroLeadStatus");
const heroLeadPanel = document.querySelector("#heroLeadPanel");
const heroLeadClose = document.querySelector("#heroLeadClose");
const leadConsultFab = document.querySelector("#leadConsultFab");
const contactFormStatus = document.querySelector("#contactFormStatus");
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

function buildLeadPayload(form, source) {
  const formData = new FormData(form);
  const randomId = window.crypto?.randomUUID?.() || `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: randomId,
    source,
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    caseType: String(formData.get("caseType") || "").trim(),
    debt: String(formData.get("debt") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    consent: formData.get("privacy") !== null,
    createdAt: new Date().toISOString(),
    pageUrl: window.location.href,
  };
}

async function submitLeadPayload(payload) {
  const endpoint = String(window.LEAD_API_ENDPOINT || "").trim();

  if (!endpoint) {
    return "not-configured";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead API responded with ${response.status}`);
  }
  return "remote";
}

function setLeadStatus(statusElement, message, type) {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.classList.remove("is-success", "is-error");
  statusElement.classList.add(type === "error" ? "is-error" : "is-success");
}

function getPhoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function formatPhoneNumber(value) {
  const digits = getPhoneDigits(value);

  if (digits.length < 3) return digits;
  if (digits.length === 3) return `${digits}-`;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 7) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhoneNumber(value) {
  return /^010\d{8}$/.test(getPhoneDigits(value));
}

function setPhoneValidity(input, showError = false) {
  const isValid = isValidPhoneNumber(input.value);
  const shouldShowError = showError && !isValid;

  input.classList.toggle("is-phone-invalid", shouldShowError);
  input.setAttribute("aria-invalid", shouldShowError ? "true" : "false");
  input.setCustomValidity("");

  return isValid;
}

function initPhoneInputs() {
  document.querySelectorAll("[data-phone-input]").forEach((input) => {
    input.value = formatPhoneNumber(input.value);

    input.addEventListener("input", () => {
      input.value = formatPhoneNumber(input.value);
      setPhoneValidity(input, false);
    });

    input.addEventListener("blur", () => {
      setPhoneValidity(input, true);
    });
  });
}

async function handleLeadFormSubmit(form, statusElement, source) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || "";
  const payload = buildLeadPayload(form, source);
  const phoneInput = form.elements.phone;

  if (!payload.name || !payload.phone || !payload.consent) {
    setLeadStatus(statusElement, "필수 정보를 확인해 주세요.", "error");
    return;
  }

  if (!phoneInput || !setPhoneValidity(phoneInput, true)) {
    setLeadStatus(statusElement, "연락처를 정확히 입력해 주세요.", "error");
    phoneInput?.focus();
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "접수 중...";
  }

  try {
    const result = await submitLeadPayload(payload);
    if (result === "not-configured") {
      setLeadStatus(statusElement, "DB 접수 주소 설정이 필요합니다. 전화 상담을 이용해 주세요.", "error");
      return;
    }
    setLeadStatus(statusElement, "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.", "success");
    form.reset();
    if (form === heroLeadForm && form.elements.privacy) {
      form.elements.privacy.checked = true;
    }
  } catch (error) {
    console.error("Unable to save lead.", error);
    setLeadStatus(statusElement, "접수에 실패했습니다. 전화 상담을 이용해 주세요.", "error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
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
  const isHomeView = targetId === "home" && (id === "home" || !id);
  document.body.classList.toggle("is-home-view", isHomeView);
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

const navLawyerMenu = document.querySelector(".nav-lawyer-menu");
let navLawyerCloseTimer = 0;

if (navLawyerMenu) {
  navLawyerMenu.addEventListener("mouseenter", () => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1081px)").matches) return;
    window.clearTimeout(navLawyerCloseTimer);
    navLawyerMenu.setAttribute("open", "");
  });

  navLawyerMenu.addEventListener("mouseleave", () => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1081px)").matches) return;
    window.clearTimeout(navLawyerCloseTimer);
    navLawyerCloseTimer = window.setTimeout(() => {
      navLawyerMenu.removeAttribute("open");
    }, 120);
  });
}

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

if (heroLeadForm) {
  heroLeadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLeadFormSubmit(heroLeadForm, heroLeadStatus, "hero");
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLeadFormSubmit(contactForm, contactFormStatus, "contact");
  });
}

function openHeroLeadPanel() {
  if (!heroLeadPanel || !leadConsultFab) return;
  heroLeadPanel.classList.add("is-open");
  heroLeadPanel.setAttribute("aria-hidden", "false");
  leadConsultFab.setAttribute("aria-expanded", "true");
  window.setTimeout(() => {
    heroLeadForm?.elements.name?.focus({ preventScroll: true });
  }, 180);
}

function closeHeroLeadPanel() {
  if (!heroLeadPanel || !leadConsultFab) return;
  heroLeadPanel.classList.remove("is-open");
  heroLeadPanel.setAttribute("aria-hidden", "true");
  leadConsultFab.setAttribute("aria-expanded", "false");
  leadConsultFab.focus({ preventScroll: true });
}

leadConsultFab?.addEventListener("click", openHeroLeadPanel);
heroLeadClose?.addEventListener("click", closeHeroLeadPanel);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && heroLeadPanel?.classList.contains("is-open")) {
    closeHeroLeadPanel();
  }
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
    { title: "성범죄 피해, 직접증거가 없어도 고소 가능할까? 피해자 진술이 중요한 이유", category: "criminal", tags: ["sexual-crime"], views: "67", published: "7일 전", url: "https://www.youtube.com/watch?v=qQmR530dOAA" },
    { title: "경찰조사 받을 때 반드시 알아야 할 주의사항 8가지", category: "criminal", tags: ["traffic-crime", "sexual-crime", "violent-crime", "property-crime", "voice-phishing", "drug-crime", "cyber-crime", "defamation", "obstruction", "military-crime"], views: "127", published: "2주 전", url: "https://www.youtube.com/watch?v=EwxjUq4FtXo" },
    { title: "댓글 하나가 형사처벌로? SNS 글 올리기 전 반드시 알아야 할 명예훼손 기준 4가지", category: "criminal", tags: ["cyber-crime", "defamation"], views: "132", published: "2개월 전", url: "https://www.youtube.com/watch?v=yfssYteuPtI" },
    { title: "대구 캐리어 시신 유기 사건ㅣ사위가 장모를 죽였는데 존속살해? 일반 살인과 형량이 다른 이유", category: "criminal", tags: ["violent-crime"], views: "392", published: "2개월 전", url: "https://www.youtube.com/watch?v=VFuLAZRODkA" },
    { title: "커피 세 잔에 550만 원? 빽다방 알바생 횡령 고소 사건의 충격적인 진실 | 횡령죄 vs 공갈죄 법적 분석", category: "criminal", tags: ["property-crime"], views: "756", published: "3개월 전", url: "https://www.youtube.com/watch?v=Vk5LR8W_eIg" },
    { title: "사기 고소했는데 불송치? 이유 있습니다 사기죄 성립 요건과 고소 전 꼭 알아야 할 것들", category: "criminal", tags: ["property-crime"], views: "248", published: "3개월 전", url: "https://www.youtube.com/watch?v=m9qkd7RkUrc" },
    { title: "음주운전 \"벌금으로 끝나겠지\" 하다가 실형 사는 이유 3가지", category: "criminal", tags: ["traffic-crime"], views: "50", published: "4개월 전", url: "https://www.youtube.com/watch?v=T66GBM-5QQQ" },
    { title: "보이스피싱 경찰 조사 받기 전 반드시 알아야 할 것", category: "criminal", tags: ["voice-phishing", "property-crime"], views: "61", published: "4개월 전", url: "https://www.youtube.com/watch?v=K1boh2DpAkM" },
    { title: "성범죄 억울하게 연루되었다면 무조건 봐야 하는 영상ㅣ무죄가 나오는 3가지 경우", category: "criminal", tags: ["sexual-crime"], views: "120", published: "4개월 전", url: "https://www.youtube.com/watch?v=OetJPTkJPl0" },
  ],
  shorts: [],
};

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
    return selected.some((filter) => {
      return tags.includes(filter.key) || (filter.category !== "criminal" && item.category === filter.category);
    });
  });
}


function getVideoTags(item) {
  if (Array.isArray(item.tags) && item.tags.length) return item.tags;
  const title = item.title || "";
  const tags = new Set();

  if (/교통|음주운전|뺑소니|무면허|보복운전|교통사고/.test(title)) tags.add("traffic-crime");
  if (/성범죄|성폭력|강간|추행|몰카|불법촬영/.test(title)) tags.add("sexual-crime");
  if (/폭행|상해|살인|협박|스토킹|시신/.test(title)) tags.add("violent-crime");
  if (/사기|횡령|배임|절도|공갈|재산|금전/.test(title)) tags.add("property-crime");
  if (/보이스피싱|전화금융사기/.test(title)) tags.add("voice-phishing");
  if (/마약|대마|필로폰|향정/.test(title)) tags.add("drug-crime");
  if (/사이버|해킹|SNS|온라인|디지털/.test(title)) tags.add("cyber-crime");
  if (/명예훼손|모욕|댓글/.test(title)) tags.add("defamation");
  if (/공무집행방해|경찰관.*폭행/.test(title)) tags.add("obstruction");
  if (/군형사|군인|군사법원|군무원/.test(title)) tags.add("military-crime");

  return Array.from(tags);
}
function getCategoryLabel(category) {
  return {
    criminal: "형사사건",
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
      const sourceText = `형사의 전설 · ${item.published}`;
      const viewText = item.views ? `조회 ${item.views}` : "";

      return `
        <a class="featured-recommend-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" data-category="${escapeHtml(item.category)}" aria-label="${escapeHtml(item.title)} 유튜브 영상 보기">
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
    const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=yulmaru_g&key=${apiKey}`);
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
  return "criminal";
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
      handle: "법무법인 율마루",
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

      if (!moved && Math.abs(totalWalk) > 5) {
        moved = true;
      }

      if (moved && event.cancelable) event.preventDefault();

      scroller.scrollLeft -= deltaX;
      velocity = (deltaX / elapsed) * 16;
      lastX = event.clientX;
      lastTime = now;
    });

    ["pointerup", "pointercancel"].forEach((eventName) => {
      scroller.addEventListener(eventName, (event) => {
        if (!isDown) return;
        isDown = false;
        scroller.classList.remove("is-dragging");
        if (scroller.hasPointerCapture?.(event.pointerId)) {
          scroller.releasePointerCapture?.(event.pointerId);
        }

        if (eventName === "pointerup" && isSituationScroller && !moved) {
          const chip = startTarget?.closest?.(".video-filter-chip");
          handleVideoFilterSelection(chip);
          return;
        }

        if (moved) glide();
      });
    });

    scroller.addEventListener("dragstart", (event) => {
      event.preventDefault();
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
    const prevButton = slider.querySelector("[data-job-prev]");
    const nextButton = slider.querySelector("[data-job-next]");
    if (!scroller || !prevButton || !nextButton) return;

    const update = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const canScroll = maxScroll > 4;
      const atStart = scroller.scrollLeft <= 3;
      const atEnd = scroller.scrollLeft >= maxScroll - 3;
      slider.classList.toggle("is-scroll-locked", !canScroll);
      slider.classList.toggle("is-at-start", canScroll && atStart);
      slider.classList.toggle("is-at-end", canScroll && atEnd);
      prevButton.disabled = !canScroll || atStart;
      nextButton.disabled = !canScroll || atEnd;
    };

    const move = (direction) => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const distance = Math.max(scroller.clientWidth * 0.82, 300);
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

function initChannelSideCarousel() {
  const carousel = document.querySelector("[data-channel-side-carousel]");
  const track = carousel?.querySelector("[data-channel-side-track]");
  const slides = Array.from(carousel?.querySelectorAll(".channel-side-slide") || []);
  const dots = Array.from(carousel?.querySelectorAll(".channel-side-dots span") || []);
  if (!carousel || !track || slides.length < 2) return;

  let activeIndex = window.location.hash === "#lawyer-intro" ? 1 : 0;
  let rotationTimer = 0;

  const render = () => {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide.tabIndex = isActive ? 0 : -1;
      dots[index]?.classList.toggle("is-active", isActive);
    });
  };

  const stop = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = 0;
  };

  const start = () => {
    stop();
    if (document.hidden) return;
    rotationTimer = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % slides.length;
      render();
    }, 4200);
  };

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) start();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  render();
  start();
}

function initChannelInfoCarousel() {
  const carousel = document.querySelector("[data-channel-info-carousel]");
  const track = carousel?.querySelector("[data-channel-info-track]");
  const slides = Array.from(carousel?.querySelectorAll("[data-channel-info-slide]") || []);
  const dots = Array.from(carousel?.querySelectorAll("[data-channel-info-dot]") || []);
  if (!carousel || !track || slides.length < 2) return;

  let activeIndex = 0;
  let rotationTimer = 0;

  const render = () => {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide.querySelectorAll("a, button").forEach((control) => {
        control.tabIndex = isActive ? 0 : -1;
      });
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.tabIndex = isActive ? 0 : -1;
    });
  };

  const stop = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = 0;
  };

  const start = () => {
    stop();
    if (document.hidden) return;
    rotationTimer = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % slides.length;
      render();
    }, 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      activeIndex = index;
      render();
      start();
    });

    dot.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      activeIndex = (activeIndex + direction + slides.length) % slides.length;
      render();
      dots[activeIndex].focus();
      start();
    });
  });

  const openInfoSlide = (index, hash, link) => {
      showPage(hash.replace("#", ""), false);
      activeIndex = index;
      render();
      start();
      window.history.replaceState(null, "", hash);
      carousel.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
      link.closest("details")?.removeAttribute("open");
  };

  document.querySelectorAll("[data-open-lawyer-intro]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openInfoSlide(1, "#lawyer-intro", link);
    });
  });

  document.querySelectorAll("[data-open-office-location]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openInfoSlide(2, "#office-location", link);
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) start();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  render();
  start();
}

function initJobChips() {
  document.querySelectorAll(".video-filter-chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
}

renderVideos();
hydrateYouTubeVideosFromApi();
initPhoneInputs();
initJobChips();
initJobChipSliderControls();
initFeaturedRecommendControls();
initChannelSideCarousel();
initChannelInfoCarousel();
enableDragScroll(".job-chip-row");
enableDragScroll(".featured-recommend-row");
