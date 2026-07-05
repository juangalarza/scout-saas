import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import DemoTemplate from "@/lib/demos/templates/DemoTemplate";
import type { CopyGenerado } from "@/lib/demos/copy";
import type { Template } from "@/lib/demos/templates";
import TrackView from "./TrackView";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: demo } = await supabase
    .from("demos")
    .select(
      "id, template, copy_generado, fotos, user_id, leads(nombre, ciudad, rating, cantidad_reviews)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!demo || !demo.leads) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", demo.user_id)
    .maybeSingle();

  const lead = Array.isArray(demo.leads) ? demo.leads[0] : demo.leads;
  const copyGenerado = (demo.copy_generado ?? {
    headline: "",
    subheadline: "",
    bio: "",
    cta_texto: "Consultar disponibilidad",
  }) as CopyGenerado;
  const fotos = (demo.fotos ?? []) as string[];

  return (
    <>
      <TrackView demoId={demo.id} />
      <DemoTemplate
        nombre={lead.nombre}
        ciudad={lead.ciudad}
        rating={lead.rating ?? 0}
        cantidadReviews={lead.cantidad_reviews ?? 0}
        reviews={[]}
        fotos={fotos}
        copyGenerado={copyGenerado}
        template={demo.template as Template}
        whatsappDestino={profile?.whatsapp ?? null}
      />
    </>
  );
}
