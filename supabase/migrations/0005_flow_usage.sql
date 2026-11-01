-- ClassFlow — migration 0005 : limite quotidienne d'usage de l'assistant Flow
-- Chaque utilisateur actif a un nombre maximal de questions par jour.
-- La table n'est lisible ni modifiable depuis le navigateur : seule la fonction
-- flow_register_use() (appelée par la fonction serveur) y écrit.

create table if not exists public.flow_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day     date not null default current_date,
  n       integer not null default 0,
  primary key (user_id, day)
);
alter table public.flow_usage enable row level security;   -- aucune règle : accès client refusé
revoke all on public.flow_usage from anon, authenticated;

create or replace function public.flow_register_use(p_limit integer default 40)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  me  uuid := auth.uid();
  cnt integer;
begin
  if me is null or public.current_role_name() is null then
    return false;                                          -- non connecté ou compte inactif
  end if;
  insert into public.flow_usage as f (user_id, day, n)
  values (me, current_date, 1)
  on conflict (user_id, day) do update set n = f.n + 1
  returning f.n into cnt;
  return cnt <= greatest(p_limit, 1);
end $$;

revoke execute on function public.flow_register_use(integer) from public, anon;
grant  execute on function public.flow_register_use(integer) to authenticated;
