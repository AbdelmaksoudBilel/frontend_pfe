// =============================================================================
// Page profil parent — 3 onglets :
//   1. Mes informations (nom, prénom, téléphone, langue, avatar)
//   2. Mot de passe
//   3. Mes enfants (modifier infos de base ou ajouter un autre)
// =============================================================================
import { useState, useEffect, useRef } from "react";
import { useNavigate }                 from "react-router-dom";
import {
  Box, Grid, Paper, Tabs, Tab, TextField, MenuItem,
  Avatar, IconButton, Alert, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, CardActions, useMediaQuery, useTheme,
} from "@mui/material";
import PersonIcon         from "@mui/icons-material/Person";
import LockIcon           from "@mui/icons-material/Lock";
import ChildCareIcon      from "@mui/icons-material/ChildCare";
import PhotoCameraIcon    from "@mui/icons-material/PhotoCamera";
import EditIcon           from "@mui/icons-material/Edit";
import AddIcon            from "@mui/icons-material/Add";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import SaveIcon           from "@mui/icons-material/Save";
import PsychologyIcon     from "@mui/icons-material/Psychology";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";

import AppButton from "../components/atoms/AppButton";
import AppText   from "../components/atoms/AppText";
import { useAuth }  from "../hooks/useAuth";
import api          from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000";

const PROFILE_CFG = {
  TSA   : { color:"#3BBDE8", label:"TSA",    icon:"🧠" },
  RM    : { color:"#F5A623", label:"DI",     icon:"📚" },
  MIXTE : { color:"#9F7AEA", label:"Mixte",  icon:"🔀" },
  Normal: { color:"#48BB78", label:"Normal", icon:"✅" },
};

// ─────────────────────────────────────────────────────────────────
// ONGLET 1 — Informations personnelles
// ─────────────────────────────────────────────────────────────────
function TabInfos({ user, onSaved }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName : user?.lastName  || "",
    phone    : user?.phone     || "",
    language : user?.language  || "fr",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `${BASE_URL}${user.avatar}` : null
  );
  const avatarRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true); setError(""); setSuccess(false);
    try {
      // Mettre à jour avatar si changé
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.put("/users/me/avatar", fd, {
          headers: { "Content-Type":"multipart/form-data" },
        });
      }
      // Mettre à jour infos
      await api.put("/users/me", form);
      setSuccess(true);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Avatar */}
      <Box sx={{ textAlign:"center", mb:4 }}>
        <Box sx={{ position:"relative", display:"inline-block" }}>
          <Avatar
            src={avatarPreview}
            sx={{ width:96, height:96, fontSize:36, fontWeight:800,
              bgcolor:"primary.main", mx:"auto",
              border:"3px solid", borderColor:"primary.main" }}>
            {!avatarPreview && `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`}
          </Avatar>
          <IconButton
            size="small"
            onClick={() => avatarRef.current?.click()}
            sx={{ position:"absolute", bottom:0, right:0,
              bgcolor:"primary.main", color:"white",
              "&:hover":{ bgcolor:"primary.dark" }, p:0.8 }}>
            <PhotoCameraIcon sx={{ fontSize:16 }} />
          </IconButton>
          <input ref={avatarRef} type="file" accept="image/*"
            style={{ display:"none" }} onChange={handleAvatarChange} />
        </Box>
        <AppText variant="caption" color="text.disabled" sx={{ display:"block", mt:1 }}>
          Cliquez sur l'icône pour changer la photo
        </AppText>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb:2.5, borderRadius:2 }}
          onClose={() => setSuccess(false)}>
          Informations mises à jour avec succès.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb:2.5, borderRadius:2 }}
          onClose={() => setError("")}>{error}</Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Prénom" value={form.firstName}
            onChange={e => setForm(f=>({...f, firstName:e.target.value}))} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Nom" value={form.lastName}
            onChange={e => setForm(f=>({...f, lastName:e.target.value}))} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Email" value={user?.email || ""}
            disabled
            helperText="L'email ne peut pas être modifié"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Téléphone" value={form.phone}
            onChange={e => setForm(f=>({...f, phone:e.target.value}))}
            placeholder="+216 XX XXX XXX"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Langue préférée" value={form.language}
            onChange={e => setForm(f=>({...f, language:e.target.value}))}>
            <MenuItem value="fr">🇫🇷 Français</MenuItem>
            <MenuItem value="ar">🇹🇳 العربية</MenuItem>
            <MenuItem value="en">🇬🇧 English</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt:3.5, display:"flex", justifyContent:"flex-end" }}>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>
          Sauvegarder
        </AppButton>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// ONGLET 2 — Mot de passe
