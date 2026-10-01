import React from 'react';
import { TypeBadge } from '../feedback/TypeBadge.jsx';

export function FeaturedArticleCard({ href = '#', title, excerpt, date, type = 'pdf', cover, coverAlt = '', loading = false, className = '' }) {
  if (loading) {
    return (
      <div className={'rn-card rn-card--featured rn-card--loading ' + className} aria-busy="true" aria-label="Carregando destaque">
        <div className="rn-card__media" />
        <div className="rn-card__body">
          <span className="rn-skel" style={{ width: 120, height: 16 }} />
          <span className="rn-skel" style={{ width: '90%', height: 28 }} />
          <span className="rn-skel" style={{ width: '70%', height: 28 }} />
          <span className="rn-skel" style={{ width: '100%', height: 16, marginTop: 8 }} />
          <span className="rn-skel" style={{ width: '85%', height: 16 }} />
        </div>
      </div>
    );
  }
  return (
    <a href={href} className={'rn-card rn-card--featured ' + className}>
      <div className="rn-card__media">{cover ? <img src={cover} alt={coverAlt} /> : null}</div>
      <div className="rn-card__body">
        <div className="rn-card__meta"><TypeBadge type={type} /><time>{date}</time></div>
        <h2 className="rn-card__title">{title}</h2>
        {excerpt ? <p className="rn-card__excerpt">{excerpt}</p> : null}
      </div>
    </a>
  );
}
