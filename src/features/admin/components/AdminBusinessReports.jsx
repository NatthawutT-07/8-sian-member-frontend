import { useEffect, useRef, useState } from 'react';
import Dialog from '../../../components/Dialog.jsx';
import Pager from './AdminPagination.jsx';

const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const money = (value) =>
  ((value || 0) / 100).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const date = (value) =>
  value ? new Date(value).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '—';
export function csvCell(value) {
  let text = String(value ?? '');
  if (typeof value !== 'number' && /^\s*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function downloadCsv(rows, file) {
  const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = file;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function AdminBusinessReports({ api }) {
  const [filter, setFilter] = useState({
    from: today(),
    to: today(),
    method: '',
    q: '',
    status: '',
  });
  const [applied, setApplied] = useState(filter),
    [view, setView] = useState('sales'),
    [summary, setSummary] = useState(null),
    [data, setData] = useState({ sales: [], shifts: [], total: 0, page: 1, pages: 0 }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [detail, setDetail] = useState(null);
  const lock = useRef(false),
    generation = useRef(0);
  async function load(page = 1, next = applied, nextView = view) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const token = ++generation.current;
    try {
      const query = new URLSearchParams({ ...next, page: String(page) });
      const [totals, rows] = await Promise.all([
        api(`/pos/reports?${query}`),
        api(`/pos/${nextView}?${query}`),
      ]);
      if (token !== generation.current) return;
      setApplied({ ...next });
      setView(nextView);
      setSummary(totals.summary);
      setData(rows);
    } catch (failure) {
      if (token === generation.current) setError(failure.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
    return () => {
      generation.current++;
    };
  }, []);
  async function open(id, kind) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      setDetail({
        kind,
        value: await api(`/pos/${kind === 'sales' ? `sales/${id}` : `shifts/${id}/report`}`),
      });
    } catch (failure) {
      setError(failure.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const exportRows = () => {
    const rows =
      view === 'sales'
        ? [
            ['เลขบิล', 'เวลาไทย', 'พนักงาน', 'ชำระ', 'สุทธิ (บาท)'],
            ...(data.sales || []).map((row) => [
              row.receiptNumber,
              date(row.createdAt),
              row.cashierDisplayName,
              row.method === 'CASH' ? 'เงินสด' : 'เงินโอน',
              row.totalSatang / 100,
            ]),
          ]
        : [
            [
              'รหัสกะ',
              'วันที่กะ',
              'เวลาเปิด',
              'เวลาปิด',
              'เงินตั้งต้น',
              'เงินสดควรมี',
              'นับจริง',
              'ส่วนต่าง',
            ],
            ...(data.shifts || []).map((row) => [
              row.id,
              row.businessDate,
              date(row.openedAt),
              date(row.closedAt),
              row.openingCashSatang / 100,
              row.expectedCashSatang == null ? '' : row.expectedCashSatang / 100,
              row.countedCashSatang == null ? '' : row.countedCashSatang / 100,
              row.cashDifferenceSatang == null ? '' : row.cashDifferenceSatang / 100,
            ]),
          ];
    downloadCsv(rows, `${view}-${applied.from}-${applied.to}-page-${data.page}.csv`);
  };
  const value = detail?.value,
    totals = detail?.kind === 'sales' ? null : value?.summary;
  return (
    <section className="admin-panel admin-business-reports">
      <h2>ยอดขายและกะ</h2>
      <p className="admin-help">
        ยอดขายนับตามเวลาชำระประเทศไทย ส่วนรายการกะกรองตามวันที่เปิดกะ เลือกได้ครั้งละไม่เกิน 93 วัน
      </p>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <form
        className="admin-report-filters"
        onSubmit={(event) => {
          event.preventDefault();
          load(1, filter);
        }}
      >
        <fieldset disabled={busy}>
          <label>
            ตั้งแต่
            <input
              type="date"
              value={filter.from}
              required
              onChange={(event) => setFilter({ ...filter, from: event.target.value })}
            />
          </label>
          <label>
            ถึง
            <input
              type="date"
              value={filter.to}
              required
              onChange={(event) => setFilter({ ...filter, to: event.target.value })}
            />
          </label>
          <label>
            การชำระ
            <select
              value={filter.method}
              onChange={(event) => setFilter({ ...filter, method: event.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">เงินโอน</option>
            </select>
          </label>
          <label>
            เลขบิล
            <input
              value={filter.q}
              maxLength={100}
              onChange={(event) => setFilter({ ...filter, q: event.target.value })}
            />
          </label>
          <label>
            สถานะกะ
            <select
              value={filter.status}
              onChange={(event) => setFilter({ ...filter, status: event.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="OPEN">เปิดอยู่</option>
              <option value="CLOSED">ปิดแล้ว</option>
            </select>
          </label>
          <button className="admin-primary">แสดงรายงาน</button>
        </fieldset>
      </form>
      {summary && (
        <div className="admin-report-stats">
          {[
            ['ยอดขายสุทธิ', summary.totalSatang],
            ['เงินสด', summary.cashSatang],
            ['เงินโอน', summary.transferSatang],
          ].map(([label, amount]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{money(amount)} บาท</strong>
            </div>
          ))}
          <div>
            <span>จำนวนบิล</span>
            <strong>{summary.billCount} บิล</strong>
          </div>
        </div>
      )}
      <div className="admin-toolbar">
        <div className="admin-row-actions">
          {[
            ['sales', 'รายการขาย'],
            ['shifts', 'กะเปิด–ปิดร้าน'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={view === key ? 'admin-primary' : 'admin-secondary'}
              disabled={busy}
              onClick={() => load(1, applied, key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="admin-secondary" disabled={busy || !data.total} onClick={exportRows}>
          ส่งออกหน้าปัจจุบัน CSV
        </button>
      </div>
      {busy && <p role="status">กำลังโหลดรายงาน…</p>}
      <p className="admin-help">
        {data.total} รายการ • ยอดสรุปด้านบนรวมการชำระทุกประเภทในช่วงวันที่ที่เลือก
      </p>
      <div className="admin-table-wrap">
        <table className="admin-responsive-table">
          <thead>
            <tr>
              {(view === 'sales'
                ? ['เลขบิล / เวลา', 'พนักงาน', 'การชำระ', 'ยอดสุทธิ', 'รายละเอียด']
                : ['วันที่กะ / เวลาเปิด', 'เวลาปิด', 'จำนวนบิล', 'เงินสดขาด–เกิน', 'รายละเอียด']
              ).map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view === 'sales'
              ? (data.sales || []).map((sale) => (
                  <tr key={sale.id}>
                    <td data-label="บิล">
                      {sale.receiptNumber}
                      <small>{date(sale.createdAt)}</small>
                    </td>
                    <td data-label="พนักงาน">{sale.cashierDisplayName || 'ไม่ระบุ'}</td>
                    <td data-label="การชำระ">{sale.method === 'CASH' ? 'เงินสด' : 'เงินโอน'}</td>
                    <td data-label="ยอดสุทธิ">{money(sale.totalSatang)}</td>
                    <td>
                      <button
                        className="admin-link"
                        disabled={busy}
                        onClick={() => open(sale.id, 'sales')}
                      >
                        ดูบิล
                      </button>
                    </td>
                  </tr>
                ))
              : (data.shifts || []).map((shift) => (
                  <tr key={shift.id}>
                    <td data-label="กะ">
                      {shift.businessDate}
                      <small>{date(shift.openedAt)}</small>
                    </td>
                    <td data-label="เวลาปิด">{date(shift.closedAt)}</td>
                    <td data-label="จำนวนบิล">{shift._count?.sales || 0}</td>
                    <td data-label="ส่วนต่าง">
                      {shift.cashDifferenceSatang == null
                        ? 'กะเปิดอยู่'
                        : money(shift.cashDifferenceSatang)}
                    </td>
                    <td>
                      <button
                        className="admin-link"
                        disabled={busy || !shift.closedAt}
                        onClick={() => open(shift.id, 'shifts')}
                      >
                        ดูสรุปกะ
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!busy && !data.total && <p className="admin-empty">ไม่พบรายการในช่วงที่เลือก</p>}
      <Pager data={data} busy={busy} onPage={(page) => load(page)} />
      {detail && (
        <Dialog
          label={detail.kind === 'sales' ? 'รายละเอียดบิล' : 'สรุปกะ'}
          className="admin-record-dialog"
          onClose={() => setDetail(null)}
        >
          <h2>
            {detail.kind === 'sales'
              ? `บิล ${value.receiptNumber}`
              : `สรุปกะ ${value.shift.businessDate}`}
          </h2>
          {detail.kind === 'sales' ? (
            <p>
              เวลา {date(value.createdAt)} • พนักงาน {value.cashierDisplayName || 'ไม่ระบุ'} •{' '}
              {value.method === 'CASH' ? 'เงินสด' : 'เงินโอน'}
            </p>
          ) : (
            <>
              <p>
                เปิด {date(value.shift.openedAt)} โดย {value.shift.openedByName}
                <br />
                ปิด {date(value.shift.closedAt)} โดย {value.shift.closedByName}
              </p>
              <div className="admin-report-stats">
                <div>
                  เงินสด<strong>{money(totals.cashSatang)}</strong>
                </div>
                <div>
                  เงินโอน<strong>{money(totals.transferSatang)}</strong>
                </div>
                <div>
                  รวม<strong>{money(totals.totalSatang)}</strong>
                </div>
              </div>
            </>
          )}
          <table className="admin-detail-table">
            <thead>
              <tr>
                <th>รายการ</th>
                <th>จำนวน</th>
                <th>ยอด</th>
              </tr>
            </thead>
            <tbody>
              {value.items.map((item, index) => (
                <tr key={`${item.productId}-${index}`}>
                  <td>
                    {item.name}
                    <small>@ {money(item.priceSatang)}</small>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{money(item.totalSatang ?? item.priceSatang * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>ส่วนลดคูปอง {money(totals?.discountSatang ?? value.discountSatang)} บาท</p>
          <p>
            <strong>ยอดสุทธิ {money(totals?.totalSatang ?? value.totalSatang)} บาท</strong>
          </p>
          {detail.kind === 'shifts' && (
            <p>
              เงินสดตั้งต้น {money(value.shift.openingCashSatang)} • ควรมี{' '}
              {money(value.shift.expectedCashSatang)}
              <br />
              นับจริง {money(value.shift.countedCashSatang)} • ขาด–เกิน{' '}
              {money(value.shift.cashDifferenceSatang)} บาท
            </p>
          )}
          <button className="admin-secondary" onClick={() => setDetail(null)}>
            ปิด
          </button>
        </Dialog>
      )}
    </section>
  );
}
