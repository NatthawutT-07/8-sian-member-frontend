import { useEffect, useRef, useState } from 'react';
import AdminRecordDialog, { deleteAction, passwordFields } from './AdminRecordDialog.jsx';

export default function AdminPos({ api }) {
  const [users, setUsers] = useState([]),
    [products, setProducts] = useState([]),
    [couponRules, setCouponRules] = useState([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [action, setAction] = useState(null),
    [staffSearch, setStaffSearch] = useState(''),
    [productSearch, setProductSearch] = useState('');
  const lock = useRef(false);
  const productForm = useRef(null);
  async function load() {
    const [staff, catalog, rules] = await Promise.all([
      api('/pos/users'),
      api('/pos/products'),
      api('/pos/coupon-rules'),
    ]);
    setUsers(staff);
    setProducts(catalog);
    setCouponRules(rules);
  }
  async function run(work) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    run(load);
  }, []);
  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await run(async () => {
      await api('/pos/users', { method: 'POST', body: JSON.stringify(data) });
      form.reset();
      await load();
      setNotice('สร้างบัญชีพนักงานแล้ว ใช้เข้าสู่ POS ได้ตามหน้าที่ที่เลือก');
    });
  }
  async function saveProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const data = {
      name: values.get('name'),
      barcode: values.get('barcode'),
      priceSatang:
        Math.round(Number(values.get('price')) * 100) *
        (values.get('group') === 'DISCOUNT' ? -1 : 1),
      group: values.get('group'),
      active: values.get('active') === 'on',
    };
    await run(async () => {
      await api(`/pos/products${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      form.reset();
      setEditing(null);
      await load();
      setNotice('บันทึกสินค้าแล้ว ให้ POS โหลดหน้าใหม่เพื่อรับรายการล่าสุด');
    });
  }
  const money = (n) => (n / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
  const groupNames = { MAIN: 'หลัก', DISCOUNT: 'ส่วนลด', PROMOTION: 'โปรโมชั่น' };
  return (
    <section className="admin-pos">
      <h2>จัดการ POS</h2>
      <p>
        ADMIN จัดการพนักงานและสินค้า • USER ใช้คิดเงินและจัดการโต๊ะ • CHEF
        เข้าหน้าครัวเพื่อรับออเดอร์ ดูยอดสะสม และพิมพ์ใบอาหาร
      </p>
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
      <div className="admin-pos-grid">
        <section>
          <h3>พนักงานคิดเงินและพ่อครัว</h3>
          <input
            aria-label="ค้นหาพนักงาน"
            placeholder="ค้นหาชื่อพนักงานหรือชื่อผู้ใช้"
            value={staffSearch}
            onChange={(event) => setStaffSearch(event.target.value)}
          />
          <form onSubmit={createUser}>
            <fieldset disabled={busy}>
              <label>
                ชื่อผู้ใช้
                <input
                  name="username"
                  required
                  minLength={3}
                  maxLength={80}
                  pattern="[a-zA-Z0-9._-]+"
                  autoComplete="off"
                  placeholder="เช่น cashier01"
                />
              </label>
              <label>
                ชื่อพนักงาน
                <input name="displayName" required maxLength={100} />
              </label>
              <label>
                รหัสผ่าน
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
              <label>
                หน้าที่
                <select name="role" defaultValue="USER">
                  <option value="USER">คิดเงิน (USER)</option>
                  <option value="CHEF">พ่อครัว (CHEF)</option>
                </select>
              </label>
              <button className="admin-primary">สร้างพนักงาน</button>
            </fieldset>
          </form>
          {users
            .filter((user) =>
              `${user.displayName} ${user.username}`
                .toLowerCase()
                .includes(staffSearch.toLowerCase()),
            )
            .map((user) => (
              <div className="admin-pos-row" key={user.id}>
                <span>
                  <strong>{user.displayName}</strong>
                  <br />
                  {user.username} · {user.role === 'CHEF' ? 'พ่อครัว' : 'คิดเงิน'} ·{' '}
                  {user.active ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <div className="admin-row-actions">
                  <button
                    className="admin-secondary"
                    disabled={busy}
                    onClick={() =>
                      setAction({
                        title: 'แก้ไขพนักงาน',
                        endpoint: `/pos/users/${user.id}`,
                        method: 'PUT',
                        fields: [
                          {
                            name: 'role',
                            label: 'หน้าที่',
                            type: 'select',
                            value: user.role,
                            options: [
                              ['USER', 'คิดเงิน (USER)'],
                              ['CHEF', 'พ่อครัว (CHEF)'],
                            ],
                          },
                          {
                            name: 'displayName',
                            label: 'ชื่อพนักงาน',
                            value: user.displayName,
                            maxLength: 100,
                          },
                          {
                            name: 'active',
                            label: 'เปิดใช้งานบัญชี',
                            type: 'checkbox',
                            value: user.active,
                            required: false,
                          },
                        ],
                      })
                    }
                  >
                    แก้ไข
                  </button>
                  <button
                    className="admin-secondary"
                    disabled={busy}
                    onClick={() =>
                      setAction({
                        title: `ตั้งรหัสผ่าน ${user.username}`,
                        endpoint: `/pos/users/${user.id}/password`,
                        method: 'POST',
                        fields: passwordFields,
                      })
                    }
                  >
                    ตั้งรหัสผ่าน
                  </button>
                  <button
                    className="admin-secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await api(`/pos/users/${user.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ active: !user.active }),
                        });
                        await load();
                      })
                    }
                  >
                    {user.active ? 'ระงับบัญชี' : 'เปิดบัญชี'}
                  </button>
                  <button
                    className="admin-link admin-danger-text"
                    disabled={busy}
                    onClick={() => setAction(deleteAction(`/pos/users/${user.id}`, user.username))}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
        </section>
        <section>
          <h3>{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h3>
          <form ref={productForm} onSubmit={saveProduct}>
            <fieldset disabled={busy}>
              <label>
                ชื่อสินค้า
                <input name="name" required maxLength={120} />
              </label>
              <label>
                บาร์โค้ด / QR สินค้า
                <input name="barcode" required maxLength={100} />
              </label>
              <label>
                กลุ่มรายการ
                <select name="group" defaultValue="MAIN">
                  <option value="MAIN">หลัก</option>
                  <option value="DISCOUNT">ส่วนลด</option>
                  <option value="PROMOTION">โปรโมชั่น</option>
                </select>
              </label>
              <label>
                ราคา (บาท)
                <input name="price" type="number" min="0" max="100000" step="0.01" required />
                <small>กลุ่มส่วนลด: กรอกจำนวนบาทที่จะลด เลือกได้หนึ่งครั้งต่อรายการในบิล</small>
              </label>
              <label>
                <input name="active" type="checkbox" defaultChecked /> เปิดขาย
              </label>
              <button className="admin-primary">บันทึกสินค้า</button>{' '}
              <button
                type="button"
                className="admin-secondary"
                onClick={() => {
                  productForm.current.reset();
                  setEditing(null);
                }}
              >
                ยกเลิกแก้ไข
              </button>
            </fieldset>
          </form>
          <input
            aria-label="ค้นหาสินค้า"
            placeholder="ค้นหาชื่อหรือบาร์โค้ดสินค้า"
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
          />
          {products
            .filter((product) =>
              `${product.name} ${product.barcode}`
                .toLowerCase()
                .includes(productSearch.toLowerCase()),
            )
            .map((product) => (
              <div className="admin-pos-row" key={product.id}>
                <span>
                  <strong>{product.name}</strong>
                  <br />
                  {product.barcode} · {money(product.priceSatang)} ·{' '}
                  {groupNames[product.group || 'MAIN']} · {product.active ? 'เปิดขาย' : 'หยุดขาย'}
                </span>
                <div className="admin-row-actions">
                  <button
                    className="admin-secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditing(product.id);
                      const form = productForm.current;
                      form.elements.name.value = product.name;
                      form.elements.barcode.value = product.barcode;
                      form.elements.price.value = (Math.abs(product.priceSatang) / 100).toFixed(2);
                      form.elements.group.value = product.group || 'MAIN';
                      form.elements.active.checked = product.active;
                      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="admin-secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await api(`/pos/products/${product.id}`, {
                          method: 'PUT',
                          body: JSON.stringify({
                            name: product.name,
                            barcode: product.barcode,
                            priceSatang: product.priceSatang,
                            group: product.group || 'MAIN',
                            active: !product.active,
                          }),
                        });
                        await load();
                      })
                    }
                  >
                    {product.active ? 'หยุดขาย' : 'เปิดขาย'}
                  </button>
                  <button
                    className="admin-link admin-danger-text"
                    disabled={busy}
                    onClick={() =>
                      setAction(deleteAction(`/pos/products/${product.id}`, product.name))
                    }
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
        </section>
        <section>
          <h3>ส่วนลดคูปองสมาชิกสำหรับ POS</h3>
          <p>
            ใช้มูลค่า extraPrice จากแคมเปญโดยตรง ค่าลบคือส่วนลด เช่น -20 ลด 20 บาท
            แก้ไขมูลค่าได้ก่อนแจกคูปองที่แท็บแคมเปญ หากแจกแล้วให้สร้างแคมเปญใหม่
            คูปองใช้ได้หนึ่งใบต่อบิลและใช้ร่วมกับรายการกลุ่มส่วนลดไม่ได้
          </p>
          {couponRules.length === 0 && <p>สร้างแคมเปญคูปองที่แท็บแคมเปญก่อนตั้งส่วนลด</p>}
          {couponRules.map((rule) => (
            <form
              key={rule.id}
              className="admin-pos-coupon-rule"
              onSubmit={(event) => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                run(async () => {
                  await api(`/pos/coupon-rules/${encodeURIComponent(rule.id)}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      posMinSubtotalSatang: Math.round(Number(values.get('minimum')) * 100),
                    }),
                  });
                  await load();
                  setNotice('บันทึกยอดขั้นต่ำคูปองแล้ว');
                });
              }}
            >
              <fieldset disabled={busy}>
                <strong>{rule.title}</strong>
                <p>{rule.active ? 'แคมเปญเปิดใช้งาน' : 'แคมเปญปิดใช้งาน'}</p>
                <p>
                  {rule.extraPrice < 0
                    ? `ส่วนลด ${money(-rule.extraPrice * 100)} จากแคมเปญ`
                    : rule.extraPrice > 0
                      ? `ค่าเพิ่ม ${money(rule.extraPrice * 100)} • ไม่ใช่คูปองส่วนลด`
                      : 'แคมเปญนี้ไม่มีส่วนลดเป็นบาท'}
                </p>
                <label>
                  ยอดขั้นต่ำ (บาท)
                  <input
                    name="minimum"
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.01"
                    defaultValue={rule.posMinSubtotalSatang / 100}
                    required
                  />
                </label>
                <button className="admin-primary">บันทึกยอดขั้นต่ำ</button>
              </fieldset>
            </form>
          ))}
        </section>
      </div>
      {action && (
        <AdminRecordDialog
          action={action}
          api={api}
          onClose={() => setAction(null)}
          onSaved={() => run(load)}
        />
      )}
    </section>
  );
}
