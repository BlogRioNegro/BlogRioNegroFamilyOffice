/**
 * Modal de diálogo: 480 px no desktop, tela cheia abaixo de 768 px. Botão "Fechar" sempre visível no canto superior direito; Esc e clique no fundo também fecham.
 * @startingPoint section="Feedback" subtitle="Modal, alertas e badges" viewport="700x640"
 */
export interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Ações no rodapé (ex.: Cancelar + primário). */
  footer?: React.ReactNode;
  /** Renderiza só a caixa, sem overlay fixo (documentação/prévia). */
  inline?: boolean;
  /** Força o layout de tela cheia (prévia do mobile). */
  mobile?: boolean;
  className?: string;
}
export declare function Modal(props: ModalProps): JSX.Element | null;
