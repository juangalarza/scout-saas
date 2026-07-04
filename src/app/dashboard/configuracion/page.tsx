import { redirect } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../actions";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";

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
        <Typography sx={{ mt: 1, mb: 2 }}>
          Estás en el plan <strong>{PLAN_LABEL[plan] ?? plan}</strong>.
        </Typography>
        <Button component={Link} href="/dashboard/pricing" variant="outlined">
          {plan === "free" ? "Ver planes pagos" : "Cambiar de plan"}
        </Button>
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
