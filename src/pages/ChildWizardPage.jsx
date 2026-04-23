// src/pages/ChildWizardPage.jsx — COMPLET + TRADUIT
// Étapes :
//   1. Infos de base + photo CNN
//   2. Q-Chat-10
//   3. Variables comportementales (jaundice, familyMem, whoCompleted, SRS,
//      speechDelay, learning, genetic, depression, globalDelay,
//      socialBehav, anxiety, CARS) — TOUTES les variables manquantes ajoutées
//   4. DS Survey RM (PR_AGE1, PR_Q3D, communication, mobilité, santé, comportement, soutien)
//      PR_QN1_A retiré du formulaire : il est injecté automatiquement par Python
//      selon le résultat TSA (tsa_detected → PR_QN1_A=2, sinon PR_QN1_A=0)
//   5. Résultats

import { useState, useRef } from "react";
import { useNavigate }      from "react-router-dom";
import {
  Box, Grid, Paper, Stepper, Step, StepLabel, StepConnector,
  TextField, MenuItem, LinearProgress, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Divider, Chip,
  Tooltip, CircularProgress, Alert, useMediaQuery, useTheme,
} from "@mui/material";
import { styled }          from "@mui/material/styles";
import ChildCareIcon       from "@mui/icons-material/ChildCare";
import PhotoCameraIcon     from "@mui/icons-material/PhotoCamera";
import DeleteIcon          from "@mui/icons-material/Delete";
import ArrowForwardIcon    from "@mui/icons-material/ArrowForward";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon    from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";
import PsychologyIcon      from "@mui/icons-material/Psychology";
import MergeTypeIcon       from "@mui/icons-material/MergeType";
import CameraAltIcon       from "@mui/icons-material/CameraAlt";
import ChatIcon            from "@mui/icons-material/Chat";

import AppButton          from "../components/atoms/AppButton";
import AppText            from "../components/atoms/AppText";
import api                from "../services/api";
import { useAuth }        from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import logo               from "../assets/logo.png";

// ─────────────────────────────────────────────────────────────────
// Q-CHAT-10 questions (labels traduits via t("wizard.ds.*"))
// ─────────────────────────────────────────────────────────────────
const QCHAT_FR = [
  { id:"A1",  opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"],
    fr:"Est-ce que votre enfant vous regarde lorsque vous l'appelez ?",
    en:"Does your child look at you when you call their name?",
    ar:"هل ينظر طفلك إليك عندما تناديه؟" },
  { id:"A2",  opts:["Très facile","Plutôt facile","Plutôt difficile","Très difficile","Impossible"],
    fr:"À quel point est-ce facile d'avoir un contact visuel avec votre enfant ?",
    en:"How easy is it to make eye contact with your child?",
    ar:"ما مدى سهولة إجراء تواصل بصري مع طفلك؟" },
  { id:"A3",  opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant pointe pour indiquer ce qu'il veut avoir ?",
    en:"Does your child point to indicate something they want?",
    ar:"هل يشير طفلك للدلالة على ما يريده؟" },
  { id:"A4",  opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant pointe pour attirer votre attention sur quelque chose ?",
    en:"Does your child point to share interest in something?",
    ar:"هل يشير طفلك لجذب انتباهك لشيء ما؟" },
  { id:"A5",  opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant joue à faire semblant ? (poupées, téléphone jouet…)",
    en:"Does your child engage in pretend play? (dolls, toy phone…)",
    ar:"هل يمارس طفلك اللعب التخيلي؟ (دمى، هاتف لعبة...)" },
  { id:"A6",  opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant regarde dans la direction que vous regardez ?",
    en:"Does your child follow your gaze?",
    ar:"هل يتابع طفلك نظرك في نفس الاتجاه؟" },
  { id:"A7",  opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"],
    fr:"Si quelqu'un de votre famille est triste, est-ce que votre enfant le réconforte ?",
    en:"If someone in your family is sad, does your child try to comfort them?",
    ar:"إذا كان أحد أفراد عائلتك حزيناً، هل يحاول طفلك تعزيته؟" },
  { id:"A8",  opts:["Très typique","Plutôt typique","Légèrement inhabituel","Très inhabituel","Mon enfant ne parle pas"],
    fr:"Est-ce que les premiers mots de votre enfant étaient :",
    en:"Were your child's first words:",
    ar:"هل كانت الكلمات الأولى لطفلك:" },
  { id:"A9",  opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant utilise spontanément des gestes simples ? (saluer de la main…)",
    en:"Does your child spontaneously use simple gestures? (wave goodbye…)",
    ar:"هل يستخدم طفلك إيماءات بسيطة بشكل تلقائي؟ (لوّح بيده...)" },
  { id:"A10", opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    fr:"Est-ce que votre enfant regarde fixement dans le vide, sans but apparent ?",
    en:"Does your child stare into space without apparent purpose?",
    ar:"هل يحدق طفلك في الفراغ بدون هدف واضح؟",
    isA10: true },
];

