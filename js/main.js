/* PC-8 Guardian Academy — CAI game controller */

const $ = id => document.getElementById(id);
const sound = new SoundManager();
const SAVE_KEY = "pc8_guardian_academy_v2";
const UNIT_ORDER = ["checkdisk", "defrag", "cleanup", "antivirus", "onedrive"];

const game = {
  completed: new Set(), currentMission: null, battle: null, integrity: 100,
  previousScreen: "scr-hub", activeScreen: "scr-start", practiceDone: false, practiceSim: null,
  questTimer: null
};

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

function loadSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    game.completed = new Set(Array.isArray(saved?.completed) ? saved.completed : []);
  } catch { game.completed = new Set(); }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ completed: [...game.completed] }));
  updateTopProgress();
}

function showScreen(id) {
  clearTimeout(game.questTimer);
  game.questTimer = null;
  if (game.activeScreen && game.activeScreen !== id) {
    sound.play(id === "scr-hub" ? "transitionBack" : "transition");
  }
  if (game.battle && id !== "scr-game") { game.battle.stop(); game.battle = null; }
  if (game.practiceSim && id !== "scr-game") { game.practiceSim.destroy(); game.practiceSim = null; }
  document.querySelectorAll(".screen").forEach(screen => screen.classList.toggle("active", screen.id === id));
  game.previousScreen = game.activeScreen;
  game.activeScreen = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (id === "scr-hub") { renderHub(); sound.playMusic("hub"); }
}

function updateTopProgress() {
  const count = UNIT_ORDER.filter(id => game.completed.has(id)).length + (game.completed.has("final") ? 1 : 0);
  $("topProgressBar").style.width = `${count / 6 * 100}%`;
  $("topProgressText").textContent = `${count}/6`;
}

function initialize() {
  loadSave();
  renderStartCats();
  renderRoster();
  renderManual();
  renderCertificate();
  bindNavigation();
  updateTopProgress();
  $("soundIcon").src = `${PACK}/Ui/${sound.muted ? "BtnSound Off.png" : "BtnSound.png"}`;

  let progress = 8;
  const messages = ["เตรียมทีมแพทย์แมว", "ตรวจห้องรักษาทั้ง 5", "เชื่อมระบบป้องกันฐาน", "พร้อมปฏิบัติการ"];
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 18 + Math.random() * 18);
    $("loadingBar").style.width = `${progress}%`;
    $("loadingText").textContent = messages[Math.min(messages.length - 1, Math.floor(progress / 27))];
    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => { $("loadingScreen").classList.add("is-hidden"); $("app").classList.remove("is-hidden"); }, 280);
    }
  }, 170);
}

function bindNavigation() {
  document.addEventListener("click", event => {
    if (event.target.closest("button")) sound.play("click");
  });
  $("startBtn").addEventListener("click", () => { sound.playMusic("hub"); showScreen("scr-hub"); });
  $("homeBtn").addEventListener("click", () => showScreen("scr-hub"));
  $("briefBackBtn").addEventListener("click", () => showScreen("scr-hub"));
  $("launchBtn").addEventListener("click", startMission);
  $("rosterBtn").addEventListener("click", () => { game.previousScreen = game.activeScreen; showScreen("scr-roster"); });
  $("rosterBackBtn").addEventListener("click", () => showScreen(game.previousScreen === "scr-roster" ? "scr-hub" : game.previousScreen));
  $("manualBtn").addEventListener("click", () => openManual("overview"));
  document.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", closeManual));
  $("soundBtn").addEventListener("click", () => {
    const muted = sound.toggleMute();
    $("soundIcon").src = `${PACK}/Ui/${muted ? "BtnSound Off.png" : "BtnSound.png"}`;
  });
  $("certHubBtn").addEventListener("click", () => showScreen("scr-hub"));
  $("replayFinalBtn").addEventListener("click", () => openBriefing(FINAL_MISSION));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeManual(); });
}

function renderStartCats() {
  $("startCats").innerHTML = CAT_TEAM.map(cat => `<img src="${catIdlePath(cat.id)}" alt="${escapeHTML(cat.name)}" title="${escapeHTML(cat.name)}">`).join("");
}

