import React from 'react';

export function DataTable({ columns = [], rows = [], loading = false, emptyMessage = 'Nenhum item encontrado.', caption, footer, rowKey = 'id', hoverRow }) {
  return (
    <div className="rn-table-wrap">
      <div className="rn-table-scroll">
        <table className="rn-table">
          {caption ? <caption className="rn-visually-hidden">{caption}</caption> : null}
          <thead><tr>{columns.map((c) => <th key={c.key} scope="col" style={{ width: c.width, textAlign: c.align || 'left' }}>{c.label}</th>)}</tr></thead>
          <tbody aria-busy={loading || undefined}>
            {loading ? [0, 1, 2].map((i) => (
              <tr key={'s' + i}>{columns.map((c) => <td key={c.key}><span className="rn-skel" style={{ height: 16, width: c.align === 'right' ? 64 : '70%', marginLeft: c.align === 'right' ? 'auto' : 0 }} /></td>)}</tr>
            )) : rows.length === 0 ? (
              <tr><td className="rn-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r[rowKey] ?? i} className={hoverRow === i ? 'is-hover' : undefined}>
                {columns.map((c) => <td key={c.key} className={c.muted ? 'rn-table__muted' : undefined} style={{ textAlign: c.align || 'left' }}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="rn-table-foot">{footer}</div> : null}
    </div>
  );
}
