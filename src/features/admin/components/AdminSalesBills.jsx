import { useEffect, useRef, useState } from 'react';
import Dialog from '../../../components/Dialog.jsx';
import Pager from './AdminPagination.jsx';
import SalesReportFilters from './SalesReportFilters.jsx';
import { reportToday, reportMoney as money, reportDate, paymentLabel, useSalesReport } from './sales-report.js';
import './sales-reports.css';

export function SalesBillsTable({ sales, onOpen, busy }) {
  return <div className="sales-table-scroll" tabIndex={0} aria-label="รายการบิลหนึ่งบิลต่อหนึ่งแถว เลื่อนแนวนอนเพื่อดูครบทุกคอลัมน์">
    <table className="sales-flat-table sales-bills-table">
      <thead><tr><th>เลขบิล</th><th>วัน / เวลาชำระ</th><th>โต๊ะ</th><th>รายการที่ขาย</th><th className="numeric">จำนวน</th><th>ชำระ</th><th className="numeric">ยอดสุทธิ</th><th>พนักงาน</th><th>รายละเอียด</th></tr></thead>
      <tbody>{sales.map((sale) => {
        const items = sale.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ');
        return <tr key={sale.id}>
          <td><strong>{sale.receiptNumber}</strong></td><td>{reportDate(sale.createdAt)}</td><td>{sale.tableNumber ?? '—'}</td>
          <td><span className="sales-bill-items" title={items}>{items || '—'}</span></td>
          <td className="numeric">{sale.items.filter((item) => item.priceSatang >= 0).reduce((total, item) => total + item.quantity, 0)}</td>
          <td><span className={`sales-badge payment-${sale.method.toLowerCase()}`}>{paymentLabel(sale.method)}</span></td>
          <td className="numeric"><strong>฿{money(sale.totalSatang)}</strong></td><td>{sale.cashierDisplayName || 'ไม่ระบุ'}</td>
          <td><button type="button" className="admin-link" disabled={busy} aria-label={`ดูบิล ${sale.receiptNumber}`} onClick={() => onOpen(sale.id)}>ดูบิล</button></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export default function AdminSalesBills({ api }) {
  const [filter, setFilter] = useState(() => ({ from: reportToday(), to: reportToday(), method: '', q: '' }));
  const [applied, setApplied] = useState(filter);
  const [page, setPage] = useState(1);
  const { data, busy, error, reload } = useSalesReport(api, `/pos/sales?${new URLSearchParams({ ...applied, page: String(page) })}`);
  const [detail, setDetail] = useState(null), [detailBusy, setDetailBusy] = useState(false), [detailError, setDetailError] = useState('');
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  async function open(id) {
    const version = ++generation.current;
    setDetailBusy(true); setDetailError('');
    try {
      const sale = await api(`/pos/sales/${id}`);
      if (version === generation.current) setDetail(sale);
    } catch (failure) { if (version === generation.current) setDetailError(failure.message); }
    finally { if (version === generation.current) setDetailBusy(false); }
  }
  return <section className="admin-panel sales-report-page" aria-busy={busy}>
    <div className="sales-page-heading"><div><div className="eyebrow">PAID RECEIPTS</div><h2>รายการบิลขาย</h2><p>หนึ่งบิลต่อหนึ่งแถว ตรวจยอดและเปิดดูรายการที่ขายได้ทันที</p></div><button className="admin-secondary" disabled={busy} onClick={reload}>รีเฟรช</button></div>
    <SalesReportFilters filter={filter} setFilter={setFilter} busy={busy} onApply={() => { setApplied({ ...filter }); setPage(1); reload(); }}>
      <label>วิธีชำระ<select value={filter.method} onChange={(event) => setFilter({ ...filter, method: event.target.value })}><option value="">ทั้งหมด</option><option value="CASH">เงินสด</option><option value="TRANSFER">เงินโอน</option><option value="MIXED">เงินสด + เงินโอน</option></select></label>
      <label>ค้นหาเลขบิล<input type="search" placeholder="เลขบิลที่ต้องการค้นหา" maxLength={100} value={filter.q} onChange={(event) => setFilter({ ...filter, q: event.target.value })} /></label>
    </SalesReportFilters>
    <p className="sales-note">เลือกได้ไม่เกิน 93 วัน • เวลาไทย • จอแคบเลื่อนตารางไปทางขวาได้</p>
    {(error || detailError) && <p className="admin-error" role="alert">{error || detailError}</p>}
    {busy && <p role="status">กำลังโหลดรายการบิล…</p>}
    {detailBusy && <p role="status">กำลังโหลดรายละเอียดบิล…</p>}
    {data && <>
      <div className="sales-list-summary"><strong>{data.total.toLocaleString('th-TH')} บิล</strong><span>วันที่ {applied.from} ถึง {applied.to}</span><span>หน้า {data.page} / {Math.max(1, data.pages)}</span></div>
      <SalesBillsTable sales={data.sales} onOpen={open} busy={detailBusy} />
      {!data.total && <p className="admin-empty">ไม่พบบิลตามเงื่อนไขที่เลือก</p>}
      <Pager data={data} busy={busy} onPage={setPage} />
    </>}
    {detail && <Dialog label={`รายละเอียดบิล ${detail.receiptNumber}`} className="admin-record-dialog sales-bill-dialog" onClose={() => setDetail(null)}>
      <h2>บิล {detail.receiptNumber}</h2>
      <p>{reportDate(detail.createdAt)} · โต๊ะ {detail.tableNumber ?? '—'} · {detail.cashierDisplayName || 'ไม่ระบุ'}</p>
      <p><span className="sales-badge">{paymentLabel(detail.method)}</span></p>
      <div className="sales-table-scroll"><table className="sales-flat-table"><thead><tr><th>รายการ</th><th className="numeric">ราคา</th><th className="numeric">จำนวน</th><th className="numeric">รวม</th></tr></thead>
        <tbody>{detail.items.map((item, index) => <tr key={`${item.productId}-${index}`}><td>{item.name}</td><td className="numeric">{money(item.priceSatang)}</td><td className="numeric">{item.quantity}</td><td className="numeric">{money(item.priceSatang * item.quantity)}</td></tr>)}</tbody></table></div>
      <dl className="sales-totals">
        <div><dt>ก่อนส่วนลดคูปอง</dt><dd>฿{money(detail.subtotalSatang ?? detail.totalSatang + (detail.discountSatang || 0))}</dd></div>
        <div><dt>ส่วนลดคูปอง</dt><dd>฿{money(detail.discountSatang)}</dd></div>
        <div className="sales-total-net"><dt>ยอดสุทธิ</dt><dd>฿{money(detail.totalSatang)}</dd></div>
        {detail.method !== 'TRANSFER' && <div><dt>เงินสดที่รับ</dt><dd>฿{money(detail.receivedSatang - (detail.transferSatang || 0))}</dd></div>}
        {detail.method !== 'CASH' && <div><dt>เงินโอน</dt><dd>฿{money(detail.method === 'MIXED' ? detail.transferSatang : detail.totalSatang)}</dd></div>}
        {detail.method !== 'TRANSFER' && <div><dt>เงินทอน</dt><dd>฿{money(detail.changeSatang)}</dd></div>}
      </dl>
      <button className="admin-secondary" onClick={() => setDetail(null)}>ปิด</button>
    </Dialog>}
  </section>;
}