function renderHub() {
  const finishedUnits = UNIT_ORDER.filter(id => game.completed.has(id)).length;
  const rank = game.completed.has("final") ? ["SYSTEM GUARDIAN", "ผ่านหลักสูตร PC-8 สมบูรณ์"]
    : finishedUnits >= 4 ? ["SPECIALIST", "พร้อมเปิดศึก PC-8 Core"]
    : finishedUnits >= 2 ? ["TECHNICIAN", `ผ่านแล้ว ${finishedUnits} ห้องรักษา`]
    : ["INTERN", finishedUnits ? "ฝึกต่อเพื่อเลื่อนระดับ" : "เริ่มภารกิจแรกเพื่อรับตรา"];
  $("rankText").textContent = rank[0]; $("rankSub").textContent = rank[1];
  const nodes = MISSIONS.map((mission, index) => {
    const locked = index > 0 && !game.completed.has(MISSIONS[index - 1].id);
    const complete = game.completed.has(mission.id);
    const hero = CAT_TEAM.find(cat => cat.id === mission.team[1]);
    return `<button class="mission-node ${locked ? "locked" : ""} ${complete ? "complete" : ""}" data-mission="${mission.id}" ${locked ? "disabled" : ""}>
      <span class="node-num">${complete ? "✓" : mission.chapter}</span><img class="mission-cat" src="${catIdlePath(hero.id)}" alt="">
      <h3>${escapeHTML(mission.title)}</h3><p>${escapeHTML(mission.mechanic)}</p><span class="node-state">${complete ? "รักษาสำเร็จ · เล่นซ้ำได้" : locked ? "LOCKED" : "พร้อมปฏิบัติการ"}</span></button>`;
  });
  const finalLocked = UNIT_ORDER.some(id => !game.completed.has(id));
  nodes.push(`<button class="mission-node final-node ${finalLocked ? "locked" : ""} ${game.completed.has("final") ? "complete" : ""}" data-mission="final" ${finalLocked ? "disabled" : ""}>
    <span class="node-num">${game.completed.has("final") ? "✓" : "F"}</span><img class="mission-cat" src="${PACK}/Enemies/Enemy Boss 7/Idle/Enemy-Idle_00.png" alt="">
    <h3>PC-8 CORE EMERGENCY</h3><p>15 ฮีโร่ · 5 ยูทิลิตี้ · บอส 5 ตัว</p><span class="node-state">${finalLocked ? `ผ่านอีก ${5-finishedUnits} ภารกิจเพื่อปลดล็อก` : "FINAL OPERATION"}</span></button>`);
  $("missionMap").innerHTML = nodes.join("");
  $("missionMap").querySelectorAll("[data-mission]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.mission;
    openBriefing(id === "final" ? FINAL_MISSION : MISSIONS.find(mission => mission.id === id));
  }));
}

function openBriefing(mission) {
  game.currentMission = mission;
  $("briefChapter").textContent = mission.id === "final" ? "FINAL OPERATION" : `ROOM ${mission.chapter} · ${mission.mechanic}`;
  $("briefTitle").textContent = mission.title;
  $("briefSubtitle").textContent = mission.subtitle;
  const dialogue = mission.intro || [
    "ภัยสุขภาพทั้ง 5 ด้านบุกถึง PC-8 Core พร้อมกัน",
    "สังเกตอาการของบอส แล้วเลือกยูทิลิตี้ที่รักษาได้ตรงจุด",
    "ทีม 15 ฮีโร่ พร้อม Cat Guardian และ Cat Boxing จะสนับสนุนการต่อสู้"
  ];
  $("briefDialogue").innerHTML = dialogue.map((line,index) => `<div class="dialogue-line"><b>${index ? "ข้อมูล" : "ALERT"}</b><span>${escapeHTML(line)}</span></div>`).join("");
  const displayTeam = mission.team.map(id => CAT_TEAM[id - 1]);
  $("briefTeam").innerHTML = displayTeam.map(cat => `<div class="team-member"><img src="${catIdlePath(cat.id)}" alt=""><div><strong>${escapeHTML(cat.name)}</strong><small>${escapeHTML(cat.role)}</small></div></div>`).join("");
  if (mission.id === "final") {
    $("briefTool").textContent = "เครื่องมือครบ 5 ระบบ";
    $("briefEffect").textContent = "จับคู่อาการผิดปกติกับเครื่องมือให้ถูกต้องเพื่อทำลายเกราะบอส";
  } else {
    $("briefTool").textContent = UTILITIES[mission.id].name;
    $("briefEffect").textContent = UTILITIES[mission.id].effect;
  }
  $("launchBtn").textContent = mission.id === "final" ? "ระดมทีมทั้ง 15 ตัว" : "เริ่มปฏิบัติการ";
  showScreen("scr-briefing");
}

function startMission() {
  game.integrity = 100;
  game.practiceDone = false;
  showScreen("scr-game");
  $("gameChapter").textContent = game.currentMission.id === "final" ? "FINAL OPERATION" : `ROOM ${game.currentMission.chapter}`;
  $("gameTitle").textContent = game.currentMission.title;
  updateIntegrity(100);
  if (game.currentMission.id === "final") {
    setPhase(1); renderBattle(true);
  } else {
    setPhase(0); renderPractice();
  }
}

