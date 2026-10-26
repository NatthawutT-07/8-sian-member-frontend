import { Search } from 'lucide-react';
import Pager from './AdminPagination.jsx';
const date = (value) =>
  value
    ? new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
      }).format(new Date(value))
    : '—';
export default function AdminMemberList({
  busy,
  loadMembers,
  members,
  query,
  run,
  setQuery,
  setSearch,
  showMember,
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <h2>ค้นหาและดูแลสมาชิก</h2>
        <span>{members.total} รายการ</span>
      </div>
      <form
        className="admin-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query);
          run(() => loadMembers(1, query));
        }}
      >
        <input
          aria-label="ค้นหาสมาชิก"
          placeholder="เบอร์โทร ชื่อ นามสกุล หรือเลขสมาชิก"
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="admin-primary" disabled={busy}>
          <Search size={16} />
          ค้นหา
        </button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-responsive-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader">เลขสมาชิก</th>
              <th role="columnheader">ชื่อสมาชิก</th>
              <th role="columnheader">เบอร์โทร</th>
              <th role="columnheader">วันที่สมัคร</th>
              <th role="columnheader" />
            </tr>
          </thead>
          <tbody role="rowgroup">
            {members.members.map((m) => (
              <tr key={m.id} role="row">
                <td role="cell" data-label="เลขสมาชิก">
                  {m.memberNumber}
                </td>
                <td role="cell" data-label="ชื่อสมาชิก">
                  {m.firstName} {m.lastName}
                </td>
                <td role="cell" data-label="เบอร์โทร">
                  {m.phone}
                </td>
                <td role="cell" data-label="วันที่สมัคร">
                  {date(m.createdAt)}
                </td>
                <td role="cell" data-label="" className="admin-cell-action">
                  <button className="admin-link" onClick={() => showMember(m.id)} disabled={busy}>
                    ดูแลสมาชิก →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!members.members.length && <p className="admin-empty">ไม่พบสมาชิก</p>}
      <Pager data={members} busy={busy} onPage={(p) => run(() => loadMembers(p))} />
    </section>
  );
}
