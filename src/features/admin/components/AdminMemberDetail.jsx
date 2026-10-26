import { ArrowLeft, KeyRound, Gift } from 'lucide-react';
import AuditRows from './AdminAuditList.jsx';
const statusText = {
  USED: 'ใช้แล้ว',
  EXPIRED: 'หมดอายุ',
  AVAILABLE: 'พร้อมใช้',
  LOCKED: 'ยังไม่ปลดล็อก',
};
const date = (value) =>
  value
    ? new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
      }).format(new Date(value))
    : '—';
export default function AdminMemberDetail({
  busy,
  campaigns,
  detail,
  grant,
  grantConfirm,
  issue,
  reset,
  resetOpen,
  resetPassword,
  setDetail,
  setGrant,
  setGrantConfirm,
  setReset,
  setResetOpen,
}) {
  return (
    <>
      <button
        className="admin-back admin-back-button"
        onClick={() => setDetail(null)}
        disabled={busy}
      >
        <ArrowLeft size={15} /> กลับรายการสมาชิก
      </button>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">{detail.member.memberNumber}</span>
            <h2>
              {detail.member.firstName} {detail.member.lastName}
            </h2>
            <p>
              เบอร์ {detail.member.phone} · วันเกิด{' '}
              {detail.member.birthDate
                ? new Date(detail.member.birthDate).toLocaleDateString('th-TH', {
                    timeZone: 'UTC',
                  })
                : 'ยังไม่ระบุ'}
            </p>
          </div>
          <button
            className="admin-secondary"
            onClick={() => setResetOpen(!resetOpen)}
            disabled={busy}
          >
            <KeyRound size={16} /> ตั้งรหัสผ่านใหม่
          </button>
        </div>
        {resetOpen && (
          <form className="admin-reset" onSubmit={resetPassword}>
            <h3>ช่วยเหลือสมาชิกที่ลืมรหัสผ่าน</h3>
            <p>
              ตรวจสอบตัวตนเจ้าของบัญชีก่อนดำเนินการ เมื่อบันทึกแล้ว สมาชิกจะออกจากระบบทุกอุปกรณ์
            </p>
            <fieldset disabled={busy}>
              <div className="admin-form-grid">
                <label>
                  รหัสผ่านใหม่ของสมาชิก
                  <input
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                    value={reset.newPassword}
                    onChange={(e) =>
                      setReset({
                        ...reset,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  ยืนยันรหัสผ่านใหม่
                  <input
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                    value={reset.confirm}
                    onChange={(e) =>
                      setReset({
                        ...reset,
                        confirm: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  รหัสผ่านของแอดมินเพื่อยืนยัน
                  <input
                    type="password"
                    autoComplete="off"
                    maxLength={128}
                    required
                    value={reset.adminPassword}
                    onChange={(e) =>
                      setReset({
                        ...reset,
                        adminPassword: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  เหตุผล / วิธีตรวจสอบตัวตน
                  <input
                    minLength={5}
                    maxLength={300}
                    placeholder="ห้ามใส่รหัสผ่านในช่องนี้"
                    required
                    value={reset.reason}
                    onChange={(e) =>
                      setReset({
                        ...reset,
                        reason: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <button className="admin-primary" disabled={busy}>
                <KeyRound size={16} /> ยืนยันตั้งรหัสผ่านใหม่
              </button>
            </fieldset>
          </form>
        )}
        <form className="admin-grant" onSubmit={issue}>
          <div>
            <h3>
              <Gift size={18} /> แจกคูปองให้สมาชิกนี้
            </h3>
            <p>แคมเปญเดียวกันแจกได้ครั้งเดียว แม้เคยใช้หรือหมดอายุแล้ว</p>
          </div>
          <div className="admin-grant-fields">
            <select
              aria-label="เลือกคูปอง"
              required
              value={grant}
              onChange={(e) => {
                setGrant(e.target.value);
                setGrantConfirm(false);
              }}
              disabled={busy}
            >
              <option value="">เลือกแคมเปญคูปอง</option>
              {campaigns
                .filter((c) => c.active)
                .map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={
                      detail.coupons.some((item) => item.campaignId === c.id) ||
                      Boolean(
                        c.prerequisiteCampaignId &&
                        !(detail.usedCampaignIds || []).includes(c.prerequisiteCampaignId),
                      )
                    }
                  >
                    {c.title} · {c.validityDays} วัน
                    {detail.coupons.some((item) => item.campaignId === c.id) ? ' (รับแล้ว)' : ''}
                    {c.prerequisiteCampaignId &&
                    !(detail.usedCampaignIds || []).includes(c.prerequisiteCampaignId)
                      ? ` (ต้องใช้ ${c.prerequisite?.title || 'คูปองก่อนหน้า'} ก่อน)`
                      : ''}
                  </option>
                ))}
            </select>
            <button className="admin-primary" disabled={busy || !grant}>
              <Gift size={16} />
              {grantConfirm ? 'ยืนยันแจกคูปอง' : 'แจกคูปอง'}
            </button>
          </div>
          {grantConfirm && (
            <div className="admin-grant-confirm" role="status">
              ยืนยันแจก “{campaigns.find((c) => c.id === grant)?.title}” ให้คุณ
              {detail.member.firstName} {detail.member.lastName} ({detail.member.phone})
              กรุณาตรวจสอบก่อนกดยืนยัน
            </div>
          )}
        </form>
        <h3>ประวัติคูปองของสมาชิก</h3>
        <div className="admin-table-wrap">
          <table className="admin-responsive-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader">คูปอง</th>
                <th role="columnheader">สถานะ</th>
                <th role="columnheader">วันที่ได้รับ</th>
                <th role="columnheader">หมดอายุ</th>
                <th role="columnheader">วันที่ใช้</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {detail.coupons.map((c) => (
                <tr key={c.id} role="row">
                  <td role="cell" data-label="คูปอง">
                    {c.title}
                  </td>
                  <td role="cell" data-label="สถานะ">
                    <span className={`admin-badge ${c.status.toLowerCase()}`}>
                      {statusText[c.status]}
                    </span>
                  </td>
                  <td role="cell" data-label="วันที่ได้รับ">
                    {date(c.issuedAt)}
                  </td>
                  <td role="cell" data-label="หมดอายุ">
                    {date(c.expiresAt)}
                  </td>
                  <td role="cell" data-label="วันที่ใช้">
                    {date(c.usedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!detail.coupons.length && <p className="admin-empty">สมาชิกยังไม่ได้รับคูปอง</p>}
        <h3>ประวัติการดูแลบัญชีล่าสุด</h3>
        <AuditRows rows={detail.audits} />
      </section>
    </>
  );
}
