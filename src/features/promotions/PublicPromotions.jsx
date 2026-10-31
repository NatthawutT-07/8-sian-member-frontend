import { ArrowUpRight, Clock, Gift } from 'lucide-react';
import './promotions.css';

// Keep this announcement visible independently of campaign APIs and the current date.
export default function PublicPromotions({ isMember = false }) {
  return (
    <section id="promotions" className="public-promotions" aria-labelledby="promotions-title">
      <div className="section-head">
        <h2 id="promotions-title">{isMember ? 'สิทธิ์สมาชิกของคุณ' : 'โปรโมชั่นจาก 8 เซียน'}</h2>
        <p>สิทธิพิเศษสำหรับสมาชิก 8 เซียน ตลอดเดือนพฤศจิกายน</p>
      </div>
      <div className="public-promotion-list">
        <article className="public-promotion monthly-member-promotion">
          <div className="public-promotion-top">
            <div className="public-promotion-label">
              <span className="public-promotion-icon">
                <Gift size={17} strokeWidth={1.5} />
              </span>
              <span>สิทธิพิเศษสมาชิก</span>
            </div>
          </div>
          <div className="public-promotion-content">
            <h3>โปรโมชั่น หมูกระทะ 199 บาท</h3>
            <div className="monthly-member-offer">
              <span className="monthly-member-seafood">+ ทะเลเผา</span>
              <span className="monthly-member-deal">
                <span className="monthly-member-original">
                  จาก <del>100 บาท</del>
                </span>
                <span className="monthly-member-sale">
                  เหลือ <strong>79</strong> บาท
                </span>
              </span>
              <span className="monthly-member-grill-offer">
                <span className="monthly-member-grill">
                  + <strong>ฟรี</strong>ตะแกรงย่าง
                </span>
                <small className="monthly-member-grill-value">มูลค่า 69 บาท</small>
              </span>
            </div>
            <small className="monthly-member-refill-note">ยังไม่รวมรีฟิล 39 บาท</small>
            <p className="public-promotion-condition">
              เพียงแสดงหลักฐานว่าเป็น member ของร้านเรา เพื่อรับสิทธิ์
            </p>
          </div>
          <div className="public-promotion-bottom">
            <span className="public-promotion-duration">
              <Clock size={16} />
              <span>
                1–30 พฤศจิกายน 2569<small>รับสิทธิ์ได้ตลอดทั้งเดือน</small>
              </span>
            </span>
            {isMember ? (
              <p className="monthly-member-proof">แสดงบัตรสมาชิกด้านบนกับพนักงานเพื่อรับสิทธิ์</p>
            ) : (
              <a className="button public-promotion-cta" href="/login?next=/coupons">
                เข้าสู่ระบบแสดงบัตรสมาชิก <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </article>
      </div>
      <p className="public-promotions-note">
        ใช้สิทธิ์ได้ระหว่างวันที่ 1–30 พฤศจิกายน 2569 เพียงแสดงหลักฐานการเป็นสมาชิก 8 เซียน
      </p>
    </section>
  );
}
