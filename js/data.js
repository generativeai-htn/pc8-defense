/* ============================================================
   PC-8 Defense — content & config data
   Lesson content sourced from "Computer_Health_Clinic" unit 8
   ============================================================ */

const DEFENDERS = {
  checkdisk: {
    name: "หมอตรวจดิสก์",
    tool: "Check Disk",
    img: "assets/img/characters/checkdisk",
    cost: 25,
    dmg: 9,
    fireRate: 950,
    color: "#c98a1f"
  },
  defrag: {
    name: "นักจัดระเบียบ",
    tool: "Optimize & Defragment",
    img: "assets/img/characters/defrag",
    cost: 30,
    dmg: 11,
    fireRate: 850,
    color: "#0d7d72"
  },
  cleanup: {
    name: "ทีมล้างขยะ",
    tool: "Disk Cleanup",
    img: "assets/img/characters/cleanup",
    cost: 30,
    dmg: 10,
    fireRate: 800,
    color: "#d97a9c"
  },
  antivirus: {
    name: "ทหารภูมิคุ้มกัน",
    tool: "Antivirus",
    img: "assets/img/characters/antivirus",
    cost: 40,
    dmg: 16,
    fireRate: 650,
    color: "#d9483a"
  },
  onedrive: {
    name: "หน่วยสื่อสารคลาวด์",
    tool: "OneDrive",
    img: "assets/img/characters/onedrive",
    cost: 35,
    dmg: 13,
    fireRate: 750,
    color: "#123a52"
  }
};

const ENEMY_TYPES = {
  junk: { name: "ไฟล์ขยะ", img: "assets/img/enemies/junk", hp: 26, speed: 34, dmg: 8 },
  corrupt: { name: "ไฟล์เสียหาย", img: "assets/img/enemies/corrupt", hp: 40, speed: 26, dmg: 12 },
  boss: { name: "ไวรัสร้าย Boss", img: "assets/img/enemies/boss", hp: 420, speed: 18, dmg: 30 }
};

/* Each stage = 1 utility room from the lesson.
   lesson: teaching card shown before the battle.
   quiz:   single MCQ gate shown after clearing all waves.
   waves:  array of {type, count, interval(ms), delay(ms before wave starts)} */
