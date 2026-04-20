// src/components/TranslationWrapper.jsx
// =============================================================================
// CORRECTIONS par rapport à la version précédente :
//
// BUG 1 — Mauvais sélecteur CSS
//   Avant : document.querySelector('.google_translate_element')
//   Fix   : document.querySelector('select.goog-te-combo')
//           C'est le <select> créé PAR Google Translate à l'intérieur du div,
//           pas le div conteneur lui-même.
//
// BUG 2 — display:none empêche l'initialisation
//   Avant : <div style="display:none">
//   Fix   : <div style="position:fixed; top:-9999px"> dans index.html
//           Google Translate doit trouver son div dans le DOM visible.
//
// BUG 3 — Timing : widget pas encore chargé quand useEffect s'exécute
//   Avant : setTimeout(1000ms) non fiable
//   Fix   : MutationObserver qui attend que 'select.goog-te-combo' apparaisse
//           + écoute de l'événement 'googleTranslateReady' défini dans index.html
//
// BUG 4 — Mauvais mapping de langue pour "français"
//   Pour revenir au français (langue source), il faut :
//     - Supprimer le cookie 'googtrans'
//     - OU mettre select.value = '' puis forcer le change
//   Fix   : fonction séparée resetToFrench()
//
// BUG 5 — Cookie 'googtrans' non défini
//   Google Translate lit le cookie 'googtrans=/fr/ar' au chargement de page.
//   Sans ce cookie, rechanger de page remet en français.
//   Fix   : setGoogTransCookie() avant de déclencher la traduction
// =============================================================================

import { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/authSlice";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import baseTheme from "../theme/theme";

// Mapping user.language → code Google Translate
const LANG_TO_GOOGLE = {
  fr: "fr",    // "" = langue source = pas de traduction
  en: "en",
  ar: "ar",
};

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setGoogTransCookie(targetLang) {
  if (!targetLang) {
    // Revenir au français : supprimer le cookie
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
  } else {
    const value = `/fr/${targetLang}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
  }
}

// ── Déclencheur Google Translate ──────────────────────────────────────────────

function triggerGoogleTranslate(targetLang) {
  const select = document.querySelector("select.goog-te-combo");

  if (!select) {
    console.warn("[i18n] select.goog-te-combo introuvable — widget pas encore prêt");
    return false;
  }

  if (!targetLang) {
    // Revenir au français (langue source)
    select.value = "";
    select.dispatchEvent(new Event("change"));
    setGoogTransCookie("");
    return true;
  }

  // Vérifier que l'option existe dans le select
  const option = Array.from(select.options).find(o => o.value === targetLang);
  if (!option) {
    console.warn(`[i18n] Option '${targetLang}' non trouvée dans le widget Google Translate`);
    return false;
  }

  // Définir le cookie avant le changement (persistance entre les pages)
  setGoogTransCookie(targetLang);

  // Déclencher la traduction
  select.value = targetLang;
  select.dispatchEvent(new Event("change"));

  console.log(`[i18n] Google Translate activé → ${targetLang}`);
  return true;
}

// ── Attendre que le widget soit prêt avec MutationObserver ───────────────────

function waitForTranslateWidget(callback, maxWaitMs = 10000) {
  // Si déjà prêt
  if (document.querySelector("select.goog-te-combo")) {
    callback();
    return;
  }

  // Si le signal index.html dit que c'est prêt mais le DOM pas encore
  if (window.__googleTranslateReady) {
    const timer = setTimeout(callback, 200);
    return () => clearTimeout(timer);
  }

  // Observer l'événement défini dans index.html
  const handleReady = () => {
    setTimeout(callback, 300); // petit délai pour que le DOM soit peuplé
  };
  window.addEventListener("googleTranslateReady", handleReady, { once: true });

  // Fallback : MutationObserver sur document.body
  const observer = new MutationObserver(() => {
    if (document.querySelector("select.goog-te-combo")) {
      observer.disconnect();
      window.removeEventListener("googleTranslateReady", handleReady);
      callback();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Timeout de sécurité
  const timeout = setTimeout(() => {
    observer.disconnect();
    console.warn("[i18n] Google Translate widget timeout après " + maxWaitMs + "ms");
  }, maxWaitMs);

  return () => {
    observer.disconnect();
    clearTimeout(timeout);
    window.removeEventListener("googleTranslateReady", handleReady);
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const TranslationContext = createContext({ lang: "fr", isRTL: false, dir: "ltr" });
export const useT = () => useContext(TranslationContext);

// ── Caches Emotion ────────────────────────────────────────────────────────────
const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] });
const cacheLtr = createCache({ key: "mui" });

// ── Composant principal ───────────────────────────────────────────────────────
export default function TranslationWrapper({ children }) {
  const user = useSelector(selectUser);
  const lang = user?.language || "fr";
  const isRTL = lang === "ar";
  const googleLang = LANG_TO_GOOGLE[lang] ?? lang;
  const prevLang = useRef(null);

  // ── 1. RTL/LTR + police ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.body.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  // ── 2. Google Translate ───────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      const lang = useSelector(selectUser)?.language || "fr";
      // Ne rien faire si la langue n'a pas changé
      if (prevLang.current === lang) return;
      prevLang.current = lang;

      // Attendre que le widget soit prêt puis déclencher
      const cleanup = waitForTranslateWidget(() => {
        triggerGoogleTranslate(googleLang);
      });

      return cleanup;
    }, 1000);
  }, [lang, googleLang]);

  // useEffect(() => {
  //   const translateElement = document.querySelector('.goog-te-combo');
  //   if (translateElement) {
  //     translateElement.value = lang;
  //     translateElement.dispatchEvent(new Event('change'));
  //   } else {
  //     // Si le widget n'est pas encore chargé, on réessaie après un court délai
  //     const timer = setTimeout(() => {
  //       const retryElement = document.querySelector('.goog-te-combo');
  //       if (retryElement) {
  //         retryElement.value = lang;
  //         retryElement.dispatchEvent(new Event('change'));
  //       }
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [lang]);

  // ── Thème MUI ─────────────────────────────────────────────────────────────
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