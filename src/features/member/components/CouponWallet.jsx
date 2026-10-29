import { LoaderCircle, Ticket } from 'lucide-react';
import CouponCard from './CouponCard.jsx';

export default function CouponWallet({ activeTab, available, busy, loading, now, showBarcode }) {
  return (
    <section
      id="wallet-panel"
      role="tabpanel"
      aria-labelledby="wallet-tab"
      hidden={activeTab !== 'wallet'}
      className="coupon-section"
    >
      <div className="coupon-section-heading">
        <div>
          <div className="eyebrow">SOMETHING SPECIAL FOR YOU</div>
          <h2>
            คูปองของฉัน <span>{available.length}</span>
          </h2>
        </div>
      </div>
      {loading ? (
        <div className="coupon-empty">
          <LoaderCircle size={27} className="spin" />
          <p>กำลังเปิดกระเป๋าคูปองของคุณ…</p>
        </div>
      ) : available.length ? (
        <div className="coupon-grid">
          {available.map((coupon) => (
            <CouponCard
              key={coupon.id}
              busy={busy}
              coupon={coupon}
              now={now}
              showBarcode={showBarcode}
            />
          ))}
        </div>
      ) : (
        <div className="coupon-empty">
          <Ticket size={40} strokeWidth={1} />
          <h3>ยังไม่มีคูปองพร้อมใช้</h3>
          <p>
            คูปองที่ใช้แล้วหรือหมดอายุจะถูกนำออกจากรายการ
            <br />
            ขอบคุณที่มาอิ่มอร่อยกับเรา
          </p>
        </div>
      )}
    </section>
  );
}
