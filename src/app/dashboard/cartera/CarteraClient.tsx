"use client";

import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import StarIcon from "@mui/icons-material/Star";

export type LeadCartera = {
  id: string;
  nombre: string;
  rubro: string;
  ciudad: string;
  rating: number | null;
  cantidad_reviews: number | null;
  estado_crm: string;
  demoSlug: string | null;
};

const COLUMNAS = [
  { estado: "nuevo", label: "Nuevo" },
  { estado: "demo_enviada", label: "Demo enviada" },
  { estado: "demo_vista", label: "Demo vista" },
  { estado: "respondio", label: "Respondió" },
  { estado: "cliente", label: "Cliente" },
  { estado: "descartado", label: "Descartado" },
] as const;

function TarjetaLead({ lead }: { lead: LeadCartera }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        cursor: "grab",
        opacity: isDragging ? 0.4 : 1,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        zIndex: isDragging ? 10 : "auto",
        position: "relative",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {lead.nombre}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {lead.rubro} · {lead.ciudad}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
        {lead.rating != null && lead.rating > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <StarIcon fontSize="inherit" sx={{ color: "warning.main" }} />
            <Typography variant="caption">
              {lead.rating} ({lead.cantidad_reviews ?? 0})
            </Typography>
          </Stack>
        )}
        {lead.demoSlug && <Chip label="Con demo" size="small" variant="outlined" />}
      </Stack>
    </Paper>
  );
}

function Columna({
  estado,
  label,
  leads,
}: {
  estado: string;
  label: string;
  leads: LeadCartera[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1.5,
        minWidth: 260,
        width: 260,
        flexShrink: 0,
        bgcolor: isOver ? "action.hover" : "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Chip label={leads.length} size="small" />
      </Stack>
      <Box sx={{ minHeight: 80, flexGrow: 1 }}>
        {leads.map((lead) => (
          <TarjetaLead key={lead.id} lead={lead} />
        ))}
      </Box>
    </Paper>
  );
}

export default function CarteraClient({ leadsIniciales }: { leadsIniciales: LeadCartera[] }) {
  const [leads, setLeads] = useState(leadsIniciales);
  const [error, setError] = useState<string | null>(null);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const nuevoEstado = String(over.id);
    const leadActual = leads.find((l) => l.id === leadId);
    if (!leadActual || leadActual.estado_crm === nuevoEstado) return;

    const estadoAnterior = leadActual.estado_crm;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado_crm: nuevoEstado } : l)),
    );

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_crm: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError("No se pudo mover el lead, probá de nuevo.");
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, estado_crm: estadoAnterior } : l)),
      );
    }
  }

  return (
    <Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <DndContext onDragEnd={handleDragEnd}>
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 2 }}>
          {COLUMNAS.map((col) => (
            <Columna
              key={col.estado}
              estado={col.estado}
              label={col.label}
              leads={leads.filter((l) => l.estado_crm === col.estado)}
            />
          ))}
        </Stack>
      </DndContext>
    </Box>
  );
}
