import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { esPlanPago, obtenerPago } from "@/lib/mercadopago";

const DIAS_DE_VIGENCIA = 30;

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

  if (tipo !== "payment" || !dataId) {
    return NextResponse.json({ recibido: true });
  }

  try {
    const pago = await obtenerPago(dataId);
    const [userId, plan] = (pago.external_reference ?? "").split(":");

    if (!userId || !esPlanPago(plan) || pago.status !== "approved") {
      return NextResponse.json({ recibido: true });
    }

    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + DIAS_DE_VIGENCIA);

    const supabase = createAdminClient();
    await supabase
      .from("profiles")
      .update({
        plan,
        plan_expira_en: expiraEn.toISOString(),
        mp_payment_id: String(pago.id),
      })
      .eq("id", userId);
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
  }

  return NextResponse.json({ recibido: true });
}