function setPhase(index) {
  const previous = [...$("phaseTrack").querySelectorAll("span")].findIndex(step => step.classList.contains("active"));
  if (previous >= 0 && previous !== index) sound.play(index === 2 ? "confirm" : "transition");
  $("phaseTrack").querySelectorAll("span").forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === index);
    step.classList.toggle("done", stepIndex < index);
  });
}

function updateIntegrity(value) {
  game.integrity = Math.max(0, Math.round(value));
  $("integrityBar").style.width = `${game.integrity}%`;
  $("integrityText").textContent = `${game.integrity}%`;
}

function teamCoach(mission) {
  const cat = CAT_TEAM[mission.team[0] - 1];
  return `<aside><div class="coach-panel"><img src="${catIdlePath(cat.id)}" alt=""><div><strong>${escapeHTML(cat.name)}</strong><p id="coachText">${escapeHTML(mission.intro[1])}</p></div></div><div class="fact-stack">${mission.facts.map(fact => `<div class="fact-chip">${escapeHTML(fact)}</div>`).join("")}</div></aside>`;
}

function continuePracticeFlow(mission) {
  sound.play("confirm");
  game.practiceSim?.destroy();
  game.practiceSim = null;
  if (mission.id === "checkdisk") renderSectorScan();
  else {
    game.practiceDone = true;
    setPhase(1);
    renderBattle(false);
  }
}

function showQuestAssistant({ title, message, actionLabel, onContinue, autoDelay = 4600 }) {
  clearTimeout(game.questTimer);
  const mission = game.currentMission;
  const cat = CAT_TEAM[mission.team[0] - 1];
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    clearTimeout(game.questTimer);
    game.questTimer = null;
    onContinue();
  };
  $("missionMount").innerHTML = `<div class="quest-stage" role="dialog" aria-live="assertive" aria-label="ภารกิจสำเร็จ">
    <div class="quest-stage-glow"></div>
    <img class="quest-stage-win" src="${PACK}/Ui/WinPopUp.png" alt="Mission complete">
    <section class="quest-stage-npc">
      <img src="${catIdlePath(cat.id)}" alt="${escapeHTML(cat.name)}">
      <div><small>QUEST ASSISTANT · MISSION UPDATE</small><h3>${escapeHTML(title)}</h3><p><b>${escapeHTML(cat.name)}:</b> ${escapeHTML(message)}</p><button id="questContinueBtn" class="game-btn primary" type="button">${escapeHTML(actionLabel)} →</button><i><u style="--quest-delay:${autoDelay}ms"></u></i><em>ระบบจะพาไปต่ออัตโนมัติ</em></div>
    </section>
  </div>`;
  $("questContinueBtn").addEventListener("click", advance);
  game.questTimer = setTimeout(advance, autoDelay);
  sound.play("waveClear");
  sound.play("confirm");
}

function renderPractice() {
  const mission = game.currentMission;
  game.practiceSim?.destroy();
  game.practiceSim = new WindowsPracticeSimulator({
    mount: $("missionMount"),
    mission,
    onMistake: amount => practiceDamage(amount),
    onComplete: () => continuePracticeFlow(mission)
  });
}

function procedureStrip(sequence) {
  return `<div class="sequence-board">${sequence.map((step,index) => `<div class="sequence-step done"><b>${index+1}</b>${escapeHTML(step)}</div>`).join("")}</div>`;
}

function renderSequence(mission, onComplete) {
  const order = mission.sequence.map((label,index) => ({ label,index }));
  const shuffled = [...order].sort(() => Math.random() - .5);
  let expected = 0;
  $("missionMount").innerHTML = `<div class="sim-layout"><section class="sim-console"><p class="eyebrow">INTERACTIVE PROCEDURE</p><h3>สั่งงานระบบตามลำดับจริง</h3><p class="sim-instruction">เลือกคำสั่งถัดไปให้ถูกต้อง ระบบจะบันทึกขั้นตอนลง Workflow</p><div class="defrag-meter"><span>ขั้นตอนที่ต้องทำ</span><b id="sequenceProgress">1 / ${order.length}</b></div><div id="sequenceBoard" class="sequence-board"></div><p id="sequenceFeedback" class="feedback-line">เริ่มจาก: ${escapeHTML(order[0].label)}</p></section>${teamCoach(mission)}</div>`;
  const board = $("sequenceBoard");
  board.innerHTML = shuffled.map(item => `<button class="sequence-step" type="button" data-step="${item.index}"><b>?</b>${escapeHTML(item.label)}</button>`).join("");
  board.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.step);
    if (index !== expected) {
      button.classList.remove("wrong"); void button.offsetWidth; button.classList.add("wrong");
      $("sequenceFeedback").textContent = `ลำดับยังไม่ถูก — ขั้นต่อไปคือ “${order[expected].label}”`;
      practiceDamage(5); sound.play("damage"); return;
    }
    button.classList.remove("wrong"); button.classList.add("done"); button.disabled = true;
    button.querySelector("b").textContent = expected + 1; expected++; sound.play("hit");
    if (expected >= order.length) {
      $("sequenceProgress").textContent = "WORKFLOW COMPLETE";
      $("sequenceFeedback").textContent = "ลำดับถูกต้อง ระบบจำลองพร้อมทำงาน";
      setTimeout(onComplete, 600);
    } else {
      $("sequenceProgress").textContent = `${expected + 1} / ${order.length}`;
      $("sequenceFeedback").textContent = `ขั้นถัดไป: ${order[expected].label}`;
    }
  }));
}

