import { useEffect, useRef, useState } from 'react';
import { createTableQr } from '../lib/table-qr.js';
import { apiAssetUrl } from '../../../lib/api.js';
import { prepareMenuImage } from '../lib/menu-image.js';
import './admin-ordering.css';

const fresh = { zone: '', category: '', name: '', active: true };
export default function AdminOrdering({ api }) {
  const [tables, setTables] = useState([]),
    [menu, setMenu] = useState([]),
    [range, setRange] = useState({ from: 1, to: 10 }),
    [form, setForm] = useState(fresh),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [imageFile, setImageFile] = useState(null),
    [imagePreview, setImagePreview] = useState(''),
    [removeImage, setRemoveImage] = useState(false);
  const lock = useRef(false);
  async function load() {
    const [tables, menu] = await Promise.all([api('/dining-tables'), api('/ordering-menu')]);
    setTables(
      await Promise.all(
        tables.map(async (table) => ({
          ...table,
          image: await createTableQr(table.url),
        })),
      ),
    );
    setMenu(menu);
  }
  async function run(work) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (error) {
      setError(error.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    run(load);
  }, []);
  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  const currentImage = removeImage
    ? ''
    : imagePreview || apiAssetUrl(menu.find((item) => item.id === editing)?.imageUrl);
  function resetImage() {
    setImageFile(null);
    setRemoveImage(false);
  }
  return (
    <section className="admin-ordering">
      <h2>โต๊ะและเมนูสั่งอาหาร</h2>
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
      <button className="admin-secondary" disabled={busy} onClick={() => run(load)}>
        โหลดข้อมูลใหม่
      </button>
      <h3>เพิ่มโต๊ะ / ดาวน์โหลด QR ประจำโต๊ะ</h3>
      <p>
        เพิ่มช่วงหมายเลขโต๊ะได้ครั้งละไม่เกิน 200 โต๊ะ หมายเลขที่มีอยู่จะใช้ QR เดิมเสมอ
        เปิดสั่งอาหารหลังรับชำระสำเร็จและพนักงานยืนยันสิทธิ์โซนใน POS
      </p>
      <form
        className="ordering-admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            await api('/dining-tables', { method: 'POST', body: JSON.stringify(range) });
            await load();
            setNotice('เพิ่มโต๊ะแล้ว QR ของโต๊ะเดิมคงเดิม');
          });
        }}
      >
        <label>
          ตั้งแต่โต๊ะ
          <input
            type="number"
            min="1"
            max="9999"
            required
            value={range.from}
            onChange={(event) => setRange({ ...range, from: Number(event.target.value) })}
          />
        </label>
        <label>
          ถึงโต๊ะ
          <input
            type="number"
            min={range.from}
            max={Math.min(9999, range.from + 199)}
            required
            value={range.to}
            onChange={(event) => setRange({ ...range, to: Number(event.target.value) })}
          />
        </label>
        <button className="admin-primary" disabled={busy}>
          เพิ่มโต๊ะ
        </button>
      </form>
      <div className="ordering-admin-tables">
        {tables.map((table) => (
          <article key={table.id}>
            <h4>โต๊ะ {table.number}</h4>
            <img
              src={table.image}
              alt={`QR สั่งอาหารโต๊ะ ${table.number}`}
              width="180"
              height="180"
            />
            <p>
              {table.sessionId
                ? table.orderingEnabled
                  ? 'เปิดสั่งอาหารอยู่'
                  : 'ชำระแล้ว รอเลือกโซน'
                : 'ปิดสั่งอาหาร'}
            </p>
            <a
              className="admin-secondary"
              download={`table-${table.number}-qr.png`}
              href={table.image}
            >
              ดาวน์โหลด QR
            </a>
            <a href={table.url} target="_blank" rel="noreferrer">
              เปิดหน้าโต๊ะ
            </a>
          </article>
        ))}
      </div>
      {!tables.length && <p>ยังไม่มีโต๊ะ เพิ่มหมายเลขโต๊ะก่อนเริ่มใช้งาน</p>}
      <h3>เมนูที่ลูกค้าสแกนสั่ง</h3>
      <p>
        เมนูอาหารแยกจากสินค้าที่ใช้คิดเงิน POS เรียงเป็น โซน → หมวดหมู่ → รายการ เช่น โซนเนื้อสัตว์
        → หมู → หมูสามชั้น พนักงานเลือกสิทธิ์โซนหลังชำระเงินได้หลายโซนหรือไม่เปิดโซนใดเลย
      </p>
      <form
        className="ordering-admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const saved = await api(`/ordering-menu${editing ? `/${editing}` : ''}`, {
              method: editing ? 'PUT' : 'POST',
              body: JSON.stringify(form),
            });
            // Keep the saved ID if image upload fails, so retry updates the same menu.
            setEditing(saved.id);
            try {
              if (imageFile)
                await api(`/ordering-menu/${saved.id}/image`, {
                  method: 'PUT',
                  headers: { 'Content-Type': imageFile.type },
                  body: imageFile,
                });
              else if (removeImage)
                await api(`/ordering-menu/${saved.id}/image`, { method: 'DELETE' });
            } catch (error) {
              throw new Error(
                `บันทึกเมนูแล้ว แต่บันทึกรูปไม่สำเร็จ: ${error.message} กดบันทึกเพื่อลองรูปอีกครั้ง`,
              );
            }
            setEditing(null);
            setForm(fresh);
            resetImage();
            await load();
            setNotice('บันทึกเมนูแล้ว');
          });
        }}
      >
        <label>
          โซน
          <input
            required
            maxLength="80"
            list="ordering-zone-names"
            value={form.zone}
            onChange={(event) => setForm({ ...form, zone: event.target.value })}
          />
        </label>
        <datalist id="ordering-zone-names">
          {[...new Set(menu.map((item) => item.zone))].map((zone) => (
            <option key={zone} value={zone} />
          ))}
        </datalist>
        <label>
          หมวดหมู่
          <input
            required
            maxLength="80"
            list="ordering-category-names"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
        </label>
        <datalist id="ordering-category-names">
          {[...new Set(menu.map((item) => item.category))].map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <label>
          ชื่ออาหาร
          <input
            required
            maxLength="120"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          รูปอาหาร (ไม่บังคับ)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files[0];
              event.target.value = '';
              if (file)
                run(async () => {
                  setImageFile(await prepareMenuImage(file));
                  setRemoveImage(false);
                });
            }}
          />
          <small>JPG, PNG หรือ WebP • ย่อรูปให้อัตโนมัติ • ต้นฉบับไม่เกิน 15 MB</small>
        </label>
        {currentImage && (
          <div className="ordering-image-preview">
            <img src={currentImage} alt="ตัวอย่างรูปอาหารก่อนบันทึก" width="120" height="90" />
            <button
              type="button"
              className="admin-secondary"
              disabled={busy}
              onClick={() => {
                setImageFile(null);
                setRemoveImage(true);
              }}
            >
              นำรูปออก
            </button>
          </div>
        )}
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          เปิดให้สั่ง
        </label>
        <button className="admin-primary" disabled={busy}>
          {editing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
        </button>
        {editing && (
          <button
            type="button"
            className="admin-secondary"
            disabled={busy}
            onClick={() => {
              setEditing(null);
              setForm(fresh);
              resetImage();
            }}
          >
            ยกเลิก
          </button>
        )}
      </form>
      <div className="ordering-admin-menu">
        {menu.map((item) => (
          <article key={item.id}>
            {item.imageUrl && (
              <img
                className="ordering-admin-thumbnail"
                src={apiAssetUrl(item.imageUrl)}
                alt={item.name}
                width="72"
                height="72"
                loading="lazy"
              />
            )}
            <div>
              <strong>{item.name}</strong>
              <p>
                {item.zone} → {item.category} • {item.active ? 'เปิดให้สั่ง' : 'ปิด / หมด'}
              </p>
            </div>
            <button
              className="admin-secondary"
              disabled={busy}
              onClick={() => {
                setEditing(item.id);
                resetImage();
                setForm({
                  zone: item.zone,
                  name: item.name,
                  category: item.category,
                  active: item.active,
                });
              }}
            >
              แก้ไข
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