function calcQChat(raw) {
  return QCHAT_FR.reduce((s, q) => {
    const v = raw[q.id];
    if (v === null || v === undefined) return s;
    return s + (q.isA10 ? (v <= 2 ? 1 : 0) : (v >= 2 ? 1 : 0));
  }, 0);
}

const PROFILE_CFG = {
  TSA   : { color:"#3BBDE8", bg:"#EBF7FE", icon:"🧠" },
  RM    : { color:"#F5A623", bg:"#FFF8EE", icon:"📚" },
  MIXTE : { color:"#9F7AEA", bg:"#F3F0FF", icon:"🔀" },
  Normal: { color:"#48BB78", bg:"#E6F7EE", icon:"✅" },
};

const Connector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": { borderColor: theme.palette.divider, borderTopWidth: 2 },
}));

// ── RadioBlock générique ──────────────────────────────────────────
function RadioBlock({ label, value, onChange, opts, error, row }) {
  return (
    <Box sx={{ mb:2.5, pb:2.5, borderBottom:"1px solid", borderColor:"divider" }}>
      <FormControl component="fieldset" error={!!error} fullWidth>
        <FormLabel sx={{ mb:1, fontSize:"0.88rem", fontWeight:600, color:"text.primary", lineHeight:1.6 }}>
          {label}
        </FormLabel>
        <RadioGroup row={row && opts.length <= 3} value={value ?? ""} onChange={e => onChange(Number(e.target.value))}>
          {opts.map((opt, i) => (
            <FormControlLabel key={i} value={i}
              control={<Radio size="small" sx={{ "&.Mui-checked":{ color:"primary.main" } }} />}
              label={<AppText variant="caption" sx={{ fontSize:"0.82rem" }}>{opt}</AppText>}
              sx={{ mb:0.2, borderRadius:2, px:1, transition:"background 0.15s", bgcolor: value === i ? "background.blue" : "transparent" }}
            />
          ))}
        </RadioGroup>
        {error && <AppText variant="caption" sx={{ color:"error.main" }}>{error}</AppText>}
      </FormControl>
    </Box>
  );
}

// ── SectionChip ───────────────────────────────────────────────────
function SectionChip({ label, color="primary" }) {
  return (
    <Divider sx={{ my:2.5 }}>
      <Chip label={label} size="small"
        sx={{ bgcolor: color==="secondary" ? "background.orange" : "background.blue",
              color:   color==="secondary" ? "secondary.dark"   : "primary.dark",
              fontWeight:700, fontSize:"0.72rem" }} />
    </Divider>
  );
}