function practiceDamage(amount) {
  updateIntegrity(game.integrity - amount);
  if (game.integrity <= 0) {
    updateIntegrity(35);
    $("coachText").textContent = "ระบบจำลองรีสตาร์ตให้แล้ว ลองสังเกตคำแนะนำและทำใหม่อีกครั้ง";
  }
}

function renderSectorScan() {
  const corrupt = new Set([2, 7, 13, 18]);
  let fixed = 0;
  $("missionMount").innerHTML = `<div class="sim-layout"><section class="sim-console"><p class="eyebrow">CHECK DISK SCANNER</p><h3>ระบุเซกเตอร์ที่มี File System Error</h3><p class="sim-instruction">จุดสีแดงคือโครงสร้างไฟล์เสียหาย คลิกให้ครบเพื่อสั่งซ่อม</p><div id="sectorGrid" class="sector-grid">${Array.from({length:20},(_,index)=>`<button class="sector ${corrupt.has(index) ? "corrupt" : ""}" data-sector="${index}" type="button" aria-label="เซกเตอร์ ${index + 1}"></button>`).join("")}</div><p id="sectorFeedback" class="feedback-line">ตรวจพบสัญญาณผิดปกติ 4 จุด</p><div id="practiceActions" class="sim-actions"></div></section>${teamCoach(game.currentMission)}</div>`;
  $("sectorGrid").querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.sector);
    if (!corrupt.has(index)) { button.classList.add("wrong"); $("sectorFeedback").textContent="จุดนี้ปกติ — มองหาเซกเตอร์สีแดง"; practiceDamage(3); return; }
    if (button.classList.contains("fixed")) return;
    button.classList.add("fixed"); fixed++; sound.play("hit");
    $("sectorFeedback").textContent = `ซ่อมแล้ว ${fixed}/4 จุด`;
    if (fixed === corrupt.size) finishPractice();
  }));
}

function renderDefrag() {
  const target = [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3];
  let blocks = [0,2,1,3,1,0,3,2,2,1,0,3,3,2,1,0];
  let selected = null; let swaps = 0;
  $("missionMount").innerHTML = `<div class="sim-layout"><section class="sim-console"><p class="eyebrow">DEFRAGMENT LAB</p><h3>รวมชิ้นส่วนไฟล์สีเดียวกันให้ต่อเนื่อง</h3><p class="sim-instruction">คลิกบล็อก 2 ช่องเพื่อสลับตำแหน่ง เป้าหมายคือ 0% fragmented</p><div class="defrag-meter"><span>Fragmented</span><b id="fragmentText">100%</b><span>สลับ <b id="swapText">0</b> ครั้ง</span></div><div id="diskBoard" class="disk-board"></div><p id="defragFeedback" class="feedback-line">วางสีเขียว → ฟ้า → เหลือง → ม่วง กลุ่มละ 4 ช่อง</p><details><summary>ขั้นตอนใน Windows ที่ใช้จริง</summary>${procedureStrip(game.currentMission.sequence)}</details><div id="practiceActions" class="sim-actions"></div></section>${teamCoach(game.currentMission)}</div>`;
  const board = $("diskBoard");
  const paint = () => {
    board.innerHTML = blocks.map((kind,index)=>`<button type="button" class="disk-block ${selected===index ? "selected" : ""}" data-index="${index}" data-kind="${kind}" aria-label="บล็อกข้อมูล ${index+1}"></button>`).join("");
    const correct = blocks.filter((value,index)=>value===target[index]).length;
    $("fragmentText").textContent = `${Math.round((1-correct/target.length)*100)}%`;
    board.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      if (selected === null) selected = index;
      else { [blocks[selected],blocks[index]]=[blocks[index],blocks[selected]]; selected=null;swaps++;$("swapText").textContent=swaps;sound.play("hit"); }
      paint();
      if (blocks.every((value,i)=>value===target[i])) { $("defragFeedback").textContent="สถานะ OK — 0% fragmented หัวอ่านเข้าถึงข้อมูลได้ต่อเนื่อง"; finishPractice(); }
    }));
  };
  paint();
}

