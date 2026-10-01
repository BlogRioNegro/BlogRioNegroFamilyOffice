import logo from './logo-escuro.png'

// <img> em vez de next/image: o next/image injeta style inline, que a CSP bloqueia (ADR 0020).
export function Logo({ alt }: { alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário acima
    <img src={logo.src} width={logo.width} height={logo.height} alt={alt} className="h-7 w-auto" />
  )
}
