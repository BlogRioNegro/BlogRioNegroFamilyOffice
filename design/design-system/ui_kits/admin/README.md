# UI kit — Painel admin

Painel interno (container de 1200 px). Compõe os componentes do design system.

- **ArticlesScreen.jsx** — tabela de artigos (tipo, status de envio, leads), ações Ver/Editar/Excluir, paginação, modal de confirmação de exclusão, alerta de sucesso.
- **EditorScreen.jsx** — formulário de criação/edição: título, tipo PDF/Texto, data, prévia, upload, envio automático, destaque.
- **LeadsScreen.jsx** — leads captados com status de envio e ação "Reenviar" nas falhas.

Header reaproveita `SiteHeader` com os links Artigos / Leads e "Sair". Telas inferidas do briefing; não havia telas de referência.
