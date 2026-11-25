export default function SalesReportFilters({ filter, setFilter, busy, onApply, children }) {
  return <form className="sales-report-filters" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
    <fieldset disabled={busy}>
      <label>ตั้งแต่วันที่<input required type="date" value={filter.from} max={filter.to} onChange={(event) => setFilter({ ...filter, from: event.target.value })} /></label>
      <label>ถึงวันที่<input required type="date" value={filter.to} min={filter.from} onChange={(event) => setFilter({ ...filter, to: event.target.value })} /></label>
      {children}
      <button className="admin-primary" type="submit">แสดงข้อมูล</button>
    </fieldset>
  </form>;
}