function renderCleanup() {
  let freed = 0; const target = 900;
  $("missionMount").innerHTML = `<div class="sim-layout"><section class="sim-console"><p class="eyebrow">STORAGE DETOX</p><h3>คัดไฟล์ขยะเพื่อคืนพื้นที่ ${target} MB</h3><p class="sim-instruction">เลือกเฉพาะไฟล์ชั่วคราวหรือไฟล์ระบบที่ไม่จำเป็น ระวังเอกสารของผู้ใช้</p><div class="space-meter"><i id="spaceBar"></i></div><div class="defrag-meter"><span>คืนพื้นที่แล้ว</span><b id="spaceText">0 / ${target} MB</b></div><div id="fileGrid" class="file-grid"></div><p id="cleanupFeedback" class="feedback-line">แตะรายการที่ต้องการลบด้วย Disk Cleanup</p><details><summary>ขั้นตอนใน Windows ที่ใช้จริง</summary>${procedureStrip(game.currentMission.sequence)}</details><div id="practiceActions" class="sim-actions"></div></section>${teamCoach(game.currentMission)}</div>`;
  const grid = $("fileGrid");
  grid.innerHTML = [...CLEANUP_FILES].sort(()=>Math.random()-.5).map((file,index)=>`<button class="file-card" type="button" data-index="${CLEANUP_FILES.indexOf(file)}"><span>${file.icon}</span><b>${escapeHTML(file.name)}</b><small>${file.size} MB</small></button>`).join("");
  grid.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{
    const file=CLEANUP_FILES[Number(button.dataset.index)];
    if (!file.safe) { button.classList.remove("wrong");void button.offsetWidth;button.classList.add("wrong");$("cleanupFeedback").textContent=`ห้ามลบ ${file.name} — นี่คือข้อมูลสำคัญของผู้ใช้`;practiceDamage(8);sound.play("damage");return; }
    if(button.classList.contains("removed"))return;
    button.classList.add("removed");freed+=file.size;sound.play("hit");
    $("spaceBar").style.width=`${Math.min(100,freed/target*100)}%`;$("spaceText").textContent=`${freed} / ${target} MB`;$("cleanupFeedback").textContent=`ลบ ${file.name} อย่างปลอดภัย`;
    if(freed>=target)finishPractice();
  }));
}

function finishPractice() {
  if (game.practiceDone) return;
  game.practiceDone = true;
  const mission = game.currentMission;
  showQuestAssistant({
    title: "ฝึกปฏิบัติสำเร็จ!",
    message: `ยินดีด้วย คุณใช้ ${UTILITIES[mission.id].name} แก้ปัญหาได้ถูกต้องแล้ว ต่อไปนำความรู้ไปป้องกันระบบจริงกันเลย`,
    actionLabel: "เข้าสู่สนามป้องกันระบบ",
    onContinue: () => { setPhase(1); renderBattle(false); }
  });
}

