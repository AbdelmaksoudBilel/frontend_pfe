// src/pages/DiagnosticPage.jsx
// =============================================================================
// Page Diagnostic — accessible aux parents via /diagnostic/:childId
// Accessible depuis : ProfilePage → onglet Enfants → bouton Diagnostic
//
// Affiche :
//  - Profil estimé (TSA / RM / MIXTE / Normal) + confiance
//  - Probabilités modèles : XGBoost (ML) + MobileNetV2 (CNN) + Late Fusion
//  - Score Isolation Forest (DI)
//  - Réponses Q-Chat-10 brutes
//  - profileDetected (observations IA)
//  - Bouton relancer l'analyse → GET /api/children/:id/predict
// =============================================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Avatar, Chip, LinearProgress,
  CircularProgress, Alert, Divider, Tooltip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Psychology as BrainIcon,
  CameraAlt as CnnIcon,
  MergeType as FusionIcon,
  BarChart as ForestIcon,
  Refresh as RefreshIcon,
  WarningAmber as WarnIcon,
  CheckCircle as OkIcon,
  InfoOutlined as InfoIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

import AppText from "../components/atoms/AppText";
import AppButton from "../components/atoms/AppButton";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

// ── Profil config ─────────────────────────────────────────────────────────────
const PROFILE_CFG = {
  TSA   : { color: "#3BBDE8", bg: "#EBF7FE", icon: <ExtensionOutlinedIcon  sx={{ color: "#3BBDE8", fontSize: 100 }} /> },
  RM    : { color: "#F5A623", bg: "#FFF8EE", icon: <LibraryBooksOutlinedIcon sx={{ color: "#F5A623", fontSize: 100 }} /> },
  MIXTE : { color: "#9F7AEA", bg: "#F3F0FF", icon: <PeopleOutlinedIcon sx={{ color: "#9F7AEA", fontSize: 100 }} /> },
  Normal: { color: "#48BB78", bg: "#E6F7EE", icon: <CheckCircleOutlinedIcon sx={{ color: "#48BB78", fontSize: 100 }} /> },
};

// ── Q-Chat questions labels ────────────────────────────────────────────────────
const QCHAT_LABELS = {
  fr: [
    "Répond quand appelé",
    "Contact visuel",
    "Pointe pour demander",
    "Pointe pour partager",
    "Jeu symbolique",
    "Suit le regard",
    "Réconforte autrui",
    "Premiers mots typiques",
    "Gestes simples",
    "Regarde dans le vide",
  ],
  en: [
    "Responds when called",
    "Eye contact",
    "Points to request",
    "Points to share",
    "Pretend play",
    "Follows gaze",
    "Comforts others",
    "Typical first words",
    "Simple gestures",
    "Stares into space",
  ],
  ar: [
    "يستجيب عند النداء",
    "التواصل البصري",
    "يشير للطلب",
    "يشير للمشاركة",
    "اللعب التخيلي",
    "يتابع النظرة",
    "يواسي الآخرين",
    "الكلمات الأولى طبيعية",
    "إيماءات بسيطة",
    "يحدق في الفراغ",
  ],
};

// ── Probability bar ───────────────────────────────────────────────────────────
function ProbBar({ label, value, color, icon, tooltip }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
          <AppText variant="body2" sx={{ fontWeight: 700 }}>{label}</AppText>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <InfoIcon sx={{ fontSize: 15, color: "text.disabled", cursor: "help" }} />
            </Tooltip>
          )}
        </Box>
        <AppText variant="h5" sx={{ color, fontWeight: 900 }}>{pct}%</AppText>
      </Box>
      <LinearProgress variant="determinate" value={pct}
        sx={{
          height: 12, borderRadius: 6, bgcolor: "#f0f4f8",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 6, transition: "width 1s ease" },
        }}
      />
    </Box>
  );
}

