Botão padrão da Rio Negro — use `primary` para a ação principal, `secondary` para a alternativa, `ghost` para ações discretas e `link` dentro de texto.

```jsx
<Button variant="primary" iconRight="download">Baixar PDF</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost" size="sm" iconOnly="pencil" label="Editar" />
<Button variant="primary" loading>Enviando…</Button>
```

- Altura 44 px (md) ou 36 px (sm). Raio 6 px. Inter 16/500.
- Hover: primário escurece para #3A3735; secundário e ghost ganham fundo `--color-surface-muted`; link engrossa o sublinhado.
- Desabilitado: fundo `--color-disabled-bg`, texto `--color-disabled-text` (5,67:1).
- Um único primário por área visível.
