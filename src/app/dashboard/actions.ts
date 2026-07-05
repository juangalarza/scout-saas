"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Número al que le llega el CTA de WhatsApp de todas las demos del usuario
// (no el del negocio: es el propio usuario de Scout quien recibe el mensaje).
export async function guardarWhatsapp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");

  await supabase
    .from("profiles")
    .update({ whatsapp: whatsapp || null })
    .eq("id", user.id);

  revalidatePath("/dashboard/configuracion");
}
