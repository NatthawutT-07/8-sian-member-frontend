import { useEffect, useRef, useState } from 'react';
import { request, lineLoginUrl } from '../../lib/api.js';
import './line-auth.css';

const errors = {
  expired: 'หมดเวลา กรุณาลองใหม่',
  cancelled: 'ยกเลิกการเข้าสู่ระบบแล้ว',
  failed: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่',
};

export default function LineAuth() {
  const [enabled, setEnabled] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    setEnabled(null);
    try {
      try {
        const { member } = await request('/api/members/me');
        if (member) {
          window.location.replace('/coupons');
          return;
        }
      } catch (error) {
        // Only an expired/missing session should return the user to LINE login.
        if (error.status !== 401) throw error;
      }
      setEnabled((await request('/api/auth/line/status')).enabled);
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่');
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
        <span className="line-auth-kicker">สมาชิก 8 เซียน</span>
        <h2 id="line-auth-title">เข้าสู่ระบบด้วย LINE</h2>
        <p>เข้าใช้ LINE เพื่อดูคูปองของคุณ</p>
        {callbackError && (
          <p className="error" role="alert">
            {callbackError}
          </p>
        )}
        <p className="line-auth-note">
          ใช้ชื่อและรหัสผู้ใช้ LINE ตาม{' '}
          <a href="/privacy">นโยบายความเป็นส่วนตัว</a>
        </p>
        {enabled === true && (
          <a className="button line-login-button" href={lineLoginUrl}>
            เข้าสู่ระบบด้วย LINE
          </a>
        )}
        {enabled === null && !error && <p role="status">กำลังเชื่อมต่อ…</p>}
        {enabled === false && (
          <p role="status">LINE ยังไม่พร้อม กรุณาลองภายหลัง</p>
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
            เชื่อมบัญชีเดิมเพื่อใช้คูปองต่อ
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
        <p>ยืนยันบัญชีเดิมเพื่อเก็บคูปองไว้</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!ready && !error && <p role="status">กำลังตรวจสอบ LINE…</p>}
        {ready && (
          <form className="line-profile-form" onSubmit={submit}>
            <fieldset disabled={busy}>
              <legend>บัญชีเดิม</legend>
              <label>
                เบอร์โทรเดิม
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
              <p>ลืมรหัสผ่าน? ติดต่อร้าน</p>
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
                {busy ? 'กำลังบันทึก…' : 'เชื่อมบัญชี'}
              </button>
            </fieldset>
          </form>
        )}
        <a className="line-policy-link" href="/login">
          กลับไปเข้าสู่ระบบ
        </a>
      </section>
    </main>
  );
}
