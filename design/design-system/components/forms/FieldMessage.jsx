import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FieldMessage({ id, variant = 'help', children }) {
  if (variant === 'error') {
    return <p id={id} className="rn-msg rn-msg--error"><Icon name="circle-alert" size={16} />{children}</p>;
  }
  return <p id={id} className="rn-msg">{children}</p>;
}
