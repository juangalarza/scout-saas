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

export async function crearSuscripcion({
  userId,
  plan,
  email,
  appUrl,
}: {
  userId: string;
  plan: PlanPago;
  email: string;
  appUrl: string;
}): Promise<{ initPoint: string; preapprovalId: string; montoArs: number }> {
  const { precioUsd, label } = PLANES_PAGOS[plan];
  const arsPorUsd = await arsPorUsdOficial();
  const montoArs = Math.round(precioUsd * arsPorUsd * 100) / 100;

  const res = await fetch(`${MP_API_URL}/preapproval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify({
      reason: `Scout - Plan ${label}`,
      // "userId:plan" — el webhook lo usa para saber a quién y a qué plan
      // actualizar sin tener que buscar la suscripción por otro medio.
      external_reference: `${userId}:${plan}`,
      payer_email: email,
      back_url: `${appUrl}/dashboard/configuracion`,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: montoArs,
        currency_id: "ARS",
      },
      status: "pending",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `Mercado Pago respondió ${res.status}`);
  }

  return { initPoint: data.init_point, preapprovalId: data.id, montoArs };
}

export async function obtenerSuscripcion(preapprovalId: string): Promise<{
  id: string;
  status: string;
  external_reference?: string;
}> {
  const res = await fetch(`${MP_API_URL}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo consultar la suscripción ${preapprovalId} (${res.status})`,
    );
  }

  return res.json();
}
