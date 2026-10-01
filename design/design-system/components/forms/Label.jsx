import React from 'react';

export function Label({ htmlFor, optional = false, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={'rn-label ' + className}>
      {children}{optional ? <span className="rn-label__opt"> (opcional)</span> : null}
    </label>
  );
}
