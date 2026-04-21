// src/pages/admin/AdminDashboard.jsx
// =============================================================================
// Dashboard Admin — Vue d'ensemble + statistiques globales
// Routes :
//   GET /api/dashboard/stats
//   GET /api/dashboard/users
//   GET /api/dashboard/children
//   GET /api/dashboard/conversations
//   GET /api/dashboard/responses
// =============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Card, CardContent, Chip,
  LinearProgress, Avatar, Divider, CircularProgress,
  useMediaQuery, useTheme, IconButton, Tooltip,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  ChildCare as ChildIcon,
  Chat as ChatIcon,
  Assignment as EvalIcon,
  SmartToy as AIIcon,
  TrendingUp as TrendIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Psychology as BrainIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  ThumbUp as ThumbUpIcon,
  Language as LangIcon,
} from "@mui/icons-material";

import AppText from "../../components/atoms/AppText";
import AppButton from "../../components/atoms/AppButton";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import useTranslation from "../../hooks/useTranslation";

// ─────────────────────────────────────────────────────────────────
// COMPOSANT — Carte statistique
// ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "primary.main", loading }) {
  const { t, isRTL } = useTranslation();
  return (
    <Card elevation={0} sx={{
      border: "1.5px solid", borderColor: "divider",
      borderRadius: 3, height: "100%",
      transition: "all 0.25s",
      "&:hover": { borderColor: color, boxShadow: `0 8px 24px ${color}22`, transform: "translateY(-3px)" },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Box sx={{ color, fontSize: 24, display: "flex" }}>{icon}</Box>
          </Box>
        </Box>
        {loading ? (
          <CircularProgress size={24} sx={{ color }} />
        ) : (
          <>
            <AppText variant="h3" sx={{ fontWeight: 900, color: "text.primary", lineHeight: 1 }}>
              {value ?? "—"}
            </AppText>
            <AppText variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontWeight: 600 }}>
              {label}
            </AppText>
            {sub && (
              <AppText variant="caption" sx={{ color, fontWeight: 700, display: "block", mt: 0.5 }}>
                {sub}
              </AppText>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPOSANT — Barre de progression avec label
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color = "#3BBDE8" }) {
  const { t, isRTL } = useTranslation();
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{label}</AppText>
        <AppText variant="caption" sx={{ color: "text.secondary" }}>{value} ({pct}%)</AppText>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8, borderRadius: 4, bgcolor: "#f0f4f8",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPOSANT — Profil distribution
// ─────────────────────────────────────────────────────────────────
const PROFILE_COLORS = {
  TSA: "#3BBDE8", RM: "#F5A623", MIXTE: "#9F7AEA", Normal: "#48BB78", null: "#94a3b8",
};

function ProfileDistribution({ data }) {
  const { t, isRTL } = useTranslation();
  const total = data?.reduce((s, d) => s + d.count, 0) || 0;
  return (
    <Box>
      {(data || []).map(({ _id, count }) => (
        <ProgressBar
          key={_id || "null"}
          label={_id ? t(`wizard.profileLabels.${_id}`) : t("diagnostic.notAnalyzed")}
          value={count}
          max={total}
          color={PROFILE_COLORS[_id] || "#94a3b8"}
        />
      ))}
      {!data?.length && (
        <AppText variant="body2" color="text.disabled" sx={{ textAlign: "center", py: 2 }}>
          {t("actions.noData")}
        </AppText>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPOSANT — Messages par jour (mini chart)
// ─────────────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  const { t, isRTL } = useTranslation();
  if (!data?.length) return <AppText variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>{t("actions.noData")}</AppText>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.8, height: 80, px: 1 }}>
      {data.slice(-14).map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={`${d._id}: ${d.count} messages`}>
            <Box sx={{
              width: "100%",
              height: `${Math.max(8, (d.count / max) * 64)}px`,
              bgcolor: "primary.main",
              borderRadius: "3px 3px 0 0",
              transition: "all 0.3s",
              cursor: "default",
              opacity: 0.7 + (0.3 * d.count / max),
              "&:hover": { opacity: 1 },
            }} />
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [children, setChildren] = useState(null);
  const [convs, setConvs] = useState(null);
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, isRTL } = useTranslation();

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [s, u, c, cv, r] = await Promise.all([
        api.get("/dashboard/stats").then(r => r.data),
        api.get("/dashboard/users").then(r => r.data),
        api.get("/dashboard/children").then(r => r.data),
        api.get("/dashboard/conversations").then(r => r.data),
        api.get("/dashboard/responses").then(r => r.data),
      ]);
      setStats(s); setUsers(u); setChildren(c); setConvs(cv); setResponses(r);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }} dir={isRTL ? "rtl" : "ltr"}>
        <Box>
          <AppText variant="h3" sx={{ fontWeight: 900 }}>{t("adminDash.title")}</AppText>
          <AppText variant="body2" color="text.secondary">
            {t("adminDash.subtitle")}
          </AppText>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title={t("actions.refresh")}>
            <IconButton onClick={() => load(true)} disabled={refreshing}
              sx={{ bgcolor: "background.blue", color: "primary.main" }}>
              <RefreshIcon sx={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } }
              }} />
            </IconButton>
          </Tooltip>
          <AppButton size="small" onClick={() => navigate("/admin/users")} startIcon={<PendingIcon />}
            color="secondary" variant="outlined">
            {t("adminDash.pendingBtn")} {stats?.pendingUsers > 0 && `(${stats.pendingUsers})`}
          </AppButton>
        </Box>
      </Box>

      {/* ── Cartes chiffres globaux ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { icon: <PeopleIcon />, label: t("adminDash.totalUsers"), value: stats?.totalUsers, sub: stats?.pendingUsers > 0 ? `${stats.pendingUsers} ${t("status.pending")}` : t("status.approved"), color: "#3BBDE8" },
          { icon: <ChildIcon />, label: t("adminDash.totalChildren"), value: stats?.totalChildren, sub: `${children?.thisWeek || 0} ${t("adminDash.thisWeek")}`, color: "#F5A623" },
          { icon: <ChatIcon />, label: t("adminDash.totalMessages"), value: stats?.totalMessages, sub: `${stats?.totalConversations || 0} ${t("adminDash.conversations")}`, color: "#9F7AEA" },
          // { icon: <EvalIcon />, label: "Sessions d'évaluation", value: stats?.totalSessions, sub: `${stats?.totalResponses || 0} réponses IA`, color: "#48BB78" },
        ].map((card) => (
          <Grid item xs={6} md={4} key={card.label}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Ligne 2 : Utilisateurs + Profils enfants ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Utilisateurs */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminDash.usersTitle")}</AppText>
                <AppButton size="small" variant="text" onClick={() => navigate("/admin/users")}>
                  {t("actions.viewAll")}
                </AppButton>
              </Box>

              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#E6F7EE", borderRadius: 2 }}>
                      <AppText variant="h4" sx={{ color: "#48BB78", fontWeight: 900 }}>{users?.approved || 0}</AppText>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.approved")}</AppText>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#FFF8EE", borderRadius: 2 }}>
                      <AppText variant="h4" sx={{ color: "#F5A623", fontWeight: 900 }}>{users?.pending || 0}</AppText>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.waiting")}</AppText>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#FFF5F5", borderRadius: 2 }}>
                      <AppText variant="h4" sx={{ color: "#F56565", fontWeight: 900 }}>{users?.notVerified || 0}</AppText>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.notVerified")}</AppText>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <AppText variant="caption" color="text.secondary">{t("adminDash.inscriptions")}</AppText>
                    <Chip label={`+${users?.lastWeek || 0}`} size="small"
                      sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profils enfants */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminDash.profilesTitle")}</AppText>
                <Chip label={`${t("adminDash.avgConf")} ${Math.round((children?.avgConfidence || 0) * 100)}%`}
                  size="small" sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <ProfileDistribution data={children?.predictionDist} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* IA Performance */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <AppText variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>{t("adminDash.aiPerf")}</AppText>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "background.blue", borderRadius: 2 }}>
                      <SpeedIcon sx={{ color: "primary.main", fontSize: 20, mb: 0.5 }} />
                      <AppText variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                        {responses?.avgTotalMs ? `${(responses.avgTotalMs / 1000).toFixed(1)}s` : "—"}
                      </AppText>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.avgTime")}</AppText>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#E6F7EE", borderRadius: 2 }}>
                      <ThumbUpIcon sx={{ color: "#48BB78", fontSize: 20, mb: 0.5 }} />
                      <AppText variant="h5" sx={{ fontWeight: 900, color: "#48BB78" }}>
                        {responses?.satisfactionPct ? `${responses.satisfactionPct}%` : "—"}
                      </AppText>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.satisfaction")}</AppText>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.ragScore")}</AppText>
                      <AppText variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {responses?.avgRagScore || "—"}
                      </AppText>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.webUsed")}</AppText>
                      <AppText variant="caption" sx={{ fontWeight: 700, color: "secondary.main" }}>
                        {responses?.webUsed || 0} fois
                      </AppText>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <AppText variant="caption" color="text.secondary">{t("adminDash.feedbacks")}</AppText>
                      <AppText variant="caption" sx={{ fontWeight: 700 }}>
                        {(responses?.helpful || 0) + (responses?.notHelpful || 0)} / {responses?.total || 0}
                      </AppText>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Ligne 3 : Messages/jour + Conversations ── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminDash.msgChart")}</AppText>
                <Chip label={`${convs?.avgMessagesPerConv || 0} ${t("adminDash.msgPerConv")}`} size="small"
                  sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <MiniBarChart data={convs?.messagesParJour} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <AppText variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>{t("adminDash.quickActions")}</AppText>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {[
                  { label: t("adminDash.manageUsers"), sub: `${users?.pending || 0} ${t("status.pending")}`, color: "primary", onClick: () => navigate("/admin/users"), icon: <PeopleIcon fontSize="small" /> },
                  { label: t("adminDash.manageChildren"), sub: `${stats?.totalChildren || 0} ${t("adminDash.totalChildren")}`, color: "secondary", onClick: () => navigate("/admin/children"), icon: <ChildIcon fontSize="small" /> },
                  { label: t("adminDash.nlpAnalysis"), sub: `${stats?.totalMessages || 0} ${t("adminDash.msgsAnalyzed")}`, color: "primary", onClick: () => navigate("/admin/nlp"), icon: <BrainIcon fontSize="small" /> },
                ].map((action) => (
                  <Box key={action.label}
                    onClick={action.onClick}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      p: 1.8, borderRadius: 2, cursor: "pointer",
                      border: "1px solid", borderColor: "divider",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: `${action.color}.main`, bgcolor: `background.${action.color === "primary" ? "blue" : "orange"}`, transform: "translateX(4px)" },
                    }}
                  >
                    <Box sx={{ color: `${action.color}.main`, display: "flex" }}>{action.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <AppText variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{action.label}</AppText>
                      <AppText variant="caption" color="text.secondary">{action.sub}</AppText>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
