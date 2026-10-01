# 0014 · Admin por allowlist (`admin_users`)

- Status: accepted · Data: 2026-09-23
- Specs: [DATA-006](../specs/01-data-model.md), [RLS-002, SEC-001](../specs/02-security-rls.md)

## Contexto
Existe uma única conta. "Qualquer autenticado é admin" dependeria só do signup estar desligado.

## Decisão
Signup desligado **e** escrita condicionada a `is_admin()`, que consulta `admin_users`.

## Consequências
- Se o signup for religado por engano, um novo usuário não ganha acesso.