const STAGES = [
  {
    id: "checkdisk",
    code: "ROOM 01",
    title: "Check Disk",
    subtitle: "ผู้ตรวจสอบโครงสร้าง",
    defender: "checkdisk",
    lane: "assets/img/area/lane1.png",
    lesson: {
      heading: "อาการ: ไฟล์ Error / จอฟ้า",
      body: "Check Disk ตรวจสอบสภาพฮาร์ดดิสก์ แก้ไขข้อผิดพลาด และซ่อมข้อมูลหรือโครงสร้างของไฟล์ส่วนที่เสียหายให้กลับมาใช้งานได้ เหมาะเมื่อพบหน้าจอฟ้า ไฟล์ Error หรือปิดเครื่องไม่ถูกวิธี",
      steps: [
        "คลิกขวาไดร์ฟ (C:) → เลือก Properties",
        "ไปที่แท็บ Tools → คลิกปุ่ม Check",
        "คลิก Scan drive → รอระบบซ่อมแซม"
      ]
    },
    quiz: {
      questions: [
        {
          q: "โปรแกรม Check Disk มีหน้าที่หลักคืออะไร?",
          options: ["ซ่อมแซมโครงสร้างไฟล์ที่เสียหายบนฮาร์ดดิสก์", "ลบไฟล์ขยะทั้งหมดในเครื่อง", "จัดเรียงข้อมูลให้ต่อเนื่องกัน", "สำรองข้อมูลขึ้นคลาวด์"],
          correct: 0,
          explain: "Check Disk ตรวจสอบและซ่อมข้อผิดพลาดของดิสก์และโครงสร้างไฟล์"
        },
        {
          q: "หลังเปิด Properties ของไดร์ฟ (C:) ต้องไปที่แท็บใด?",
          options: ["Security", "Tools", "Sharing", "Previous Versions"],
          correct: 1,
          explain: "คำสั่ง Error checking อยู่ในแท็บ Tools"
        }
      ]
    },
    waves: [
      { type: "junk", count: 5, interval: 1400, delay: 800 },
      { type: "junk", count: 8, interval: 1100, delay: 2200 }
    ],
    startCoins: 60
  },
  {
    id: "defrag",
    code: "ROOM 02",
    title: "Optimize & Defragment",
    subtitle: "ผู้จัดระเบียบข้อมูล",
    defender: "defrag",
    lane: "assets/img/area/lane2.png",
    lesson: {
      heading: "อาการ: เครื่องอืด โหลดช้า",
      body: "เมื่อมีการลบหรือแก้ไขข้อมูลบ่อยๆ ไฟล์จะกระจัดกระจาย (Fragmentation) ทำให้หัวอ่านฮาร์ดดิสก์ทำงานหนัก Defragment จะจัดเรียงข้อมูลให้ต่อเนื่องกันอีกครั้ง",
      steps: [
        "พิมพ์ defragment ในช่อง Search",
        "เปิดแอป Defragment and Optimize Drives",
        "เลือก Drive (เช่น C:) ที่ต้องการจัดระเบียบ",
        "คลิก Optimize และรอจนสถานะเป็น OK (0% fragmented)"
      ]
    },
    quiz: {
      questions: [
        {
          q: "เหตุใดฮาร์ดดิสก์ที่ข้อมูลกระจัดกระจาย (Fragmented) จึงทำให้เครื่องช้าลง?",
          options: ["เพราะไวรัสเข้าไปแฝงตัวอยู่ในไฟล์", "เพราะหัวอ่านต้องวิ่งไปมาเก็บชิ้นส่วนไฟล์ที่กระจายอยู่หลายจุด", "เพราะพื้นที่ว่างในดิสก์หมด", "เพราะไม่ได้อัปเดตวินโดวส์"],
          correct: 1,
          explain: "การจัดชิ้นส่วนไฟล์ให้ต่อเนื่องช่วยลดการเคลื่อนที่ของหัวอ่านบนฮาร์ดดิสก์"
        },
        {
          q: "สถานะเป้าหมายหลัง Optimize ตามบทเรียนคือข้อใด?",
          options: ["OK (0% fragmented)", "Storage Full 99%", "Scan required", "Real-time protection off"],
          correct: 0,
          explain: "เมื่อจัดระเบียบเสร็จ สถานะควรเป็น OK (0% fragmented)"
        }
      ]
    },
    waves: [
      { type: "junk", count: 6, interval: 1200, delay: 800 },
      { type: "corrupt", count: 4, interval: 1500, delay: 2000 }
    ],
    startCoins: 70
  },
  {
    id: "cleanup",
    code: "ROOM 03",
    title: "Disk Cleanup",
    subtitle: "การดีท็อกซ์ระบบ",
    defender: "cleanup",
    lane: "assets/img/area/lane3.png",
    lesson: {
      heading: "อาการ: พื้นที่ฮาร์ดดิสก์เต็ม",
      body: "ระหว่างใช้งาน Windows จะมีไฟล์ค้างสะสมจนเครื่องช้าลง เช่น Temporary Internet Files, Downloaded Program Files และ System error memory dump files โปรแกรม Disk Cleanup ช่วยคำนวณและลบไฟล์ที่ไม่จำเป็นเพื่อคืนพื้นที่ดิสก์",
      steps: [
        "Phase 1 – Scan: พิมพ์ Disk Cleanup แล้วเลือก Drive",
        "Phase 2 – Select: ติ๊กเลือกไฟล์ขยะที่ต้องการลบ",
        "Phase 3 – Delete: คลิก OK → Delete Files"
      ]
    },
    quiz: {
      questions: [
        {
          q: "ข้อใด “ไม่ใช่” ไฟล์ขยะที่ Disk Cleanup มักลบทิ้ง?",
          options: ["Temporary Internet Files", "Downloaded Program Files", "เอกสารสำคัญของผู้ใช้ (My Documents)", "System error memory dump files"],
          correct: 2,
          explain: "เอกสารสำคัญของผู้ใช้ไม่ใช่ไฟล์ขยะ จึงต้องตรวจรายการก่อนยืนยันลบ"
        },
        {
          q: "ลำดับการใช้ Disk Cleanup ที่ถูกต้องคือข้อใด?",
          options: ["Delete → Select → Scan", "Select → Scan → Delete", "Scan → Select → Delete", "Scan → Delete → Select"],
          correct: 2,
          explain: "โปรแกรมต้องสแกนเพื่อคำนวณพื้นที่ ก่อนเลือกชนิดไฟล์และยืนยันลบ"
        }
      ]
    },
    waves: [
      { type: "junk", count: 10, interval: 1000, delay: 800 },
      { type: "corrupt", count: 5, interval: 1300, delay: 2200 }
    ],
    startCoins: 80
  },
  {
    id: "antivirus",
    code: "ROOM 04",
    title: "Antivirus",
    subtitle: "ระบบภูมิคุ้มกัน",
    defender: "antivirus",
    lane: "assets/img/area/lane1.png",
    lesson: {
      heading: "อาการ: ป๊อปอัปแปลก เครื่องรวน",
      body: "Antivirus คือระบบภูมิคุ้มกันที่ป้องกันและกำจัดไวรัสหรือสปายแวร์ ตัวอย่างเช่น Windows Defender, NOD32, Avira, McAfee และ Kaspersky กฎเหล็กคือใช้เพียงโปรแกรมเดียวเพื่อไม่ให้ระบบขัดแย้งกัน",
      steps: [
        "เปิดโปรแกรม Antivirus ที่ติดตั้งไว้เพียงโปรแกรมเดียว",
        "ค้นหาเมนู Update หรือ Check for updates",
        "อัปเดตฐานข้อมูลไวรัสให้ทันภัยคุกคามใหม่",
        "เปิด Real-time protection และตั้งค่าการสแกนอัตโนมัติ"
      ]
    },
    quiz: {
      questions: [
        {
          q: "กฎเหล็ก (Golden Rule) ของการใช้ Antivirus คือข้อใด?",
          options: ["ติดตั้งหลายโปรแกรมพร้อมกันเพื่อป้องกันสองชั้น", "ควรติดตั้งโปรแกรม Antivirus เพียงโปรแกรมเดียวเท่านั้นในเครื่อง", "ปิด Real-time protection เพื่อให้เครื่องเร็วขึ้น", "ไม่จำเป็นต้องอัปเดตฐานข้อมูลไวรัส"],
          correct: 1,
          explain: "Antivirus หลายตัวอาจแย่งทรัพยากรและขัดแย้งกัน"
        },
        {
          q: "เหตุใดจึงต้อง Update ฐานข้อมูลไวรัสอย่างสม่ำเสมอ?",
          options: ["เพื่อเพิ่มพื้นที่ฮาร์ดดิสก์", "เพื่อให้รู้จักภัยคุกคามชนิดใหม่", "เพื่อจัดเรียงชิ้นส่วนไฟล์", "เพื่อซิงก์เอกสารขึ้นคลาวด์"],
          correct: 1,
          explain: "ไวรัสพัฒนาอยู่เสมอ ฐานข้อมูลล่าสุดช่วยให้ตรวจจับภัยใหม่ได้"
        }
      ]
    },
    waves: [
      { type: "corrupt", count: 8, interval: 1000, delay: 800 },
      { type: "junk", count: 10, interval: 700, delay: 2200 }
    ],
    startCoins: 90
  },
  {
    id: "onedrive",
    code: "ROOM 05",
    title: "Cloud Service (OneDrive)",
    subtitle: "นวัตกรรมยูทิลิตี้",
    defender: "onedrive",
    lane: "assets/img/area/lane2.png",
    lesson: {
      heading: "เมื่อ Disk Cleanup ไม่พอ...",
      body: "หากฮาร์ดดิสก์เต็มด้วยข้อมูลสำคัญที่ลบไม่ได้ Cloud Service อย่าง OneDrive ช่วยสำรองข้อมูล (Backup), เข้าถึงและทำงานได้จากหลายอุปกรณ์ (Sync), แชร์ไฟล์ และใช้ Free up space เก็บไฟล์ไว้เฉพาะบนคลาวด์เพื่อลดภาระไดร์ฟ C:",
      steps: [
        "Registration 1: ไปที่ onedrive.live.com",
        "Registration 2: เลือก Create free account หรือ Sign in ด้วยบัญชี Microsoft",
        "Registration 3: ตั้งรหัสผ่านและยืนยันอีเมล",
        "Sync Setup 1: ค้นหาแอป OneDrive จากช่อง Search ใน Windows",
        "Sync Setup 2: Sign in ด้วยบัญชีที่สมัครไว้",
        "Sync Setup 3: เลือกโฟลเดอร์ที่ต้องการซิงก์ เช่น Documents หรือ Desktop",
        "Upload: ลากไฟล์ลงโฟลเดอร์ OneDrive เพื่อสำรองทันที",
        "Share: คลิกขวาไฟล์แล้วเลือก Share เพื่อส่งลิงก์ทำงานร่วมกัน",
        "Free up space: คลิกขวาแล้วเลือก Free up space ให้ไฟล์อยู่เฉพาะบนคลาวด์"
      ]
    },
    quiz: {
      questions: [
        {
          q: "ประโยชน์ข้อใด “ไม่ใช่” ของการใช้ OneDrive?",
          options: ["สำรองข้อมูลป้องกันไฟล์หายหากฮาร์ดดิสก์พัง", "เข้าถึงไฟล์ได้จากทุกอุปกรณ์ (Sync)", "เพิ่มความเร็วของ CPU โดยตรง", "เก็บไฟล์ขนาดใหญ่บนคลาวด์ ลดภาระฮาร์ดดิสก์"],
          correct: 2,
          explain: "OneDrive ช่วยเรื่องไฟล์และพื้นที่จัดเก็บ ไม่ได้เพิ่มความเร็ว CPU โดยตรง"
        },
        {
          q: "คำสั่งใดทำให้ไฟล์อยู่บนคลาวด์และคืนพื้นที่ให้ไดร์ฟ C:?",
          options: ["Share", "Free up space", "Scan drive", "Optimize"],
          correct: 1,
          explain: "Free up space เอาสำเนาในเครื่องออก แต่ไฟล์ยังเข้าถึงได้จาก OneDrive"
        },
        {
          q: "ถ้าต้องการส่งลิงก์ให้เพื่อนทำงานร่วมกันควรใช้คำสั่งใด?",
          options: ["Upload", "Share", "Delete Files", "Check for updates"],
          correct: 1,
          explain: "Share ใช้สร้างลิงก์หรือกำหนดสิทธิ์ให้ผู้อื่นเข้าถึงไฟล์"
        }
      ]
    },
    waves: [
      { type: "corrupt", count: 10, interval: 900, delay: 800 },
      { type: "junk", count: 14, interval: 650, delay: 2200 }
    ],
    startCoins: 100
  }
];

