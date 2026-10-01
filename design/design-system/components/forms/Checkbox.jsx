import React, { useId } from 'react';
import { Icon } from '../core/Icon.jsx';
import { FieldMessage } from './FieldMessage.jsx';

export function Checkbox({ id, checked, defaultChecked, onChange, disabled = false, error, className = '', children, ...rest }) {
  const auto = useId();
  const fid = id || 'c' + auto.replace(/:/g, '');
  return (
    <div className={['rn-check', disabled ? 'rn-check--disabled' : '', className].filter(Boolean).join(' ')}>
      <label className="rn-check__row" htmlFor={fid}>
        <input id={fid} type="checkbox" className="rn-check__input" checked={checked} defaultChecked={defaultChecked} onChange={onChange} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? fid + '-msg' : undefined} {...rest} />
        <span className="rn-check__box" aria-hidden="true"><Icon name="check" size={14} /></span>
        <span>{children}</span>
      </label>
      {error ? <FieldMessage id={fid + '-msg'} variant="error">{error}</FieldMessage> : null}
    </div>
  );
}