// ─────────────────────────────────────────────────────────────────
function TabPassword() {
  const [form,    setForm]    = useState({ current:"", newPwd:"", confirm:"" });
  const [show,    setShow]    = useState({ current:false, new:false, confirm:false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [fieldErr, setFieldErr] = useState({});

  const PWD_RULES = [
    { label:"8 caractères minimum", test: v => v.length >= 8 },
    { label:"Une majuscule",         test: v => /[A-Z]/.test(v) },
    { label:"Un chiffre",            test: v => /[0-9]/.test(v) },
  ];

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "Requis";
    if (!form.newPwd || form.newPwd.length < 8) e.newPwd = "8 caractères minimum";
    if (form.newPwd !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setFieldErr(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true); setError(""); setSuccess(false);
    try {
      await api.put("/users/me/password", {
        currentPassword: form.current,
        newPassword    : form.newPwd,
      });
      setSuccess(true);
      setForm({ current:"", newPwd:"", confirm:"" });
    } catch (e) {
      setError(e.response?.data?.message || "Mot de passe actuel incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const showToggle = (field) => (
    <IconButton size="small"
      onClick={() => setShow(s => ({...s, [field]:!s[field]}))} edge="end">
      {show[field] ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
    </IconButton>
  );

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb:2.5, borderRadius:2 }}
          onClose={() => setSuccess(false)}>
          Mot de passe modifié avec succès.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb:2.5, borderRadius:2 }}
          onClose={() => setError("")}>{error}</Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField fullWidth label="Mot de passe actuel"
            type={show.current ? "text" : "password"}
            value={form.current}
            onChange={e => { setForm(f=>({...f,current:e.target.value})); setFieldErr(fe=>({...fe,current:""})); }}
            error={!!fieldErr.current} helperText={fieldErr.current}
            InputProps={{ endAdornment: showToggle("current") }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Nouveau mot de passe"
            type={show.new ? "text" : "password"}
            value={form.newPwd}
            onChange={e => { setForm(f=>({...f,newPwd:e.target.value})); setFieldErr(fe=>({...fe,newPwd:""})); }}
            error={!!fieldErr.newPwd} helperText={fieldErr.newPwd}
            InputProps={{ endAdornment: showToggle("new") }}
          />
          {form.newPwd && (
            <Box sx={{ display:"flex", flexWrap:"wrap", gap:1.5, mt:1 }}>
              {PWD_RULES.map(r => (
                <Box key={r.label} sx={{ display:"flex", alignItems:"center", gap:0.6 }}>
                  <Box sx={{ width:7, height:7, borderRadius:"50%",
                    bgcolor: r.test(form.newPwd) ? "success.main" : "divider",
                    transition:"background 0.2s" }} />
                  <AppText variant="caption" sx={{ fontSize:"0.72rem",
                    color: r.test(form.newPwd) ? "success.main" : "text.disabled" }}>
                    {r.label}
                  </AppText>
                </Box>
              ))}
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Confirmer le nouveau mot de passe"
            type={show.confirm ? "text" : "password"}
            value={form.confirm}
            onChange={e => { setForm(f=>({...f,confirm:e.target.value})); setFieldErr(fe=>({...fe,confirm:""})); }}
            error={!!fieldErr.confirm} helperText={fieldErr.confirm}
            InputProps={{ endAdornment: showToggle("confirm") }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt:3.5, display:"flex", justifyContent:"flex-end" }}>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>
          Modifier le mot de passe
        </AppButton>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIALOG — Modifier un enfant (infos de base uniquement)
// ─────────────────────────────────────────────────────────────────
function EditChildDialog({ child, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: child?.firstName || "",
    lastName : child?.lastName  || "",
    birthDate: child?.birthDate ? child.birthDate.split("T")[0] : "",
    gender   : child?.gender    || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (child) {
      setForm({
        firstName: child.firstName || "",
        lastName : child.lastName  || "",
        birthDate: child.birthDate ? child.birthDate.split("T")[0] : "",
        gender   : child.gender    || "",
      });
    }
  }, [child]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      setError("Nom et prénom requis."); return;
    }
    setLoading(true); setError("");
    try {
      await api.put(`/children/${child._id}`, form);
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur de mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ borderRadius:4 } }}>
      <DialogTitle sx={{ fontWeight:800, pb:1 }}>
        ✏️ Modifier le profil de {child?.firstName}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt:3 }}>
        {error && <Alert severity="error" sx={{ mb:2, borderRadius:2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Prénom" value={form.firstName}
              onChange={e => setForm(f=>({...f,firstName:e.target.value}))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nom" value={form.lastName}
              onChange={e => setForm(f=>({...f,lastName:e.target.value}))} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField fullWidth label="Date de naissance" type="date"
              value={form.birthDate}
              onChange={e => setForm(f=>({...f,birthDate:e.target.value}))}
              InputLabelProps={{ shrink:true }} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth select label="Genre" value={form.gender}
              onChange={e => setForm(f=>({...f,gender:e.target.value}))}>
              <MenuItem value="M">👦 Garçon</MenuItem>
              <MenuItem value="F">👧 Fille</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px:3, py:2, gap:1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose}>
          Annuler
        </AppButton>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>
          Sauvegarder
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// ONGLET 3 — Mes enfants
// ─────────────────────────────────────────────────────────────────
function TabChildren({ navigate }) {
  const [children,  setChildren]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editChild, setEditChild] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/children")
      .then(r => setChildren(r.data || []))
      .catch(()=>{})
      .finally(()=> setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const age = (birthDate) => {
    if (!birthDate) return null;
    return Math.floor((Date.now() - new Date(birthDate)) / (365.25*24*3600*1000));
  };

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", mb:3 }}>
        <AppText variant="h5" sx={{ fontWeight:800 }}>
          Mes enfants ({children.length})
        </AppText>
        <AppButton size="small" startIcon={<AddIcon />}
          onClick={() => navigate("/child-wizard")}>
          Ajouter un enfant
        </AppButton>
      </Box>

      {loading ? (
        <Box sx={{ textAlign:"center", py:6 }}>
          <AppText variant="body2" color="text.disabled">Chargement...</AppText>
        </Box>
      ) : children.length === 0 ? (
        <Box sx={{ textAlign:"center", py:6 }}>
          <ChildCareIcon sx={{ fontSize:48, color:"text.disabled", mb:2 }} />
          <AppText variant="h5" gutterBottom>Aucun enfant</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>
            Ajoutez le profil de votre enfant pour accéder aux conseils personnalisés.
          </AppText>
          <AppButton startIcon={<AddIcon />} onClick={() => navigate("/child-wizard")}>
            Ajouter mon enfant
          </AppButton>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {children.map(child => {
            const cfg = PROFILE_CFG[child.prediction] || null;
            const childAge = age(child.birthDate);
            return (
              <Grid item xs={12} sm={6} key={child._id}>
                <Card elevation={1} sx={{ borderRadius:3,
                  border:"1.5px solid", borderColor:"divider",
                  transition:"all 0.25s",
                  "&:hover":{ boxShadow:4, borderColor:"primary.main" } }}>
                  <CardContent sx={{ pb:1 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:2 }}>
                      {/* Photo */}
                      {child.facePhotoUrl ? (
                        <Avatar src={`${BASE_URL}${child.facePhotoUrl}`}
                          sx={{ width:56, height:56,
                            border:"2px solid", borderColor:"primary.main" }} />
                      ) : (
                        <Avatar sx={{ width:56, height:56,
                          bgcolor:"background.blue", color:"primary.main",
                          fontSize:22, fontWeight:800 }}>
                          {child.firstName?.[0]}
                        </Avatar>
                      )}
                      <Box sx={{ flex:1, minWidth:0 }}>
                        <AppText variant="h5" sx={{ fontWeight:800 }}>
                          {child.firstName} {child.lastName}
                        </AppText>
                        <AppText variant="caption" color="text.secondary">
                          {childAge !== null ? `${childAge} ans · ` : ""}
                          {child.gender === "M" ? "Garçon" : "Fille"}
                          {child.QChatScore !== null && child.QChatScore !== undefined
                            ? ` · Q-Chat: ${child.QChatScore}/10` : ""}
                        </AppText>
                      </Box>
                    </Box>

                    {/* Prédiction */}
                    {cfg ? (
                      <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:1 }}>
                        <Chip label={`${cfg.icon} ${cfg.label}`} size="small"
                          sx={{ bgcolor: cfg.color + "20", color: cfg.color,
                            fontWeight:700, fontSize:"0.75rem" }} />
                        {child.confidence && (
                          <AppText variant="caption" color="text.disabled">
                            Confiance : {Math.round(child.confidence*100)}%
                          </AppText>
                        )}
                      </Box>
                    ) : (
                      <Chip label="Pas encore analysé" size="small"
                        sx={{ bgcolor:"background.subtle", color:"text.disabled",
                          fontWeight:600, fontSize:"0.72rem", mb:1 }} />
                    )}

                    {/* Score Q-Chat */}
                    {child.QChatScore !== null && child.QChatScore !== undefined && (
                      <Box sx={{ display:"flex", alignItems:"center", gap:0.8 }}>
                        {child.QChatScore >= 3
                          ? <WarningAmberIcon sx={{ fontSize:16, color:"secondary.main" }} />
                          : <CheckCircleIcon  sx={{ fontSize:16, color:"success.main" }} />
                        }
                        <AppText variant="caption" sx={{
                          color: child.QChatScore >= 3 ? "secondary.main" : "success.main",
                          fontWeight:600 }}>
                          {child.QChatScore >= 3
                            ? "Traits autistiques potentiels"
                            : "Score Q-Chat normal"}
                        </AppText>
                      </Box>
                    )}
                  </CardContent>

                  <Divider />
                  <CardActions sx={{ px:2, py:1.5, gap:1 }}>
                    <AppButton size="small" variant="outlined" color="secondary"
                      startIcon={<EditIcon />}
                      onClick={() => setEditChild(child)}>
                      Modifier
                    </AppButton>
                    <AppButton size="small" variant="outlined"
                      startIcon={<PsychologyIcon />}
                      onClick={() => navigate(`/diagnostic/${child._id}`)}>
                      Diagnostic
                    </AppButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog modifier enfant */}
      {editChild && (
        <EditChildDialog
          child={editChild}
          open={!!editChild}
          onClose={() => setEditChild(null)}
          onSaved={load}
        />
      )}
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const navigate      = useNavigate();
  const { user, setUser } = useAuth();
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down("md"));

  const [tab, setTab] = useState(0);

  const refreshUser = async () => {
    try {
      const r = await api.get("/auth/me");
      // Mettre à jour le localStorage + state
      localStorage.setItem("mc_user", JSON.stringify(r.data));
      if (setUser) setUser(r.data);
    } catch {}
  };

  return (
    <Box sx={{
      minHeight:"100vh",
      background:"linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)",
      px:{ xs:2, sm:4, md:8 }, py:4,
    }}>
      <Box sx={{ maxWidth:800, mx:"auto" }}>

        {/* Header */}
        <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:4 }}>
          <AppButton variant="outlined" color="secondary" size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/chat")}>
            Retour au chat
          </AppButton>
          <AppText variant="h3" sx={{ fontWeight:900 }}>Mon profil</AppText>
        </Box>

        <Paper elevation={2} sx={{ borderRadius:4,
          border:"1.5px solid", borderColor:"divider", overflow:"hidden" }}>

          {/* Onglets */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              borderBottom:"1px solid", borderColor:"divider",
              px:{ xs:1, md:3 },
              "& .MuiTab-root":{ fontWeight:700, minHeight:52 },
              "& .Mui-selected":{ color:"primary.main" },
              "& .MuiTabs-indicator":{ bgcolor:"primary.main" },
            }}
            variant={isMobile ? "fullWidth" : "standard"}>
            <Tab icon={<PersonIcon />} iconPosition="start" label="Mes infos" />
            <Tab icon={<LockIcon />}   iconPosition="start" label="Mot de passe" />
            <Tab icon={<ChildCareIcon />} iconPosition="start" label="Mes enfants" />
          </Tabs>

          {/* Contenu */}
          <Box sx={{ p:{ xs:3, md:5 } }}>
            {tab === 0 && <TabInfos user={user} onSaved={refreshUser} />}
            {tab === 1 && <TabPassword />}
            {tab === 2 && <TabChildren navigate={navigate} />}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}