Mensagem de retorno em linha (após enviar formulário, salvar no admin, etc.).

```jsx
<Alert variant="success" title="Pronto! O PDF foi enviado.">Confira sua caixa de entrada em alguns minutos.</Alert>
<Alert variant="error" title="Não foi possível enviar.">Verifique sua conexão e tente novamente.</Alert>
<Alert variant="warning" title="Este artigo está sem capa.">A listagem usará uma área neutra no lugar.</Alert>
```

`error` usa role="alert"; os demais role="status".
