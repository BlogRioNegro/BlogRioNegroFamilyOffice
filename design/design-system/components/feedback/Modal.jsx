import React, { useEffect, useRef } from 'react';
import { Button } from '../actions/Button.jsx';

export function Modal({ open = true, onClose, title, children, footer, inline = false, mobile = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => { const el = ref.current && ref.current.querySelector('input,button:not(.rn-modal__close),a,select,textarea'); (el || ref.current)?.focus(); }, 0);
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = ov; prev && prev.focus && prev.focus(); };
  }, [open, inline]);
  if (!open) return null;
  const tid = 'modal-title';
  const dialog = (
    <div ref={ref} className={'rn-modal ' + (mobile ? 'rn-modal--mobile ' : '') + className} role="dialog" aria-modal={inline ? undefined : true} aria-labelledby={tid} tabIndex={-1}>
      <div className="rn-modal__head">
        <h2 id={tid} className="rn-modal__title">{title}</h2>
        <Button variant="ghost" iconOnly="x" label="Fechar" className="rn-modal__close" onClick={onClose} />
      </div>
      <div className="rn-modal__body">{children}</div>
      {footer ? <div className="rn-modal__foot">{footer}</div> : null}
    </div>
  );
  if (inline) return dialog;
  return <div className="rn-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>{dialog}</div>;
}
