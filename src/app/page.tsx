import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <Stack spacing={3} sx={{ alignItems: "center" }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          Scout
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Prospección de clientes web: encontrá negocios locales sin sitio,
          con score de oportunidad y contacto directo por WhatsApp.
        </Typography>
        <Button variant="contained" size="large">
          Empezar
        </Button>
      </Stack>
    </Container>
  );
}
