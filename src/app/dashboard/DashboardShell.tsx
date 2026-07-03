"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Sidebar, {
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
} from "./Sidebar";
import { UpgradeDialogProvider } from "./UpgradeDialogContext";

export default function DashboardShell({
  email,
  plan,
  usadas,
  limite,
  children,
}: {
  email: string;
  plan: string;
  usadas: number;
  limite: number;
  children: React.ReactNode;
}) {
  const [colapsado, setColapsado] = useState(false);
  const anchoActivo = colapsado ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <UpgradeDialogProvider>
      <Box sx={{ minHeight: "100vh" }}>
        <Sidebar
          email={email}
          plan={plan}
          usadas={usadas}
          limite={limite}
          colapsado={colapsado}
          onToggle={() => setColapsado((v) => !v)}
        />
        <Box
          component="main"
          sx={{
            ml: `${anchoActivo + 32}px`,
            transition: "margin-left 0.2s ease",
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </UpgradeDialogProvider>
  );
}
