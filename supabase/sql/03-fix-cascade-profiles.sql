-- El schema original (sección 2) no definía ON DELETE CASCADE en profiles.id.
-- Sin esto, borrar un usuario de auth.users falla con un error de FK si
-- todavía tiene fila en profiles (lo vimos al limpiar usuarios de prueba en
-- la verificación de Fase 2). Con cascade, borrar el usuario de Auth borra
-- automáticamente su profile (y en cascada, todo lo que cuelga de profiles
-- vía las otras FKs: usage, searches, leads, demos).

alter table public.profiles
  drop constraint profiles_id_fkey,
  add constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade;
