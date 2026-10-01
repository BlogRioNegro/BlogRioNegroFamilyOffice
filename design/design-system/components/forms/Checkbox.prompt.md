Checkbox para consentimento e opções; a label pode ser longa e conter link.

```jsx
<Checkbox required error={!ok && 'Você precisa aceitar para continuar.'}>
  Li e concordo com a <a href="/privacidade">Política de Privacidade</a> e autorizo o contato da Rio Negro.
</Checkbox>
```

Clique no link não marca a caixa (o link captura o clique). Nunca pré-marque consentimento.
