# 0009 · Editor Tiptap com conteúdo em JSON

- Status: accepted · Data: 2026-09-23
- Specs: [ADM-005](../specs/05-admin-panel.md), [SEC-007](../specs/02-security-rls.md)

## Decisão
Tiptap com extensões limitadas às listadas em ADM-005. Persistir JSON, não HTML; o HTML é
gerado no server com allowlist.

## Consequências
- O corte da prévia por blocos é trivial sobre o JSON.
- Sem XSS por HTML armazenado; o mesmo JSON alimenta HTML e PDF.
