// src/components/TranslationWrapper.jsx
// Gère uniquement RTL/LTR + police + thème MUI.
// La traduction des textes est faite via useTranslation() dans chaque composant.
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/authSlice";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import baseTheme from "../theme/theme";

const TranslationContext = createContext({ lang: "fr", isRTL: false, dir: "ltr" });
export const useT = () => useContext(TranslationContext);

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] });
const cacheLtr = createCache({ key: "mui" });

export default function TranslationWrapper({ children }) {
  const user = useSelector(selectUser);
  const [lang, setLang] = useState(user?.language || "fr");
  const isRTL = lang === "ar";

  // useEffect(() => {
  //   setTimeout(function () {
  //     setLang(useSelector(selectUser)?.language || "fr");
  //   }, 1000);
  // }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.body.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  const theme = createTheme({
    ...baseTheme,
    direction: isRTL ? "rtl" : "ltr",
    typography: {
      ...baseTheme.typography,
      fontFamily: isRTL
        ? "'Cairo', 'Nunito', 'Helvetica Neue', Arial, sans-serif"
        : "'Nunito', 'Cairo', 'Helvetica Neue', Arial, sans-serif",
    },
  });

  return (
    <TranslationContext.Provider value={{ lang, isRTL, dir: isRTL ? "rtl" : "ltr" }}>
      <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </CacheProvider>
    </TranslationContext.Provider>
  );
}