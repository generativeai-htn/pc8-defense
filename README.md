# PC-8 Guardian Academy

สื่อการเรียนรู้แบบเกม (CAI) สำหรับวิชาระบบปฏิบัติการคอมพิวเตอร์ หน่วยที่ 8
"คลินิกสุขภาพคอมพิวเตอร์" — ดัดแปลงจากสไลด์ `Computer_Health_Clinic.pdf` ให้เป็น
เกม tower-defense ที่ผู้เล่นควบคุมเอง พร้อม mini-game ฝึกปฏิบัติแยกตามหัวข้อ

ครอบคลุม Check Disk, Optimize & Defragment, Disk Cleanup, Antivirus และ OneDrive

**Repo:** github.com/generativeai-htn/pc8-defense (branch `main`)
**Deploy:** Static site — เปิดผ่าน GitHub Pages ได้ทันที ไม่มี build step ไม่มี dependency

---

## 1. โครงสร้างการเล่น (Flow)

```
Start (เข้าสู่ศูนย์รักษา)
  → Hub / Mission Map (เลือกห้องรักษา, ปลดล็อกตามลำดับ)
    → Briefing (สถานการณ์ + ทีมที่ใช้ + เครื่องมือประจำภารกิจ)
      → Phase 1: ฝึกปฏิบัติ (mini-game เฉพาะหัวข้อ ไม่ใช่แบบทดสอบเลือกตอบ)
        → Phase 2: ป้องกันฐาน (battle จริง)
          → Phase 3: สรุปความรู้ (debrief + facts)
    → กลับแผนที่ → ปลดล็อกห้องถัดไป
  → เคลียร์ครบ 5 ห้อง → Final Boss "PC-8 Core Emergency"
    → Certificate (ใบรับรอง + ตารางตรวจสุขภาพ)
```

มี **Roster** (ทีมแมว 15 ตัว) และ **Manual** (คู่มืออ้างอิงเนื้อหาทั้งหมด) เปิดได้จาก topbar ทุกหน้า
บันทึกความก้าวหน้าไว้ในเบราว์เซอร์ด้วย `localStorage`

## 2. เนื้อหา 5 ห้อง + บอส

| ห้อง | เครื่องมือ | Mini-game ฝึกปฏิบัติ | ศัตรู |
|---|---|---|---|
| 01 Sector Rescue | Check Disk | คลิกเซกเตอร์สีแดง (จุดเสีย) ให้ครบ | Enemy Reg 1–2 |
| 02 Block Order Protocol | Optimize & Defragment | สลับบล็อกสีให้เรียงเป็น 0% fragmented | Enemy Reg 3–4 |
| 03 Storage Detox Run | Disk Cleanup | เลือกลบเฉพาะไฟล์ขยะ ห้ามโดนเอกสารสำคัญ | Enemy Reg 5–6 |
| 04 Immunity Firewall | Antivirus | เรียงลำดับขั้นตอนอัปเดต/เปิด Real-time protection | Enemy Reg 7–8 + Boss 1 |
| 05 Cloud Bridge Escort | OneDrive | เรียงลำดับสมัคร/Sync/Upload/Share | Enemy Reg 1,3,5 + Boss 2 |
| Final: PC-8 Core Emergency | ทั้ง 5 ยูทิลิตี้ | จับคู่ "อาการบอส" กับเครื่องมือให้ถูกก่อนโล่จะทำลายฐาน | Boss 3–7 ต่อเนื่อง |

จบเกมได้ตารางตรวจสุขภาพ (Daily = Antivirus, Weekly = Disk Cleanup, Monthly = Defrag/Check Disk,
Always = OneDrive) ตรงตามสไลด์ต้นฉบับ

## 3. ระบบต่อสู้

ผู้เล่นเล็ง-ยิงเองเป็นหลัก ไม่ใช่ auto-battler:

- เมาส์/นิ้ว: เล็งด้วย pointer, กดค้าง/แตะค้างเพื่อยิงต่อเนื่อง (fire rate 0.16s)
- **WASD / ปุ่มลูกศร**: บังคับตัวละครประจำห้องเดินได้อย่างอิสระในสนาม
- **Spacebar**: ยิงที่ตำแหน่งเล็งล่าสุด (รองรับคีย์บอร์ด)
- **Mobile controls**: มีปุ่มทิศทางและปุ่ม FIRE สำหรับโทรศัพท์หรือแท็บเล็ต
- **Combo**: ยิงติดไม่พลาดสะสมดาเมจสูงสุด +60% ที่ combo×10 — พลาดแล้วรีเซ็ต
- **Data Core**: ศัตรูดรอปแกนความรู้ ผู้เล่นต้องเดินไปเก็บเพื่ออ่านสาระของบทและชาร์จ Ability
- ทีมแมวที่วางไว้ = หน่วยสนับสนุนเบาๆ (fire rate ~3–4s, ดาเมจต่ำ) ไม่ใช่ตัวหลัก
- Ability charge bar: ยูทิลิตี้ประจำภารกิจชาร์จเต็มแล้วปล่อยเป็นสกิลใหญ่ได้
- Final boss: ต้องกดยูทิลิตี้ให้ตรงกับ "อาการ" ที่บอสแสดงก่อนหมดเวลา ไม่งั้นฐานเสียหาย
- Crosshair วาดเองบน canvas (ซ่อน system cursor), มี muzzle flash + เสียงยิงทุกนัด

## 4. โครงสร้างไฟล์

```
pc8-defense/
├── index.html          # ทุกหน้าจอ (screen) อยู่ใน DOM เดียว สลับด้วย class .active
├── css/style.css        # ธีมเดียว: sci-fi/game (Chakra Petch + IBM Plex Sans Thai)
├── js/
│   ├── data.js          # เนื้อหาบทเรียนทั้งหมด: MISSIONS, UTILITIES, CAT_TEAM,
│   │                     #   REGULAR_ENEMIES, BOSS_ENEMIES, HEALTH_SCHEDULE, MANUAL_SECTIONS
│   ├── audio.js          # SoundManager: เพลง 3 เพลง + sfx 6 เสียง, mute ผ่าน localStorage
│   ├── battle.js         # DefenseBattle: canvas engine — เล็ง/ยิง/คลื่นศัตรู/บอส/เอฟเฟกต์
│   └── main.js           # ควบคุม flow, render แต่ละ screen, mini-game 3 แบบ, บันทึก progress
└── assets/
    ├── gamepack/         # สำเนาเต็มของ CraftPix Cat Defense kit (ตัวละคร 15, ศัตรู 15, UI, FX)
    └── audio/            # CraftPix Futuristic Audio Pack 7 (คัดมาเฉพาะที่ใช้)
```

ไม่มี dependency/build step — เป็น vanilla HTML/CSS/JS ล้วน เปิด `index.html` ตรงๆ หรือ deploy
ผ่าน GitHub Pages ก็ทำงานได้ทันที

## 5. เครดิตทรัพยากร

- ภาพตัวละคร ฉาก UI และเอฟเฟกต์: CraftPix — Free Cartoon Cat Defense Game Asset Kit
- เสียงประกอบ: CraftPix — Free Futuristic Audio Pack 7
- เนื้อหาบทเรียน: Computer_Health_Clinic.pdf (หน่วยที่ 8)
