import { useMemo } from 'react';
import QRCode from 'qrcode';

export default function CouponQrCode({ value, label = 'QR Code คูปองสำหรับสแกนที่ POS' }) {
  const code = useMemo(() => {
    try {
      // Encode the exact same payload as CODE128-C, without a URL or prefix.
      const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' });
      const paths = [];
      for (let y = 0; y < modules.size; y++) {
        for (let x = 0; x < modules.size; x++) {
          if (modules.get(y, x)) paths.push(`M${x + 4} ${y + 4}h1v1h-1z`);
        }
      }
      return { size: modules.size + 8, path: paths.join('') };
    } catch {
      return null;
    }
  }, [value]);
  if (!code)
    return (
      <p className="error" role="alert">
        แสดง QR Code ไม่สำเร็จ กรุณาเปิดใหม่
      </p>
    );
  return (
    <div className="coupon-qr-image">
      <svg
        viewBox={`0 0 ${code.size} ${code.size}`}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <rect width={code.size} height={code.size} fill="#fff" />
        <path d={code.path} fill="#000" />
      </svg>
    </div>
  );
}
