// src/pages/admin/AdminNLP.jsx
// =============================================================================
// Dashboard NLP — Pipeline exact :
//
//  React → POST /api/dashboard/nlp (Node.js)
//  Node.js → récupère 500 derniers messages MongoDB
//           → POST /dashboard/nlp (Python FastAPI)
//  Python NLP Pipeline :
//    [1]  Nettoyage      → URLs, ponctuation, chiffres
//    [2]  Langue         → détection fr/ar/en (lingua)
//    [3]  Tokenisation   → par mot
//    [4]  Segmentation   → par phrase
//    [5]  Stopwords      → filtrage FR + AR + EN
//    [6]  Lemmatisation  → spaCy fr_core_news_sm
//    [7]  Fréquence      → Counter → top keywords
//    [8]  Questions      → regex patterns → top questions
//    [9]  Clustering     → TF-IDF + KMeans → topics
//    [10] Sentiment      → lexique → positif/neutre/négatif
//
//  React affiche :
//    top_keywords     → bar chart + word cloud
//    top_questions    → liste classée
//    topic_clusters   → pie chart (5 topics)
//    sentiment        → donut chart
//    lang_distribution → bar chart
//    avg_msg_length   → stat card
// =============================================================================

import { useState } from "react";
import {
  Box, Grid, Card, CardContent, Chip, Alert,
  TextField, MenuItem, CircularProgress, LinearProgress, Tooltip, IconButton,
} from "@mui/material";
import {
  Psychology as BrainIcon, Refresh as RefreshIcon,
  BarChart as BarIcon, PieChart as PieIcon, DonutLarge as DonutIcon,
  QuestionAnswer as QIcon, Tag as TagIcon, Translate as LangIcon,
  TextFields as TextIcon,
  CheckCircle as StepDoneIcon, RadioButtonUnchecked as StepIdleIcon,
} from "@mui/icons-material";
import AppText from "../../components/atoms/AppText";
import AppButton from "../../components/atoms/AppButton";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { useTranslation } from "../../hooks/useTranslation";

// ── Pipeline steps definition ────────────────────────────────────
const STEPS = [
  { n: 1, label: "Nettoyage", desc: "URLs, ponctuation, chiffres" },
  { n: 2, label: "Langue", desc: "lingua fr/ar/en" },
  { n: 3, label: "Tokenisation", desc: "découpage par mot" },
  { n: 4, label: "Segmentation", desc: "découpage par phrase" },
  { n: 5, label: "Stopwords", desc: "filtrage FR+AR+EN" },
  { n: 6, label: "Lemmatisation", desc: "spaCy fr_core_news_sm" },
  { n: 7, label: "Fréquence", desc: "Counter → top keywords" },
  { n: 8, label: "Questions", desc: "regex patterns" },
  { n: 9, label: "Clustering", desc: "TF-IDF + KMeans" },
  { n: 10, label: "Sentiment", desc: "lexique pos/neg/neu" },
];

