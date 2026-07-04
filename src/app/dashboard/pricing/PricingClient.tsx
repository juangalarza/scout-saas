"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import { PLANES_PAGOS, type PlanPago } from "@/lib/planes-pagos";

const PLANES = [
  {
    id: "free" as const,
    label: "Free",
    precio: "$0",
    detalle: "3 búsquedas totales",
    features: ["3 búsquedas de por vida", "Scoring de oportunidades", "WhatsApp directo"],
  },
  {
    id: "go" as const,
    label: PLANES_PAGOS.go.label,
    precio: `$${PLANES_PAGOS.go.precioUsd}`,
    detalle: `${PLANES_PAGOS.go.busquedasPorMes} búsquedas/mes`,
    features: [
      `${PLANES_PAGOS.go.busquedasPorMes} búsquedas por mes`,
      "Scoring de oportunidades",
      "WhatsApp directo",
    ],
  },
  {
    id: "pro" as const,
    label: PLANES_PAGOS.pro.label,
    precio: `$${PLANES_PAGOS.pro.precioUsd}`,
    detalle: `${PLANES_PAGOS.pro.busquedasPorMes} búsquedas/mes`,
    features: [
      `${PLANES_PAGOS.pro.busquedasPorMes} búsquedas por mes`,
      "Scoring de oportunidades",
      "WhatsApp directo",
      "Soporte prioritario",
    ],
  },
];

export default function PricingClient({
  planActual,
  expiraEn,
  arsPorUsd,
}: {
  planActual: string;
  expiraEn: string | null;
  arsPorUsd: number | null;
}) {
  const [cargando, setCargando] = useState<PlanPago | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegirPlan(plan: PlanPago) {
    setError(null);
    setCargando(plan);
    try {
      const res = await fetch("/api/mercadopago/crear-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo iniciar el pago");
      }
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setCargando(null);
    }
  }

  return (
    <Box sx={{ width: "90%", mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Planes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Precios en USD, se cobran en ARS al tipo de cambio oficial del día vía
        Mercado Pago. Es un pago único que activa el plan por 30 días — no es
        débito automático, así que para seguir en el plan pago hay que volver
        a pagar acá cuando venza.
      </Typography>
      {arsPorUsd && (
        <Typography variant="caption" color="text.secondary">
          Hoy: 1 USD ≈ ${arsPorUsd.toLocaleString("es-AR")} ARS
        </Typography>
      )}
      {planActual !== "free" && expiraEn && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Tu plan vence el{" "}
          {new Date(expiraEn).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          . Volvé a pagar antes de esa fecha para no perder el acceso.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
        {PLANES.map((p) => {
          const esActual = planActual === p.id;
          return (
            <Paper
              key={p.id}
              variant="outlined"
              sx={{
                p: 3,
                flex: 1,
                borderColor: esActual ? "primary.main" : "divider",
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {p.label}
                </Typography>
                {esActual && <Chip label="Tu plan actual" size="small" color="primary" />}
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {p.precio}
                <Typography component="span" variant="body2" color="text.secondary">
                  {p.id !== "free" ? " / 30 días" : ""}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {p.detalle}
              </Typography>

              <Stack spacing={1} sx={{ mb: 3 }}>
                {p.features.map((f) => (
                  <Stack key={f} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <CheckIcon fontSize="small" sx={{ color: "success.main" }} />
                    <Typography variant="body2">{f}</Typography>
                  </Stack>
                ))}
              </Stack>

              {p.id === "free" ? (
                <Button variant="outlined" fullWidth disabled>
                  {esActual ? "Tu plan actual" : "Plan gratuito"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={cargando !== null}
                  onClick={() => elegirPlan(p.id as PlanPago)}
                >
                  {cargando === p.id
                    ? "Redirigiendo a Mercado Pago..."
                    : esActual
                      ? `Renovar ${p.label}`
                      : `Elegir ${p.label}`}
                </Button>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
