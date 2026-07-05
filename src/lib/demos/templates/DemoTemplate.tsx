import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import StarIcon from "@mui/icons-material/Star";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import type { Template } from "../templates";
import type { CopyGenerado } from "../copy";
import { TEMPLATE_CONFIG } from "./config";

export type DemoTemplateProps = {
  nombre: string;
  ciudad: string;
  rating: number;
  cantidadReviews: number;
  reviews: string[];
  fotos: string[];
  copyGenerado: CopyGenerado;
  template: Template;
  whatsappDestino: string | null;
};

export default function DemoTemplate({
  nombre,
  ciudad,
  rating,
  cantidadReviews,
  reviews,
  fotos,
  copyGenerado,
  template,
  whatsappDestino,
}: DemoTemplateProps) {
  const config = TEMPLATE_CONFIG[template];
  const heroFoto = fotos[0];
  const galeria = fotos.slice(1, 3);

  const mensajeWhatsapp = `Hola! Vi la demo de mi negocio "${nombre}" que me armaron, quiero saber más.`;
  const linkWhatsapp = whatsappDestino
    ? `https://wa.me/${whatsappDestino}?text=${encodeURIComponent(mensajeWhatsapp)}`
    : null;

  return (
    <Box sx={{ bgcolor: "#fff", color: "#0F172A", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 360, md: 480 },
          display: "flex",
          alignItems: "flex-end",
          backgroundColor: config.color,
          backgroundImage: heroFoto ? `url(${heroFoto})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: heroFoto
              ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)"
              : "none",
          }}
        />
        <Box sx={{ position: "relative", p: { xs: 3, md: 6 }, color: "#fff", width: "100%" }}>
          <Chip
            label={config.kicker}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "2.75rem" } }}>
            {copyGenerado.headline || nombre}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 400, opacity: 0.95 }}>
            {copyGenerado.subheadline}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
            {rating > 0 && (
              <Chip
                icon={<StarIcon sx={{ color: "#F5A524 !important" }} />}
                label={`${rating} · ${cantidadReviews} reseñas`}
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
              />
            )}
            <Chip label={ciudad} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#334155" }}>
          {copyGenerado.bio}
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 700, mt: 5, mb: 2 }}>
          {config.serviciosLabel}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
          {config.servicios.map((servicio) => (
            <Paper key={servicio} variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {servicio}
              </Typography>
            </Paper>
          ))}
        </Stack>

        {galeria.length > 0 && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 5, mb: 2 }}>
              Galería
            </Typography>
            <Stack direction="row" spacing={2}>
              {galeria.map((foto) => (
                <Box
                  key={foto}
                  component="img"
                  src={foto}
                  alt={nombre}
                  sx={{ width: "50%", height: 220, objectFit: "cover", borderRadius: 2 }}
                />
              ))}
            </Stack>
          </>
        )}

        {reviews.length > 0 && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 5, mb: 2 }}>
              Lo que dicen nuestros clientes
            </Typography>
            <Stack spacing={2}>
              {reviews.slice(0, 3).map((review, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontStyle: "italic", color: "#475569" }}>
                    “{review}”
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </>
        )}

        <Box
          sx={{
            mt: 6,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: config.color,
            color: "#fff",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {nombre}
          </Typography>
          {linkWhatsapp ? (
            <Button
              size="large"
              variant="contained"
              startIcon={<WhatsAppIcon />}
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ bgcolor: "#fff", color: config.color, "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              {copyGenerado.cta_texto || "Consultar disponibilidad"}
            </Button>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {copyGenerado.cta_texto || "Consultar disponibilidad"}
            </Typography>
          )}
        </Box>

        <Typography variant="caption" sx={{ display: "block", mt: 4, textAlign: "center", color: "#94A3B8" }}>
          Demo generada por Scout — así podría verse la web de este negocio.
        </Typography>
      </Box>
    </Box>
  );
}
