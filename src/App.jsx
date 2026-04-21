// src/App.jsx
import { Provider } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";

import store from "./store";
import AppRouter from "./router";
import TranslationWrapper from "./components/TranslationWrapper";

export default function App() {
  return (
    <Provider store={store}>
      <TranslationWrapper>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }} autoHideDuration={4000}>
          <AppRouter />
        </SnackbarProvider>
      </TranslationWrapper>
    </Provider>
  );
}