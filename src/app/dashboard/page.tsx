import { redirect } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Sesión iniciada como {user.email}. El formulario de búsqueda de
          leads se arma en la Fase 3.
        </Typography>
        <form action={logout}>
          <Button type="submit" variant="outlined">
            Cerrar sesión
          </Button>
        </form>
      </Stack>
    </Container>
  );
}
