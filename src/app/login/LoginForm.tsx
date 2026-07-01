"use client";

import { useActionState, useState, type SyntheticEvent } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { login, signup, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

export default function LoginForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState,
  );

  function handleTabChange(_event: SyntheticEvent, value: "login" | "signup") {
    setTab(value);
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <Card sx={{ width: 400 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Ingresar" value="login" />
          <Tab label="Crear cuenta" value="signup" />
        </Tabs>
        <CardContent>
          {tab === "login" ? (
            <Box component="form" action={loginAction}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="h6">Ingresá a tu cuenta</Typography>
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  required
                  fullWidth
                />
                <TextField
                  name="password"
                  type="password"
                  label="Contraseña"
                  required
                  fullWidth
                />
                {loginState.error && (
                  <Alert severity="error">{loginState.error}</Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loginPending}
                  fullWidth
                >
                  Ingresar
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" action={signupAction}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="h6">Creá tu cuenta gratis</Typography>
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  required
                  fullWidth
                />
                <TextField
                  name="password"
                  type="password"
                  label="Contraseña"
                  helperText="Mínimo 8 caracteres"
                  required
                  fullWidth
                />
                {signupState.error && (
                  <Alert severity="error">{signupState.error}</Alert>
                )}
                {signupState.message && (
                  <Alert severity="success">{signupState.message}</Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={signupPending}
                  fullWidth
                >
                  Crear cuenta
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
