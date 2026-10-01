---
id: 05-admin-panel
status: approved
ui_status: approved
fase: 6
depends_on: [01-data-model.md, 02-security-rls.md, 04-lead-capture.md, 06-design-system.md]
---

# 05 · Painel admin (`apps/admin`)

Autorização: [SEC-005](02-security-rls.md) vale para todos os requisitos abaixo.

## Autenticação

### ADM-001 · Login
E-mail e senha da conta fixa via Supabase Auth (`@supabase/ssr`, sessão em cookie httpOnly).
Sem cadastro, convite ou "esqueci a senha" (troca de senha pelo dashboard do Supabase).
**Aceite:** credencial válida de um usuário fora de `admin_users` é deslogada com
"Acesso negado"; logout limpa a sessão.

### ADM-002 · Proteção de rotas
Todas as rotas exceto `/login` exigem sessão de admin.
**Aceite:** acesso anônimo a qualquer rota redireciona para `/login`; página com `noindex`.

## Artigos

### ADM-003 · Lista de artigos
Tabela com título, tipo, data de publicação, nº de leads e ações (editar, ver leads, excluir),
ordenada por `published_at desc`.
**Aceite:** o artigo em destaque (mais recente) é sinalizado apenas como informação.

### ADM-004 · Formulário de artigo
Campos: título, slug, resumo (opcional), capa, `content_type`, conteúdo (editor **ou**
upload de PDF, conforme o tipo), data de publicação. Salvar = publicar
([ADR 0005](../adr/0005-publicacao-imediata.md)). Validação Zod no client e na Server Action.
**Aceite:** erros por campo; salvar com sucesso deixa o artigo visível no site no próximo request.

### ADM-005 · Editor rich text
Tiptap com: títulos (H2, H3), negrito, itálico, listas ordenada e não ordenada, link, citação
e imagem inline (upload para `article-images`) com texto alternativo (`alt`) obrigatório e sem
legenda ([ADR 0031](../adr/0031-imagem-do-rich-text-so-com-alt.md)). Sem tabelas. Salva JSON
([ADR 0009](../adr/0009-editor-tiptap.md)).
**Aceite:** colar HTML externo mantém só nós/marcas permitidos; imagem sem `alt` impede o salvamento.

### ADM-006 · Uploads
Tipos e tamanhos conforme [DATA-007](01-data-model.md). MIME validado por magic bytes na
Server Action, além do limite configurado no bucket. A capa escolhida pode ter até 5 MB: o browser
a reduz a 1920 px de largura e a recomprime em JPEG antes do envio, e o server segue com o limite do
bucket ([ADR 0041](../adr/0041-capa-otimizada-no-browser.md)).
**Aceite:** arquivo renomeado (`.exe` → `.pdf`) é rejeitado; upload acima do limite é rejeitado;
capa de 2 a 5 MB chega ao bucket como JPEG de até 2 MB com 1920 px de largura.

### ADM-007 · Processamento de artigo `pdf`
Ao salvar: PDF original → `article-files`; `pdf-lib` copia as **2 primeiras páginas** para
um novo PDF → `article-previews` ([ADR 0008](../adr/0008-geracao-pdf.md)).
**Aceite:** PDF com 1 página gera prévia de 1 página; PDF protegido por senha ou corrompido
é rejeitado com mensagem clara; trocar o PDF substitui os dois arquivos e remove os antigos.

### ADM-008 · Processamento de artigo `rich_text`
Ao salvar: documento completo → `article_contents.body_json`; os **3 primeiros blocos** de
nível superior → `articles.preview_json`; PDF completo gerado com `@react-pdf/renderer`
(título, capa, conteúdo) → `article-files`.
**Aceite:** a regra de corte é função pura testada; o PDF gerado contém todo o texto e as
imagens; editar o conteúdo regenera prévia e PDF.

### ADM-009 · Slug
Gerado do título na criação (minúsculo, sem acento, hífens). **Editável** a qualquer momento.
Ao editar, o slug anterior vai para `article_slug_history` e redireciona com 301
([ADR 0006](../adr/0006-slug-editavel-historico-301.md), [DATA-003](01-data-model.md), [PUB-008](03-public-site.md)).
Editar o título **não** altera o slug.
**Aceite:** slug em uso (atual ou histórico de outro artigo) é rejeitado; o formulário
avisa que links antigos continuarão funcionando.

