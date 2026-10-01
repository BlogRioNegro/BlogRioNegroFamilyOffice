# 0040 · Formulário de artigo centralizado

- Status: accepted · Data: 2026-09-28
- Specs: [ADM-004](../specs/05-admin-panel.md)

## Contexto
No protótipo (`design/prototipo/Admin.dc.html`), o formulário de artigo ocupa a largura de leitura
alinhado à esquerda, junto do logotipo. Em telas largas, o bloco fica deslocado e sobra espaço à
direita.

## Decisão
Definida pelo responsável do projeto: nas telas "Novo artigo" e "Editar artigo" (`ArticleForm`),
o bloco inteiro (link "Artigos", título, card e botões) fica centralizado na página, mantendo a
largura de leitura (`--layout-reading`).

## Consequências
- Diverge do protótipo; a spec 05 registra a divergência.
- As listas de artigos e de leads continuam na largura do admin, alinhadas ao logotipo.
