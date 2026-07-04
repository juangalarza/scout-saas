import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { esPlanPago, obtenerSuscripcion } from "@/lib/mercadopago";

// No confiamos en los datos del body de la notificación (cualquiera puede
// pegarle a este endpoint con un id inventado): siempre se vuelve a pedir el
// recurso a la API de Mercado Pago con el access token propio, y solo se
// actualiza el plan si esa consulta responde con datos válidos.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const data = body?.data as { id?: string } | undefined;
  const tipo = (body?.type as string | undefined) ?? url.searchParams.get("type");
  const dataId = data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo !== "subscription_preapproval" || !dataId) {
    return NextResponse.json({ recibido: true });
  }

  try {
    const suscripcion = await obtenerSuscripcion(dataId);
    const [userId, plan] = (suscripcion.external_reference ?? "").split(":");

    if (!userId || !esPlanPago(plan)) {
      return NextResponse.json({ recibido: true });
    }

    // "authorized" = el usuario aprobó y ya está pagando; cualquier otro
    // estado (cancelled, paused, pending) lo devuelve a Free.
    const nuevoPlan = suscripcion.status === "authorized" ? plan : "free";

    const supabase = createAdminClient();
    await supabase
      .from("profiles")
      .update({ plan: nuevoPlan, mp_preapproval_id: suscripcion.id })
      .eq("id", userId);
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
  }

  return NextResponse.json({ recibido: true });
}
