import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C6AF6",
    },
    success: {
      main: "#22C55E",
    },
    warning: {
      main: "#F5A524",
    },
    error: {
      main: "#EF4444",
    },
    background: {
      default: "#0B0B12",
      paper: "#16161F",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
