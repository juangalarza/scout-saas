-- Repurpose de la columna que se agregó pensando en Suscripciones
-- (Preapproval) para el modelo de pago único: ahora guarda el id del
-- último pago (payment) de Mercado Pago que activó el plan, no un id de
-- suscripción (ya no existen suscripciones).
alter table public.profiles
  rename column mp_preapproval_id to mp_payment_id;
