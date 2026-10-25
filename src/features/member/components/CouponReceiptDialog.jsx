import { Check, ArrowRight } from 'lucide-react';
const formatDate = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
export default function CouponReceiptDialog({ receipt, receiptHeading, setReceipt }) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal coupon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setReceipt(null);
          if (e.key === 'Tab') {
            e.preventDefault();
            e.currentTarget.querySelector('button').focus();
          }
        }}
      >
        <div className="success-icon">
          <Check size={28} />
        </div>
        <div className="eyebrow">ENJOY YOUR MEAL</div>
        <h2 ref={receiptHeading} tabIndex={-1} id="receipt-title">
          POS ยืนยันใช้คูปองแล้ว
        </h2>
        <p>คูปองถูกใช้กับบิลที่ชำระสำเร็จแล้ว</p>
        <div className="coupon-receipt">
          <strong>{receipt.title}</strong>
          <span>{receipt.description}</span>
          <small>สมาชิก {receipt.memberNumber}</small>
          <small>ใช้เมื่อ {formatDate(receipt.usedAt)}</small>
          <code>{receipt.couponId}</code>
        </div>
        <p>
          ตรวจสอบรายละเอียดชำระเงินได้จากใบเสร็จ POS
          <br />
          คูปองใบนี้ไม่สามารถใช้ซ้ำได้
        </p>
        <button className="button dark" onClick={() => setReceipt(null)}>
          กลับหน้าหลัก <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
