/* ============================================================
   PC-8 GUARDIAN ACADEMY — CAI content and game configuration
   Content is adapted from Computer_Health_Clinic, Unit 8.
   ============================================================ */

const PACK = "assets/gamepack";

const CAT_TEAM = [
  { id: 1, name: "หมอพิกเซล", role: "ตรวจโครงสร้าง", unit: "checkdisk" },
  { id: 2, name: "หมอไบต์", role: "ค้นหา Error", unit: "checkdisk" },
  { id: 3, name: "หมอเซกเตอร์", role: "ซ่อมไฟล์", unit: "checkdisk" },
  { id: 4, name: "น้องบล็อก", role: "วิเคราะห์ดิสก์", unit: "defrag" },
  { id: 5, name: "กัปตันคลัสเตอร์", role: "จัดกลุ่มข้อมูล", unit: "defrag" },
  { id: 6, name: "สปีดดี้", role: "Optimize", unit: "defrag" },
  { id: 7, name: "กวาดไว", role: "ค้นหาไฟล์ขยะ", unit: "cleanup" },
  { id: 8, name: "แคชบัสเตอร์", role: "ล้างแคช", unit: "cleanup" },
  { id: 9, name: "เมมดัมป์", role: "คืนพื้นที่", unit: "cleanup" },
  { id: 10, name: "ดีเฟนเดอร์", role: "Real-time protection", unit: "antivirus" },
  { id: 11, name: "ซิกเนเจอร์", role: "อัปเดตฐานข้อมูล", unit: "antivirus" },
  { id: 12, name: "สแกนเนอร์", role: "สแกนภัยคุกคาม", unit: "antivirus" },
  { id: 13, name: "คลาวด์ดี้", role: "Backup", unit: "onedrive" },
  { id: 14, name: "ซิงก์โคร", role: "Sync", unit: "onedrive" },
  { id: 15, name: "แชร์ลิงก์", role: "Share & Free space", unit: "onedrive" }
];

const UTILITIES = {
  checkdisk: {
    name: "Check Disk",
    callSign: "หน่วยตรวจโครงสร้าง",
    icon: "🩺",
    color: "#53d6a5",
    effect: "สแกนและซ่อมแซมโครงสร้างไฟล์ที่เสียหาย",
    symptom: "หน้าจอฟ้า / ไฟล์ Error",
    cadence: "ทุกเดือน หรือเมื่อพบข้อผิดพลาด"
  },
  defrag: {
    name: "Optimize & Defragment",
    callSign: "หน่วยจัดระเบียบ",
    icon: "🧩",
    color: "#58b7ff",
    effect: "จัดชิ้นส่วนข้อมูลให้ต่อเนื่อง ลดงานของหัวอ่านฮาร์ดดิสก์",
    symptom: "เครื่องอืด / โหลดช้า",
    cadence: "ตรวจสอบทุกเดือน"
  },
  cleanup: {
    name: "Disk Cleanup",
    callSign: "หน่วยดีท็อกซ์ระบบ",
    icon: "🧹",
    color: "#ffbd4a",
    effect: "ลบไฟล์ชั่วคราวและไฟล์ขยะเพื่อคืนพื้นที่",
    symptom: "พื้นที่จัดเก็บเต็ม",
    cadence: "ทุกสัปดาห์"
  },
  antivirus: {
    name: "Antivirus",
    callSign: "หน่วยภูมิคุ้มกัน",
    icon: "🛡️",
    color: "#ff6b62",
    effect: "ป้องกัน ตรวจจับ และกำจัดไวรัสหรือสปายแวร์",
    symptom: "ป๊อปอัปแปลก / เครื่องรวน",
    cadence: "เปิด Real-time protection ตลอดเวลา"
  },
  onedrive: {
    name: "OneDrive",
    callSign: "หน่วยคลาวด์",
    icon: "☁️",
    color: "#9a7cff",
    effect: "สำรอง ซิงก์ แชร์ และคืนพื้นที่ด้วย Free up space",
    symptom: "ข้อมูลสำคัญเต็มดิสก์ / เสี่ยงสูญหาย",
    cadence: "ซิงก์ไฟล์สำคัญตลอดเวลา"
  }
};

