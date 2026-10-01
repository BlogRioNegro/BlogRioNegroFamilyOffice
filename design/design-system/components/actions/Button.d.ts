import type { IconName } from '../core/Icon';
/**
 * Botão da interface. Primário para a ação principal da tela (uma por área), secundário para alternativas, ghost para ações de baixa ênfase (ex.: ações de linha na tabela), link para navegação no meio do texto.
 * @startingPoint section="Ações" subtitle="Botões primário, secundário, ghost e link" viewport="700x420"
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** md = 44 px (padrão, alvo de toque mínimo); sm = 36 px (admin/tabelas). */
  size?: 'md' | 'sm';
  /** Mostra spinner e bloqueia cliques repetidos (aria-busy). */
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa 100% da largura. */
  block?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  /** Botão só de ícone; exige `label`. */
  iconOnly?: IconName;
  /** Texto acessível para iconOnly. */
  label?: string;
  /** Renderiza como <a>. */
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: any) => void;
  /** Aceita 'is-hover' / 'is-focus' para documentar estados. */
  className?: string;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
