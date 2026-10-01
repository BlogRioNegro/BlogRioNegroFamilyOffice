Botão "Carregar mais" centralizado abaixo da grade de artigos; estados default, carregando, erro e fim da lista.

```jsx
<LoadMoreButton loading={isLoading} done={!hasMore} error={failed} onClick={loadNext} />
```

Usa `Button variant="secondary"`, largura mínima 240 px. Anuncia a carga em região aria-live.
