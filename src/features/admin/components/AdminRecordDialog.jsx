import { useRef, useState } from 'react';
import Dialog from '../../../components/Dialog.jsx';

export default function AdminRecordDialog({ action, api, onClose, onSaved }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      action.fields.map((field) => [
        field.name,
        field.type === 'checkbox'
          ? form.has(field.name)
          : field.type === 'number'
            ? Number(form.get(field.name))
            : String(form.get(field.name) || ''),
      ]),
    );
    if (values.confirmPassword !== undefined && values.newPassword !== values.confirmPassword)
      return setError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
    if (action.confirmName && values.confirmName !== action.confirmName)
      return setError('กรุณาพิมพ์ชื่อรายการให้ตรงก่อนลบ');
    delete values.confirmPassword;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await api(action.endpoint, {
        method: action.method,
        body: JSON.stringify(action.transform ? action.transform(values) : values),
      });
      onClose();
      await onSaved?.(result);
    } catch (failure) {
      setError(failure.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      titleId="admin-record-title"
      className="admin-record-dialog"
      busy={busy}
      onClose={onClose}
    >
      <h2 id="admin-record-title">{action.title}</h2>
      {action.description && <p className="admin-help">{action.description}</p>}
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="admin-form-grid">
            {action.fields.map((field) => (
              <label
                key={field.name}
                className={field.type === 'checkbox' ? 'admin-checkbox-label' : ''}
              >
                {field.type !== 'checkbox' && field.label}
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    defaultValue={field.value || ''}
                    required={field.required !== false}
                  >
                    {field.options.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    defaultValue={field.value || ''}
                    required={field.required !== false}
                    minLength={field.minLength}
                    maxLength={field.maxLength || 300}
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    defaultValue={field.type === 'checkbox' ? undefined : (field.value ?? '')}
                    defaultChecked={field.type === 'checkbox' ? !!field.value : undefined}
                    required={field.required !== false}
                    minLength={field.minLength}
                    maxLength={field.maxLength || 200}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    autoComplete={field.type === 'password' ? 'new-password' : 'off'}
                  />
                )}
                {field.type === 'checkbox' && field.label}
                {field.help && <small>{field.help}</small>}
              </label>
            ))}
          </div>
          <div className="admin-actions">
            <button type="button" className="admin-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button className={action.confirmName ? 'admin-danger' : 'admin-primary'}>
              {busy ? 'กำลังบันทึก…' : action.submitLabel || 'บันทึกข้อมูล'}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

export const reasonField = {
  name: 'reason',
  label: 'เหตุผล',
  type: 'textarea',
  minLength: 5,
  maxLength: 300,
};
export const memberFields = [
  { name: 'firstName', label: 'ชื่อ (ไม่บังคับ)', maxLength: 80, required: false },
  { name: 'lastName', label: 'นามสกุล (ไม่บังคับ)', maxLength: 80, required: false },
  {
    name: 'phone',
    label: 'เบอร์โทรศัพท์ (ไม่บังคับ)',
    type: 'tel',
    minLength: 10,
    maxLength: 10,
    required: false,
  },
  { name: 'birthDate', label: 'วันเกิด (ไม่บังคับ)', type: 'date', required: false },
];
export const deleteAction = (endpoint, name) => ({
  title: 'ยืนยันลบข้อมูล',
  endpoint,
  method: 'DELETE',
  confirmName: name,
  submitLabel: 'ยืนยันลบรายการ',
  description: `ลบ “${name}” ได้เฉพาะรายการที่ไม่มีประวัติใช้งาน กรุณาพิมพ์ชื่อรายการและเหตุผลเพื่อยืนยัน`,
  fields: [{ name: 'confirmName', label: `พิมพ์ชื่อ: ${name}` }, reasonField],
});
export const passwordFields = [
  { name: 'newPassword', label: 'รหัสผ่านใหม่', type: 'password', minLength: 8, maxLength: 128 },
  {
    name: 'confirmPassword',
    label: 'ยืนยันรหัสผ่านใหม่',
    type: 'password',
    minLength: 8,
    maxLength: 128,
  },
  { name: 'adminPassword', label: 'รหัสผ่านแอดมินเพื่อยืนยัน', type: 'password', maxLength: 128 },
  reasonField,
];
