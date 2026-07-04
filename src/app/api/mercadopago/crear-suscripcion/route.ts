import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearSuscripcion, esPlanPago } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan?: string };

  if (!plan || !esPlanPago(plan)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const appUrl = new URL(request.url).origin;

  try {
    const { initPoint } = await crearSuscripcion({
      userId: user.id,
      plan,
      email: user.email,
      appUrl,
    });
    return NextResponse.json({ initPoint });
  } catch (err) {
    const mensaje =
      err instanceof Error ? err.message : "Error creando la suscripción";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
