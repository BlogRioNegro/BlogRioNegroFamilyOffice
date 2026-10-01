# 0041 · Capa otimizada no browser antes do envio

- Status: accepted · Data: 2026-09-28
- Specs: [ADM-004, ADM-006](../specs/05-admin-panel.md), [DATA-007](../specs/01-data-model.md)
- Relacionadas: [ADR 0020](0020-csp-com-nonce.md), [ADR 0034](0034-validacao-de-upload-e-limite-de-corpo.md), [ADR 0037](0037-imagens-so-png-e-jpeg.md)

## Contexto
O primeiro artigo recebido tinha uma capa acima do limite de 2 MiB do bucket `covers`. Subir o
limite do bucket deixaria o site pesado: por causa da CSP (ADR 0020), a capa é servida por `<img>`
sem redimensionamento, na home, na listagem, na página do artigo e como `og:image` (o WhatsApp
costuma não mostrar a prévia com imagens grandes).

## Decisão
Definida pelo responsável do projeto:
- O campo Capa aceita arquivo JPG ou PNG de até 5 MB (`COVER_SOURCE_MAX_BYTES`).
- Antes do envio, o browser reduz a capa a no máximo 1920 px de largura (sem ampliar) e a
  recomprime em JPEG (qualidade 85%, depois 75% e 60% se ainda passar do limite), com canvas e sem
  dependência nova (`apps/admin/lib/browser/optimize-cover.ts`). Transparência de PNG vira fundo
  branco.
- O bucket `covers` e o server continuam com 2 MiB e a validação por magic bytes (ADR 0034).
- Vale só para a capa; as imagens do editor (`article-images`) seguem como estão.

## Consequências
- A capa publicada fica leve (tipicamente centenas de KB) e sempre em JPEG.
- A qualidade final depende do encoder do browser; a original não fica guardada.
- Sem migration: o limite do bucket não mudou.