const BOSS_STAGE = {
  id: "boss",
  code: "FINAL",
  title: "ไวรัสร้าย โจมตีระลอกสุดท้าย",
  subtitle: "ใช้หน่วยยูทิลิตี้ทั้งหมดที่ปลดล็อกแล้วป้องกัน PC-8",
  lane: "assets/img/area/lane3.png",
  lesson: {
    heading: "ก่อนขึ้นสนามสุดท้าย...",
    body: "รวมพลังหน่วยยูทิลิตี้ทั้ง 5 ที่ฝึกมา เข้าปกป้องเครื่อง PC-8 จากไวรัสตัวร้ายที่รวมทุกอาการเข้าไว้ด้วยกัน! วางหน่วยให้ครบทุกช่องก่อนเริ่มการต่อสู้",
    steps: []
  },
  waves: [
    { type: "junk", count: 10, interval: 700, delay: 500 },
    { type: "corrupt", count: 8, interval: 900, delay: 1500 },
    { type: "boss", count: 1, interval: 0, delay: 3000 }
  ],
  startCoins: 210
};

/* Pre-op diagnosis game: symptom -> correct treatment tool. */
const TRIAGE_CASES = [
  { symptom: "หน้าจอฟ้า หรือเปิดไฟล์แล้วพบ Error", answer: "checkdisk", result: "Check Disk ซ่อมแซมข้อผิดพลาดและโครงสร้างไฟล์ที่เสียหาย" },
  { symptom: "เครื่องทำงานอืด โหลดไฟล์ช้า ทั้งที่ยังมีพื้นที่ว่าง", answer: "defrag", result: "Optimize & Defragment จัดชิ้นส่วนข้อมูลให้ต่อเนื่องและอ่านได้เร็วขึ้น" },
  { symptom: "พื้นที่ฮาร์ดดิสก์เต็ม มีไฟล์ชั่วคราวสะสมจำนวนมาก", answer: "cleanup", result: "Disk Cleanup สแกนและลบไฟล์ขยะเพื่อคืนพื้นที่" },
  { symptom: "มีป๊อปอัปแปลก ๆ เครื่องรวน และเสี่ยงมัลแวร์", answer: "antivirus", result: "Antivirus ที่อัปเดตแล้วช่วยตรวจจับและกำจัดภัยคุกคาม" }
];