const MISSIONS = [
  {
    id: "checkdisk",
    chapter: "01",
    title: "ปฏิบัติการ Sector Rescue",
    subtitle: "ตามหาและซ่อมเซกเตอร์เสียก่อนระบบล่ม",
    mechanic: "สแกนจุดเสีย + ป้องกันฐาน",
    area: 1,
    team: [1, 2, 3],
    enemies: [1, 2],
    boss: null,
    reward: "เหรียญตรา File Surgeon",
    intro: [
      "PC-8 ปิดเครื่องผิดวิธี โครงสร้างไฟล์บางส่วนกำลังเสียหาย!",
      "เปิด Properties ของไดร์ฟ C: เข้าแท็บ Tools แล้วใช้ Check และ Scan drive",
      "ตรวจจุดเสียให้ครบ จากนั้นคุ้มกันระบบระหว่างการซ่อมแซม"
    ],
    sequence: ["เลือกไดร์ฟ C:", "เปิด Properties", "เข้าแท็บ Tools", "กด Check", "กด Scan drive"],
    facts: [
      "Check Disk ตรวจสอบสภาพฮาร์ดดิสก์และข้อผิดพลาดของระบบไฟล์",
      "เครื่องมือสามารถซ่อมโครงสร้างไฟล์ส่วนที่เสียหายให้กลับมาใช้งานได้",
      "เหมาะเมื่อพบหน้าจอฟ้า ไฟล์ Error หรือเครื่องดับกะทันหัน"
    ],
    waves: [
      { kind: "regular", id: 1, count: 6, interval: 900, delay: 700 },
      { kind: "regular", id: 2, count: 5, interval: 850, delay: 1800 }
    ]
  },
  {
    id: "defrag",
    chapter: "02",
    title: "Block Order Protocol",
    subtitle: "เรียงชิ้นส่วนไฟล์ให้ต่อเนื่องก่อนหัวอ่านโอเวอร์โหลด",
    mechanic: "สลับบล็อกข้อมูล + ป้องกันฐาน",
    area: 2,
    team: [4, 5, 6],
    enemies: [3, 4],
    boss: null,
    reward: "เหรียญตรา Data Organizer",
    intro: [
      "การลบและแก้ไขไฟล์บ่อยทำให้ชิ้นส่วนข้อมูลกระจัดกระจาย",
      "หัวอ่านฮาร์ดดิสก์ต้องวิ่งไปมาหลายจุด เครื่องจึงทำงานช้าลง",
      "จัดกลุ่มบล็อกให้ต่อเนื่อง แล้ว Optimize จนสถานะเป็น OK"
    ],
    sequence: ["ค้นหา defragment", "เปิด Defragment and Optimize Drives", "เลือกไดร์ฟ C:", "กด Analyze", "กด Optimize"],
    facts: [
      "Fragmentation คือชิ้นส่วนของไฟล์เดียวกันกระจายอยู่คนละตำแหน่ง",
      "Defragment จัดชิ้นส่วนให้ต่อเนื่อง ช่วยให้ฮาร์ดดิสก์อ่านเร็วขึ้น",
      "เป้าหมายของภารกิจคือสถานะ OK (0% fragmented)"
    ],
    waves: [
      { kind: "regular", id: 3, count: 7, interval: 820, delay: 700 },
      { kind: "regular", id: 4, count: 6, interval: 760, delay: 1700 }
    ]
  },
  {
    id: "cleanup",
    chapter: "03",
    title: "Storage Detox Run",
    subtitle: "คัดไฟล์ขยะให้แม่น อย่าลบเอกสารสำคัญ",
    mechanic: "คัดแยกไฟล์ + ป้องกันฐาน",
    area: 3,
    team: [7, 8, 9],
    enemies: [5, 6],
    boss: null,
    reward: "เหรียญตรา Storage Saver",
    intro: [
      "Windows สะสมไฟล์ชั่วคราวจนพื้นที่จัดเก็บใกล้เต็ม",
      "สแกน เลือกเฉพาะไฟล์ขยะ แล้วจึงยืนยัน Delete Files",
      "ระวัง My Documents และไฟล์งานสำคัญ เพราะไม่ใช่ไฟล์ขยะ"
    ],
    sequence: ["เปิด Disk Cleanup", "เลือกไดร์ฟ", "Scan คำนวณพื้นที่", "Select รายการไฟล์ขยะ", "ยืนยัน Delete Files"],
    facts: [
      "ไฟล์ที่ลบได้ ได้แก่ Temporary Internet Files และ Downloaded Program Files",
      "System error memory dump files เป็นข้อมูลวิเคราะห์ความผิดพลาดที่อาจลบได้เมื่อไม่ใช้แล้ว",
      "ขั้นตอนที่ปลอดภัยคือ Scan → Select → Delete"
    ],
    waves: [
      { kind: "regular", id: 5, count: 8, interval: 720, delay: 650 },
      { kind: "regular", id: 6, count: 7, interval: 690, delay: 1500 }
    ]
  },
  {
    id: "antivirus",
    chapter: "04",
    title: "Immunity Firewall",
    subtitle: "อัปเดตฐานข้อมูล เปิดเกราะ และต้านไวรัสกลายพันธุ์",
    mechanic: "ตั้งค่าภูมิคุ้มกัน + ศึกบอส",
    area: 4,
    team: [10, 11, 12],
    enemies: [7, 8],
    boss: 1,
    reward: "เหรียญตรา Threat Hunter",
    intro: [
      "ไวรัสพัฒนาทุกวัน การสแกนด้วยฐานข้อมูลเก่าไม่เพียงพอ",
      "อัปเดตฐานข้อมูล เปิด Real-time protection และตั้ง Auto scan",
      "กฎเหล็ก: ใช้ Antivirus เพียงโปรแกรมเดียว เพื่อไม่ให้ระบบขัดแย้งกัน"
    ],
    sequence: ["เปิด Antivirus", "เลือก Check for updates", "อัปเดตฐานข้อมูลไวรัส", "เปิด Real-time protection", "สั่ง Scan / ตั้ง Auto scan"],
    facts: [
      "ตัวอย่าง Antivirus: Windows Defender, NOD32, Avira, McAfee และ Kaspersky",
      "การอัปเดตฐานข้อมูลช่วยให้โปรแกรมรู้จักภัยคุกคามชนิดใหม่",
      "Antivirus หลายตัวพร้อมกันอาจแย่งทรัพยากรและขัดแย้งกัน"
    ],
    waves: [
      { kind: "regular", id: 7, count: 7, interval: 720, delay: 600 },
      { kind: "regular", id: 8, count: 7, interval: 660, delay: 1400 },
      { kind: "boss", id: 1, count: 1, interval: 0, delay: 2000 }
    ]
  },
  {
    id: "onedrive",
    chapter: "05",
    title: "Cloud Bridge Escort",
    subtitle: "ส่งไฟล์สำคัญขึ้นคลาวด์และคืนพื้นที่ให้ไดร์ฟ C:",
    mechanic: "เชื่อมเส้นทางคลาวด์ + ศึกบอส",
    area: 5,
    team: [13, 14, 15],
    enemies: [1, 3, 5],
    boss: 2,
    reward: "เหรียญตรา Cloud Navigator",
    intro: [
      "เมื่อดิสก์เต็มด้วยไฟล์สำคัญที่ลบไม่ได้ ต้องสร้างสะพานไปยังคลาวด์",
      "ลงทะเบียน Sign in เลือกโฟลเดอร์ แล้วใช้ Upload, Share และ Free up space",
      "OneDrive ช่วย Backup, Sync และเข้าถึงไฟล์ได้จากหลายอุปกรณ์"
    ],
    sequence: ["ไปที่ onedrive.live.com", "Create free account / Sign in", "เลือกโฟลเดอร์ Documents หรือ Desktop", "Upload ไฟล์", "Share ลิงก์", "Free up space"],
    facts: [
      "Registration: สร้างบัญชีฟรีหรือ Sign in ด้วยบัญชี Microsoft และยืนยันอีเมล",
      "Sync Setup: เปิดแอป OneDrive, Sign in และเลือกโฟลเดอร์ที่ต้องการซิงก์",
      "Free up space เก็บไฟล์ไว้บนคลาวด์และคืนพื้นที่ในเครื่อง"
    ],
    waves: [
      { kind: "regular", id: 1, count: 5, interval: 720, delay: 550 },
      { kind: "regular", id: 3, count: 5, interval: 680, delay: 1200 },
      { kind: "regular", id: 5, count: 5, interval: 640, delay: 1200 },
      { kind: "boss", id: 2, count: 1, interval: 0, delay: 1900 }
    ]
  }
];

