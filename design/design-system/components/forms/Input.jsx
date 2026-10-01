import React, { useId } from 'react';
import { Label } from './Label.jsx';
import { FieldMessage } from './FieldMessage.jsx';

export function Input({ label, help, error, optional = false, id, className = '', inputClassName = '', ...rest }) {
  const auto = useId();
  const fid = id || 'f' + auto.replace(/:/g, '');
  const msgId = fid + '-msg';
  return (
    <div className={'rn-field ' + className}>
      {label ? <Label htmlFor={fid} optional={optional}>{label}</Label> : null}
      <input id={fid} className={'rn-input ' + inputClassName} aria-invalid={error ? true : undefined} aria-describedby={error || help ? msgId : undefined} {...rest} />
      {error ? <FieldMessage id={msgId} variant="error">{error}</FieldMessage> : help ? <FieldMessage id={msgId}>{help}</FieldMessage> : null}
    </div>
  );
}
