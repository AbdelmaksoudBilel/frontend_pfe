// src/hooks/useTranslation.js
import { useSelector } from "react-redux";
import { selectUser }  from "../store/slices/authSlice";
import T               from "../i18n/translations";

function getValue(obj, path) {
  return path.split(".").reduce((cur, k) => cur?.[k], obj);
}

export function useTranslation() {
  const user = useSelector(selectUser);
  const lang = user?.language || "fr";

  const t = (key, vars = {}) => {
    const node = getValue(T, key);
    if (!node) { console.warn(`[i18n] missing key: "${key}"`); return key; }

    let text;
    if (typeof node === "object" && ("fr" in node || "en" in node || "ar" in node)) {
      text = node[lang] ?? node.fr ?? key;
    } else if (typeof node === "string") {
      text = node;
    } else {
      return node; // sub-object (ex: T.diagnostic.qchatAnswers)
    }

    if (vars && Object.keys(vars).length) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      });
    }
    return text;
  };

  return { t, lang, isRTL: lang === "ar", dir: lang === "ar" ? "rtl" : "ltr" };
}

export default useTranslation;