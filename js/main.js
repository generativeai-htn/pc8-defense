/* ============================================================
   PC-8 Defense — screen flow, learning activities & game state
   ============================================================ */

const soundManager = new SoundManager();
const assetStore = new AssetStore();

const $ = id => document.getElementById(id);
const screens = Array.from(document.querySelectorAll(".screen"));
const savedRooms = (() => {
  try {
    const value = JSON.parse(localStorage.getItem("pc8_completed") || "[]");
    return Array.isArray(value) ? value.filter(id => STAGES.some(stage => stage.id === id)) : [];
  } catch (_) {
    return [];
  }
})();

const game = {
  completed: new Set(savedRooms),
  bossDone: localStorage.getItem("pc8_boss_done") === "1",
  currentStage: null,
  currentStageIndex: -1,
  activeBattle: null,
  battleStarted: false,
  quizQuestions: [],
  quizIndex: 0,
  quizLocked: false,
  triageIndex: 0,
  triageScore: 0,
  workshop: Object.fromEntries(PRACTICE_TASKS.map(task => [task.id, 0])),
  scheduleSelected: null,
  scheduleMatches: new Map()
};

function saveProgress() {
  localStorage.setItem("pc8_completed", JSON.stringify(Array.from(game.completed)));
  localStorage.setItem("pc8_boss_done", game.bossDone ? "1" : "0");
}

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));
  $("topbar").hidden = id === "scr-loading";
  $("mapBtn").hidden = ["scr-loading", "scr-start", "scr-diagnosis", "scr-map"].includes(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setMusic(key) {
  soundManager.playMusic(key);
}

function updateDots(activeId = "") {
  const dots = $("roomdots");
  dots.innerHTML = "";
  STAGES.forEach(stage => {
    const dot = document.createElement("span");
    dot.className = "dot";
    if (game.completed.has(stage.id)) dot.classList.add("done");
    if (activeId === stage.id) dot.classList.add("now");
    dot.title = `${stage.code}: ${stage.title}`;
    dots.appendChild(dot);
  });
  const bossDot = document.createElement("span");
  bossDot.className = "dot";
  if (game.bossDone) bossDot.classList.add("done");
  if (activeId === "boss") bossDot.classList.add("now");
  bossDot.title = "Final: ไวรัสร้าย";
  dots.appendChild(bossDot);
}

function defenderPortrait(key) {
  return `${DEFENDERS[key].img}/idle/idle_00.png`;
}

/* ---------- pre-op diagnosis ---------- */

function openDiagnosis() {
  game.triageIndex = 0;
  game.triageScore = 0;
  $("triageScore").textContent = "0";
  setMusic("hub");
  showScreen("scr-diagnosis");
  renderTriage();
}

function renderTriage() {
  const options = $("triageOptions");
  const feedback = $("triageFeedback");
  options.innerHTML = "";
  feedback.textContent = "";

  if (game.triageIndex >= TRIAGE_CASES.length) {
    $("triageTitle").textContent = "วินิจฉัยครบทุกเคส";
    $("triageSymptom").textContent = "คุณพร้อมนำหน่วยยูทิลิตี้เข้าสู่ห้องรักษาแล้ว";
    const next = document.createElement("button");
    next.className = "btn btn-primary btn-lg";
    next.type = "button";
    next.textContent = "เข้าสู่แผนที่ภารกิจ →";
    next.addEventListener("click", openMap);
    options.appendChild(next);
    feedback.textContent = "จำไว้: เลือกเครื่องมือให้ตรงอาการ ช่วยให้แก้ปัญหาได้เร็วและปลอดภัย";
    feedback.className = "feedback success";
    return;
  }

  const item = TRIAGE_CASES[game.triageIndex];
  $("triageTitle").textContent = `เคสที่ ${game.triageIndex + 1} จาก ${TRIAGE_CASES.length}`;
  $("triageSymptom").textContent = item.symptom;

  ["checkdisk", "defrag", "cleanup", "antivirus"].forEach(key => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "triage-option";
    button.innerHTML = `<img src="${defenderPortrait(key)}" alt=""><span><b>${DEFENDERS[key].tool}</b><small>${DEFENDERS[key].name}</small></span>`;
    button.addEventListener("click", () => {
      if (key !== item.answer) {
        button.classList.remove("wrong");
        void button.offsetWidth;
        button.classList.add("wrong");
        feedback.className = "feedback error";
        feedback.textContent = "ยังไม่ตรงอาการ ลองเทียบหน้าที่ของเครื่องมืออีกครั้ง";
        soundManager.play("damage");
        return;
      }
      options.querySelectorAll("button").forEach(option => (option.disabled = true));
      button.classList.add("correct");
      feedback.className = "feedback success";
      feedback.textContent = `ถูกต้อง — ${item.result}`;
      game.triageIndex += 1;
      game.triageScore += 1;
      $("triageScore").textContent = String(game.triageScore);
      soundManager.play("waveClear");
      window.setTimeout(renderTriage, 950);
    });
    options.appendChild(button);
  });
}