const FINAL_MISSION = {
  id: "final",
  chapter: "FINAL",
  title: "PC-8 Core Emergency",
  subtitle: "นำทีมแมวทั้ง 15 ตัวและยูทิลิตี้ทั้ง 5 ฝ่าวิกฤตบอส",
  area: 4,
  team: CAT_TEAM.map(cat => cat.id),
  bossSequence: [3, 4, 5, 6, 7],
  facts: [
    "ทุกวัน: เปิด Real-time protection",
    "ทุกสัปดาห์: ใช้ Disk Cleanup ลบไฟล์ขยะ",
    "ทุกเดือน: Defragment และ Check Disk",
    "ตลอดเวลา: ซิงก์ไฟล์สำคัญด้วย OneDrive"
  ]
};

const REGULAR_ENEMIES = Object.fromEntries(Array.from({ length: 8 }, (_, index) => {
  const id = index + 1;
  return [id, { id, folder: `Enemy Reg ${id}`, hp: 58 + id * 6, speed: 32 + (id % 3) * 3, damage: 8 + (id % 4) * 2, walk: 35, dead: 60 }];
}));

const BOSS_ENEMIES = {
  1: { id: 1, folder: "Enemy Boss 1", hp: 420, speed: 19, damage: 24, walk: 35, dead: 50 },
  2: { id: 2, folder: "Enemy Boss 2", hp: 500, speed: 18, damage: 26, walk: 35, dead: 50 },
  3: { id: 3, folder: "Enemy Boss 3", hp: 560, speed: 20, damage: 28, walk: 35, dead: 50 },
  4: { id: 4, folder: "Enemy Boss 4", hp: 620, speed: 18, damage: 30, walk: 25, dead: 55 },
  5: { id: 5, folder: "Enemy Boss 5", hp: 680, speed: 17, damage: 32, walk: 30, dead: 50 },
  6: { id: 6, folder: "Enemy Boss 6", hp: 740, speed: 17, damage: 34, walk: 30, dead: 50 },
  7: { id: 7, folder: "Enemy Boss 7", hp: 820, speed: 16, damage: 36, walk: 30, dead: 50 }
};

