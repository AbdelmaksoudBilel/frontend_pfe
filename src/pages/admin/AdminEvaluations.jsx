// src/pages/admin/AdminEvaluations.jsx
// =============================================================================
// Évaluations comportementales — Pipeline exact :
//
//  1. Admin sélectionne un enfant
//  2. POST /api/evaluation-sessions/from-form/:childId
//     → Python lit profileDetected → suggère oui/non par question
//     → ex: "non verbal" → Communication Q2 → suggère "non"
//  3. Admin voit formulaire pré-rempli, peut modifier chaque réponse
//  4. PUT /api/evaluation-responses/:id → sauvegarde + recalcul scores
//  5. Dashboard :
//     GET /api/evaluation-sessions/:childId/progress → courbe globale + par domaine
//     Comparaison entre 2 sessions (delta)
// =============================================================================

import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Chip, Avatar, Divider,
  TextField, InputAdornment, LinearProgress, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tooltip, IconButton, Collapse, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Select, MenuItem, FormControl, InputLabel,
} from "@mui/material";
import {
  Search as SearchIcon, ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
  Assignment as SessionIcon, AutoAwesome as AIIcon, Add as AddIcon,
  CheckCircle as OkIcon, Cancel as NoIcon, Timeline as ProgressIcon,
  ChildCare as ChildIcon, TrendingUp as UpIcon, TrendingDown as DownIcon,
  TrendingFlat as FlatIcon, Close as CloseIcon, CompareArrows as CompareIcon,
  Psychology as BrainIcon, Star as BestIcon,
} from "@mui/icons-material";
import AppText from "../../components/atoms/AppText";
import AppButton from "../../components/atoms/AppButton";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:3001";

const PROFILE_CFG = {
  TSA   : { color: "#3BBDE8", bg: "#EBF7FE" },
  RM    : { color: "#F5A623", bg: "#FFF8EE" },
  MIXTE : { color: "#9F7AEA", bg: "#F3F0FF" },
  Normal: { color: "#48BB78", bg: "#E6F7EE" },
};

const DOMAIN_COLORS = [
  "#3BBDE8","#F5A623","#9F7AEA","#48BB78","#F56565",
  "#ED8936","#4299E1","#38B2AC","#ECC94B","#E53E3E",
  "#805AD5","#2B6CB0","#276749","#744210",
];

