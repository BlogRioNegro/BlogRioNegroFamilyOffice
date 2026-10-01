/** Paginação do admin: contagem "Mostrando X–Y de N" + anterior/próxima + números. Feita para o rodapé do DataTable. */
export interface PaginationProps {
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}
export declare function Pagination(props: PaginationProps): JSX.Element;
