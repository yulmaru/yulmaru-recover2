/**
 * 형사 랜딩 DB 접수용 Google Apps Script
 *
 * 배포 방법
 * 1. 접수 받을 Google 스프레드시트에서 확장 프로그램 > Apps Script를 엽니다.
 * 2. 이 파일의 전체 내용을 붙여 넣고 저장합니다.
 * 3. 배포 > 새 배포 > 웹 앱을 선택합니다.
 *    - 실행 사용자: 나
 *    - 액세스 권한: 모든 사용자
 * 4. 배포된 웹 앱 URL을 index.html의 LEAD_API_ENDPOINT에 붙여 넣습니다.
 *
 * 독립형 Apps Script라면 아래 SPREADSHEET_ID에 시트 ID를 넣으세요.
 * 스프레드시트에 연결된 Apps Script라면 빈 문자열로 둡니다.
 */
const CONFIG = {
  SPREADSHEET_ID: "",
  SHEET_NAME: "형사",
};

const HEADERS = [
  "접수 시간",
  "이름",
  "연락처",
  "사건 유형",
  "사건 내용",
  "유입페이지",
  "유입경로",
  "지역",
  "IP",
  "개인정보 동의",
  "접수 ID",
  "기기 종류",
  "접수 위치",
];

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const sheet = getLeadSheet_();

    sheet.appendRow([
      formatLeadDate_(payload.createdAt),
      payload.name || "",
      formatPhone_(payload.phone),
      payload.caseType || "",
      payload.message || "",
      payload.pageUrl || "",
      payload.source || "",
      payload.region || "",
      payload.ip || "",
      payload.consent ? "동의" : "미동의",
      payload.id || "",
      payload.deviceType || "",
      payload.submissionLocation || "",
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, sheet: CONFIG.SHEET_NAME });
}

function getLeadSheet_() {
  const spreadsheet = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("SPREADSHEET_ID를 설정하거나 스프레드시트에 연결된 Apps Script로 실행하세요.");
  }

  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME) || spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#dbeafe");
    sheet.autoResizeColumns(1, HEADERS.length);
  } else {
    sheet.getRange(1, 1).setValue(HEADERS[0]);
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const missingHeaders = HEADERS.filter((header) => !currentHeaders.includes(header));
    if (missingHeaders.length) {
      const firstNewColumn = sheet.getLastColumn() + 1;
      sheet.getRange(1, firstNewColumn, 1, missingHeaders.length).setValues([missingHeaders]);
      sheet.getRange(1, firstNewColumn, 1, missingHeaders.length).setFontWeight("bold").setBackground("#dbeafe");
      sheet.autoResizeColumns(firstNewColumn, missingHeaders.length);
    }
    migrateExistingLeadTimes_(sheet);
  }
  return sheet;
}

function formatPhone_(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length === 11 && digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

function formatLeadDate_(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return String(value || "");

  const timezone = "Asia/Seoul";
  const day = Utilities.formatDate(date, timezone, "yyyy-MM-dd");
  const hour24 = Number(Utilities.formatDate(date, timezone, "H"));
  const minute = Utilities.formatDate(date, timezone, "mm");
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  return `${day} ${period} ${hour12}:${minute}`;
}

function migrateExistingLeadTimes_(sheet) {
  const rowCount = sheet.getLastRow() - 1;
  if (rowCount < 1) return;
  const range = sheet.getRange(2, 1, rowCount, 1);
  const values = range.getValues();
  const formatted = values.map(([value]) => [value ? formatLeadDate_(value) : ""]);
  range.setValues(formatted);
}

function parsePayload_(e) {
  const raw = e && e.parameter && e.parameter.payload;
  if (raw) return JSON.parse(raw);

  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return {};
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
