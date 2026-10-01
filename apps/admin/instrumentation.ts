export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { validateEnvOrExit } = await import('./instrumentation-node')
  await validateEnvOrExit()
}
