// src/hooks/useTranslation.js
// =============================================================================
// Hook i18n — traduction automatique basée sur user.language (fr | en | ar)
//
// Usage :
//   const { t, lang, isRTL } = useTranslation();
//   <AppText>{t('auth.login')}</AppText>
//   <AppText>{t('diagnostic.profileLabels.TSA')}</AppText>
//   <Box dir={isRTL ? 'rtl' : 'ltr'}>...</Box>
// =============================================================================

import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/authSlice";
import translations from "../i18n/translations";

// ── Accès imbriqué par chemin "section.key" ou "section.key.subkey" ──────────
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

// ─────────────────────────────────────────────────────────────────────────────

export function useTranslation() {
  const user = useSelector(selectUser);
  const lang = user?.language || "fr";

  /**
   * Traduit une clé.
   *
   * @param {string} key         - Chemin pointé : "auth.login", "diagnostic.profileLabels.TSA"
   * @param {object} vars        - Variables à interpoler : { name: "Ahmed" }
   * @returns {string}           - Texte traduit (fr par défaut si clé manquante)
   *
   * Exemples :
   *   t("auth.login")                        → "Se connecter" | "Log in" | "تسجيل الدخول"
   *   t("chat.greet") + " " + user.firstName → "Bonjour Ahmed"
   */
  const t = (key, vars = {}) => {
    const node = getNestedValue(translations, key);

    let text;

    if (!node) {
      // Clé introuvable → retourner la clé pour debug
      console.warn(`[i18n] Clé manquante : "${key}"`);
      return key;
    }

    if (typeof node === "object" && (node.fr || node.en || node.ar)) {
      // Objet { fr, en, ar }
      text = node[lang] || node.fr || node.en || key;
    } else if (typeof node === "string") {
      text = node;
    } else {
      // Sous-objet (ex: translations.diagnostic.profileLabels) → retourner le node
      return node;
    }

    // Interpolation des variables
    if (vars && Object.keys(vars).length > 0) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      });
    }

    return text;
  };

  return {
    t,
    lang,
    isRTL: lang === "ar",
    dir  : lang === "ar" ? "rtl" : "ltr",
  };
}

export default useTranslation;
