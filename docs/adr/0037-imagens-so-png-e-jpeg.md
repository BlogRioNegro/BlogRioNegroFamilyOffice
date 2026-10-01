# 0037 · Capa e imagens do editor só em PNG e JPEG

- Status: accepted · Data: 2026-09-25
- Specs: [DATA-007](../specs/01-data-model.md), [ADM-004, ADM-006, ADM-008](../specs/05-admin-panel.md)
- Relacionadas: [ADR 0034](0034-validacao-de-upload-e-limite-de-corpo.md), [ADR 0036](0036-pdf-do-rich-text.md)

## Contexto
ADM-008 pede que o PDF gerado do rich text contenha todas as imagens. O `@react-pdf/renderer` só
embute PNG e JPEG, então uma imagem WebP virava "[Imagem: <alt>]". As opções eram tirar o WebP,
converter no browser ou adicionar uma lib de conversão no server.

## Decisão
Definida pelo responsável do projeto: WebP sai dos tipos aceitos em `covers` e `article-images`.
- `UPLOAD_RULES` (constante única) aceita `image/jpeg` e `image/png`; o `accept` dos campos de
  imagem (`IMAGE_ACCEPT`) vem dela.
- Migration nova atualiza `allowed_mime_types` dos dois buckets; `supabase/config.toml` repete.

## Consequências
- Sem dependência nova. O PDF gerado embute toda imagem aceita pelo upload.
- Quem tiver WebP precisa converter antes de enviar; a mensagem diz "Envie uma imagem JPG ou PNG.".
