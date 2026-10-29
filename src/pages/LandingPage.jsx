import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Dialog from '../components/Dialog.jsx';
import { useState } from 'react';
import { ArrowUpRight, Check, ShieldCheck, UtensilsCrossed, Plus, Minus } from 'lucide-react';
import LineAuth from '../features/auth/LineAuth.jsx';
import { PrivacyText } from './PrivacyPage.jsx';
import PublicPromotions from '../features/promotions/PublicPromotions.jsx';
import './landing.css';
export default function LandingPage({ onAuthenticated, authMode = null }) {
  const [policy, setPolicy] = useState(false),
    [faq, setFaq] = useState(null);
  return (
    <>
      <header className="header">
        <a className="brand" href="/">
          <BrandLogo />
          <span>
            8 เซียน<span className="brand-sub">ราชาหมูกระทะ</span>
          </span>
        </a>
        <nav aria-label="เมนูหลัก">
          <a href="/#promotions">โปรโมชั่น</a>
          <a href="/#benefits">สิทธิพิเศษสมาชิก</a>
          <a href="/#faq">คำถามที่พบบ่อย</a>
          <a href="/coupons">ใช้คูปอง</a>
        </nav>
        <div className="header-auth-actions">
          <a className="nav-cta" href="/register">
            เข้าใช้ LINE <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      <main>
        {!authMode && (
          <>
            <section className="hero landing-hero">
              <div className="hero-copy">
                <p className="landing-kicker">8 เซียนราชาหมูกระทะ</p>
                <h1>
                  สิทธิพิเศษสมาชิก
                  <br />
                  <span>รับคูปองไว้ใช้ที่ร้าน</span>
                </h1>
              
                <div className="hero-links">
                  <a className="button landing-primary" href="/#promotions">
                    ดูโปรโมชั่น <ArrowUpRight size={17} />
                  </a>
                  <a className="landing-secondary" href="/register">
                    เข้าใช้ด้วย LINE
                  </a>
                </div>
              </div>
              <div className="card-scene">
                <div className="scene-caption">บัตรสมาชิกของคุณ</div>
                <div className="member-card">
                  <div className="card-top">
                    <div className="card-brand">
                      8 เซียน<small>ราชาหมูกระทะ</small>
                    </div>
                    <UtensilsCrossed size={32} strokeWidth={1} />
                  </div>
                  <div className="card-middle">
                    MEMBER<span>รับคูปองและดูสิทธิ์ผ่านบัญชีสมาชิก</span>
                  </div>
                  <span className="card-watermark" aria-hidden="true">8</span>
                </div>
              </div>
            </section>
            <div className="promise-strip">
              <span>
                <Check size={16} /> สมัครสมาชิกฟรี
              </span>
              <i />
              <span>
                <Check size={16} /> เก็บคูปองไว้ในบัญชี
              </span>
              <i />
              <span>
                <Check size={16} /> เปิดดูสิทธิ์ได้ทุกเวลา
              </span>
            </div>
            <PublicPromotions />
            <section id="benefits" className="membership-guide">
              <h2>รับคูปองแล้วใช้ยังไง?</h2>
              <ol>
                <li>
                  <strong>สมัครสมาชิก</strong>
                  <p>เข้าใช้ด้วย LINE ระบบสร้างสมาชิกให้โดยอัตโนมัติ</p>
                </li>
                <li>
                  <strong>เลือกรับคูปอง</strong>
                  <p>อ่านเงื่อนไขก่อนรับ คูปองจะเก็บไว้ในบัญชีของคุณ</p>
                </li>
                <li>
                  <strong>แสดงรหัสที่ร้าน</strong>
                  <p>เลือก QR Code หรือบาร์โค้ดให้พนักงานสแกน</p>
                </li>
              </ol>
            </section>
          </>
        )}
        {authMode && (
          <section id="register" className="registration auth-route">
            <div className="register-copy">
              {authMode === 'login' ? (
                <>
                  <div className="eyebrow">บัญชีสมาชิก 8 เซียน</div>
                  <h2>
                    เข้าสู่ระบบ
                    <br />
                    เพื่อใช้คูปองของคุณ
                  </h2>
                  <p>เข้าสู่ระบบด้วย LINE แล้วเลือกคูปองที่ต้องการใช้ได้ทันที</p>
                </>
              ) : (
                <>
                  <div className="eyebrow">บัญชีสมาชิก 8 เซียน</div>
                  <h2>
                    เข้าสู่ระบบด้วย LINE
                    <br />
                    เพื่อเก็บคูปองของร้าน
                  </h2>
                  <p>เข้าใช้ด้วย LINE เพื่อรับสิทธิ์สมาชิก ไม่ต้องกรอกข้อมูล</p>
                  <div className="steps">
                    <div>
                      <b>01</b>
                      <span>เข้าสู่ระบบด้วย LINE ของคุณ</span>
                    </div>
                    <div>
                      <b>02</b>
                      <span>ระบบใช้ชื่อ LINE ของคุณเป็นชื่อสมาชิก</span>
                    </div>
                    <div>
                      <b>03</b>
                      <span>พร้อมรับความพิเศษจาก 8 เซียน</span>
                    </div>
                  </div>
                  <div className="privacy-note">
                    <ShieldCheck size={22} />
                    <span>
                      ข้อมูลของคุณจะถูกเก็บอย่างปลอดภัย
                      <br />
                      ใช้เพื่อดูแลสมาชิกและสิทธิประโยชน์ของคุณ
                    </span>
                  </div>
                </>
              )}
            </div>
            <LineAuth
              onPolicy={() => setPolicy(true)}
              onAuthenticated={onAuthenticated}
              initialMode={authMode}
              onModeChange={(mode) =>
                window.location.assign(mode === 'login' ? '/login' : '/register')
              }
            />
          </section>
        )}
        {!authMode && (
          <section className="faq" id="faq">
            <div>
              <h2>คำถามที่พบบ่อย</h2>
              <p>เรื่องการสมัครและการใช้งานบัญชี</p>
            </div>
            <div className="faq-list">
              {[
                [
                  'สมัครสมาชิกมีค่าใช้จ่ายไหม?',
                  'เข้าใช้ด้วย LINE ฟรี ระบบสร้างสมาชิกจากชื่อ LINE โดยไม่ต้องกรอกข้อมูล',
                ],
                [
                  'ใช้ข้อมูลอะไรในการเข้าสู่ระบบ?',
                  'ใช้บัญชี LINE ได้เลย หากมีคูปองในบัญชีเบอร์โทรเดิม ให้เลือกเชื่อมสมาชิกเดิมก่อนเข้าใช้ครั้งแรก',
                ],
                [
                  'กลับมาดูบัตรสมาชิกได้อย่างไร?',
                  'เปิดเว็บไซต์นี้ เลือกเข้าสู่ระบบด้วย LINE บัญชีเดิม แล้วไปที่หน้าคูปองของคุณ',
                ],
              ].map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                    {q}
                    {faq === i ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                  {faq === i && <p>{a}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      {policy && (
        <Dialog label="นโยบายความเป็นส่วนตัว" onClose={() => setPolicy(false)} dismissOnBackdrop>
          <h2>นโยบายความเป็นส่วนตัว</h2>
          <PrivacyText />
          <button autoFocus className="button dark" onClick={() => setPolicy(false)}>
            รับทราบและปิด
          </button>
        </Dialog>
      )}
    </>
  );
}
