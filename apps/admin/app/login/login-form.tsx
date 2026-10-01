'use client'

import { Alert, Button, TextField } from '@rio-negro/ui'
import { useActionState, useState } from 'react'
import { login } from '../auth-actions'
import { ACCESS_DENIED_MESSAGE, INVALID_CREDENTIALS_MESSAGE } from './messages'

// Spec 05, UI · Login: título e descrição do Alert para cada erro da action. Erro inesperado
// (mensagem genérica) aparece só como título.
const ALERTS: Record<string, { title: string; description: string }> = {
  [INVALID_CREDENTIALS_MESSAGE]: {
    title: 'E-mail ou senha inválidos',
    description: 'Confira os dados e tente novamente.',
  },
  [ACCESS_DENIED_MESSAGE]: {
    title: 'Acesso negado',
    description: 'Este e-mail não tem permissão para acessar o painel.',
  },
}

export function LoginForm() {
  const [failure, formAction, pending] = useActionState(login, null)
  // O React limpa o form depois da action; o e-mail fica para a nova tentativa.
  const [email, setEmail] = useState('')
  const alert = failure
    ? (ALERTS[failure.error] ?? { title: failure.error, description: '' })
    : null

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {alert ? (
        <Alert variant="error" title={alert.title} className="mb-2">
          {alert.description || null}
        </Alert>
      ) : null}
      <TextField
        label="E-mail"
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <TextField
        label="Senha"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" block loading={pending}>
        Entrar
      </Button>
    </form>
  )
}
