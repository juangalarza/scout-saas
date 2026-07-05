"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import StarIcon from "@mui/icons-material/Star";
import LanguageOffIcon from "@mui/icons-material/LanguageOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { RealtimeChannel, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Lead, NegocioListado } from "@/lib/types";
import { NICHOS, NICHO_MANUAL } from "@/lib/scout/nichos";
import { useUpgradeDialog } from "./UpgradeDialogContext";

const TAMANO_LOTE = 8;
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

export type StatsBase = {
  sinWeb: number;
  contactables: number;
  nichos: number;
  busquedasUsadas: number;
  busquedasLimite: number;
};

function badgeDeScore(score: number) {
  if (score >= 86) return { label: "Oportunidad ideal", color: "success" as const };
  return { label: "Explorar", color: "warning" as const };
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
  const [nicho, setNicho] = useState("");
  const [nichoManual, setNichoManual] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [ciudadInput, setCiudadInput] = useState("");
  const [opcionesCiudad, setOpcionesCiudad] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [progreso, setProgreso] = useState({ hechos: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [demoCargando, setDemoCargando] = useState<string | null>(null);
  const [leadParaConfirmarDemo, setLeadParaConfirmarDemo] = useState<Lead | null>(null);
  const router = useRouter();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { abrirUpgrade } = useUpgradeDialog();

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        createClient().removeChannel(channelRef.current);
      }
    };
  }, []);

  // Autocompletado de ciudad (mismo patrón que Huntly): a medida que se
  // escribe, se piden sugerencias reales a Google Places con debounce para
  // no disparar un request por cada letra.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (ciudadInput.trim().length < 2) {
      setOpcionesCiudad([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/lugares/autocomplete?input=${encodeURIComponent(ciudadInput)}`,
        );
        if (res.ok) {
          const { sugerencias } = await res.json();
          setOpcionesCiudad(sugerencias ?? []);
        }
      } catch {
        // El autocompletado es un plus, no debe bloquear la búsqueda si falla.
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ciudadInput]);

  const leadsOrdenados = useMemo(
    () => [...leads].sort((a, b) => b.score - a.score),
    [leads],
  );

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

  const rubro = nicho === NICHO_MANUAL ? nichoManual.trim() : nicho;

  async function generarDemoConfirmada() {
    const lead = leadParaConfirmarDemo;
    if (!lead) return;
    setLeadParaConfirmarDemo(null);
    setDemoCargando(lead.id);
    setError(null);
    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar la demo");
      }
      window.open(`/demo/${data.slug}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la demo");
    } finally {
      setDemoCargando(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!rubro) {
      setError(
        nicho === NICHO_MANUAL
          ? "Escribí el rubro que querés buscar"
          : "Elegí un rubro",
      );
      return;
    }

    if (statsBase.busquedasUsadas >= statsBase.busquedasLimite) {
      abrirUpgrade();
      return;
    }

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
        const { error: mensaje, limiteAlcanzado } = await resSearch.json();
        if (limiteAlcanzado) {
          abrirUpgrade();
          setBuscando(false);
          return;
        }
        throw new Error(mensaje ?? "No se pudo iniciar la búsqueda");
      }

      router.refresh();

      const { searchId, negocios } = (await resSearch.json()) as {
        searchId: string;
        negocios: NegocioListado[];
      };

      setProgreso({ hechos: 0, total: negocios.length });

      const supabase = createClient();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Sin esto, el socket de Realtime puede autenticarse como anónimo si
      // se conecta antes de que la sesión termine de sincronizar, y el RLS
      // de "leads" filtra todos los broadcasts sin avisar.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }

      // Supabase Realtime empuja cada lead a medida que se inserta en la DB
      // (sin esto, solo veríamos los resultados recién al final de cada
      // request — con Realtime aparecen en vivo aunque el batching lo haga
      // otra pestaña o, más adelante, un cron). Importante: hay que esperar
      // a que el canal quede "SUBSCRIBED" antes de disparar los inserts —
      // si no, el primer lote (que puede insertarse en el mismo instante
      // que el handshake del websocket) se pierde, porque Realtime no
      // reenvía eventos ocurridos antes de la suscripción.
      await new Promise<void>((resolve, reject) => {
        channelRef.current = supabase
          .channel(`leads-${searchId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "leads",
              filter: `search_id=eq.${searchId}`,
            },
            (payload) => {
              const nuevoLead = payload.new as Lead;
              setLeads((prev) =>
                prev.some((l) => l.id === nuevoLead.id)
                  ? prev
                  : [...prev, nuevoLead],
              );
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") resolve();
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              reject(new Error("No se pudo conectar a Supabase Realtime"));
            }
          });
      });

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

        setProgreso((prev) => ({ ...prev, hechos: prev.hechos + lote.length }));
      }

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
    <Box sx={{ width: "90%", mx: "auto" }}>
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
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel id="nicho-label">Rubro</InputLabel>
                <Select
                  labelId="nicho-label"
                  label="Rubro"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  MenuProps={{
                    slotProps: { paper: { sx: { maxHeight: 7 * 36 + 16 } } },
                  }}
                >
                  {NICHOS.map((n) => (
                    <MenuItem key={n.value} value={n.value}>
                      {n.label}
                    </MenuItem>
                  ))}
                  <MenuItem value={NICHO_MANUAL}>✍️ Escribir manualmente</MenuItem>
                </Select>
              </FormControl>
              <Autocomplete
                freeSolo
                fullWidth
                options={opcionesCiudad}
                inputValue={ciudadInput}
                onInputChange={(_, value) => {
                  setCiudadInput(value);
                  setCiudad(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ciudad"
                    placeholder="Córdoba, Rosario..."
                    required
                  />
                )}
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

            {nicho === NICHO_MANUAL && (
              <TextField
                label="Rubro (escribilo)"
                placeholder="dentista, barbería, taller..."
                value={nichoManual}
                onChange={(e) => setNichoManual(e.target.value)}
                required
                fullWidth
              />
            )}
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

      {leadsOrdenados.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {leadsOrdenados.length} oportunidades de venta
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {leadsOrdenados.map((lead, i) => {
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
                    <Chip
                      icon={<FiberManualRecordIcon sx={{ fontSize: "8px !important" }} />}
                      label={badge.label}
                      color={badge.color}
                      size="small"
                      variant="outlined"
                      sx={{
                        px: 0.75,
                        "& .MuiChip-icon": { ml: 0.5 },
                        "& .MuiChip-label": { pl: 0.75, pr: 0.5 },
                      }}
                    />
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
                      sx={{ color: "#fff" }}
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
                      variant="text"
                      disabled={demoCargando === lead.id}
                      onClick={() => setLeadParaConfirmarDemo(lead)}
                    >
                      {demoCargando === lead.id ? "Generando…" : "Generar demo"}
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </>
      )}

      <Dialog open={Boolean(leadParaConfirmarDemo)} onClose={() => setLeadParaConfirmarDemo(null)}>
        <DialogTitle>¿El cliente ya dijo que quiere ver la demo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Generar la demo de <strong>{leadParaConfirmarDemo?.nombre}</strong>{" "}
            usa IA (Claude) para escribir el copy — hacelo solo si {leadParaConfirmarDemo?.nombre}{" "}
            ya respondió que sí al mensaje de WhatsApp, para no gastar de más en
            demos que capaz nadie ve.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeadParaConfirmarDemo(null)}>Todavía no</Button>
          <Button variant="contained" onClick={generarDemoConfirmada}>
            Sí, generar demo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
