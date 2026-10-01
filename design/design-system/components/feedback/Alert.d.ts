/** Alerta em linha com ícone, título e texto. Fundo claro do estado, título na cor do estado, corpo em texto principal. */
export interface AlertProps {
  variant?: 'success' | 'error' | 'warning';
  title?: string;
  className?: string;
  children?: React.ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
