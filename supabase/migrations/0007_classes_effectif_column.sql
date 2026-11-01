-- ClassFlow — migration 0007 : colonnes manquantes sur la table classes
-- La fonction createClass insere name, niveau, effectif et responsable.
-- S'assurer que toutes ces colonnes existent.

alter table public.classes
add column if not exists name text not null default '';

alter table public.classes
add column if not exists niveau text not null default '';

alter table public.classes
add column if not exists effectif integer not null default 0;

alter table public.classes
add column if not exists responsable uuid references public.profiles(id) on delete set null;