### ADM-010 · Data de publicação
Preenchida com agora na criação; editável (inclusive retroativa). Data futura é permitida mas
o artigo aparece imediatamente (sem agendamento).
**Aceite:** a data editada muda a ordem da listagem e o destaque.

### ADM-011 · Troca de `content_type`
Ao trocar o tipo na edição, conteúdo e arquivos do tipo anterior são removidos após salvar.
**Aceite:** nenhum arquivo órfão no Storage após a troca.

### ADM-012 · Exclusão de artigo
Confirmação explícita. Remove artigo, `article_contents`, histórico de slug e arquivos do
Storage; **leads permanecem** com `article_id = null` e `article_title_snapshot`
([ADR 0013](../adr/0013-exclusao-preserva-leads.md)).
**Aceite:** após excluir, os leads do artigo seguem na lista geral com o título original.

## Leads

### ADM-013 · Lista e exportação
- Lista por artigo e lista geral (inclui leads de artigos excluídos), ordem `created_at desc`,
  paginada.
- Exportar CSV por artigo e geral: UTF-8 com BOM, separador `;` (Excel pt-BR), colunas
  `data, artigo, nome, email, telefone, aceite_comunicacoes, status_webhook`.
- Excluir lead individual com confirmação (pedido do titular).

**Aceite:** CSV abre corretamente no Excel com acentos; CSV é gerado em route handler que
revalida admin; valores iniciados por `= + - @` são escapados (CSV injection).

### ADM-014 · Reenviar falhas do webhook
Botão "Reenviar falhas" visível só com `LEAD_WEBHOOK_URL` definida; reenvia leads `failed`
usando o mesmo payload e assinatura de [LEAD-012](04-lead-capture.md). O código de envio de
`apps/web/lib/services/lead-webhook.ts` é copiado para o admin, e os testes dos dois apps usam o
vetor fixo `tests/fixtures/lead-webhook-signature.json` ([ADR 0032](../adr/0032-webhook-copiado-e-agendado-apos-insert.md)).
Lead de artigo excluído vai com `article.id = null` ([ADR 0039](../adr/0039-reenvio-do-webhook-no-admin.md)).
**Aceite:** mostra quantos foram enviados e quantos falharam; atualiza status e tentativas.

## UI

Referência: `design/prototipo/Admin.dc.html` (desktop 1440 px e mobile 390 px), com componentes
de [06-design-system](06-design-system.md). Onde o protótipo diverge desta spec, vale a spec.

### Estrutura
- Header (`SiteHeader`) com logotipo, links "Artigos" e "Leads" (`aria-current` no ativo) e "Sair".
  Conteúdo em `--layout-admin` (1200 px). Todas as páginas com `noindex` (ADM-002).
- Datas: publicação em `dd/mm/aaaa`; leads em `dd/mm/aaaa hh:mm`.
- Exclusões confirmadas em `Dialog`, com `Button` primário + ícone de lixeira (não há variante
  destrutiva) e `Button` secundário "Cancelar".

### Login (ADM-001)
Título "Entrar no painel", campos E-mail (`autocomplete="username"`) e Senha
(`autocomplete="current-password"`), `Button` primário "Entrar" em largura total. Sem cadastro e
sem "esqueci a senha". Erros em `Alert` de erro acima dos campos:
- "E-mail ou senha inválidos" / "Confira os dados e tente novamente." (também para e-mail inexistente);
- "Acesso negado" / "Este e-mail não tem permissão para acessar o painel.".

### Lista de artigos (ADM-003, ADM-012)
- H1 "Artigos", subtítulo "<n> publicados · o mais recente aparece em destaque no site" e
  `Button` primário sm "Novo artigo" (ícone +).
- Tabela (legenda "Artigos publicados"): Título (com o selo "Em destaque" no mais recente, só
  informativo), Tipo (`TypeBadge`), Publicação, Leads (alinhado à direita) e Ações: `Button`
  ghost sm "Editar", "Ver leads" e "Excluir".
