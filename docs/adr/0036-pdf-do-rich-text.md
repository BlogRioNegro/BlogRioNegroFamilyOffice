# 0036 · PDF completo do rich text gerado a cada salvamento

- Status: accepted · Data: 2026-09-25
- Specs: [ADM-008](../specs/05-admin-panel.md), [DATA-007](../specs/01-data-model.md)
- Relacionadas: [ADR 0008](0008-geracao-pdf.md), [ADR 0035](0035-editor-tiptap-no-admin.md)

## Contexto
ADM-008 pede, ao salvar um artigo rich_text, o documento em `body_json`, os 3 primeiros blocos em
`preview_json` e um PDF completo (título, capa, conteúdo) em `article-files`.

## Decisão
- O corte da prévia é `richTextPreview` (`apps/admin/lib/domain/rich-text.ts`): os 3 primeiros
  nós de nível superior; uma lista inteira conta como um bloco.
- O PDF é regenerado em todo salvamento de artigo rich_text, com nome novo; o anterior sai do
  Storage depois do commit (como a troca de PDF da ADM-007).
- `apps/admin/lib/services/article-pdf.tsx` mapeia o JSON já validado para componentes do
  `@react-pdf/renderer`, com as fontes padrão do PDF (Helvetica e Times, que cobrem os acentos) e
  sem cores de marca (as cores só existem em `packages/ui`).
- Capa e imagens são baixadas do Storage com a sessão do admin (nunca por URL arbitrária) e
  embutidas quando o tipo real é PNG ou JPEG.

## Consequências
- O PDF acompanha título, capa e conteúdo sem passo manual.
- O `@react-pdf` não embute WebP; por isso capa e imagens aceitam só PNG e JPEG
  ([ADR 0037](0037-imagens-so-png-e-jpeg.md)).
