# Fase 5 · Captura de lead

Specs: [04-lead-capture](../specs/04-lead-capture.md). UI depende da fase 2.

- [x] **F5-001** · LEAD-002 · Schema Zod do lead + normalização de telefone E.164 + testes (LEAD-001)
- [x] **F5-002** · LEAD-006 · Serviço de rate limit por IP e por e-mail com os limites da spec + testes
- [x] **F5-003** · LEAD-005 · Verificação Turnstile no server
- [x] **F5-004** · LEAD-007 · Server Action `requestArticleDownload` na ordem definida
- [x] **F5-005** · LEAD-008 · Persistência com snapshot, consentimento, versão e `ip_hash`
- [x] **F5-006** · LEAD-009 · URL assinada de 60 s após insert
- [x] **F5-007** · LEAD-012 · Webhook assinado em `after()` + status; ADR definindo onde fica o código compartilhado com o admin (ADM-014)
- [x] **F5-008** · LEAD-001 · Modal com campos, máscara e Turnstile
- [x] **F5-009** · LEAD-003 · Aviso e checkbox obrigatório com textos de LEAD-013 (rascunho)
- [x] **F5-010** · LEAD-004 · Checkbox de opt-in opcional
- [x] **F5-011** · LEAD-010 · Tela de sucesso com "Baixar novamente" e CTA "Conheça a Rio Negro"
- [x] **F5-012** · LEAD-011 · Verificação: nenhum dado do lead em storage, cookie, URL ou log do client
- [x] **F5-013** · LEAD-007 · E2E do fluxo completo (sucesso, checkbox ausente, rate limit, Turnstile inválido)
