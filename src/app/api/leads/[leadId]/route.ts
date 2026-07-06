import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ESTADOS_VALIDOS = [
  "nuevo",
  "demo_enviada",
  "demo_vista",
  "respondio",
  "cliente",
  "descartado",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { leadId } = await params;
  const { estado_crm } = (await request.json()) as { estado_crm?: string };

  if (!estado_crm || !ESTADOS_VALIDOS.includes(estado_crm as (typeof ESTADOS_VALIDOS)[number])) {
    return NextResponse.json({ error: "estado_crm inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("leads")
    .update({ estado_crm })
    .eq("id", leadId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
