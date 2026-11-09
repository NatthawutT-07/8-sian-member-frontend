import { useEffect, useState } from 'react';

export default function OrderingCategoryOrder({ categories, busy, onSave }) {
  const [order, setOrder] = useState(categories);
  useEffect(() => {
    setOrder(categories);
  }, [categories]);
  const changed = order.some((name, index) => name !== categories[index]);
  return (
    <section className="ordering-admin-panel">
      <div className="ordering-panel-heading">
        <div>
          <h3>ลำดับหมวดหมู่บนหน้าสั่งอาหาร</h3>
          <p>ลำดับที่ 1 แสดงก่อน ใช้ลำดับเดียวกันทุกโต๊ะ โดยแสดงเฉพาะเมนูในโซนที่โต๊ะมีสิทธิ์</p>
        </div>
      </div>
      {!order.length ? (
        <p>เพิ่มเมนูเพื่อสร้างหมวดหมู่ก่อนจัดลำดับ</p>
      ) : (
        <>
          <ol className="ordering-category-order">
            {order.map((name, index) => (
              <li key={name}>
                <span className="ordering-position">{index + 1}</span>
                <strong>{name}</strong>
                <label>
                  ลำดับ
                  <select
                    aria-label={`ลำดับหมวดหมู่ ${name}`}
                    value={index}
                    disabled={busy}
                    onChange={(event) => {
                      const next = [...order];
                      next.splice(index, 1);
                      next.splice(Number(event.target.value), 0, name);
                      setOrder(next);
                    }}
                  >
                    {order.map((_, position) => (
                      <option key={position} value={position}>
                        {position + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ol>
          <div className="ordering-inline-actions">
            <button
              className="admin-primary"
              disabled={busy || !changed}
              onClick={() => onSave(order)}
            >
              บันทึกลำดับหมวดหมู่
            </button>
            {changed && <span role="status">ยังไม่ได้บันทึกลำดับใหม่</span>}
          </div>
        </>
      )}
    </section>
  );
}
