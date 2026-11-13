import { useEffect, useRef, useState } from 'react';
import Dialog from '../../components/Dialog.jsx';
import { sendSerial, ticketBytes } from './printer.js';
import { printSystemTicket } from './system-print.js';

export default function ChefPrinter({ api, onReady }) {
  const bridge = window.posHardware;
  const port = useRef(null);
  const working = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [device, setDevice] = useState('');
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState('');
  const [mode, setMode] = useState('system');
  const [baud, setBaud] = useState(9600);
  const [width, setWidth] = useState(576);
  const [cut, setCut] = useState(true);
  const [systemTest, setSystemTest] = useState(false);

  useEffect(() => {
    if (!systemTest) return;
    let frame;
    const first = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        printSystemTicket(document.querySelector('.chef-system-test')).catch((error) => setMessage(error.message)).finally(() => {
          setSystemTest(false);
          setMessage('เปิดหน้าต่างพิมพ์แล้ว เลือก ES-9910UB และตรวจผลที่เครื่อง การปิดหน้าต่างไม่ได้ยืนยันว่าพิมพ์สำเร็จ');
        });
      });
    });
    return () => { cancelAnimationFrame(first); if (frame) cancelAnimationFrame(frame); };
  }, [systemTest]);

  async function work(action) {
    if (working.current) throw new Error('เครื่องพิมพ์กำลังทำงาน กรุณารอสักครู่');
    working.current = true; setBusy(true); setMessage('กำลังติดต่อเครื่องพิมพ์…');
    try { return await action(); }
    catch (error) { setMessage(error.message); throw error; }
    finally { working.current = false; setBusy(false); }
  }
  const click = (action) => { void work(action).catch(() => {}); };

  async function serialPrint(ticket, test = false) {
    const bytes = await ticketBytes(ticket, width, cut);
    const event = { jobId: crypto.randomUUID(), operation: test ? 'TEST_PRINT' : 'PRINT_KITCHEN',
      status: 'REQUESTED', reason: test ? 'ทดสอบพิมพ์จากหน้าครัว' : 'พิมพ์ใบอาหารจากหน้าครัว',
      deviceName: 'Web Serial ESC/POS', ...(!test ? { orderId: ticket.id } : {}) };
    await api('hardware/events', event);
    try { await sendSerial(port.current, bytes); }
    catch (error) {
      await api('hardware/events', { ...event, status: 'FAILED_OR_UNKNOWN' }).catch(() => {});
      throw new Error(`${error.message} · ตรวจใบอาหารก่อนสั่งพิมพ์ซ้ำ`);
    }
    let result = 'ส่งข้อมูลแล้ว กรุณาตรวจว่ามีกระดาษออกจริง';
    try { await api('hardware/events', { ...event, status: 'SENT' }); }
    catch { result += ' · บันทึกผลบนเซิร์ฟเวอร์ไม่สำเร็จ'; }
    setMessage(result);
    return { warning: result };
  }

  useEffect(() => {
    onReady(mode === 'system' ? null : (ticket) => work(async () => {
      const result = mode === 'native' ? await bridge.printKitchenTicket({ orderId: ticket.id }) : await serialPrint(ticket);
      setMessage(result.warning || 'ส่งข้อมูลแล้ว กรุณาตรวจใบอาหารที่เครื่องพิมพ์');
      return result;
    }));
    return () => onReady(null);
  }, [mode, width, cut, onReady]);

  useEffect(() => {
    const serial = navigator.serial;
    const disconnect = (event) => {
      if (event.target === port.current || event.port === port.current) {
        port.current = null; setDevice(''); setMessage('เครื่องพิมพ์หลุดการเชื่อมต่อ กรุณาเชื่อมต่อใหม่');
      }
    };
    serial?.addEventListener('disconnect', disconnect);
    return () => {
      serial?.removeEventListener('disconnect', disconnect);
      const current = port.current;
      if (current) void current.close().catch(() => {});
    };
  }, []);

  return <>
    <button onClick={() => { setOpen(true); if (bridge) click(async () => {
      const { settings } = await bridge.status(); setDevice(settings.deviceName || ''); setCut(settings.cut); setMessage('พร้อมตั้งค่าเครื่องพิมพ์');
    }); }}>เครื่องพิมพ์</button>
    {open && <Dialog label="เชื่อมต่อเครื่องพิมพ์" className="chef-dialog" busy={busy} onClose={() => setOpen(false)}>
      <h2>เชื่อมต่อเครื่องพิมพ์</h2>
      <button className="chef-primary" disabled={busy || systemTest} onClick={() => click(async () => {
        if (port.current) {
          await port.current.close();
          port.current = null;
          setDevice('');
        }
        setMode('system');
        setMessage('กำลังเปิดหน้าต่างพิมพ์ เลือก ES-9910UB แล้วกด Print');
        setSystemTest(true);
      })}>ทดสอบ ES-9910UB ผ่าน Windows</button>
      <p>ES-9910UB ใช้ไดรเวอร์ Windows ปุ่มนี้จะตัดการเชื่อมต่อ Serial ก่อนเปิดหน้าต่างพิมพ์</p>
      <fieldset className="chef-printer-controls" disabled={busy}>
        <label>วิธีพิมพ์<select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="system">หน้าต่างพิมพ์ของระบบ</option>
          {bridge && <option value="native">อุปกรณ์ Bluetooth ของ POS</option>}
          <option value="serial" disabled={!navigator.serial || !window.isSecureContext}>Serial / COM (ESC/POS)</option>
        </select></label>
        {mode === 'system' && <>
          <p>สำหรับ ES-9910UB ให้ติดตั้งไดรเวอร์ Windows ของรุ่นนี้ ผูกกับ Bluetooth COM3 แล้วเลือกเครื่องในหน้าต่างพิมพ์ ตั้งความกว้างกระดาษ 80 มม. และมาตราส่วน 100%</p>
          <p>ถ้าใช้ฉลากเป็นดวง ให้ตั้งความสูงตรงกับฉลากจริงในไดรเวอร์</p>
          <button disabled={systemTest} onClick={() => setSystemTest(true)}>พิมพ์ทดสอบผ่าน Windows</button>
        </>}
        {!navigator.serial && !bridge && <p>หากต้องการเชื่อมต่อ Serial / COM โดยตรง ให้เปิดหน้านี้ผ่าน Chrome หรือ Edge บนคอมพิวเตอร์ที่รองรับ Web Serial และใช้ HTTPS</p>}
        {mode === 'native' && <>
          <button onClick={() => click(async () => { const result = await bridge.list(); setDevices(result.devices); setSelected(result.devices[0]?.id || ''); setMessage(result.devices.length ? 'เลือกเครื่องแล้วกดเชื่อมต่อ' : 'ไม่พบเครื่องพิมพ์ เปิด Bluetooth แล้วค้นหาอีกครั้ง'); })}>ค้นหาเครื่องพิมพ์</button>
          <select aria-label="เครื่องพิมพ์ Bluetooth" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">เลือกเครื่องพิมพ์</option>{devices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <button disabled={!selected} onClick={() => click(async () => { const { settings } = await bridge.connect({ deviceId: selected }); setDevice(settings.deviceName); setMessage('เชื่อมต่อสำเร็จ'); })}>เชื่อมต่อ</button>
        </>}
        {mode === 'serial' && <>
          <p>โหมดนี้ใช้คำสั่ง ESC/POS สำหรับเครื่องพิมพ์ใบเสร็จ สำหรับเครื่องฉลาก ES-9910UB ให้เลือกหน้าต่างพิมพ์ของระบบผ่านไดรเวอร์ Windows</p>
          <label>ความเร็วพอร์ต<select value={baud} onChange={(event) => setBaud(Number(event.target.value))}>{[9600, 19200, 38400, 57600, 115200].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>ขนาดกระดาษ<select value={width} onChange={(event) => setWidth(Number(event.target.value))}><option value={576}>80 มม. / 576 จุด</option><option value={384}>58 มม. / 384 จุด</option></select></label>
          <button onClick={() => click(async () => {
            const next = await navigator.serial.requestPort();
            if (port.current) { await port.current.close(); port.current = null; setDevice(''); }
            await next.open({ baudRate: baud }); port.current = next; setDevice('Serial / COM'); setMessage('เชื่อมต่อสำเร็จ');
          })}>เลือกและเชื่อมต่อเครื่องพิมพ์</button>
          <button disabled={!port.current} onClick={() => click(async () => { await port.current?.close(); port.current = null; setDevice(''); setMessage('ตัดการเชื่อมต่อแล้ว'); })}>ตัดการเชื่อมต่อ</button>
        </>}
        {mode !== 'system' && <>
          <p>เครื่องพิมพ์: {device || 'ยังไม่ได้เชื่อมต่อ'}</p>
          <label><input type="checkbox" checked={cut} onChange={(event) => setCut(event.target.checked)} /> ตัดกระดาษหลังพิมพ์</label>
          {mode === 'native' && <button onClick={() => click(async () => { await bridge.configure({ cut }); setMessage('บันทึกการตั้งค่าแล้ว'); })}>บันทึกการตั้งค่า</button>}
          <button disabled={!device} onClick={() => click(async () => {
            const result = mode === 'native' ? await bridge.testPrint() : await serialPrint({ id: 'test-print', tableNumber: 'ทดสอบ', createdAt: new Date(), items: [{ name: 'ทดสอบภาษาไทย หมูกระทะ', quantity: 1 }] }, true);
            setMessage(result.warning || 'ส่งข้อมูลทดสอบแล้ว กรุณาตรวจที่เครื่องพิมพ์');
          })}>พิมพ์ทดสอบ</button>
        </>}
      </fieldset>
      <p role="status">{message}</p><button disabled={busy || systemTest} onClick={() => setOpen(false)}>ปิด</button>
      {systemTest && <div className="chef-ticket chef-system-test">
        <h2>8 เซียน · ทดสอบพิมพ์</h2>
        <p>ES-9910UB · Windows / Bluetooth COM3</p>
        <p>กระดาษกว้าง 80 มม.</p>
        <p>โต๊ะ 01 · หมูกระทะ × 1</p>
        <p>ทดสอบภาษาไทย 1234567890</p>
      </div>}
    </Dialog>}
  </>;
}
