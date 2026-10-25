# 8 Sian Member — Frontend

## ลิงก์ตรงสำหรับลูกค้า

- `/` หน้าหลัก แสดงข้อมูลร้านและสิทธิพิเศษ
- `/register` เปิดฟอร์มสมัครสมาชิกโดยตรง
- `/coupons` เปิดคูปองของฉันทันทีเมื่อมี session หากยังไม่ได้เข้าสู่ระบบจะไป `/login?next=/coupons` และกลับหน้าคูปองหลังเข้าสู่ระบบสำเร็จ
- `/login` เปิดฟอร์มเข้าสู่ระบบโดยตรง และไปหน้าคูปองเมื่อสำเร็จ

ใช้ URL เหล่านี้กับปุ่มลัดหรือ QR code ได้ เปลี่ยนโดเมนให้เป็นโดเมน frontend จริง Cloudflare Pages ใช้ `public/_redirects` รองรับการเปิด URL โดยตรงและ refresh หน้า

ดู [โครงสร้างไฟล์และจุดแก้ไข](docs/STRUCTURE.md) ก่อนปรับหน้าเว็บหรือ component

React + Vite เว็บสมาชิกภาษาไทย โทนครีมและแดงไวน์ รองรับมือถือ

สมัคร 2 ขั้นตอน: เบอร์โทร ชื่อ นามสกุล วันเกิด → ตั้งรหัสผ่านและยืนยัน เข้าสู่ระบบด้วยเบอร์โทรและรหัสผ่าน มีบัตรสมาชิกและออกจากระบบ ไม่ใช้ LINE หรือ SMS

หลัง login หน้าหลักมีแคมเปญที่แอดมินเปิดแจกพร้อมปุ่มรับคูปอง รับสำเร็จปุ่มเปลี่ยนเป็นรับแล้ว และคูปองเข้าในคูปองของฉัน ไม่มีการแจกอัตโนมัติ แอดมินยังแจกให้สมาชิกโดยตรงได้ ตัวอย่างเพิ่มทะเล +79 บาท กินทะเลไม่อั้น อายุ 30 วัน ใช้แล้วหายจากรายการพร้อมใช้ รับซ้ำแคมเปญเดิมไม่ได้แม้ใช้แล้วหรือหมดอายุ

รายการแคมเปญที่รับแล้วซ่อนออกจากแท็บรับคูปอง การกดใช้คูปองเปิดบาร์โค้ด CODE128-C สำหรับ POS อายุ 10 นาที ยังไม่ตัดสิทธิ์ มีนับถอยหลังและสร้างรหัสใหม่ได้เมื่อหมดอายุ เปิดรหัสใหม่ทำให้รหัสเดิมใช้ไม่ได้ เมื่อตรวจพบ usedAt จาก backend จะแสดงผลว่า POS ยืนยันแล้วและซ่อนบาร์โค้ด/นำคูปองออกจากรายการ การเชื่อมรับสแกนและชำระเงินจริงที่ POS ยังไม่ถูกเพิ่มในขั้นนี้

ทดสอบตัวเข้ารหัสบาร์โค้ดได้ด้วย `node scripts/check-barcode.mjs` ต้องทดสอบสแกนบนจอและเครื่องอ่านจริงก่อนใช้หน้าร้าน

ขณะส่งสมัครสมาชิกหรือ login แสดงหน้าโหลดอย่างน้อย 1 วินาที (ถ้า API ใช้เวลานานกว่าจะรอจนเสร็จ) ป้องกันการกดซ้ำ และแสดงนับถอยหลังเมื่อ backend จำกัดการทำรายการ ไม่มีการ reload ทั้งเว็บ

## เริ่มใช้งาน

Node.js 22 ขึ้นไป

```powershell
npm.cmd ci
# ทำเฉพาะตอนยังไม่มี .env
Copy-Item .env.example .env
npm.cmd run dev
```

เปิด http://localhost:5173 ตั้ง VITE_API_URL ใน .env ให้ตรง backend หรือเว้นว่างเพื่อใช้ Vite proxy ไป localhost:3001

```powershell
npm.cmd run build
npm.cmd run preview
npm.cmd run check:views
```

## Cloudflare Pages

เชื่อม repository นี้ Root directory เป็น repository root

- Build command: `npm ci && npm run build`
- Build output directory: dist
- Environment: VITE_API_URL=https://api.example.com

VITE_API_URL เป็น public config ถูกฝังตอน build ต้อง rebuild เมื่อเปลี่ยนค่า ห้ามเก็บ secret ในตัวแปร VITE

ตั้ง FRONTEND_ORIGIN ของ backend ให้ตรง URL frontend และใช้ HTTPS ทั้งสองฝั่ง แนะนำโดเมนร่วมกัน เช่น member.example.com กับ api.example.com เพื่อให้ session cookie ทำงานได้ใน browser ที่บล็อก third-party cookies

## หมายเหตุ

โลโก้อยู่ public/images/logo.png ไม่มี reset รหัสผ่านด้วยตนเอง สมาชิกติดต่อร้านให้แอดมินช่วย ตรวจเนื้อหานโยบายข้อมูลและช่องทางติดต่อก่อนใช้จริง

## หลังบ้าน

เปิด `/control-8sian-4d9c7a2e7f` เช่น http://localhost:5173/control-8sian-4d9c7a2e7f แล้ว login ด้วยบัญชีเดียวที่สร้างจากสคริปต์ backend/scripts/create-admin.mjs ไม่มีรหัสผ่านเริ่มต้นและไม่มีปุ่มสมัครแอดมิน

เปลี่ยน URL ได้ผ่าน VITE_ADMIN_PATH ใน .env แล้ว restart dev server หรือ rebuild หลัง deploy ค่านี้เป็น public config ไม่ใช่ secret ทุก API ตรวจสิทธิ์แอดมินที่ backend เสมอ ห้ามเก็บรหัสผ่านแอดมินไว้ใน VITE variables

เมนูสมาชิกใช้ค้นหา ดูประวัติ แจกคูปอง และตั้งรหัสผ่านใหม่ เมนูแคมเปญใช้สร้าง/เปิด/ปิดการแจก เมนูประวัติแสดงรายการที่แอดมินทำ Cloudflare Pages ใช้ _redirects ที่มีอยู่เพื่อรองรับการเปิด path หลังบ้านโดยตรง

.env, node_modules, dist, logs และข้อมูล credentials ถูก ignore เก็บเฉพาะ .env.example ที่ไม่มี secret

## Git repository

Repository: https://github.com/NatthawutT-07/8-sian-member-frontend

Run Git commands inside this project's directory. Production branch: main.

```sh
git add .
git commit -m "Describe your change"
git push origin main
```

Deployment uses Node.js 22 (package.json engines and .node-version).

Cloudflare Pages: select main, leave Root directory empty, set NODE_VERSION=22, build with `npm ci && npm run build`, output `dist`. Set VITE_API_URL to the public HTTPS backend origin (without /api). Redeploy after changing build variables.

Reference: https://developers.cloudflare.com/pages/configuration/build-configuration/
