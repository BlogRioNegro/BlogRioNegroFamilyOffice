function ArticlesScreen({ onEdit, onNew, flash }) {
  const { DataTable, Pagination, Button, TypeBadge, StatusBadge, Modal, Alert } = window.RioNegroDesignSystem_2f3caf;
  const [rows, setRows] = React.useState(window.RN_ADMIN_ARTICLES);
  const [page, setPage] = React.useState(1);
  const [del, setDel] = React.useState(null);
  const [msg, setMsg] = React.useState(flash);
  const cols = [
    { key: 'title', label: 'Título', render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
    { key: 'type', label: 'Tipo', render: (r) => <TypeBadge type={r.type} /> },
    { key: 'status', label: 'Envio do PDF', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'leads', label: 'Leads', align: 'right', muted: true },
    { key: 'date', label: 'Publicado', muted: true },
    { key: 'a', label: <span className="rn-visually-hidden">Ações</span>, align: 'right', render: (r) => (
      <div className="rn-table__actions">
        <Button variant="ghost" size="sm" iconOnly="eye" label={'Ver ' + r.title} />
        <Button variant="ghost" size="sm" iconOnly="pencil" label={'Editar ' + r.title} onClick={() => onEdit(r)} />
        <Button variant="ghost" size="sm" iconOnly="trash" label={'Excluir ' + r.title} onClick={() => setDel(r)} />
      </div>) },
  ];
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', lineHeight: 'var(--line-height-2xl)', fontWeight: 600 }}>Artigos</h1>
        <Button iconLeft="plus" onClick={onNew}>Novo artigo</Button>
      </div>
      {msg ? <div style={{ marginBottom: 'var(--space-4)' }}><Alert variant="success" title={msg} /></div> : null}
      <DataTable caption="Artigos publicados" columns={cols} rows={rows} footer={<Pagination page={page} totalPages={5} total={48} pageSize={10} onChange={setPage} />} />
      {del ? <Modal title="Excluir artigo?" onClose={() => setDel(null)} footer={<><Button variant="secondary" onClick={() => setDel(null)}>Cancelar</Button><Button onClick={() => { setRows(rows.filter((x) => x.id !== del.id)); setMsg('Artigo excluído.'); setDel(null); }}>Excluir</Button></>}>
        <p style={{ margin: 0 }}>“{del.title}” sairá do blog. Os leads captados por ele continuam disponíveis em Leads.</p>
      </Modal> : null}
    </>
  );
}
window.ArticlesScreen = ArticlesScreen;
