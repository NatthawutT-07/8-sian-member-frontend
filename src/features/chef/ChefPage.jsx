import { useEffect, useRef, useState } from 'react';
import { request } from '../../lib/api.js';
import Dialog from '../../components/Dialog.jsx';
import ChefPrinter from './ChefPrinter.jsx';
import { printSystemTicket } from './system-print.js';
import './chef.css';

const api = (path, body) => request(`/api/pos/${path}`, body === undefined ? {} : {
  method: 'POST', body: JSON.stringify(body),
});
const time = (value) => new Date(value).toLocaleTimeString('th-TH');

export default function ChefPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState('');
  const [updated, setUpdated] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const lock = useRef(false);
  const generation = useRef(0);
  const printer = useRef(null);
  const [printNotice, setPrintNotice] = useState('');

  function failed(err) {
    setError(err.message);
    if (err.status === 401) {
      generation.current++;
      setUser(null); setOrders([]); setTables([]); setDetail(null); setUpdated(null);
    }
  }

  async function refresh(version = generation.current) {
    const [nextOrders, nextTables] = await Promise.all([api('kitchen/orders'), api('kitchen/tables')]);
    if (version !== generation.current) return;
    setOrders(nextOrders); setTables(nextTables); setUpdated(new Date()); setError('');
    setSelected((value) => nextTables.some((table) => `${table.id}/${table.sessionId}` === value) ? value : '');
    setDetail((value) => value && nextTables.some((table) => table.id === value.tableId && table.sessionId === value.sessionId) ? value : null);
  }

  async function run(action) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await action(); } catch (err) { failed(err); }
    finally { lock.current = false; setBusy(false); }
  }

  useEffect(() => {
    let active = true;
    api('me').then((value) => { if (active) setUser(value); })
      .catch((err) => { if (active && err.status !== 401) setError(err.message); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const version = ++generation.current;
    async function poll() {
      if (!active || lock.current) return;
      lock.current = true;
      try { await refresh(version); }
      catch (err) { if (active) failed(err); }
      finally { lock.current = false; }
    }
    poll();
    const timer = setInterval(poll, 5000);
    return () => { active = false; generation.current++; clearInterval(timer); };
  }, [user]);

  async function summary(tableId, sessionId) {
    const data = await api(`kitchen/tables/${tableId}/${sessionId}/summary`);
    setDetail({ ...data, tableId, sessionId, kind: 'summary' });
  }
  async function change(order, item, cancel = false) {
    if (cancel && !window.confirm(item ? `ยกเลิก ${item.name} × ${item.quantity} ของโต๊ะ ${order.table.number}?` : `ยกเลิกออเดอร์ทั้งใบของโต๊ะ ${order.table.number}?`)) return;
    try {
      await api(`kitchen/orders/${order.id}/${cancel ? 'cancel' : 'complete'}`, cancel ? {
        sessionId: order.sessionId, ...(item ? { menuItemId: item.menuItemId } : {}),
      } : {});
    } finally { await refresh(); }
  }

  return <main className="chef-page">
    <header className="chef-header"><div><a href="/">8 เซียน</a><h1>ครัว · ออเดอร์อาหาร</h1></div>
      {user && <div><span>{user.displayName || user.username}</span> <button disabled={busy} onClick={() => run(async () => {
        await api('logout', {}); generation.current++; setUser(null); setOrders([]); setTables([]); setDetail(null); setUpdated(null);
      })}>ออกจากระบบ</button></div>}
    </header>
    {error && <p className="chef-error" role="alert">{error}</p>}
    {checking ? <p role="status">กำลังตรวจสอบการเข้าสู่ระบบ…</p> : !user ? <section className="chef-login">
      <h2>เข้าสู่ระบบสำหรับเชฟ</h2><p>ใช้บัญชี CHEF หรือพนักงาน POS ของร้าน</p>
      <form onSubmit={(event) => { event.preventDefault(); run(async () => {
        const value = await api('login', login); setLogin({ username: '', password: '' }); setUser(value);
      }); }}><fieldset disabled={busy}>
        <label>ชื่อผู้ใช้<input required minLength={3} maxLength={80} autoComplete="username" value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} /></label>
        <label>รหัสผ่าน<input required type="password" maxLength={128} autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
        <button className="chef-primary">{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
      </fieldset></form>
    </section> : <>
      <section className="chef-toolbar" aria-label="เครื่องมือครัว">
        <ChefPrinter api={api} onReady={(print) => { printer.current = print; }} />
        <p role="status">{updated ? `${orders.length} ออเดอร์รอทำ · เก่าไปใหม่ · อัปเดต ${time(updated)}` : 'กำลังโหลดออเดอร์…'}<small>อัปเดตอัตโนมัติทุก 5 วินาที</small></p>
        <button disabled={busy} onClick={() => run(refresh)}>รีเฟรช</button>
        <select aria-label="เลือกโต๊ะดูยอดอาหารสำเร็จ" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">เลือกโต๊ะที่ยังมีลูกค้า</option>{tables.map((table) => <option key={table.id} value={`${table.id}/${table.sessionId}`}>โต๊ะ {table.number}</option>)}</select>
        <button disabled={busy || !selected} onClick={() => run(() => summary(...selected.split('/')))}>ยอดอาหารสำเร็จ</button>
      </section>
      {printNotice && <p role="status">{printNotice}</p>}
      <section className="chef-board" aria-label="ออเดอร์รอทำ">{orders.map((order, index) => <article className="chef-order" key={order.id}>
        <div className="chef-order-heading"><h2>โต๊ะ {order.table.number}</h2><strong>ลำดับ {index + 1}</strong></div>
        <p>รับเมื่อ {time(order.createdAt)} · #{order.id.slice(-8)}</p>
        <ul>{order.items.map((item) => <li key={item.menuItemId}><span>{item.name}</span><strong>× {item.quantity}</strong><button disabled={busy} aria-label={`ยกเลิก ${item.name} โต๊ะ ${order.table.number}`} onClick={() => run(() => change(order, item, true))}>ยกเลิก</button></li>)}</ul>
        <div className="chef-actions">
          <button disabled={busy} onClick={() => run(() => summary(order.tableId, order.sessionId))}>ยอดอาหารสำเร็จ</button>
          <button disabled={busy} onClick={() => run(async () => {
            const ticket = await api(`kitchen/orders/${order.id}/ticket`);
            if (window.chefWindowsPrint) {
              const result = await window.chefWindowsPrint(ticket);
              setPrintNotice(result.warning);
            } else if (printer.current) {
              const result = await printer.current(ticket);
              setPrintNotice(result.warning || 'ส่งใบอาหารแล้ว');
            } else {
              const source = document.createElement('section');
              const heading = document.createElement('h2'); heading.textContent = `โต๊ะ ${ticket.tableNumber}`; source.append(heading);
              const list = document.createElement('ul');
              for (const item of ticket.items) { const row = document.createElement('li'); row.textContent = `${item.name} × ${item.quantity}`; list.append(row); }
              source.append(list); await printSystemTicket(source);
            }
          })}>พิมพ์</button>
          <button disabled={busy} onClick={() => run(() => change(order, null, true))}>ยกเลิกทั้งใบ</button>
          <button className="chef-primary" disabled={busy} onClick={() => run(() => change(order))}>สำเร็จแล้ว</button>
        </div>
      </article>)}</section>
      {updated && !orders.length && <p className="chef-empty">ยังไม่มีออเดอร์รอทำ</p>}
    </>}
    {detail && <Dialog label={detail.kind === 'ticket' ? 'ใบอาหาร' : 'ยอดอาหารสำเร็จ'} className="chef-dialog" busy={busy} onClose={() => setDetail(null)}>
      <div className="chef-ticket"><h2>{detail.kind === 'ticket' ? 'ใบอาหาร' : 'อาหารที่สำเร็จแล้ว'} · โต๊ะ {detail.tableNumber}</h2>
        <p>{detail.kind === 'ticket' ? `#${detail.id.slice(-8)} · ${time(detail.createdAt)}` : `บิล ${detail.receiptNumber || '—'}`}</p>
        <ul>{detail.items.filter((item) => (detail.kind === 'ticket' ? item.quantity : item.completed ?? item.quantity) > 0).map((item) => <li key={item.menuItemId}><span>{item.name}</span><strong>× {detail.kind === 'ticket' ? item.quantity : item.completed ?? item.quantity}</strong></li>)}</ul>
        {!detail.items.length && <p>ยังไม่มีอาหารที่ทำสำเร็จในรอบนี้</p>}
      </div>
      <div className="chef-actions">{detail.kind === 'ticket' && <button disabled={busy} onClick={() => run(async () => {
        const live = await api(`kitchen/orders/${detail.id}/ticket`);
        if (printer.current) {
          const result = await printer.current(live);
          setPrintNotice(result.warning || 'ส่งใบอาหารเข้าเครื่องพิมพ์แล้ว กรุณาตรวจที่เครื่อง');
          return;
        }
        setDetail({ ...live, kind: 'ticket' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await printSystemTicket(document.querySelector('.chef-ticket'));
      })}>พิมพ์</button>}<button disabled={busy} onClick={() => setDetail(null)}>ปิด</button></div>
    </Dialog>}
  </main>;
}
