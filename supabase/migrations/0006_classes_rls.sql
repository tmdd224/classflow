-- ClassFlow — migration 0006 : politiques RLS sur la table classes
-- Autorise l'insertion, la lecture et la mise à jour des classes pour les utilisateurs authentifiés.

alter table public.classes enable row level security;

-- Lecture des classes : tous les utilisateurs authentifiés peuvent lire
drop policy if exists classes_select_authenticated on public.classes;
create policy classes_select_authenticated
on public.classes
for select
to authenticated
using (true);

-- Insertion des classes : tout utilisateur authentifié peut créer une classe
drop policy if exists classes_insert_authenticated on public.classes;
create policy classes_insert_authenticated
on public.classes
for insert
to authenticated
with check (true);

-- Mise à jour des classes : tout utilisateur authentifié peut mettre à jour (responsable, etc.)
drop policy if exists classes_update_authenticated on public.classes;
create policy classes_update_authenticated
on public.classes
for update
to authenticated
using (true)
with check (true);
