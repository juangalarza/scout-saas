-- Fase 7: guardamos el id de la suscripción (preapproval) de Mercado Pago
-- asociada al usuario, para poder re-consultar su estado (ej. detectar una
-- cancelación) sin depender solo del webhook.

alter table public.profiles
  add column if not exists mp_preapproval_id text;
