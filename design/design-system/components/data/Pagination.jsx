import React from 'react';
import { Button } from '../actions/Button.jsx';

function pages(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const s = new Set([1, total, cur - 1, cur, cur + 1]);
  const arr = [...s].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push('…' + i); out.push(p); });
  return out;
}

export function Pagination({ page = 1, totalPages = 1, total, pageSize = 10, onChange = () => {} }) {
  const from = (page - 1) * pageSize + 1;
  const to = total ? Math.min(page * pageSize, total) : page * pageSize;
  return (
    <>
      {total != null ? <span className="rn-pager__info">Mostrando {from}–{to} de {total}</span> : <span />}
      <nav className="rn-pager" aria-label="Paginação">
        <Button variant="ghost" size="sm" iconOnly="chevron-left" label="Página anterior" disabled={page <= 1} onClick={() => onChange(page - 1)} />
        {pages(page, totalPages).map((p) => typeof p === 'string'
          ? <span key={p} className="rn-pager__gap" aria-hidden="true">…</span>
          : <Button key={p} variant="ghost" size="sm" className="rn-pager__page" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</Button>)}
        <Button variant="ghost" size="sm" iconOnly="chevron-right" label="Próxima página" disabled={page >= totalPages} onClick={() => onChange(page + 1)} />
      </nav>
    </>
  );
}
