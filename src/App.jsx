// src/App.jsx
// ─────────────────────────────────────────────────────────────────
// Point d'entrée — Providers : Redux + MUI Theme + Router
// ─────────────────────────────────────────────────────────────────
import { Provider }            from "react-redux";
import { ThemeProvider }       from "@mui/material/styles";
import CssBaseline             from "@mui/material/CssBaseline";
import { SnackbarProvider }    from "notistack";

import store                   from "./store";
import theme                   from "./theme/theme";
import AppRouter               from "./router";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={4000}>
          <AppRouter />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}