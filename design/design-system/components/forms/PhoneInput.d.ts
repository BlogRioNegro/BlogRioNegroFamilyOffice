import type { InputProps } from './Input';
/** Input de telefone celular brasileiro com máscara "(99) 99999-9999". */
export interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
  label?: string;
  /** Valor controlado (com ou sem máscara). */
  value?: string;
  defaultValue?: string;
  /** Recebe (valorMascarado, somenteDigitos). */
  onChange?: (masked: string, digits: string) => void;
  help?: string;
  error?: string;
  disabled?: boolean;
}
export declare function PhoneInput(props: PhoneInputProps): JSX.Element;
export declare function maskPhone(value: string): string;
