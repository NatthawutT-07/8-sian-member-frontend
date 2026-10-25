# โครงสร้าง Frontend

```text
frontend/
├── src/
│   ├── main.jsx                  # React entry point และลำดับ CSS หลัก
│   ├── app/App.jsx               # เลือกหน้าแรก หน้าสมาชิก หรือหลังบ้าน
│   ├── pages/LandingPage.jsx     # หน้าแนะนำร้าน สิทธิพิเศษ FAQ และนโยบาย
│   ├── components/BrandLogo.jsx  # โลโก้ที่ใช้ร่วมกันทุกหน้า
│   ├── config/routes.js          # Path หลังบ้านแอดมิน
│   ├── lib/api.js                # HTTP client, cookie, error และ retry time
│   ├── styles/
│   │   ├── global.css            # สี ฟอนต์ layout และรูปแบบพื้นฐาน
│   │   └── compact.css           # ระยะห่างและขนาดแบบกระชับ ใช้หลัง CSS อื่น
│   └── features/
│       ├── auth/
│       │   ├── MemberForm.jsx    # สมัคร 2 ขั้นตอนและ login
│       │   └── auth.css
│       ├── member/
│       │   ├── MemberDashboard.jsx  # ประกอบหน้าสมาชิกจาก components
│       │   ├── dashboard.css
│       │   ├── hooks/useMemberDashboard.js # โหลดข้อมูล รับคูปอง และตรวจสถานะบาร์โค้ด
│       │   └── components/         # บัตร คูปอง แคมเปญ แท็บ และ dialogs
│       └── admin/
│           ├── AdminPage.jsx     # ประกอบหน้าหลังบ้านและเลือกเมนู
│           ├── admin.css
│           ├── hooks/useAdminConsole.js # session ข้อมูลและคำสั่งหลังบ้าน
│           └── components/       # login สมาชิก แคมเปญ ประวัติ และ pagination
├── public/
│   ├── images/logo.png           # โลโก้โปร่งใสที่หน้าเว็บใช้งาน
│   ├── _headers                  # HTTP headers สำหรับ Cloudflare Pages
│   └── _redirects                # SPA fallback สำหรับ path หลังบ้าน
├── scripts/
│   ├── check-barcode.mjs         # ตรวจการเข้ารหัส CODE128-C
│   └── check-views.mjs           # ตรวจ render components ที่แยกออกมา
├── docs/                        # เอกสารสำหรับผู้พัฒนา
├── .env.example
└── README.md
```

## จะปรับอะไร ให้เริ่มที่ไหน

| งาน | ไฟล์หลัก |
|---|---|
| ข้อความหน้าแรก ปุ่มลัด login FAQ | src/pages/LandingPage.jsx |
| เพิ่มหน้าใหม่หรือเปลี่ยนการสลับหน้า | src/app/App.jsx |
| เพิ่ม/แก้ช่องสมัครและ login | src/features/auth/MemberForm.jsx |
| หน้าโหลดและรูปแบบฟอร์ม | src/features/auth/auth.css |
| จัดเรียงองค์ประกอบหน้าสมาชิก | src/features/member/MemberDashboard.jsx |
| รูปการ์ดคูปอง | src/features/member/components/CouponCard.jsx |
| ปุ่มแท็บคูปอง | src/features/member/components/CouponTabs.jsx |
| รายการแคมเปญกดรับ | src/features/member/components/CampaignPanel.jsx |
| กล่องเปิดบาร์โค้ด | src/features/member/components/CouponBarcodeDialog.jsx |
| รับคูปอง ตรวจสถานะ และเชื่อม API สมาชิก | src/features/member/hooks/useMemberDashboard.js |
| รูปแบบบาร์โค้ด | src/features/member/components/CouponBarcode.jsx |
| จัดเรียงและเลือกเมนูหลังบ้าน | src/features/admin/AdminPage.jsx |
| ค้นหาและรายการสมาชิก | src/features/admin/components/AdminMemberList.jsx |
| ข้อมูลสมาชิก แจกคูปอง และแบบฟอร์มแก้รหัสผ่าน | src/features/admin/components/AdminMemberDetail.jsx |
| แบบฟอร์มและรายการแคมเปญ | src/features/admin/components/AdminCampaigns.jsx |
| รายการประวัติและแบ่งหน้า | src/features/admin/components/AdminAuditList.jsx และ AdminPagination.jsx |
| คำสั่ง API/session หลังบ้าน | src/features/admin/hooks/useAdminConsole.js |
| สีและรูปแบบพื้นฐาน | src/styles/global.css |
| ลด/เพิ่มระยะห่างและขนาดร่วมทุกหน้า | src/styles/compact.css |
| เปลี่ยนรูปโลโก้ | public/images/logo.png |
| เปลี่ยน path รูปโลโก้ | src/components/BrandLogo.jsx |
| เปลี่ยน URL หลังบ้าน | .env ตัวแปร VITE_ADMIN_PATH |

## แนวทางเพิ่มโค้ด

Component ที่ใช้เฉพาะฟีเจอร์ให้วางใน features/ชื่อฟีเจอร์/components ส่วนที่ใช้หลายฟีเจอร์จึงย้ายมา components ที่ src รูปแบบเฉพาะฟีเจอร์เก็บไว้ข้างฟีเจอร์นั้น ไม่เพิ่มทุกอย่างลง global.css

หน้าหลักของแต่ละฟีเจอร์ใช้ประกอบ components ส่วน hooks รับผิดชอบ state, API และผลข้างเคียง จึงปรับหน้าตาการ์ดหรือแบบฟอร์มได้โดยไม่ต้องอ่าน logic การเชื่อมต่อทั้งหมด และปรับ API ได้จาก hook โดยไม่แก้ markup ทุกส่วน

เรียก backend ผ่าน lib/api.js เพื่อใช้ cookie, timeout และ error format เดียวกัน ไม่ใส่กฎคำนวณราคาหรือสิทธิ์สำคัญไว้เฉพาะ frontend

ลำดับ CSS ใน main.jsx มีผลต่อหน้าตาปัจจุบัน global.css มาก่อน compact.css ซึ่งใช้ปรับขนาด/ระยะห่าง อย่าสลับลำดับโดยไม่ตรวจผล

## คำสั่งจากโฟลเดอร์ frontend

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
npm.cmd run check:barcode
npm.cmd run check:views
```

โลโก้และ .env คงอยู่ตำแหน่งเดิม ไฟล์ dist เป็นผล build ไม่แก้ไฟล์ภายในโดยตรง และไม่เก็บใน Git
