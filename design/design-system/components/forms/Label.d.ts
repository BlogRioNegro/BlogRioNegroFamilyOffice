/** Rótulo de campo de formulário. Inter 14/500. Sempre visível — nunca use placeholder como rótulo. */
export interface LabelProps {
  htmlFor?: string;
  /** Acrescenta "(opcional)" em texto secundário. */
  optional?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export declare function Label(props: LabelProps): JSX.Element;