/* Hands-on checklist adapted from practical worksheet 8. */
const PRACTICE_TASKS = [
  {
    id: "cleanup",
    title: "Disk Cleanup",
    goal: "ลบ Temporary Files ให้สำเร็จ",
    steps: ["ค้นหา Disk Cleanup และเลือกไดร์ฟ", "ติ๊ก Temporary Internet Files", "กด OK และยืนยัน Delete Files"]
  },
  {
    id: "defrag",
    title: "Defragmenter",
    goal: "วิเคราะห์และ Optimize ไดร์ฟ C:",
    steps: ["เปิด Defragment and Optimize Drives", "เลือกไดร์ฟ C:", "กด Analyze", "กด Optimize และรอผล OK"]
  },
  {
    id: "antivirus",
    title: "Antivirus",
    goal: "อัปเดตฐานข้อมูลและสั่ง Scan",
    steps: ["เปิดโปรแกรม Antivirus", "กด Update หรือ Check for updates", "เปิด Real-time protection และสั่ง Scan"]
  },
  {
    id: "onedrive",
    title: "OneDrive",
    goal: "อัปโหลดไฟล์ทดสอบและคืนพื้นที่",
    steps: ["Sign in เข้า OneDrive", "อัปโหลดไฟล์ทดสอบ 1 ไฟล์", "คลิกขวาที่ไฟล์", "เลือก Free up space"]
  }
];

/* Epilogue matching game: task -> correct frequency bucket */
const SCHEDULE_TASKS = [
  { id: "av", label: "Antivirus — เปิด Real-time protection เสมอ", freq: "daily" },
  { id: "cleanup", label: "Disk Cleanup — ลบไฟล์ขยะ", freq: "weekly" },
  { id: "defrag", label: "Defragment & Check Disk — จัดเรียง/ตรวจสอบ", freq: "monthly" },
  { id: "onedrive", label: "OneDrive — ซิงก์ไฟล์อัตโนมัติ", freq: "always" }
];
const SCHEDULE_SLOTS = [
  { key: "daily", label: "ทุกวัน (Daily)" },
  { key: "weekly", label: "ทุกสัปดาห์ (Weekly)" },
  { key: "monthly", label: "ทุกเดือน (Monthly)" },
  { key: "always", label: "ตลอดเวลา (Always)" }
];
