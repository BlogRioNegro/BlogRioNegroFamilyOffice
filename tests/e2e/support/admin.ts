import type { Page } from '@playwright/test'
import { SEED_ADMIN } from '../../integration/support/clients'

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

export async function signInAsAdmin(page: Page) {
  await signIn(page, SEED_ADMIN.email, SEED_ADMIN.password)
  await page.waitForURL(/\/artigos$/)
}
