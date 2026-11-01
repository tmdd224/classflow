-- ClassFlow — migration 0006 : politiques RLS sur la table classes
-- Autorise l'insertion, la lecture et la mise à jour des classes pour les utilisateurs authentifiés.

alter table public.classes enable row level security;

-- Lecture des classes : tous les utilisateurs authentifiés peuvent lire
create policy if not exists classes_select_authenticated
on public.classes
for select
to authenticated
using (true);

-- Insertion des classes : tout utilisateur authentifié peut créer une classe
create policy if not exists classes_insert_authenticated
on public.classes
for insert
to authenticated
with check (true);

-- Mise à jour des classes : tout utilisateur authentifié peut mettre à jour (responsable, etc.)
create policy if not exists classes_update_authenticated
on public.classes
for update
to authenticated
using (true)
with check (true);
