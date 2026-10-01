function LeadsScreen() {
  const { DataTable, Pagination, Button, StatusBadge, Input } = window.RioNegroDesignSystem_2f3caf;
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState('');
  const rows = window.RN_ADMIN_LEADS.filter((r) => (r.name + r.email).toLowerCase().includes(q.toLowerCase()));
  const cols = [
    { key: 'name', label: 'Nome', render: (r) => <><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{r.email}</div></> },
    { key: 'phone', label: 'Celular', muted: true },
    { key: 'article', label: 'Artigo' },
    { key: 'status', label: 'Envio', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'date', label: 'Recebido em', muted: true },
    { key: 'a', label: <span className="rn-visually-hidden">Ações</span>, align: 'right', render: (r) => <div className="rn-table__actions">{r.status === 'failed' ? <Button variant="secondary" size="sm" iconLeft="send">Reenviar</Button> : null}</div> },
  ];
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', lineHeight: 'var(--line-height-2xl)', fontWeight: 600 }}>Leads</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}><div style={{ width: 280 }}><Input label="Buscar" placeholder="Nome ou e-mail" value={q} onChange={(e) => setQ(e.target.value)} /></div><Button variant="secondary" iconLeft="download">Exportar CSV</Button></div>
      </div>
      <DataTable caption="Leads" columns={cols} rows={rows} emptyMessage="Nenhum lead encontrado para essa busca." footer={<Pagination page={page} totalPages={12} total={117} pageSize={10} onChange={setPage} />} />
    </>
  );
}
window.LeadsScreen = LeadsScreen;
