export interface DataTableColumn {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'right';
  /** Texto secundário (datas, contagens). */
  muted?: boolean;
  render?: (row: any) => React.ReactNode;
}
/**
 * Tabela do admin em superfície branca com cabeçalho em `--color-bg`, hover de linha e rodapé para paginação.
 * @startingPoint section="Admin" subtitle="Tabela com ações por linha e paginação" viewport="700x460"
 */
export interface DataTableProps {
  columns: DataTableColumn[];
  rows: any[];
  loading?: boolean;
  emptyMessage?: string;
  /** Legenda acessível (oculta visualmente). */
  caption?: string;
  /** Conteúdo do rodapé — normalmente <Pagination />. */
  footer?: React.ReactNode;
  rowKey?: string;
  /** Índice de linha forçada em hover (documentação). */
  hoverRow?: number;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
