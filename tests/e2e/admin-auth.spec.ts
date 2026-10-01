import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { createAuthenticatedUser, SEED_ADMIN, type TestUser } from '../integration/support/clients'
import { signIn } from './support/admin'

// OVW-005 · ADM-001 · ADM-002: login do admin contra o Supabase local.

async function expectRedirectedToLogin(page: Page, path: string) {
  await page.goto(path)
  await expect(page).toHaveURL(/\/login$/)
}

test('login válido abre o painel com a sessão em cookie httpOnly', async ({ page, context }) => {
  await signIn(page, SEED_ADMIN.email, SEED_ADMIN.password)

  await expect(page).toHaveURL(/\/artigos$/)
  await expect(page.getByRole('heading', { name: 'Artigos', level: 1 })).toBeVisible()

  const sessionCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith('sb-'))
  expect(sessionCookies.length).toBeGreaterThan(0)
  expect(sessionCookies.every((cookie) => cookie.httpOnly)).toBe(true)
})

test('senha errada mostra erro genérico e não cria sessão', async ({ page }) => {
  await signIn(page, SEED_ADMIN.email, 'senha-errada')

  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'E-mail ou senha inválidosConfira os dados e tente novamente.',
  )
  await expectRedirectedToLogin(page, '/')
})

test('e-mail inexistente recebe a mesma mensagem da senha errada', async ({ page }) => {
  await signIn(page, 'ninguem@rionegro.local', 'qualquer-senha')

  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'E-mail ou senha inválidosConfira os dados e tente novamente.',
  )
})

test.describe('usuário fora de admin_users', () => {
  let user: TestUser
  const password = 'senha-do-usuario-comum'

  test.beforeAll(async () => {
    user = await createAuthenticatedUser(password)
  })

  test.afterAll(async () => {
    await user.remove()
  })

  test('recebe "Acesso negado" e fica sem sessão', async ({ page }) => {
    await signIn(page, user.email, password)

    await expect(page.getByRole('main').getByRole('alert')).toHaveText(
      'Acesso negadoEste e-mail não tem permissão para acessar o painel.',
    )
    await expectRedirectedToLogin(page, '/')
  })
})

test('acesso anônimo a rota protegida redireciona para /login', async ({ page }) => {
  await expectRedirectedToLogin(page, '/')
  await expectRedirectedToLogin(page, '/artigos')
})

test('logout limpa a sessão', async ({ page, context }) => {
  await signIn(page, SEED_ADMIN.email, SEED_ADMIN.password)
  await expect(page).toHaveURL(/\/artigos$/)

  await page.getByRole('button', { name: 'Sair' }).click()

  await expect(page).toHaveURL(/\/login$/)
  const sessionCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith('sb-'))
  expect(sessionCookies).toEqual([])
  await expectRedirectedToLogin(page, '/')
})

// Fidelidade visual (spec 05, UI · Login): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Login', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')

  const OUT = path.join(import.meta.dirname, '__visual__')
  const PROTOTYPE = pathToFileURL(
    path.join(import.meta.dirname, '../../design/prototipo/Admin.dc.html'),
  ).href
  const SIZES = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  } as const
  let user: TestUser
  const password = 'senha-do-usuario-comum'

  test.beforeAll(async () => {
    user = await createAuthenticatedUser(password)
  })

  test.afterAll(async () => {
    await user.remove()
  })

  const STATES = [
    { state: 'padrão', file: 'padrao', fill: null, expected: '' },
    {
      state: 'e-mail ou senha inválidos',
      file: 'invalido',
      fill: () => ({ email: 'contato@rionegroinvestimentos.com.br', secret: 'senha-errada' }),
      expected: 'E-mail ou senha inválidos',
    },
    {
      state: 'acesso negado',
      file: 'negado',
      fill: () => ({ email: user.email, secret: password }),
      expected: 'Acesso negado',
    },
  ] as const

  for (const [device, viewport] of Object.entries(SIZES)) {
    for (const { state, file, fill, expected } of STATES) {
      test(`${device} · ${state}`, async ({ browser }) => {
        const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
        await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
        await prototype
          .locator(`[data-screen-label="Login · ${state} · ${device}"] > div`)
          .first()
          .screenshot({ path: path.join(OUT, `admin-login-${file}-${device}-prototipo.png`) })
        await prototype.close()

        const page = await browser.newPage({ viewport })
        if (fill) {
          const { email, secret } = fill()
          await signIn(page, email, secret)
          await expect(page.getByRole('alert').filter({ hasText: expected })).toBeVisible()
          await page.getByLabel('Senha').blur()
        } else {
          await page.goto('/login')
        }
        await page.mouse.move(0, 0)
        await page.screenshot({ path: path.join(OUT, `admin-login-${file}-${device}-app.png`) })
        await page.close()
      })
    }
  }
})
