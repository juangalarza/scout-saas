-- Fase 7 (rediseño): los planes pagos ya no son suscripciones con débito
-- automático de Mercado Pago, son pagos únicos que el usuario repite cada
-- vez que quiere renovar el plan por 30 días más. plan_expira_en marca
-- cuándo vence; si se vence y no se renovó, el usuario vuelve a Free.

alter table public.profiles
  add column if not exists plan_expira_en timestamptz;
