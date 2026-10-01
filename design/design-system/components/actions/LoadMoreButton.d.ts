/** Botão "Carregar mais" no fim da listagem de artigos. Substitui paginação no site público. */
export interface LoadMoreButtonProps {
  loading?: boolean;
  /** Não há mais itens: mostra mensagem no lugar do botão. */
  done?: boolean;
  /** Falha na última carga: mostra "Tentar novamente" + erro. */
  error?: boolean;
  onClick?: () => void;
  doneText?: string;
}
export declare function LoadMoreButton(props: LoadMoreButtonProps): JSX.Element;
