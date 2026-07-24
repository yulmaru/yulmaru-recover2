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
  activeBoard: "all",
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
const leadPhoneFab = document.querySelector(".lead-phone-fab");
const contactFormStatus = document.querySelector("#contactFormStatus");
const remoteLayer = document.querySelector(".home-inquiry-layer");
const remoteHideButton = document.querySelector("#remoteHideButton");
const remoteFab = document.querySelector("#remoteFab");

// Keep the fixed consultation controls outside the home section so they stay
// available on the lawyer, board, directions and case-detail views as well.
[heroLeadPanel, leadConsultFab, leadPhoneFab].filter(Boolean).forEach((control) => {
  document.body.append(control);
});

const pages = Array.from(document.querySelectorAll(".page-section"));
const pageLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const BLOG_POST_BATCH_SIZE = 24;
const OFFICE_LOCATIONS = {
  seocho: {
    name: "서울 서초점",
    address: "서울 서초구 서초중앙로 156, 2층 (블루원빌딩)",
    query: "서울 서초구 서초중앙로 156",
  },
  myeongji: {
    name: "부산 명지점",
    address: "부산 강서구 명지국제2로 80, 2층 53-55호 (명지동, e편한세상명지)",
    query: "부산 강서구 명지국제2로 80",
  },
  centum: {
    name: "부산 센텀점",
    address: "부산 해운대구 센텀중앙로 97, A동 3004호 (재송동, 센텀스카이비즈)",
    query: "부산 해운대구 센텀중앙로 97",
  },
  seomyeon: {
    name: "부산 서면점",
    address: "부산 부산진구 중앙대로 754, 8층 (부전동, 주간인빌딩)",
    query: "부산 부산진구 중앙대로 754",
  },
  changwon: {
    name: "경남 창원점",
    address: "경남 창원시 성산구 창이대로689번길 4-16, 6층 (사파동, 법조빌딩)",
    query: "경남 창원시 성산구 창이대로689번길 4-16",
  },
};
const CRIMINAL_CASE_POSTS = {
  "detention-cancel": {
    category: "구속 대응",
    date: "형사 사건 사례 · 최근",
    title: "구속취소 사건",
    image: "assets/criminal-detention-response.webp",
    alt: "한국 경찰 유치장으로 이동하는 구속 피의자의 뒷모습",
    lead: "신병 확보 필요성과 사건의 현재 진행 상황을 다시 검토해 구속 필요성을 다툰 사례입니다.",
    sections: [
      ["사건 개요", "수사 초기 단계에서 구속 상태가 계속 필요한지, 수사에 협조할 환경이 갖춰졌는지를 중심으로 상황을 정리했습니다."],
      ["확인한 내용", "주거와 직업의 안정성, 조사 출석 가능성, 증거 인멸 및 도주 우려에 관한 자료를 차분히 확인했습니다."],
      ["대응 포인트", "구속 이후에도 사실관계와 절차 진행을 지속적으로 점검해 신병 관련 판단을 다시 요청할 수 있습니다."],
    ],
  },
  "quasi-rape-dismissal": {
    category: "성범죄",
    date: "형사 사건 사례 · 최근",
    title: "준강간 공소기각 사건",
    image: "assets/criminal-quasi-rape-dismissal.webp",
    alt: "한국 오피스텔 내부의 사건 정황을 표현한 현장 이미지",
    lead: "사건 기록과 절차 진행 경위를 면밀히 살펴 공소 제기와 관련된 쟁점을 검토한 사례입니다.",
    sections: [
      ["사건 개요", "당사자 진술과 당시 정황이 엇갈리는 상황에서 수사·재판 기록을 시간 순서대로 정리했습니다."],
      ["확인한 내용", "고소 경위, 증거 제출 시점, 공소 유지에 필요한 절차적 요건을 함께 검토했습니다."],
      ["대응 포인트", "성범죄 사건은 진술과 객관 자료의 연결 관계가 중요하므로 초기부터 일관된 사실관계 정리가 필요합니다."],
    ],
  },
  "drunk-driving-probation": {
    category: "교통범죄",
    date: "형사 사건 사례 · 2일 전",
    title: "음주운전 집행유예 사건",
    image: "assets/criminal-traffic-collision.webp",
    alt: "한국 도심 교차로에서 충돌해 파손된 차량 두 대",
    lead: "사고 경위와 피해 회복 과정, 재발 방지 노력을 종합적으로 정리한 음주운전 사건 사례입니다.",
    sections: [
      ["사건 개요", "음주 상태 운전 중 사고가 발생해 피해 상황과 운전 경위에 대한 확인이 필요했던 사건입니다."],
      ["확인한 내용", "혈중알코올농도, 사고 당시 영상과 현장 자료, 피해 회복을 위한 조치 및 재발 방지 계획을 검토했습니다."],
      ["대응 포인트", "음주운전 사건은 수치만이 아니라 사고 결과, 피해 회복, 과거 전력 등 여러 사정을 함께 살펴야 합니다."],
    ],
  },
  "voice-phishing-no-charge": {
    category: "보이스피싱",
    date: "형사 사건 사례 · 3일 전",
    title: "보이스피싱 무혐의 사건",
    image: "assets/criminal-voice-phishing.webp",
    alt: "전화하는 보이스피싱범의 입과 은행 현금인출 장면",
    lead: "금융거래에 관여하게 된 경위와 인식 여부를 중심으로 사실관계를 검토한 사례입니다.",
    sections: [
      ["사건 개요", "계좌 사용 또는 현금 인출 과정에 연루됐다는 이유로 조사를 받게 된 상황을 다뤘습니다."],
      ["확인한 내용", "지시를 받게 된 경위, 대화 기록, 거래 흐름, 실제 이익의 귀속 여부를 시간 순서로 확인했습니다."],
      ["대응 포인트", "보이스피싱 사건은 본인이 어떤 내용을 알고 있었는지가 핵심이므로 자료 보존과 진술 준비가 중요합니다."],
    ],
  },
  "sexual-crime-non-transfer": {
    category: "성범죄",
    date: "형사 사건 사례 · 최근",
    title: "성범죄 불송치 사건",
    image: "assets/criminal-sex-crime-non-referral.webp",
    alt: "한국 오피스텔 복도의 CCTV 시점 사건 정황 이미지",
    lead: "객관적인 동선 자료와 진술 내용을 비교해 사실관계를 점검한 성범죄 사건 사례입니다.",
    sections: [
      ["사건 개요", "당사자 사이의 만남 이후 제기된 주장에 대해 당시 상황을 구체적으로 확인해야 했습니다."],
      ["확인한 내용", "CCTV, 출입 기록, 메시지, 통화 내역 등 객관 자료와 각 진술 사이의 일치 여부를 살폈습니다."],
      ["대응 포인트", "성범죄 사건은 기억이 흐려지기 전에 동선과 대화 내용을 정리하고 관련 자료를 보존하는 것이 중요합니다."],
    ],
  },
  "fraud-acquittal": {
    category: "재산범죄",
    date: "형사 사건 사례 · 4일 전",
    title: "사기 혐의 무죄 사건",
    image: "assets/criminal-fraud-acquittal.webp",
    alt: "한국 소규모 사업장에서 계약서와 송금 내역을 확인하는 거래 현장",
    lead: "계약 체결 당시의 설명과 이행 과정, 거래 자료를 중심으로 검토한 사기 혐의 사건 사례입니다.",
    sections: [
      ["사건 개요", "금전 거래 이후 약속이 이행되지 않아 사기 혐의가 제기된 상황에서 계약 전후 과정을 정리했습니다."],
      ["확인한 내용", "계약서, 메시지, 송금 내역, 실제 이행 시도와 자금 사용 경위를 함께 확인했습니다."],
      ["대응 포인트", "사기 사건은 처음부터 갚을 의사나 이행 의사가 없었는지가 쟁점이 되는 경우가 많습니다."],
    ],
  },
  "assault-deferred-prosecution": {
    category: "폭력범죄",
    date: "형사 사건 사례 · 5일 전",
    title: "폭행·상해 기소유예 사건",
    image: "assets/criminal-assault-deferred.webp",
    alt: "한국 식당가 골목에 남은 폭행 사건 이후의 현장 정황",
    lead: "우발적으로 발생한 다툼의 경위와 피해 회복을 중심으로 검토한 폭행·상해 사건 사례입니다.",
    sections: [
      ["사건 개요", "식당가 인근에서 발생한 다툼 이후 폭행 또는 상해 혐의로 조사를 받게 된 상황입니다."],
      ["확인한 내용", "사건의 발단, 쌍방의 행동, 영상 자료, 피해 정도와 회복을 위한 조치를 확인했습니다."],
      ["대응 포인트", "폭행 사건은 감정적인 진술보다 당시 상황을 보여주는 객관 자료와 피해 회복 노력이 중요합니다."],
    ],
  },
  "drug-probation": {
    category: "마약범죄",
    date: "형사 사건 사례 · 6일 전",
    title: "마약 투약 집행유예 사건",
    image: "assets/criminal-drug-probation.webp",
    alt: "한국 원룸에서 마약 관련 증거물을 수거하는 현장",
    lead: "투약 경위와 재범 위험성, 치료 및 재활 계획을 종합적으로 검토한 마약 사건 사례입니다.",
    sections: [
      ["사건 개요", "수사 과정에서 투약 사실이 문제 된 상황에서 사용 경위와 현재 상태를 함께 살펴봤습니다."],
      ["확인한 내용", "투약 횟수와 기간, 관련 검사 자료, 치료·상담 참여 여부, 재발 방지를 위한 생활 계획을 확인했습니다."],
      ["대응 포인트", "마약 사건은 초기 진술부터 치료와 재활 계획까지 일관된 대응 방향을 세우는 것이 필요합니다."],
    ],
  },
};
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
    phone: getPhoneDigits(formData.get("phone")),
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

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getPhoneCaretPosition(formattedValue, digitCount) {
  if (digitCount <= 0) return 0;

  let seenDigits = 0;
  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/\d/.test(formattedValue[index])) {
      seenDigits += 1;
    }
    if (seenDigits >= digitCount) {
      return index + 1;
    }
  }

  return formattedValue.length;
}

