import { redirect } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createClient } from "@/lib/supabase/server";
import { obtenerPlanVigente } from "@/lib/planes";
import { logout, guardarWhatsapp } from "../actions";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  go: "Go",
  pro: "Pro",
};

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { plan, expiraEn } = await obtenerPlanVigente(supabase, user.id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", user.id)
    .single();

  return (
    <Box sx={{ width: "90%", mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Configuración
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Gestioná tu cuenta y tu plan.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Cuenta
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", mt: 1 }}
        >
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {(user.email ?? "?").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{user.email}</Typography>
          </Box>
          <Chip label={PLAN_LABEL[plan] ?? plan} />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Plan
        </Typography>
        <Typography sx={{ mt: 1, mb: expiraEn ? 0.5 : 2 }}>
          Estás en el plan <strong>{PLAN_LABEL[plan] ?? plan}</strong>.
        </Typography>
        {expiraEn && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vence el{" "}
            {new Date(expiraEn).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            .
          </Typography>
        )}
        <Link href="/dashboard/pricing" style={{ textDecoration: "none" }}>
          <Button variant="outlined">
            {plan === "free" ? "Ver planes pagos" : "Renovar / cambiar de plan"}
          </Button>
        </Link>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          WhatsApp
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>
          A este número le va a llegar el mensaje de cada negocio que abra una
          demo y quiera contactarte (no es el número del negocio, es el tuyo).
        </Typography>
        <form action={guardarWhatsapp}>
          <Stack direction="row" spacing={1.5}>
            <TextField
              name="whatsapp"
              size="small"
              placeholder="Ej: 5491122334455"
              defaultValue={profile?.whatsapp ?? ""}
              sx={{ maxWidth: 260 }}
            />
            <Button type="submit" variant="outlined">
              Guardar
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="overline" color="text.secondary">
          Sesión
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <form action={logout}>
            <Button type="submit" variant="outlined" color="error">
              Cerrar sesión
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
