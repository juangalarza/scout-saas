import { redirect } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_LABEL, type Template } from "@/lib/demos/templates";

const ESTADO_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  demo_enviada: "Demo enviada",
  demo_vista: "Demo vista",
  respondio: "Respondió",
  cliente: "Cliente",
  descartado: "Descartado",
};

function tiempoRelativo(fecha: string): string {
  const minutos = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (minutos < 60) return `hace ${Math.max(minutos, 1)}min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas}hs`;
  const dias = Math.round(horas / 24);
  return `hace ${dias}d`;
}

export default async function DemosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: demos } = await supabase
    .from("demos")
    .select(
      "id, slug, template, created_at, leads(nombre, ciudad, rubro, estado_crm), demo_views(viewed_at)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <Box sx={{ width: "90%", mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Demos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Las demos que generaste para tus leads y si el negocio ya las vio.
      </Typography>

      {(!demos || demos.length === 0) && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            Todavía no generaste ninguna demo. Andá a un lead en el dashboard y
            tocá &quot;Ver demo&quot;.
          </Typography>
        </Paper>
      )}

      <Stack spacing={1.5}>
        {(demos ?? []).map((demo) => {
          const lead = Array.isArray(demo.leads) ? demo.leads[0] : demo.leads;
          const vistas = Array.isArray(demo.demo_views) ? demo.demo_views : [];
          const ultimaVista = vistas
            .map((v) => v.viewed_at as string)
            .sort()
            .at(-1);

          return (
            <Paper
              key={demo.id}
              variant="outlined"
              sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {lead?.nombre ?? "Negocio"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead?.rubro} · {lead?.ciudad} · {TEMPLATE_LABEL[demo.template as Template]}
                </Typography>
              </Box>

              <Chip
                label={ESTADO_LABEL[lead?.estado_crm ?? "nuevo"] ?? lead?.estado_crm}
                size="small"
                color={lead?.estado_crm === "demo_vista" ? "success" : "default"}
                variant="outlined"
              />

              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {ultimaVista ? `Vista ${tiempoRelativo(ultimaVista)}` : "No vista aún"}
              </Typography>

              <Link href={`/demo/${demo.slug}`} target="_blank" style={{ textDecoration: "none" }}>
                <Button size="small" variant="outlined">
                  Abrir
                </Button>
              </Link>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
