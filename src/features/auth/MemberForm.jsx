import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, ShieldCheck, LoaderCircle, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import './auth.css';
import { request } from '../../lib/api.js';
const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  password: '',
  confirmPassword: '',
  privacyConsent: false,
  marketingConsent: false,
};
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
export default function MemberForm({ onPolicy, onAuthenticated, authShortcut }) {
  const [mode, setMode] = useState('register'),
    [step, setStep] = useState(1),
    [member, setMember] = useState(null),
    [form, setForm] = useState(emptyForm),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [recovery, setRecovery] = useState(false);
  const firstInput = useRef(null),
    submitLock = useRef(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = setTimeout(() => setRetrySeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [retrySeconds]);
  async function initialize() {
    setError('');
    setReady(false);
    try {
      try {
        const result = await request('/api/members/me');
        setMember(result.member);
      } catch (e) {
        if (e.status !== 401) throw e;
      }
      setReady(true);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    initialize();
  }, []);
  useEffect(() => {
    if (member && onAuthenticated) onAuthenticated(member);
  }, [member, onAuthenticated]);
  useEffect(() => {
    if (ready) firstInput.current?.focus();
  }, [step, mode, ready]);
  useEffect(() => {
    if (authShortcut) {
      changeMode(authShortcut.mode);
      firstInput.current?.focus();
    }
  }, [authShortcut]);
  function field(e) {
    const { name, type, checked, value } = e.target;
    setForm((old) => ({ ...old, [name]: type === 'checkbox' ? checked : value }));
  }
  function changeMode(value) {
    if (submitLock.current) return;
    setMode(value);
    setStep(1);
    setError('');
    setRecovery(false);
    setForm((old) => ({ ...old, password: '', confirmPassword: '' }));
  }
  async function submit(e) {
    e.preventDefault();
    if (submitLock.current || busy || retrySeconds > 0) return;
    setError('');
    if (mode === 'register' && step === 1) {
      setStep(2);
      return;
    }
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    submitLock.current = true;
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      const body = mode === 'login' ? { phone: form.phone, password: form.password } : payload;
      const [outcome] = await Promise.allSettled([
        request(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (outcome.status === 'rejected') throw outcome.reason;
      setMember(outcome.value.member);
      setForm({ ...emptyForm });
    } catch (e) {
      setError(e.message);
      if (e.status === 429) setRetrySeconds(e.retryAfter || 60);
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/logout', { method: 'POST' });
      setMember(null);
      changeMode('login');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="form-card" aria-busy={busy}>
        {member ? (
          <div className="success">
            <div className="success-icon">
              <Check size={30} />
            </div>
            <div className="eyebrow">WELCOME TO THE CLUB</div>
            <h2>ยินดีต้อนรับ คุณ{member.firstName}</h2>
            <p>คุณเป็นสมาชิกครอบครัว 8 เซียนแล้ว</p>
            <div className="digital-member">
              <span>8 SIAN MEMBER</span>
              <h3>
                {member.firstName} {member.lastName}
              </h3>
              <strong>{member.memberNumber}</strong>
            </div>
            <p>แสดงบัตรนี้กับพนักงานเมื่อมาใช้บริการ</p>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button dark" onClick={logout} disabled={busy}>
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => changeMode('register')}
                disabled={busy}
              >
                สมัครสมาชิก
              </button>
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => changeMode('login')}
                disabled={busy}
              >
                เข้าสู่ระบบ
              </button>
            </div>
            <div className="form-heading">
              <h3>
                {mode === 'login'
                  ? 'ยินดีต้อนรับกลับมา'
                  : step === 1
                    ? 'เริ่มต้นเป็นสมาชิก'
                    : 'ตั้งรหัสผ่านของคุณ'}
              </h3>
              <span>MEMBERSHIP</span>
            </div>
            <p className="form-subtitle">
              {mode === 'login'
                ? 'เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน'
                : step === 1
                  ? 'กรอกข้อมูลของคุณ เพื่อเริ่มต้นความพิเศษ'
                  : 'ใช้รหัสผ่านนี้ร่วมกับเบอร์โทรศัพท์เพื่อเข้าสู่ระบบ'}
            </p>
            {mode === 'register' && (
              <ol className="registration-progress" aria-label="ขั้นตอนสมัครสมาชิก">
                <li
                  className={step === 1 ? 'current' : 'done'}
                  aria-current={step === 1 ? 'step' : undefined}
                >
                  <span>{step === 2 ? <Check size={12} /> : 1}</span> ข้อมูลสมาชิก
                </li>
                <li
                  className={step === 2 ? 'current' : ''}
                  aria-current={step === 2 ? 'step' : undefined}
                >
                  <span>2</span> ตั้งรหัสผ่าน
                </li>
              </ol>
            )}
            {!ready ? (
              <div className="auth-loading">
                {error ? (
                  <>
                    <p className="error" role="alert">
                      {error}
                    </p>
                    <button className="button dark" onClick={initialize}>
                      ลองเชื่อมต่ออีกครั้ง
                    </button>
                  </>
                ) : (
                  <>
                    <LoaderCircle size={18} className="spin" /> กำลังเชื่อมต่อระบบ…
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={submit} key={`${mode}-${step}`}>
                <fieldset disabled={busy}>
                  <legend className="sr-only">
                    {mode === 'login' ? 'เข้าสู่ระบบ' : `สมัครสมาชิก ขั้นตอน ${step}`}
                  </legend>
                  {(mode === 'login' || step === 1) && (
                    <label>
                      เบอร์โทรศัพท์ <em>*</em>
                      <input
                        ref={firstInput}
                        name="phone"
                        type="tel"
                        autoComplete={mode === 'login' ? 'username' : 'tel'}
                        inputMode="numeric"
                        pattern="0[689][0-9]{8}"
                        maxLength={10}
                        placeholder="08X XXX XXXX"
                        required
                        value={form.phone}
                        onChange={field}
                      />
                    </label>
                  )}
                  {mode === 'register' && step === 1 && (
                    <>
                      <p className="input-note">
                        ใช้เป็นชื่อบัญชีสำหรับเข้าสู่ระบบ กรุณากรอกเบอร์ที่ใช้งานจริง
                      </p>
                      <div className="name-grid">
                        <label>
                          ชื่อ <em>*</em>
                          <input
                            name="firstName"
                            autoComplete="given-name"
                            placeholder="ชื่อจริง"
                            maxLength={80}
                            required
                            pattern=".*\S.*"
                            value={form.firstName}
                            onChange={field}
                          />
                        </label>
                        <label>
                          นามสกุล <em>*</em>
                          <input
                            name="lastName"
                            autoComplete="family-name"
                            placeholder="นามสกุล"
                            maxLength={80}
                            required
                            pattern=".*\S.*"
                            value={form.lastName}
                            onChange={field}
                          />
                        </label>
                      </div>
                      <label>
                        วัน เดือน ปีเกิด <em>*</em>
                        <input
                          type="date"
                          name="birthDate"
                          autoComplete="bday"
                          min="1900-01-01"
                          max={today}
                          required
                          value={form.birthDate}
                          onChange={field}
                        />
                      </label>
                      <p className="input-note">
                        เลือกวันเกิดตามปฏิทิน เพื่อดูแลข้อมูลสมาชิกของคุณ
                      </p>
                    </>
                  )}
                  {mode === 'register' && step === 2 && (
                    <div className="registration-summary">
                      <span>บัญชีสมาชิก</span>
                      <strong>{form.phone}</strong>
                      <small>
                        {form.firstName} {form.lastName}
                      </small>
                    </div>
                  )}
                  {(mode === 'login' || step === 2) && (
                    <label className="password-field">
                      รหัสผ่าน <em>*</em>
                      <input
                        ref={mode === 'register' ? firstInput : undefined}
                        type="password"
                        name="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        placeholder={mode === 'register' ? 'อย่างน้อย 8 ตัวอักษร' : 'กรอกรหัสผ่าน'}
                        minLength={mode === 'register' ? 8 : 1}
                        maxLength={128}
                        required
                        value={form.password}
                        onChange={field}
                      />
                    </label>
                  )}
                  {mode === 'register' && step === 2 && (
                    <>
                      <label className="password-field">
                        ยืนยันรหัสผ่าน <em>*</em>
                        <input
                          type="password"
                          name="confirmPassword"
                          autoComplete="new-password"
                          placeholder="กรอกรหัสผ่านอีกครั้ง"
                          minLength={8}
                          maxLength={128}
                          required
                          value={form.confirmPassword}
                          onChange={field}
                        />
                      </label>
                      <p className="input-note">แนะนำให้ใช้รหัสผ่านยาวและไม่ซ้ำกับบัญชีอื่น</p>
                      <label className="checkbox">
                        <input
                          name="privacyConsent"
                          type="checkbox"
                          required
                          checked={form.privacyConsent}
                          onChange={field}
                        />
                        <span>
                          ฉันได้อ่านและยอมรับ
                          <button type="button" className="text-button" onClick={onPolicy}>
                            นโยบายความเป็นส่วนตัว
                          </button>{' '}
                          <em>*</em>
                        </span>
                      </label>
                      <label className="checkbox">
                        <input
                          name="marketingConsent"
                          type="checkbox"
                          checked={form.marketingConsent}
                          onChange={field}
                        />
                        <span>ฉันต้องการรับข่าวสารและสิทธิพิเศษจากร้าน (ไม่บังคับ)</span>
                      </label>
                    </>
                  )}
                  {error && (
                    <p role="alert" className="error">
                      {error}
                    </p>
                  )}
                  {retrySeconds > 0 && (
                    <p className="input-note">ทำรายการได้อีกครั้งใน {retrySeconds} วินาที</p>
                  )}
                  <div className="form-actions">
                    {mode === 'register' && step === 2 && (
                      <button
                        className="button back-button"
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setError('');
                        }}
                      >
                        <ArrowLeft size={16} /> ย้อนกลับ
                      </button>
                    )}
                    <button
                      className="button submit"
                      disabled={busy || retrySeconds > 0}
                      type="submit"
                    >
                      {busy ? (
                        <>
                          <LoaderCircle size={18} className="spin" /> กำลังดำเนินการ…
                        </>
                      ) : retrySeconds > 0 ? (
                        `รอ ${retrySeconds} วินาที`
                      ) : (
                        <>
                          {mode === 'login'
                            ? 'เข้าสู่ระบบ'
                            : step === 1
                              ? 'ถัดไป'
                              : 'ยืนยันสมัครสมาชิก'}{' '}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="recovery">
                      <button
                        type="button"
                        className="text-button"
                        aria-expanded={recovery}
                        onClick={() => setRecovery(!recovery)}
                      >
                        ลืมรหัสผ่าน?
                      </button>
                      {recovery && (
                        <p role="status">
                          กรุณาติดต่อพนักงานที่ร้านเพื่อขอความช่วยเหลือและตรวจสอบตัวตน
                          ระบบยังไม่รองรับการรีเซ็ตรหัสผ่านด้วยตนเอง
                        </p>
                      )}
                    </div>
                  )}
                  <div className="form-foot">
                    <ShieldCheck size={13} />{' '}
                    {mode === 'register'
                      ? 'สมัครสมาชิกฟรี ไม่มีค่าธรรมเนียม'
                      : 'ดูแลข้อมูลบัญชีของคุณอย่างปลอดภัย'}
                  </div>
                </fieldset>
              </form>
            )}
          </>
        )}
      </div>
      {busy &&
        submitLock.current &&
        createPortal(
          <div
            className="auth-page-loading"
            role="status"
            aria-live="polite"
            tabIndex={-1}
            ref={(element) => element?.focus()}
            onKeyDown={(e) => {
              if (e.key === 'Tab') e.preventDefault();
            }}
          >
            <div className="auth-loading-panel">
              <LoaderCircle size={34} className="spin" strokeWidth={1.5} />
              <strong>{mode === 'login' ? 'กำลังเข้าสู่ระบบ' : 'กำลังสมัครสมาชิก'}</strong>
              <span>กรุณารอสักครู่…</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