function updatePhoneDisplay(input, digitCaretCount = null) {
  input.value = formatPhoneNumber(input.value);

  if (digitCaretCount === null || document.activeElement !== input) return;
  const caretPosition = getPhoneCaretPosition(input.value, digitCaretCount);
  input.setSelectionRange(caretPosition, caretPosition);
}

function isValidPhoneNumber(value) {
  return /^010\d{8}$/.test(getPhoneDigits(value));
}

function setPhoneValidity(input, showError = false) {
  const hasDigits = getPhoneDigits(input.value).length > 0;
  const isValid = isValidPhoneNumber(input.value);
  const shouldShowError = showError && hasDigits && !isValid;

  input.classList.toggle("is-phone-invalid", shouldShowError);
  input.setAttribute("aria-invalid", shouldShowError ? "true" : "false");
  input.setCustomValidity("");

  return isValid;
}

function initPhoneInputs() {
  document.querySelectorAll("[data-phone-input]").forEach((input) => {
    updatePhoneDisplay(input);

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Backspace" && event.key !== "Delete") return;

      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;
      if (
        selectionStart === null ||
        selectionEnd === null ||
        selectionStart !== selectionEnd
      ) {
        return;
      }

      const separatorIndex = event.key === "Backspace" ? selectionStart - 1 : selectionStart;
      if (input.value[separatorIndex] !== "-") return;

      event.preventDefault();

      const digits = getPhoneDigits(input.value);
      const digitsBeforeCaret = getPhoneDigits(input.value.slice(0, selectionStart)).length;
      const removeIndex = event.key === "Backspace"
        ? digitsBeforeCaret - 1
        : digitsBeforeCaret;

      if (removeIndex < 0 || removeIndex >= digits.length) return;

      const nextDigits = `${digits.slice(0, removeIndex)}${digits.slice(removeIndex + 1)}`;
      const nextDigitCaret = event.key === "Backspace"
        ? Math.max(0, digitsBeforeCaret - 1)
        : digitsBeforeCaret;

      input.value = formatPhoneNumber(nextDigits);
      const nextCaretPosition = getPhoneCaretPosition(input.value, nextDigitCaret);
      input.setSelectionRange(nextCaretPosition, nextCaretPosition);
      setPhoneValidity(input, false);
    });

    input.addEventListener("input", () => {
      const selectionStart = input.selectionStart ?? input.value.length;
      const digitsBeforeCaret = getPhoneDigits(input.value.slice(0, selectionStart)).length;
      updatePhoneDisplay(input, digitsBeforeCaret);
      setPhoneValidity(input, false);
    });

    input.addEventListener("blur", () => {
      setPhoneValidity(input, true);
    });
  });
}

