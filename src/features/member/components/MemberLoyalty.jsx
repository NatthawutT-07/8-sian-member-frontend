import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QrCode, LoaderCircle, RefreshCw } from 'lucide-react';
import { request } from '../../../lib/api.js';
import Dialog from '../../../components/Dialog.jsx';
import CouponQrCode from './CouponQrCode.jsx';
import './member-loyalty.css';

function formatPhone(value) {
  return value.replace(/\D/g, '').slice(0, 10).replace(/^(\d{3})(\d)/, '$1-$2').replace(/^(\d{3}-\d{3})(\d)/, '$1-$2');
}

export default function MemberLoyalty({ member }) {
  const [phone, setPhone] = useState(member.phone || '');
  const [input, setInput] = useState('');
  const [confirmPhone, setConfirmPhone] = useState(false);
  const [count, setCount] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [qr, setQr] = useState(null);
  const [now, setNow] = useState(Date.now());
  const lock = useRef(false);
  async function load() {
    try {
      const result = await request('/api/members/me/loyalty');
      setPhone((old) => result.phone || old);
      setCount(result.visitCount);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!open) return;
    load();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(load, 5000);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, [open]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  async function createCode() {
    const result = await request('/api/members/me/loyalty-code', { method: 'POST', body: '{}' });
    setQr(result);
    setNow(Date.now());
  }
  async function show() {
    if (lock.current) return;
    setOpen(true);
    setQr(null);
    setError('');
    setConfirmPhone(false);
    if (!phone) return;
    lock.current = true;
    setBusy(true);
    try {
      await createCode();
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function savePhone(e) {
    e.preventDefault();
    if (lock.current) return;
    if (!confirmPhone) {
      setError('');
      setConfirmPhone(true);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await request('/api/members/me/phone', {
        method: 'POST',
        body: JSON.stringify({ phone: input }),
      });
      setPhone(result.member.phone);
      setInput('');
      setConfirmPhone(false);
      await createCode();
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const validQr = qr && new Date(qr.expiresAt).getTime() > now;
  return (
    <>
      <div className="member-loyalty">
        <span>
          สะสม <b>{count === null ? '—' : count}</b> ครั้ง
        </span>
        <button type="button" onClick={show} disabled={loading} aria-label="สะสมครั้ง">
          <QrCode size={17} /> 
        </button>
        {!open && error && (
          <small role="alert">
            {error}{' '}
            <button
              type="button"
              onClick={() => {
                setError('');
                load();
              }}
            >
              ลองใหม่
            </button>
          </small>
        )}
      </div>
      {open &&
        createPortal(
          <Dialog
            className="member-loyalty-dialog"
            label="สะสมครั้งที่มาทาน"
            onClose={() => setOpen(false)}
            busy={busy}
          >
            {phone ? (
              <>
                <p className="loyalty-phone">{formatPhone(phone)}</p>
                {busy ? (
                  <p role="status">
                    <LoaderCircle className="spin" size={20} /> กำลังสร้าง QR…
                  </p>
                ) : validQr ? (
                  <>
                    <CouponQrCode value={qr.code} label="QR สมาชิกสำหรับสะสมครั้ง" />
                    <p>สแกน QR หรือแจ้งเบอร์นี้ที่ร้าน</p>
                    <small>
                      QR ใช้ได้อีก{' '}
                      {Math.max(0, Math.ceil((new Date(qr.expiresAt).getTime() - now) / 60000))}{' '}
                      นาที
                    </small>
                  </>
                ) : (
                  <button className="button dark" type="button" onClick={show}>
                    <RefreshCw size={16} /> สร้าง QR ใหม่
                  </button>
                )}
              </>
            ) : (
              <form className="loyalty-phone-form" onSubmit={savePhone}>
                <p>{confirmPhone ? 'กรุณาตรวจสอบเบอร์โทรก่อนยืนยันการบันทึก' : 'เพิ่มเบอร์โทรเพื่อสะสมครั้ง'}</p>
                <label htmlFor="loyalty-phone">
                  เบอร์โทร
                  <input
                    id="loyalty-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="0[689][0-9]-[0-9]{3}-[0-9]{4}"
                    maxLength={12}
                    value={formatPhone(input)}
                    onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    readOnly={confirmPhone}
                    disabled={busy}
                    required
                  />
                </label>
                <small>
                  ใช้ค้นหาสมาชิกและบันทึกการมาทาน ตาม{' '}
                  <a href="/privacy" target="_blank" rel="noreferrer">
                    นโยบายความเป็นส่วนตัว
                  </a>
                </small>
                <button className="button dark" disabled={busy}>
                  {busy ? 'กำลังบันทึก…' : confirmPhone ? 'ยืนยันบันทึกและแสดง QR' : 'ตรวจสอบเบอร์โทร'}
                </button>
                {confirmPhone && (
                  <button
                    className="cancel-redeem"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setConfirmPhone(false);
                      setError('');
                    }}
                  >
                    แก้ไขเบอร์โทร
                  </button>
                )}
              </form>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="cancel-redeem"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              ปิด
            </button>
          </Dialog>,
          document.body,
        )}
    </>
  );
}
