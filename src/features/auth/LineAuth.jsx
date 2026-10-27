import { useEffect, useRef, useState } from 'react';
import { request, lineLoginUrl } from '../../lib/api.js';
import './line-auth.css';

const errors = {
  expired: 'หมดเวลาหรือเปิดการเข้าสู่ระบบหลายหน้าต่าง กรุณาลองใหม่',
  cancelled: 'คุณยกเลิกการเข้าสู่ระบบด้วย LINE สามารถลองใหม่ได้',
  failed: 'ยังเข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
};

export default function LineAuth() {
  const [enabled, setEnabled] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try {
      setEnabled((await request('/api/auth/line/status')).enabled);
    } catch {
      setError('ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  }
  useEffect(() => {
    load();
  }, []);
  const callbackError =
    errors[
      new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get(
        'line_error',
      )
    ];
  return (
    <div className="line-auth-stack">
      <section className="line-auth-card" aria-labelledby="line-auth-title">
        <span className="line-auth-kicker">8 SIAN MEMBER CLUB</span>
        <h2 id="line-auth-title">เข้าสู่ระบบด้วย LINE</h2>
        <p>ใช้บัญชีและชื่อ LINE ของคุณ เปิดดูคูปองได้เลย ไม่ต้องกรอกข้อมูลสมัครสมาชิก</p>
        {callbackError && (
          <p className="error" role="alert">
            {callbackError}
          </p>
        )}
        <p className="line-auth-note">
          เมื่อดำเนินการต่อ ระบบจะใช้ชื่อและรหัสผู้ใช้ LINE เพื่อสร้างหรือเข้าสู่บัญชีสมาชิก ตาม{' '}
          <a href="/privacy">นโยบายความเป็นส่วนตัว</a>
        </p>
        {enabled === true && (
          <a className="button line-login-button" href={lineLoginUrl}>
            เข้าสู่ระบบด้วย LINE
          </a>
        )}
        {enabled === null && !error && <p role="status">กำลังตรวจสอบช่องทางเข้าสู่ระบบ…</p>}
        {enabled === false && (
          <p role="status">LINE Login กำลังเตรียมเปิดให้บริการ กรุณาลองใหม่ภายหลัง</p>
        )}
        {error && (
          <>
            <p className="error" role="alert">
              {error}
            </p>
            <button className="button dark" onClick={load}>
              ลองอีกครั้ง
            </button>
          </>
        )}
        {enabled === true && (
          <a className="line-policy-link" href={lineLoginUrl + '?intent=link'}>
            มีคูปองในบัญชีเบอร์โทรเดิม? เชื่อมสมาชิกเดิมก่อนเข้าใช้ครั้งแรก
          </a>
        )}
      </section>
    </div>
  );
}

// Optional migration path only. Ordinary LINE login never visits this form.
export function LineComplete() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [form, setForm] = useState({ phone: '', password: '', privacyConsent: false });
  useEffect(() => {
    request('/api/auth/line/pending')
      .then(() => setReady(true))
      .catch((e) => setError(e.message));
  }, []);
  function field(e) {
    const { name, type, checked, value } = e.target;
    setForm((old) => ({ ...old, [name]: type === 'checkbox' ? checked : value }));
  }
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/line/link', { method: 'POST', body: JSON.stringify(form) });
      window.location.replace('/coupons');
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="line-complete-page">
      <section className="line-auth-card">
        <a href="/" className="line-auth-kicker">
          8 เซียนราชาหมูกระทะ
        </a>
        <h1>เชื่อมสมาชิกเดิม</h1>
        <p>สำหรับผู้ที่มีบัญชีเบอร์โทรและคูปองเดิม ยืนยันครั้งเดียวเพื่อใช้บัญชีเดิมผ่าน LINE</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!ready && !error && <p role="status">กำลังตรวจสอบ LINE…</p>}
        {ready && (
          <form className="line-profile-form" onSubmit={submit}>
            <fieldset disabled={busy}>
              <legend>ยืนยันบัญชีเดิมครั้งเดียว</legend>
              <label>
                เบอร์โทรของสมาชิกเดิม
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
                  pattern="0[689][0-9]{8}"
                  maxLength={10}
                  value={form.phone}
                  onChange={field}
                  required
                />
              </label>
              <label>
                รหัสผ่านเดิม
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  value={form.password}
                  onChange={field}
                  required
                />
              </label>
              <p>หากลืมรหัสผ่าน กรุณาติดต่อร้านเพื่อยืนยันตัวตนก่อนเชื่อม LINE</p>
              <label className="line-checkbox">
                <input
                  name="privacyConsent"
                  type="checkbox"
                  checked={form.privacyConsent}
                  onChange={field}
                  required
                />
                <span>
                  ยอมรับ{' '}
                  <a href="/privacy" target="_blank" rel="noreferrer">
                    นโยบายความเป็นส่วนตัว
                  </a>{' '}
                  และการเชื่อมบัญชี LINE
                </span>
              </label>
              <button className="button line-login-button" type="submit">
                {busy ? 'กำลังบันทึก…' : 'ยืนยันเชื่อมสมาชิกเดิม'}
              </button>
            </fieldset>
          </form>
        )}
        <a className="line-policy-link" href="/login">
          กลับหน้าเข้าสู่ระบบ
        </a>
      </section>
    </main>
  );
}
