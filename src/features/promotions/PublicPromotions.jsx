import { useEffect, useState } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { request } from '../../lib/api.js';
import PromotionList from './components/PromotionList.jsx';
import './promotions.css';

export default function PublicPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    request('/api/promotions')
      .then(({ promotions }) => {
        if (active) setPromotions(promotions);
      })
      .catch((error) => {
        if (active) setError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <section id="promotions" className="public-promotions" aria-labelledby="promotions-title">
      <div className="section-head">
        <div>
          <h2 id="promotions-title">โปรโมชั่นจาก 8 เซียน</h2>
        </div>
        <p>ดูเงื่อนไขแล้วเลือกรับคูปองที่ต้องการ</p>
      </div>
      {loading ? (
        <p className="public-promotion-status" role="status">
          <LoaderCircle size={17} className="spin" /> กำลังโหลดโปรโมชั่น…
        </p>
      ) : error ? (
        <div className="public-promotion-status">
          <p role="alert">ยังโหลดโปรโมชั่นไม่ได้ กรุณาลองอีกครั้ง</p>
          <button
            type="button"
            className="refresh-coupons"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshCw size={15} /> ลองอีกครั้ง
          </button>
        </div>
      ) : promotions.length ? (
        <PromotionList promotions={promotions} />
      ) : (
        <p className="public-promotion-status">
          ยังไม่มีโปรโมชั่นเปิดรับในขณะนี้ ติดตามข่าวสารจากร้านได้เร็ว ๆ นี้
        </p>
      )}
      <p className="public-promotions-note">
        รับได้บัญชีละ 1 ครั้งต่อแคมเปญ เงื่อนไขเป็นไปตามที่ระบุในแต่ละโปรโมชั่น
      </p>
    </section>
  );
}
