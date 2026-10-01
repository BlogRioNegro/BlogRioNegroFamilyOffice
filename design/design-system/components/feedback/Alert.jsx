import React from 'react';
import { Icon } from '../core/Icon.jsx';

const ICONS = { success: 'circle-check', error: 'circle-alert', warning: 'triangle-alert' };

export function Alert({ variant = 'success', title, children, className = '' }) {
  return (
    <div className={'rn-alert rn-alert--' + variant + ' ' + className} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon name={ICONS[variant]} size={20} />
      <div className="rn-alert__body">
        {title ? <strong className="rn-alert__title">{title}</strong> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}
