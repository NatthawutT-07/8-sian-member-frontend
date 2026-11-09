import { useEffect, useState } from 'react';

export default function OrderingNameSelect({ label, value, options, onChange }) {
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (options.includes(value)) setCreating(false);
  }, [options, value]);
  const isNew = creating || (!!value && !options.includes(value));
  return (
    <div className="ordering-name-select">
      <label>
        {label}
        <select
          required={!isNew}
          value={isNew ? '__new__' : value}
          onChange={(event) => {
            const next = event.target.value;
            setCreating(next === '__new__');
            onChange(next === '__new__' ? '' : next);
          }}
        >
          <option value="">เลือก{label}</option>
          {options.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="__new__">+ เพิ่ม{label}ใหม่</option>
        </select>
      </label>
      {isNew && (
        <label>
          ชื่อ{label}ใหม่
          <input
            required
            maxLength="80"
            value={value}
            placeholder={`ระบุชื่อ${label}`}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      )}
    </div>
  );
}