// ── Q-Chat item ───────────────────────────────────────────────────────────────
function QChatItem({ index, rawValue, binaryValue, lang, t }) {
  const labels    = QCHAT_LABELS[lang] || QCHAT_LABELS.fr;
  const label     = labels[index] || `A${index + 1}`;
const answerMap = t("diagnostic.qchatAnswers")?.[lang];
const answer    = answerMap?.[rawValue] ?? rawValue;
  const isFlag    = binaryValue === 1;

  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: 1.2, px: 2, borderBottom: "1px solid", borderColor: "#f0f4f8",
      "&:hover": { bgcolor: "background.subtle" },
      borderLeft: `3px solid ${isFlag ? "#F56565" : "#48BB78"}`,
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 24, height: 24, borderRadius: 1,
          bgcolor: isFlag ? "#FFF5F5" : "#E6F7EE",
          color: isFlag ? "#F56565" : "#48BB78",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: "0.7rem", flexShrink: 0,
        }}>
          A{index + 1}
        </Box>
        <AppText variant="caption" sx={{ color: "text.primary", fontWeight: 600 }}>{label}</AppText>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <AppText variant="caption" sx={{ color: "text.secondary" }}>{answer}</AppText>
        <Chip
          label={isFlag ? (lang === "ar" ? "مشار إليه" : lang === "en" ? "Flagged" : "Signalé") : (lang === "ar" ? "طبيعي" : lang === "en" ? "Normal" : "Normal")}
          size="small"
          sx={{
            bgcolor: isFlag ? "#FFF5F5" : "#E6F7EE",
            color: isFlag ? "#F56565" : "#48BB78",
            fontWeight: 700, fontSize: "0.65rem", height: 18,
          }}
        />
      </Box>
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
export default function DiagnosticPage() {
  const { childId } = useParams();
  const navigate    = useNavigate();
  const { t, lang, isRTL } = useTranslation();

  const [child,     setChild]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/children/${childId}`);
      setChild(data);
    } catch { setError(t("errors.notFound")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [childId]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.get(`/children/${childId}/predict`);
      setChild(data);
    } catch (err) {
      if (err.response?.status === 503) setError("Service IA hors ligne.");
      else setError(t("errors.serverError"));
    } finally { setAnalyzing(false); }
  };

  const cfg = PROFILE_CFG[child?.prediction] || null;
  const age = child?.birthDate
    ? Math.floor((Date.now() - new Date(child.birthDate)) / (365.25 * 24 * 3600 * 1000))
    : null;

  const qchatScore = child?.QChatScore;
  const flaggedCount = [child?.A1, child?.A2, child?.A3, child?.A4, child?.A5,
    child?.A6, child?.A7, child?.A8, child?.A9, child?.A10].filter(v => v === 1).length;

  if (loading) return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)" }}>
      <CircularProgress size={48} sx={{ color: "primary.main" }} />
    </Box>
  );

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 50%, #FFF8EE 100%)",
      px: { xs: 2, sm: 3, md: 6 }, py: 4,
    }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <AppButton variant="outlined" color="secondary" size="small"
            startIcon={<BackIcon />} onClick={() => navigate("/profile")}>
            {t("profile.backToChat")}
          </AppButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {child && (
          <>
            {/* ── Card enfant ── */}
            <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                  {/* Photo */}
                  {child.facePhotoUrl ? (
                    <Avatar src={`${BASE_URL}${child.facePhotoUrl}`}
                      sx={{ width: 80, height: 80, border: "3px solid", borderColor: cfg?.color || "divider" }} />
                  ) : (
                    <Avatar sx={{ width: 80, height: 80, bgcolor: cfg?.bg || "background.blue",
                      color: cfg?.color || "primary.main", fontSize: 28, fontWeight: 900 }}>
                      {child.firstName?.[0]}
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <AppText variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {child.firstName} {child.lastName}
                    </AppText>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      <AppText variant="body2" color="text.secondary">
                        {age !== null ? `${age} ${t("child.age")} · ` : ""}
                        {child.gender === "M" ? t("child.boy") : t("child.girl")}
                      </AppText>
                      {qchatScore !== null && qchatScore !== undefined && (
                        <Chip label={`Q-Chat: ${qchatScore}/10`} size="small"
                          sx={{ bgcolor: qchatScore >= 3 ? "#FFF8EE" : "#E6F7EE",
                            color: qchatScore >= 3 ? "#F5A623" : "#48BB78", fontWeight: 700 }} />
                      )}
                    </Box>
                  </Box>
                  {/* Bouton relancer analyse */}
                  <AppButton size="small" variant="outlined" startIcon={<RefreshIcon />}
                    loading={analyzing} onClick={runAnalysis}>
                    {t("diagnostic.runAnalysis")}
                  </AppButton>
                </Box>

                {/* Dernière analyse */}
                {child.lastPredictionAt && (
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.8 }}>
                    <TimelineIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                    <AppText variant="caption" color="text.disabled">
                      {t("diagnostic.lastAnalysis")} : {new Date(child.lastPredictionAt).toLocaleDateString(
                        lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </AppText>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* ── Résultat principal ── */}
            {child.prediction ? (
              <>
                <Card elevation={0} sx={{
                  border: `2px solid ${cfg?.color}`,
                  borderRadius: 4, mb: 3,
                  background: `linear-gradient(135deg, ${cfg?.bg} 0%, white 100%)`,
                }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                    <Box sx={{ fontSize: 56, mb: 1 }}>{cfg?.icon}</Box>
                    <Chip label={child.prediction}
                      sx={{ bgcolor: cfg?.color, color: "white", fontWeight: 900,
                        fontSize: "0.95rem", px: 2, height: 34, mb: 2 }} />
                    <AppText variant="h3" sx={{ color: cfg?.color, fontWeight: 900, mb: 0.8 }}>
                      {t(`diagnostic.profileLabels.${child.prediction}`)}
                    </AppText>
                    {child.confidence !== null && child.confidence !== undefined && (
                      <Box sx={{ maxWidth: 280, mx: "auto", mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                          <AppText variant="caption" color="text.secondary">{t("diagnostic.globalConf")}</AppText>
                          <AppText variant="caption" sx={{ fontWeight: 900, color: cfg?.color }}>
                            {Math.round(child.confidence * 100)}%
                          </AppText>
                        </Box>
                        <LinearProgress variant="determinate" value={Math.round(child.confidence * 100)}
                          sx={{ height: 12, borderRadius: 6,
                            bgcolor: `${cfg?.color}30`,
                            "& .MuiLinearProgress-bar": { bgcolor: cfg?.color } }} />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* ── Détails modèles ── */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  {/* XGBoost ML */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: "1.5px solid #3BBDE8", borderRadius: 3, height: "100%" }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <BrainIcon sx={{ color: "#3BBDE8", fontSize: 22 }} />
                          <AppText variant="body2" sx={{ fontWeight: 800 }}>{t("diagnostic.mlModel")}</AppText>
                        </Box>
                        <ProbBar label={t("diagnostic.probTSA")} value={child.probMl}
                          color="#3BBDE8" icon={<BrainIcon sx={{ fontSize: 16 }} />}
                          tooltip="AUC = 1.00 sur le jeu de test" />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* MobileNetV2 CNN */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: "1.5px solid #9F7AEA", borderRadius: 3, height: "100%" }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <CnnIcon sx={{ color: "#9F7AEA", fontSize: 22 }} />
                          <AppText variant="body2" sx={{ fontWeight: 800 }}>{t("diagnostic.cnnModel")}</AppText>
                        </Box>
                        <ProbBar label={t("diagnostic.probTSA")} value={child.probCnn}
                          color="#9F7AEA" icon={<CnnIcon sx={{ fontSize: 16 }} />}
                          tooltip="AUC = 0.90 sur le jeu de test" />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Isolation Forest DI */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: "1.5px solid #F5A623", borderRadius: 3, height: "100%" }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <ForestIcon sx={{ color: "#F5A623", fontSize: 22 }} />
                          <AppText variant="body2" sx={{ fontWeight: 800 }}>{t("diagnostic.rmModel")}</AppText>
                        </Box>
                        <ProbBar label={t("diagnostic.scoreAnomaly")} value={child.scoreAnomalie}
                          color="#F5A623" icon={<ForestIcon sx={{ fontSize: 16 }} />}
                          tooltip="AUC = 0.9981 sur le jeu de test" />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Late Fusion */}
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3 }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <FusionIcon sx={{ color: "#48BB78", fontSize: 22 }} />
                          <AppText variant="body2" sx={{ fontWeight: 800 }}>{t("diagnostic.fusionModel")}</AppText>
                          <Tooltip title="logit(P) = 0.556×logit(ML) + 0.444×logit(CNN) → sigmoid">
                            <InfoIcon sx={{ fontSize: 16, color: "text.disabled", cursor: "help" }} />
                          </Tooltip>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <ProbBar label={t("diagnostic.probTSA")} value={child.probTsa}
                              color="#48BB78" icon={<FusionIcon sx={{ fontSize: 16 }} />} />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              {[["w_ML","0.556","#3BBDE8"],["w_CNN","0.444","#9F7AEA"]].map(([l,v,c]) => (
                                <Box key={l} sx={{ flex: 1, textAlign: "center", p: 1.5, borderRadius: 2, bgcolor: "background.subtle" }}>
                                  <AppText variant="caption" color="text.disabled">{l}</AppText>
                                  <AppText variant="h5" sx={{ color: c, fontWeight: 900 }}>{v}</AppText>
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 4, mb: 3, textAlign: "center" }}>
                <CardContent sx={{ py: 6 }}>
                  <BrainIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
                  <AppText variant="h5" sx={{ mb: 1 }}>{t("diagnostic.noAnalysis")}</AppText>
                  <AppText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {lang === "ar" ? "انقر على زر التحليل لمعرفة النتائج" :
                     lang === "en" ? "Click the analysis button to see results" :
                     "Cliquez sur le bouton d'analyse pour voir les résultats"}
                  </AppText>
                  <AppButton startIcon={<RefreshIcon />} loading={analyzing} onClick={runAnalysis}>
                    {t("diagnostic.runAnalysis")}
                  </AppButton>
                </CardContent>
              </Card>
            )}

            {/* ── Q-Chat-10 ── */}
            <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <AppText variant="h5" sx={{ fontWeight: 800 }}>{t("diagnostic.qchatSection")}</AppText>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label={`Score: ${qchatScore ?? "—"}/10`} size="small"
                      sx={{ bgcolor: qchatScore >= 3 ? "#FFF8EE" : "#E6F7EE",
                        color: qchatScore >= 3 ? "#F5A623" : "#48BB78", fontWeight: 700 }} />
                    <Chip label={`${flaggedCount} signalé${flaggedCount > 1 ? "s" : ""}`} size="small"
                      sx={{ bgcolor: "#FFF5F5", color: "#F56565", fontWeight: 700 }} />
                  </Box>
                </Box>
                <Divider sx={{ mb: 0 }} />
                {["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10"].map((key, i) => (
                  child[`${key}_raw`] !== null && child[`${key}_raw`] !== undefined ? (
                    <QChatItem
                      key={key}
                      index={i}
                      rawValue={child[`${key}_raw`]}
                      binaryValue={child[key]}
                      lang={lang}
                      t={t}
                    />
                  ) : null
                ))}
                {qchatScore >= 3 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "#FFF8EE", borderRadius: 2,
                    border: "1px solid", borderColor: "#FEEBCB",
                    display: "flex", gap: 1.5 }}>
                    <WarnIcon sx={{ color: "#F5A623", fontSize: 18, flexShrink: 0, mt: 0.2 }} />
                    <AppText variant="caption" sx={{ color: "#744210" }}>
                      {lang === "ar"
                        ? `نتيجة Q-Chat = ${qchatScore}/10 — وجود سمات توحد محتملة. هذا لا يعني تشخيصاً طبياً.`
                        : lang === "en"
                        ? `Q-Chat score = ${qchatScore}/10 — Potential autistic traits detected. This is not a medical diagnosis.`
                        : `Score Q-Chat = ${qchatScore}/10 — Traits autistiques potentiels détectés. Ce n'est pas un diagnostic médical.`
                      }
                    </AppText>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* ── ProfileDetected ── */}
            {child.profileDetected?.length > 0 && (
              <Card elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 4, mb: 3 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <AppText variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {t("diagnostic.profileDetected")}
                  </AppText>
                  <AppText variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    {t("diagnostic.profileDetectedDesc")}
                  </AppText>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {child.profileDetected.map((obs, i) => (
                      <Chip key={i} label={obs} size="small"
                        sx={{ bgcolor: "background.blue", color: "primary.dark", fontWeight: 600 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── Note médicale ── */}
            <Card elevation={0} sx={{ border: "1.5px solid #FED7D7", borderRadius: 3, bgcolor: "#FFF5F5" }}>
              <CardContent sx={{ p: 2.5, display: "flex", gap: 1.5 }}>
                <WarnIcon sx={{ color: "#F56565", flexShrink: 0, mt: 0.2 }} />
                <AppText variant="caption" sx={{ color: "#742A2A", lineHeight: 1.7 }}>
                  <strong>
                    {lang === "ar" ? "ملاحظة طبية مهمة : " : lang === "en" ? "Important medical note: " : "Note médicale importante : "}
                  </strong>
                  {t("diagnostic.medicalNote")}
                </AppText>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}
