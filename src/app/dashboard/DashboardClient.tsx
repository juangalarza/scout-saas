"use client";

import { useState, type FormEvent } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Lead, NegocioListado } from "@/lib/types";
import { logout } from "./actions";

const TAMANO_LOTE = 8;

function badgeDeScore(score: number) {
  if (score >= 70) return { label: "HOT", color: "error" as const };
  if (score >= 40) return { label: "WARM", color: "warning" as const };
  return { label: "COLD", color: "success" as const };
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function DashboardClient({ user }: { user: User }) {
  const [ciudad, setCiudad] = useState("");
  const [rubro, setRubro] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }}
      >
        <Typography variant="h4" component="h1">
          Scout
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography color="text.secondary">{user.email}</Typography>
          <form action={logout}>
            <Button type="submit" variant="outlined" size="small">
              Cerrar sesión
            </Button>
          </form>
        </Stack>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {buscando && progreso.total > 0 && (
        <Box sx={{ mb: 2 }}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Negocio</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => {
                const badge = badgeDeScore(lead.score);
                const mensajeWhatsapp = encodeURIComponent(
                  `Hola! Vi que ${lead.nombre} podría estar perdiendo clientes por no tener presencia web. ¿Te interesa que te muestre una demo gratis?`,
                );
                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {lead.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.rubro} · {lead.ciudad}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {lead.rating} ({lead.cantidad_reviews} reseñas)
                    </TableCell>
                    <TableCell>
                      <Chip label={badge.label} color={badge.color} size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          href={`tel:${lead.telefono}`}
                          variant="outlined"
                        >
                          Llamar
                        </Button>
                        <Button
                          size="small"
                          href={`https://wa.me/${lead.telefono}?text=${mensajeWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          color="success"
                        >
                          WhatsApp
                        </Button>
                        <Button
                          size="small"
                          href={`/demo/${slugify(lead.nombre)}-${lead.id.slice(0, 6)}`}
                          variant="text"
                        >
                          Ver demo
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
