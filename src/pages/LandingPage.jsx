import BrandLogo from '../components/BrandLogo.jsx';
import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Gift,
  UtensilsCrossed,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import MemberForm from '../features/auth/MemberForm.jsx';
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
        <nav>
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
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span /> THE 8 SIAN MEMBER CLUB
                </div>
                <h1>
                  ทุกมื้อที่อร่อย
                  <br />
                  พิเศษขึ้น<span className="serif">ได้อีก.</span>
                </h1>
                <p className="intro">
                  เพราะคุณคือคนพิเศษของ 8 เซียน
                  <br />
                  มาร่วมเป็นครอบครัวเดียวกัน แล้วให้ทุกมื้อหมูกระทะ
                  <br className="desktop" />
                  เต็มไปด้วยความสุขและสิทธิพิเศษสำหรับสมาชิก
                </p>
                <div className="hero-links">
                  <a className="button dark" href="/register">
                    เป็นสมาชิกกับเรา <ArrowUpRight size={18} />
                  </a>
                  <span>สมัครฟรี ไม่มีค่าใช้จ่าย</span>
                </div>
                <div className="hero-note">
                  <span className="small-star">✳</span> อิ่มอร่อยเหมือนเดิม เพิ่มเติมคือความพิเศษ
                </div>
              </div>
              <div className="card-scene">
                <div className="scene-caption">GOOD FOOD. GREAT COMPANY.</div>
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="member-card">
                  <div className="card-top">
                    <div className="card-brand">
                      8 เซียน<small>ราชาหมูกระทะ</small>
                    </div>
                    <UtensilsCrossed size={32} strokeWidth={1} />
                  </div>
                  <div className="card-middle">
                    MEMBER<span>อร่อยด้วยกัน เป็นคนพิเศษด้วยกัน</span>
                  </div>
                  <div className="card-bottom">
                    <span>8 SIAN • MEMBER CLUB</span>
                    <span>✳</span>
                  </div>
                </div>
                <div className="card-sticker">
                  <Sparkles size={17} />
                  <span>
                    มื้อโปรดของคุณ
                    <br />
                    <strong>พิเศษกว่าที่เคย</strong>
                  </span>
                </div>
                <span className="scene-index">EST. WITH LOVE / 08</span>
              </div>
            </section>
            <div className="promise-strip">
              <span>
                <Check size={16} /> สมัครสมาชิกฟรี
              </span>
              <i />
              <span>
                <Check size={16} /> เข้าสู่ระบบได้ทุกเวลา
              </span>
              <i />
              <span>
                <Check size={16} /> รับข่าวสารก่อนใคร
              </span>
            </div>
            <section id="benefits" className="benefits">
              <div className="section-head">
                <div>
                  <div className="eyebrow">A LITTLE MORE, JUST FOR YOU</div>
                  <h2>ความพิเศษ ที่อยากให้คุณได้รับ</h2>
                </div>
                <p>
                  มากกว่ามื้ออร่อย คือความใส่ใจ
                  <br />
                  ที่เราตั้งใจมอบให้สมาชิกทุกคน
                </p>
              </div>
              <div className="benefit-grid">
                {[
                  [
                    Gift,
                    '01',
                    'สิทธิพิเศษเฉพาะคุณ',
                    'ติดตามข้อเสนอและโปรโมชันสำหรับสมาชิกจากทางร้าน',
                  ],
                  [
                    UtensilsCrossed,
                    '02',
                    'อร่อยได้ในแบบที่ชอบ',
                    'ไม่พลาดกิจกรรมและข่าวสารจากร้าน ให้ทุกมื้อมีเรื่องดี ๆ รออยู่',
                  ],
                  [
                    Sparkles,
                    '03',
                    'ใกล้กันมากขึ้นอีกนิด',
                    'เปิดดูบัตรสมาชิกได้ทุกเวลา จากมือถือหรือคอมพิวเตอร์ของคุณ',
                  ],
                ].map(([Icon, num, title, desc]) => (
                  <article key={num}>
                    <div className="benefit-top">
                      <Icon size={25} strokeWidth={1.3} />
                      <span>{num}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>
              <p className="benefit-disclaimer">
                สิทธิพิเศษและกิจกรรมเป็นไปตามประกาศและเงื่อนไขของร้านในแต่ละช่วงเวลา
              </p>
            </section>
          </>
        )}
        {authMode && (
          <section id="register" className="registration auth-route">
            <div className="register-copy">
              {authMode === 'login' ? (
                <>
                  <div className="eyebrow">8 SIAN MEMBER CLUB</div>
                  <h2>
                    เข้าสู่ระบบ
                    <br />
                    เพื่อใช้คูปองของคุณ
                  </h2>
                  <p>เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน แล้วเลือกคูปองที่ต้องการใช้ได้ทันที</p>
                </>
              ) : (
                <>
                  <div className="eyebrow">YOUR NEXT GOOD THING</div>
                  <h2>
                    เริ่มต้นความพิเศษ
                    <br />
                    ด้วยการเป็น<span>สมาชิก.</span>
                  </h2>
                  <p>
                    ใช้เวลาเพียงนิดเดียว แล้วมาพบกัน
                    <br />
                    ที่โต๊ะหมูกระทะตัวโปรดของคุณ
                  </p>
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
              <div className="eyebrow">GOOD TO KNOW</div>
              <h2>สงสัยนิดหน่อย?</h2>
              <p>รวมเรื่องที่คุณอาจอยากรู้ ก่อนเป็นสมาชิก</p>
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
      <footer>
        <a className="brand" href="/">
          <BrandLogo />
          <span>
            8 เซียน<span className="brand-sub">ราชาหมูกระทะ</span>
          </span>
        </a>
        <span>อิ่มอร่อย อบอุ่น เป็นกันเอง</span>
        <small>© {new Date().getFullYear()} 8 Sian. All rights reserved.</small>
      </footer>
      {policy && (
        <div className="modal-backdrop" onClick={() => setPolicy(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="นโยบายความเป็นส่วนตัว"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
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
              เว้นแต่ต้องเก็บตามกฎหมาย
              ผู้ให้บริการโฮสต์และฐานข้อมูลอาจประมวลผลข้อมูลเพื่อให้ระบบทำงาน
            </p>
            <small>เวอร์ชัน 25 ตุลาคม 2569</small>
            <button autoFocus className="button dark" onClick={() => setPolicy(false)}>
              รับทราบและปิด
            </button>
          </section>
        </div>
      )}
    </>
  );
}
