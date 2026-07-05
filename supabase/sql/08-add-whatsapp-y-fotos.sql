-- Fase 8: número de WhatsApp del usuario (destino del CTA en sus demos)
-- y fotos guardadas de cada demo (Google Places o fallback de Unsplash),
-- para no tener que volver a pedirlas en cada visita.
alter table public.profiles
  add column if not exists whatsapp text;

alter table public.demos
  add column if not exists fotos jsonb;

-- demo_views nunca tuvo RLS habilitado (el insert lo hace el service role
-- desde /api/demo-views, que igual bypassea RLS), así que cualquier usuario
-- autenticado podía leer las vistas de demos ajenas vía la API REST. Se
-- habilita con una policy de solo lectura para el dueño de la demo.
alter table public.demo_views enable row level security;

create policy "usuarios ven las vistas de sus propias demos" on public.demo_views
  for select using (
    exists (
      select 1 from public.demos
      where demos.id = demo_views.demo_id
      and demos.user_id = auth.uid()
    )
  );
