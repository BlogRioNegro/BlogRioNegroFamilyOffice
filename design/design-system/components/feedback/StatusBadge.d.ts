/** Badge de status de envio (admin): Desativado, Pendente, Enviado, Falhou. Cor + ponto + texto. */
export interface StatusBadgeProps {
  status?: 'disabled' | 'pending' | 'sent' | 'failed';
  /** Substitui o texto padrão. */
  children?: React.ReactNode;
}
export declare function StatusBadge(props: StatusBadgeProps): JSX.Element;
