/**
 * Campo de texto com rótulo, ajuda e erro. 44 px de altura, borda `--color-border-strong` (3,56:1).
 * @startingPoint section="Formulários" subtitle="Input, telefone e checkbox com todos os estados" viewport="700x520"
 */
export interface InputProps {
  label?: string;
  /** Texto de ajuda (some quando há erro). */
  help?: string;
  /** Mensagem de erro; ativa aria-invalid e borda vermelha. */
  error?: string;
  optional?: boolean;
  id?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: any) => void;
  /** Classe no wrapper. */
  className?: string;
  /** Classe no <input>; aceita 'is-hover' / 'is-focus' para documentar estados. */
  inputClassName?: string;
  [key: string]: any;
}
export declare function Input(props: InputProps): JSX.Element;
