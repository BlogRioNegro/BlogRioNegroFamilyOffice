/**
 * Card de artigo para a grade da listagem: capa 16:9, tipo, data e título. O card inteiro é o link.
 * @startingPoint section="Conteúdo" subtitle="Cards de artigo e de destaque" viewport="700x560"
 */
export interface ArticleCardProps {
  href?: string;
  title?: string;
  /** Data já formatada, ex.: "12 set. 2026". */
  date?: string;
  type?: 'pdf' | 'text';
  /** URL da capa (16:9). Sem capa, mostra área neutra. */
  cover?: string;
  coverAlt?: string;
  /** Esqueleto estático enquanto carrega. */
  loading?: boolean;
  /** Aceita 'is-hover' / 'is-focus' para documentar estados. */
  className?: string;
}
export declare function ArticleCard(props: ArticleCardProps): JSX.Element;
