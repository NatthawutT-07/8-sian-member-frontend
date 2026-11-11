import { useEffect, useRef, useState } from 'react';
import OrderingTables from './OrderingTables.jsx';
import OrderingCategoryOrder from './OrderingCategoryOrder.jsx';
import OrderingItemOrder from './OrderingItemOrder.jsx';
import OrderingNameSelect from './OrderingNameSelect.jsx';
import { apiAssetUrl } from '../../../lib/api.js';
import { prepareMenuImage } from '../lib/menu-image.js';
import './admin-ordering.css';

const fresh = { zone: '', category: '', name: '', active: true };
export default function AdminOrdering({ api }) {
  const [tables, setTables] = useState([]),
    [menu, setMenu] = useState([]),
    [categories, setCategories] = useState([]),
    [filterZone, setFilterZone] = useState(''),
    [filterCategory, setFilterCategory] = useState(''),
    [search, setSearch] = useState(''),
    [form, setForm] = useState(fresh),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [imageFile, setImageFile] = useState(null),
    [imagePreview, setImagePreview] = useState(''),
    [removeImage, setRemoveImage] = useState(false);
  const lock = useRef(false),
    editor = useRef(null);
  async function load() {
    const [tables, menu, categories] = await Promise.all([
      api('/dining-tables'),
      api('/ordering-menu'),
      api('/ordering-categories'),
    ]);
    setTables(tables);
    setMenu(menu);
    setCategories(categories);
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
  const zones = [...new Set(menu.map((item) => item.zone))].sort((a, b) =>
    a.localeCompare(b, 'th'),
  );
  const filteredMenu = menu.filter(
    (item) =>
      (!filterZone || item.zone === filterZone) &&
      (!filterCategory || item.category === filterCategory) &&
      item.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  async function saveMenu() {
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
      else if (removeImage) await api(`/ordering-menu/${saved.id}/image`, { method: 'DELETE' });
    } catch (error) {
      throw new Error(
        `บันทึกเมนูแล้ว แต่บันทึกรูปไม่สำเร็จ: ${error.message} กดบันทึกเพื่อลองรูปอีกครั้ง`,
      );
    }
    await load();
    setEditing(null);
    setForm({ ...fresh, zone: form.zone.trim(), category: form.category.trim() });
    resetImage();
    setNotice('บันทึกเมนูแล้ว เพิ่มรายการถัดไปในโซนและหมวดหมู่เดิมได้เลย');
  }
  return (
    <section className="admin-ordering">
      <div className="ordering-panel-heading">
        <h2>โต๊ะและเมนูสั่งอาหาร</h2>
        <button className="admin-secondary" disabled={busy} onClick={() => run(load)}>
          โหลดข้อมูลใหม่
        </button>
      </div>
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
      <OrderingTables
        onSaveQrHours={(id, qrHours) =>
          run(async () => {
            await api(`/dining-tables/${id}/settings`, {
              method: 'PUT',
              body: JSON.stringify({ qrHours }),
            });
            await load();
            setNotice('บันทึกอายุ QR สำหรับรอบถัดไปแล้ว');
          })
        }
        tables={tables}
        busy={busy}
        onAdd={(range) =>
          run(async () => {
            await api('/dining-tables', { method: 'POST', body: JSON.stringify(range) });
            await load();
            setNotice('เพิ่มโต๊ะแล้ว เปิดรอบและพิมพ์ QR ได้ใน POS');
          })
        }
      />
      <OrderingCategoryOrder
        categories={categories}
        busy={busy}
        onSave={(order) =>
          run(async () => {
            const saved = await api('/ordering-categories', {
              method: 'PUT',
              body: JSON.stringify({ categories: order }),
            });
            setCategories(saved);
            setNotice('บันทึกลำดับหมวดหมู่แล้ว หน้าสั่งอาหารจะแสดงตามลำดับนี้');
          })
        }
      />
      <OrderingItemOrder
        menu={menu}
        categories={categories}
        busy={busy}
        onSave={(category, itemIds) =>
          run(async () => {
            await api('/ordering-item-order', {
              method: 'PUT',
              body: JSON.stringify({ category, itemIds }),
            });
            await load();
            setNotice('บันทึกลำดับอาหารแล้ว ลูกค้าจะเห็นรายการตามลำดับใหม่โดยไม่มีตัวเลข');
          })
        }
      />
      <section className="ordering-admin-panel" ref={editor}>
        <h3>{editing ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหาร'}</h3>
        <p>เลือกโซนและหมวดหมู่ แล้วเพิ่มชื่ออาหารและรูป เมนูส่วนนี้ใช้สำหรับสั่งอาหารที่โต๊ะ</p>
        <form
          className="ordering-menu-editor"
          onSubmit={(event) => {
            event.preventDefault();
            run(saveMenu);
          }}
        >
          <fieldset disabled={busy} className="ordering-editor-fields">
            <legend>1. จัดกลุ่มเมนู</legend>
            <OrderingNameSelect
              key={`zone-${editing || 'new'}`}
              label="โซน"
              value={form.zone}
              options={zones}
              onChange={(zone) => setForm({ ...form, zone, category: '' })}
            />
            <OrderingNameSelect
              key={`category-${editing || 'new'}-${form.zone}`}
              label="หมวดหมู่"
              value={form.category}
              options={categories}
              onChange={(category) => setForm({ ...form, category })}
            />
          </fieldset>
          <fieldset disabled={busy} className="ordering-editor-fields">
            <legend>2. ข้อมูลอาหาร</legend>
            <label>
              ชื่ออาหาร
              <input
                required
                maxLength="120"
                value={form.name}
                placeholder="เช่น หมูสามชั้น"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label>
              รูปอาหาร (ไม่บังคับ)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
              <small>JPG, PNG หรือ WebP • ย่อรูปอัตโนมัติ • ต้นฉบับไม่เกิน 15 MB</small>
            </label>
            {currentImage && (
              <div className="ordering-image-preview">
                <img src={currentImage} alt="ตัวอย่างรูปอาหารก่อนบันทึก" width="120" height="90" />
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={() => {
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                >
                  นำรูปออก
                </button>
              </div>
            )}
            <label className="ordering-active-toggle">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              เปิดให้สั่ง
            </label>
          </fieldset>
          <div className="ordering-inline-actions">
            <button className="admin-primary" disabled={busy}>
              {busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
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
                ยกเลิกการแก้ไข
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="ordering-admin-panel">
        <div className="ordering-panel-heading">
          <div>
            <h3>รายการเมนูอาหาร</h3>
            <p>
              พบ {filteredMenu.length} จาก {menu.length} รายการ • เลือกแก้ไขเพื่อเปิดฟอร์มด้านบน
            </p>
          </div>
        </div>
        <div className="ordering-menu-filters">
          <label>
            ค้นหาอาหาร
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="พิมพ์ชื่ออาหาร"
            />
          </label>
          <label>
            โซน
            <select value={filterZone} onChange={(event) => setFilterZone(event.target.value)}>
              <option value="">ทุกโซน</option>
              {zones.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            หมวดหมู่
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="ordering-admin-menu">
          {categories
            .filter((name) => filteredMenu.some((item) => item.category === name))
            .map((name) => (
              <section key={name} className="ordering-menu-group">
                <h4>
                  {name}{' '}
                  <span>{filteredMenu.filter((item) => item.category === name).length} รายการ</span>
                </h4>
                {filteredMenu
                  .filter((item) => item.category === name)
                  .map((item) => (
                    <article key={item.id}>
                      {item.imageUrl && (
                        <img
                          className="ordering-admin-thumbnail"
                          src={apiAssetUrl(item.imageUrl)}
                          alt={item.name}
                          width="56"
                          height="56"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          {item.zone} → {item.category} •{' '}
                          {item.active ? 'เปิดให้สั่ง' : 'ปิด / หมด'}
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
                          editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        แก้ไข
                      </button>
                    </article>
                  ))}
              </section>
            ))}
          {!filteredMenu.length && (
            <p>
              {menu.length
                ? 'ไม่พบเมนูที่ตรงกับตัวกรอง'
                : 'ยังไม่มีเมนู เริ่มเพิ่มอาหารจากฟอร์มด้านบน'}
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
