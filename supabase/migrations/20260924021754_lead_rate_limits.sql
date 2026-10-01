-- DATA-005 · lead_rate_limits: contadores por janela fixa, chaves ip:<hash> e email:<hash> (ADR 0011).

create table public.lead_rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null,
  primary key (key, window_start)
);

alter table public.lead_rate_limits enable row level security;

-- Conta uma tentativa na janela atual e retorna se ela ainda cabe no limite.
-- Apaga as janelas com mais de 24 h na mesma chamada.
create function public.consume_rate_limit(key text, "limit" int, "window" interval)
returns boolean
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  current_count int;
begin
  delete from public.lead_rate_limits r where r.window_start < now() - interval '24 hours';

  insert into public.lead_rate_limits as r (key, window_start, count)
  values (
    consume_rate_limit.key,
    date_bin(consume_rate_limit."window", now(), timestamptz '1970-01-01 00:00:00+00'),
    1
  )
  on conflict (key, window_start) do update set count = r.count + 1
  returning r.count into current_count;

  return current_count <= consume_rate_limit."limit";
end;
$$;

revoke execute on function public.consume_rate_limit(text, int, interval)
  from public, anon, authenticated;
