import React from 'react';

const MAP = {
  disabled: ['rn-badge--disabled', 'Desativado'],
  pending: ['rn-badge--pending', 'Pendente'],
  sent: ['rn-badge--sent', 'Enviado'],
  failed: ['rn-badge--failed', 'Falhou'],
};

export function StatusBadge({ status = 'pending', children }) {
  const [cls, text] = MAP[status] || MAP.pending;
  return <span className={'rn-badge ' + cls}><span className="rn-badge__dot" aria-hidden="true" />{children || text}</span>;
}