// ── Pipeline visualizer ──────────────────────────────────────────
function PipelineBar({ currentStep, t }) {
  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Box sx={{ display: "flex", gap: 0, minWidth: 700 }}>
        {STEPS.map((s, i) => {
          const done = currentStep > s.n;
          const active = currentStep === s.n;
          return (
            <Box key={s.n} sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <Tooltip title={t(`adminNLP.step${s.n}Desc`)} arrow>
                <Box sx={{
                  flex: 1, py: 1, px: 0.5, textAlign: "center",
                  borderRadius: 1.5,
                  bgcolor: active ? "#EBF7FE" : done ? "#E6F7EE" : "background.subtle",
                  border: "1px solid",
                  borderColor: active ? "primary.light" : done ? "#C6F6D5" : "divider",
                  transition: "all 0.25s",
                  boxShadow: active ? "0 0 0 3px rgba(59,189,232,0.2)" : "none",
                }}>
                  <Box sx={{ color: active ? "primary.main" : done ? "#48BB78" : "text.disabled", display: "flex", justifyContent: "center", mb: 0.2 }}>
                    {done ? <StepDoneIcon sx={{ fontSize: 14 }} /> : <StepIdleIcon sx={{ fontSize: 10 }} />}
                  </Box>
                  <AppText variant="caption" sx={{
                    display: "block", fontSize: "0.6rem", fontWeight: 800,
                    color: active ? "primary.main" : done ? "#48BB78" : "text.disabled",
                    lineHeight: 1.2,
                  }}>
                    [{s.n}]
                  </AppText>
                  <AppText variant="caption" sx={{
                    display: "block", fontSize: "0.58rem", fontWeight: 600,
                    color: active ? "primary.dark" : done ? "#276749" : "text.disabled",
                    lineHeight: 1.2,
                  }}>
                    {t(`adminNLP.step${s.n}`)}
                  </AppText>
                </Box>
              </Tooltip>
              {i < STEPS.length - 1 && (
                <Box sx={{ width: 8, height: 1, bgcolor: done ? "#48BB78" : "divider", flexShrink: 0 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Word Cloud ───────────────────────────────────────────────────
function WordCloud({ words, t }) {
  if (!words?.length) return <AppText variant="body2" color="text.disabled" sx={{ py: 3, textAlign: "center" }}>{t("adminNLP.noKeywords")}</AppText>;
  const maxV = Math.max(...words.map(w => w.value), 1);
  const palette = ["#3BBDE8", "#F5A623", "#9F7AEA", "#48BB78", "#F56565", "#ED8936", "#4299E1", "#38B2AC", "#ECC94B", "#E53E3E", "#2B6CB0", "#805AD5"];
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, p: 1, justifyContent: "center", minHeight: 100 }}>
      {words.slice(0, 50).map(({ text, value }, i) => {
        const r = value / maxV;
        return (
          <Tooltip key={text} title={`${value} occurrences`} arrow>
            <Box sx={{
              fontSize: `${0.7 + r * 1.3}rem`, fontWeight: r > 0.5 ? 900 : 700,
              color: palette[i % palette.length], opacity: 0.6 + r * 0.4,
              cursor: "default", fontFamily: "'Nunito', sans-serif",
              transition: "transform 0.2s", "&:hover": { transform: "scale(1.18)" },
            }}>{text}</Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// ── Keywords Bar Chart ───────────────────────────────────────────
function KeywordsBars({ keywords }) {
  if (!keywords?.length) return null;
  const max = Math.max(...keywords.map(k => k.count), 1);
  const colors = ["#3BBDE8", "#1A7FA8", "#7DD6F0", "#F5A623", "#D4891A", "#9F7AEA", "#805AD5", "#48BB78", "#276749", "#F56565", "#ED8936", "#ECC94B"];
  return (
    <Box>
      {keywords.slice(0, 12).map((kw, i) => (
        <Box key={kw.word} sx={{ mb: 1.2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors[i % colors.length], flexShrink: 0 }} />
              <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.8rem" }}>{kw.word}</AppText>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <AppText variant="caption" color="text.disabled">{kw.count}×</AppText>
              <AppText variant="caption" sx={{ fontWeight: 700, color: colors[i % colors.length] }}>{kw.freq}%</AppText>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={(kw.count / max) * 100}
            sx={{
              height: 7, borderRadius: 4, bgcolor: "#f0f4f8",
              "& .MuiLinearProgress-bar": { bgcolor: colors[i % colors.length], borderRadius: 4, transition: "width 0.8s ease" }
            }} />
        </Box>
      ))}
    </Box>
  );
}

// ── Topics Pie Chart (SVG) ───────────────────────────────────────
function TopicsPie({ clusters, t, clustersParam }) {
  if (!clusters?.length) return (
    <AppText variant="body2" color="text.disabled" sx={{ py: 3, textAlign: "center" }}>
      {t("adminNLP.clusteringUnavailable")}
    </AppText>
  );
  const colors = ["#3BBDE8", "#F5A623", "#9F7AEA", "#48BB78", "#F56565"];
  const total = clusters.reduce((s, c) => s + c.count, 0) || 1;
  const cx = 75, cy = 75, R = 65;
  let a = -Math.PI / 2;
  const sectors = clusters.map((c, i) => {
    const sweep = (c.count / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(a), y1 = cy + R * Math.sin(a);
    a += sweep;
    const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
    return { ...c, d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`, color: colors[i] };
  });

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
      <Box sx={{ flexShrink: 0 }}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          {sectors.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} opacity={0.85}>
              <title>{s.label || t("adminNLP.topicLabel").replace("{{num}}", i + 1)} — {Math.round((s.count / total) * 100)}%</title>
            </path>
          ))}
          <circle cx={cx} cy={cy} r={32} fill="white" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a202c">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{t("adminNLP.messages")}</text>
        </svg>
      </Box>
      <Box sx={{ flex: 1, minWidth: 180 }}>
        {sectors.map((s, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.2, mb: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: s.color, flexShrink: 0, mt: 0.3 }} />
            <Box>
              <AppText variant="caption" sx={{ fontWeight: 800, color: "text.primary", display: "block" }}>
                {s.label || t("adminNLP.topicLabel").replace("{{num}}", i + 1)} — {Math.round((s.count / total) * 100)}%
              </AppText>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {(s.keywords || []).slice(0, 4).map(kw => (
                  <Chip key={kw} label={kw} size="small"
                    sx={{ height: 16, fontSize: "0.6rem", bgcolor: `${s.color}18`, color: s.color, fontWeight: 700 }} />
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Sentiment Donut ──────────────────────────────────────────────
function SentimentDonut({ data, t }) {
  if (!data) return null;
  const segs = [
    { label: t("adminNLP.positive"), key: "positive", color: "#48BB78", emoji: "😊" },
    { label: t("adminNLP.neutral"), key: "neutral", color: "#CBD5E0", emoji: "😐" },
    { label: t("adminNLP.negative"), key: "negative", color: "#F56565", emoji: "😔" },
  ].map(s => ({ ...s, count: data[s.key]?.count || 0, pct: data[s.key]?.percent || 0 }));

  const total = segs.reduce((s, e) => s + e.count, 0) || 1;
  const cx = 55, cy = 55, Ro = 48, Ri = 28;
  let a = -Math.PI / 2;
  const arcs = segs.map(s => {
    const sw = (s.count / total) * 2 * Math.PI;
    const x1o = cx + Ro * Math.cos(a), y1o = cy + Ro * Math.sin(a);
    const x1i = cx + Ri * Math.cos(a), y1i = cy + Ri * Math.sin(a);
    a += sw;
    const x2o = cx + Ro * Math.cos(a), y2o = cy + Ro * Math.sin(a);
    const x2i = cx + Ri * Math.cos(a), y2i = cy + Ri * Math.sin(a);
    const lg = sw > Math.PI ? 1 : 0;
    return { ...s, path: `M ${x1o} ${y1o} A ${Ro} ${Ro} 0 ${lg} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${Ri} ${Ri} 0 ${lg} 0 ${x1i} ${y1i} Z` };
  });
  const dom = segs.reduce((a, b) => b.pct > a.pct ? b : a, segs[0]);

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
        {arcs.map((arc, i) => <path key={i} d={arc.path} fill={arc.color} opacity={0.9} />)}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="18">{dom.emoji}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1a202c">{dom.pct}%</text>
      </svg>
      <Box>
        {segs.map(s => (
          <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 2, bgcolor: s.color, flexShrink: 0 }} />
            <Box>
              <AppText variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block" }}>{s.label}</AppText>
              <AppText variant="caption" color="text.secondary">{s.count} msg ({s.pct}%)</AppText>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Lang Bar Chart ───────────────────────────────────────────────
function LangBars({ data }) {
  if (!data) return null;
  const info = { fr: { flag: "🇫🇷", label: "Français", color: "#3BBDE8" }, ar: { flag: "🇹🇳", label: "Arabe", color: "#F5A623" }, en: { flag: "🇬🇧", label: "Anglais", color: "#9F7AEA" } };
  const entries = Object.entries(data).filter(([, v]) => v.count > 0);
  const maxC = Math.max(...entries.map(([, v]) => v.count), 1);

  return (
    <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: 110, px: 1 }}>
      {entries.map(([lang, d]) => {
        const i = info[lang] || { flag: "🌐", label: lang, color: "#94a3b8" };
        return (
          <Box key={lang} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <AppText variant="caption" sx={{ fontWeight: 800, color: i.color }}>{d.percent}%</AppText>
            <Tooltip title={`${i.label} : ${d.count} messages`}>
              <Box sx={{
                width: "100%",
                height: `${Math.max(14, (d.count / maxC) * 80)}px`,
                bgcolor: i.color, borderRadius: "4px 4px 0 0", opacity: 0.85,
                transition: "height 0.6s ease", cursor: "default",
                "&:hover": { opacity: 1 },
              }} />
            </Tooltip>
            <AppText variant="caption" sx={{ fontSize: "1rem" }}>{i.flag}</AppText>
            <AppText variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled", textAlign: "center" }}>{i.label}</AppText>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Mini stat card ───────────────────────────────────────────────
function Stat({ icon, label, value, color }) {
  return (
    <Box sx={{ flex: 1, textAlign: "center", p: 2, borderRadius: 2, border: "1.5px solid", borderColor: "divider", bgcolor: "background.subtle" }}>
      <Box sx={{ color, fontSize: 22, mb: 0.5 }}>{icon}</Box>
      <AppText variant="h5" sx={{ fontWeight: 900, color }}>{value ?? "—"}</AppText>
      <AppText variant="caption" color="text.secondary">{label}</AppText>
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function AdminNLP() {
  const { t, isRTL } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [params, setParams] = useState({ days: 30, n_keywords: 20, n_questions: 10, n_clusters: 5 });

  const runAnalysis = async () => {
    setLoading(true); setError(""); setResult(null); setCurrentStep(1);

    // Animation pipeline pendant le chargement
    let step = 1;
    const tick = setInterval(() => { step = step < 10 ? step + 1 : 1; setCurrentStep(step); }, 300);

    try {
      // React → POST /api/dashboard/nlp
      // Node.js récupère 500 msgs MongoDB → POST /dashboard/nlp Python
      const { data } = await api.post("/dashboard/nlp", {
        days: params.days,
        n_keywords: params.n_keywords,
        n_questions: params.n_questions,
        n_clusters: params.n_clusters,
        min_word_length: 4,
      });
      clearInterval(tick); setCurrentStep(11);
      setResult(data);
    } catch (err) {
      clearInterval(tick); setCurrentStep(0);
      if (err.response?.status === 503)
        setError("Service Python NLP hors ligne. Démarrez : uvicorn app:app --reload");
      else
        setError(err.response?.data?.message || "Erreur analyse NLP.");
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <AppText variant="h3" sx={{ fontWeight: 900 }}>{t("adminNLP.title")}</AppText>
          <AppText variant="body2" color="text.secondary">
            {t("adminNLP.subtitle")}
          </AppText>
        </Box>
        {result && (
          <Tooltip title={t("adminNLP.relaunch")} arrow>
            <IconButton onClick={runAnalysis} disabled={loading}
              sx={{ bgcolor: "background.blue", color: "primary.main" }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Pipeline visualizer */}
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <AppText variant="body2" sx={{ fontWeight: 800, color: "text.secondary" }}>
              {t("adminNLP.pipelineTitle")}
            </AppText>
            <Box sx={{ display: "flex", gap: 1 }}>
              {loading && <Chip label={t("adminNLP.running")} size="small"
                sx={{
                  bgcolor: "background.blue", color: "primary.dark", fontWeight: 700,
                  animation: "blink 1.2s ease infinite",
                  "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } }
                }} />}
              {currentStep === 11 && <Chip label={t("adminNLP.done")} size="small"
                sx={{ bgcolor: "#E6F7EE", color: "#276749", fontWeight: 700 }} />}
            </Box>
          </Box>
          <PipelineBar currentStep={currentStep} t={t} />
        </CardContent>
      </Card>

      {/* Params */}
      <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="flex-end">
            {[
              { label: t("adminNLP.periodLabel"), key: "days", opts: [[7, t("adminNLP.period7")], [30, t("adminNLP.period30")], [90, t("adminNLP.period90")], [0, t("adminNLP.periodAll")]] },
              { label: t("adminNLP.keywordsLabel"), key: "n_keywords", opts: [[10, "10"], [20, "20"], [30, "30"], [50, "50"]] },
              { label: t("adminNLP.clustersLabel"), key: "n_clusters", opts: [[3, "3"], [5, "5"], [7, "7"], [10, "10"]] },
            ].map(p => (
              <Grid item xs={12} sm={3} key={p.key}>
                <AppText variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5, display: "block" }}>{p.label}</AppText>
                <TextField select fullWidth size="small" value={params[p.key]}
                  onChange={e => setParams(pr => ({ ...pr, [p.key]: Number(e.target.value) }))}
                  InputProps={{ sx: { borderRadius: 3 } }}>
                  {p.opts.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} sm={3}>
              <AppButton fullWidth size="large" onClick={runAnalysis} loading={loading}
                startIcon={!loading && <BrainIcon />} sx={{ py: 1.4 }}>
                {loading ? t("adminNLP.analyzing") : t("adminNLP.launchBtn")}
              </AppButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={48} sx={{ color: "primary.main", mb: 2 }} />
          <AppText variant="h5" sx={{ mb: 0.5 }}>{t("adminNLP.analyzingInProgress")}</AppText>
          <AppText variant="body2" color="text.secondary">{t("adminNLP.pipelineDesc")}</AppText>
        </Box>
      )}

      {!loading && result && (
        <Box>
          {/* Meta chips */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
            <Chip label={`${result.total_messages_analyzed} ${t("adminNLP.analyzed")}`}
              sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 700 }} />
            <Chip label={result.period_days === "tout" ? t("adminNLP.periodAllHistory") : t("adminNLP.periodDays").replace("{{days}}", result.period_days)}
              sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 700 }} />
          </Box>

          {/* Stat cards */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Stat icon={<TextIcon />} label={t("adminNLP.avgMsgLen")} value={result.avg_msg_length} color="#3BBDE8" />
            <Stat icon={<TagIcon />} label={t("adminNLP.keywordsCount")} value={result.top_keywords?.length} color="#F5A623" />
            <Stat icon={<QIcon />} label={t("adminNLP.questionsCount")} value={result.top_questions?.length} color="#9F7AEA" />
            <Stat icon={<PieIcon />} label={t("adminNLP.topicsCount")} value={result.topic_clusters?.length} color="#48BB78" />
          </Box>

          <Grid container spacing={2.5}>
            {/* Word cloud */}
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <TagIcon sx={{ color: "primary.main" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.wordCloud")}</AppText>
                    <Chip label={`${t("adminNLP.steps")} 5–7`} size="small" sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 600, fontSize: "0.65rem" }} />
                  </Box>
                  <WordCloud words={result.word_cloud_data} t={t} />
                </CardContent>
              </Card>
            </Grid>

            {/* Sentiment donut */}
            <Grid item xs={12} md={5}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <DonutIcon sx={{ color: "#F5A623" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.sentiment")}</AppText>
                    <Chip label={`${t("adminNLP.steps")} 10`} size="small" sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 600, fontSize: "0.65rem" }} />
                  </Box>
                  <SentimentDonut data={result.sentiment} t={t} />
                </CardContent>
              </Card>
            </Grid>

            {/* Keywords bar chart */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <BarIcon sx={{ color: "#9F7AEA" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.topKeywords")}</AppText>
                    <Chip label={t("adminNLP.lemmatizationCounter")} size="small" sx={{ bgcolor: "#F3F0FF", color: "#805AD5", fontWeight: 600, fontSize: "0.62rem" }} />
                  </Box>
                  <KeywordsBars keywords={result.top_keywords} />
                </CardContent>
              </Card>
            </Grid>

            {/* Lang bar chart */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LangIcon sx={{ color: "#3BBDE8" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.langDist")}</AppText>
                    <Chip label={t("adminNLP.lingua")} size="small" sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 600, fontSize: "0.65rem" }} />
                  </Box>
                  <LangBars data={result.lang_distribution} />
                </CardContent>
              </Card>
            </Grid>

            {/* Topics pie chart */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <PieIcon sx={{ color: "#48BB78" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.topics")}</AppText>
                    <Chip label={t("adminNLP.tfidfKmeans").replace("{{clusters}}", "clustersParam")} size="small"
                      sx={{ bgcolor: "#E6F7EE", color: "#276749", fontWeight: 600, fontSize: "0.65rem" }} />
                  </Box>
                  <TopicsPie clusters={result.topic_clusters} t={t} clustersParam={params.n_clusters} />
                </CardContent>
              </Card>
            </Grid>

            {/* Top questions */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <QIcon sx={{ color: "#F5A623" }} />
                    <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("adminNLP.questions")}</AppText>
                    <Chip label={t("adminNLP.regexPatterns")} size="small"
                      sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 600, fontSize: "0.65rem" }} />
                  </Box>
                  {!result.top_questions?.length ? (
                    <AppText variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>
                      {t("adminNLP.noQuestionsDetected")}
                    </AppText>
                  ) : (
                    <Grid container spacing={1.5}>
                      {result.top_questions.slice(0, 10).map(({ question, count }, i) => (
                        <Grid item xs={12} md={6} key={i}>
                          <Box sx={{
                            display: "flex", gap: 1.5, p: 1.8, borderRadius: 2,
                            bgcolor: "background.subtle", border: "1px solid", borderColor: "divider",
                            transition: "all 0.15s",
                            "&:hover": { borderColor: "secondary.light", bgcolor: "background.orange" },
                          }}>
                            <Box sx={{
                              width: 24, height: 24, borderRadius: 1, flexShrink: 0,
                              bgcolor: i < 3 ? "secondary.main" : "background.blue",
                              color: i < 3 ? "white" : "primary.main",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.68rem", fontWeight: 900,
                            }}>{i + 1}</Box>
                            <AppText variant="caption" sx={{ flex: 1, color: "text.primary", lineHeight: 1.5 }}>
                              {question.length > 90 ? question.slice(0, 90) + "…" : question}
                            </AppText>
                            <Chip label={`×${count}`} size="small"
                              sx={{
                                height: 18, fontSize: "0.62rem", bgcolor: "background.blue",
                                color: "primary.dark", fontWeight: 800, flexShrink: 0
                              }} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* État initial */}
      {!loading && !result && !error && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <BrainIcon sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.35 }} />
          <AppText variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{t("adminNLP.ready")}</AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb: 0.5, maxWidth: 520, mx: "auto" }}>
            {t("adminNLP.readyDescFull")}
          </AppText>
          <AppText variant="caption" color="text.disabled" sx={{ display: "block", mb: 4 }}>
            {t("adminNLP.visualizations")}
          </AppText>
          <AppButton size="large" startIcon={<BrainIcon />} onClick={runAnalysis}>{t("adminNLP.launchBtn")}</AppButton>
        </Box>
      )}
    </AdminLayout>
  );
}