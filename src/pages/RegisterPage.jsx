// src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────
// Inscription — 1 étape, infos parent uniquement
// Pas d'info enfant ici → ajout enfant après 1er login
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Grid, TextField, MenuItem, InputAdornment,
  IconButton, Alert, useMediaQuery, useTheme,
} from "@mui/material";
import PersonOutlineIcon  from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon  from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon   from "@mui/icons-material/LockOutlined";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import PhoneOutlinedIcon  from "@mui/icons-material/PhoneOutlined";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";

import AppButton from "../components/atoms/AppButton";
import AppText   from "../components/atoms/AppText";
import { useAuth } from "../hooks/useAuth";

import logo from "../assets/logo.png";
import mini_logo from "../assets/mini_logo.png";


// ── Règles mot de passe ───────────────────────────────────────────
const PWD_RULES = [
  { label: "8 caractères minimum",      test: v => v.length >= 8 },
  { label: "Une lettre majuscule",       test: v => /[A-Z]/.test(v) },
  { label: "Un chiffre",                 test: v => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { register, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
    phone: "", language: "fr",
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErr[name]) setFieldErr(fe => ({ ...fe, [name]: "" }));
    if (error) clearError();
  };

  // ── Validation ──────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Le prénom est requis";
    if (!form.lastName.trim())  e.lastName  = "Le nom est requis";
    if (!form.email.trim())     e.email     = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password)         e.password  = "Le mot de passe est requis";
    else if (form.password.length < 8) e.password = "8 caractères minimum";
    if (!form.confirmPassword)  e.confirmPassword = "Confirmez le mot de passe";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // ✅ unwrap() → throw si erreur, retourne payload si succès
      await register({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        phone:     form.phone || undefined,
        language:  form.language,
      }).unwrap();
      // Succès (nouveau compte OU renvoi email) → page confirmation
      navigate("/email-sent");
    } catch {
      // L'erreur est déjà dans le state Redux (authError)
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>

      {/* ══ GAUCHE : Formulaire ════════════════════════════════════ */}
      <Box sx={{
        width: { xs: "100%", md: "52%" },
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        px: { xs: 3, sm: 6, md: 8 }, py: 6,
        bgcolor: "background.default",
        overflowY: "auto",
      }}>

        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box sx={{
            width: 56, height: 56, mx: "auto", mb: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, 
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <AppText variant="h3" sx={{ mb: 0.8 }}>Créer votre compte</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Inscrivez-vous en tant que parent. Le profil de votre enfant
            sera ajouté après votre première connexion.
          </AppText>

          {/* Alerte erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>

              {/* Prénom + Nom */}
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Prénom" name="firstName"
                  value={form.firstName} onChange={handleChange}
                  error={!!fieldErr.firstName} helperText={fieldErr.firstName}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color:"text.disabled", fontSize:18 }} />
                    </InputAdornment>
                  )}}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Nom" name="lastName"
                  value={form.lastName} onChange={handleChange}
                  error={!!fieldErr.lastName} helperText={fieldErr.lastName}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Adresse email" name="email" type="email"
                  autoComplete="email"
                  value={form.email} onChange={handleChange}
                  error={!!fieldErr.email} helperText={fieldErr.email}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color:"text.disabled", fontSize:18 }} />
                    </InputAdornment>
                  )}}
                />
              </Grid>

              {/* Téléphone (optionnel) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Téléphone (optionnel)" name="phone"
                  value={form.phone} onChange={handleChange}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color:"text.disabled", fontSize:18 }} />
                    </InputAdornment>
                  )}}
                />
              </Grid>

              {/* Langue */}
              <Grid item xs={12}>
                <TextField
                  fullWidth select label="Langue préférée" name="language"
                  value={form.language} onChange={handleChange}
                >
                  <MenuItem value="fr">🇫🇷  Français</MenuItem>
                  <MenuItem value="ar">🇹🇳  العربية</MenuItem>
                  <MenuItem value="en">🇬🇧  English</MenuItem>
                </TextField>
              </Grid>

              {/* Mot de passe */}
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Mot de passe" name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  error={!!fieldErr.password} helperText={fieldErr.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color:"text.disabled", fontSize:18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                          {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Indicateurs règles mot de passe */}
                {form.password && (
                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {PWD_RULES.map(rule => (
                      <Box key={rule.label} sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                        <Box sx={{
                          width: 6, height: 6, borderRadius: "50%",
                          bgcolor: rule.test(form.password) ? "success.main" : "divider",
                          transition: "background 0.2s",
                        }} />
                        <AppText variant="caption" sx={{
                          color: rule.test(form.password) ? "success.main" : "text.disabled",
                          fontSize: "0.7rem",
                        }}>
                          {rule.label}
                        </AppText>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Confirmer mot de passe */}
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Confirmer le mot de passe" name="confirmPassword"
                  type={showPwd2 ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange}
                  error={!!fieldErr.confirmPassword} helperText={fieldErr.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color:"text.disabled", fontSize:18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd2(v => !v)} edge="end" size="small">
                          {showPwd2 ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Bouton inscription */}
            <AppButton
              type="submit" fullWidth size="large" loading={loading}
              endIcon={!loading && <CheckCircleIcon />}
              sx={{ mt: 3.5, py: 1.6, mb: 2.5 }}
            >
              Créer mon compte
            </AppButton>

            {/* Lien login */}
            <Box sx={{ textAlign: "center" }}>
              <AppText variant="body2" color="text.secondary" component="span">
                Déjà un compte ?{" "}
              </AppText>
              <Box component={Link} to="/login"
                sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.875rem",
                  textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Se connecter
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══ DROITE : Visuel ════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        width: "48%",
        background: "linear-gradient(150deg, #F5A623 0%, #FFD080 40%, #3BBDE8 100%)",
        position: "relative", overflow: "hidden",
        flexDirection: "column", justifyContent: "center",
        alignItems: "center", px: 6,
      }}>
        <Box sx={{ position:"absolute",width:380,height:380,borderRadius:"50%",
          bgcolor:"rgba(255,255,255,0.08)",top:-100,right:-100,pointerEvents:"none" }} />
        <Box sx={{ position:"absolute",width:260,height:260,borderRadius:"50%",
          bgcolor:"rgba(255,255,255,0.08)",bottom:-70,left:-70,pointerEvents:"none" }} />

        <Box sx={{ position:"relative", zIndex:1, maxWidth:380, textAlign:"center" }}>
          <Box sx={{ fontSize: 76, mb: -2 }}>
            <img width={70} src={mini_logo} alt="logo" srcset="" />
          </Box>

          <AppText variant="h2" sx={{ color:"white", mb:2, fontWeight:900 }}>
            Bienvenue dans Ma Chance
          </AppText>
          <AppText variant="body1" sx={{ color:"rgba(255,255,255,0.85)", mb:4, lineHeight:1.8 }}>
            Créez votre espace parent en quelques secondes. Le profil
            de votre enfant et le questionnaire Q-Chat-10 vous seront
            demandés après votre première connexion.
          </AppText>

          {/* Étapes visuelles */}
          {[
            { num:"1", title:"Créez votre compte",       desc:"Infos de base sécurisées" },
            { num:"2", title:"Vérifiez votre email",     desc:"Lien d'activation envoyé" },
            { num:"3", title:"Profil de votre enfant",   desc:"Questionnaire personnalisé" },
            { num:"4", title:"Accédez à l'assistant",    desc:"Conseils adaptés 24h/24" },
          ].map(({ num, title, desc }) => (
            <Box key={num} sx={{ display:"flex", alignItems:"center", gap:2,
              mb:2, textAlign:"left" }}>
              <Box sx={{ width:32, height:32, borderRadius:"50%", flexShrink:0,
                bgcolor:"rgba(255,255,255,0.25)", border:"2px solid rgba(255,255,255,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <AppText variant="caption" sx={{ color:"white", fontWeight:900 }}>{num}</AppText>
              </Box>
              <Box>
                <AppText variant="body2" sx={{ color:"white", fontWeight:700, lineHeight:1.2 }}>
                  {title}
                </AppText>
                <AppText variant="caption" sx={{ color:"rgba(255,255,255,0.7)" }}>
                  {desc}
                </AppText>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}