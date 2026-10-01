import React from 'react';
import { Icon } from '../core/Icon.jsx';

const DEFAULT_LEGAL = [
  'A Rio Negro Assessoria de Investimentos é uma empresa de assessoria de investimento registrada na Comissão de Valores Mobiliários (CVM), na forma da Resolução CVM 178/23, e atua como parceira da XP Investimentos CCTVM S.A. Na forma da legislação da CVM, o assessor de investimento pode exercer atividades complementares relacionadas aos mercados financeiro, securitário, de previdência e capitalização, desde que não conflitantes com a atividade de assessoria.',
  'Os conteúdos publicados neste blog têm caráter exclusivamente informativo e não constituem oferta, solicitação de compra ou venda nem recomendação de investimento. Rentabilidade obtida no passado não representa garantia de rentabilidade futura. Investimentos envolvem riscos, inclusive de perda do capital investido. Leia o material técnico e o regulamento antes de investir.',
];

export function SiteFooter({ logoSrc, ctaHref = 'https://www.rionegroinvestimentos.com.br', privacyHref = '/privacidade', legal = DEFAULT_LEGAL, year = new Date().getFullYear() }) {
  return (
    <footer className="rn-footer">
      <div className="rn-footer__inner">
        <div className="rn-footer__top">
          {logoSrc ? <img src={logoSrc} alt="Rio Negro Investimentos" /> : <span className="rn-wordmark">Rio Negro</span>}
          <a className="rn-footer__cta" href={ctaHref}>Conheça a Rio Negro <Icon name="arrow-right" size={16} /></a>
        </div>
        <div className="rn-footer__legal">{legal.map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className="rn-footer__bottom">
          <span>© {year} Rio Negro Assessoria de Investimentos</span>
          <a href={privacyHref}>Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
