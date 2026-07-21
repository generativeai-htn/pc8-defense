const SPREADSHEET_ID = "1SqiczZ18kVY7XJKaDa65TmU-7SVKW1JgzsXVxVESrT4";
const SHEET_NAME = "Student Records";
const ALLOWED_EVENTS = new Set(["LOGIN", "SESSION_START", "MISSION_COMPLETE", "FINAL_COMPLETE"]);

function doGet() {
  return jsonResponse_({ ok: true, service: "PC-8 Student Records" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e && e.postData && e.postData.contents || "{}");
    const studentId = safeText_(data.studentId, 30);
    const fullName = safeText_(data.fullName, 100);
    const eventName = safeText_(data.event, 30).toUpperCase();
    if (!studentId || !fullName || !ALLOWED_EVENTS.has(eventName)) {
      return jsonResponse_({ ok: false, error: "invalid_payload" });
    }

    const row = [
      new Date(), studentId, fullName, eventName,
      safeText_(data.mission || "-", 40),
      safeNumber_(data.completedMissions, 0, 6),
      safeNumber_(data.progress, 0, 100),
      safeNumber_(data.integrity, 0, 100),
      safeText_(data.sessionId, 80),
      safeText_(data.source || "GitHub Pages", 300)
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: "server_error" });
  }
}

function safeText_(value, maxLength) {
  let text = String(value == null ? "" : value).trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function safeNumber_(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
