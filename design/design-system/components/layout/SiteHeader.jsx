import React from 'react';

export function SiteHeader({ logoSrc, homeHref = '/', links = [{ label: 'Artigos', href: '/artigos' }], current = 'Artigos', right }) {
  return (
    <header className="rn-header">
      <div className="rn-header__inner">
        <a className="rn-header__brand" href={homeHref} aria-label="Rio Negro — página inicial">
          {logoSrc ? <img src={logoSrc} alt="Rio Negro Investimentos" /> : <span className="rn-wordmark">Rio Negro</span>}
        </a>
        <nav className="rn-header__nav" aria-label="Principal">
          {links.map((l) => <a key={l.label} className="rn-header__link" href={l.href} aria-current={l.label === current ? 'page' : undefined} onClick={l.onClick}>{l.label}</a>)}
          {right}
        </nav>
      </div>
    </header>
  );
}
