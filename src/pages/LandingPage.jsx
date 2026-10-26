import BrandLogo from '../components/BrandLogo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Dialog from '../components/Dialog.jsx';
import { useState } from 'react';
import { ArrowUpRight, Check, ShieldCheck, UtensilsCrossed, Plus, Minus } from 'lucide-react';
import MemberForm from '../features/auth/MemberForm.jsx';
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
          <a className="login-shortcut" href="/login">
            เข้าสู่ระบบ
          </a>
          <a className="nav-cta" href="/register">
            สมัครสมาชิก <ArrowUpRight size={16} />
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
                <p className="intro">
                  ดูโปรโมชั่นจากร้าน เลือกรับคูปองที่ต้องการ
                  <br className="desktop" />
                  แล้วเปิดใช้จากบัญชีสมาชิกได้เลย
                </p>
                <div className="hero-links">
                  <a className="button landing-primary" href="/#promotions">
                    ดูโปรโมชั่น <ArrowUpRight size={17} />
                  </a>
                  <a className="landing-secondary" href="/register">
                    สมัครสมาชิกฟรี
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
                  <div className="card-bottom">
                    <span>8 เซียนราชาหมูกระทะ</span>
                  </div>
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
                  <p>ใช้เบอร์โทรศัพท์และตั้งรหัสผ่าน สมัครฟรี</p>
                </li>
                <li>
                  <strong>เลือกรับคูปอง</strong>
                  <p>อ่านเงื่อนไขก่อนรับ คูปองจะเก็บไว้ในบัญชีของคุณ</p>
                </li>
                <li>
                  <strong>แสดงบาร์โค้ดที่ร้าน</strong>
                  <p>เปิดคูปองที่ต้องการใช้ แล้วแสดงบาร์โค้ดให้พนักงาน</p>
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
                  <p>เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน แล้วเลือกคูปองที่ต้องการใช้ได้ทันที</p>
                </>
              ) : (
                <>
                  <div className="eyebrow">บัญชีสมาชิก 8 เซียน</div>
                  <h2>
                    สมัครสมาชิก
                    <br />
                    เพื่อเก็บคูปองของร้าน
                  </h2>
                  <p>กรอกข้อมูลของคุณ แล้วตั้งรหัสผ่านเพื่อใช้เข้าสู่ระบบ</p>
                  <div className="steps">
                    <div>
                      <b>01</b>
                      <span>กรอกเบอร์โทร ชื่อ นามสกุล และวันเกิด</span>
                    </div>
                    <div>
                      <b>02</b>
                      <span>ตั้งรหัสผ่านและยืนยันการสมัคร</span>
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
            <MemberForm
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
                  'สมัครสมาชิกฟรี ไม่มีค่าธรรมเนียม เพียงกรอกข้อมูลและตั้งรหัสผ่านให้ครบถ้วน',
                ],
                [
                  'ใช้ข้อมูลอะไรในการเข้าสู่ระบบ?',
                  'ใช้เบอร์โทรศัพท์และรหัสผ่านที่ตั้งไว้ตอนสมัคร ไม่ต้องเชื่อมต่อบัญชีอื่น',
                ],
                [
                  'กลับมาดูบัตรสมาชิกได้อย่างไร?',
                  'เปิดเว็บไซต์นี้ เลือกเข้าสู่ระบบ แล้วกรอกเบอร์โทรศัพท์และรหัสผ่าน ระบบจะแสดงบัตรสมาชิกของคุณ',
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
          <p>
            ร้าน 8 เซียนราชาหมูกระทะ เก็บชื่อ นามสกุล เบอร์โทรศัพท์ วันเกิด และข้อมูลบัญชีสมาชิก
            เพื่อยืนยันตัวตน จัดการสมาชิก และให้บริการสิทธิประโยชน์
          </p>
          <p>
            หากคุณเลือกยินยอมรับข่าวสาร ร้านจะใช้ข้อมูลเพื่อติดต่อเกี่ยวกับโปรโมชัน
            คุณสามารถถอนความยินยอม ขอเข้าถึง แก้ไข หรือลบข้อมูลได้โดยติดต่อผู้ดูแลที่ร้าน
          </p>
          <p>
            ข้อมูลจะถูกเก็บในช่วงที่คุณเป็นสมาชิก และลบเมื่อสิ้นสุดความจำเป็นในการให้บริการ
            เว้นแต่ต้องเก็บตามกฎหมาย ผู้ให้บริการโฮสต์และฐานข้อมูลอาจประมวลผลข้อมูลเพื่อให้ระบบทำงาน
          </p>
          <small>เวอร์ชั้น 1 พฤศจิกายน 2569</small>
          <button autoFocus className="button dark" onClick={() => setPolicy(false)}>
            รับทราบและปิด
          </button>
        </Dialog>
      )}
    </>
  );
}
