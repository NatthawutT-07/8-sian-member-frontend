import { UtensilsCrossed, Gift, Clock, ArrowRight, LockKeyhole } from 'lucide-react';
const formatDate = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
export default function CouponCard({ busy, coupon, now, showBarcode }) {
  return (
    <article className="seafood-coupon" key={coupon.id}>
      <div className="coupon-art">
        <span className="coupon-badge">MEMBER EXCLUSIVE</span>
        <div className="seafood-symbol">
          <UtensilsCrossed size={52} strokeWidth={1} />
        </div>
        <div className="coupon-price">
          <span>สิทธิพิเศษ</span>
          <strong>
            {coupon.extraPrice > 0 ? `+${coupon.extraPrice}` : 'ฟรี'}
            {coupon.extraPrice > 0 && <small>บาท</small>}
          </strong>
        </div>
        <span className="coupon-art-note">8 SIAN • MEMBER BENEFITS</span>
      </div>
      <div className="coupon-details">
        <div className="coupon-type">
          <Gift size={14} /> คูปองจากทางร้าน
        </div>
        <h3>{coupon.title}</h3>
        <p>
          {coupon.description}
          <br />
          ใช้ได้ 1 ครั้งต่อคูปอง
        </p>
        <div className="coupon-expiry">
          <Clock size={14} />
          <span>
            หมดอายุ {formatDate(coupon.expiresAt)}
            <small>
              เหลือ{' '}
              {Math.max(1, Math.ceil((new Date(coupon.expiresAt).getTime() - now) / 86400000))} วัน
              • อายุคูปอง {coupon.validityDays} วันนับจากวันที่ได้รับ
            </small>
          </span>
        </div>
        {coupon.locked && (
          <p className="coupon-prerequisite" id={`coupon-condition-${coupon.id}`}>
            ต้องใช้ “{coupon.prerequisiteCampaign?.title || 'คูปองก่อนหน้า'}”
            และให้ระบบยืนยันสำเร็จก่อน
          </p>
        )}
        <button
          className="button submit"
          disabled={busy || coupon.locked}
          aria-describedby={coupon.locked ? `coupon-condition-${coupon.id}` : undefined}
          onClick={() => showBarcode(coupon)}
        >
          {coupon.locked ? (
            <>
              <LockKeyhole size={17} /> ยังไม่ปลดล็อก
            </>
          ) : (
            <>
              ใช้คูปองนี้ <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
