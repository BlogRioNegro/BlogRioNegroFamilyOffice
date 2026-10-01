import { cn } from '@rio-negro/ui'

// Capa 16:9 do bucket público `covers`; sem imagem, fica a área neutra. <img> em vez de
// next/image pelo mesmo motivo do Logo (style inline bloqueado pela CSP).
export function CoverImage({
  src,
  className,
  eager = false,
}: {
  src: string
  className?: string
  eager?: boolean
}) {
  return (
    <div className={cn('aspect-video overflow-hidden bg-surface-muted', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ver comentário acima */}
      <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} className="size-full object-cover" />
    </div>
  )
}
