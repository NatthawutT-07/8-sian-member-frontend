import { useEffect, useState } from 'react';
import { createTableQr, createTableQrDownload } from '../lib/table-qr.js';

export default function OrderingTables({ tables, busy, onAdd }) {
  const [selected, setSelected] = useState('');
  const [range, setRange] = useState({ from: 1, to: 10 });
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const table = tables.find((item) => item.id === selected) || tables[0];
  useEffect(() => {
    let cancelled = false;
    setQr(null);
    setError('');
    if (table)
      (async () => {
        try {
          const image = await createTableQr(table.url);
          const downloadImage = await createTableQrDownload(image, table.number);
          if (!cancelled) setQr({ image, downloadImage });
        } catch {
          if (!cancelled)
            setError('สร้าง QR ไม่สำเร็จ กรุณาเลือกโต๊ะใหม่หรือลองโหลดข้อมูลอีกครั้ง');
        }
      })();
    return () => {
      cancelled = true;
    };
  }, [table?.id, table?.url, table?.number]);
  return (
    <section className="ordering-admin-panel">
      <div className="ordering-panel-heading">
        <div>
          <h3>โต๊ะ / QR ประจำโต๊ะ</h3>
          <p>เลือกดูและดาวน์โหลดทีละโต๊ะ • ทั้งหมด {tables.length} โต๊ะ</p>
        </div>
      </div>
      {table ? (
        <div className="ordering-table-picker">
          <div>
            <label>
              เลือกโต๊ะ
              <select value={table.id} onChange={(event) => setSelected(event.target.value)}>
                {tables.map((item) => (
                  <option key={item.id} value={item.id}>
                    โต๊ะ {item.number} —{' '}
                    {item.sessionId
                      ? item.orderingEnabled
                        ? 'เปิดสั่งอาหาร'
                        : 'รอเลือกโซน'
                      : 'ปิดสั่งอาหาร'}
                  </option>
                ))}
              </select>
            </label>
            <p>เปิดสั่งอาหารหลังรับชำระสำเร็จและยืนยันโซนใน POS</p>
            {qr && (
              <div className="ordering-inline-actions">
                <a
                  className="admin-secondary"
                  download={`table-${table.number}-qr.png`}
                  href={qr.downloadImage}
                >
                  ดาวน์โหลด QR โต๊ะ {table.number}
                </a>
                <a href={table.url} target="_blank" rel="noreferrer">
                  เปิดหน้าโต๊ะ
                </a>
              </div>
            )}
          </div>
          <div className="ordering-table-preview" aria-live="polite">
            <strong>โต๊ะ {table.number}</strong>
            {qr ? (
              <img
                src={qr.image}
                alt={`QR สั่งอาหารโต๊ะ ${table.number}`}
                width="160"
                height="160"
              />
            ) : (
              <p>{error || 'กำลังสร้าง QR…'}</p>
            )}
          </div>
        </div>
      ) : (
        <p>ยังไม่มีโต๊ะ เพิ่มหมายเลขโต๊ะก่อนเริ่มใช้งาน</p>
      )}
      <details className="ordering-add-tables">
        <summary>เพิ่มโต๊ะใหม่</summary>
        <p>เพิ่มครั้งละไม่เกิน 200 โต๊ะ หมายเลขเดิมจะใช้ QR เดิมเสมอ</p>
        <form
          className="ordering-admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            onAdd(range);
          }}
        >
          <label>
            ตั้งแต่โต๊ะ
            <input
              type="number"
              min="1"
              max="9999"
              required
              value={range.from}
              onChange={(event) => setRange({ ...range, from: Number(event.target.value) })}
            />
          </label>
          <label>
            ถึงโต๊ะ
            <input
              type="number"
              min={range.from}
              max={Math.min(9999, range.from + 199)}
              required
              value={range.to}
              onChange={(event) => setRange({ ...range, to: Number(event.target.value) })}
            />
          </label>
          <button className="admin-primary" disabled={busy}>
            เพิ่มโต๊ะ
          </button>
        </form>
      </details>
    </section>
  );
}
