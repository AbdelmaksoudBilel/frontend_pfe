// src/pages/ForgotPasswordPage.jsx
// ─────────────────────────────────────────────────────────────────
// Mot de passe oublié — Envoi email de réinitialisation
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, InputAdornment, Alert, Paper } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import AppButton from "../components/atoms/AppButton";
import AppText from "../components/atoms/AppText";
import api from "../services/api";

import logo from "../assets/logo.png";


export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) { setEmailErr("L'email est requis"); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr("Email invalide"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      px: 3,
    }}>
      <Paper elevation={2} sx={{
        maxWidth: 460, width: "100%",
        p: { xs: 4, md: 5.5 },
        borderRadius: 4,
        border: "1.5px solid", borderColor: "divider",
      }}>

        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{
            width: 52, height: 52,  mx: "auto", mb: 1.5,
        
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, 
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>

        {/* ── État : email envoyé ─────────────────────────────── */}
        {sent ? (
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: "50%", mx: "auto", mb: 3,
              bgcolor: "background.blue",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%,100%": { boxShadow: "0 0 0 0 rgba(59,189,232,0.3)" },
                "50%": { boxShadow: "0 0 0 16px rgba(59,189,232,0)" },
              },
            }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>

            <AppText variant="h4" gutterBottom>Email envoyé !</AppText>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.8 }}>
              Un lien de réinitialisation a été envoyé à
            </AppText>
            <Box sx={{
              bgcolor: "background.blue", borderRadius: 2, px: 2, py: 1, mb: 3,
              display: "inline-block"
            }}>
              <AppText variant="body2" sx={{ color: "primary.dark", fontWeight: 700 }}>
                {email}
              </AppText>
            </Box>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
              Vérifiez votre boîte mail et cliquez sur le lien pour
              réinitialiser votre mot de passe. Le lien expire dans 30 minutes.
            </AppText>

            <AppButton fullWidth size="large" onClick={() => navigate("/login")}
              sx={{ mb: 2 }}>
              Retour à la connexion
            </AppButton>
            <AppText variant="caption" color="text.disabled">
              Vous n'avez pas reçu l'email ?{" "}
              <Box component="span"
                sx={{
                  color: "primary.main", cursor: "pointer", fontWeight: 700,
                  "&:hover": { textDecoration: "underline" }
                }}
                onClick={() => setSent(false)}>
                Renvoyer
              </Box>
            </AppText>
          </Box>

        ) : (
          /* ── État : formulaire ────────────────────────────── */
          <Box>
            <AppText variant="h3" sx={{ mb: 1 }}>Mot de passe oublié ?</AppText>
            <AppText variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.8 }}>
              Entrez votre adresse email et nous vous enverrons un lien
              pour réinitialiser votre mot de passe.
            </AppText>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}
                onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Adresse email" type="email"
                value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                error={!!emailErr} helperText={emailErr}
                autoComplete="email"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
              />

              <AppButton
                type="submit" fullWidth size="large" loading={loading}
                endIcon={!loading && <SendIcon />}
                sx={{ py: 1.6, mb: 2.5 }}
              >
                Envoyer le lien
              </AppButton>

              <Box sx={{ textAlign: "center" }}>
                <Box component={Link} to="/login"
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.5,
                    color: "text.secondary", fontSize: "0.875rem", fontWeight: 600,
                    textDecoration: "none", "&:hover": { color: "primary.main" }
                  }}>
                  <ArrowBackIcon sx={{ fontSize: 16 }} />
                  Retour à la connexion
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
