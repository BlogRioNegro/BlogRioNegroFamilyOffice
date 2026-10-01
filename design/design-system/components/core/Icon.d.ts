export type IconName = 'x'|'check'|'chevron-left'|'chevron-right'|'arrow-right'|'arrow-left'|'circle-alert'|'circle-check'|'triangle-alert'|'loader'|'file-text'|'align-left'|'pencil'|'trash'|'download'|'external-link'|'send'|'plus'|'search'|'eye'|'rotate-ccw';
/** Ícone de traço (subconjunto do Lucide). Decorativo por padrão; passe `label` quando for o único conteúdo significativo. */
export interface IconProps {
  name: IconName;
  /** Tamanho em px. Padrão 20. */
  size?: number;
  /** Texto acessível. Sem ele, o ícone recebe aria-hidden. */
  label?: string;
  className?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
