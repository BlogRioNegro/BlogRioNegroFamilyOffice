/** Texto de ajuda (cinza) ou mensagem de erro (vermelho, com ícone) abaixo de um campo. */
export interface FieldMessageProps {
  id?: string;
  variant?: 'help' | 'error';
  children?: React.ReactNode;
}
export declare function FieldMessage(props: FieldMessageProps): JSX.Element;
