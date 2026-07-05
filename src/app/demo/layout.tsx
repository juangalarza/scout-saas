"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Las demos son páginas públicas que simulan la web de un negocio real, así
// que usan un tema claro propio en vez del tema oscuro del dashboard de Scout.
const temaDemo = createTheme({
  palette: { mode: "light" },
  shape: { borderRadius: 12 },
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={temaDemo}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
