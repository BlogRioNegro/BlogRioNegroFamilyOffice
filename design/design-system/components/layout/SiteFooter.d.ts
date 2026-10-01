/** Rodapé: logotipo + CTA discreto "Conheça a Rio Negro", texto regulatório longo (14 px, cinza) e link "Privacidade". */
export interface SiteFooterProps {
  logoSrc?: string;
  ctaHref?: string;
  privacyHref?: string;
  /** Parágrafos do texto regulatório. O padrão é um RASCUNHO — substitua pelo texto aprovado pelo compliance. */
  legal?: string[];
  year?: number;
}
export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
