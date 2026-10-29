import { useRef, useState } from 'react';
import { Search, Plus, QrCode } from 'lucide-react';
import './admin-loyalty.css';

export default function AdminLoyalty({ api }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [receipt, setReceipt] = useState('');
  const [issued, setIssued] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);
  async function lookup(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    setResult(null);
    setReceipt('');
    setIssued(false);
    try {
      setResult(
        await api('/loyalty/lookup', {
          method: 'POST',
          body: JSON.stringify({ query: query.trim() }),
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function record(e) {
    e.preventDefault();
    if (lock.current || !result || !issued) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await api('/loyalty/visits', {
        method: 'POST',
        body: JSON.stringify({
          memberId: result.member.id,
          receiptNumber: receipt.trim(),
          receiptIssued: issued,
        }),
      });
      setResult((old) => ({ ...old, visitCount: data.visitCount, visits: data.visits }));
      setNotice(data.message);
      setReceipt('');
      setIssued(false);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="admin-panel admin-loyalty">
      <p className="admin-help">สแกน QR สมาชิก หรือค้นด้วยเบอร์โทร / เลขสมาชิก</p>
      <form className="loyalty-lookup-form" onSubmit={lookup}>
        <label htmlFor="loyalty-member-search">ค้นหาสมาชิก</label>
        <div>
          <input
            id="loyalty-member-search"
            value={query}
            maxLength={80}
            autoComplete="off"
            placeholder="สแกน QR หรือกรอกเบอร์โทร"
            disabled={busy}
            onChange={(e) => {
              setQuery(e.target.value);
              setResult(null);
              setNotice('');
            }}
            required
          />
          <button className="admin-primary" disabled={busy}>
            <Search size={16} /> ค้นหา
          </button>
        </div>
      </form>
      <p className="admin-help">เครื่องสแกนแบบส่งข้อความ: คลิกช่องค้นหา แล้วสแกนและกด Enter</p>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="admin-notice">
          {notice}
        </p>
      )}
      {result && (
        <div className="loyalty-member-result">
          <div className="loyalty-member-summary">
            <div>
              <h3>
                {result.member.firstName} {result.member.lastName}
              </h3>
              <p>
                {result.member.memberNumber} · {result.member.phone}
              </p>
            </div>
            <strong>
              {result.visitCount} <small>ครั้ง</small>
            </strong>
          </div>
          <form className="loyalty-receipt-form" onSubmit={record}>
            <label>
              เลขใบเสร็จ
              <input
                value={receipt}
                onChange={(e) => setReceipt(e.target.value)}
                maxLength={80}
                autoComplete="off"
                placeholder="เช่น 20261027-001"
                disabled={busy}
                required
              />
            </label>
            <label className="loyalty-confirm">
              <input
                type="checkbox"
                checked={issued}
                onChange={(e) => setIssued(e.target.checked)}
                disabled={busy}
                required
              />
              <span>ชำระเงินและออกใบเสร็จแล้ว</span>
            </label>
            <button className="admin-primary" disabled={busy || !issued || !receipt.trim()}>
              <Plus size={16} /> {busy ? 'กำลังบันทึก…' : 'เพิ่ม 1 ครั้ง'}
            </button>
            <small>1 ใบเสร็จสะสมได้ 1 ครั้ง ห้ามใช้เลขซ้ำ</small>
          </form>
          <h3>รายการล่าสุด</h3>
          {result.visits.length ? (
            <ul className="loyalty-visit-list">
              {result.visits.map((visit) => (
                <li key={visit.receiptNumber}>
                  <span>{visit.receiptNumber}</span>
                  <time dateTime={visit.createdAt}>
                    {new Intl.DateTimeFormat('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'Asia/Bangkok',
                    }).format(new Date(visit.createdAt))}
                  </time>
                  <b>+1</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-help">ยังไม่มีรายการ</p>
          )}
        </div>
      )}
    </section>
  );
}
