-- RLS-003 · Matriz de acesso das tabelas (docs/specs/02-security-rls.md).
-- Service role ignora RLS. Sem política = negado. lead_rate_limits não tem política nenhuma.
-- (select public.is_admin()) é avaliado uma vez por query, não por linha.

-- articles: leitura pública; escrita só do admin.
create policy articles_select_public on public.articles
  for select to anon, authenticated using (true);
create policy articles_insert_admin on public.articles
  for insert to authenticated with check ((select public.is_admin()));
create policy articles_update_admin on public.articles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy articles_delete_admin on public.articles
  for delete to authenticated using ((select public.is_admin()));

-- article_contents: conteúdo completo, só o admin (ADR 0007).
create policy article_contents_select_admin on public.article_contents
  for select to authenticated using ((select public.is_admin()));
create policy article_contents_insert_admin on public.article_contents
  for insert to authenticated with check ((select public.is_admin()));
create policy article_contents_update_admin on public.article_contents
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy article_contents_delete_admin on public.article_contents
  for delete to authenticated using ((select public.is_admin()));

-- article_slug_history: leitura pública (redirect 301); escrita só do admin.
create policy article_slug_history_select_public on public.article_slug_history
  for select to anon, authenticated using (true);
create policy article_slug_history_insert_admin on public.article_slug_history
  for insert to authenticated with check ((select public.is_admin()));
create policy article_slug_history_update_admin on public.article_slug_history
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy article_slug_history_delete_admin on public.article_slug_history
  for delete to authenticated using ((select public.is_admin()));

-- leads: sem INSERT por ninguém além da service role (LEAD-007).
-- O admin lê, apaga e atualiza só as colunas webhook_*.
create policy leads_select_admin on public.leads
  for select to authenticated using ((select public.is_admin()));
create policy leads_update_admin on public.leads
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy leads_delete_admin on public.leads
  for delete to authenticated using ((select public.is_admin()));

revoke insert, update on public.leads from anon, authenticated;
grant update (webhook_status, webhook_attempts, webhook_last_error) on public.leads to authenticated;

-- lead_rate_limits: só a service role, pela função consume_rate_limit.
revoke all on public.lead_rate_limits from anon, authenticated;

-- admin_users: cada um lê só a própria linha (na prática, só o admin tem linha).
create policy admin_users_select_own on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));
