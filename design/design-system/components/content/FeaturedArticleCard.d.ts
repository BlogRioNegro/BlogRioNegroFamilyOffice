/** Card de destaque no topo da listagem: maior, capa + texto lado a lado a partir de ~700 px, com prévia em serifa. */
export interface FeaturedArticleCardProps {
  href?: string;
  title?: string;
  /** Prévia em Source Serif 4, 1–2 frases. */
  excerpt?: string;
  date?: string;
  type?: 'pdf' | 'text';
  cover?: string;
  coverAlt?: string;
  loading?: boolean;
  className?: string;
}
export declare function FeaturedArticleCard(props: FeaturedArticleCardProps): JSX.Element;
