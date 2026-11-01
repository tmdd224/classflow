-- ClassFlow — migration 0007 : ajouter la colonne effectif à la table classes
-- La fonction createClass insère effectif: 0, la colonne doit exister.

alter table public.classes
add column if not exists effectif integer not null default 0;

-- S'assurer que la colonne responsable existe aussi (utilisee par createClass / updateClassResponsable)
alter table public.classes
add column if not exists responsable uuid references public.profiles(id) on delete set null;
