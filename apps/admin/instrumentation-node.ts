export async function validateEnvOrExit() {
  try {
    await import('./lib/env')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao validar o ambiente'
    process.stderr.write(`${message}\n`)
    process.exit(1)
  }
}
