import { useEffect, useMemo, useState } from 'react';

export default function OrderingItemOrder({ menu, categories, busy, onSave }) {
  const [selected, setSelected] = useState('');
  const category = categories.includes(selected) ? selected : categories[0] || '';
  const items = useMemo(() => menu.filter((item) => item.category === category), [menu, category]);
  const [order, setOrder] = useState(items);
  useEffect(() => {
    setOrder(items);
  }, [items]);
  const changed = order.some((item, index) => item.id !== items[index]?.id);
  return (
    <section className="ordering-admin-panel ordering-item-order">
      <h3>ลำดับอาหารภายในหมวดหมู่</h3>
      <p>
        เลือกรายการที่ต้องการให้อยู่ก่อนแล้วเปลี่ยนลำดับ ตัวเลขแสดงเฉพาะหลังบ้าน
        ลูกค้าเห็นเพียงรายการอาหารตามลำดับที่บันทึก
      </p>
      <label className="ordering-order-category">
        เลือกหมวดหมู่
        <select
          value={category}
          disabled={busy || !categories.length || changed}
          onChange={(event) => setSelected(event.target.value)}
        >
          {!categories.length && <option value="">ยังไม่มีหมวดหมู่</option>}
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {!!order.length && (
        <>
          <ol className="ordering-category-order ordering-food-order">
            {order.map((item, index) => (
              <li key={item.id}>
                <span className="ordering-position">{index + 1}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.zone}
                    {!item.active ? ' • ปิด / หมด' : ''}
                  </small>
                </div>
                <label>
                  ลำดับ
                  <select
                    aria-label={`ลำดับอาหาร ${item.name} (${item.zone})`}
                    value={index}
                    disabled={busy}
                    onChange={(event) => {
                      const next = [...order];
                      next.splice(index, 1);
                      next.splice(Number(event.target.value), 0, item);
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
              onClick={() =>
                onSave(
                  category,
                  order.map((item) => item.id),
                )
              }
            >
              บันทึกลำดับอาหาร
            </button>
            {changed && (
              <>
                <button className="admin-secondary" disabled={busy} onClick={() => setOrder(items)}>
                  ยกเลิกการเรียง
                </button>
                <span role="status">ยังไม่ได้บันทึก กรุณาบันทึกหรือยกเลิกก่อนเปลี่ยนหมวดหมู่</span>
              </>
            )}
          </div>
        </>
      )}
      {!order.length && <p>เพิ่มอาหารในหมวดหมู่ก่อนจัดลำดับ</p>}
    </section>
  );
}
