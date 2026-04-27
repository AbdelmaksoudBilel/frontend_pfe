import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Box, Paper, TextField, InputAdornment,
  IconButton, Alert,
} from "@mui/material";
import LockOutlinedIcon   from "@mui/icons-material/LockOutlined";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";

import AppButton from "../components/atoms/AppButton";
import AppText   from "../components/atoms/AppText";
import api       from "../services/api";

import logo from "../assets/logo.png";


const PWD_RULES = [
  { label: "8 caractères minimum", test: v => v.length >= 8 },
  { label: "Une majuscule",         test: v => /[A-Z]/.test(v) },
  { label: "Un chiffre",            test: v => /[0-9]/.test(v) },
];

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token");

  const [form, setForm]       = useState({ password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  // Token manquant dans l'URL
  if (!token) {
    return (
      <PageWrapper>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Lien invalide — aucun token trouvé dans l'URL.
        </Alert>
        <AppButton fullWidth sx={{ mt: 2 }} onClick={() => navigate("/forgot-password")}>
          Demander un nouveau lien
        </AppButton>
      </PageWrapper>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.password)         e.password = "Le mot de passe est requis";
    else if (form.password.length < 8) e.password = "8 caractères minimum";
    if (!form.confirm)          e.confirm = "Confirmez le mot de passe";
    else if (form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré. Redemandez un lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>

      {/* ── Succès ── */}
      {success ? (
        <Box sx={{ textAlign: "center" }}>
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
            <CheckCircleIcon sx={{ fontSize: 44, color: "success.main" }} />
          </Box>
          <AppText variant="h3" gutterBottom>Mot de passe modifié</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            Votre mot de passe a été réinitialisé avec succès.
            Vous pouvez maintenant vous connecter.
          </AppText>
          <AppButton fullWidth size="large" onClick={() => navigate("/login")}>
            Se connecter
          </AppButton>
        </Box>

      ) : (
        /* ── Formulaire ── */
        <Box>
          <AppText variant="h3" sx={{ mb: 0.8 }}>Nouveau mot de passe</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Choisissez un nouveau mot de passe pour votre compte.
          </AppText>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}
              onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Nouveau mot de passe" name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={e => { setForm(f => ({...f, password: e.target.value})); setFieldErr(fe => ({...fe, password:""})); }}
              error={!!fieldErr.password} helperText={fieldErr.password}
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color:"text.disabled", fontSize:20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                      {showPwd ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Indicateurs règles */}
            {form.password && (
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1.5, mb: 2.5 }}>
                {PWD_RULES.map(rule => (
                  <Box key={rule.label} sx={{ display:"flex", alignItems:"center", gap:0.6 }}>
                    <Box sx={{
                      width:7, height:7, borderRadius:"50%",
                      bgcolor: rule.test(form.password) ? "success.main" : "divider",
                      transition:"background 0.2s",
                    }}/>
                    <AppText variant="caption" sx={{
                      color: rule.test(form.password) ? "success.main" : "text.disabled",
                      fontSize:"0.72rem",
                    }}>
                      {rule.label}
                    </AppText>
                  </Box>
                ))}
              </Box>
            )}

            <TextField
              fullWidth label="Confirmer le mot de passe" name="confirm"
              type={showPwd2 ? "text" : "password"}
              value={form.confirm}
              onChange={e => { setForm(f => ({...f, confirm: e.target.value})); setFieldErr(fe => ({...fe, confirm:""})); }}
              error={!!fieldErr.confirm} helperText={fieldErr.confirm}
              sx={{ mb: 3.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color:"text.disabled", fontSize:20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd2(v => !v)} edge="end" size="small">
                      {showPwd2 ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <AppButton
              type="submit" fullWidth size="large" loading={loading}
              endIcon={!loading && <CheckCircleIcon />}
              sx={{ py: 1.6, mb: 2 }}
            >
              Réinitialiser le mot de passe
            </AppButton>

            <Box sx={{ textAlign:"center" }}>
              <Box component={Link} to="/login"
                sx={{ display:"inline-flex", alignItems:"center", gap:0.5,
                  color:"text.secondary", fontSize:"0.875rem", fontWeight:600,
                  textDecoration:"none", "&:hover":{ color:"primary.main" } }}>
                <ArrowBackIcon sx={{ fontSize:16 }} />
                Retour à la connexion
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </PageWrapper>
  );
}

// ── Layout commun ────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
    <Box sx={{
      minHeight:"100vh",
      background:"linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", px:3,
    }}>
      <Paper elevation={2} sx={{
        maxWidth:440, width:"100%",
        p:{ xs:4, md:5.5 },
        borderRadius:4,
        border:"1.5px solid", borderColor:"divider",
      }}>
        <Box sx={{ textAlign:"center", mb:4 }}>
          <Box sx={{
            width:52, height:52, mx:"auto", mb:1.5,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24,
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>
        {children}
      </Paper>
    </Box>
  );
}