async function renderBattle(finalMode) {
  const mission = game.currentMission;
  sound.playMusic(finalMode ? "boss" : "battle");
  const utilityButtons = finalMode
    ? Object.entries(UTILITIES).map(([id,utility])=>`<button class="ability-btn" data-tool="${id}" style="--ability:${utility.color}" type="button"><b>${utility.icon} ${utility.name}</b><small>${utility.symptom}</small><i></i></button>`).join("") + `<button class="ability-btn special-ability" data-special="guardian" style="--ability:#53d6a5" type="button"><img src="${PACK}/Cat Guardian/Idle/Enemy-Idle_00.png" alt=""><b>Cat Guardian</b><small>ฟื้นฟูฐาน</small><i></i></button><button class="ability-btn special-ability" data-special="boxing" style="--ability:#ffbd4a" type="button"><img src="${PACK}/CatBoxing/Idle/CatBoxing-Idle_00.png" alt=""><b>Cat Boxing</b><small>หมัดทำลายเกราะ</small><i></i></button>`
    : `<button class="ability-btn" id="missionAbility" data-tool="${mission.id}" style="--ability:${UTILITIES[mission.id].color}" type="button"><b>${UTILITIES[mission.id].icon} ${UTILITIES[mission.id].name}</b><small>พลังยังไม่เต็ม</small><i></i></button>`;
  const combatSkillButtons = `<button class="ability-btn combat-skill ready" data-combat-skill="lightning" style="--ability:#62dfff" type="button"><b>⚡ THUNDER STRIKE</b><small>ฟ้าผ่าศัตรูในพื้นที่ · พร้อมใช้</small><i style="width:100%"></i></button><button class="ability-btn combat-skill ready" data-combat-skill="bomb" style="--ability:#ff914d" type="button"><b>💣 MEGA BOMB</b><small>ระเบิดวงกว้าง · พร้อมใช้</small><i style="width:100%"></i></button>`;
  const controlledCat = CAT_TEAM[mission.team[0] - 1];
  $("missionMount").innerHTML = `<div class="battle-shell"><div class="battle-hud"><div><span>WAVE</span><strong id="waveText">PREPARE</strong><span>กำจัด</span><strong id="defeatText">0</strong></div><div class="hero-status"><img src="${catIdlePath(controlledCat.id)}" alt=""><span>ผู้เล่นควบคุม</span><strong>${escapeHTML(controlledCat.name)}</strong></div><div><span>เป้าหมาย</span><strong>${finalMode ? "รักษาอาการบอสให้ถูก" : "เก็บ Data Core เพื่อชาร์จพลัง"}</strong></div></div><div id="bossAlert" class="boss-alert" ${finalMode ? "" : "hidden"}>รอวิเคราะห์อาการของบอส...</div><div class="battle-canvas-wrap"><canvas id="battleCanvas"></canvas><div id="learningToast" class="learning-toast"><b>KNOWLEDGE CORE</b><span>เดินเก็บ Data Core เพื่อรับความรู้และชาร์จ Ability</span></div><div class="battle-tip">WASD/ปุ่มลูกศร = เดิน · เมาส์ = เล็ง · กดค้าง/Spacebar = ยิง · เดินเก็บ DATA CORE · กดสกิลด้านล่าง</div><div id="mobileControls" class="mobile-controls"><div class="move-pad"><button data-move="up" aria-label="เดินขึ้น">▲</button><button data-move="left" aria-label="เดินซ้าย">◀</button><button data-move="down" aria-label="เดินลง">▼</button><button data-move="right" aria-label="เดินขวา">▶</button></div><button class="mobile-fire" data-mobile-fire aria-label="ยิง">FIRE</button></div><div id="battleLoading" class="battle-loading"><i></i><p>กำลังเตรียมตัวละครจาก Game Pack...</p></div></div><div id="abilityDock" class="ability-dock">${utilityButtons}${combatSkillButtons}</div></div>`;
  const battle = new DefenseBattle({ canvas: $("battleCanvas"), mission, finalMode, sound, callbacks: {
    onLoad: ratio => { const p=$("battleLoading").querySelector("p");if(p)p.textContent=`โหลดกำลังรบ ${Math.round(ratio*100)}%`; },
    onIntegrity: updateIntegrity,
    onCharge: charge => updateAbilityCharge(charge),
    onWave: (current,total,wave) => {
      $("waveText").textContent=`${current}/${total} ${wave.kind === "boss" ? "· GIANT BOSS" : ""}`;
      if (wave.kind === "boss") {
        sound.playMusic("boss");
        const alert = $("bossAlert");
        alert.hidden = false;
        alert.innerHTML = "⚠ <b>GIANT BOSS INCOMING</b> — เล็งยิงจุดศูนย์กลางและใช้ Ability ทำลายเกราะ!";
      } else if (!finalMode) {
        $("bossAlert").hidden = true;
      }
    },
    onAlert: (tool,timedOut,used) => updateBossAlert(tool,timedOut,used),
    onFact: (fact,reward) => showLearningFact(fact,reward),
    onWrongTool: (used,needed) => flashWrongTool(used,needed),
    onSpecial: type => flashAbility(`[data-special="${type}"]`,true),
    onCombatSkills: cooldowns => updateCombatSkillButtons(cooldowns),
    onWin: result => { $("defeatText").textContent=result.defeated; updateIntegrity(result.integrity); setTimeout(()=>renderDebrief(result),700); },
    onLose: showBattleLoss
  }});
  game.battle = battle;
  await battle.load();
  if (game.battle !== battle) return;
  battle.integrity = game.integrity;
  $("battleLoading").classList.add("hide");
  $("abilityDock").querySelectorAll("[data-tool]").forEach(button=>button.addEventListener("click",()=>{
    const ok=battle.activateUtility(button.dataset.tool);flashAbility(`[data-tool="${button.dataset.tool}"]`,ok);
  }));
  $("abilityDock").querySelectorAll("[data-special]").forEach(button=>button.addEventListener("click",()=>battle.activateSpecial(button.dataset.special)));
  $("abilityDock").querySelectorAll("[data-combat-skill]").forEach(button=>button.addEventListener("click",()=>{
    const ok = battle.activateCombatSkill(button.dataset.combatSkill);
    flashAbility(`[data-combat-skill="${button.dataset.combatSkill}"]`,ok);
  }));
  bindBattleControls(battle);
  battle.start();
  showLearningFact(finalMode ? "สังเกตอาการที่บอสแสดง แล้วเลือกยูทิลิตี้ให้ตรงก่อนหมดเวลา" : mission.facts[0], "MISSION GUIDE");
}

