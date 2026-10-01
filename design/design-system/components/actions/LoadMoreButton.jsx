import React from 'react';
import { Button } from './Button.jsx';

export function LoadMoreButton({ loading = false, done = false, error = false, onClick, doneText = 'Você viu todos os artigos.' }) {
  if (done) return <div className="rn-loadmore"><p className="rn-msg">{doneText}</p></div>;
  return (
    <div className="rn-loadmore">
      <Button variant="secondary" loading={loading} onClick={onClick} iconLeft={error ? 'rotate-ccw' : undefined}>
        {loading ? 'Carregando…' : error ? 'Tentar novamente' : 'Carregar mais'}
      </Button>
      {error ? <p className="rn-msg rn-msg--error" role="alert">Não foi possível carregar mais artigos.</p> : null}
      <span className="rn-visually-hidden" aria-live="polite">{loading ? 'Carregando mais artigos' : ''}</span>
    </div>
  );
}
