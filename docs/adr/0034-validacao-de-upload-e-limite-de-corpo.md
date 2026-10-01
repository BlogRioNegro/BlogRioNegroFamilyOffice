# 0034 · Validação de upload e limite de corpo do formulário

- Status: accepted · Data: 2026-09-25
- Specs: [ADM-006](../specs/05-admin-panel.md), [DATA-007](../specs/01-data-model.md)
- Relacionadas: [ADR 0022](0022-convencoes-do-schema.md)

## Contexto
ADM-006 pede MIME por magic bytes e os limites de DATA-007 lidos de uma constante única. O
formulário de artigo envia capa (2 MiB) e PDF (20 MiB) numa Server Action, e o Next limita o corpo
a 1 MB na action e a 10 MB no proxy.

## Decisão
- `apps/admin/lib/domain/upload-rules.ts` (`UPLOAD_RULES`) é a constante única por bucket. Um teste
  de integração compara com `storage.buckets` (tamanho e MIME).
- No server, `file-type` detecta o tipo real; o arquivo passa só se o tipo é permitido no bucket,
  a extensão do nome bate com ele e o tamanho cabe. O upload usa o MIME detectado.
- O form confere o tamanho antes de enviar, com a mensagem da spec 05. O tamanho é mostrado em MB
  base 1024 com uma casa, arredondado para cima (1 byte acima do limite não mostra "20 MB").
- `serverActions.bodySizeLimit` e `proxyClientMaxBodySize` do admin = capa + PDF + 1 MiB,
  calculados da mesma constante.

## Consequências
- Mudar um limite exige migration dos buckets e mudança em `UPLOAD_RULES`; o teste acusa a
  divergência.
- `file-type` 22 pede Node 22 ou mais novo.
