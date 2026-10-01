Campo de celular com máscara "(99) 99999-9999" aplicada enquanto a pessoa digita.

```jsx
<PhoneInput onChange={(masked, digits) => setPhone(digits)} />
<PhoneInput error="Informe um celular com DDD." defaultValue="1191234" />
```

Aceita só dígitos (máx. 11), teclado numérico no mobile. Valide 11 dígitos antes de enviar.
