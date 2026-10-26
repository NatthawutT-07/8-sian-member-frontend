import { LoaderCircle, Clock, RefreshCw } from 'lucide-react';
import CouponBarcode from './CouponBarcode.jsx';
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
  return (
    <Dialog
      className="coupon-modal barcode-modal"
      titleId="barcode-title"
      onClose={closeBarcode}
      busy={busy}
    >
      <div className="eyebrow">SCAN AT THE COUNTER</div>
      <h2 id="barcode-title">บาร์โค้ดใช้คูปอง</h2>
      <div className="barcode-coupon-summary">
        <strong>{selected.title}</strong>
        <span>{selected.description}</span>
        <small>
          {selected.extraPrice > 0
            ? `ค่าใช้จ่ายเพิ่ม ${selected.extraPrice} บาท`
            : 'ไม่มีค่าใช้จ่ายเพิ่ม'}
        </small>
      </div>
      {busy ? (
        <div className="barcode-wait">
          <LoaderCircle className="spin" size={28} />
          <p>กำลังสร้างบาร์โค้ด…</p>
        </div>
      ) : barcode && new Date(barcode.expiresAt).getTime() > now ? (
        <>
          <CouponBarcode value={barcode.code} />
          <p className="barcode-countdown">
            <Clock size={14} /> รหัสนี้ใช้ได้อีก{' '}
            {Math.floor(Math.max(0, new Date(barcode.expiresAt).getTime() - now) / 60000)}:
            {String(
              Math.floor(Math.max(0, new Date(barcode.expiresAt).getTime() - now) / 1000) % 60,
            ).padStart(2, '0')}{' '}
            นาที
          </p>
          <p className="barcode-instructions">
            แสดงบาร์โค้ดให้พนักงานสแกนที่ POS
            <br />
            คูปองจะถูกใช้เมื่อชำระบิลสำเร็จเท่านั้น
          </p>
          <div className="barcode-awaiting">
            <LoaderCircle className="spin" size={14} /> รอการยืนยันการชำระบิลจาก POS
          </div>
        </>
      ) : (
        <div className="barcode-wait">
          <Clock size={25} />
          <p>{barcode ? 'บาร์โค้ดหมดอายุแล้ว คูปองยังไม่ถูกใช้' : 'ยังไม่สามารถแสดงบาร์โค้ดได้'}</p>
        </div>
      )}
      {barcodeError && (
        <p className="error" role="alert">
          {barcodeError}
        </p>
      )}
      {!busy && (!barcode || new Date(barcode.expiresAt).getTime() <= now) && (
        <button className="button dark" onClick={() => showBarcode(selected)}>
          สร้างบาร์โค้ดใหม่ <RefreshCw size={15} />
        </button>
      )}
      <button ref={cancelButton} className="cancel-redeem" onClick={closeBarcode} disabled={busy}>
        ปิดหน้าบาร์โค้ด
      </button>
      <small className="barcode-note">การเปิดหรือปิดหน้านี้ไม่ใช่การยืนยันใช้คูปอง</small>
    </Dialog>
  );
}
