import { useEffect, useMemo, useRef, useState } from 'react';
import { request, apiAssetUrl } from '../../lib/api.js';
import BrandLogo from '../../components/BrandLogo.jsx';
import Dialog from '../../components/Dialog.jsx';
import './ordering.css';
import { createMenuClient } from './menu-client.js';

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
  const [retryAt, setRetryAt] = useState(0),
    [retrySeconds, setRetrySeconds] = useState(0);
  const menuClient = useMemo(() => createMenuClient(token, request), [token]);
  const activeClient = useRef(menuClient),
    currentCart = useRef(cart);
  activeClient.current = menuClient;
  currentCart.current = cart;
  const session = useRef(null),
    sending = useRef(false);
  const storageKey = `table-order-pending:${token}`;
  async function load(force = false) {
    try {
      const data = await menuClient.load(force === true);
      if (activeClient.current !== menuClient) return;
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
      if (
        Object.keys(currentCart.current).some(
          (id) => currentCart.current[id] > 0 && !data.menu.some((item) => item.id === id),
        )
      )
        setMessage('บางเมนูปิดให้สั่งแล้ว กรุณาตรวจรายการที่เลือกก่อนส่ง');
      setCart((old) =>
        Object.fromEntries(
          Object.entries(old).filter(([id]) => data.menu.some((item) => item.id === id)),
        ),
      );
      setRoom(data);
      setError('');
      setCategory((old) =>
        data.menu.some((item) => item.category === old)
          ? old
          : data.categories?.[0] || data.menu[0]?.category || '',
      );
    } catch (error) {
      if (activeClient.current !== menuClient) return;
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
      if (activeClient.current === menuClient) setLoading(false);
    }
  }
  useEffect(() => {
    session.current = null;
    setRoom(null);
    setCart({});
    setReviewOpen(false);
    setLoading(true);
    setPending(null);
    setRetryAt(0);
    try {
      setPending(JSON.parse(localStorage.getItem(storageKey) || 'null'));
    } catch {
      localStorage.removeItem(storageKey);
    }
    load();
    let timer,
      stopped = false;
    const schedule = () => {
      timer = setTimeout(
        async () => {
          if (document.visibilityState !== 'hidden' && !sending.current) await load();
          if (!stopped) schedule();
        },
        60000 + Math.floor(Math.random() * 10000),
      );
    };
    schedule();
    const onFocus = () => {
      if (document.visibilityState !== 'hidden' && !sending.current) load();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [menuClient]);
  useEffect(() => {
    const tick = () => setRetrySeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    if (retryAt <= Date.now()) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  useEffect(() => {
    if (!room?.qrExpiresAt) return;
    const timer = setTimeout(
      () => load(true),
      Math.max(1000, new Date(room.qrExpiresAt).getTime() - Date.now() + 100),
    );
    return () => clearTimeout(timer);
  }, [room?.qrExpiresAt, menuClient]);
  async function submit() {
    if (sending.current || !room || Date.now() < retryAt) return;
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
      setRetryAt(Date.now() + 5000);
    } catch (error) {
      if (error.status === 429) setRetryAt(Date.now() + (error.retryAfter || 5) * 1000);
      if (error.status === 409) setRetryAt(Date.now() + 1000);
      if ([400, 403, 404].includes(error.status)) {
        localStorage.removeItem(storageKey);
        setPending(null);
        await load(true);
      }
      setError(error.message);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  const categories = room?.categories || [
    ...new Set(room?.menu.map((item) => item.category) || []),
  ];
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
          <button onClick={() => load(true)} disabled={busy}>
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
          {room.qrExpiresAt && (
            <p className="ordering-qr-expiry">
              QR สั่งอาหารใช้ได้ถึง {new Date(room.qrExpiresAt).toLocaleString('th-TH')}
            </p>
          )}
          <nav
            className="ordering-categories"
            aria-label="หมวดหมู่อาหาร เลื่อนซ้ายขวาเพื่อดูหมวดหมู่"
          >
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
            <button disabled={busy || retrySeconds > 0 || (!quantity && !pending)} onClick={submit}>
              {busy
                ? 'กำลังส่ง…'
                : retrySeconds > 0
                  ? `รอ ${retrySeconds} วินาที`
                  : pending
                    ? 'ตรวจผล / ส่งรายการเดิมอีกครั้ง'
                    : 'ส่งรายการอาหาร'}
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
                  disabled={busy || retrySeconds > 0 || (!quantity && !pending)}
                  onClick={submit}
                >
                  {busy
                    ? 'กำลังส่ง…'
                    : retrySeconds > 0
                      ? `รอ ${retrySeconds} วินาที`
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
