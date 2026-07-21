# เชื่อม PC-8 Guardian Academy กับ Google Sheets

Google Sheet ปลายทาง: https://docs.google.com/spreadsheets/d/1SqiczZ18kVY7XJKaDa65TmU-7SVKW1JgzsXVxVESrT4/edit

ทำครั้งเดียวด้วยบัญชี Google ที่เป็นเจ้าของชีต:

1. เปิด Google Sheet แล้วเลือก **ส่วนขยาย (Extensions) → Apps Script**
2. ลบโค้ดตัวอย่างใน `Code.gs` แล้ววางโค้ดจากไฟล์ `google-apps-script/Code.gs`
3. กด **Deploy → New deployment → Web app**
4. ตั้ง **Execute as: Me** และ **Who has access: Anyone** แล้วกด Deploy
5. อนุญาตสิทธิ์ตามหน้าจอ จากนั้นคัดลอก URL ที่ลงท้ายด้วย `/exec`
6. วาง URL ลงใน `js/config.js` ที่ค่า `studentDataEndpoint`
7. commit และ push ไฟล์ `js/config.js` ขึ้น GitHub Pages

เกมจะส่งเหตุการณ์ `LOGIN`, `SESSION_START`, `MISSION_COMPLETE` และ `FINAL_COMPLETE` โดยเก็บเฉพาะรหัสนักศึกษา ชื่อ-นามสกุล ความก้าวหน้า และผลภารกิจ
