import AuditRows from './AdminAuditList.jsx';
import Pager from './AdminPagination.jsx';

export default function AdminAuditPanel({ api, audit, busy, run, setAudit }) {
  return (
    <section className="admin-panel">
      <h2>ประวัติการทำรายการในระบบ</h2>
      <p className="admin-help">
        แสดงการเข้าสู่ระบบ การสร้าง/แจก/รับคูปอง และการตั้งรหัสผ่านใหม่ โดยไม่บันทึกรหัสผ่าน
      </p>
      <AuditRows rows={audit.audits} />
      <Pager
        data={audit}
        busy={busy}
        onPage={(page) => run(async () => setAudit(await api(`/audits?page=${page}`)))}
      />
    </section>
  );
}
