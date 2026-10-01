Tabela de listagem do admin (artigos, leads) com ações por linha.

```jsx
<DataTable caption="Artigos" columns={[
  { key: 'title', label: 'Título' },
  { key: 'type', label: 'Tipo', render: r => <TypeBadge type={r.type} /> },
  { key: 'date', label: 'Publicado em', muted: true },
  { key: 'actions', label: 'Ações', align: 'right', render: r => <div className="rn-table__actions">
      <Button variant="ghost" size="sm" iconOnly="pencil" label={'Editar ' + r.title} />
      <Button variant="ghost" size="sm" iconOnly="trash" label={'Excluir ' + r.title} /></div> },
]} rows={rows} footer={<Pagination page={1} totalPages={5} total={48} pageSize={10} />} />
```

Estados: default, hover de linha, carregando (3 linhas esqueleto), vazio.
