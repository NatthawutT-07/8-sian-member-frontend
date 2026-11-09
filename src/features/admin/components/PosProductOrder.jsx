import { useEffect, useMemo, useState } from 'react';
import './pos-product-order.css';

const groups = { MAIN: 'หลัก', DISCOUNT: 'ส่วนลด', PROMOTION: 'โปรโมชั่น' };
export default function PosProductOrder({ products, busy, onSave }) {
  const [group, setGroup] = useState('MAIN');
  const items = useMemo(
    () => products.filter((item) => (item.group || 'MAIN') === group),
    [products, group],
  );
  const [order, setOrder] = useState(items);
  useEffect(() => {
    setOrder(items);
  }, [items]);
  const changed = order.some((item, index) => item.id !== items[index]?.id);
  return (
    <details className="pos-product-order">
      <summary>จัดลำดับสินค้าในแต่ละกลุ่ม</summary>
      <p>เลือกสินค้าที่ต้องการให้อยู่ก่อน แล้วเปลี่ยนลำดับ ใช้จัดปุ่มสินค้าใน POS</p>
      <label>
        กลุ่มที่จะจัดลำดับ
        <select
          value={group}
          disabled={busy || changed}
          onChange={(event) => setGroup(event.target.value)}
        >
          {Object.entries(groups).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {!order.length ? (
        <p>ยังไม่มีสินค้าในกลุ่มนี้</p>
      ) : (
        <>
          <ol>
            {order.map((item, index) => (
              <li key={item.id}>
                <span className="pos-product-position">{index + 1}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.barcode}
                    {!item.active ? ' • หยุดขาย' : ''}
                  </small>
                </div>
                <label>
                  ลำดับ
                  <select
                    aria-label={`ลำดับสินค้า ${item.name}`}
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
          <div className="pos-product-order-actions">
            <button
              type="button"
              className="admin-primary"
              disabled={busy || !changed}
              onClick={() =>
                onSave(
                  group,
                  order.map((item) => item.id),
                )
              }
            >
              บันทึกลำดับสินค้า
            </button>
            {changed && (
              <button
                type="button"
                className="admin-secondary"
                disabled={busy}
                onClick={() => setOrder(items)}
              >
                ยกเลิกการเรียง
              </button>
            )}
          </div>
          {changed && <p role="status">ยังไม่ได้บันทึก กรุณาบันทึกหรือยกเลิกก่อนเปลี่ยนกลุ่ม</p>}
        </>
      )}
    </details>
  );
}
