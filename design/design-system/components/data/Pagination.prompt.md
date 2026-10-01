Paginação numérica do admin (o site público usa "Carregar mais").

```jsx
<Pagination page={page} totalPages={5} total={48} pageSize={10} onChange={setPage} />
```

Página atual em fundo escuro com aria-current="page". Anterior/próxima desabilitam nas pontas.
