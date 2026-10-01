import React, { useState } from 'react';
import { Input } from './Input.jsx';

export function maskPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11);
  if (!d.length) return '';
  if (d.length <= 2) return '(' + d;
  if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

export function PhoneInput({ label = 'Celular', value, defaultValue = '', onChange, help = 'Com DDD. Ex.: (11) 91234-5678', ...rest }) {
  const [inner, setInner] = useState(maskPhone(defaultValue));
  const shown = value !== undefined ? maskPhone(value) : inner;
  return (
    <Input label={label} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(99) 99999-9999" maxLength={15} help={help} value={shown}
      onChange={(e) => { const m = maskPhone(e.target.value); if (value === undefined) setInner(m); onChange && onChange(m, m.replace(/\D/g, '')); }} {...rest} />
  );
}
