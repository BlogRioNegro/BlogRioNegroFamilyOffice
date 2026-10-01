import React from 'react';
import { TypeBadge } from '../feedback/TypeBadge.jsx';

export function ArticleCard({ href = '#', title, date, type = 'pdf', cover, coverAlt = '', loading = false, className = '' }) {
  if (loading) {
    return (
      <div className={'rn-card rn-card--loading ' + className} aria-busy="true" aria-label="Carregando artigo">
        <div className="rn-card__media" />
        <div className="rn-card__body">
          <span className="rn-skel" style={{ width: 96, height: 16 }} />
          <span className="rn-skel" style={{ width: '92%', height: 20 }} />
          <span className="rn-skel" style={{ width: '64%', height: 20 }} />
        </div>
      </div>
    );
  }
  return (
    <a href={href} className={'rn-card ' + className}>
      <div className="rn-card__media">{cover ? <img src={cover} alt={coverAlt} loading="lazy" /> : null}</div>
      <div className="rn-card__body">
        <div className="rn-card__meta"><TypeBadge type={type} /><time>{date}</time></div>
        <h3 className="rn-card__title">{title}</h3>
      </div>
    </a>
  );
}
