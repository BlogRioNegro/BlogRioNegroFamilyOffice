# 0048 · Subtítulo do artigo

- Status: accepted · Data: 2026-10-07
- Specs: [DATA-001](../specs/01-data-model.md), [PUB-003, PUB-005, PUB-010, PUB-012](../specs/03-public-site.md),
  [ADM-003, ADM-004, ADM-008](../specs/05-admin-panel.md)
- Complementa: [ADR 0022](0022-convencoes-do-schema.md) e [ADR 0033](0033-save-article-transacional-sob-rls.md)
- Tasks: [titulos-black](../tasks/titulos-black.md) (TB-002)

## Contexto
O cliente publica séries com o mesmo título e um período ("O que moveu o mercado" + "21 a 25 de
setembro") e quer o período numa segunda linha, menor. Com um campo só, tudo saía no mesmo H1.

## Decisão
Definida pelo cliente, via responsável do projeto (Rafael).

- **Coluna** `articles.subtitle text null`, com `CHECK (char_length(subtitle) between 1 and 160)`: o
  mesmo limite do título e nunca vazia (sem subtítulo é `null`). Migration
  `20261007120000_article_subtitle.sql`. Herda a RLS de `articles`: leitura pública, escrita só do admin.
- **`save_article`** ganha o parâmetro `subtitle text default null`, por último, como os outros
  opcionais (ADR 0033). Parâmetro novo muda a assinatura, então a mesma migration remove a função
  antiga e cria a nova: com as duas, a chamada sem `subtitle` ficaria ambígua no PostgREST. Continuam
  `security invoker`, os mesmos `revoke`/`grant` e a transação única. String vazia ou só com espaços
  vira `null` dentro da função.
- **Admin**: campo "Subtítulo (opcional)" logo abaixo do Título, validado com Zod (trim, máx. 160, vazio
  vira `null`). Na lista, o subtítulo aparece abaixo do título, em texto secundário.
- **Site**: na página do artigo e nos cards (listagem e destaque) o subtítulo é um `<p>` logo abaixo do
  título, em Roboto Slab Regular (400), um degrau de tamanho abaixo do título daquele contexto:

  | Contexto | Título | Subtítulo |
  |---|---|---|
  | Página do artigo | 28 / 36 px | 24 / 30 px |
  | Card de destaque | 24 / 30 px | 20 / 24 px |
  | Card | 18 px | 16 px |

  Não é heading: a hierarquia de títulos da página não muda. Sem subtítulo, nada muda.
- **Uma linha só** (`<title>`, Open Graph, Twitter e título do item do RSS): "Título: Subtítulo", pela
  função de domínio `articleFullTitle`.
- **PDF gerado** dos artigos de texto: o subtítulo sai numa linha abaixo do título, no estilo `h2` que
  o arquivo já tinha.

### Não muda
O slug (continua vindo só do título), o `article_title_snapshot` do lead, o CSV e o webhook: todos
seguem só com o título.

## Consequências
- **Ordem de deploy**: o site passa a ler `articles.subtitle` em toda listagem. A migration precisa
  estar aplicada em produção **antes** do código novo; sem a coluna, a leitura falha e o site cai na
  página de erro. O caminho inverso é seguro: o código antigo chama `save_article` sem `subtitle` e
  continua funcionando.
- Código antigo que edite um artigo depois da migration apaga o subtítulo dele (chama sem o
  parâmetro). Só acontece na janela entre a migration e o deploy.
- Um título que já tem dois-pontos ("Guia: PGBL ou VGBL?") com subtítulo fica com dois na linha única.
- O formulário tem dois campos com "título" no rótulo: nos testes, o seletor do Título é exato.
