import { useEffect, useRef, useState } from 'react';
import { request, apiAssetUrl } from '../../lib/api.js';
import BrandLogo from '../../components/BrandLogo.jsx';
import Dialog from '../../components/Dialog.jsx';
import './ordering.css';

export default function OrderingPage({ token }) {
  const [room, setRoom] = useState(null),
    [cart, setCart] = useState({}),
    [category, setCategory] = useState(''),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [pending, setPending] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const session = useRef(null),
    sending = useRef(false);
  const storageKey = `table-order-pending:${token}`;
  async function load() {
    try {
      const data = await request(`/api/ordering/${token}`);
      let storedPending = null;
      try {
        storedPending = JSON.parse(localStorage.getItem(storageKey) || 'null');
      } catch {
        localStorage.removeItem(storageKey);
      }
      if (
        (session.current && session.current !== data.sessionId) ||
        (storedPending && storedPending.sessionId !== data.sessionId)
      ) {
        setCart({});
        setReviewOpen(false);
        setPending(null);
        localStorage.removeItem(storageKey);
        setMessage('โต๊ะเปลี่ยนรอบแล้ว กรุณาเลือกรายการใหม่');
      }
      session.current = data.sessionId;
      setCart((old) =>
        Object.fromEntries(
          Object.entries(old).filter(([id]) => data.menu.some((item) => item.id === id)),
        ),
      );
      setRoom(data);
      setError('');
      setCategory((old) =>
        data.menu.some((item) => item.category === old) ? old : data.menu[0]?.category || '',
      );
    } catch (error) {
      if ([403, 404].includes(error.status)) {
        setRoom(null);
        setReviewOpen(false);
        setCart({});
        setPending(null);
        localStorage.removeItem(storageKey);
        setMessage('');
        session.current = null;
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    try {
      setPending(JSON.parse(localStorage.getItem(storageKey) || 'null'));
    } catch {
      localStorage.removeItem(storageKey);
    }
    load();
    const timer = setInterval(() => {
      if (!sending.current) load();
    }, 10000);
    const onFocus = () => {
      if (!sending.current) load();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [token]);
  async function submit() {
    if (sending.current || !room) return;
    sending.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = pending || {
        key: crypto.randomUUID(),
        sessionId: room.sessionId,
        items: Object.entries(cart)
          .filter(([, quantity]) => quantity > 0)
          .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
      };
      if (!data.items.length) return;
      localStorage.setItem(storageKey, JSON.stringify(data));
      setPending(data);
      await request(`/api/ordering/${token}/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.removeItem(storageKey);
      setPending(null);
      setCart({});
      setReviewOpen(false);
      setMessage('ส่งรายการให้พนักงานแล้ว ขอบคุณค่ะ');
    } catch (error) {
      setError(error.message);
      if ([400, 403, 404].includes(error.status)) {
        localStorage.removeItem(storageKey);
        setPending(null);
        await load();
      }
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  const categories = [...new Set(room?.menu.map((item) => item.category) || [])];
  const visibleCategory = categories.includes(category) ? category : categories[0] || '';
  const quantity = Object.values(cart).reduce((sum, value) => sum + value, 0);
  return (
    <main className="ordering-page">
      <header className="ordering-header">
        <BrandLogo />
        <div>
          <p>8 เซียนราชาหมูกระทะ</p>
          <h1>{room ? `สั่งอาหาร • โต๊ะ ${room.tableNumber}` : 'สั่งอาหารที่โต๊ะ'}</h1>
        </div>
      </header>
      {loading && <p role="status">กำลังเปิดเมนู…</p>}
      {error && (
        <div className="ordering-alert" role="alert">
          <p>{error}</p>
          <button onClick={load} disabled={busy}>
            ตรวจสอบอีกครั้ง
          </button>
        </div>
      )}
      {message && (
        <p className="ordering-success" role="status">
          {message}
        </p>
      )}
      {room && (
        <>
          <nav className="ordering-categories" aria-label="หมวดหมู่อาหาร">
            {categories.map((name) => (
              <button
                key={name}
                aria-pressed={visibleCategory === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </nav>
          {!room.menu.length && <p>โต๊ะนี้ยังไม่มีรายการอาหารที่สั่งได้ กรุณาติดต่อพนักงาน</p>}
          <section className="ordering-menu" aria-label={visibleCategory}>
            {room.menu
              .filter((item) => item.category === visibleCategory)
              .map((item) => (
                <article key={item.id}>
                  {item.imageUrl && (
                    <img
                      src={apiAssetUrl(item.imageUrl)}
                      alt={item.name}
                      width="100"
                      height="100"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  )}
                  <div className="ordering-item-description">
                    <h2>{item.name}</h2>
                    <div className="ordering-quantity">
                      <button
                        aria-label={`ลด ${item.name}`}
                        disabled={busy || !!pending || !cart[item.id]}
                        onClick={() =>
                          setCart((old) => ({
                            ...old,
                            [item.id]: Math.max(0, (old[item.id] || 0) - 1),
                          }))
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{cart[item.id] || 0}</span>
                      <button
                        aria-label={`เพิ่ม ${item.name}`}
                        disabled={
                          busy ||
                          !!pending ||
                          (cart[item.id] || 0) >= 10 ||
                          (!cart[item.id] && Object.values(cart).filter((q) => q > 0).length >= 50)
                        }
                        onClick={() =>
                          setCart((old) => ({
                            ...old,
                            [item.id]: Math.min(10, (old[item.id] || 0) + 1),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </section>
          <footer className="ordering-submit">
            <button
              className="ordering-view-cart"
              disabled={busy || !quantity || !!pending}
              aria-haspopup="dialog"
              onClick={() => setReviewOpen(true)}
            >
              {pending ? 'มีรายการรอยืนยันผล' : `ดูรายการที่เลือก (${quantity})`}
            </button>
            <button disabled={busy || (!quantity && !pending)} onClick={submit}>
              {busy ? 'กำลังส่ง…' : pending ? 'ตรวจผล / ส่งรายการเดิมอีกครั้ง' : 'ส่งรายการอาหาร'}
            </button>
          </footer>
          {reviewOpen && (
            <Dialog
              titleId="ordering-review-title"
              className="ordering-review-dialog"
              onClose={() => setReviewOpen(false)}
              busy={busy}
              dismissOnBackdrop
            >
              <div className="ordering-review-heading">
                <h2 id="ordering-review-title">รายการที่เลือก</h2>
                <button disabled={busy} onClick={() => setReviewOpen(false)}>
                  ปิด
                </button>
              </div>
              <div className="ordering-review-list">
                {room.menu
                  .filter((item) => cart[item.id] > 0)
                  .map((item) => (
                    <p key={item.id}>
                      <span>{item.name}</span>
                      <strong>× {cart[item.id]}</strong>
                    </p>
                  ))}
                {!quantity && <p>ยังไม่มีรายการที่เลือก</p>}
              </div>
              {error && (
                <p role="alert" className="ordering-alert">
                  {error}
                </p>
              )}
              <div className="ordering-review-actions">
                <button disabled={busy} onClick={() => setReviewOpen(false)}>
                  เลือกอาหารต่อ
                </button>
                <button
                  className="ordering-confirm"
                  disabled={busy || (!quantity && !pending)}
                  onClick={submit}
                >
                  {busy
                    ? 'กำลังส่ง…'
                    : pending
                      ? 'ตรวจผล / ส่งรายการเดิมอีกครั้ง'
                      : 'ส่งรายการอาหาร'}
                </button>
              </div>
            </Dialog>
          )}
        </>
      )}
    </main>
  );
}
