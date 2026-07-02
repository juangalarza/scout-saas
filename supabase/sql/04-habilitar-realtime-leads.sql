-- Habilita Supabase Realtime en la tabla leads. Sin esto, el dashboard no
-- recibe el evento INSERT y los leads no aparecen en vivo durante el
-- batching (Fase 4).

alter publication supabase_realtime add table public.leads;
