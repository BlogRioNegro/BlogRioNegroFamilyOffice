# 0008 · Geração de PDF: @react-pdf/renderer e pdf-lib

- Status: accepted · Data: 2026-09-23
- Specs: [ADM-007, ADM-008](../specs/05-admin-panel.md)

## Contexto
rich_text precisa virar PDF para download; artigos pdf precisam de um PDF de prévia. A maioria
dos artigos será PDF enviado pelo admin. Hospedagem Node sem Chromium garantido
([ADR 0002](0002-hospedagem-staycloud.md)).

## Decisão
- **@react-pdf/renderer** para o PDF completo de rich_text, gerado **no save** e guardado no
  Storage. Leve, Node puro, sem navegador headless; layout declarado em componentes React.
- **pdf-lib** para copiar as 2 primeiras páginas do PDF enviado (prévia). Node puro.
- Descartados: Puppeteer/Playwright (Chromium pesado e incerto na StayCloud), jsPDF (layout
  manual de rich text).

## Consequências
- Download instantâneo e fluxo de entrega igual para os dois tipos.
- O JSON do Tiptap precisa de um mapeador próprio para componentes do react-pdf (fidelidade
  visual menor que HTML→PDF, aceitável dado o uso minoritário de rich_text).