/* ---------- mission map & lessons ---------- */

function openMap() {
  destroyBattle();
  setMusic("hub");
  renderMap();
  updateDots();
  showScreen("scr-map");
}

function renderMap() {
  const grid = $("hubGrid");
  grid.innerHTML = "";

  STAGES.forEach((stage, index) => {
    const unlocked = index === 0 || game.completed.has(STAGES[index - 1].id);
    const done = game.completed.has(stage.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `room-card${unlocked ? "" : " locked"}${done ? " done" : ""}`;
    card.disabled = !unlocked;
    const status = done ? "ผ่านแล้ว" : unlocked ? "พร้อมรักษา" : "ล็อก";
    const statusClass = done ? "done" : unlocked ? "ready" : "locked";
    card.innerHTML = `
      <div class="rc-top">
        <img class="rc-icon" src="${defenderPortrait(stage.defender)}" alt="">
        <span class="status ${statusClass}">${status}</span>
      </div>
      <span class="eyebrow">${stage.code}</span>
      <h3>${stage.title}</h3>
      <p>${stage.subtitle}</p>`;
    if (unlocked) card.addEventListener("click", () => openLesson(stage, index));
    grid.appendChild(card);
  });

  const bossUnlocked = STAGES.every(stage => game.completed.has(stage.id));
  const boss = document.createElement("button");
  boss.type = "button";
  boss.className = `room-card boss${bossUnlocked ? "" : " locked"}${game.bossDone ? " done" : ""}`;
  boss.disabled = !bossUnlocked;
  boss.innerHTML = `
    <div class="rc-top">
      <img class="rc-icon" src="${ENEMY_TYPES.boss.img}/idle/idle_00.png" alt="">
      <span class="status ${game.bossDone ? "done" : bossUnlocked ? "ready" : "locked"}">${game.bossDone ? "ชนะแล้ว" : bossUnlocked ? "BOSS READY" : "ผ่าน 5 ห้องก่อน"}</span>
    </div>
    <span class="eyebrow">FINAL BATTLE</span>
    <h3>${BOSS_STAGE.title}</h3>
    <p>${BOSS_STAGE.subtitle}</p>`;
  if (bossUnlocked) boss.addEventListener("click", () => openLesson(BOSS_STAGE, -1));
  grid.appendChild(boss);
}

function openLesson(stage, index) {
  game.currentStage = stage;
  game.currentStageIndex = index;
  updateDots(stage.id);
  $("lessonCode").textContent = stage.code;
  $("lessonTitle").textContent = stage.title;
  $("lessonHeading").textContent = stage.lesson.heading;
  $("lessonBody").textContent = stage.lesson.body;
  const steps = $("lessonSteps");
  steps.innerHTML = "";
  stage.lesson.steps.forEach((step, stepIndex) => {
    const row = document.createElement("div");
    row.className = "step";
    row.innerHTML = `<span class="num">${stepIndex + 1}</span><span>${step}</span>`;
    steps.appendChild(row);
  });
  $("lessonGo").textContent = stage.id === "boss" ? "เข้าสนามบอส ▶" : "เข้าสนามรักษา ▶";
  showScreen("scr-lesson");
}

/* ---------- tower-defense battle ---------- */

function destroyBattle() {
  if (game.activeBattle) game.activeBattle.destroy();
  game.activeBattle = null;
  game.battleStarted = false;
}

function openBattle() {
  const stage = game.currentStage;
  if (!stage) return openMap();
  destroyBattle();
  updateDots(stage.id);
  showScreen("scr-battle");
  setMusic(stage.id === "boss" ? "boss" : "battle");
  $("battleOverlay").classList.add("hidden");
  $("battleStart").hidden = false;
  $("battleStart").disabled = true;
  $("battleStart").textContent = "ปล่อยคลื่นศัตรู ▶";
  $("healthBar").style.width = "100%";
  $("coinsNum").textContent = String(stage.startCoins);
  $("waveNum").textContent = `0/${stage.waves.reduce((sum, wave) => sum + wave.count, 0)}`;

  game.activeBattle = new Battle($("battleMount"), assetStore, stage, {
    onCoins: coins => {
      $("coinsNum").textContent = String(coins);
      updatePaletteAffordability();
    },
    onHealth: health => {
      $("healthBar").style.width = `${health}%`;
      $("healthBar").style.background = health > 40 ? "var(--pulse)" : "var(--alert)";
    },
    onWave: (spawned, total) => {
      $("waveNum").textContent = `${spawned}/${total}`;
    },
    onPlacement: updateBattleReadiness,
    onClear: battleWon,
    onLose: battleLost
  });
  renderBattlePalette();
  updateBattleReadiness();
}

function renderBattlePalette() {
  const stage = game.currentStage;
  const keys = stage.id === "boss" ? Object.keys(DEFENDERS) : [stage.defender];
  const palette = $("battlePalette");
  palette.innerHTML = "";
  keys.forEach((key, index) => {
    const def = DEFENDERS[key];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `palette-btn${index === 0 ? " armed" : ""}`;
    button.dataset.key = key;
    button.innerHTML = `<img src="${defenderPortrait(key)}" alt=""><span>${def.tool}<small class="cost">${def.cost} เหรียญ</small></span>`;
    button.addEventListener("click", () => {
      palette.querySelectorAll(".palette-btn").forEach(item => item.classList.remove("armed"));
      button.classList.add("armed");
      game.activeBattle.armDefender(key);
      $("battleHint").textContent = `เลือก ${def.tool} แล้ว — แตะช่องเส้นประบนสนามเพื่อวางหน่วย`;
    });
    palette.appendChild(button);
  });
  game.activeBattle.armDefender(keys[0]);
}

function updatePaletteAffordability() {
  if (!game.activeBattle) return;
  $("battlePalette").querySelectorAll(".palette-btn").forEach(button => {
    button.disabled = game.activeBattle.coins < DEFENDERS[button.dataset.key].cost;
  });
}

function updateBattleReadiness() {
  if (!game.activeBattle || game.battleStarted) return;
  const placed = game.activeBattle.defenders.filter(Boolean);
  const start = $("battleStart");
  if (game.currentStage.id === "boss") {
    const unique = new Set(placed.map(unit => unit.key));
    const missing = Object.keys(DEFENDERS).filter(key => !unique.has(key));
    start.disabled = missing.length > 0;
    $("battleHint").textContent = missing.length
      ? `เตรียมทีมบอส: ยังขาด ${missing.map(key => DEFENDERS[key].tool).join(", ")}`
      : "ทีมยูทิลิตี้ครบ 5 ชนิดแล้ว — พร้อมรับมือไวรัสร้าย";
  } else {
    start.disabled = placed.length === 0;
    $("battleHint").textContent = placed.length
      ? `วางกำลังแล้ว ${placed.length} หน่วย จะวางเพิ่มหรือเริ่มการโจมตีก็ได้`
      : "เลือกหน่วย แล้วแตะช่องเส้นประบนสนามเพื่อวางกำลัง";
  }
  updatePaletteAffordability();
}

function startEnemyWaves() {
  if (!game.activeBattle || game.battleStarted || $("battleStart").disabled) return;
  game.battleStarted = true;
  $("battleStart").disabled = true;
  $("battleStart").textContent = "กำลังป้องกัน PC-8";
  $("battleHint").textContent = "กำจัดภัยคุกคามก่อนถึงเส้นฐานระบบ — ศัตรูที่ถูกกำจัดจะคืนเหรียญให้ทีม";
  game.activeBattle.start();
}

function showBattleResult(title, body, actions) {
  $("overlayTitle").textContent = title;
  $("overlayBody").textContent = body;
  const actionRow = $("overlayActions");
  actionRow.innerHTML = "";
  actions.forEach(action => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${action.primary ? "btn-primary" : "btn-ghost"}`;
    button.textContent = action.label;
    button.addEventListener("click", action.run);
    actionRow.appendChild(button);
  });
  $("battleOverlay").classList.remove("hidden");
}

function battleWon() {
  soundManager.play("victory");
  if (game.currentStage.id === "boss") {
    showBattleResult("กำจัดไวรัสร้ายสำเร็จ!", "ระบบปลอดภัยแล้ว เหลือภารกิจลงมือปฏิบัติและจัดตารางดูแลระยะยาว", [
      { label: "ทำภารกิจใบงาน →", primary: true, run: openWorkshop }
    ]);
    return;
  }
  showBattleResult("เคลียร์ภัยคุกคามแล้ว", "ผ่านสนามต่อสู้ แต่ต้องยืนยันความเข้าใจในด่านความรู้ก่อนปลดล็อกห้องถัดไป", [
    { label: "ไปด่านความรู้ →", primary: true, run: openQuiz },
    { label: "กลับแผนที่", run: openMap }
  ]);
}

function battleLost() {
  showBattleResult("PC-8 ต้องการการรักษาใหม่", "ภัยคุกคามผ่านแนวป้องกันมากเกินไป ลองวางหน่วยเพิ่มหรือปรับชนิดหน่วยก่อนปล่อยคลื่น", [
    { label: "ลองด่านนี้อีกครั้ง", primary: true, run: openBattle },
    { label: "กลับแผนที่", run: openMap }
  ]);
}

/* ---------- knowledge quiz ---------- */

function openQuiz() {
  destroyBattle();
  setMusic("hub");
  const quiz = game.currentStage.quiz;
  game.quizQuestions = quiz.questions || [quiz];
  game.quizIndex = 0;
  game.quizLocked = false;
  showScreen("scr-quiz");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const question = game.quizQuestions[game.quizIndex];
  const options = $("quizOptions");
  $("quizFeedback").textContent = "";
  $("quizFeedback").className = "feedback";
  options.innerHTML = "";

  if (!question) {
    finishQuiz();
    return;
  }

  $("quizQ").textContent = `คำถาม ${game.quizIndex + 1}/${game.quizQuestions.length} · ${question.q}`;
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-opt";
    button.textContent = option;
    button.addEventListener("click", () => answerQuiz(button, index, question));
    options.appendChild(button);
  });
}

function answerQuiz(button, answer, question) {
  if (game.quizLocked) return;
  const feedback = $("quizFeedback");
  if (answer !== question.correct) {
    button.classList.remove("wrong");
    void button.offsetWidth;
    button.classList.add("wrong");
    button.disabled = true;
    feedback.className = "feedback error";
    feedback.textContent = "ยังไม่ถูก ลองตัดตัวเลือกที่ไม่ตรงกับหน้าที่ของเครื่องมือนี้";
    soundManager.play("damage");
    return;
  }

  game.quizLocked = true;
  button.classList.add("correct");
  $("quizOptions").querySelectorAll("button").forEach(option => (option.disabled = true));
  feedback.className = "feedback success";
  feedback.textContent = `ถูกต้อง — ${question.explain || "เลือกคำตอบได้ตรงกับบทเรียน"}`;
  soundManager.play("waveClear");
  game.quizIndex += 1;
  window.setTimeout(() => {
    game.quizLocked = false;
    renderQuizQuestion();
  }, 1050);
}

function finishQuiz() {
  const stage = game.currentStage;
  game.completed.add(stage.id);
  saveProgress();
  updateDots(stage.id);
  $("quizQ").textContent = `${stage.title}: ผ่านการรักษาแล้ว`;
  $("quizFeedback").className = "feedback success";
  $("quizFeedback").textContent = game.completed.size === STAGES.length
    ? "ปลดล็อกสนามบอสแล้ว!"
    : "ห้องถัดไปถูกปลดล็อกแล้ว";
  $("quizOptions").innerHTML = "";
  const next = document.createElement("button");
  next.type = "button";
  next.className = "btn btn-primary btn-lg";
  next.textContent = game.completed.size === STAGES.length ? "เข้าสู่แผนที่บอส →" : "กลับแผนที่ภารกิจ →";
  next.addEventListener("click", openMap);
  $("quizOptions").appendChild(next);
}

/* ---------- practical worksheet ---------- */

function openWorkshop() {
  destroyBattle();
  setMusic("hub");
  game.workshop = Object.fromEntries(PRACTICE_TASKS.map(task => [task.id, 0]));
  showScreen("scr-workshop");
  renderWorkshop();
}

function renderWorkshop() {
  const grid = $("workshopGrid");
  grid.innerHTML = "";
  PRACTICE_TASKS.forEach((task, taskIndex) => {
    const progress = game.workshop[task.id];
    const complete = progress >= task.steps.length;
    const card = document.createElement("article");
    card.className = `card workshop-card${complete ? " complete" : ""}`;
    const head = document.createElement("div");
    head.className = "workshop-head";
    head.innerHTML = `<div><span class="eyebrow">TASK ${taskIndex + 1}</span><h3>${task.title}</h3><p>${task.goal}</p></div><span class="task-status">${complete ? "✓ สำเร็จ" : `${progress}/${task.steps.length}`}</span>`;
    card.appendChild(head);

    const list = document.createElement("div");
    list.className = "practice-steps";
    task.steps.forEach((step, stepIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `practice-step${stepIndex < progress ? " done" : stepIndex === progress ? " next" : ""}`;
      button.disabled = stepIndex !== progress || complete;
      button.innerHTML = `<span>${stepIndex < progress ? "✓" : stepIndex + 1}</span>${step}`;
      if (stepIndex === progress && !complete) {
        button.addEventListener("click", () => {
          game.workshop[task.id] += 1;
          soundManager.play(game.workshop[task.id] === task.steps.length ? "waveClear" : "hit");
          renderWorkshop();
        });
      }
      list.appendChild(button);
    });
    card.appendChild(list);
    grid.appendChild(card);
  });

  const allDone = PRACTICE_TASKS.every(task => game.workshop[task.id] >= task.steps.length);
  $("workshopDoneRow").classList.toggle("hidden", !allDone);
}

/* ---------- maintenance schedule ---------- */

function openSchedule() {
  game.scheduleSelected = null;
  game.scheduleMatches = new Map();
  showScreen("scr-schedule");
  renderSchedule();
}

function renderSchedule() {
  const pool = $("schedulePool");
  const slots = $("scheduleSlots");
  pool.innerHTML = "";
  slots.innerHTML = "";

  SCHEDULE_TASKS.forEach(task => {
    const matched = game.scheduleMatches.has(task.id);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip${matched ? " matched" : ""}${game.scheduleSelected === task.id ? " selected" : ""}`;
    chip.disabled = matched;
    chip.textContent = task.label;
    chip.addEventListener("click", () => {
      game.scheduleSelected = task.id;
      renderSchedule();
    });
    pool.appendChild(chip);
  });

  SCHEDULE_SLOTS.forEach(slot => {
    const matchedTaskId = Array.from(game.scheduleMatches.entries()).find(([, freq]) => freq === slot.key)?.[0];
    const matchedTask = SCHEDULE_TASKS.find(task => task.id === matchedTaskId);
    const box = document.createElement("button");
    box.type = "button";
    box.className = `slotbox${matchedTask ? " filled" : ""}`;
    box.disabled = Boolean(matchedTask);
    box.innerHTML = matchedTask
      ? `<span>${matchedTask.label}</span><span class="sk">${slot.label}</span>`
      : `<span>วางงานดูแลที่นี่</span><span class="sk">${slot.label}</span>`;
    box.addEventListener("click", () => matchSchedule(box, slot.key));
    slots.appendChild(box);
  });

  $("scheduleDoneRow").classList.toggle("hidden", game.scheduleMatches.size !== SCHEDULE_TASKS.length);
}

