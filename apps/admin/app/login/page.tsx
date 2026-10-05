import type { Metadata } from 'next'
import { Logo } from '@/components/logo'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Entrar · Rio Negro Family Office Admin',
}

// ADM-001 · Spec 05, UI · Login: card centralizado com logotipo, sem cadastro nem "esqueci a senha".
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-100 flex-col gap-6 rounded-card border border-border bg-surface p-6 shadow-card md:p-8">
        <div className="flex">
          <Logo alt="Rio Negro Family Office" />
        </div>
        <h1 className="font-serif font-extralight text-xl leading-tight wrap-anywhere uppercase">
          Entrar no painel
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
