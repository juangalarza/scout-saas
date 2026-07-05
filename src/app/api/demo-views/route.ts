import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// El visitante que abre una demo es anónimo (el dueño del negocio, sin
// cuenta en Scout), así que esta ruta no exige sesión y usa el service role
// para insertar el registro de vista y actualizar el estado del lead.
export async function POST(request: Request) {
  const { demoId } = (await request.json()) as { demoId?: string };
  if (!demoId) {
    return NextResponse.json({ error: "Falta demoId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: demo } = await supabase
    .from("demos")
    .select("id, lead_id")
    .eq("id", demoId)
    .maybeSingle();

  if (!demo) {
    return NextResponse.json({ registrado: false });
  }

  await supabase.from("demo_views").insert({
    demo_id: demo.id,
    user_agent: request.headers.get("user-agent") ?? null,
  });

  await supabase
    .from("leads")
    .update({ estado_crm: "demo_vista" })
    .eq("id", demo.lead_id)
    .in("estado_crm", ["nuevo", "demo_enviada"]);

  return NextResponse.json({ registrado: true });
}
