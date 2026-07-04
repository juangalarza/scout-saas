"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const UpgradeDialogContext = createContext<{ abrirUpgrade: () => void } | null>(
  null,
);

// Modal que se abre cuando el dashboard se topa con el límite de búsquedas
// del plan (DashboardClient). El botón "Upgrade" del sidebar ya no lo usa:
// linkea directo a /dashboard/pricing.
export function UpgradeDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <UpgradeDialogContext.Provider value={{ abrirUpgrade: () => setAbierto(true) }}>
      {children}
      <Dialog open={abierto} onClose={() => setAbierto(false)}>
        <DialogTitle>Se acabaron tus créditos</DialogTitle>
        <DialogContent>
          <Typography>
            Ya usaste todas las búsquedas de tu plan. Elegí un plan pago para
            seguir buscando clientes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbierto(false)}>Cerrar</Button>
          <Button
            component={Link}
            href="/dashboard/pricing"
            variant="contained"
            onClick={() => setAbierto(false)}
          >
            Ver planes
          </Button>
        </DialogActions>
      </Dialog>
    </UpgradeDialogContext.Provider>
  );
}

export function useUpgradeDialog() {
  const ctx = useContext(UpgradeDialogContext);
  if (!ctx) {
    throw new Error("useUpgradeDialog debe usarse dentro de UpgradeDialogProvider");
  }
  return ctx;
}