// ─────────────────────────────────────────────────────────────────
// Courbe de progression SVG — score global dans le temps
// ─────────────────────────────────────────────────────────────────
function ProgressCurve({ sessions }) {
  if (!sessions?.length) return (
    <AppText variant="body2" color="text.disabled" sx={{ py: 3, textAlign: "center" }}>
      Minimum 2 sessions pour afficher la progression
    </AppText>
  );

  const W = 460, H = 110, PAD = 30;
  const scores = sessions.map(s => s.globalScore ?? 0);
  const minS = Math.min(...scores, 0), maxS = Math.max(...scores, 100);
  const range = maxS - minS || 100;

  const pts = sessions.map((s, i) => {
    const x = PAD + (i / Math.max(sessions.length - 1, 1)) * (W - 2 * PAD);
    const y = H - PAD - ((s.globalScore - minS) / range) * (H - 2 * PAD);
    return { x, y, score: s.globalScore, label: s.periodLabel || s.period };
  });

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = [...pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`), `L ${pts[pts.length-1].x} ${H-PAD}`, `L ${pts[0].x} ${H-PAD}`, "Z"].join(" ");

  const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
          Score global dans le temps
        </AppText>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {trend > 0 ? <UpIcon sx={{ color: "#48BB78", fontSize: 16 }} /> : trend < 0 ? <DownIcon sx={{ color: "#F56565", fontSize: 16 }} /> : <FlatIcon sx={{ color: "#94a3b8", fontSize: 16 }} />}
          <AppText variant="caption" sx={{ fontWeight: 800, color: trend > 0 ? "#48BB78" : trend < 0 ? "#F56565" : "#94a3b8" }}>
            {trend > 0 ? "+" : ""}{trend}pts depuis début
          </AppText>
        </Box>
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* Grilles horizontales */}
          {[0, 25, 50, 75, 100].map(v => {
            const y = H - PAD - ((v - minS) / range) * (H - 2 * PAD);
            return (
              <g key={v}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f0f4f8" strokeWidth={1} />
                <text x={PAD - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}%</text>
              </g>
            );
          })}
          {/* Aire */}
          <path d={area} fill="#3BBDE8" fillOpacity={0.08} />
          {/* Courbe */}
          <path d={path} fill="none" stroke="#3BBDE8" strokeWidth={2.5} strokeLinejoin="round" />
          {/* Points */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="#3BBDE8" />
              <circle cx={p.x} cy={p.y} r={3} fill="white" />
              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1a202c">
                {p.score}%
              </text>
              {sessions.length <= 6 && (
                <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">
                  {(p.label || "").slice(0, 6)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// Comparaison 2 sessions — radar / barres par domaine
// ─────────────────────────────────────────────────────────────────
function SessionComparison({ sessions }) {
  const [sessA, setSessA] = useState(0);
  const [sessB, setSessB] = useState(Math.min(1, sessions.length - 1));

  if (sessions.length < 2) return (
    <AppText variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>
      Minimum 2 sessions pour comparer
    </AppText>
  );

  const sA = sessions[sessA];
  const sB = sessions[sessB];
  if (!sA || !sB) return null;

  const domainsA = Object.entries(sA.domainScores || {});
  const domainsB = Object.entries(sB.domainScores || {});
  const allDomains = [...new Set([...domainsA.map(([d]) => d), ...domainsB.map(([d]) => d)])];

  const getScore = (sess, domain) => {
    const s = sess?.domainScores;
    return s && s[domain] !== undefined ? s[domain] : null;
  };

  return (
    <Box>
      {/* Sélecteurs */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[["Session A (référence)", sessA, setSessA, "#3BBDE8"], ["Session B (comparée)", sessB, setSessB, "#F5A623"]].map(([label, val, set, color]) => (
          <Box key={label} sx={{ flex: 1, minWidth: 200 }}>
            <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5, display: "block" }}>{label}</AppText>
            <TextField select fullWidth size="small" value={val}
              onChange={e => set(Number(e.target.value))}
              InputProps={{ sx: { borderRadius: 2, borderColor: color } }}>
              {sessions.map((s, i) => (
                <MenuItem key={i} value={i}>{s.periodLabel || s.period} — {s.globalScore}%</MenuItem>
              ))}
            </TextField>
          </Box>
        ))}
      </Box>

      {/* Score global comparé */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {[[sA, "#3BBDE8", "A"], [sB, "#F5A623", "B"]].map(([s, color, key]) => (
          <Box key={key} sx={{ flex: 1, p: 2, borderRadius: 2, border: "2px solid", borderColor: color, textAlign: "center" }}>
            <AppText variant="h3" sx={{ fontWeight: 900, color }}>{s?.globalScore ?? "—"}%</AppText>
            <AppText variant="caption" color="text.secondary">{s?.periodLabel || s?.period}</AppText>
          </Box>
        ))}
        <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", textAlign: "center", bgcolor: "background.subtle" }}>
          {(() => {
            const delta = (sB?.globalScore ?? 0) - (sA?.globalScore ?? 0);
            const color = delta > 0 ? "#48BB78" : delta < 0 ? "#F56565" : "#94a3b8";
            const Icon = delta > 0 ? UpIcon : delta < 0 ? DownIcon : FlatIcon;
            return (
              <>
                <Icon sx={{ color, fontSize: 28, mb: 0.5 }} />
                <AppText variant="h4" sx={{ fontWeight: 900, color }}>{delta > 0 ? "+" : ""}{delta}pts</AppText>
                <AppText variant="caption" color="text.secondary">Évolution</AppText>
              </>
            );
          })()}
        </Box>
      </Box>

      {/* Barres par domaine */}
      <Box>
        <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, display: "block" }}>
          Comparaison par domaine
        </AppText>
        {allDomains.slice(0, 14).map((domain, i) => {
          const sA_val = getScore(sA, domain);
          const sB_val = getScore(sB, domain);
          const delta  = sA_val !== null && sB_val !== null ? sB_val - sA_val : null;
          return (
            <Box key={domain} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.78rem" }}>
                  {domain}
                </AppText>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {sA_val !== null && <Chip label={`A: ${sA_val}%`} size="small" sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#EBF7FE", color: "#3BBDE8", fontWeight: 700 }} />}
                  {sB_val !== null && <Chip label={`B: ${sB_val}%`} size="small" sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#FFF8EE", color: "#F5A623", fontWeight: 700 }} />}
                  {delta !== null && (
                    <Chip label={`${delta > 0 ? "+" : ""}${delta}pts`} size="small"
                      sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800,
                        bgcolor: delta > 0 ? "#E6F7EE" : delta < 0 ? "#FFF5F5" : "#f0f4f8",
                        color: delta > 0 ? "#48BB78" : delta < 0 ? "#F56565" : "#94a3b8" }} />
                  )}
                </Box>
              </Box>
              {/* Barre double */}
              <Box sx={{ position: "relative", height: 10, borderRadius: 4, bgcolor: "#f0f4f8", overflow: "hidden" }}>
                {sA_val !== null && (
                  <Box sx={{ position: "absolute", left: 0, top: 0, height: "50%",
                    width: `${sA_val}%`, bgcolor: "#3BBDE8", borderRadius: "4px 4px 0 0", opacity: 0.7 }} />
                )}
                {sB_val !== null && (
                  <Box sx={{ position: "absolute", left: 0, bottom: 0, height: "50%",
                    width: `${sB_val}%`, bgcolor: "#F5A623", borderRadius: "0 0 4px 4px", opacity: 0.85 }} />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIALOG — Détail session + réponses modifiables (étape 3 pipeline)
// ─────────────────────────────────────────────────────────────────
function SessionDetailDialog({ open, sessionId, childName, onClose, onSaved }) {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(null);
  const [error,   setError]   = useState("");
  const [activeTab, setTab]   = useState(0);

  useEffect(() => {
    if (!open || !sessionId) return;
    setLoading(true); setDetail(null);
    api.get(`/evaluation-sessions/detail/${sessionId}`)
      .then(r => setDetail(r.data))
      .catch(() => setError("Erreur chargement session."))
      .finally(() => setLoading(false));
  }, [open, sessionId]);

  // Toggle réponse 0 ↔ 1 (étape 4 pipeline)
  const toggleAnswer = async (resp) => {
    setSaving(resp._id);
    try {
      await api.put(`/evaluation-responses/${resp._id}`, { answer: resp.answer === 1 ? 0 : 1 });
      setDetail(prev => ({
        ...prev,
        responses: prev.responses.map(r =>
          r._id === resp._id ? { ...r, answer: r.answer === 1 ? 0 : 1, modified: true } : r
        ),
      }));
      onSaved?.();
    } catch { setError("Erreur modification."); }
    finally { setSaving(null); }
  };

  const grouped = detail?.responses?.reduce((acc, r) => {
    if (!acc[r.domain]) acc[r.domain] = [];
    acc[r.domain].push(r);
    return acc;
  }, {}) || {};

  const domains = Object.keys(grouped);
  const domainScores = domains.map(d => {
    const rs = grouped[d];
    const oui = rs.filter(r => r.answer === 1).length;
    return { domain: d, score: Math.round((oui / rs.length) * 100), total: rs.length, oui };
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 4, maxHeight: "92vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <AppText variant="h5" sx={{ fontWeight: 800 }}>
              {detail?.session?.periodLabel || "Détail session"}
            </AppText>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
              {detail?.session?.globalScore !== undefined && (
                <Chip label={`Score global : ${detail.session.globalScore}%`} size="small"
                  sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
              )}
              {detail?.session?.aiPrefilled && (
                <Chip label="Pré-rempli IA" size="small" icon={<AIIcon sx={{ fontSize: "12px !important" }} />}
                  sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 600 }} />
              )}
              {detail?.session?.fromForm && (
                <Chip label="Depuis formulaire parent" size="small"
                  sx={{ bgcolor: "#E6F7EE", color: "#276749", fontWeight: 600 }} />
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        {/* Onglets */}
        <Tabs value={activeTab} onChange={(_, v) => setTab(v)} sx={{ mt: 1,
          "& .MuiTab-root": { minHeight: 36, fontSize: "0.8rem", fontWeight: 700 },
          "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}>
          <Tab label="Réponses par domaine" />
          <Tab label="Scores domaines" />
        </Tabs>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {loading && <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        {!loading && detail && activeTab === 0 && (
          <Box>
            {domains.map((domain, di) => {
              const color = DOMAIN_COLORS[di % DOMAIN_COLORS.length];
              const ds = domainScores.find(d => d.domain === domain);
              return (
                <Box key={domain}>
                  {/* Header domaine */}
                  <Box sx={{
                    px: 3, py: 1.5, bgcolor: "background.subtle",
                    borderBottom: "1px solid", borderColor: "divider",
                    borderLeft: `4px solid ${color}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <AppText variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{domain}</AppText>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <AppText variant="caption" sx={{ color, fontWeight: 800 }}>{ds?.score}%</AppText>
                      <AppText variant="caption" color="text.disabled">({ds?.oui}/{ds?.total})</AppText>
                    </Box>
                  </Box>
                  {/* Réponses — admin peut modifier (étape 3) */}
                  {grouped[domain].map(resp => (
                    <Box key={resp._id} sx={{
                      px: 3, py: 1.2, display: "flex", alignItems: "center", gap: 1.5,
                      borderBottom: "1px solid", borderColor: "#f0f4f8",
                      "&:hover": { bgcolor: "background.subtle" },
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <AppText variant="caption" sx={{ color: "text.primary", lineHeight: 1.5 }}>
                          {resp.question}
                        </AppText>
                        <Box sx={{ display: "flex", gap: 0.5, mt: 0.2 }}>
                          {resp.aiSuggested && (
                            <Chip label="Suggéré IA" size="small"
                              sx={{ height: 14, fontSize: "0.58rem", bgcolor: "background.blue", color: "primary.dark" }} />
                          )}
                          {resp.modified && (
                            <Chip label="Modifié" size="small"
                              sx={{ height: 14, fontSize: "0.58rem", bgcolor: "#FFF8EE", color: "#F5A623" }} />
                          )}
                          <Chip label={resp.source === "form_parent" ? "Formulaire" : resp.source === "ai_profile" ? "IA profil" : "Manuel"}
                            size="small" sx={{ height: 14, fontSize: "0.58rem", bgcolor: "background.subtle", color: "text.disabled" }} />
                        </Box>
                      </Box>
                      {/* Toggle bouton — étape 4 */}
                      <Tooltip title={`Cliquer pour basculer → ${resp.answer === 1 ? "Non" : "Oui"}`}>
                        <IconButton size="small" disabled={saving === resp._id}
                          onClick={() => toggleAnswer(resp)}
                          sx={{
                            width: 36, height: 36,
                            bgcolor: resp.answer === 1 ? "#E6F7EE" : "#FFF5F5",
                            color: resp.answer === 1 ? "#48BB78" : "#F56565",
                            border: "1.5px solid",
                            borderColor: resp.answer === 1 ? "#C6F6D5" : "#FED7D7",
                            "&:hover": { bgcolor: resp.answer === 1 ? "#C6F6D5" : "#FED7D7" },
                            transition: "all 0.2s",
                          }}>
                          {saving === resp._id
                            ? <CircularProgress size={14} />
                            : resp.answer === 1
                              ? <OkIcon sx={{ fontSize: 18 }} />
                              : <NoIcon sx={{ fontSize: 18 }} />
                          }
                        </IconButton>
                      </Tooltip>
                      <AppText variant="caption" sx={{ fontWeight: 800, minWidth: 28, textAlign: "center",
                        color: resp.answer === 1 ? "#48BB78" : "#F56565" }}>
                        {resp.answer === 1 ? "Oui" : "Non"}
                      </AppText>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        )}

        {!loading && detail && activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <AppText variant="body2" sx={{ fontWeight: 700, color: "text.secondary", mb: 2 }}>Scores par domaine</AppText>
            {domainScores.sort((a, b) => b.score - a.score).map((d, i) => (
              <Box key={d.domain} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{d.domain}</AppText>
                  <AppText variant="caption" sx={{ fontWeight: 800, color: DOMAIN_COLORS[i % DOMAIN_COLORS.length] }}>
                    {d.score}% ({d.oui}/{d.total})
                  </AppText>
                </Box>
                <LinearProgress variant="determinate" value={d.score}
                  sx={{ height: 9, borderRadius: 4, bgcolor: "#f0f4f8",
                    "& .MuiLinearProgress-bar": { bgcolor: DOMAIN_COLORS[i % DOMAIN_COLORS.length], borderRadius: 4 } }} />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <AppText variant="caption" color="text.disabled">
          Cliquez sur ✓/✗ pour modifier une réponse — le score se recalcule automatiquement
        </AppText>
        <AppButton variant="outlined" color="secondary" onClick={onClose}>Fermer</AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIALOG — Progression + comparaison d'un enfant (étape 5)
// ─────────────────────────────────────────────────────────────────
function ProgressDialog({ open, childId, childName, onClose }) {
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!open || !childId) return;
    setLoading(true);
    api.get(`/evaluation-sessions/${childId}/progress`)
      .then(r => setProgress(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, childId]);

  const [tab, setTab] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 4, maxHeight: "90vh" } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <AppText variant="h5" sx={{ fontWeight: 800 }}>Progression — {childName}</AppText>
            {progress?.totalSessions && (
              <AppText variant="caption" color="text.secondary">
                {progress.totalSessions} session(s) · Tendance {progress.trend > 0 ? "+" : ""}{progress.trend}pts
              </AppText>
            )}
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1,
          "& .MuiTab-root": { minHeight: 36, fontSize: "0.8rem", fontWeight: 700 },
          "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}>
          <Tab label="Courbe de progression" />
          <Tab label="Comparaison 2 sessions" />
        </Tabs>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading && <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>}
        {!loading && progress && tab === 0 && (
          <Box>
            <ProgressCurve sessions={progress.sessions} />
            {progress.sessions?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, display: "block" }}>
                  Historique des sessions
                </AppText>
                {progress.sessions.map((s, i) => (
                  <Box key={s._id} sx={{
                    display: "flex", alignItems: "center", gap: 2, p: 1.5, mb: 1,
                    borderRadius: 2, bgcolor: "background.subtle",
                    border: "1px solid", borderColor: "divider",
                  }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: "background.blue",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: "0.75rem", color: "primary.main" }}>
                      S{i + 1}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {s.periodLabel || s.period}
                      </AppText>
                      <AppText variant="caption" color="text.disabled">
                        {new Date(s.evaluatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      </AppText>
                    </Box>
                    <Chip label={`${s.globalScore ?? "—"}%`} size="small"
                      sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 800 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        {!loading && progress && tab === 1 && (
          <SessionComparison sessions={progress.sessions || []} />
        )}
        {!loading && (!progress?.sessions?.length) && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <ProgressIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <AppText variant="body2" color="text.disabled">Aucune session pour cet enfant</AppText>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <AppButton variant="outlined" color="secondary" onClick={onClose}>Fermer</AppButton>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Card enfant — avec pipeline évaluation
// ─────────────────────────────────────────────────────────────────
function ChildCard({ child, onRefresh }) {
  const [sessions,    setSessions]    = useState([]);
  const [loadingSess, setLoadingSess] = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [error,       setError]       = useState("");
  const [sessionId,   setSessionId]   = useState(null);  // dialog détail
  const [showProgress, setShowProgress] = useState(false); // dialog progression

  const cfg = PROFILE_CFG[child.prediction] || PROFILE_CFG.Normal;
  const age = child.birthDate ? Math.floor((Date.now() - new Date(child.birthDate)) / (365.25 * 24 * 3600 * 1000)) : null;

  const loadSessions = async () => {
    if (expanded && sessions.length) { setExpanded(false); return; }
    setExpanded(true);
    if (sessions.length) return;
    setLoadingSess(true);
    try {
      const { data } = await api.get(`/evaluation-sessions/${child._id}`);
      setSessions(data || []);
    } catch {}
    finally { setLoadingSess(false); }
  };

  // Étape 2 : Pré-remplissage IA depuis profileDetected
  const createFromForm = async () => {
    setCreating(true); setError("");
    try {
      await api.post(`/evaluation-sessions/from-form/${child._id}`);
      setSessions([]); // force reload
      setExpanded(false);
      onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur création session.");
    } finally { setCreating(false); }
  };

  const lastSess = sessions[0];

  return (
    <>
      <Card elevation={0} sx={{
        border: "1.5px solid", borderColor: expanded ? "primary.light" : "divider",
        borderRadius: 3, transition: "all 0.2s",
      }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: error ? 1.5 : 0 }}>
            {child.facePhotoUrl ? (
              <Avatar src={`${BASE_URL}${child.facePhotoUrl}`}
                sx={{ width: 48, height: 48, border: "2px solid", borderColor: cfg.color }} />
            ) : (
              <Avatar sx={{ width: 48, height: 48, bgcolor: cfg.bg, color: cfg.color, fontWeight: 900, fontSize: 18 }}>
                {child.firstName?.[0]}
              </Avatar>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <AppText variant="h6" sx={{ fontWeight: 800 }}>{child.firstName} {child.lastName}</AppText>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.3 }}>
                {child.prediction && (
                  <Chip label={child.prediction} size="small"
                    sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, height: 18, fontSize: "0.65rem" }} />
                )}
                {age !== null && (
                  <AppText variant="caption" color="text.disabled">{age} ans · {child.gender === "M" ? "Garçon" : "Fille"}</AppText>
                )}
                {lastSess && (
                  <Chip label={`Dernier score: ${lastSess.globalScore ?? "—"}%`} size="small"
                    sx={{ height: 18, fontSize: "0.62rem", bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
              {/* Étape 2 : Pré-remplissage IA */}
              <Tooltip title="Créer session pré-remplie par IA (profileDetected)">
                <IconButton size="small" onClick={createFromForm} disabled={creating}
                  sx={{ bgcolor: "background.orange", color: "secondary.main", "&:hover": { bgcolor: "#FEEBCB" } }}>
                  {creating ? <CircularProgress size={14} /> : <AIIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
              {/* Étape 5 : Progression */}
              <Tooltip title="Courbe de progression + comparaison sessions">
                <IconButton size="small" onClick={() => setShowProgress(true)}
                  sx={{ bgcolor: "#E6F7EE", color: "#48BB78", "&:hover": { bgcolor: "#C6F6D5" } }}>
                  <ProgressIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={expanded ? "Réduire" : "Voir sessions"}>
                <IconButton size="small" onClick={loadSessions}
                  sx={{ bgcolor: "background.blue", color: "primary.main", "&:hover": { bgcolor: "#BEE3F8" } }}>
                  {expanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

          {/* Sessions collapse */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 1.5 }} />
            {loadingSess && <Box sx={{ py: 2, textAlign: "center" }}><CircularProgress size={22} /></Box>}
            {!loadingSess && sessions.length === 0 && (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <SessionIcon sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
                <AppText variant="body2" color="text.disabled">Aucune session</AppText>
                <AppButton size="small" startIcon={<AIIcon />} sx={{ mt: 1.5 }}
                  onClick={createFromForm} loading={creating} color="secondary" variant="outlined">
                  Créer depuis le formulaire (IA)
                </AppButton>
              </Box>
            )}
            {!loadingSess && sessions.map((sess) => (
              <Box key={sess._id} sx={{
                display: "flex", alignItems: "center", gap: 1.5, p: 1.5, mb: 1,
                borderRadius: 2, bgcolor: "background.subtle",
                border: "1px solid", borderColor: "divider",
                cursor: "pointer", transition: "all 0.15s",
                "&:hover": { borderColor: "primary.light", bgcolor: "background.blue" },
              }} onClick={() => setSessionId(sess._id)}>
                <SessionIcon sx={{ color: "primary.main", fontSize: 18, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {sess.periodLabel || sess.period}
                  </AppText>
                  <Box sx={{ display: "flex", gap: 0.8, mt: 0.2 }}>
                    <Chip label={`${sess.globalScore ?? "—"}%`} size="small"
                      sx={{ height: 16, fontSize: "0.62rem", bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
                    {sess.aiPrefilled && <Chip label="IA" size="small"
                      sx={{ height: 16, fontSize: "0.62rem", bgcolor: "background.orange", color: "secondary.dark", fontWeight: 700 }} />}
                    {sess.fromForm && <Chip label="Formulaire" size="small"
                      sx={{ height: 16, fontSize: "0.62rem", bgcolor: "#E6F7EE", color: "#276749", fontWeight: 700 }} />}
                  </Box>
                </Box>
                <AppText variant="caption" color="text.disabled">
                  {new Date(sess.evaluatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </AppText>
              </Box>
            ))}
          </Collapse>
        </CardContent>
      </Card>

      {/* Dialog détail session (étape 3+4) */}
      <SessionDetailDialog
        open={!!sessionId} sessionId={sessionId}
        childName={`${child.firstName} ${child.lastName}`}
        onClose={() => setSessionId(null)}
        onSaved={() => { setSessions([]); setExpanded(false); onRefresh?.(); }}
      />

      {/* Dialog progression (étape 5) */}
      <ProgressDialog
        open={showProgress} childId={child._id}
        childName={`${child.firstName} ${child.lastName}`}
        onClose={() => setShowProgress(false)}
      />
    </>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function AdminEvaluations() {
  const [children, setChildren] = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/children/all");
      setChildren(data || []);
    } catch { setError("Erreur chargement enfants."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = children.filter(c =>
    !search.trim() || `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <AppText variant="h3" sx={{ fontWeight: 900 }}>Évaluations comportementales</AppText>
        <AppText variant="body2" color="text.secondary">
          Pipeline 5 étapes · Pré-remplissage IA · Courbe progression · Comparaison sessions
        </AppText>
      </Box>

      {/* Pipeline schema */}
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <AppText variant="body2" sx={{ fontWeight: 800, color: "text.secondary", mb: 1.5 }}>
            Pipeline évaluation
          </AppText>
          <Box sx={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {[
              { n: 1, label: "Sélection enfant",     color: "#3BBDE8", icon: "👤" },
              { n: 2, label: "Pré-remplissage IA",   color: "#F5A623", icon: "🤖" },
              { n: 3, label: "Admin modifie",         color: "#9F7AEA", icon: "✏️" },
              { n: 4, label: "Sauvegarde + scores",   color: "#48BB78", icon: "💾" },
              { n: 5, label: "Progression + comparer",color: "#F56565", icon: "📈" },
            ].map((s, i) => (
              <Box key={s.n} sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Box sx={{ flex: 1, py: 1, px: 0.5, textAlign: "center", borderRadius: 1.5,
                  border: "1px solid", borderColor: `${s.color}40`, bgcolor: `${s.color}0D` }}>
                  <Box sx={{ fontSize: "1rem", mb: 0.2 }}>{s.icon}</Box>
                  <AppText variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 800, color: s.color, display: "block", lineHeight: 1.3 }}>
                    [{s.n}] {s.label}
                  </AppText>
                </Box>
                {i < 4 && <Box sx={{ width: 10, height: 1, bgcolor: "divider", flexShrink: 0 }} />}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { l: "Enfants",  v: children.length,                                     c: "#3BBDE8" },
          { l: "TSA",      v: children.filter(c => c.prediction === "TSA").length,  c: "#3BBDE8" },
          { l: "DI (RM)",  v: children.filter(c => c.prediction === "RM").length,   c: "#F5A623" },
          { l: "Mixte",    v: children.filter(c => c.prediction === "MIXTE").length,c: "#9F7AEA" },
          { l: "Normal",   v: children.filter(c => c.prediction === "Normal").length,c:"#48BB78" },
        ].map(s => (
          <Box key={s.l} sx={{ textAlign: "center", p: 1.5, borderRadius: 2, border: "1.5px solid",
            borderColor: "divider", bgcolor: "background.subtle", flex: 1, minWidth: 80 }}>
            <AppText variant="h5" sx={{ fontWeight: 900, color: s.c }}>{s.v}</AppText>
            <AppText variant="caption" color="text.secondary">{s.l}</AppText>
          </Box>
        ))}
      </Box>

      {/* Recherche */}
      <TextField fullWidth size="small" placeholder="Rechercher un enfant…"
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} /></InputAdornment>,
          sx: { borderRadius: 3 },
        }}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ChildIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <AppText variant="h5">Aucun enfant trouvé</AppText>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map(child => (
            <Grid item xs={12} md={6} key={child._id}>
              <ChildCard child={child} onRefresh={load} />
            </Grid>
          ))}
        </Grid>
      )}
    </AdminLayout>
  );
}