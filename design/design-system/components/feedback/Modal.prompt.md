Diálogo para captação de lead (receber o PDF) e confirmações no admin.

```jsx
<Modal open={open} onClose={() => setOpen(false)} title="Receba o artigo completo"
  footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit">Receber PDF</Button></>}>
  <Input label="Nome" /> …
</Modal>
```

- Largura 480 px, raio 12 px, sombra `--shadow-modal`, overlay rgba(29,28,27,.48).
- < 768 px: tela cheia, raio 0, botões do rodapé dividem a largura.
- Foca o primeiro campo ao abrir e devolve o foco ao fechar.