// ── ProbBar ───────────────────────────────────────────────────────
function ProbBar({ label, value, color, icon, tooltip }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Box sx={{ mb:2.5 }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:0.8 }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <AppText variant="body2" sx={{ fontWeight:700 }}>{label}</AppText>
          {tooltip && <Tooltip title={tooltip} arrow><InfoOutlinedIcon sx={{ fontSize:15, color:"text.disabled", cursor:"help" }} /></Tooltip>}
        </Box>
        <AppText variant="h5" sx={{ color, fontWeight:900 }}>{pct}%</AppText>
      </Box>
      <LinearProgress variant="determinate" value={pct}
        sx={{ height:10, borderRadius:8, bgcolor:"#f0f4f8", "& .MuiLinearProgress-bar":{ bgcolor:color, borderRadius:8 } }} />
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════
export default function ChildWizardPage() {
  const navigate   = useNavigate();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down("md"));
  const { user }   = useAuth();
  const { t, lang, isRTL } = useTranslation();

  const STEPS_LABELS = [
    t("wizard.step1"), t("wizard.step2"), t("wizard.step3"),
    t("wizard.step4"), t("wizard.step5"),
  ];
  const TOTAL_STEPS = STEPS_LABELS.length;

  const [step,      setStep]      = useState(0);
  const [fieldErr,  setFieldErr]  = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const photoRef = useRef(null);

  // ── Form state ────────────────────────────────────────────────
  const [info,  setInfo]  = useState({ firstName:"", lastName:"", birthDate:"", gender:"" });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [qchat, setQchat] = useState(Object.fromEntries(QCHAT_FR.map(q => [q.id, null])));

  // Variables comportementales supplémentaires
  const [behav, setBehav] = useState({
    jaundice: null, familyMemWithASD: null, whoCompletedTest: null,
    speechDelayDisorder: null, learningDisorder: null, geneticDisorders: null,
    depression: null, globalDevelopmentalDelay: null, socialBehaviouralIssues: null,
    anxietyDisorder: null,
  });

  // DS Survey RM — PR_QN1_A EXCLU (injecté automatiquement par Python)
  const [ds, setDs] = useState({
    PR_AGE1:null, PR_Q3D:null,
    PR_QF1A:null, PR_QG1A:null,
    PR_QH1A:null, PR_QH1B:null,
    PR_QI1:null,  PR_QJ1:null, PR_QK1:null, PR_QQ:null,
    // PR_QN1_A ABSENT — injecté par Python après TSA
    PR_QN1_B:null, PR_QN1_C:null, PR_QN1_D:null, PR_QN1_E:null,
    PR_QN1_F:null, PR_QN1_G:null, PR_QN1_H:null,
    PR_QO1_A_COMBINE:null, PR_QO1_B_COMBINE:null, PR_QO1_C_COMBINE:null,
    PR_QO1_D_COMBINE:null, PR_QO1_E_COMBINE:null,
  });

  // ── Photo ─────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFieldErr(fe=>({...fe,photo:"Format image requis (JPG/PNG)"})); return; }
    if (file.size > 5*1024*1024)         { setFieldErr(fe=>({...fe,photo:"Taille max 5 MB"}));              return; }
    setPhoto(file); setPhotoPreview(URL.createObjectURL(file));
    setFieldErr(fe=>({...fe,photo:""}));
  };

  // ── Validations ───────────────────────────────────────────────
  const validateStep0 = () => {
    const e = {};
    if (!info.firstName.trim()) e.firstName = t("wizard.required");
    if (!info.lastName.trim())  e.lastName  = t("wizard.required");
    if (!info.birthDate)        e.birthDate  = t("wizard.required");
    if (!info.gender)           e.gender     = t("wizard.required");
    if (!photo)                 e.photo      = t("wizard.required");
    setFieldErr(e); return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e = {};
    QCHAT_FR.forEach(q => { if (qchat[q.id] === null) e[q.id] = t("wizard.required"); });
    setFieldErr(e); return !Object.keys(e).length;
  };

  const validateStep3 = () => {
    const e = {};
    const required = ["PR_AGE1","PR_Q3D","PR_QF1A","PR_QG1A","PR_QH1A","PR_QH1B",
      "PR_QI1","PR_QJ1","PR_QK1","PR_QQ",
      "PR_QN1_B","PR_QN1_C","PR_QN1_D","PR_QN1_E","PR_QN1_F","PR_QN1_G","PR_QN1_H",
      "PR_QO1_A_COMBINE","PR_QO1_B_COMBINE","PR_QO1_C_COMBINE","PR_QO1_D_COMBINE","PR_QO1_E_COMBINE"];
    required.forEach(k => { if (ds[k] === null) e[k] = t("wizard.required"); });
    setFieldErr(e); return !Object.keys(e).length;
  };

  // ── Navigation ────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    if (step === 3) { handleSubmit(); return; }
    setStep(s => s+1);
  };

  // ── Soumission ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true); setSubmitErr(""); setStep(4);

    try {
      const fd = new FormData();
      fd.append("firstName", info.firstName.trim());
      fd.append("lastName",  info.lastName.trim());
      fd.append("birthDate", info.birthDate);
      fd.append("gender",    info.gender);
      if (photo) fd.append("facePhoto", photo);

      // Q-Chat binaire + brut
      const qchatScore = calcQChat(qchat);
      QCHAT_FR.forEach(q => {
        const bin = q.isA10 ? (qchat[q.id] <= 2 ? 1 : 0) : (qchat[q.id] >= 2 ? 1 : 0);
        fd.append(q.id, bin);
        fd.append(`${q.id}_raw`, qchat[q.id]);
      });
      fd.append("QChatScore", qchatScore);

      // Variables comportementales
      Object.entries(behav).forEach(([k, v]) => fd.append(k, v));

      // DS Survey — ENCODAGE DIFFÉRENT selon le champ MongoDB :
      //
      // Groupe A — min:1 dans MongoDB → RadioGroup 0-based → envoyer v+1
      //   PR_AGE1, PR_Q3D, PR_QF1A, PR_QG1A, PR_QH1A, PR_QH1B,
      //   PR_QI1, PR_QJ1, PR_QK1, PR_QQ, PR_QO1_*_COMBINE
      //
      // Groupe B — min:0 dans MongoDB → RadioGroup 0-based → envoyer v tel quel (NO +1)
      //   PR_QN1_B, PR_QN1_C, PR_QN1_D, PR_QN1_E, PR_QN1_F, PR_QN1_G, PR_QN1_H
      //   (schema: { min: 0, max: 2 } où 0=Non, 1=Oui non-diag, 2=Oui diag)

      // Champs 0-indexed (min:0 dans MongoDB) — NE PAS ajouter +1
      const DS_ZERO_INDEXED = new Set([
        "PR_QN1_B","PR_QN1_C","PR_QN1_D","PR_QN1_E",
        "PR_QN1_F","PR_QN1_G","PR_QN1_H",
      ]);

      Object.entries(ds).forEach(([k, v]) => {
        if (DS_ZERO_INDEXED.has(k)) {
          // Groupe B : valeur brute (0, 1 ou 2)
          fd.append(k, v ?? 0);
        } else {
          // Groupe A : valeur + 1 (RadioGroup 0-based → MongoDB 1-based)
          fd.append(k, (v ?? 0) + 1);
        }
      });

      // PR_QN1_A = 0 par défaut (sera remplacé automatiquement par Python
      // après calcul TSA : tsa_detected → 2, sinon → 0)
      fd.append("PR_QN1_A", 0);

      const childRes = await api.post("/children", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      const childId  = childRes.data._id || childRes.data.id;

      const predRes = await api.get(`/children/${childId}/predict`);
      const pred    = predRes.data;

      setResult({
        child      : childRes.data,
        prediction : pred.prediction,
        prob_ml    : pred.probMl,
        prob_cnn   : pred.probCnn,
        prob_tsa   : pred.probTsa,
        score_anomalie: pred.scoreAnomalie,
        confidence : pred.confidence,
        childId,
      });
    } catch (err) {
      const msg = err.response?.status === 503
        ? t("errors.iaOffline")
        : err.response?.data?.message || t("errors.serverError");
      setSubmitErr(msg);
    } finally { setLoading(false); }
  };

  const cfg = result ? (PROFILE_CFG[result.prediction] || PROFILE_CFG.Normal) : null;
  const age = info.birthDate
    ? Math.floor((Date.now() - new Date(info.birthDate)) / (365.25*24*3600*1000))
    : null;
  const qchatScore   = calcQChat(qchat);
  const qchatAnswered = QCHAT_FR.filter(q => qchat[q.id] !== null).length;

  // ── Q-Chat question label selon la langue ─────────────────────
  const qLabel = (q) => q[lang] || q.fr;

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ minHeight:"100vh", background:"linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)", px:{ xs:2, sm:4, md:8 }, py:5 }}>
      <Box sx={{ maxWidth:720, mx:"auto" }}>

        {/* Logo + titre */}
        <Box sx={{ textAlign:"center", mb:4 }}>
          <img width={150} src={logo} alt="Logo" style={{ display:"block", margin:"0 auto 12px" }} />
          <AppText variant="h4" sx={{ fontWeight:900 }}>{t("wizard.title")}</AppText>
          {user?.firstName && (
            <AppText variant="body2" color="text.secondary">{t("wizard.welcome")} <strong>{user.firstName}</strong> — {t("wizard.welcomeMsg")}</AppText>
          )}
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} connector={<Connector />} alternativeLabel sx={{ mb:2 }}>
          {STEPS_LABELS.map((label, i) => (
            <Step key={i} completed={i < step}>
              <StepLabel sx={{ "& .MuiStepLabel-label":{ fontSize:"0.72rem", fontWeight:600 }, "& .MuiStepIcon-root.Mui-active":{ color:"primary.main" }, "& .MuiStepIcon-root.Mui-completed":{ color:"success.main" } }}>
                {!isMobile && label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <LinearProgress variant="determinate" value={(step / (TOTAL_STEPS-1)) * 100}
          sx={{ mb:3, height:5, borderRadius:8, bgcolor:"background.blue", "& .MuiLinearProgress-bar":{ bgcolor:"primary.main" } }} />

        <Paper elevation={2} sx={{ borderRadius:4, border:"1.5px solid", borderColor:"divider", p:{ xs:3, md:5 } }}>

          {/* ════ ÉTAPE 0 — Infos + photo ════ */}
          {step === 0 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>👤 {t("wizard.step1Title")}</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>{t("wizard.step1Desc")}</AppText>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t("wizard.firstName")} value={info.firstName}
                    onChange={e=>{setInfo(i=>({...i,firstName:e.target.value}));setFieldErr(fe=>({...fe,firstName:""}))}}
                    error={!!fieldErr.firstName} helperText={fieldErr.firstName}
                    InputProps={{ startAdornment:<Box sx={{ mr:1, color:"text.disabled", display:"flex" }}><ChildCareIcon fontSize="small"/></Box> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t("wizard.lastName")} value={info.lastName}
                    onChange={e=>{setInfo(i=>({...i,lastName:e.target.value}));setFieldErr(fe=>({...fe,lastName:""}))}}
                    error={!!fieldErr.lastName} helperText={fieldErr.lastName} />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField fullWidth label={t("wizard.birthDate")} type="date" value={info.birthDate}
                    onChange={e=>{setInfo(i=>({...i,birthDate:e.target.value}));setFieldErr(fe=>({...fe,birthDate:""}))}}
                    error={!!fieldErr.birthDate} helperText={fieldErr.birthDate} InputLabelProps={{ shrink:true }} />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth select label={t("wizard.gender")} value={info.gender}
                    onChange={e=>{setInfo(i=>({...i,gender:e.target.value}));setFieldErr(fe=>({...fe,gender:""}))}}
                    error={!!fieldErr.gender} helperText={fieldErr.gender}>
                    <MenuItem value="M">👦 {t("wizard.boy")}</MenuItem>
                    <MenuItem value="F">👧 {t("wizard.girl")}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ mb:2.5 }}>
                    <Chip label={t("wizard.photoTitle")} size="small" sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700, fontSize:"0.72rem" }} />
                  </Divider>
                  <Box sx={{ p:2.5, bgcolor:"background.subtle", borderRadius:3, border:"1px solid", borderColor: fieldErr.photo ? "error.main" : "divider" }}>
                    <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.5, mb:2 }}>
                      <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, mt:0.2, flexShrink:0 }} />
                      <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>{t("wizard.photoHint")}</AppText>
                    </Box>
                    {photoPreview ? (
                      <Box sx={{ display:"flex", alignItems:"center", gap:2.5 }}>
                        <Box component="img" src={photoPreview} sx={{ width:100, height:100, borderRadius:3, objectFit:"cover", border:"2px solid", borderColor:"primary.main" }} />
                        <Box>
                          <AppText variant="body2" sx={{ color:"success.main", fontWeight:700, mb:0.5 }}>✓ {t("wizard.photoSelected")}</AppText>
                          <AppText variant="caption" color="text.disabled">{photo?.name} ({(photo?.size/1024).toFixed(0)} KB)</AppText>
                          <Box sx={{ mt:1 }}>
                            <AppButton variant="outlined" color="secondary" size="small" startIcon={<DeleteIcon />}
                              onClick={() => { setPhoto(null); setPhotoPreview(null); if (photoRef.current) photoRef.current.value=""; }}>
                              {t("wizard.photoRemove")}
                            </AppButton>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <input ref={photoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto} />
                        <Box sx={{ border:"2px dashed", borderColor: fieldErr.photo ? "error.main" : "primary.light", borderRadius:3, p:4, textAlign:"center", cursor:"pointer", "&:hover":{ borderColor:"primary.main", bgcolor:"background.blue" } }}
                          onClick={() => photoRef.current?.click()}>
                          <PhotoCameraIcon sx={{ fontSize:40, color:"primary.main", mb:1 }} />
                          <AppText variant="body2" sx={{ fontWeight:700, color:"primary.main" }}>{t("wizard.photoClick")}</AppText>
                          <AppText variant="caption" color="text.disabled">{t("wizard.photoFormat")}</AppText>
                        </Box>
                        {fieldErr.photo && <AppText variant="caption" sx={{ color:"error.main", mt:1, display:"block" }}>{fieldErr.photo}</AppText>}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ════ ÉTAPE 1 — Q-Chat-10 ════ */}
          {step === 1 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>📋 {t("wizard.step2Title")}</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:2 }}>{t("wizard.step2Desc")}</AppText>
              <Box sx={{ display:"flex", gap:2, mb:3 }}>
                <Box sx={{ flex:1, textAlign:"center", p:2, bgcolor:"background.subtle", borderRadius:3, border:"1px solid", borderColor:"divider" }}>
                  <AppText variant="h4" sx={{ color:"primary.main", fontWeight:900 }}>{qchatAnswered}/10</AppText>
                  <AppText variant="caption" color="text.disabled">{t("wizard.qchatAnswered")}</AppText>
                </Box>
                <Box sx={{ flex:1, textAlign:"center", p:2, bgcolor:"background.subtle", borderRadius:3, border:"1px solid", borderColor:"divider" }}>
                  <AppText variant="h4" sx={{ fontWeight:900, color: qchatScore >= 3 ? "secondary.main" : "success.main" }}>{qchatScore}/10</AppText>
                  <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0.5 }}>
                    <AppText variant="caption" color="text.disabled">{t("wizard.qchatScore")}</AppText>
                    <Tooltip title={t("wizard.qchatTooltip")}><InfoOutlinedIcon sx={{ fontSize:14, color:"text.disabled", cursor:"help" }} /></Tooltip>
                  </Box>
                </Box>
              </Box>
              {QCHAT_FR.map((item, idx) => (
                <RadioBlock key={item.id}
                  label={`${idx+1}. ${qLabel(item)}`}
                  value={qchat[item.id]}
                  onChange={v => { setQchat(q=>({...q,[item.id]:v})); setFieldErr(fe=>({...fe,[item.id]:""})); }}
                  opts={item.opts}
                  error={fieldErr[item.id]}
                />
              ))}
            </Box>
          )}

          {/* ════ ÉTAPE 2 — Variables comportementales (TOUTES) ════ */}
          {step === 2 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>🧩 {t("wizard.step3Title")}</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>{t("wizard.step3Desc")}</AppText>

              {/* jaundice */}
              <RadioBlock label={t("wizard.behav.jaundice")} value={behav.jaundice}
                onChange={v => setBehav(b=>({...b,jaundice:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* familyMemWithASD */}
              <RadioBlock label={t("wizard.behav.familyMem")} value={behav.familyMemWithASD}
                onChange={v => setBehav(b=>({...b,familyMemWithASD:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* whoCompletedTest */}
              <RadioBlock label={t("wizard.behav.whoCompleted")} value={behav.whoCompletedTest}
                onChange={v => setBehav(b=>({...b,whoCompletedTest:v}))}
                opts={[0,1,2,3,4].map(i => t(`wizard.behav.whoOpts.${i}`))} />

              {/* speechDelayDisorder */}
              <RadioBlock label={t("wizard.behav.speechDelay")} value={behav.speechDelayDisorder}
                onChange={v => setBehav(b=>({...b,speechDelayDisorder:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* learningDisorder */}
              <RadioBlock label={t("wizard.behav.learning")} value={behav.learningDisorder}
                onChange={v => setBehav(b=>({...b,learningDisorder:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* geneticDisorders */}
              <RadioBlock label={t("wizard.behav.genetic")} value={behav.geneticDisorders}
                onChange={v => setBehav(b=>({...b,geneticDisorders:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* depression */}
              <RadioBlock label={t("wizard.behav.depression")} value={behav.depression}
                onChange={v => setBehav(b=>({...b,depression:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* globalDevelopmentalDelay */}
              <RadioBlock label={t("wizard.behav.globalDelay")} value={behav.globalDevelopmentalDelay}
                onChange={v => setBehav(b=>({...b,globalDevelopmentalDelay:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* socialBehaviouralIssues */}
              <RadioBlock label={t("wizard.behav.socialBehav")} value={behav.socialBehaviouralIssues}
                onChange={v => setBehav(b=>({...b,socialBehaviouralIssues:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />

              {/* anxietyDisorder */}
              <RadioBlock label={t("wizard.behav.anxiety")} value={behav.anxietyDisorder}
                onChange={v => setBehav(b=>({...b,anxietyDisorder:v}))}
                opts={[t("wizard.behav.optNo"), t("wizard.behav.optYes")]} row />
            </Box>
          )}

          {/* ════ ÉTAPE 3 — DS Survey RM ════ */}
          {step === 3 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>📊 {t("wizard.step4Title")}</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>{t("wizard.step4Desc")}</AppText>

              {/* PR_QN1_A info banner */}
              <Box sx={{ p:2, mb:3, bgcolor:"background.blue", borderRadius:3, border:"1px solid", borderColor:"primary.light", display:"flex", gap:1.5 }}>
                <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, flexShrink:0, mt:0.2 }} />
                <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                  {t("wizard.ds.qn1aNote")}
                </AppText>
              </Box>

              {/* Démographie */}
              <SectionChip label="Démographie" />
              <RadioBlock label={t("wizard.ds.age")} value={ds.PR_AGE1}
                onChange={v => setDs(d=>({...d,PR_AGE1:v}))}
                opts={[1,2,3,4,5,6].map(i => t(`wizard.ds.ageOpts.${i}`))}
                error={fieldErr.PR_AGE1} />

              <RadioBlock label={t("wizard.ds.gender")} value={ds.PR_Q3D}
                onChange={v => setDs(d=>({...d,PR_Q3D:v}))}
                opts={[1,2].map(i => t(`wizard.ds.genderOpts.${i}`))}
                error={fieldErr.PR_Q3D} row />

              {/* Communication */}
              <SectionChip label={t("wizard.ds.commSection")} />
              <RadioBlock label={t("wizard.ds.qf1a")} value={ds.PR_QF1A}
                onChange={v => setDs(d=>({...d,PR_QF1A:v}))}
                opts={[1,2,3].map(i => t(`wizard.ds.speechOpts.${i}`))}
                error={fieldErr.PR_QF1A} />
              <RadioBlock label={t("wizard.ds.qg1a")} value={ds.PR_QG1A}
                onChange={v => setDs(d=>({...d,PR_QG1A:v}))}
                opts={[1,2,3].map(i => t(`wizard.ds.speechOpts.${i}`))}
                error={fieldErr.PR_QG1A} />

              {/* Mobilité */}
              <SectionChip label={t("wizard.ds.mobSection")} />
              <RadioBlock label={t("wizard.ds.qh1a")} value={ds.PR_QH1A}
                onChange={v => setDs(d=>({...d,PR_QH1A:v}))}
                opts={[1,2,3,4,5].map(i => t(`wizard.ds.freqOpts.${i}`))}
                error={fieldErr.PR_QH1A} />
              <RadioBlock label={t("wizard.ds.qh1b")} value={ds.PR_QH1B}
                onChange={v => setDs(d=>({...d,PR_QH1B:v}))}
                opts={[1,2].map(i => t(`wizard.ds.wheelchairOpts.${i}`))}
                error={fieldErr.PR_QH1B} row />
              <RadioBlock label={t("wizard.ds.qi1")} value={ds.PR_QI1}
                onChange={v => setDs(d=>({...d,PR_QI1:v}))}
                opts={[1,2,3,4,5].map(i => t(`wizard.ds.freqOpts.${i}`))}
                error={fieldErr.PR_QI1} />
              <RadioBlock label={t("wizard.ds.qj1")} value={ds.PR_QJ1}
                onChange={v => setDs(d=>({...d,PR_QJ1:v}))}
                opts={[1,2,3,4,5].map(i => t(`wizard.ds.freqOpts.${i}`))}
                error={fieldErr.PR_QJ1} />
              <RadioBlock label={t("wizard.ds.qk1")} value={ds.PR_QK1}
                onChange={v => setDs(d=>({...d,PR_QK1:v}))}
                opts={[1,2,3,4,5].map(i => t(`wizard.ds.freqOpts.${i}`))}
                error={fieldErr.PR_QK1} />

              {/* Santé — PR_QN1_A ABSENT */}
              <SectionChip label={t("wizard.ds.healthSection")} color="secondary" />
              {[
                { key:"PR_QN1_B", label:t("wizard.ds.qn1b") },
                { key:"PR_QN1_C", label:t("wizard.ds.qn1c") },
                { key:"PR_QN1_D", label:t("wizard.ds.qn1d") },
                { key:"PR_QN1_E", label:t("wizard.ds.qn1e") },
                { key:"PR_QN1_F", label:t("wizard.ds.qn1f") },
                { key:"PR_QN1_G", label:t("wizard.ds.qn1g") },
                { key:"PR_QN1_H", label:t("wizard.ds.qn1h") },
              ].map(item => (
                <RadioBlock key={item.key} label={item.label} value={ds[item.key]}
                  onChange={v => setDs(d=>({...d,[item.key]:v}))}
                  opts={[0,1,2].map(i => t(`wizard.ds.healthOpts.${i}`))}
                  error={fieldErr[item.key]} row />
              ))}

              {/* Comportement */}
              <SectionChip label={t("wizard.ds.behavSection")} color="secondary" />
              {[
                { key:"PR_QO1_A_COMBINE", label:t("wizard.ds.qo1a") },
                { key:"PR_QO1_B_COMBINE", label:t("wizard.ds.qo1b") },
                { key:"PR_QO1_C_COMBINE", label:t("wizard.ds.qo1c") },
                { key:"PR_QO1_D_COMBINE", label:t("wizard.ds.qo1d") },
                { key:"PR_QO1_E_COMBINE", label:t("wizard.ds.qo1e") },
              ].map(item => (
                <RadioBlock key={item.key} label={item.label} value={ds[item.key]}
                  onChange={v => setDs(d=>({...d,[item.key]:v}))}
                  opts={[1,2,3].map(i => t(`wizard.ds.behavOpts.${i}`))}
                  error={fieldErr[item.key]} />
              ))}

              {/* Niveau de soutien */}
              <SectionChip label={t("wizard.ds.supportSection")} />
              <RadioBlock label={t("wizard.ds.qq")} value={ds.PR_QQ}
                onChange={v => setDs(d=>({...d,PR_QQ:v}))}
                opts={[1,2,3,4].map(i => t(`wizard.ds.qqOpts.${i}`))}
                error={fieldErr.PR_QQ} />

              <Box sx={{ p:2, mt:2, bgcolor:"background.blue", borderRadius:3, border:"1px solid", borderColor:"primary.light", display:"flex", gap:1.5 }}>
                <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, flexShrink:0, mt:0.2 }} />
                <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                  {t("wizard.step4Desc")}
                </AppText>
              </Box>
            </Box>
          )}

          {/* ════ ÉTAPE 4 — Résultats ════ */}
          {step === 4 && (
            <Box>
              {loading && (
                <Box sx={{ textAlign:"center", py:8 }}>
                  <CircularProgress size={64} thickness={3} sx={{ color:"primary.main", mb:3 }} />
                  <AppText variant="h5" gutterBottom>{t("wizard.analyzing")}</AppText>
                  <AppText variant="body2" color="text.secondary">{t("wizard.analyzingDesc")}</AppText>
                </Box>
              )}
              {!loading && submitErr && (
                <Box>
                  <Alert severity="error" sx={{ mb:3, borderRadius:2 }}>{submitErr}</Alert>
                  <AppButton startIcon={<ArrowBackIcon />} onClick={() => { setStep(3); setSubmitErr(""); }}>
                    {t("actions.back")}
                  </AppButton>
                </Box>
              )}
              {!loading && result && (
                <Box>
                  <AppText variant="h4" sx={{ mb:3, fontWeight:900 }}>🎯 {t("wizard.step5Title")}</AppText>

                  {/* Résumé enfant */}
                  <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:3, p:2, bgcolor:"background.subtle", borderRadius:3, border:"1px solid", borderColor:"divider" }}>
                    {photoPreview
                      ? <img src={photoPreview} style={{ width:56, height:56, borderRadius:12, objectFit:"cover", border:"2px solid #3BBDE8" }} alt="" />
                      : <Box sx={{ width:56, height:56, borderRadius:3, bgcolor:"background.blue", color:"primary.main", fontSize:20, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{info.firstName?.[0]}</Box>
                    }
                    <Box>
                      <AppText variant="h5" sx={{ fontWeight:800 }}>{info.firstName} {info.lastName}</AppText>
                      <AppText variant="caption" color="text.secondary">
                        {age !== null ? `${age} ${t("wizard.girl") === t("wizard.boy") ? "ans" : (lang === "ar" ? "سنة" : "ans")} · ` : ""}
                        {info.gender === "M" ? t("wizard.boy") : t("wizard.girl")} · Q-Chat: {calcQChat(qchat)}/10
                      </AppText>
                    </Box>
                  </Box>

                  {/* Résultat principal */}
                  <Box sx={{ p:3.5, borderRadius:4, mb:3, textAlign:"center", border:"2px solid", borderColor:cfg.color, bgcolor:cfg.bg }}>
                    <Box sx={{ fontSize:56, mb:1 }}>{cfg.icon}</Box>
                    <Chip label={result.prediction} sx={{ bgcolor:cfg.color, color:"white", fontWeight:900, fontSize:"0.95rem", px:2, height:34, mb:2 }} />
                    <AppText variant="h3" sx={{ color:cfg.color, fontWeight:900, mb:1 }}>
                      {t(`wizard.profileLabels.${result.prediction}`)}
                    </AppText>
                    <Box sx={{ maxWidth:280, mx:"auto" }}>
                      <LinearProgress variant="determinate" value={Math.round((result.confidence??0)*100)}
                        sx={{ height:12, borderRadius:8, bgcolor:"rgba(0,0,0,0.08)", "& .MuiLinearProgress-bar":{ bgcolor:cfg.color } }} />
                      <AppText variant="h4" sx={{ color:cfg.color, fontWeight:900, mt:0.8 }}>
                        {t("wizard.confidence")} : {Math.round((result.confidence??0)*100)}%
                      </AppText>
                    </Box>
                  </Box>

                  {/* Détail modèles */}
                  <Grid container spacing={2} sx={{ mb:3 }}>
                    {[
                      { label:"XGBoost (ML)",        value:result.prob_ml,        color:"#3BBDE8", icon:<PsychologyIcon sx={{ color:"#3BBDE8", fontSize:32, mb:1 }} />, tooltip:"AUC=1.00" },
                      { label:"MobileNetV2 (CNN)",   value:result.prob_cnn,       color:"#9F7AEA", icon:<CameraAltIcon sx={{ color:"#9F7AEA", fontSize:32, mb:1 }} />, tooltip:"AUC=0.90" },
                      { label:"Isolation Forest (DI)", value:result.score_anomalie, color:"#F5A623", icon:<MergeTypeIcon sx={{ color:"#F5A623", fontSize:32, mb:1 }} />, tooltip:"AUC=0.9981" },
                    ].map(m => (
                      <Grid item xs={12} sm={4} key={m.label}>
                        <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid", borderColor:m.color, textAlign:"center" }}>
                          {m.icon}
                          <AppText variant="caption" sx={{ fontWeight:700, display:"block", mb:1 }}>{m.label}</AppText>
                          <ProbBar label="%" value={m.value} color={m.color} icon="" tooltip={m.tooltip} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Late Fusion */}
                  <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid", borderColor:"divider", mb:3 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:1.5 }}>
                      <AppText variant="body2" sx={{ fontWeight:800 }}>⚡ Late Fusion</AppText>
                      <Tooltip title="logit(P) = 0.556×logit(ML) + 0.444×logit(CNN) → sigmoid">
                        <InfoOutlinedIcon sx={{ fontSize:16, color:"text.disabled", cursor:"help" }} />
                      </Tooltip>
                    </Box>
                    <ProbBar label={t("diagnostic.probTSA")} value={result.prob_tsa} color="#3BBDE8" icon="⚡" />
                  </Box>

                  {/* Note médicale */}
                  <Box sx={{ p:2, bgcolor:"background.orange", borderRadius:3, mb:3, border:"1px solid", borderColor:"secondary.light", display:"flex", gap:1.5 }}>
                    <WarningAmberIcon sx={{ color:"secondary.main", fontSize:20, flexShrink:0, mt:0.2 }} />
                    <AppText variant="caption" sx={{ color:"text.secondary", lineHeight:1.7 }}>{t("wizard.medicalNote")}</AppText>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
                    <AppButton size="large" startIcon={<ChatIcon />}
                      onClick={() => navigate(`/chat?childId=${result.childId}`)}>
                      {t("wizard.startChat")}
                    </AppButton>
                    <AppButton size="large" variant="outlined" color="secondary"
                      onClick={() => navigate("/dashboard")}>
                      {t("wizard.goDashboard")}
                    </AppButton>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ── Boutons de navigation ── */}
          {step < 4 && (
            <Box sx={{ display:"flex", gap:2, mt:4 }}>
              {step > 0 ? (
                <AppButton variant="outlined" color="secondary" startIcon={<ArrowBackIcon />}
                  onClick={() => setStep(s=>s-1)} sx={{ flex:1 }}>
                  {t("actions.back")}
                </AppButton>
              ) : !user?.isFirstLogin && (
                <AppButton variant="outlined" color="secondary" startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/chat")} sx={{ flex:1 }}>
                  {t("wizard.goToChat")}
                </AppButton>
              )}
              <AppButton
                endIcon={step < 3 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
                onClick={handleNext}
                sx={{ flex: step === 0 ? 1 : 2, py:1.5 }}>
                {step === 3 ? t("wizard.createAndAnalyze") : t("actions.continue")}
              </AppButton>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}