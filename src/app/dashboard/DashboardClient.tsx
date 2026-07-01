"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import StarIcon from "@mui/icons-material/Star";
import LanguageOffIcon from "@mui/icons-material/LanguageOutlined";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Lead, NegocioListado } from "@/lib/types";

const TAMANO_LOTE = 8;

export type StatsBase = {
  sinWeb: number;
  contactables: number;
  nichos: number;
  busquedasUsadas: number;
  busquedasLimite: number;
};

function badgeDeScore(score: number) {
  if (score <= 40) return { label: String(score), color: "info" as const };
  if (score >= 70) return { label: String(score), color: "error" as const };
  return { label: String(score), color: "warning" as const };
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mensajeApertura(lead: Lead) {
  return `Hola! Vi que ${lead.nombre} tiene ${lead.cantidad_reviews} reseñas y ${lead.rating}★ pero no encontré su web. ¿Te interesa que te muestre una demo gratis de cómo se vería?`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 160 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function DashboardClient({
  user,
  statsBase,
}: {
  user: User;
  statsBase: StatsBase;
}) {
  const [ciudad, setCiudad] = useState("");
  const [rubro, setRubro] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const stats = useMemo(() => {
    const sinWebEnSesion = leads.filter((l) => !l.tiene_web).length;
    const contactablesEnSesion = leads.filter((l) => l.telefono).length;
    return {
      sinWeb: statsBase.sinWeb + sinWebEnSesion,
      contactables: statsBase.contactables + contactablesEnSesion,
      nichos: statsBase.nichos,
      busquedas: `${statsBase.busquedasUsadas}/${statsBase.busquedasLimite}`,
    };
  }, [leads, statsBase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLeads([]);
    setBuscando(true);
    setProgreso({ hechos: 0, total: 0 });

    try {
      const resSearch = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciudad, rubro }),
      });

      if (!resSearch.ok) {
        const { error: mensaje } = await resSearch.json();
        throw new Error(mensaje ?? "No se pudo iniciar la búsqueda");
      }

      router.refresh();

      const { searchId, negocios } = (await resSearch.json()) as {
        searchId: string;
        negocios: NegocioListado[];
      };

      setProgreso({ hechos: 0, total: negocios.length });

      for (let i = 0; i < negocios.length; i += TAMANO_LOTE) {
        const lote = negocios.slice(i, i + TAMANO_LOTE);
        const resLote = await fetch("/api/leads/analizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchId, negocios: lote }),
        });

        if (!resLote.ok) {
          const { error: mensaje } = await resLote.json();
          throw new Error(mensaje ?? "Error analizando un lote de negocios");
        }

        const { leads: nuevosLeads } = (await resLote.json()) as {
          leads: Lead[];
        };
        setLeads((prev) => [...prev, ...nuevosLeads]);
        setProgreso((prev) => ({ ...prev, hechos: prev.hechos + lote.length }));
      }

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("searches")
        .update({ estado: "completa" })
        .eq("id", searchId);
      if (updateError) {
        throw new Error(updateError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="body2" color="text.secondary">
        Hola, {user.email}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Alguien necesita tu web hoy
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatCard label="Sin web encontrados" value={String(stats.sinWeb)} />
        <StatCard label="Leads contactables" value={String(stats.contactables)} />
        <StatCard label="Nichos explorados" value={String(stats.nichos)} />
        <StatCard label="Búsquedas usadas" value={stats.busquedas} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Descubrir clientes
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Rubro"
              placeholder="dentista, barbería, taller..."
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Ciudad"
              placeholder="Córdoba, Rosario..."
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={buscando}
              sx={{ minWidth: 160 }}
            >
              {buscando ? "Buscando..." : "Buscar leads"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {buscando && progreso.total > 0 && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={(progreso.hechos / progreso.total) * 100}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Analizando {progreso.hechos}/{progreso.total} negocios...
          </Typography>
        </Box>
      )}

      {leads.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {leads.length} oportunidades de venta
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {leads.map((lead, i) => {
              const badge = badgeDeScore(lead.score);
              const mensaje = mensajeApertura(lead);
              return (
                <Paper key={lead.id} variant="outlined" sx={{ p: 2.5 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        #{i + 1}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {lead.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.rubro} · {lead.ciudad}
                      </Typography>
                    </Box>
                    <Chip label={badge.label} color={badge.color} size="small" />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", flexWrap: "wrap", mb: 1.5 }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <StarIcon fontSize="small" sx={{ color: "warning.main" }} />
                      <Typography variant="body2">
                        {lead.rating} ({lead.cantidad_reviews})
                      </Typography>
                    </Stack>
                    {!lead.tiene_web && (
                      <Chip
                        icon={<LanguageOffIcon />}
                        label="Sin web"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, mb: 2, bgcolor: "background.default" }}
                  >
                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                      MENSAJE DE APERTURA
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {mensaje}
                    </Typography>
                  </Paper>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      href={`https://wa.me/${lead.telefono}?text=${encodeURIComponent(mensaje)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      color="success"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PhoneIcon />}
                      href={`tel:${lead.telefono}`}
                      variant="contained"
                    >
                      Llamar
                    </Button>
                    <Button
                      size="small"
                      href={`/demo/${slugify(lead.nombre)}-${lead.id.slice(0, 6)}`}
                      variant="text"
                    >
                      Ver demo
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
