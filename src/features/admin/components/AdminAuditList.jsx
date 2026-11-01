import { History } from 'lucide-react';
const actions = {
  MEMBER_CLAIM_COUPON: 'สมาชิกกดรับคูปอง',
  ADMIN_LOGIN: 'เข้าสู่ระบบแอดมิน',
  CREATE_ADMIN: 'สร้างแอดมิน',
  CREATE_CAMPAIGN: 'สร้างแคมเปญ',
  SET_CAMPAIGN_STATUS: 'เปลี่ยนสถานะแคมเปญ',
  GRANT_COUPON: 'แจกคูปอง',
  RESET_MEMBER_PASSWORD: 'ตั้งรหัสผ่านสมาชิกใหม่',
  CREATE_MEMBER: 'เพิ่มสมาชิกโดยแอดมิน',
  UPDATE_MEMBER: 'แก้ไขสมาชิก',
  DELETE_MEMBERS: 'ลบสมาชิกที่ไม่มีประวัติ',
  UPDATE_CAMPAIGN: 'แก้ไขแคมเปญ',
  DELETE_CAMPAIGNS: 'ลบแคมเปญ',
  REVOKE_COUPON: 'ยกเลิกสิทธิ์คูปอง',
  POS_USER_UPDATE: 'แก้ไขพนักงาน',
  POS_USER_PASSWORD: 'ตั้งรหัสผ่านพนักงาน',
  DELETE_USERS: 'ลบพนักงาน',
  DELETE_PRODUCTS: 'ลบสินค้า',
  POS_USER_CREATE: 'เพิ่มพนักงาน',
  POS_USER_STATUS: 'เปลี่ยนสถานะพนักงาน',
  POS_PRODUCT_CREATE: 'เพิ่มสินค้า',
  POS_PRODUCT_UPDATE: 'แก้ไขสินค้า',
  POS_PAID: 'รับชำระ POS',
  POS_OPEN: 'เปิดกะ',
  POS_CLOSE: 'ปิดกะ',
  POS_HARDWARE: 'สั่งอุปกรณ์ POS',
};
const date = (value) =>
  value
    ? new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
      }).format(new Date(value))
    : '—';
export default function AdminAuditList({ rows }) {
  return rows.length ? (
    <div className="admin-audits">
      {rows.map((row) => (
        <article key={row.id}>
          <History size={15} />
          <div>
            <strong>{actions[row.action] || row.action}</strong>
            <small>
              {date(row.createdAt)} ·{' '}
              {row.actor === 'owner'
                ? 'แอดมิน'
                : row.actor.startsWith('member:')
                  ? 'สมาชิก'
                  : row.actor}
            </small>
            {row.details?.reason && <p>{row.details.reason}</p>}
            {row.details?.title && <p>{row.details.title}</p>}
            {row.memberId && <small>รหัสภายในสมาชิก: {row.memberId}</small>}
            {row.details?.couponId && <small>คูปอง: {row.details.couponId}</small>}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <p className="admin-empty">ยังไม่มีประวัติการทำรายการ</p>
  );
}
