Mensagem de apoio sob um campo: `help` explica o formato, `error` diz o que corrigir.

```jsx
<FieldMessage variant="help">Usaremos apenas para enviar o artigo.</FieldMessage>
<FieldMessage variant="error">Informe um e-mail válido, como nome@exemplo.com.br.</FieldMessage>
```

Conecte ao input via `aria-describedby`. O erro sempre tem ícone, não depende só da cor.
