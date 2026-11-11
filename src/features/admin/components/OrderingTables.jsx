import { useEffect, useState } from 'react';
import { createTableQr, createTableQrDownload } from '../lib/table-qr.js';

export default function OrderingTables({ tables, busy, onAdd, onSaveQrHours }) {
  const [selected, setSelected] = useState('');
  const [range, setRange] = useState({ from: 1, to: 10 });
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [hours, setHours] = useState(2),
    [clock, setClock] = useState(Date.now());
  const table = tables.find((item) => item.id === selected) || tables[0];
  const validUrl = table?.url && new Date(table.qrExpiresAt).getTime() > clock ? table.url : null;
  useEffect(() => {
    setHours(table?.qrDurationHours || 2);
  }, [table?.id, table?.qrDurationHours]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let cancelled = false;
    setQr(null);
    setError('');
    if (validUrl)
      (async () => {
        try {
          const image = await createTableQr(validUrl);
          const downloadImage = await createTableQrDownload(image, table.number);
          if (!cancelled) setQr({ image, downloadImage, url: validUrl });
        } catch {
          if (!cancelled)
            setError('สร้าง QR ไม่สำเร็จ กรุณาเลือกโต๊ะใหม่หรือลองโหลดข้อมูลอีกครั้ง');
        }
      })();
    return () => {
      cancelled = true;
    };
  }, [table?.id, validUrl, table?.number]);
  return (
    <section className="ordering-admin-panel">
      <div className="ordering-panel-heading">
        <div>
          <h3>โต๊ะ / QR สำหรับรอบปัจจุบัน</h3>
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
            <form
              className="ordering-admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveQrHours?.(table.id, Number(hours));
              }}
            >
              <label>
                อายุ QR (ชั่วโมง)
                <input
                  type="number"
                  min="1"
                  max="168"
                  required
                  value={hours}
                  disabled={busy}
                  onChange={(event) => setHours(event.target.value)}
                />
              </label>
              <button className="admin-secondary" disabled={busy}>
                บันทึกค่าเริ่มต้น
              </button>
            </form>
            <p>ค่าเริ่มต้น 2 ชั่วโมง • ค่านี้ใช้กับรอบถัดไป ไม่ต่ออายุ QR เดิม</p>
            {validUrl && <p>หมดอายุ {new Date(table.qrExpiresAt).toLocaleString('th-TH')}</p>}
            {qr && validUrl && qr.url === validUrl && (
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
            {qr && validUrl && qr.url === validUrl ? (
              <img
                src={qr.image}
                alt={`QR สั่งอาหารโต๊ะ ${table.number}`}
                width="160"
                height="160"
              />
            ) : (
              <p>
                {!validUrl
                  ? 'ไม่มี QR ที่ใช้งานได้ เปิดรอบโต๊ะใน POS เพื่อสร้าง QR ใหม่'
                  : error || 'กำลังสร้าง QR…'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p>ยังไม่มีโต๊ะ เพิ่มหมายเลขโต๊ะก่อนเริ่มใช้งาน</p>
      )}
      <details className="ordering-add-tables">
        <summary>เพิ่มโต๊ะใหม่</summary>
        <p>เพิ่มครั้งละไม่เกิน 200 โต๊ะ QR จะสร้างเมื่อเปิดรอบโต๊ะใน POS เท่านั้น</p>
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
