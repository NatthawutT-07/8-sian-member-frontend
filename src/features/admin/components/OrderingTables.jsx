import { useEffect, useState } from 'react';

export default function OrderingTables({ tables, busy, onAdd, onSaveQrHours }) {
  const [selected, setSelected] = useState('');
  const [range, setRange] = useState({ from: 1, to: 10 });
  const [hours, setHours] = useState(2);
  const table = tables.find((item) => item.id === selected) || tables[0];
  useEffect(() => {
    setHours(table?.qrDurationHours || 2);
  }, [table?.id, table?.qrDurationHours]);
  return (
    <section className="ordering-admin-panel">
      <div className="ordering-panel-heading">
        <div>
          <h3>จัดการโต๊ะ</h3>
          <p>ทั้งหมด {tables.length} โต๊ะ • QR สั่งอาหารพิมพ์จากใบเสร็จใน POS</p>
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
            {table.sessionId && table.qrExpiresAt && (
              <p>รอบปัจจุบันหมดอายุ {new Date(table.qrExpiresAt).toLocaleString('th-TH')}</p>
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
