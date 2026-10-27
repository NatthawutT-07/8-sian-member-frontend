import { useState } from 'react';
import { campaignPriceText } from '../../../lib/campaign-price.js';
import { LoaderCircle, Clock, RefreshCw, QrCode, Barcode } from 'lucide-react';
import CouponBarcode from './CouponBarcode.jsx';
import CouponQrCode from './CouponQrCode.jsx';
import Dialog from '../../../components/Dialog.jsx';

export default function CouponBarcodeDialog({
  barcode,
  barcodeError,
  busy,
  cancelButton,
  closeBarcode,
  now,
  selected,
  showBarcode,
}) {
  const [format, setFormat] = useState('barcode');
  return (
    <Dialog
      className="coupon-modal barcode-modal"
      titleId="barcode-title"
      onClose={closeBarcode}
      busy={busy}
    >
      <div className="eyebrow">แสดงให้พนักงานสแกน</div>
      <h2 id="barcode-title">ใช้คูปอง</h2>
      <div className="coupon-code-options" role="group" aria-label="รูปแบบรหัสคูปอง">
        <button
          type="button"
          aria-pressed={format === 'barcode'}
          onClick={() => setFormat('barcode')}
        >
          <Barcode size={18} aria-hidden="true" /> บาร์โค้ด
        </button>
        <button type="button" aria-pressed={format === 'qr'} onClick={() => setFormat('qr')}>
          <QrCode size={18} aria-hidden="true" /> QR Code
        </button>
      </div>
      <div className="barcode-coupon-summary">
        <strong>{selected.title}</strong>
        <span>{selected.description}</span>
        <small>{campaignPriceText(selected.extraPrice)}</small>
      </div>
      {busy ? (
        <div className="barcode-wait">
          <LoaderCircle className="spin" size={28} />
          <p>กำลังสร้างรหัส…</p>
        </div>
      ) : barcode && new Date(barcode.expiresAt).getTime() > now ? (
        <>
          {format === 'qr' ? (
            <CouponQrCode value={barcode.code} />
          ) : (
            <CouponBarcode value={barcode.code} />
          )}
          <p className="barcode-countdown">
            <Clock size={14} /> รหัสนี้ใช้ได้อีก{' '}
            {Math.floor(Math.max(0, new Date(barcode.expiresAt).getTime() - now) / 60000)}:
            {String(
              Math.floor(Math.max(0, new Date(barcode.expiresAt).getTime() - now) / 1000) % 60,
            ).padStart(2, '0')}{' '}
            นาที
          </p>
          <p className="barcode-instructions">คูปองจะถูกใช้เมื่อชำระบิลสำเร็จ</p>
          <div className="barcode-awaiting">
            <LoaderCircle className="spin" size={14} /> รอพนักงานยืนยัน
          </div>
        </>
      ) : (
        <div className="barcode-wait">
          <Clock size={25} />
          <p>{barcode ? 'รหัสหมดอายุ คูปองยังไม่ถูกใช้' : 'ยังแสดงรหัสไม่ได้'}</p>
        </div>
      )}
      {barcodeError && (
        <p className="error" role="alert">
          {barcodeError}
        </p>
      )}
      {!busy && (!barcode || new Date(barcode.expiresAt).getTime() <= now) && (
        <button className="button dark" onClick={() => showBarcode(selected)}>
          สร้างรหัสใหม่ <RefreshCw size={15} />
        </button>
      )}
      <button ref={cancelButton} className="cancel-redeem" onClick={closeBarcode} disabled={busy}>
        ปิด
      </button>
      <small className="barcode-note">การเปิดหรือปิดหน้านี้ไม่ใช่การยืนยันใช้คูปอง</small>
    </Dialog>
  );
}
