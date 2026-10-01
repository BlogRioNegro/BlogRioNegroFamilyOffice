import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function TypeBadge({ type = 'pdf' }) {
  const pdf = type === 'pdf';
  return (
    <span className={'rn-badge ' + (pdf ? 'rn-badge--pdf' : 'rn-badge--text')}>
      <Icon name={pdf ? 'file-text' : 'align-left'} size={14} />{pdf ? 'PDF' : 'Texto'}
    </span>
  );
}
