import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, block = false, iconLeft, iconRight, iconOnly, label, href, type = 'button', className = '', children, ...rest }) {
  const cls = ['rn-btn', 'rn-btn--' + variant, size === 'sm' ? 'rn-btn--sm' : '', block ? 'rn-btn--block' : '', iconOnly ? 'rn-btn--icon' : '', className].filter(Boolean).join(' ');
  const iconSize = size === 'sm' ? 16 : 20;
  const content = (
    <>
      {loading ? <Icon name="loader" size={iconSize} /> : (iconOnly || iconLeft) ? <Icon name={iconOnly || iconLeft} size={iconSize} /> : null}
      {iconOnly ? <span className="rn-visually-hidden">{label}</span> : children}
      {!loading && iconRight && !iconOnly ? <Icon name={iconRight} size={iconSize} /> : null}
    </>
  );
  if (href && !disabled) {
    return <a className={cls} href={href} aria-label={iconOnly ? label : undefined} {...rest}>{content}</a>;
  }
  return (
    <button type={type} className={cls} disabled={disabled} aria-busy={loading || undefined} aria-label={iconOnly ? label : undefined} onClick={loading ? (e) => e.preventDefault() : rest.onClick} {...rest} {...(loading ? { onClick: (e) => e.preventDefault() } : {})}>
      {content}
    </button>
  );
}