function initDirectionsPage() {
  const mapFrame = document.querySelector("#naverMapFrame");
  const mapLink = document.querySelector("#naverMapLink");
  const officeName = document.querySelector("#selectedOfficeName");
  const officeAddress = document.querySelector("#selectedOfficeAddress");
  const officeControls = Array.from(document.querySelectorAll("[data-office-branch]"));

  if (!mapFrame || !mapLink || !officeName || !officeAddress || !officeControls.length) return;

  const selectOffice = (officeKey) => {
    const office = OFFICE_LOCATIONS[officeKey] || OFFICE_LOCATIONS.seocho;
    const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(office.query)}`;

    mapFrame.src = mapUrl;
    mapFrame.title = `법무법인 율마루 ${office.name} 네이버지도`;
    mapLink.href = mapUrl;
    officeName.textContent = office.name;
    officeAddress.textContent = office.address;

    officeControls.forEach((control) => {
      const isSelected = control.dataset.officeBranch === officeKey;
      control.classList.toggle("is-active", isSelected);
      if (control.matches("button")) {
        control.setAttribute("aria-pressed", isSelected ? "true" : "false");
      }
    });
  };

  officeControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      selectOffice(control.dataset.officeBranch);

      if (control.matches("a")) {
        event.preventDefault();
        event.stopPropagation();
        showPage("directions");
      }
    });
  });

  selectOffice("seocho");
}

function getCriminalCaseSlug(routeId) {
  const prefix = "case-";
  if (!String(routeId || "").startsWith(prefix)) return "";

  const slug = routeId.slice(prefix.length);
  return Object.prototype.hasOwnProperty.call(CRIMINAL_CASE_POSTS, slug) ? slug : "";
}

function renderCriminalCase(slug) {
  const post = CRIMINAL_CASE_POSTS[slug] || CRIMINAL_CASE_POSTS["detention-cancel"];
  const image = document.querySelector("#criminalCaseImage");
  const category = document.querySelector("#criminalCaseCategory");
  const date = document.querySelector("#criminalCaseDate");
  const title = document.querySelector("#criminal-case-title");
  const lead = document.querySelector("#criminalCaseLead");
  const content = document.querySelector("#criminalCaseContent");

  if (!image || !category || !date || !title || !lead || !content) return;

  image.src = post.image;
  image.alt = post.alt;
  category.textContent = post.category;
  date.textContent = post.date;
  title.textContent = post.title;
  lead.textContent = post.lead;
  content.replaceChildren();

  post.sections.forEach(([heading, body]) => {
    const section = document.createElement("section");
    const sectionTitle = document.createElement("h2");
    const paragraph = document.createElement("p");

    sectionTitle.textContent = heading;
    paragraph.textContent = body;
    section.append(sectionTitle, paragraph);
    content.append(section);
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
  // The board view has been removed; old saved links now return home.
  if (id === "board") id = "home";
  const caseSlug = getCriminalCaseSlug(id);
  const targetId = caseSlug
    ? "criminal-case-detail"
    : pages.some((page) => page.id === id)
      ? id
      : "home";
  const targetHash = caseSlug ? `case-${caseSlug}` : targetId;
  const isHomeView = targetId === "home" && (id === "home" || !id);
  const usesNavyPageLayer =
    targetId === "directions" ||
    targetId === "criminal-case-detail" ||
    targetId.startsWith("lawyer-");

  if (caseSlug) {
    renderCriminalCase(caseSlug);
  }

  document.body.classList.toggle("is-home-view", isHomeView);
  document.body.classList.toggle("is-navy-page", usesNavyPageLayer);
  pages.forEach((page) => page.classList.toggle("active-page", page.id === targetId));

  pageLinks.forEach((link) => {
    const linkId = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active-link", linkId === targetId);
  });

  if (location.hash !== `#${targetHash}`) {
    history.pushState(null, "", `#${targetHash}`);
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
  const allBoardKeys = ["notice", "blog", "youtube", "free"];
  const posts = state.activeBoard === "all"
    ? allBoardKeys.flatMap((boardKey) => boardPosts[boardKey] || [])
    : boardPosts[state.activeBoard] || [];
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
  if (!pages.some((page) => page.id === id) && !getCriminalCaseSlug(id)) return;

  event.preventDefault();
  showPage(id);
});

quickQuestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(quickQuestionForm);
  const question = String(formData.get("question") || "").trim();
  const nickname = getPhoneDigits(formData.get("nickname")) || "익명";
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
  leadPhoneFab?.setAttribute("aria-hidden", "true");
  if (leadPhoneFab) leadPhoneFab.tabIndex = -1;
  window.setTimeout(() => {
    heroLeadForm?.elements.name?.focus({ preventScroll: true });
  }, 180);
}

function closeHeroLeadPanel() {
  if (!heroLeadPanel || !leadConsultFab) return;
  heroLeadPanel.classList.remove("is-open");
  heroLeadPanel.setAttribute("aria-hidden", "true");
  leadConsultFab.setAttribute("aria-expanded", "false");
  leadPhoneFab?.setAttribute("aria-hidden", "false");
  if (leadPhoneFab) leadPhoneFab.tabIndex = 0;
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
    row.innerHTML = `<p class="video-empty">표시할 동영상이 없습니다.</p>`;
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

function enableCarouselDrag(carousel, track, slideCount, getActiveIndex, setActiveIndex, stopAuto, startAuto, wrap = true) {
  if (!carousel || !track || slideCount < 2) return;

  let isPointerDown = false;
  let startX = 0;
  let currentX = 0;
  let moved = false;

  const restoreTrack = () => {
    track.style.transition = "";
  };

  carousel.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    isPointerDown = true;
    moved = false;
    startX = event.clientX;
    currentX = event.clientX;
    stopAuto();
    carousel.setPointerCapture?.(event.pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;

    currentX = event.clientX;
    const distance = currentX - startX;
    if (Math.abs(distance) > 5) moved = true;
    if (!moved) return;

    if (event.cancelable) event.preventDefault();
    carousel.classList.add("is-dragging");
    track.style.transition = "none";

    const width = Math.max(carousel.clientWidth, 1);
    const offset = (distance / width) * 100;
    track.style.transform = `translateX(${-getActiveIndex() * 100 + offset}%)`;
  });

  ["pointerup", "pointercancel"].forEach((eventName) => {
    carousel.addEventListener(eventName, (event) => {
      if (!isPointerDown) return;

      isPointerDown = false;
      carousel.classList.remove("is-dragging");
      if (carousel.hasPointerCapture?.(event.pointerId)) {
        carousel.releasePointerCapture?.(event.pointerId);
      }

      const distance = currentX - startX;
      restoreTrack();
      if (eventName === "pointerup" && Math.abs(distance) > 42) {
        const direction = distance < 0 ? 1 : -1;
        const requestedIndex = getActiveIndex() + direction;
        setActiveIndex(wrap
          ? (requestedIndex + slideCount) % slideCount
          : Math.min(Math.max(requestedIndex, 0), slideCount - 1));
      } else {
        setActiveIndex(getActiveIndex());
      }
      startAuto();
    });
  });

  carousel.addEventListener("dragstart", (event) => event.preventDefault());
  carousel.addEventListener("click", (event) => {
    if (!moved) return;

    // Preserve links and buttons inside a carousel: a short drag should never
    // leave the next tap unable to open its selected destination.
    if (event.target.closest("a, button")) {
      moved = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    moved = false;
  }, true);
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

  enableCarouselDrag(
    carousel,
    track,
    slides.length,
    () => activeIndex,
    (nextIndex) => {
      activeIndex = nextIndex;
      render();
    },
    stop,
    start,
  );

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
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
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

  const openInfoSlide = (index, hash, link) => {
      showPage(hash.replace("#", ""), false);
      activeIndex = index;
      render();
      start();
      window.history.replaceState(null, "", hash);
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      carousel.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
      link.closest("details")?.removeAttribute("open");
  };

  document.querySelectorAll("[data-open-lawyer-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage("lawyer-im-jae-hyun");
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      link.closest("details")?.removeAttribute("open");
    });
  });

  carousel.querySelectorAll(".channel-lawyer-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      const targetId = card.getAttribute("href")?.replace("#", "");
      if (!targetId) return;

      event.preventDefault();
      event.stopPropagation();
      showPage(targetId);
    });
  });

  // External channel rows must remain independent from the drag carousel.
  // Opening them explicitly prevents the carousel's pointer handling from
  // swallowing a normal tap on YouTube, Instagram, Threads, blog or Kakao.
  carousel.querySelectorAll('.channel-info-slide a.channel-info-row[target="_blank"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const destination = link.href;
      if (destination) window.open(destination, "_blank", "noopener,noreferrer");
    });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      activeIndex = index;
      render();
      start();
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

  enableCarouselDrag(
    carousel,
    track,
    slides.length,
    () => activeIndex,
    (nextIndex) => {
      activeIndex = nextIndex;
      render();
    },
    stop,
    start,
  );

  render();
  start();
}

