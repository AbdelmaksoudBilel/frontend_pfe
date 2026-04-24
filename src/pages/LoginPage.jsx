// src/pages/LoginPage.jsx — version corrigée
// Corrections :
//   1. result.unwrap() au lieu de result?.payload (Redux Toolkit)
//   2. Affichage messages spécifiques : email non vérifié / compte en attente
//   3. Redirection correcte après 1er login
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, TextField, InputAdornment, IconButton,
  Alert, Divider, useMediaQuery, useTheme,
} from "@mui/material";
import EmailOutlinedIcon   from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon    from "@mui/icons-material/LockOutlined";
import VisibilityIcon      from "@mui/icons-material/Visibility";
import VisibilityOffIcon   from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon    from "@mui/icons-material/ArrowForward";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import HourglassEmptyIcon  from "@mui/icons-material/HourglassEmpty";

import AppButton from "../components/atoms/AppButton";
import AppText   from "../components/atoms/AppText";
import { useAuth } from "../hooks/useAuth";

import logo from "../assets/logo.png";
import mini_logo from "../assets/mini_logo.png";

const FEATURES = [
  { icon: "🧠", label: "Conseils basés sur DSM-5, TEACCH & PECS" },
  { icon: "🎯", label: "Profil personnalisé pour votre enfant" },
  { icon: "📊", label: "2 domaines, 37 questions cliniques" },
  { icon: "💬", label: "Disponible en arabe, français et anglais" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { login, loading, error, clearError } = useAuth();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [fieldErr, setFieldErr] = useState({});
  // États spéciaux pour email non vérifié / compte en attente
  const [specialStatus, setSpecialStatus] = useState(null); // null | "email" | "pending"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErr[name]) setFieldErr(fe => ({ ...fe, [name]: "" }));
    if (error) clearError();
    if (specialStatus) setSpecialStatus(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email invalide";
    if (!form.password) errs.password = "Le mot de passe est requis";
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // ✅ Redux Toolkit : utiliser unwrap() pour récupérer le payload ou throw l'erreur
      const data = await login(form).unwrap();
      const user = data.user;

      if (user?.isFirstLogin) {
        navigate("/child-wizard");
      } else {
        navigate("/chat");
      }
    } catch (err) {
      // Détecter les cas spéciaux (403 avec code spécifique)
      const msg = typeof err === "string" ? err : err?.message || "";
      if (msg.includes("vérifier votre email") || msg.includes("EMAIL_NOT_VERIFIED")) {
        setSpecialStatus("email");
      } else if (msg.includes("attente d'approbation") || msg.includes("ACCOUNT_PENDING")) {
        setSpecialStatus("pending");
      }
      // L'erreur est déjà dans le state Redux via rejectWithValue
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>

      {/* ══ GAUCHE : Formulaire ══════════════════════════════════════ */}
      <Box sx={{
        width: { xs: "100%", md: "52%" },
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        px: { xs: 3, sm: 6, md: 8 }, py: 6,
        bgcolor: "background.default",
      }}>

        {/* Logo */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box sx={{
            width: 56, height: 56, mx: "auto", mb: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, 
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <AppText variant="h3" sx={{ mb: 0.8 }}>Bon retour 👋</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Connectez-vous pour accéder à votre espace parent.
          </AppText>

          {/* ── Alerte email non vérifié ── */}
          {specialStatus === "email" && (
            <Alert severity="warning" icon={<MarkEmailReadOutlinedIcon />}
              sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>Email non confirmé.</strong> Vérifiez votre boîte mail et cliquez
              sur le lien de confirmation reçu lors de l'inscription.
            </Alert>
          )}

          {/* ── Alerte compte en attente ── */}
          {specialStatus === "pending" && (
            <Alert severity="info" icon={<HourglassEmptyIcon />}
              sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>Compte en attente d'approbation.</strong> L'équipe Ma Chance
              va valider votre accès sous 24h. Vous recevrez un email de confirmation.
            </Alert>
          )}

          {/* ── Erreur générique ── */}
          {error && !specialStatus && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Adresse email" name="email" type="email"
              autoComplete="email" value={form.email} onChange={handleChange}
              error={!!fieldErr.email} helperText={fieldErr.email}
              sx={{ mb: 2.5 }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                </InputAdornment>
              )}}
            />

            <TextField
              fullWidth label="Mot de passe" name="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={form.password} onChange={handleChange}
              error={!!fieldErr.password} helperText={fieldErr.password}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                      {showPwd
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: "right", mb: 3.5 }}>
              <Box component={Link} to="/forgot-password"
                sx={{ color: "primary.main", fontSize: "0.8rem", fontWeight: 700,
                  textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Mot de passe oublié ?
              </Box>
            </Box>

            <AppButton
              type="submit" fullWidth size="large" loading={loading}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{ py: 1.6, mb: 3 }}
            >
              Se connecter
            </AppButton>

            <Divider sx={{ mb: 3 }}>
              <AppText variant="caption" color="text.disabled">ou</AppText>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <AppText variant="body2" color="text.secondary" component="span">
                Pas encore de compte ?{" "}
              </AppText>
              <Box component={Link} to="/register"
                sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.875rem",
                  textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Créer un compte
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══ DROITE : Visuel ══════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        width: "48%",
        background: "linear-gradient(150deg, #1A7FA8 0%, #3BBDE8 55%, #7DD6F0 100%)",
        position: "relative", overflow: "hidden",
        flexDirection: "column", justifyContent: "center",
        alignItems: "center", px: 6,
      }}>
        <Box sx={{ position:"absolute",width:420,height:420,borderRadius:"50%",
          bgcolor:"rgba(255,255,255,0.06)",top:-120,right:-120,pointerEvents:"none" }} />
        <Box sx={{ position:"absolute",width:280,height:280,borderRadius:"50%",
          bgcolor:"rgba(255,255,255,0.06)",bottom:-80,left:-80,pointerEvents:"none" }} />
        <Box sx={{ position:"absolute",width:160,height:160,borderRadius:"50%",
          bgcolor:"rgba(245,166,35,0.15)",bottom:80,right:40,pointerEvents:"none" }} />

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 400, textAlign: "center" }}>
          <Box sx={{ fontSize: 72, mb:-3}}>
            <img width={70} src={mini_logo} alt="logo" srcset=""/>
          </Box>
          <AppText variant="h2" sx={{ color: "white", mb: 2, fontWeight: 900 }}>
            Accompagnez votre enfant avec confiance
          </AppText>
          <AppText variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 5, lineHeight: 1.8 }}>
            Un assistant IA scientifiquement validé pour les parents d'enfants TSA et DI.
          </AppText>
          <Box sx={{ textAlign: "left" }}>
            {FEATURES.map(({ icon, label }) => (
              <Box key={label} sx={{
                display: "flex", alignItems: "center", gap: 2, mb: 2,
                bgcolor: "rgba(255,255,255,0.12)", borderRadius: 3,
                px: 2.5, py: 1.6, border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <Box sx={{ fontSize: 22, flexShrink: 0 }}>{icon}</Box>
                <AppText variant="body2" sx={{ color: "white", fontWeight: 600 }}>{label}</AppText>
              </Box>
            ))}
          </Box>
          <Box sx={{ display:"flex", gap:4, justifyContent:"center", mt:4,
            pt:3, borderTop:"1px solid rgba(255,255,255,0.2)" }}>
            {[["14","Domaines"],["188","Questions"],["24/7","Disponible"]].map(([v,l])=>(
              <Box key={l} sx={{ textAlign:"center" }}>
                <AppText variant="h3" sx={{ color:"white", fontWeight:900, lineHeight:1 }}>{v}</AppText>
                <AppText variant="caption" sx={{ color:"rgba(255,255,255,0.65)", display:"block" }}>{l}</AppText>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}