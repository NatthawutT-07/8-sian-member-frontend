import { History } from 'lucide-react';
const actions = {
  MEMBER_CLAIM_COUPON: 'สมาชิกกดรับคูปอง',
  ADMIN_LOGIN: 'เข้าสู่ระบบแอดมิน',
  CREATE_ADMIN: 'สร้างแอดมิน',
  CREATE_CAMPAIGN: 'สร้างแคมเปญ',
  SET_CAMPAIGN_STATUS: 'เปลี่ยนสถานะแคมเปญ',
  GRANT_COUPON: 'แจกคูปอง',
  RESET_MEMBER_PASSWORD: 'ตั้งรหัสผ่านสมาชิกใหม่',
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
