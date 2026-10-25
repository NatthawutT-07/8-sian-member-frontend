import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
export default function CouponBarcode({ value }) {
  const svg = useRef(null),
    [error, setError] = useState(false);
  useEffect(() => {
    try {
      JsBarcode(svg.current, value, {
        format: 'CODE128C',
        width: 2,
        height: 85,
        displayValue: true,
        fontSize: 12,
        textMargin: 7,
        margin: 18,
        background: '#ffffff',
        lineColor: '#000000',
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, [value]);
  return error ? (
    <p className="error">แสดงบาร์โค้ดไม่สำเร็จ กรุณาเปิดใหม่อีกครั้ง</p>
  ) : (
    <div className="coupon-barcode-image">
      <svg ref={svg} role="img" aria-label="บาร์โค้ดคูปองสำหรับสแกนที่ POS" />
    </div>
  );
}
