# 0035 · Editor Tiptap no admin: schema como allowlist e imagens do próprio artigo

- Status: accepted · Data: 2026-09-25
- Specs: [ADM-005](../specs/05-admin-panel.md), [SEC-006, SEC-007](../specs/02-security-rls.md)
- Relacionadas: [ADR 0009](0009-editor-tiptap.md), [ADR 0025](0025-rich-text-arvore-sanitizada.md), [ADR 0031](0031-imagem-do-rich-text-so-com-alt.md)

## Contexto
ADM-005 pede Tiptap só com as extensões aprovadas, HTML colado reduzido a elas e imagem sem `alt`
impedindo o salvamento. O JSON do editor chega à Server Action como dado externo e alimenta o site
e o PDF gerado (ADM-008), que busca as imagens no server.

## Decisão
- `apps/admin/lib/domain/rich-text.ts` lista as extensões (StarterKit não é usado). O schema do
  ProseMirror gerado delas é a allowlist no editor (HTML colado) e no server
  (`checkRichText`: `Node.fromJSON` + `check`).
- O server também recusa documento vazio, imagem sem `alt`, link fora de http(s)/mailto/caminho do
  site e imagem fora de `article-images/<article_id>/` do próprio artigo. Esta última evita
  imagem externa no site e request do server para URL arbitrária ao gerar o PDF.
- Link e imagem são inseridos por `Dialog` (endereço; arquivo + texto alternativo obrigatório).
  A imagem sobe pela action `uploadArticleImage`, com a validação da ADR 0034.
- `injectCSS: false`: o CSS base do ProseMirror está em `apps/admin/app/globals.css`, porque a CSP
  bloqueia o `<style>` que o Tiptap injetaria sem nonce.

## Consequências
- Nó novo no editor exige mudar a lista de extensões aqui e a allowlist do site (ADR 0025).
- Imagem colada de outro site não salva: a mensagem pede o envio pelo botão Imagem.
