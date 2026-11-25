import { useState } from 'react';
import { ArrowUpRight, Banknote, ReceiptText, ShoppingBag, Wallet } from 'lucide-react';
import { reportToday, reportMoney as money, useSalesReport } from './sales-report.js';
import SalesReportFilters from './SalesReportFilters.jsx';
import './sales-reports.css';

export function SalesDashboardContent({ data }) {
  const { summary, daily, products } = data;
  const max = Math.max(1, ...daily.map((day) => day.totalSatang));
  const cashPercent = summary.totalSatang ? Math.round(summary.cashSatang / summary.totalSatang * 100) : 0;
  return <>
    <div className="sales-kpis">
      {[
        ['ยอดขายสุทธิ', `฿${money(summary.totalSatang)}`, 'หลังส่วนลดคูปอง', Wallet],
        ['บิลที่ชำระแล้ว', summary.billCount.toLocaleString('th-TH'), 'บิลในช่วงวันที่เลือก', ReceiptText],
        ['ยอดเฉลี่ยต่อบิล', `฿${money(summary.averageBillSatang)}`, 'ยอดสุทธิ ÷ จำนวนบิล', ArrowUpRight],
        ['จำนวนสินค้าที่ขาย', summary.soldQuantity.toLocaleString('th-TH'), 'หน่วย · ไม่รวมรายการส่วนลด', ShoppingBag],
      ].map(([label, value, note, Icon]) => <div className="sales-kpi" key={label}>
        <div><span>{label}</span><Icon size={19} aria-hidden="true" /></div><strong>{value}</strong><small>{note}</small>
      </div>)}
    </div>
    {!summary.billCount && <p className="admin-empty">ยังไม่มีบิลที่ชำระแล้วในช่วงวันที่เลือก</p>}
    <div className="sales-dashboard-panels">
      <section className="sales-card">
        <div className="sales-card-heading"><div><h3>แนวโน้มยอดขายรายวัน</h3><p>ยอดสุทธิ • ตามวันชำระประเทศไทย</p></div><span>{daily.length} วัน</span></div>
        <div className="sales-chart-scroll" tabIndex={0} aria-label="กราฟยอดขายรายวัน เลื่อนแนวนอนเพื่อดูครบทุกวัน">
          <div className="sales-bar-chart" style={{ minWidth: `${Math.max(320, daily.length * 62)}px` }}>
            {daily.map((day) => <div className="sales-chart-column" key={day.date}>
              <span className="sales-chart-value">{money(day.totalSatang)}</span>
              <div className="sales-chart-track"><div className="sales-chart-bar" style={{ height: `${day.totalSatang / max * 100}%` }} title={`${day.date}: ${money(day.totalSatang)} บาท · ${day.billCount} บิล`} /></div>
              <span>{day.date.slice(8)}/{day.date.slice(5, 7)}</span>
              <small>{day.billCount} บิล</small>
            </div>)}
          </div>
        </div>
      </section>
      <section className="sales-card sales-payment-card">
        <h3>สัดส่วนการรับชำระ</h3><p>เงินสดเป็นยอดสุทธิหลังทอน</p>
        <div className="sales-payment-line"><Banknote size={20} /><span>เงินสด</span><strong>฿{money(summary.cashSatang)}</strong></div>
        <div className="sales-payment-line"><Wallet size={20} /><span>เงินโอน</span><strong>฿{money(summary.transferSatang)}</strong></div>
        <div className="sales-payment-bar" role="img" aria-label={`เงินสด ${cashPercent}% เงินโอน ${summary.totalSatang ? 100 - cashPercent : 0}%`}><span style={{ width: `${cashPercent}%` }} /></div>
        <p>บิลสด + โอน แยกยอดตามจำนวนที่รับจริง</p>
        <dl className="sales-totals"><div><dt>ยอดก่อนคูปอง</dt><dd>฿{money(summary.subtotalSatang)}</dd></div><div><dt>ส่วนลดคูปอง</dt><dd>฿{money(summary.discountSatang)}</dd></div></dl>
      </section>
    </div>
    <section className="sales-card">
      <div className="sales-card-heading"><div><h3>ขายอะไรไปบ้าง</h3><p>รวมทุกบิลในช่วงวันที่เลือก เรียงตามยอดขายสินค้า</p></div><span>{products.length} รายการ</span></div>
      <div className="sales-table-scroll"><table className="sales-flat-table">
        <thead><tr><th>สินค้า / รายการ</th><th className="numeric">ราคาต่อหน่วย</th><th className="numeric">จำนวนที่ขาย</th><th className="numeric">ยอดรวม</th></tr></thead>
        <tbody>{products.map((item, index) => <tr key={`${item.productId}-${item.priceSatang}-${index}`}>
          <td>{item.name}{item.priceSatang < 0 && <span className="sales-badge">ส่วนลด</span>}</td><td className="numeric">{money(item.priceSatang)}</td><td className="numeric">{item.quantity.toLocaleString('th-TH')}</td><td className="numeric"><strong>{money(item.totalSatang)}</strong></td>
        </tr>)}</tbody>
        {products.length > 0 && <tfoot><tr><th colSpan={3}>รวมรายการก่อนส่วนลดคูปอง</th><th className="numeric">{money(products.reduce((total, item) => total + item.totalSatang, 0))}</th></tr></tfoot>}
      </table></div>
      {!products.length && <p className="admin-empty">ไม่มีสินค้าที่ขายในช่วงนี้</p>}
      <p className="sales-note">ยอดสินค้าเป็นยอดก่อนส่วนลดคูปอง รายการที่เคยเปลี่ยนชื่อหรือราคาแสดงแยกตามข้อมูล ณ วันที่ขาย</p>
    </section>
  </>;
}

export default function AdminSalesDashboard({ api }) {
  const [filter, setFilter] = useState(() => ({ from: reportToday(), to: reportToday() }));
  const [applied, setApplied] = useState(filter);
  const { data, busy, error, reload } = useSalesReport(api, `/pos/dashboard?${new URLSearchParams(applied)}`);
  return <section className="admin-panel sales-report-page" aria-busy={busy}>
    <div className="sales-page-heading"><div><div className="eyebrow">SALES OVERVIEW</div><h2>แดชบอร์ดยอดขาย</h2><p>มองภาพรวมรายได้และสินค้าที่ขายในช่วงเวลาที่เลือก</p></div><button className="admin-secondary" disabled={busy} onClick={reload}>รีเฟรช</button></div>
    <SalesReportFilters filter={filter} setFilter={setFilter} busy={busy} onApply={() => { setApplied({ ...filter }); reload(); }} />
    <p className="sales-note">เลือกได้ไม่เกิน 93 วัน • นับเฉพาะบิลชำระสำเร็จตามเวลาไทย</p>
    {busy && <p role="status">กำลังโหลดแดชบอร์ด…</p>}
    {error && <p className="admin-error" role="alert">{error}</p>}
    {data && <SalesDashboardContent data={data} />}
  </section>;
}
