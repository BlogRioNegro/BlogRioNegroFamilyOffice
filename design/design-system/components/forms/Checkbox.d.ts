/** Checkbox com label longa (aceita links internos). Caixa 20 px, alvo clicável = linha inteira. */
export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  /** Aceita 'is-hover' / 'is-focus' para documentar estados. */
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