const CLEANUP_FILES = [
  { name: "Temporary Internet Files", size: 180, safe: true, icon: "🌐" },
  { name: "Downloaded Program Files", size: 120, safe: true, icon: "📦" },
  { name: "System error memory dump", size: 260, safe: true, icon: "🧠" },
  { name: "DirectX Shader Cache", size: 90, safe: true, icon: "🎮" },
  { name: "Delivery Optimization Files", size: 150, safe: true, icon: "🚚" },
  { name: "My Documents", size: 420, safe: false, icon: "📄" },
  { name: "ภาพงานนำเสนอ", size: 300, safe: false, icon: "🖼️" },
  { name: "โปรเจกต์นักเรียน", size: 510, safe: false, icon: "📁" },
  { name: "Windows Update Cleanup", size: 210, safe: true, icon: "🪟" }
];

const HEALTH_SCHEDULE = [
  { when: "ทุกวัน", task: "Antivirus", detail: "เปิด Real-time protection เสมอ", icon: "🛡️" },
  { when: "ทุกสัปดาห์", task: "Disk Cleanup", detail: "ลบไฟล์ขยะจากการทำงานและท่องเว็บ", icon: "🧹" },
  { when: "ทุกเดือน", task: "Defragment & Check Disk", detail: "จัดเรียงข้อมูลและตรวจสอบความสมบูรณ์", icon: "🧩" },
  { when: "ตลอดเวลา", task: "OneDrive", detail: "ซิงก์ไฟล์สำคัญอัตโนมัติ", icon: "☁️" }
];