function matchSchedule(box, freq) {
  if (!game.scheduleSelected) {
    box.classList.remove("wrongflash");
    void box.offsetWidth;
    box.classList.add("wrongflash");
    return;
  }
  const task = SCHEDULE_TASKS.find(item => item.id === game.scheduleSelected);
  if (task.freq !== freq) {
    box.classList.remove("wrongflash");
    void box.offsetWidth;
    box.classList.add("wrongflash");
    soundManager.play("damage");
    return;
  }
  game.scheduleMatches.set(task.id, freq);
  game.scheduleSelected = null;
  soundManager.play("hit");
  renderSchedule();
}

function openEnd() {
  game.bossDone = true;
  saveProgress();
  updateDots("boss");
  soundManager.play("victory");
  showScreen("scr-end");
}

/* ---------- controls & boot ---------- */

$("btnPlay").addEventListener("click", openDiagnosis);
$("lessonBack").addEventListener("click", openMap);
$("lessonGo").addEventListener("click", openBattle);
$("battleStart").addEventListener("click", startEnemyWaves);
$("workshopNext").addEventListener("click", openSchedule);
$("scheduleNext").addEventListener("click", openEnd);
$("mapBtn").addEventListener("click", openMap);
$("soundBtn").addEventListener("click", () => {
  const muted = soundManager.toggleMute();
  $("soundBtn").textContent = muted ? "🔇" : "🔊";
  $("soundBtn").setAttribute("aria-label", muted ? "เปิดเสียง" : "ปิดเสียง");
});
$("btnReplay").addEventListener("click", () => {
  localStorage.removeItem("pc8_completed");
  localStorage.removeItem("pc8_boss_done");
  location.reload();
});

$("soundBtn").textContent = soundManager.muted ? "🔇" : "🔊";
updateDots();

assetStore.preload((done, total) => {
  const pct = Math.round((done / total) * 100);
  $("loadBar").style.width = `${pct}%`;
  $("loadPct").textContent = String(pct);
}).then(() => {
  $("loadBar").style.width = "100%";
  $("loadPct").textContent = "100";
  window.setTimeout(() => showScreen("scr-start"), 220);
}).catch(() => {
  $("loadPct").textContent = "100";
  showScreen("scr-start");
});