- Excluir: `Dialog` "Excluir artigo?" com "“<título>” será removido do site. Esta ação não pode
  ser desfeita.".
- Mobile: cada linha vira um card (superfície, borda, raio e sombra de card) com os mesmos campos;
  as ações abrem num `Dialog` a partir de um `Button` secundário "Ações" de 44 px.

### Formulário de artigo (ADM-004 a ADM-011)
- Bloco inteiro (voltar, título, card e rodapé) na largura de leitura, centralizado na página
  ([ADR 0040](../adr/0040-formulario-de-artigo-centralizado.md)).
- `Button` link "Artigos" (voltar), H1 "Novo artigo" ou "Editar artigo".
- Campos, nesta ordem: Título; Slug (ajuda "Endereço do artigo: /artigos/<slug>. Gerado a partir
  do título; pode ser editado."; na edição, avisa que links antigos continuarão funcionando);
  Resumo (opcional, `<textarea>` com a aparência do `Input`; ajuda "Aparece abaixo do título do
  artigo e no card de destaque."); Capa (arquivo JPG ou PNG de até 5 MB, ajuda "Proporção 16:9. JPG ou PNG de até 5 MB; a imagem
  é otimizada antes do envio.");
  Tipo (dois `Button` sm com `aria-pressed`: "Texto" e "PDF"); Data de publicação (`type="date"`);
  Conteúdo conforme o tipo.
- **Texto**: editor Tiptap com barra de `Button` ghost sm com rótulo em texto: H2, H3, Negrito,
  Itálico, Lista, Lista numerada, Link, Citação e Imagem.
- **PDF**: campo de arquivo PDF com ajuda "Máximo de 20 MB.". Enviando: spinner com
  "Enviando <arquivo> (<tamanho>)…", campo e "Publicar" desabilitados. Erro: mensagem no campo,
  ex.: "O arquivo tem 24,6 MB. Envie um PDF de até 20 MB.".
- Rodapé: `Button` secundário "Cancelar" e primário "Publicar" (salvar = publicar, ADR 0005).
  Mobile: botões empilhados em largura total, "Publicar" primeiro.
- Erros de validação por campo com `FieldMessage` (ADM-004).

### Leads (ADM-013, ADM-014)
- Por artigo: `Button` link "Artigos", H1 "Leads", subtítulo "<n> leads · <título do artigo>".
  Geral: subtítulo "<n> leads · todos os artigos" (inclui artigos excluídos).
- Ações no topo: `Button` secundário sm "Exportar CSV" (ícone download) e "Reenviar falhas (<n>)"
  (ícone rotate-ccw), este **só com `LEAD_WEBHOOK_URL` definida** e desabilitado sem falhas.
  Mobile: as duas em largura total.
- Tabela (legenda "Leads"): Data (data e hora em duas linhas), Artigo, Nome, E-mail, Telefone,
  Comunicações (Sim/Não), Envio (`StatusBadge`) e ação `Button` ghost sm de ícone "Excluir lead".
  Paginação de 10 por página com "Mostrando X–Y de N".
- Vazio: "Nenhum lead recebido ainda." com as ações do topo desabilitadas.
- Excluir: `Dialog` "Excluir lead?" com "Os dados de <nome> (<e-mail>) serão apagados. Esta ação
  não pode ser desfeita.".
- Mobile: linhas viram cards (nome + `StatusBadge`, depois Data, Artigo, E-mail, Telefone,
  Comunicações) e as ações abrem num `Dialog` pelo botão "Ações".

### Divergências do protótipo (vale a spec)
- "Reenviar falhas" sempre visível → só com `LEAD_WEBHOOK_URL` definida (ADM-014).
- Barra do editor com "Título" e "Lista" únicos → H2, H3, lista e lista numerada (ADM-005).
- Sem aviso de links antigos ao editar o slug → aviso obrigatório (ADM-009).
- Formulário de artigo alinhado à esquerda → centralizado na página (ADR 0040).

## Fora de escopo

- Múltiplos admins, papéis, logs de auditoria.
- Rascunho, agendamento, pré-visualização antes de salvar.
- Edição do hero da home e dos textos legais pelo painel.
- Dashboard de métricas.
