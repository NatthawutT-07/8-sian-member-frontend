export default function AdminSummary({ overview }) {
  return (
    <section className="admin-stats">
      {[
        ['members', 'สมาชิกทั้งหมด'],
        ['campaigns', 'แคมเปญ'],
        ['issued', 'แจกแล้ว'],
        ['available', 'พร้อมใช้'],
        ['used', 'ใช้แล้ว'],
        ['expired', 'หมดอายุ'],
      ].map(([key, label]) => (
        <div key={key}>
          <span>{label}</span>
          <strong>{overview?.[key] ?? '—'}</strong>
        </div>
      ))}
    </section>
  );
}
