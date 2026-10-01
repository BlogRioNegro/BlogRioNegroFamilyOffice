import logo from './logo-branco.png'

// Logo branca do site institucional, para o fundo azul (ADR 0043).
// <img> em vez de next/image: o next/image injeta style inline, que a CSP bloqueia (ADR 0020).
export function Logo({ alt }: { alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário acima
    <img src={logo.src} width={logo.width} height={logo.height} alt={alt} className="h-10 w-auto" />
  )
}
