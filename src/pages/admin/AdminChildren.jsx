// src/pages/admin/AdminChildren.jsx
// =============================================================================
// Gestion des enfants (admin) — GET /api/children/all
// Pour chaque enfant :
//   - Affichage carte avec infos complètes
//   - Bouton "Détails" → Dialog avec toutes les données (Q-Chat, profil ML, DS Survey)
//   - Bouton "Modifier" → Dialog formulaire édition
//   - Bouton "Supprimer" → Confirmation + DELETE /api/children/:id
// =============================================================================

import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Avatar, Chip, Divider,
  TextField, InputAdornment, MenuItem, LinearProgress,
  CircularProgress, Alert, Tooltip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Pagination,
} from "@mui/material";
import {
  Search as SearchIcon, Delete as DeleteIcon, Edit as EditIcon,
  Info as InfoIcon, ChildCare as ChildIcon, Close as CloseIcon,
  Psychology as BrainIcon, Assignment as FormIcon, Save as SaveIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

import AppText from "../../components/atoms/AppText";
import AppButton from "../../components/atoms/AppButton";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { useTranslation } from "../../hooks/useTranslation";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

const PROFILE_CFG = {
  TSA: { color: "#3BBDE8", bg: "#EBF7FE", label: "TSA" },
  RM: { color: "#F5A623", bg: "#FFF8EE", label: "DI" },
  MIXTE: { color: "#9F7AEA", bg: "#F3F0FF", label: "Mixte" },
  Normal: { color: "#48BB78", bg: "#E6F7EE", label: "Normal" },
};

const QCHAT_LABELS = [
  "A1 — Répond au nom", "A2 — Contact visuel", "A3 — Pointe pour demander",
  "A4 — Pointe pour partager", "A5 — Jeu symbolique", "A6 — Suit le regard",
  "A7 — Réconforte autrui", "A8 — Premiers mots", "A9 — Gestes simples", "A10 — Regarde dans le vide",
];

// ─────────────────────────────────────────────────────────────────
// ProbBar
// ─────────────────────────────────────────────────────────────────
function ProbBar({ label, value, color }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
        <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{label}</AppText>
        <AppText variant="caption" sx={{ fontWeight: 900, color }}>{pct}%</AppText>
      </Box>
      <LinearProgress variant="determinate" value={pct}
        sx={{
          height: 8, borderRadius: 4, bgcolor: "#f0f4f8",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 }
        }} />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIALOG — Détails complets enfant
// ─────────────────────────────────────────────────────────────────
function ChildDetailsDialog({ child, open, onClose }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  if (!child) return null;

  const cfg = PROFILE_CFG[child.prediction];
  const age = child.birthDate
    ? Math.floor((Date.now() - new Date(child.birthDate)) / (365.25 * 24 * 3600 * 1000))
    : null;

  const dsFields = [
    { label: "Age (PR_AGE1)", value: child.PR_AGE1, note: "1=<25 ans … 6=>65 ans" },
    { label: "Sexe (PR_Q3D)", value: child.PR_Q3D, note: "1=H, 2=F" },
    { label: "Expression (PR_QF1A)", value: child.PR_QF1A, note: "1=Verbal, 2=Alternatif, 3=Jamais" },
    { label: "Compréhension (PR_QG1A)", value: child.PR_QG1A, note: "1=Verbal, 2=Alternatif, 3=Jamais" },
    { label: "Aide mobilité (PR_QH1A)", value: child.PR_QH1A, note: "1=Jamais…5=Systématiquement" },
    { label: "Fauteuil roulant (PR_QH1B)", value: child.PR_QH1B, note: "1=Oui, 2=Non" },
    { label: "Prothèses auditives (PR_QI1)", value: child.PR_QI1, note: "1=Jamais…5=Systématiquement" },
    { label: "Aides visuelles (PR_QJ1)", value: child.PR_QJ1, note: "1=Jamais…5=Systématiquement" },
    { label: "Aide repas (PR_QK1)", value: child.PR_QK1, note: "1=Jamais…5=Systématiquement" },
    { label: "Niveau soutien (PR_QQ)", value: child.PR_QQ, note: "1=Léger…4=Important" },
    { label: "TSA/TED (PR_QN1_A)", value: child.PR_QN1_A, note: "1=Non, 2=Non diagnostiqué, 3=Diagnostiqué" },
    { label: "Trouble rare (PR_QN1_B)", value: child.PR_QN1_B, note: "1=Non, 2=Non diagnostiqué, 3=Diagnostiqué" },
    { label: "Asthme (PR_QN1_C)", value: child.PR_QN1_C, note: "1=Non…3=Diagnostiqué" },
    { label: "Santé mentale (PR_QN1_D)", value: child.PR_QN1_D, note: "1=Non…3=Diagnostiqué" },
    { label: "Épilepsie (PR_QN1_G)", value: child.PR_QN1_G, note: "1=Non…3=Diagnostiqué" },
    { label: "Agression (PR_QO1_A)", value: child.PR_QO1_A_COMBINE, note: "1=Oui, 2=Non(soutien), 3=Non" },
    { label: "Destruction (PR_QO1_B)", value: child.PR_QO1_B_COMBINE, note: "1=Oui, 2=Non(soutien), 3=Non" },
    { label: "Automutilation (PR_QO1_C)", value: child.PR_QO1_C_COMBINE, note: "1=Oui, 2=Non(soutien), 3=Non" },
    { label: "Fugue (PR_QO1_E)", value: child.PR_QO1_E_COMBINE, note: "1=Oui, 2=Non(soutien), 3=Non" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 4, maxHeight: "92vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {child.facePhotoUrl ? (
              <Avatar src={`${child.facePhotoUrl}`}
                sx={{ width: 48, height: 48, border: "2px solid", borderColor: cfg?.color || "divider" }} />
            ) : (
              <Avatar sx={{
                width: 48, height: 48, bgcolor: cfg?.bg || "background.blue",
                color: cfg?.color || "primary.main", fontWeight: 900
              }}>
                {child.firstName?.[0]}
              </Avatar>
            )}
            <Box>
              <AppText variant="h5" sx={{ fontWeight: 800 }}>{child.firstName} {child.lastName}</AppText>
              <Box sx={{ display: "flex", gap: 1 }}>
                {cfg && <Chip label={cfg.label} size="small"
                  sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, height: 18, fontSize: "0.65rem" }} />}
                {age !== null && <AppText variant="caption" color="text.secondary">{age} {t("adminChildren.age")} · {child.gender === "M" ? t("adminChildren.boy") : t("adminChildren.girl")}</AppText>}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          mt: 1.5,
          "& .MuiTab-root": { minHeight: 36, fontSize: "0.8rem", fontWeight: 700 },
          "& .MuiTabs-indicator": { bgcolor: "primary.main" }
        }}>
          <Tab label={t("adminChildren.profileML")} />
          <Tab label={t("adminChildren.qchatTab")} />
          <Tab label={t("adminChildren.dsSurveyTab")} />
          {/* <Tab label={t("adminChildren.aiProfileTab")} /> */}
        </Tabs>
      </DialogTitle>
      <Divider />
      <DialogContent>

        {/* Onglet 1 : Résultats ML */}
        {tab === 0 && (
          <Box sx={{ py: 1 }}>
            {child.prediction ? (
              <>
                <Box sx={{
                  textAlign: "center", py: 2, mb: 3,
                  bgcolor: cfg?.bg, borderRadius: 3, border: "1.5px solid", borderColor: cfg?.color, padding: 2
                }}>
                  <AppText variant="h3" sx={{ color: cfg?.color, fontWeight: 900 }}>
                    {child.prediction}
                  </AppText>
                  {child.confidence && (
                    <AppText variant="body2" color="text.secondary">
                      {t("adminChildren.confidence")} : {Math.round(child.confidence * 100)}%
                    </AppText>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ProbBar label="XGBoost (ML)" value={child.probMl} color="#3BBDE8" />
                    <ProbBar label="MobileNetV2 (CNN)" value={child.probCnn} color="#9F7AEA" />
                    <ProbBar label="Late Fusion TSA" value={child.probTsa} color="#48BB78" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ProbBar label="Isolation Forest (DI)" value={child.scoreAnomalie} color="#F5A623" />
                    {child.probMl !== null && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: "background.subtle", borderRadius: 2 }}>
                        <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                          Formule Late Fusion
                        </AppText>
                        <AppText variant="caption" color="text.disabled">
                          logit(P) = 0.556×logit(ML) + 0.444×logit(CNN) → sigmoid
                        </AppText>
                      </Box>
                    )}
                  </Grid>
                </Grid>
                {child.lastPredictionAt && (
                  <AppText variant="caption" color="text.disabled" sx={{ display: "block", mt: 2, textAlign: "right" }}>
                    {t("adminChildren.lastAnalysis")} : {new Date(child.lastPredictionAt).toLocaleString("fr-FR")}
                  </AppText>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <BrainIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                <AppText variant="body2" color="text.disabled">{t("adminChildren.noAnalysis")}</AppText>
              </Box>
            )}
          </Box>
        )}

        {/* Onglet 2 : Q-Chat */}
        {tab === 1 && (
          <Box sx={{ py: 1 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Chip label={`Score : ${child.QChatScore ?? "—"}/10`} size="small"
                sx={{
                  bgcolor: (child.QChatScore ?? 0) >= 3 ? "#FFF8EE" : "#E6F7EE",
                  color: (child.QChatScore ?? 0) >= 3 ? "#F5A623" : "#48BB78", fontWeight: 700
                }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.subtle" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Question</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Réponse brute</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Score (0/1)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"].map((k, i) => (
                    <TableRow key={k} hover>
                      <TableCell>
                        <AppText variant="caption" sx={{ fontWeight: 600 }}>{QCHAT_LABELS[i]}</AppText>
                      </TableCell>
                      <TableCell>
                        <AppText variant="caption" color="text.secondary">
                          {child[`${k}_raw`] !== null && child[`${k}_raw`] !== undefined
                            ? `Option ${child[`${k}_raw`] + 1}/5`
                            : "—"}
                        </AppText>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={child[k] === 1 ? "1 (signalé)" : child[k] === 0 ? "0 (normal)" : "—"}
                          size="small"
                          sx={{
                            bgcolor: child[k] === 1 ? "#FFF5F5" : child[k] === 0 ? "#E6F7EE" : "#f0f4f8",
                            color: child[k] === 1 ? "#F56565" : child[k] === 0 ? "#48BB78" : "#94a3b8",
                            fontWeight: 700, height: 18, fontSize: "0.62rem",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Onglet 3 : DS Survey */}
        {tab === 2 && (
          <TableContainer sx={{ py: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "background.subtle" }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Variable</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Valeur</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dsFields.map(({ label, value, note }) => (
                  <TableRow key={label} hover>
                    <TableCell><AppText variant="caption" sx={{ fontWeight: 600 }}>{label}</AppText></TableCell>
                    <TableCell>
                      <Chip label={value !== null && value !== undefined ? value : "—"} size="small"
                        sx={{
                          bgcolor: value !== null && value !== undefined ? "background.blue" : "#f0f4f8",
                          color: value !== null && value !== undefined ? "primary.dark" : "text.disabled",
                          fontWeight: 700, height: 18, fontSize: "0.62rem"
                        }} />
                    </TableCell>
                    <TableCell><AppText variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>{note}</AppText></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Onglet 4 : Profil IA */}
        {/* {tab === 3 && (
          <Box sx={{ py: 2 }}>
            {child.profileDetected?.length > 0 ? (
              <>
                <AppText variant="body2" sx={{ fontWeight: 700, color: "text.secondary", mb: 2 }}>
                  Observations accumulées par l'IA lors des conversations :
                </AppText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {child.profileDetected.map((obs, i) => (
                    <Chip key={i} label={obs}
                      sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 600 }} />
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <AppText variant="body2" color="text.disabled">
                  {t("adminChildren.noObservations")}
                </AppText>
              </Box>
            )}
          </Box>
        )} */}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose}>Fermer</AppButton>
      </DialogActions>
    </Dialog>
  );
}

import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';

// ─────────────────────────────────────────────────────────────────
// DIALOG — Modifier enfant
// ─────────────────────────────────────────────────────────────────
function EditChildDialog({ child, open, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (child) setForm({
      firstName: child.firstName || "",
      lastName: child.lastName || "",
      birthDate: child.birthDate ? child.birthDate.split("T")[0] : "",
      gender: child.gender || "",
    });
  }, [child]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) { setError("Nom et prénom requis."); return; }
    setLoading(true); setError("");
    try {
      await api.put(`/children/${child._id}`, form);
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur de mise à jour.");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        ✏️ {t("adminChildren.editTitle")} — {child?.firstName} {child?.lastName}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t("wizard.firstName")} value={form.firstName || ""}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t("wizard.lastName")} value={form.lastName || ""}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField fullWidth label={t("wizard.birthDate")} type="date"
              value={form.birthDate || ""}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth select label={t("wizard.gender")} value={form.gender || ""}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <MenuItem value="M"><FaceIcon sx={{ mr: 1 }} /> {t("wizard.boy")}</MenuItem>
              <MenuItem value="F"><Face2Icon sx={{ mr: 1 }} /> {t("wizard.girl")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose} disabled={loading}>{t("actions.cancel")}</AppButton>
        <AppButton loading={loading} startIcon={<SaveIcon />} onClick={handleSave}>{t("actions.save")}</AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIALOG — Confirmation suppression
// ─────────────────────────────────────────────────────────────────
function ConfirmDeleteDialog({ open, name, onConfirm, onCancel, loading }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{t("adminChildren.deleteTitle")}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <AppText variant="body2" color="text.secondary">
          {t("adminChildren.deleteWarning", { name })}
        </AppText>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <AppButton variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>{t("actions.cancel")}</AppButton>
        <AppButton color="error" onClick={onConfirm} loading={loading} startIcon={<DeleteIcon />}>
          {t("actions.delete")}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function AdminChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProf, setFilterProf] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailChild, setDetailChild] = useState(null);
  const [editChild, setEditChild] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  const { t, isRTL } = useTranslation();

  const LIMIT = 12;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/children/all");
      setChildren(data || []);
    } catch { setError("Erreur chargement enfants."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteInfo) return;
    setDelLoading(true);
    try {
      await api.delete(`/children/${deleteInfo.id}`);
      setSuccess(`Enfant "${deleteInfo.name}" supprimé.`);
      setDeleteInfo(null);
      load();
    } catch { setError("Erreur suppression."); }
    finally { setDelLoading(false); }
  };

  // Filtrage + pagination
  let filtered = children.filter(c => {
    const matchSearch = !search.trim() ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchProf = filterProf === "all" || c.prediction === filterProf;
    return matchSearch && matchProf;
  });
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const stats = {
    total: children.length,
    TSA: children.filter(c => c.prediction === "TSA").length,
    RM: children.filter(c => c.prediction === "RM").length,
    MIXTE: children.filter(c => c.prediction === "MIXTE").length,
    Normal: children.filter(c => c.prediction === "Normal").length,
    none: children.filter(c => !c.prediction).length,
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <AppText variant="h3" sx={{ fontWeight: 900 }}>{t("adminChildren.title")}</AppText>
        <AppText variant="body2" color="text.secondary">
          {t("adminChildren.subtitle")}
        </AppText>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: t("adminChildren.total"), value: stats.total, color: "#3BBDE8", filter: "all" },
          { label: t("wizard.profileLabels.TSA"), value: stats.TSA, color: "#3BBDE8", filter: "TSA" },
          { label: t("wizard.profileLabels.RM"), value: stats.RM, color: "#F5A623", filter: "RM" },
          { label: t("wizard.profileLabels.MIXTE"), value: stats.MIXTE, color: "#9F7AEA", filter: "MIXTE" },
          { label: t("wizard.profileLabels.Normal"), value: stats.Normal, color: "#48BB78", filter: "Normal" },
          { label: t("adminChildren.notAnalyzed"), value: stats.none, color: "#94a3b8", filter: "none" },
        ].map(s => (
          <Box key={s.label}
            onClick={() => { setFilterProf(s.filter === "none" ? "null" : s.filter); setPage(1); }}
            sx={{
              flex: 1, minWidth: 80, textAlign: "center", p: 1.5, borderRadius: 2,
              border: "1.5px solid", cursor: "pointer",
              borderColor: filterProf === (s.filter === "none" ? "null" : s.filter) ? s.color : "divider",
              bgcolor: filterProf === (s.filter === "none" ? "null" : s.filter) ? `${s.color}10` : "background.subtle",
              transition: "all 0.15s",
              "&:hover": { borderColor: s.color },
            }}>
            <AppText variant="h5" sx={{ fontWeight: 900, color: s.color }}>{s.value}</AppText>
            <AppText variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>{s.label}</AppText>
          </Box>
        ))}
      </Box>

      {/* Filtres */}
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField size="small" placeholder={t("adminChildren.search")}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} /></InputAdornment>,
                sx: { borderRadius: 3 },
              }}
            />
            <TextField select size="small" value={filterProf}
              onChange={e => { setFilterProf(e.target.value); setPage(1); }}
              sx={{ minWidth: 180 }} InputProps={{ sx: { borderRadius: 3 } }}>
              <MenuItem value="all">{t("adminChildren.allProfiles")}</MenuItem>
              <MenuItem value="TSA">{t("wizard.profileLabels.TSA")}</MenuItem>
              <MenuItem value="RM">{t("wizard.profileLabels.RM")}</MenuItem>
              <MenuItem value="MIXTE">{t("wizard.profileLabels.MIXTE")}</MenuItem>
              <MenuItem value="Normal">{t("wizard.profileLabels.Normal")}</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Grille */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
      ) : paged.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ChildIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <AppText variant="h5">{t("adminChildren.noChildren")}</AppText>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            {paged.map(child => {
              const cfg = PROFILE_CFG[child.prediction];
              const age = child.birthDate
                ? Math.floor((Date.now() - new Date(child.birthDate)) / (365.25 * 24 * 3600 * 1000))
                : null;
              return (
                <Grid item xs={12} sm={6} md={4} key={child._id}>
                  <Card elevation={0} sx={{
                    border: "1.5px solid", borderColor: "divider", borderRadius: 3,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: cfg?.color || "primary.light", boxShadow: 3 },
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Header */}
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        {child.facePhotoUrl ? (
                          <Avatar src={`${child.facePhotoUrl}`}
                            sx={{ width: 52, height: 52, border: "2px solid", borderColor: cfg?.color || "divider" }} />
                        ) : (
                          <Avatar sx={{
                            width: 52, height: 52, bgcolor: cfg?.bg || "background.blue",
                            color: cfg?.color || "primary.main", fontWeight: 900, fontSize: 20
                          }}>
                            {child.firstName?.[0]}
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <AppText variant="h6" sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {child.firstName} {child.lastName}
                          </AppText>
                          <AppText variant="caption" color="text.secondary">
                            {age !== null ? `${age} ${t("adminChildren.age")} · ` : ""}
                            {child.gender === "M" ? t("adminChildren.boy") : t("adminChildren.girl")}
                          </AppText>
                        </Box>
                      </Box>

                      {/* Chips */}
                      <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2 }}>
                        {cfg ? (
                          <Chip label={cfg.label} size="small"
                            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
                        ) : (
                          <Chip label={t("adminChildren.notAnalyzed")} size="small"
                            sx={{ bgcolor: "#f0f4f8", color: "#94a3b8", fontWeight: 600, height: 20, fontSize: "0.68rem" }} />
                        )}
                        {child.QChatScore !== null && child.QChatScore !== undefined && (
                          <Chip label={`Q-Chat: ${child.QChatScore}/10`} size="small"
                            sx={{
                              bgcolor: child.QChatScore >= 3 ? "#FFF8EE" : "#E6F7EE",
                              color: child.QChatScore >= 3 ? "#F5A623" : "#48BB78",
                              fontWeight: 700, height: 20, fontSize: "0.68rem"
                            }} />
                        )}
                        {child.confidence && (
                          <Chip label={`${Math.round(child.confidence * 100)}%`} size="small"
                            sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700, height: 20, fontSize: "0.68rem" }} />
                        )}
                      </Box>

                      {/* Parent info */}
                      {child.userId && (
                        <AppText variant="caption" color="text.disabled" sx={{ display: "block", mb: 2 }}>
                          {t("adminChildren.parent")} : {child.userId.firstName} {child.userId.lastName}
                        </AppText>
                      )}

                      <Divider sx={{ mb: 1.5 }} />

                      {/* Actions */}
                      <Box sx={{ display: "flex", gap: 0.8 }}>
                        <Tooltip title={t("actions.details")}>
                          <IconButton size="small" onClick={() => setDetailChild(child)}
                            sx={{ bgcolor: "background.blue", color: "primary.main", "&:hover": { bgcolor: "#BEE3F8" } }}>
                            <InfoIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("actions.edit")}>
                          <IconButton size="small" onClick={() => setEditChild(child)}
                            sx={{ bgcolor: "#E6F7EE", color: "#48BB78", "&:hover": { bgcolor: "#C6F6D5" } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("actions.delete")}>
                          <IconButton size="small"
                            onClick={() => setDeleteInfo({ id: child._id, name: `${child.firstName} ${child.lastName}` })}
                            sx={{ bgcolor: "#FFF5F5", color: "error.main", "&:hover": { bgcolor: "#FED7D7" } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {total > LIMIT && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={Math.ceil(total / LIMIT)} page={page}
                onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <ChildDetailsDialog child={detailChild} open={!!detailChild} onClose={() => setDetailChild(null)} />

      <EditChildDialog child={editChild} open={!!editChild}
        onClose={() => setEditChild(null)}
        onSaved={() => { setSuccess("Enfant modifié."); load(); }} />

      <ConfirmDeleteDialog open={!!deleteInfo} name={deleteInfo?.name}
        onConfirm={handleDelete} onCancel={() => setDeleteInfo(null)} loading={delLoading} />
    </AdminLayout>
  );
}