function bindBattleControls(battle) {
  $("mobileControls")?.querySelectorAll("[data-move]").forEach(button => {
    const direction = button.dataset.move;
    const start = event => { event.preventDefault(); event.stopPropagation(); battle.setVirtualMove(direction, true); };
    const stop = event => { event.preventDefault(); event.stopPropagation(); battle.setVirtualMove(direction, false); };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });
  const fire = $("mobileControls")?.querySelector("[data-mobile-fire]");
  if (fire) {
    const start = event => { event.preventDefault(); event.stopPropagation(); battle.setVirtualFire(true); };
    const stop = event => { event.preventDefault(); event.stopPropagation(); battle.setVirtualFire(false); };
    fire.addEventListener("pointerdown", start);
    fire.addEventListener("pointerup", stop);
    fire.addEventListener("pointercancel", stop);
    fire.addEventListener("pointerleave", stop);
  }
}

let learningToastTimer = null;
function showLearningFact(fact, reward) {
  const toast = $("learningToast");
  if (!toast) return;
  toast.innerHTML = `<b>${escapeHTML(reward)} · KNOWLEDGE UNLOCKED</b><span>${escapeHTML(fact)}</span>`;
  toast.classList.add("show");
  clearTimeout(learningToastTimer);
  learningToastTimer = setTimeout(() => toast.classList.remove("show"), 4300);
}

function updateAbilityCharge(charge) {
  const button=$("missionAbility");if(!button)return;
  button.querySelector("i").style.width=`${charge}%`;button.classList.toggle("ready",charge>=100);
  button.querySelector("small").textContent=charge>=100?"พร้อมใช้งาน — กดปล่อยพลัง":`ชาร์จ ${Math.round(charge)}%`;
  const count=game.battle?.totalDefeated||0;if($("defeatText"))$("defeatText").textContent=count;
}

function updateCombatSkillButtons(cooldowns) {
  const max = { lightning: 8, bomb: 12 };
  Object.entries(cooldowns).forEach(([type, remaining]) => {
    const button = document.querySelector(`[data-combat-skill="${type}"]`);
    if (!button) return;
    const ready = remaining <= .05;
    button.disabled = !ready;
    button.classList.toggle("ready", ready);
    button.classList.toggle("cooldown", !ready);
    button.querySelector("small").textContent = ready
      ? (type === "lightning" ? "ฟ้าผ่าศัตรูในพื้นที่ · พร้อมใช้" : "ระเบิดวงกว้าง · พร้อมใช้")
      : `คูลดาวน์ ${remaining.toFixed(1)} วินาที`;
    button.querySelector("i").style.width = `${Math.max(0, 100 * (1 - remaining / max[type]))}%`;
  });
}

function updateBossAlert(tool,timedOut=false,used=null) {
  const alert=$("bossAlert");if(!alert)return;
  if(used){alert.innerHTML=`เลือก <b>${UTILITIES[used].name}</b> ถูกต้อง — เกราะบอสแตก!`;return;}
  if(!tool){alert.innerHTML="กำจัดภัยคุกคามแล้ว เตรียมวิเคราะห์บอสตัวถัดไป...";return;}
  alert.innerHTML=`${timedOut?"ระบบเสียหาย! ":"ตรวจพบอาการ: "}<b>${UTILITIES[tool].symptom}</b> — เลือกเครื่องมือรักษาให้ตรงจุด`;
}

function flashAbility(selector,ok) {
  const button=$("abilityDock")?.querySelector(selector);if(!button)return;
  const cls=ok?"correct-call":"wrong-call";button.classList.remove(cls);void button.offsetWidth;button.classList.add(cls);setTimeout(()=>button.classList.remove(cls),650);
}

function flashWrongTool(used,needed) {
  flashAbility(`[data-tool="${used}"]`,false);
  const alert=$("bossAlert");if(alert)alert.innerHTML=`เครื่องมือไม่ตรงอาการ — <b>${UTILITIES[needed].symptom}</b> ต้องใช้เครื่องมืออีกชนิด`;
}

