"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DiamondIcon from "@mui/icons-material/Diamond";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { logout } from "./actions";

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_WIDTH_COLLAPSED = 84;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  locked?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardOutlinedIcon /> },
  {
    label: "Mi Cartera",
    href: "/dashboard/cartera",
    icon: <WorkOutlineIcon />,
    locked: "Llega en la Fase 9 (Kanban de leads)",
  },
  {
    label: "Demos",
    href: "/dashboard/demos",
    icon: <SlideshowOutlinedIcon />,
    locked: "Llega en la Fase 8 (demos con IA)",
  },
];

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  go: "Go",
  pro: "Pro",
};

export default function Sidebar({
  email,
  plan,
  usadas,
  limite,
  colapsado,
  onToggle,
}: {
  email: string;
  plan: string;
  usadas: number;
  limite: number;
  colapsado: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const porcentaje = limite > 0 ? Math.min((usadas / limite) * 100, 100) : 0;
  const [upgradeAbierto, setUpgradeAbierto] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        bottom: 16,
        width: colapsado ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        p: 2,
        transition: "width 0.2s ease",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        {!colapsado && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Scout
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={onToggle}
          aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
        >
          {colapsado ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Stack>

      <Stack
        direction={colapsado ? "column" : "row"}
        spacing={1.5}
        sx={{ alignItems: "center", mb: 2 }}
      >
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {email.charAt(0).toUpperCase()}
        </Avatar>
        {!colapsado && (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap variant="body2" sx={{ fontWeight: 600 }}>
              {email}
            </Typography>
            <Chip label={PLAN_LABEL[plan] ?? plan} size="small" sx={{ mt: 0.5 }} />
          </Box>
        )}
      </Stack>

      {!colapsado && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Búsquedas restantes {Math.max(limite - usadas, 0)}/{limite}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={porcentaje}
            sx={{ mt: 0.5, borderRadius: 1 }}
          />
        </Box>
      )}

      <Button
        component={Link}
        href="/dashboard"
        variant="contained"
        startIcon={!colapsado ? <SearchIcon /> : undefined}
        sx={{ mb: 2, minWidth: 0 }}
      >
        {colapsado ? <SearchIcon fontSize="small" /> : "Nueva búsqueda"}
      </Button>

      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const activo = pathname === item.href;
          const itemSx = {
            alignItems: "center",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            textDecoration: "none",
            color: activo ? "primary.main" : "text.primary",
            bgcolor: activo ? "action.selected" : "transparent",
          } as const;

          const hijos = (
            <>
              {item.icon}
              {!colapsado && (
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {item.label}
                </Typography>
              )}
              {!colapsado && item.locked && (
                <LockOutlinedIcon fontSize="small" sx={{ opacity: 0.6 }} />
              )}
            </>
          );

          if (item.locked) {
            return (
              <Tooltip key={item.href} title={item.locked} placement="right">
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ ...itemSx, opacity: 0.5, cursor: "default" }}
                >
                  {hijos}
                </Stack>
              </Tooltip>
            );
          }

          return (
            <Stack
              key={item.href}
              component={Link}
              href={item.href}
              direction="row"
              spacing={1.5}
              sx={{ ...itemSx, "&:hover": { bgcolor: "action.hover" } }}
            >
              {hijos}
            </Stack>
          );
        })}
      </Stack>

      <Stack spacing={0.5}>
        <Stack
          component={Link}
          href="/dashboard/configuracion"
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            textDecoration: "none",
            color:
              pathname === "/dashboard/configuracion"
                ? "primary.main"
                : "text.primary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <SettingsOutlinedIcon />
          {!colapsado && (
            <Typography variant="body2">Configuración</Typography>
          )}
        </Stack>

        <Button
          onClick={() => setUpgradeAbierto(true)}
          variant="contained"
          startIcon={!colapsado ? <DiamondIcon /> : undefined}
          sx={{
            mt: 0.5,
            minWidth: 0,
            bgcolor: "#F5A623",
            color: "#1A1200",
            fontWeight: 700,
            "&:hover": { bgcolor: "#FFC15C" },
          }}
        >
          {colapsado ? <DiamondIcon fontSize="small" /> : "Upgrade"}
        </Button>

        <Box component="form" action={logout}>
          <Button
            type="submit"
            fullWidth
            startIcon={!colapsado ? <LogoutOutlinedIcon /> : undefined}
            sx={{
              justifyContent: colapsado ? "center" : "flex-start",
              minWidth: 0,
              color: "text.secondary",
            }}
          >
            {colapsado ? <LogoutOutlinedIcon fontSize="small" /> : "Cerrar sesión"}
          </Button>
        </Box>
      </Stack>

      <Dialog open={upgradeAbierto} onClose={() => setUpgradeAbierto(false)}>
        <DialogTitle>Los planes pagos llegan pronto</DialogTitle>
        <DialogContent>
          <Typography>
            El checkout de Mercado Pago (planes Go y Pro) se conecta en la
            Fase 7 del roadmap. Por ahora estás en el plan Free.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeAbierto(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
