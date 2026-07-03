"use client";

import { createContext, useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const UpgradeDialogContext = createContext<{ abrirUpgrade: () => void } | null>(
  null,
);

// Un solo modal de Upgrade compartido: lo abre tanto el botón del sidebar
// como el dashboard cuando se agotan los créditos del plan, para que el
// mensaje sea siempre el mismo.
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
        <DialogTitle>Los planes pagos llegan pronto</DialogTitle>
        <DialogContent>
          <Typography>
            El checkout de Mercado Pago (planes Go y Pro) se conecta en la
            Fase 7 del roadmap. Por ahora estás en el plan Free.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbierto(false)}>Cerrar</Button>
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
