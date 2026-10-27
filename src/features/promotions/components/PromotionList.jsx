import { ArrowUpRight, Clock, Gift, LockKeyhole } from 'lucide-react';
import { campaignPriceAmount } from '../../../lib/campaign-price.js';

export default function PromotionList({ promotions }) {
  return (
    <div className="public-promotion-list">
      {promotions.map((promotion) => (
        <article className="public-promotion" key={promotion.id}>
          <div className="public-promotion-top">
            <div className="public-promotion-label">
              <span className="public-promotion-icon">
                <Gift size={17} strokeWidth={1.5} />
              </span>
              <span>สิทธิพิเศษสมาชิก</span>
            </div>
            <div className="public-promotion-price">
              <span>
                {promotion.extraPrice < 0
                  ? 'ส่วนลด'
                  : promotion.extraPrice > 0
                    ? 'ค่าเพิ่ม'
                    : 'สิทธิ์นี้'}
              </span>
              <strong>
                {promotion.extraPrice === 0
                  ? 'ไม่มีค่าเพิ่ม'
                  : campaignPriceAmount(promotion.extraPrice)}
                {promotion.extraPrice !== 0 && <small>บาท</small>}
              </strong>
            </div>
          </div>
          <div className="public-promotion-content">
            <h3>{promotion.title}</h3>
            <p>{promotion.description}</p>
            {promotion.prerequisite && (
              <p className="public-promotion-condition">
                <LockKeyhole size={13} />
                <span>ใช้คูปอง “{promotion.prerequisite.title}” ให้สำเร็จก่อนรับสิทธิ์นี้</span>
              </p>
            )}
          </div>
          <div className="public-promotion-bottom">
            <span className="public-promotion-duration">
              <Clock size={13} />
              <span>
                ใช้ได้ <b>{promotion.validityDays} วัน</b>
                <small>หลังรับคูปอง</small>
              </span>
            </span>
            <a className="button public-promotion-cta" href="/login?next=/coupons">
              เข้าสู่ระบบรับคูปอง <ArrowUpRight size={16} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
