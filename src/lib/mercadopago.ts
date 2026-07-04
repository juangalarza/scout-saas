import { arsPorUsdOficial } from "./tipo-cambio";
import { PLANES_PAGOS, type PlanPago, esPlanPago } from "./planes-pagos";

export { PLANES_PAGOS, esPlanPago };
export type { PlanPago };

const MP_API_URL = "https://api.mercadopago.com";

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta configurar MERCADOPAGO_ACCESS_TOKEN");
  return token;
}

// La API de Mercado Pago devuelve 500 (Internal server error) cuando
// payer_email tiene un alias tipo Gmail "+tag" (ej. usuario+tag@gmail.com),
// sin importar el dominio. Confirmado con pruebas directas contra la API.
// Como el propio MP ignora este campo de todos modos (siempre responde con
// payer_email vacío y resuelve al comprador real en su checkout), sacar el
// tag es seguro.
function emailSinTagMasParaMp(email: string): string {
  return email.replace(/\+[^@]*@/, "@");
}

// Pago único (Checkout Pro / Preferences), NO suscripción de Mercado Pago:
// el usuario paga una vez y el plan queda activo 30 días (ver
// src/lib/planes.ts). Sin débito automático ni tarjeta guardada — para
// seguir en el plan pago, vuelve a pagar el mes siguiente desde /pricing.
export async function crearPago({
  userId,
  plan,
  email,
  appUrl,
}: {
  userId: string;
  plan: PlanPago;
  email: string;
  appUrl: string;
}): Promise<{ initPoint: string; preferenceId: string; montoArs: number }> {
  const { precioUsd, label } = PLANES_PAGOS[plan];
  const arsPorUsd = await arsPorUsdOficial();
  const montoArs = Math.round(precioUsd * arsPorUsd * 100) / 100;

  const res = await fetch(`${MP_API_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: `Scout - Plan ${label} (30 días)`,
          quantity: 1,
          unit_price: montoArs,
          currency_id: "ARS",
        },
      ],
      payer: { email: emailSinTagMasParaMp(email) },
      // "userId:plan" — el webhook lo usa para saber a quién y a qué plan
      // activar sin tener que buscar el pago por otro medio.
      external_reference: `${userId}:${plan}`,
      back_urls: {
        success: `${appUrl}/dashboard/configuracion`,
        failure: `${appUrl}/dashboard/pricing`,
        pending: `${appUrl}/dashboard/configuracion`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/mercadopago/webhook`,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `Mercado Pago respondió ${res.status}`);
  }
  if (!data?.init_point || !data?.id) {
    throw new Error("Mercado Pago no devolvió init_point/id en la respuesta");
  }

  return { initPoint: data.init_point, preferenceId: data.id, montoArs };
}

export async function obtenerPago(paymentId: string): Promise<{
  id: number;
  status: string;
  external_reference?: string;
}> {
  const res = await fetch(`${MP_API_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudo consultar el pago ${paymentId} (${res.status})`);
  }

  return res.json();
}
