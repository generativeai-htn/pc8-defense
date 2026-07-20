/* PC-8 Guardian Academy — safe Windows-style practice simulator */

class WindowsPracticeSimulator {
  constructor(options) {
    this.mount = options.mount;
    this.mission = options.mission;
    this.onComplete = options.onComplete;
    this.onMistake = options.onMistake || (() => {});
    this.step = 0;
    this.screen = "desktop";
    this.selected = false;
    this.contextOpen = false;
    this.tab = "general";
    this.searchValue = "";
    this.addressValue = "";
    this.status = "";
    this.progress = null;
    this.completed = false;
    this.fileSelected = false;
    this.npcOpen = true;
    this.cleanupSelected = new Set();
    this.timer = null;
    this.completionTimer = null;
    this.destroyed = false;
    this.continueHandled = false;
    this.steps = this.getSteps();
    this.boundContinue = event => {
      const button = event.target.closest?.('[data-win-action="continue"]');
      if (!button || !this.mount.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      this.advanceFromCompletion();
    };
    this.mount.addEventListener("click", this.boundContinue, true);
    this.render();
  }

  getSteps() {
    const steps = {
      checkdisk: [
        "เปิด This PC", "เลือกไดรฟ์ Windows (C:)", "คลิกขวาไดรฟ์ C:", "เปิด Properties",
        "เลือกแท็บ Tools", "กด Check ใน Error checking", "กด Scan drive"
      ],
      defrag: [
        "คลิก Search บน Taskbar", "พิมพ์ defragment", "เปิด Defragment and Optimize Drives",
        "เลือกไดรฟ์ Windows (C:)", "กด Analyze", "กด Optimize จนสถานะ OK"
      ],
      cleanup: [
        "คลิก Search บน Taskbar", "พิมพ์ Disk Cleanup", "เปิดแอป Disk Cleanup",
        "เลือกไดรฟ์ Windows (C:)", "รอระบบ Scan", "เลือกเฉพาะไฟล์ขยะ", "กด OK และยืนยัน Delete Files"
      ],
      antivirus: [
        "เปิด Windows Security", "เข้า Virus & threat protection", "เปิด Protection updates",
        "กด Check for updates", "เปิด Real-time protection", "สั่ง Quick scan", "เปิด Scheduled scan"
      ],
      onedrive: [
        "เปิด Microsoft Edge", "ไปที่ onedrive.live.com", "เลือก Sign in / Create account",
        "เข้าสู่ระบบด้วยบัญชีฝึก", "กด Upload", "เลือกไฟล์จาก Documents", "เลือกไฟล์ที่อัปโหลด",
        "กด Share", "คัดลอกลิงก์", "เปิดโฟลเดอร์ OneDrive ที่ Sync", "ใช้ Free up space"
      ]
    };
    return steps[this.mission.id] || [];
  }

  destroy() {
    this.destroyed = true;
    clearTimeout(this.timer);
    clearTimeout(this.completionTimer);
    this.mount.removeEventListener("click", this.boundContinue, true);
  }

  advanceFromCompletion() {
    if (!this.completed || this.continueHandled) return;
    this.continueHandled = true;
    const complete = this.onComplete;
    this.destroy();
    complete?.();
  }

  esc(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  icon(name, label = "") {
    return `<span class="w10-icon ${name}" aria-hidden="true"></span>${label ? `<span class="sr-only">${this.esc(label)}</span>` : ""}`;
  }

  getGuideMessages() {
    return {
      checkdisk: [
        "เราเริ่มที่ This PC เพราะ Windows รวมไดรฟ์ทั้งหมดไว้ที่นี่ ดับเบิลคลิกไอคอน This PC ได้เลย",
        "เลือก Local Disk (C:) ซึ่งเป็นไดรฟ์ที่ติดตั้ง Windows การตรวจไดรฟ์นี้ช่วยค้นหา File system errors",
        "คลิกขวาที่ไดรฟ์ C: เพื่อเปิดคำสั่งจัดการ หากใช้จอสัมผัสให้แตะปุ่มจุดสามจุด",
        "เลือก Properties เพื่อดูเครื่องมือและสถานะของไดรฟ์ โดยยังไม่มีการแก้ไขไฟล์ใด ๆ",
        "แท็บ Tools รวมเครื่องมือตรวจข้อผิดพลาดและจัดเรียงข้อมูล กด Tools ด้านบน",
        "ในกรอบ Error checking ให้กด Check เพื่อให้ Windows เตรียมตรวจ File system",
        "กด Scan drive แล้วรอจนจบ ระหว่างสแกนไม่ควรปิดเครื่องกะทันหัน"
      ],
      defrag: [
        "ใช้ช่อง Search บน Taskbar เพื่อค้นหาเครื่องมือระบบโดยไม่ต้องจำตำแหน่งใน Control Panel",
        "พิมพ์ defragment ให้ครบ แล้ว Windows จะแสดงผลลัพธ์ที่ตรงที่สุด",
        "เปิด Defragment and Optimize Drives ซึ่งเป็นชื่อเครื่องมือจริงใน Windows 10",
        "เลือก Local Disk (C:) ก่อน เพื่อไม่ให้สั่งงานผิดไดรฟ์",
        "กด Analyze เพื่อดูเปอร์เซ็นต์ Fragmented ก่อนตัดสินใจ Optimize",
        "กด Optimize เพื่อจัดชิ้นส่วนข้อมูลให้ต่อเนื่อง เป้าหมายคือสถานะ OK (0% fragmented)"
      ],
      cleanup: [
        "เริ่มจาก Search บน Taskbar เพื่อเปิด Disk Cleanup ของ Windows 10",
        "พิมพ์ Disk Cleanup ให้ครบเพื่อค้นหาแอประบบ",
        "เลือกผลลัพธ์ Disk Cleanup ที่มีไอคอนไดรฟ์และแปรงทำความสะอาด",
        "เลือก Local Disk (C:) ซึ่งมักสะสม Temporary files จากการใช้งาน Windows",
        "Windows จะ Scan และคำนวณพื้นที่ก่อน ยังไม่มีไฟล์ใดถูกลบในขั้นตอนนี้",
        "เลือก Temporary Internet Files, Downloaded Program Files และ Memory dump หลีกเลี่ยง Downloads ที่อาจมีงานของเรา",
        "ตรวจยอดพื้นที่อีกครั้ง กด OK แล้วจึงยืนยัน Delete Files"
      ],
      antivirus: [
        "เปิด Windows Security จากไอคอนรูปโล่ นี่คือศูนย์รวมการป้องกันของ Windows 10",
        "เข้า Virus & threat protection เพื่อดูภัยคุกคามและสถานะการสแกน",
        "เปิด Protection updates เพราะโปรแกรมต้องรู้จักลายเซ็นไวรัสรุ่นล่าสุด",
        "กด Check for updates และรอให้ฐานข้อมูล Security intelligence เป็นปัจจุบัน",
        "เปิด Real-time protection เพื่อให้ระบบตรวจไฟล์ขณะใช้งานตลอดเวลา",
        "กด Quick scan เพื่อตรวจตำแหน่งที่มัลแวร์มักซ่อนตัว",
        "ตั้ง Scheduled scan ให้ตรวจเป็นประจำ และควรใช้ Antivirus หลักเพียงหนึ่งตัว"
      ],
      onedrive: [
        "เปิด Microsoft Edge เพื่อเข้าใช้งาน OneDrive ผ่านเว็บเหมือนใน Windows 10",
        "พิมพ์ onedrive.live.com ใน Address bar ตรวจชื่อเว็บก่อนกด Enter",
        "เลือก Sign in หรือ Create free account ตามสถานะบัญชี Microsoft ของผู้ใช้",
        "ใน Lab นี้ใช้บัญชีฝึกเท่านั้น ห้ามกรอกรหัสผ่านจริงในเว็บไซต์จำลอง",
        "กด Upload เพื่อส่งสำเนาไฟล์จากเครื่องขึ้น Cloud",
        "เลือก Unit8_Report.docx จาก Documents แล้วกด Open",
        "เลือกไฟล์ที่อัปโหลดเพื่อเปิดคำสั่งจัดการ",
        "กด Share เพื่อกำหนดวิธีแบ่งปันไฟล์ให้ผู้อื่น",
        "คัดลอกลิงก์และส่งเฉพาะคนที่ควรเข้าถึงข้อมูล",
        "เปิดโฟลเดอร์ OneDrive ที่ Sync เพื่อดูสถานะไฟล์ใน File Explorer",
        "ใช้ Free up space เพื่อเก็บไฟล์ไว้บน Cloud และคืนพื้นที่ในไดรฟ์ โดยยังดาวน์โหลดกลับมาได้"
      ]
    };
  }

  guideMessage() {
    if (this.completed) return "เยี่ยมมาก! ทำขั้นตอนครบแล้ว ต่อไปเราจะนำความรู้นี้ไปใช้ในสนามป้องกันระบบ";
    if (this.progress) return `${this.progress.title} กำลังทำงาน รอให้แถบความคืบหน้าเสร็จก่อนนะ`;
    return this.getGuideMessages()[this.mission.id]?.[this.step] || "ทำตามขั้นตอนที่มีกรอบสีฟ้า แล้วฉันจะอธิบายขั้นต่อไปให้";
  }

  npcDialogHTML() {
    const cat = CAT_TEAM[this.mission.team[0] - 1];
    if (!this.npcOpen) return `<button class="npc-guide-chip" data-win-action="toggle-npc" type="button"><img src="${catIdlePath(cat.id)}" alt=""><span>เรียก ${this.esc(cat.name)}</span></button>`;
    return `<section class="npc-dialog" aria-live="polite"><img src="${catIdlePath(cat.id)}" alt="${this.esc(cat.name)}"><div><header><b>${this.esc(cat.name)}</b><span>NPC SYSTEM GUIDE · STEP ${Math.min(this.step + 1, this.steps.length)}/${this.steps.length}</span><button data-win-action="toggle-npc" type="button" aria-label="ย่อคำแนะนำ">—</button></header><p>${this.esc(this.guideMessage())}</p></div></section>`;
  }

  render() {
    if (this.destroyed) return;
    const cat = CAT_TEAM[this.mission.team[0] - 1];
    this.mount.innerHTML = `<div class="windows-practice">
      <section class="win-simulator" aria-label="Windows Practice Lab">
        <div class="win-lab-bar"><div><span class="win-logo">⊞</span><b>WINDOWS 10 PRACTICE LAB</b></div><span>SAFE TRAINING MODE · ไม่กระทบเครื่องจริง</span></div>
        <div class="win-desktop" id="winDesktop">
          ${this.desktopIcons()}
          ${this.windowContent()}
          ${this.progress ? this.progressHTML() : ""}
          ${this.completed ? this.completionHTML() : ""}
          <div id="winToast" class="win-toast ${this.status ? "show" : ""}">${this.esc(this.status)}</div>
          ${this.npcDialogHTML()}
          ${this.taskbarHTML()}
        </div>
      </section>
      <aside class="win-guide">
        <div class="win-coach"><img src="${catIdlePath(cat.id)}" alt=""><div><span>ผู้ช่วยประจำ Lab</span><b>${this.esc(cat.name)}</b><p>NPC จะอธิบายเหตุผลของแต่ละขั้นตอนบนหน้าจอ กดปุ่มย่อหรือเรียกกลับมาได้ทุกเวลา</p></div></div>
        <div class="win-guide-head"><span>PROCEDURE</span><b id="winStepCount">${Math.min(this.step + 1, this.steps.length)} / ${this.steps.length}</b></div>
        <ol class="win-step-list">${this.steps.map((label, index) => `<li class="${index < this.step ? "done" : index === this.step ? "current" : ""}"><i>${index < this.step ? "✓" : index + 1}</i><span>${this.esc(label)}</span></li>`).join("")}</ol>
        <div class="win-safety"><b>การจำลองเพื่อการเรียนรู้</b><span>หน้าต่างนี้เลียนแบบขั้นตอนสำคัญ แต่ไม่อ่าน ลบ หรือแก้ไขไฟล์ในคอมพิวเตอร์จริง</span></div>
      </aside>
    </div>`;
    this.bind();
    if (this.completed && !this.completionTimer) {
      this.completionTimer = setTimeout(() => this.advanceFromCompletion(), 4200);
    }
    const completionButton = this.mount.querySelector('[data-win-action="continue"]');
    if (completionButton) {
      const complete = this.onComplete;
      completionButton.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        if (completionButton.dataset.advanced === "true") return;
        completionButton.dataset.advanced = "true";
        this.continueHandled = true;
        this.destroy();
        complete?.();
      };
    }
  }

  bind() {
    this.mount.querySelectorAll('[data-win-action]:not([data-win-action="continue"])').forEach(element => element.addEventListener("click", event => {
      event.stopPropagation();
      this.handleAction(element.dataset.winAction, element);
    }));
    this.mount.querySelectorAll("[data-win-context]").forEach(element => element.addEventListener("contextmenu", event => {
      event.preventDefault();
      this.handleAction(element.dataset.winContext, element);
    }));
    this.mount.querySelectorAll("[data-win-input]").forEach(input => {
      input.addEventListener("input", () => this.handleInput(input.dataset.winInput, input.value));
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") this.handleAction(`${input.dataset.winInput}-submit`, input);
      });
      if (input.dataset.autofocus === "true") setTimeout(() => input.focus(), 0);
    });
  }

  taskbarHTML() {
    return `<div class="win-taskbar">
      <button class="win-start" type="button" aria-label="Start">${this.icon("windows")}</button>
      <button class="win-search" data-win-action="open-search" type="button">⌕ <span>Search</span></button>
      <button class="win-task-icon" data-win-action="open-explorer" type="button" title="File Explorer">${this.icon("folder")}</button>
      <button class="win-task-icon" data-win-action="open-edge" type="button" title="Microsoft Edge">${this.icon("edge")}</button>
      <span class="win-clock">ENG<br>${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>`;
  }

  desktopIcons() {
    return `<div class="win-desktop-icons">
      <button data-win-action="open-explorer" type="button">${this.icon("pc")}<b>This PC</b></button>
      <button data-win-action="open-edge" type="button">${this.icon("edge")}<b>Microsoft Edge</b></button>
      <button data-win-action="open-security" type="button">${this.icon("shield")}<b>Windows Security</b></button>
      <button type="button">${this.icon("recycle")}<b>Recycle Bin</b></button>
    </div>`;
  }

  windowContent() {
    if (this.screen === "desktop") return "";
    if (this.screen === "search") return this.searchHTML();
    if (this.screen === "explorer") return this.explorerHTML();
    if (this.screen === "properties") return this.propertiesHTML();
    if (this.screen === "check-dialog") return this.checkDialogHTML();
    if (this.screen === "optimizer") return this.optimizerHTML();
    if (this.screen === "drive-select") return this.driveSelectHTML();
    if (this.screen === "cleanup") return this.cleanupHTML();
    if (this.screen.startsWith("security")) return this.securityHTML();
    if (this.screen.startsWith("edge") || this.screen.startsWith("onedrive")) return this.edgeHTML();
    return "";
  }

  windowFrame(title, body, options = {}) {
    return `<section class="win-window ${options.wide ? "wide" : ""} ${options.compact ? "compact-window" : ""}" role="dialog" aria-label="${this.esc(title)}">
      <header>${this.icon(options.icon || "app")}<b>${this.esc(title)}</b><div><button type="button">—</button><button type="button">□</button><button type="button">×</button></div></header>
      ${body}
    </section>`;
  }

  searchHTML() {
    const id = this.mission.id;
    const query = id === "defrag" ? "defragment" : "disk cleanup";
    const match = this.searchValue.toLowerCase().includes(query);
    const app = id === "defrag" ? "Defragment and Optimize Drives" : "Disk Cleanup";
    const action = id === "defrag" ? "open-defrag" : "open-cleanup";
    return `<section class="win-search-panel"><label>⌕<input data-win-input="search" data-autofocus="true" value="${this.esc(this.searchValue)}" placeholder="Type here to search"></label>
      <div class="win-search-body">${match ? `<p>Best match</p><button data-win-action="${action}" type="button">${this.icon(id === "defrag" ? "defrag" : "cleanup")}<div><b>${app}</b><small>Desktop app · System</small></div></button>` : `<div class="win-search-empty">${this.icon("search-big")}<b>เริ่มพิมพ์ชื่อเครื่องมือ</b><small>${query}</small></div>`}</div>
    </section>`;
  }

  explorerHTML() {
    if (this.mission.id === "onedrive" && this.screen === "explorer") return this.oneDriveExplorerHTML();
    const driveClass = this.selected ? "selected pulse-target" : "";
    const menu = this.contextOpen ? `<div class="win-context-menu"><button type="button">Open</button><button type="button">Pin to Quick access</button><hr><button data-win-action="properties" type="button">Properties</button></div>` : "";
    const body = `<div class="win-explorer-toolbar"><button>←</button><button>→</button><span>This PC</span><label>⌕ Search This PC</label></div>
      <div class="win-explorer-layout"><nav><b>Home</b><span>Desktop</span><span>Documents</span><span>Downloads</span><b>This PC</b><span>Network</span></nav><main><h3>Devices and drives</h3>
        <button class="win-drive ${driveClass}" data-win-action="select-drive" data-win-context="drive-menu" type="button">${this.icon("drive")}<div><b>Local Disk (C:)</b><i><u style="width:62%"></u></i><small>88.4 GB free of 237 GB</small></div><em data-win-action="drive-menu">⋯</em></button>
        <button class="win-drive" type="button">${this.icon("drive-data")}<div><b>Data (D:)</b><i><u style="width:30%"></u></i><small>320 GB free of 465 GB</small></div></button>${menu}
      </main></div>`;
    return this.windowFrame("File Explorer", body, { icon: "folder", wide: true });
  }

  propertiesHTML() {
    const tabs = `<div class="win10-tabs"><button>Security</button><button>Previous Versions</button><button>Quota</button><button class="${this.tab === "general" ? "active" : ""}">General</button><button data-win-action="tools-tab" class="${this.tab === "tools" ? "active" : this.step === 4 ? "pulse-target" : ""}" type="button">Tools</button><button>Hardware</button><button>Sharing</button></div>`;
    const general = `<div class="win-property-body"><div class="win-drive-hero">${this.icon("drive")}<b>Local Disk (C:)</b></div><div class="win-donut"></div><p>Used space: 148 GB<br>Free space: 88.4 GB<br>Capacity: 237 GB</p></div>`;
    const tools = `<div class="win10-tools"><fieldset><legend>Error checking</legend><div>${this.icon("drive-small")}<p>This option will check the drive for file<br>system errors.</p><button data-win-action="check-drive" class="pulse-target" type="button"><span class="uac-shield">◆</span>Check</button></div></fieldset><fieldset><legend>Optimize and defragment drive</legend><div>${this.icon("defrag")}<p>Optimizing your drive can help it run<br>more efficiently.</p><button type="button">Optimize</button></div></fieldset></div>`;
    const body = `${tabs}${this.tab === "general" ? general : tools}<footer class="win-dialog-buttons"><button type="button">OK</button><button type="button">Cancel</button><button disabled>Apply</button></footer>`;
    return this.windowFrame("Local Disk (C:) Properties", body, { icon: "drive-title", compact: true });
  }

  checkDialogHTML() {
    return this.windowFrame("Error Checking (Local Disk C:)", `<div class="win-dialog-message">${this.icon("drive-check")}<h3>Scan this drive</h3><p>Windows found no errors on this drive. You can still scan the drive for errors.</p><button data-win-action="scan-drive" class="win-primary pulse-target" type="button">Scan drive</button><button type="button">Cancel</button></div>`, { icon: "drive-title", compact: true });
  }

  optimizerHTML() {
    const status = this.status === "optimized" ? "OK (0% fragmented)" : this.status === "analyzed" ? "Needs optimization (18% fragmented)" : "Unknown";
    const body = `<div class="win-app-copy"><h3>Optimize Drives</h3><p>You can optimize your drives to help your computer run more efficiently.</p></div>
      <div class="win-table"><div class="head"><span>Drive</span><span>Media type</span><span>Last analyzed</span><span>Current status</span></div>
        <button data-win-action="optimizer-select" class="${this.selected ? "selected" : "pulse-target"}" type="button"><span>Windows (C:)</span><span>Hard disk drive</span><span>${this.status ? "Today" : "Never"}</span><span>${status}</span></button>
        <button type="button"><span>Data (D:)</span><span>Solid state drive</span><span>7 days ago</span><span>OK</span></button></div>
      <div class="win-opt-actions"><button data-win-action="analyze" class="${this.selected && !this.status ? "pulse-target" : ""}" type="button" ${!this.selected ? "disabled" : ""}>Analyze</button><button data-win-action="optimize" class="${this.status === "analyzed" ? "win-primary pulse-target" : ""}" type="button" ${this.status !== "analyzed" ? "disabled" : ""}>Optimize</button></div>`;
    return this.windowFrame("Defragment and Optimize Drives", body, { icon: "defrag", wide: true });
  }

  driveSelectHTML() {
    return this.windowFrame("Disk Cleanup: Drive Selection", `<div class="win-dialog-message compact">${this.icon("cleanup")}<p>Select the drive you want to clean up:</p><label>Drives: <select id="cleanupDrive"><option>Local Disk (C:)</option><option>Data (D:)</option></select></label><div><button data-win-action="cleanup-drive-ok" class="win-primary pulse-target" type="button">OK</button><button type="button">Cancel</button></div></div>`, { icon: "cleanup", compact: true });
  }

  cleanupHTML() {
    const files = [
      ["Temporary Internet Files", "180 MB", true], ["Downloaded Program Files", "120 MB", true],
      ["System error memory dump files", "260 MB", true], ["DirectX Shader Cache", "90 MB", true],
      ["Downloads", "1.4 GB", false], ["Recycle Bin", "32 MB", false]
    ];
    const selectedSize = files.reduce((sum, file) => this.cleanupSelected.has(file[0]) ? sum + parseInt(file[1], 10) : sum, 0);
    const body = `<div class="win-cleanup-head">${this.icon("cleanup")}<p>You can use Disk Cleanup to free up to <b>2.1 GB</b> of disk space on Local Disk (C:).</p></div><fieldset><legend>Files to delete:</legend>
      ${files.map(([name,size,safe]) => `<label class="${safe ? "safe-file" : "user-file"}"><input data-win-action="cleanup-toggle" data-file="${this.esc(name)}" type="checkbox" ${this.cleanupSelected.has(name) ? "checked" : ""}><span><b>${this.esc(name)}</b><small>${safe ? "Temporary system data" : "User files — check carefully"}</small></span><em>${size}</em></label>`).join("")}
      </fieldset><p>Total amount of disk space you gain: <b>${selectedSize} MB</b></p><footer class="win-dialog-buttons"><button data-win-action="cleanup-ok" class="${this.cleanupSelected.size >= 3 ? "win-primary pulse-target" : ""}" type="button">OK</button><button type="button">Cancel</button></footer>${this.contextOpen ? `<div class="win-confirm"><span>🗑️</span><h3>Are you sure you want to permanently delete these files?</h3><button data-win-action="delete-files" class="win-primary pulse-target">Delete Files</button><button>Cancel</button></div>` : ""}`;
    return this.windowFrame("Disk Cleanup for Local Disk (C:)", body, { icon: "cleanup" });
  }

  securityHTML() {
    const nav = `<nav><b>${this.icon("shield")} Windows Security</b><button>Home</button><button data-win-action="virus-protection" class="${this.screen === "security-virus" ? "active" : ""}">Virus & threat protection</button><button>Account protection</button><button>Firewall & network protection</button><button>App & browser control</button></nav>`;
    let main = `<main><h2>Security at a glance</h2><div class="security-cards"><button data-win-action="virus-protection" class="pulse-target">${this.icon("shield")}<b>Virus & threat protection</b><small>Actions needed</small></button><button>${this.icon("account")}<b>Account protection</b><small>No action needed</small></button><button>${this.icon("network")}<b>Firewall & network protection</b><small>No action needed</small></button></div></main>`;
    if (this.screen === "security-virus") main = `<main><h2>Virus & threat protection</h2><section class="security-status"><span>✓</span><div><b>Current threats</b><p>No current threats.</p><button data-win-action="quick-scan" class="${this.step >= 5 ? "win-primary pulse-target" : ""}" type="button">Quick scan</button></div></section><section><b>Virus & threat protection updates</b><p>Security intelligence is updated to recognize the latest threats.</p><button data-win-action="protection-updates" class="${this.step === 2 ? "pulse-target" : ""}" type="button">Protection updates</button></section><section><b>Virus & threat protection settings</b><label class="win-toggle"><span>Real-time protection</span><input data-win-action="realtime-toggle" type="checkbox" ${this.status === "realtime" || this.step > 4 ? "checked" : ""}><i></i></label></section><section><b>Automatic scan</b><button data-win-action="schedule-scan" class="${this.step === 6 ? "pulse-target" : ""}" type="button">Schedule a scan</button></section></main>`;
    if (this.screen === "security-updates") main = `<main><h2>Protection updates</h2><p>Security intelligence version: 1.421.1204.0</p><p>Last update: Yesterday</p><button data-win-action="check-updates" class="win-primary pulse-target" type="button">Check for updates</button></main>`;
    return this.windowFrame("Windows Security", `<div class="win-security">${nav}${main}</div>`, { icon: "shield", wide: true });
  }

  edgeHTML() {
    let page = `<div class="edge-home">${this.icon("edge")}<h2>Search the web</h2><p>พิมพ์ onedrive.live.com ใน Address bar ด้านบน</p></div>`;
    if (this.screen === "onedrive-landing") page = `<div class="onedrive-landing">${this.icon("cloud")}<h1>Your files, anywhere</h1><p>Save your files and photos to OneDrive and access them from any device.</p><button data-win-action="onedrive-signin" class="win-primary pulse-target">Sign in</button><button data-win-action="onedrive-signin">Create free account</button></div>`;
    if (this.screen === "onedrive-login") page = `<div class="ms-login"><span>⊞ Microsoft</span><h2>Sign in</h2><p>ใช้บัญชีฝึกจำลอง — ไม่ต้องกรอกบัญชีจริง</p><input value="student@school.local" readonly><button data-win-action="training-account" class="win-primary pulse-target">Continue with training account</button></div>`;
    if (this.screen === "onedrive-files") page = this.oneDriveFilesHTML();
    const body = `<div class="edge-tabs"><span>＋</span><b>${this.screen.startsWith("onedrive") ? "OneDrive" : "New tab"}</b></div><div class="edge-address"><button>←</button><button>→</button><button>↻</button><label>🔒<input data-win-input="address" value="${this.screen.startsWith("onedrive") ? "https://onedrive.live.com" : this.esc(this.addressValue)}" placeholder="Search or enter web address"></label><button data-win-action="address-submit">Go</button></div><div class="edge-page">${page}</div>`;
    return this.windowFrame("Microsoft Edge", body, { icon: "edge", wide: true });
  }

  oneDriveFilesHTML() {
    const menu = this.contextOpen ? `<div class="onedrive-share-dialog"><h3>Share “Unit8_Report.docx”</h3><p>Anyone with the link can view</p><input value="https://1drv.ms/u/s!training-unit8" readonly><button data-win-action="copy-link" class="win-primary pulse-target">Copy link</button></div>` : "";
    return `<div class="onedrive-app"><header><b>${this.icon("cloud")} OneDrive</b><span>Training account</span></header><nav><button>My files</button><button>Recent</button><button>Shared</button><button>Recycle bin</button></nav><main><div class="onedrive-command"><button data-win-action="upload-menu" class="${this.step === 4 ? "pulse-target" : ""}">⬆ Upload</button><button>＋ New</button><button data-win-action="open-sync-folder" class="${this.step === 9 ? "pulse-target" : ""}">↻ Sync</button></div>${this.screen === "onedrive-files" && this.status === "picker" ? `<div class="file-picker"><h3>Open</h3><nav>Quick access · Documents</nav><button data-win-action="choose-upload-file" class="pulse-target">${this.icon("document")}<b>Unit8_Report.docx</b><small>Microsoft Word Document · 840 KB</small></button><footer><button data-win-action="choose-upload-file" class="win-primary">Open</button><button>Cancel</button></footer></div>` : `<div class="onedrive-list"><div><input type="checkbox" disabled><b>Name</b><span>Modified</span><span>File size</span></div>${this.status === "uploaded" || this.fileSelected || this.step >= 6 ? `<button data-win-action="select-uploaded-file" class="${this.fileSelected ? "selected" : "pulse-target"}"><input type="checkbox" ${this.fileSelected ? "checked" : ""}><b>${this.icon("document")} Unit8_Report.docx</b><span>Just now</span><span>840 KB</span></button>${this.fileSelected ? `<div class="file-actions"><button data-win-action="share-file" class="pulse-target">↗ Share</button><button>Download</button><button>Delete</button></div>` : ""}` : `<div class="onedrive-empty">${this.icon("cloud")}<b>Files you upload will appear here</b></div>`}</div>`}</main>${menu}</div>`;
  }

  oneDriveExplorerHTML() {
    const menu = this.contextOpen ? `<div class="win-context-menu sync-menu"><button>Open</button><button>Share</button><button>Always keep on this device</button><button data-win-action="free-up-space" class="pulse-target">Free up space</button></div>` : "";
    const body = `<div class="win-explorer-toolbar"><button>←</button><button>→</button><span>OneDrive - Training account</span><label>⌕ Search OneDrive</label></div><div class="win-explorer-layout"><nav><b>Home</b><span>Desktop</span><span>Documents</span><b>☁️ OneDrive</b><span>This PC</span></nav><main><h3>OneDrive files</h3><button class="sync-file selected" data-win-action="sync-file-menu" data-win-context="sync-file-menu"><span>📄</span><b>Unit8_Report.docx</b><small>✓ Available on this device</small><em>⋯</em></button>${menu}</main></div>`;
    return this.windowFrame("File Explorer", body, { icon: "folder", wide: true });
  }

  progressHTML() {
    return `<div class="win-modal-layer"><section class="win-progress-dialog"><span class="win-spinner"></span><h3>${this.esc(this.progress.title)}</h3><p>${this.esc(this.progress.detail)}</p><i><u></u></i><small>Please wait. Do not close this window.</small></section></div>`;
  }

  completionHTML() {
    const cat = CAT_TEAM[this.mission.team[0] - 1];
    const next = this.mission.id === "checkdisk" ? "ไปซ่อมเซกเตอร์ที่เสียหายกันต่อเลย" : "ไปใช้ความรู้นี้ป้องกันระบบกันต่อเลย";
    return `<div class="win-modal-layer success quest-complete-layer" role="dialog" aria-live="assertive" aria-label="ภารกิจสำเร็จ">
      <section class="quest-complete-card">
        <img class="quest-win-art" src="${PACK}/Ui/WinPopUp.png" alt="Mission complete">
        <div class="quest-complete-copy"><span>✓</span><p>ทำขั้นตอน ${this.esc(UTILITIES[this.mission.id].name)} ครบตาม Workflow แล้ว</p></div>
      </section>
      <section class="quest-npc-arrival">
        <img src="${catIdlePath(cat.id)}" alt="${this.esc(cat.name)}">
        <div><small>QUEST ASSISTANT</small><h3>${this.esc(cat.name)}</h3><p>ยินดีด้วย! คุณทำได้ถูกต้องทุกขั้นตอน ${this.esc(next)}</p><button data-win-action="continue" type="button">ไปต่อทันที →</button><i><u></u></i><em>ระบบจะพาไปขั้นตอนถัดไปอัตโนมัติ</em></div>
      </section>
    </div>`;
  }

  handleInput(type, value) {
    if (type === "search") {
      this.searchValue = value;
      const query = this.mission.id === "defrag" ? "defragment" : "disk cleanup";
      if (this.step === 1 && value.toLowerCase().includes(query)) { this.step++; this.render(); }
    }
    if (type === "address") this.addressValue = value;
  }

  handleAction(action, element) {
    if (action === "toggle-npc") { this.npcOpen = !this.npcOpen; return this.render(); }
    if (this.progress || this.completed && action !== "continue") return;
    const id = this.mission.id;
    if (action === "continue") return this.advanceFromCompletion();
    if (action === "open-search") {
      if (!["defrag", "cleanup"].includes(id) || this.step !== 0) return this.hint("ภารกิจนี้ไม่จำเป็นต้องใช้ Search ในขั้นตอนปัจจุบัน");
      this.screen = "search"; this.step++; this.status = "พิมพ์ชื่อเครื่องมือในช่อง Search"; return this.render();
    }
    if (action === "open-explorer") {
      if (id === "checkdisk" && this.step === 0) { this.screen = "explorer"; this.step++; this.status = "เปิด This PC แล้ว — เลือก Windows (C:)"; return this.render(); }
      return this.hint("ยังไม่ใช่ขั้นตอนเปิด File Explorer");
    }
    if (action === "select-drive" && id === "checkdisk" && this.step === 1) { this.selected = true; this.step++; this.status = "เลือกไดรฟ์แล้ว — คลิกขวาหรือแตะปุ่ม ⋯"; return this.render(); }
    if (action === "drive-menu" && id === "checkdisk" && this.step === 2) { this.contextOpen = true; this.step++; this.status = "เมนูคลิกขวาเปิดแล้ว — เลือก Properties"; return this.render(); }
    if (action === "properties" && id === "checkdisk" && this.step === 3) { this.screen = "properties"; this.contextOpen = false; this.step++; this.status = "หน้าต่าง Properties เปิดแล้ว"; return this.render(); }
    if (action === "tools-tab" && id === "checkdisk" && this.step === 4) { this.tab = "tools"; this.step++; this.status = "เลือกแท็บ Tools แล้ว"; return this.render(); }
    if (action === "check-drive" && id === "checkdisk" && this.step === 5) { this.screen = "check-dialog"; this.step++; this.status = "Error Checking พร้อมสแกน"; return this.render(); }
    if (action === "scan-drive" && id === "checkdisk" && this.step === 6) return this.runProgress("Scanning Windows (C:)", "กำลังตรวจสอบ File system errors และ Bad sectors...", () => this.finish());

    if (action === "open-defrag" && id === "defrag" && this.step === 2) { this.screen = "optimizer"; this.step++; this.status = "เปิด Optimize Drives แล้ว"; return this.render(); }
    if (action === "optimizer-select" && id === "defrag" && this.step === 3) { this.selected = true; this.step++; this.status = "เลือก Windows (C:) แล้ว"; return this.render(); }
    if (action === "analyze" && id === "defrag" && this.step === 4) return this.runProgress("Analyzing Windows (C:)", "กำลังวิเคราะห์การกระจายตัวของข้อมูล...", () => { this.status = "analyzed"; this.step++; this.render(); });
    if (action === "optimize" && id === "defrag" && this.step === 5) return this.runProgress("Optimizing Windows (C:)", "กำลังจัดชิ้นส่วนข้อมูลให้ต่อเนื่อง...", () => { this.status = "optimized"; this.finish(); });

    if (action === "open-cleanup" && id === "cleanup" && this.step === 2) { this.screen = "drive-select"; this.step++; this.status = "เลือกไดรฟ์ที่ต้องการทำความสะอาด"; return this.render(); }
    if (action === "cleanup-drive-ok" && id === "cleanup" && this.step === 3) { this.step++; return this.runProgress("Disk Cleanup", "กำลังคำนวณพื้นที่ที่สามารถคืนได้...", () => { this.step++; this.screen = "cleanup"; this.status = "เลือกเฉพาะไฟล์ชั่วคราวหรือไฟล์ระบบที่ไม่จำเป็น"; this.render(); }); }
    if (action === "cleanup-toggle" && id === "cleanup" && this.step === 5) {
      const name = element.dataset.file;
      if (["Downloads", "Recycle Bin"].includes(name)) { element.checked = false; return this.hint(`${name} อาจมีไฟล์ของผู้ใช้ — ใน Lab นี้ให้เลือกเฉพาะรายการไฟล์ขยะที่กำหนด`); }
      if (element.checked) this.cleanupSelected.add(name); else this.cleanupSelected.delete(name);
      if (this.cleanupSelected.size >= 3) this.step = 6;
      return this.render();
    }
    if (action === "cleanup-ok" && id === "cleanup" && this.step === 6) { this.contextOpen = true; return this.render(); }
    if (action === "delete-files" && id === "cleanup" && this.step === 6) return this.runProgress("Deleting unnecessary files", "กำลังคืนพื้นที่จัดเก็บอย่างปลอดภัย...", () => this.finish());

    if (action === "open-security" && id === "antivirus" && this.step === 0) { this.screen = "security-home"; this.step++; this.status = "Windows Security เปิดแล้ว"; return this.render(); }
    if (action === "virus-protection" && id === "antivirus" && this.step === 1) { this.screen = "security-virus"; this.step++; this.status = "ตรวจสอบสถานะการป้องกันไวรัส"; return this.render(); }
    if (action === "protection-updates" && id === "antivirus" && this.step === 2) { this.screen = "security-updates"; this.step++; this.status = "เปิด Protection updates แล้ว"; return this.render(); }
    if (action === "check-updates" && id === "antivirus" && this.step === 3) return this.runProgress("Checking for security intelligence updates", "กำลังดาวน์โหลดข้อมูลภัยคุกคามล่าสุด...", () => { this.screen = "security-virus"; this.status = "ฐานข้อมูลเป็นเวอร์ชันล่าสุด"; this.step++; this.render(); });
    if (action === "realtime-toggle" && id === "antivirus" && this.step === 4) { element.checked = true; this.status = "realtime"; this.step++; return this.render(); }
    if (action === "quick-scan" && id === "antivirus" && this.step === 5) return this.runProgress("Quick scan", "กำลังตรวจสอบไฟล์และตำแหน่งที่อาจมีภัยคุกคาม...", () => { this.step++; this.screen = "security-virus"; this.status = "No current threats — ตั้ง Scheduled scan ต่อ"; this.render(); });
    if (action === "schedule-scan" && id === "antivirus" && this.step === 6) return this.finish();

    if (action === "open-edge" && id === "onedrive" && this.step === 0) { this.screen = "edge-home"; this.step++; this.status = "พิมพ์ onedrive.live.com แล้วกด Enter หรือ Go"; return this.render(); }
    if (action === "address-submit" && id === "onedrive" && this.step === 1) {
      if (!this.handleAddress(this.addressValue).startsWith("onedrive.live.com")) return this.hint("พิมพ์ onedrive.live.com ใน Address bar ก่อนกด Go");
      this.screen = "onedrive-landing"; this.step++; this.status = "เว็บไซต์ OneDrive เปิดแล้ว"; return this.render();
    }
    if (action === "onedrive-signin" && id === "onedrive" && this.step === 2) { this.screen = "onedrive-login"; this.step++; return this.render(); }
    if (action === "training-account" && id === "onedrive" && this.step === 3) { this.screen = "onedrive-files"; this.step++; this.status = "เข้าสู่บัญชีฝึกแล้ว — เริ่ม Upload"; return this.render(); }
    if (action === "upload-menu" && id === "onedrive" && this.step === 4) { this.status = "picker"; this.step++; return this.render(); }
    if (action === "choose-upload-file" && id === "onedrive" && this.step === 5) return this.runProgress("Uploading Unit8_Report.docx", "กำลังอัปโหลดไฟล์จาก Documents ไปยัง OneDrive...", () => { this.status = "uploaded"; this.step++; this.screen = "onedrive-files"; this.render(); });
    if (action === "select-uploaded-file" && id === "onedrive" && this.step === 6) { this.fileSelected = true; this.step++; return this.render(); }
    if (action === "share-file" && id === "onedrive" && this.step === 7) { this.contextOpen = true; this.step++; return this.render(); }
    if (action === "copy-link" && id === "onedrive" && this.step === 8) { this.contextOpen = false; this.step++; this.status = "คัดลอกลิงก์แล้ว — เปิดโฟลเดอร์ที่ Sync"; return this.render(); }
    if (action === "open-sync-folder" && id === "onedrive" && this.step === 9) { this.screen = "explorer"; this.contextOpen = false; this.step++; this.status = "ไฟล์มีเครื่องหมาย Sync พร้อมใช้งาน"; return this.render(); }
    if (action === "sync-file-menu" && id === "onedrive" && this.step === 10) { this.contextOpen = true; this.status = "เลือก Free up space เพื่อเก็บไฟล์ไว้บน Cloud"; return this.render(); }
    if (action === "free-up-space" && id === "onedrive" && this.step === 10) return this.finish();
    return this.hint(`ขั้นตอนปัจจุบัน: ${this.steps[this.step] || "เสร็จสิ้น"}`);
  }

  handleAddress(value) {
    return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  hint(message) {
    this.status = message;
    this.onMistake?.(1);
    this.render();
  }

  runProgress(title, detail, done) {
    this.progress = { title, detail };
    this.status = "";
    this.render();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.destroyed) return;
      this.progress = null;
      done();
    }, 1550);
  }

  finish() {
    this.step = this.steps.length;
    this.completed = true;
    this.status = "";
    this.render();
  }
}
