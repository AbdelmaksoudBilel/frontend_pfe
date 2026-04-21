// src/pages/Profilepage.jsx — TRADUIT
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Tabs, Tab, TextField, MenuItem,
  Avatar, IconButton, Alert, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, CardActions, useMediaQuery, useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import AppButton from "../components/atoms/AppButton";
import AppText from "../components/atoms/AppText";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";
import { useDispatch } from "react-redux";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

const PROFILE_CFG = {
  TSA: { color: "#3BBDE8", label: "TSA", icon: "🧠" },
  RM: { color: "#F5A623", label: "DI", icon: "📚" },
  MIXTE: { color: "#9F7AEA", label: "Mixte", icon: "🔀" },
  Normal: { color: "#48BB78", label: "Normal", icon: "✅" },
};

// ── Tab 1 : Informations ──────────────────────────────────────────────────────
function TabInfos({ user, onSaved, t }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    phone: user?.phone || "", language: user?.language || "fr",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${BASE_URL}${user.avatar}` : null);
  const avatarRef = useRef(null);
  const dispatch = useDispatch();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true); setError(""); setSuccess(false);
    try {
      if (avatarFile) {
        const fd = new FormData(); fd.append("avatar", avatarFile);
        await api.put("/users/me/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      await api.put("/users/me", form);
      const stored = JSON.parse(localStorage.getItem("mc_user") || "{}");
      localStorage.setItem("mc_user", JSON.stringify({ ...stored, ...form }));
      setSuccess(true); onSaved();
      window.location.reload(true);
    } catch (e) { setError(e.response?.data?.message || t("errors.serverError")); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar src={avatarPreview} sx={{ width: 96, height: 96, fontSize: 36, fontWeight: 800, bgcolor: "primary.main", mx: "auto", border: "3px solid", borderColor: "primary.main" }}>
            {!avatarPreview && `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`}
          </Avatar>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </Box>
        <AppText variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>{t("profile.avatarHint")}</AppText>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess(false)}>{t("profile.updateSuccess")}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}><TextField fullWidth label={t("profile.firstName")} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label={t("profile.lastName")} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></Grid>
        <Grid item xs={12}><TextField fullWidth label={t("profile.email")} value={user?.email || ""} disabled helperText={t("profile.emailLocked")} /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label={t("profile.phone")} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label={t("profile.language")} value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
            <MenuItem value="fr">🇫🇷 {t("profile.langs.fr")}</MenuItem>
            <MenuItem value="ar">🇹🇳 {t("profile.langs.ar")}</MenuItem>
            <MenuItem value="en">🇬🇧 {t("profile.langs.en")}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3.5, display: "flex", justifyContent: "flex-end" }}>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>{t("actions.save")}</AppButton>
      </Box>
    </Box>
  );
}

// ── Tab 2 : Mot de passe ──────────────────────────────────────────────────────
function TabPassword({ t }) {
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState({});

  const validate = () => {
    const e = {};
    if (!form.current) e.current = t("errors.required");
    if (!form.newPwd || form.newPwd.length < 8) e.newPwd = t("errors.required");
    if (form.newPwd !== form.confirm) e.confirm = t("errors.pwdMatch") || "Ne correspondent pas";
    setFieldErr(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true); setError(""); setSuccess(false);
    try {
      await api.put("/users/me/password", { currentPassword: form.current, newPassword: form.newPwd });
      setSuccess(true); setForm({ current: "", newPwd: "", confirm: "" });
    } catch (e) { setError(e.response?.data?.message || t("profile.pwdError")); }
    finally { setLoading(false); }
  };

  const showToggle = (field) => (
    <IconButton size="small" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))} edge="end">
      {show[field] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
    </IconButton>
  );

  return (
    <Box>
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess(false)}>{t("profile.pwdSuccess")}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12}><TextField fullWidth label={t("profile.currentPwd")} type={show.current ? "text" : "password"} value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} error={!!fieldErr.current} helperText={fieldErr.current} InputProps={{ endAdornment: showToggle("current") }} /></Grid>
        <Grid item xs={12}><TextField fullWidth label={t("profile.newPwd")} type={show.new ? "text" : "password"} value={form.newPwd} onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))} error={!!fieldErr.newPwd} helperText={fieldErr.newPwd} InputProps={{ endAdornment: showToggle("new") }} /></Grid>
        <Grid item xs={12}><TextField fullWidth label={t("profile.confirmPwd")} type={show.confirm ? "text" : "password"} value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} error={!!fieldErr.confirm} helperText={fieldErr.confirm} InputProps={{ endAdornment: showToggle("confirm") }} /></Grid>
      </Grid>
      <Box sx={{ mt: 3.5, display: "flex", justifyContent: "flex-end" }}>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>{t("profile.changePwd")}</AppButton>
      </Box>
    </Box>
  );
}

// ── Edit child dialog ─────────────────────────────────────────────────────────
function EditChildDialog({ child, open, onClose, onSaved, t }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (child) setForm({ firstName: child.firstName || "", lastName: child.lastName || "", birthDate: child.birthDate ? child.birthDate.split("T")[0] : "", gender: child.gender || "" });
  }, [child]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) { setError(t("errors.required")); return; }
    setLoading(true); setError("");
    try { await api.put(`/children/${child._id}`, form); onSaved(); onClose(); }
    catch (e) { setError(e.response?.data?.message || t("errors.serverError")); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>✏️ {t("profile.editChild")} — {child?.firstName}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t("profile.firstName")} value={form.firstName || ""} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t("profile.lastName")} value={form.lastName || ""} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={7}><TextField fullWidth label={t("wizard.birthDate")} type="date" value={form.birthDate || ""} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth select label={t("wizard.gender")} value={form.gender || ""} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <MenuItem value="M">👦 {t("profile.boy")}</MenuItem>
              <MenuItem value="F">👧 {t("profile.girl")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose}>{t("actions.cancel")}</AppButton>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>{t("actions.save")}</AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ── Tab 3 : Children ──────────────────────────────────────────────────────────
function TabChildren({ navigate, t }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editChild, setEditChild] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/children").then(r => setChildren(r.data || [])).catch(() => { }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const age = (bd) => bd ? Math.floor((Date.now() - new Date(bd)) / (365.25 * 24 * 3600 * 1000)) : null;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("profile.childCount")} ({children.length})</AppText>
        <AppButton size="small" startIcon={<AddIcon />} onClick={() => navigate("/child-wizard")}>{t("profile.addChild")}</AppButton>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}><AppText variant="body2" color="text.disabled">{t("actions.loading")}</AppText></Box>
      ) : children.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <ChildCareIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <AppText variant="h5" gutterBottom>{t("profile.noChildren")}</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t("profile.noChildrenMsg")}</AppText>
          <AppButton startIcon={<AddIcon />} onClick={() => navigate("/child-wizard")}>{t("profile.addChild")}</AppButton>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {children.map(child => {
            const cfg = PROFILE_CFG[child.prediction] || null;
            const childAge = age(child.birthDate);
            return (
              <Grid item xs={12} sm={6} key={child._id}>
                <Card elevation={1} sx={{ borderRadius: 3, border: "1.5px solid", borderColor: "divider", transition: "all 0.25s", "&:hover": { boxShadow: 4, borderColor: "primary.main" } }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      {child.facePhotoUrl
                        ? <Avatar src={`${BASE_URL}${child.facePhotoUrl}`} sx={{ width: 56, height: 56, border: "2px solid", borderColor: "primary.main" }} />
                        : <Avatar sx={{ width: 56, height: 56, bgcolor: "background.blue", color: "primary.main", fontSize: 22, fontWeight: 800 }}>{child.firstName?.[0]}</Avatar>
                      }
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <AppText variant="h5" sx={{ fontWeight: 800 }}>{child.firstName} {child.lastName}</AppText>
                        <AppText variant="caption" color="text.secondary">
                          {childAge !== null ? `${childAge} ${t("profile.age")} · ` : ""}
                          {child.gender === "M" ? t("profile.boy") : t("profile.girl")}
                          {child.QChatScore != null ? ` · Q-Chat: ${child.QChatScore}/10` : ""}
                        </AppText>
                      </Box>
                    </Box>
                    {cfg ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Chip label={`${cfg.icon} ${cfg.label}`} size="small" sx={{ bgcolor: cfg.color + "20", color: cfg.color, fontWeight: 700, fontSize: "0.75rem" }} />
                        {child.confidence && <AppText variant="caption" color="text.disabled">{t("profile.confidence") || "Conf."} : {Math.round(child.confidence * 100)}%</AppText>}
                      </Box>
                    ) : (
                      <Chip label={t("profile.notAnalyzed")} size="small" sx={{ bgcolor: "background.subtle", color: "text.disabled", fontWeight: 600, fontSize: "0.72rem", mb: 1 }} />
                    )}
                    {child.QChatScore != null && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        {child.QChatScore >= 3
                          ? <WarningAmberIcon sx={{ fontSize: 16, color: "secondary.main" }} />
                          : <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                        }
                        <AppText variant="caption" sx={{ color: child.QChatScore >= 3 ? "secondary.main" : "success.main", fontWeight: 600 }}>
                          {child.QChatScore >= 3 ? t("profile.qchatFlag") : t("profile.qchatNormal")}
                        </AppText>
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1.5, gap: 1 }}>
                    <AppButton size="small" variant="outlined" color="secondary" startIcon={<EditIcon />} onClick={() => setEditChild(child)}>
                      {t("profile.editChild")}
                    </AppButton>
                    <AppButton size="small" variant="outlined" startIcon={<PsychologyIcon />} onClick={() => navigate(`/diagnostic/${child._id}`)}>
                      {t("profile.diagnostic")}
                    </AppButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {editChild && <EditChildDialog child={editChild} open={!!editChild} onClose={() => setEditChild(null)} onSaved={load} t={t} />}
    </Box>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState(0);
  const dispatch = useDispatch();

  const refreshUser = async () => {
    try {
      const r = await api.get("/auth/me");
      localStorage.setItem("mc_user", JSON.stringify(r.data));
      dispatch(setUser(r.data));
    } catch { }
  };

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ minHeight: "100vh", background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)", px: { xs: 2, sm: 4, md: 8 }, py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <AppButton variant="outlined" color="secondary" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/chat")}>
            {t("profile.backToChat")}
          </AppButton>
          <AppText variant="h3" sx={{ fontWeight: 900 }}>{t("profile.title")}</AppText>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 4, border: "1.5px solid", borderColor: "divider", overflow: "hidden" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: "1px solid", borderColor: "divider", px: { xs: 1, md: 3 }, "& .MuiTab-root": { fontWeight: 700, minHeight: 52 }, "& .Mui-selected": { color: "primary.main" }, "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
            variant={isMobile ? "fullWidth" : "standard"}>
            <Tab icon={<PersonIcon />} iconPosition="start" label={t("profile.myInfo")} />
            <Tab icon={<LockIcon />} iconPosition="start" label={t("profile.passwordTab")} />
            <Tab icon={<ChildCareIcon />} iconPosition="start" label={t("profile.childrenTab")} />
          </Tabs>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {tab === 0 && <TabInfos user={user} onSaved={refreshUser} t={t} />}
            {tab === 1 && <TabPassword t={t} />}
            {tab === 2 && <TabChildren navigate={navigate} t={t} />}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}