function initCaseCardCarousel() {
  const carousel = document.querySelector("[data-case-carousel]");
  const firstPage = carousel?.querySelector("[data-case-grid]");
  const prevButton = carousel?.querySelector("[data-case-prev]");
  const nextButton = carousel?.querySelector("[data-case-next]");
  if (!carousel || !firstPage || !prevButton || !nextButton) return;

  const cards = Array.from(firstPage.children);
  if (cards.length < 1) return;

  const track = document.createElement("div");
  track.className = "case-carousel-track";
  firstPage.classList.add("case-carousel-page");

  const nextPage = firstPage.cloneNode(false);
  nextPage.removeAttribute("data-case-grid");
  nextPage.classList.add("case-carousel-page");
  cards.forEach((card) => nextPage.append(card.cloneNode(true)));

  firstPage.replaceWith(track);
  track.append(firstPage, nextPage);

  const pages = [firstPage, nextPage];
  let activeIndex = 0;

  // The carousel listens for drag gestures on its whole surface.  Keep the
  // navigation buttons out of that pointer capture so a tap always works.
  [prevButton, nextButton].forEach((button) => {
    ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
      button.addEventListener(eventName, (event) => event.stopPropagation());
    });
  });

  const render = () => {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === pages.length - 1;
    prevButton.setAttribute("aria-disabled", String(prevButton.disabled));
    nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
    pages.forEach((page, index) => {
      const isActive = index === activeIndex;
      page.setAttribute("aria-hidden", isActive ? "false" : "true");
      page.querySelectorAll("a").forEach((link) => {
        link.tabIndex = isActive ? 0 : -1;
      });
    });
  };

  nextButton.addEventListener("click", () => {
    activeIndex = Math.min(activeIndex + 1, pages.length - 1);
    render();
  });

  prevButton.addEventListener("click", () => {
    activeIndex = Math.max(activeIndex - 1, 0);
    render();
  });

  enableCarouselDrag(
    carousel,
    track,
    pages.length,
    () => activeIndex,
    (nextIndex) => {
      activeIndex = nextIndex;
      render();
    },
    () => {},
    () => {},
    false,
  );

  render();
}

function initJobChips() {
  document.querySelectorAll(".video-filter-chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
}

renderVideos();
hydrateYouTubeVideosFromApi();
initPhoneInputs();
initDirectionsPage();
initJobChips();
initJobChipSliderControls();
initFeaturedRecommendControls();
initChannelSideCarousel();
initChannelInfoCarousel();
initCaseCardCarousel();
enableDragScroll(".job-chip-row");
enableDragScroll(".featured-recommend-row");
