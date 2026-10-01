/**
 * Header simples: logotipo à esquerda, link "Artigos" à direita. 64 px, fundo `--color-bg`, borda inferior.
 * @startingPoint section="Layout" subtitle="Header e rodapé do site" viewport="700x520"
 */
export interface SiteHeaderProps {
  /** Caminho do logotipo (assets/logo-escuro.png). Sem ele, mostra "Rio Negro" em texto. */
  logoSrc?: string;
  homeHref?: string;
  links?: { label: string; href?: string; onClick?: (e: any) => void }[];
  /** Label do link ativo (aria-current). */
  current?: string;
  /** Conteúdo extra à direita (ex.: "Sair" no admin). */
  right?: React.ReactNode;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