function showBattleLoss() {
  sound.playMusic("hub");
  $("resultCard").innerHTML=`<img src="${PACK}/Ui/LosePopUp.png" alt="" style="width:180px"><h3>ระบบยังไม่ปลอดภัย</h3><p>ทบทวนขั้นตอน แล้ววางแผนใช้พลังให้ตรงกับสถานการณ์</p><div class="actions"><button id="retryBtn" class="game-btn primary">ลองภารกิจอีกครั้ง</button><button id="lossHubBtn" class="game-btn">กลับศูนย์</button></div>`;
  $("resultOverlay").classList.add("open");$("resultOverlay").setAttribute("aria-hidden","false");
  $("retryBtn").onclick=()=>{closeResult();startMission();};$("lossHubBtn").onclick=()=>{closeResult();showScreen("scr-hub");};
}

function closeResult(){$("resultOverlay").classList.remove("open");$("resultOverlay").setAttribute("aria-hidden","true");}

function renderDebrief(result) {
  if(game.battle){game.battle.stop();game.battle=null;}
  const mission=game.currentMission;setPhase(2);game.completed.add(mission.id);saveProgress();sound.playMusic("hub");
  const facts=mission.facts || FINAL_MISSION.facts;
  $("missionMount").innerHTML=`<div class="debrief"><img class="badge-art" src="${PACK}/Ui/WinBonus.png" alt=""><p class="eyebrow">SYSTEM STABILIZED · INTEGRITY ${result.integrity}%</p><h3>${mission.id==="final"?"ปกป้อง PC-8 Core สำเร็จ":escapeHTML(mission.reward)}</h3><p>ความรู้ที่นำไปใช้ในภารกิจนี้</p><div class="takeaways">${facts.map((fact,index)=>`<div class="takeaway"><b>${index+1}</b> ${escapeHTML(fact)}</div>`).join("")}</div><button id="debriefNext" class="game-btn primary xl" type="button">${mission.id==="final"?"รับประกาศนียบัตร":"กลับแผนที่ภารกิจ"}</button></div>`;
  $("debriefNext").addEventListener("click",()=>mission.id==="final"?(renderCertificate(),showScreen("scr-certificate")):showScreen("scr-hub"));
}

function renderRoster() {
  $("rosterGrid").innerHTML=CAT_TEAM.map(cat=>{const unit=UTILITIES[cat.unit];return `<article class="roster-card" style="border-top-color:${unit.color}"><img src="${catIdlePath(cat.id)}" alt=""><strong>C${String(cat.id).padStart(2,"0")} · ${escapeHTML(cat.name)}</strong><small>${escapeHTML(cat.role)}</small><span>${unit.icon} ${escapeHTML(unit.name)}</span></article>`;}).join("");
}

function renderManual() {
  $("manualNav").innerHTML=MANUAL_SECTIONS.map((section,index)=>`<button type="button" data-section="${section.id}" class="${index===0?"active":""}">${escapeHTML(section.title)}</button>`).join("");
  $("manualNav").querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>openManual(button.dataset.section)));
  showManualSection("overview");
}

function openManual(sectionId="overview") { $("manualModal").classList.add("open");$("manualModal").setAttribute("aria-hidden","false");showManualSection(sectionId); }
function closeManual() { $("manualModal").classList.remove("open");$("manualModal").setAttribute("aria-hidden","true"); }
function showManualSection(sectionId) {
  const section=MANUAL_SECTIONS.find(item=>item.id===sectionId)||MANUAL_SECTIONS[0];
  $("manualNav").querySelectorAll("button").forEach(button=>button.classList.toggle("active",button.dataset.section===section.id));
  $("manualContent").innerHTML=`<p class="eyebrow">UNIT 8 · COMPUTER HEALTH CLINIC</p><h2>${escapeHTML(section.title)}</h2><ul>${section.content.map(item=>`<li>${escapeHTML(item)}</li>`).join("")}</ul>${section.id!=="overview"&&UTILITIES[section.id]?`<div class="intel-card"><span>ตารางดูแล</span><strong>${escapeHTML(UTILITIES[section.id].cadence)}</strong><p>${escapeHTML(UTILITIES[section.id].effect)}</p></div>`:""}`;
}

function renderCertificate() {
  $("certificateBadges").innerHTML=MISSIONS.map(mission=>`<span>${game.completed.has(mission.id)?"✓":"○"} ${escapeHTML(mission.reward)}</span>`).join("");
  $("healthSchedule").innerHTML=HEALTH_SCHEDULE.map(item=>`<div><b>${item.icon} ${escapeHTML(item.when)}</b><strong>${escapeHTML(item.task)}</strong><small>${escapeHTML(item.detail)}</small></div>`).join("");
}

initialize();