const MANUAL_SECTIONS = [
  {
    id: "overview",
    title: "วงล้อสุขภาพคอมพิวเตอร์",
    content: [
      "วันแรกที่ใช้งาน: ทำงานรวดเร็ว พื้นที่จัดเก็บเหลือ และระบบเสถียร แต่เมื่อใช้มานานอาจเปิดเครื่องช้า แอปโหลดช้า พื้นที่จัดเก็บเต็ม และข้อมูลสูญหาย",
      "โปรแกรมยูทิลิตี้มี 3 บทบาทสำคัญ: ผู้ช่วยแก้ปัญหา ผู้ประหยัดเวลา และผู้ฟื้นฟูพลังให้ระบบปฏิบัติการ",
      "ประโยชน์ครอบคลุมการประหยัดพลังงาน การสื่อสาร ความสะดวก การจัดการข้อมูล ประสิทธิภาพ และความปลอดภัย",
      "เมื่อใช้คอมพิวเตอร์ไปนาน ๆ เครื่องอาจอืด ขยะดิจิทัลสะสม เสี่ยงไวรัส และข้อมูลสูญหาย",
      "โปรแกรมยูทิลิตี้เป็นผู้ช่วยแก้ปัญหา ผู้ประหยัดเวลา และผู้ฟื้นฟูพลังให้ระบบปฏิบัติการ",
      "ประโยชน์หลักคือประหยัดพลังงาน จัดการข้อมูล เพิ่มประสิทธิภาพ สร้างงานอัตโนมัติ ช่วยการสื่อสาร และเพิ่มความปลอดภัย"
    ]
  },
  ...Object.entries(UTILITIES).map(([id, utility]) => ({
    id,
    title: utility.name,
    content: [utility.effect, `อาการที่เหมาะ: ${utility.symptom}`, `ตารางดูแล: ${utility.cadence}`, ...MISSIONS.find(mission => mission.id === id).facts]
  })),
  {
    id: "schedule",
    title: "ตารางตรวจสุขภาพ",
    content: HEALTH_SCHEDULE.map(item => `${item.when}: ${item.task} — ${item.detail}`)
  }
];

function catIdlePath(id, frame = 0) {
  return `${PACK}/Characters/C${id}/Idle/Character${id}-Idle_${String(frame).padStart(2, "0")}.png`;
}

function catShootPath(id, frame = 0) {
  return `${PACK}/Characters/C${id}/Shoot/Character${id}-Shoot_${String(frame).padStart(2, "0")}.png`;
}

function enemyFramePath(kind, id, animation, frame) {
  const config = kind === "boss" ? BOSS_ENEMIES[id] : REGULAR_ENEMIES[id];
  const prefix = animation === "walk" ? (kind === "boss" ? "Enemy-Walk" : "Enemy-Walking") : animation === "dead" ? "Enemy-Dead" : "Enemy-Idle";
  const folder = animation === "walk" ? "Walk" : animation === "dead" ? "Dead" : "Idle";
  return `${PACK}/Enemies/${config.folder}/${folder}/${prefix}_${String(frame).padStart(2, "0")}.png`;
}
