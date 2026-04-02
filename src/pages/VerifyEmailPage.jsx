// src/pages/VerifyEmailPage.jsx
// ─────────────────────────────────────────────────────────────────
// Page de vérification email — appelée depuis le lien dans le mail
// URL : /verify-email?token=xxxxx
// Appelle GET /api/auth/verify/:token
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Paper, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon       from "@mui/icons-material/ErrorOutline";
import ArrowForwardIcon       from "@mui/icons-material/ArrowForward";

import AppButton from "../components/atoms/AppButton";
import AppText   from "../components/atoms/AppText";
import api       from "../services/api";

import logo from "../assets/logo.png";


export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide — aucun token fourni.");
      return;
    }

    api.get(`/auth/verify/${token}`)
      .then(res => {
        setStatus("success");
        setMessage(res.data?.message || "Email vérifié avec succès.");
      })
      .catch(err => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "Lien invalide ou expiré. Réinscrivez-vous si nécessaire."
        );
      });
  }, [token]);

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 60%, #FFF8EE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      px: 3,
    }}>
      <Paper elevation={2} sx={{
        maxWidth: 460, width: "100%",
        p: { xs: 4, md: 5.5 },
        borderRadius: 4,
        border: "1.5px solid", borderColor: "divider",
        textAlign: "center",
      }}>

        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, mx: "auto", mb: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>

        {/* ── Chargement ── */}
        {status === "loading" && (
          <Box>
            <CircularProgress size={56} thickness={3}
              sx={{ color: "primary.main", mb: 3 }} />
            <AppText variant="h4" gutterBottom>Vérification en cours...</AppText>
            <AppText variant="body2" color="text.secondary">
              Validation de votre lien de confirmation.
            </AppText>
          </Box>
        )}

        {/* ── Succès ── */}
        {status === "success" && (
          <Box>
            <Box sx={{
              width: 80, height: 80, borderRadius: "50%",
              bgcolor: "#E6F7EE", mx: "auto", mb: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%,100%": { boxShadow: "0 0 0 0 rgba(72,187,120,0.3)" },
                "50%":     { boxShadow: "0 0 0 16px rgba(72,187,120,0)" },
              },
            }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "success.main" }} />
            </Box>

            <AppText variant="h3" gutterBottom>Email confirmé ✅</AppText>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.8 }}>
              {message}
            </AppText>

            {/* Étape suivante */}
            <Box sx={{
              bgcolor: "background.orange", borderRadius: 3, p: 2.5, mb: 4,
              border: "1px solid", borderColor: "secondary.light", textAlign: "left",
            }}>
              <AppText variant="caption" sx={{ color: "secondary.dark", fontWeight: 800,
                display: "block", mb: 0.5 }}>⏳ Prochaine étape</AppText>
              <AppText variant="caption" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                Notre équipe va valider votre compte sous 24h.
                Vous recevrez un email dès que votre accès sera activé.
              </AppText>
            </Box>

            <AppButton fullWidth size="large" endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/login")}>
              Aller à la connexion
            </AppButton>
          </Box>
        )}

        {/* ── Erreur ── */}
        {status === "error" && (
          <Box>
            <Box sx={{
              width: 80, height: 80, borderRadius: "50%",
              bgcolor: "#FFF5F5", mx: "auto", mb: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ErrorOutlineIcon sx={{ fontSize: 44, color: "error.main" }} />
            </Box>

            <AppText variant="h3" gutterBottom>Lien invalide</AppText>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
              {message}
            </AppText>

            <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
              <AppButton fullWidth size="large" onClick={() => navigate("/register")}>
                Créer un nouveau compte
              </AppButton>
              <AppButton fullWidth variant="outlined" color="secondary"
                onClick={() => navigate("/login")} size="large">
                Retour à la connexion
              </AppButton>
            </Box>
          </Box>
        )}

      </Paper>
    </Box>
  );
}
