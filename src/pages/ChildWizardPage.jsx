// src/pages/ChildWizardPage.jsx
// =============================================================================
// Wizard enfant — 4 étapes
//  Étape 1 : Informations personnelles (nom, prénom, date, genre, photo)
//  Étape 2 : Q-Chat-10 (10 questions TSA)
//  Étape 3 : Questions RM — DS Survey (communication, mobilité, santé, comportement)
//  Étape 4 : Résultats — création en base + appel API Python + affichage
//
// Accessible depuis : /child-wizard
// Après résultats   : bouton → /chat
// =============================================================================

import { useState, useRef } from "react";
import { useNavigate }      from "react-router-dom";
import {
  Box, Grid, Paper, Stepper, Step, StepLabel, StepConnector,
  TextField, MenuItem, LinearProgress, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Divider, Chip,
  Tooltip, Avatar, CircularProgress, Alert,
  useMediaQuery, useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChildCareIcon      from "@mui/icons-material/ChildCare";
import PhotoCameraIcon    from "@mui/icons-material/PhotoCamera";
import DeleteIcon         from "@mui/icons-material/Delete";
import ArrowForwardIcon   from "@mui/icons-material/ArrowForward";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon   from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";
import PsychologyIcon     from "@mui/icons-material/Psychology";
import MergeTypeIcon      from "@mui/icons-material/MergeType";
import CameraAltIcon      from "@mui/icons-material/CameraAlt";
import ChatIcon           from "@mui/icons-material/Chat";

import AppButton  from "../components/atoms/AppButton";
import AppText    from "../components/atoms/AppText";
import api        from "../services/api";
import { useAuth } from "../hooks/useAuth";

// ─────────────────────────────────────────────────────────────────
// DONNÉES STATIQUES
// ─────────────────────────────────────────────────────────────────

const QCHAT = [
  { id:"A1",  q:"Est-ce que votre enfant vous regarde lorsque vous l'appelez ?",
    opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"] },
  { id:"A2",  q:"À quel point est-ce facile d'avoir un contact visuel avec votre enfant ?",
    opts:["Très facile","Plutôt facile","Plutôt difficile","Très difficile","Impossible"] },
  { id:"A3",  q:"Est-ce que votre enfant pointe pour indiquer ce qu'il veut avoir ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"] },
  { id:"A4",  q:"Est-ce que votre enfant pointe pour attirer votre attention sur quelque chose ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"] },
  { id:"A5",  q:"Est-ce que votre enfant joue à faire semblant ? (poupées, téléphone jouet...)",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"] },
  { id:"A6",  q:"Est-ce que votre enfant regarde dans la direction que vous regardez ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"] },
  { id:"A7",  q:"Si quelqu'un de votre famille est triste, est-ce que votre enfant le réconforte ?",
    opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"] },
  { id:"A8",  q:"Est-ce que les premiers mots de votre enfant étaient :",
    opts:["Très typique","Plutôt typique","Légèrement inhabituel","Très inhabituel","Mon enfant ne parle pas"] },
  { id:"A9",  q:"Est-ce que votre enfant utilise spontanément des gestes simples ? (saluer de la main...)",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"] },
  { id:"A10", q:"Est-ce que votre enfant regarde fixement dans le vide, sans but apparent ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","< 1 fois/semaine","Jamais"],
    isA10: true },
];

const RM_COMMUNICATION = [
  { id:"PR_QF1A", label:"Mode d'expression utilisé le plus fréquemment :",
    opts:["Langage parlé","Autres modes d'expression","Jamais / que rarement"] },
  { id:"PR_QG1A", label:"Mode d'expression compris le mieux :",
    opts:["Langage parlé","Autres modes d'expression","Jamais / que rarement"] },
];

const RM_MOBILITY = [
  { id:"PR_QH1A", label:"Fréquence d'utilisation d'une aide à la mobilité (canne, déambulateur, fauteuil) :",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QH1B", label:"Utilise un fauteuil roulant pour la plupart des activités ?",
    opts:["Oui","Non"] },
  { id:"PR_QI1",  label:"Fréquence d'utilisation de prothèses auditives ou équipements (surdité) :",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QJ1",  label:"Fréquence d'utilisation d'aides visuelles (loupe, braille, canne blanche) :",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QK1",  label:"Fréquence de besoin d'aide pour manger ou d'équipement nutritionnel :",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
];

const RM_HEALTH = [
  { id:"PR_QN1_A", label:"Trouble du spectre autistique (autisme, Asperger, TED) ?" },
  { id:"PR_QN1_B", label:"Autre trouble du développement rare (Prader-Willi, X fragile, SAF...) ?" },
  { id:"PR_QN1_C", label:"Asthme ou maladie respiratoire nécessitant un équipement spécialisé ?" },
  { id:"PR_QN1_D", label:"Trouble de santé mentale (hors démence) ?" },
  { id:"PR_QN1_E", label:"Démence ou maladie d'Alzheimer ?" },
  { id:"PR_QN1_F", label:"Diabète (type 1 ou 2) ?" },
  { id:"PR_QN1_G", label:"Troubles épileptiques, crises ou convulsions ?" },
  { id:"PR_QN1_H", label:"Lésion cérébrale acquise ?" },
];
const HEALTH_OPTS = ["Non","Oui (non diagnostiqué)","Oui (diagnostiqué)"];

const RM_BEHAVIOR = [
  { id:"PR_QO1_A_COMBINE", label:"Agresse physiquement d'autres personnes ?" },
  { id:"PR_QO1_B_COMBINE", label:"Détruit des objets ou meubles ?" },
  { id:"PR_QO1_C_COMBINE", label:"S'inflige des blessures (se frappe, morsures, ingère des objets) ?" },
  { id:"PR_QO1_D_COMBINE", label:"Manifeste des comportements sexuels inappropriés ?" },
  { id:"PR_QO1_E_COMBINE", label:"Se livre au vagabondage ou à des fugues répétées ?" },
];
const BEHAV_OPTS = ["Non","Non (grâce au soutien)","Oui (malgré le soutien)"];

const RM_SUPPORT = [
  { id:"PR_QQ", label:"Niveau de soutien global requis pour les activités quotidiennes :",
    opts:[
      "Soutien non-quotidien (rendez-vous médicaux uniquement)",
      "Soutien quotidien réduit (rappels occasionnels)",
      "Soutien quotidien modéré (assistance physique fréquente)",
      "Soutien quotidien important (surveillance nuit/sécurité)",
    ] },
];

// Calcul score Q-Chat
function calcQChat(raw) {
  return QCHAT.reduce((s, q) => {
    const v = raw[q.id];
    if (v === null || v === undefined) return s;
    return s + (q.isA10 ? (v <= 2 ? 1 : 0) : (v >= 2 ? 1 : 0));
  }, 0);
}

// Config profil
const PROFILE_CFG = {
  TSA   : { color:"#3BBDE8", bg:"#EBF7FE", label:"Trouble du Spectre Autistique", icon:"🧠" },
  RM    : { color:"#F5A623", bg:"#FFF8EE", label:"Déficience Intellectuelle",      icon:"📚" },
  MIXTE : { color:"#9F7AEA", bg:"#F3F0FF", label:"Profil mixte TSA & DI",          icon:"🔀" },
  Normal: { color:"#48BB78", bg:"#E6F7EE", label:"Profil dans la norme",           icon:"✅" },
};

// Stepper custom
const Connector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
  },
}));

const STEPS = [
  { label:"Informations", icon:"👤" },
  { label:"Q-Chat-10",   icon:"📋" },
  { label:"Questions RM", icon:"📊" },
  { label:"Résultats",   icon:"🎯" },
];

// ─────────────────────────────────────────────────────────────────
// COMPOSANT QUESTION RADIO
// ─────────────────────────────────────────────────────────────────
function QuestionBlock({ item, values, onChange, error, row = false }) {
  return (
    <Box sx={{ mb:3, pb:3, borderBottom:"1px solid", borderColor:"divider" }}>
      <FormControl component="fieldset" error={!!error} fullWidth>
        <FormLabel sx={{ mb:1, fontSize:"0.88rem", fontWeight:600,
          color:"text.primary", lineHeight:1.6 }}>
          {item.label || item.q}
        </FormLabel>
        <RadioGroup row={row && item.opts?.length <= 3}
          value={values[item.id] ?? ""}
          onChange={e => onChange(item.id, Number(e.target.value))}>
          {(item.opts || []).map((opt, i) => (
            <FormControlLabel key={i} value={i}
              control={<Radio size="small"
                sx={{ "&.Mui-checked":{ color:"primary.main" } }} />}
              label={<AppText variant="caption" sx={{ fontSize:"0.82rem" }}>{opt}</AppText>}
              sx={{
                mb:0.2, borderRadius:2, px:1, transition:"background 0.15s",
                bgcolor: values[item.id] === i ? "background.blue" : "transparent",
              }}
            />
          ))}
        </RadioGroup>
        {error && <AppText variant="caption" sx={{ color:"error.main", mt:0.5 }}>{error}</AppText>}
      </FormControl>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// BARRE DE PROBABILITÉ
// ─────────────────────────────────────────────────────────────────
function ProbBar({ label, value, color, icon, tooltip }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Box sx={{ mb:2.5 }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:0.8 }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <AppText variant="body2" sx={{ fontWeight:700 }}>{label}</AppText>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <InfoOutlinedIcon sx={{ fontSize:15, color:"text.disabled", cursor:"help" }} />
            </Tooltip>
          )}
        </Box>
        <AppText variant="h5" sx={{ color, fontWeight:900 }}>{pct}%</AppText>
      </Box>
      <LinearProgress variant="determinate" value={pct}
        sx={{ height:10, borderRadius:8, bgcolor:"#f0f4f8",
          "& .MuiLinearProgress-bar":{ bgcolor:color, borderRadius:8 } }} />
    </Box>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════
export default function ChildWizardPage() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const [step,      setStep]      = useState(0);
  const [fieldErr,  setFieldErr]  = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);  // résultat prédiction
  const photoRef = useRef(null);

  // ── Données formulaire ────────────────────────────────────────
  const [info, setInfo] = useState({
    firstName:"", lastName:"", birthDate:"", gender:"",
  });
  const [photo,        setPhoto]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [qchat, setQchat] = useState(
    Object.fromEntries(QCHAT.map(q => [q.id, null]))
  );
  const [rmData, setRmData] = useState(
    Object.fromEntries([
      ...RM_COMMUNICATION, ...RM_MOBILITY,
      ...RM_HEALTH, ...RM_BEHAVIOR, ...RM_SUPPORT,
    ].map(v => [v.id, null]))
  );

  const qchatScore    = calcQChat(qchat);
  const qchatAnswered = QCHAT.filter(q => qchat[q.id] !== null).length;
  const progress      = (step / (STEPS.length - 1)) * 100;

  // ── Photo ─────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setFieldErr(fe => ({...fe, photo:"Image uniquement (JPG/PNG)"}));
    if (file.size > 5 * 1024 * 1024)
      return setFieldErr(fe => ({...fe, photo:"Taille max 5 MB"}));
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFieldErr(fe => ({...fe, photo:""}));
  };

  // ── Validation ────────────────────────────────────────────────
  const validateStep0 = () => {
    const e = {};
    if (!info.firstName.trim()) e.firstName = "Requis";
    if (!info.lastName.trim())  e.lastName  = "Requis";
    if (!info.birthDate)        e.birthDate = "Requis";
    if (!info.gender)           e.gender    = "Requis";
    if (!photo)                 e.photo     = "La photo est requise pour le modèle CNN";
    setFieldErr(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e = {};
    QCHAT.forEach(q => { if (qchat[q.id] === null) e[q.id] = "Requis"; });
    setFieldErr(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e = {};
    [...RM_COMMUNICATION, ...RM_MOBILITY, ...RM_HEALTH,
     ...RM_BEHAVIOR, ...RM_SUPPORT].forEach(v => {
      if (rmData[v.id] === null) e[v.id] = "Requis";
    });
    setFieldErr(e);
    return !Object.keys(e).length;
  };

  // ── Navigation ────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    if (step === 2) { handleSubmitAll(); return; }
    setStep(s => s + 1);
  };

  // ── Soumission finale : créer enfant + prédiction ────────────
  const handleSubmitAll = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setSubmitErr("");
    setStep(3); // passer à l'étape résultats (avec loader)

    try {
      // ── 1. Construire FormData ──────────────────────────────
      const fd = new FormData();
      fd.append("firstName", info.firstName.trim());
      fd.append("lastName",  info.lastName.trim());
      fd.append("birthDate", info.birthDate);
      fd.append("gender",    info.gender);
      if (photo) fd.append("facePhoto", photo);

      // Q-Chat-10 binaire + brut
      QCHAT.forEach(q => {
        const bin = q.isA10 ? (qchat[q.id] <= 2 ? 1 : 0) : (qchat[q.id] >= 2 ? 1 : 0);
        fd.append(q.id,          bin);
        fd.append(`${q.id}_raw`, qchat[q.id]);
      });
      fd.append("QChatScore", qchatScore);

      // DS Survey RM (index 0-based → 1-based pour la base)
      Object.entries(rmData).forEach(([k, v]) => fd.append(k, (v ?? 0) + 1));

      // ── 2. Créer l'enfant en base ───────────────────────────
      const childRes = await api.post("/children", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const child   = childRes.data;
      const childId = child._id || child.id;

      // ── 3. Lancer la prédiction ML + CNN + RM ──────────────
      const predRes = await api.get(`/children/${childId}/predict`);
      const pred    = predRes.data;

      setResult({
        child,
        prediction    : pred.prediction,
        prob_ml       : pred.probMl,
        prob_cnn      : pred.probCnn,
        prob_tsa      : pred.probTsa,
        score_anomalie: pred.scoreAnomalie,
        confidence    : pred.confidence,
        childId,
      });

    } catch (err) {
      const msg = err.response?.status === 503
        ? "Le service IA Python est hors ligne. Lancez : uvicorn app:app --reload"
        : err.response?.data?.message || "Erreur lors de la création du profil.";
      setSubmitErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (PROFILE_CFG[result.prediction] || PROFILE_CFG.Normal) : null;
  const age = info.birthDate
    ? Math.floor((Date.now() - new Date(info.birthDate)) / (365.25*24*3600*1000))
    : null;

  // ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      minHeight:"100vh",
      background:"linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)",
      px:{ xs:2, sm:4, md:8 }, py:5,
    }}>
      <Box sx={{ maxWidth:720, mx:"auto" }}>

        {/* ── Logo + titre ── */}
        <Box sx={{ textAlign:"center", mb:4 }}>
          <Box sx={{ width:52,height:52,borderRadius:"14px",mx:"auto",mb:1.5,
            background:"linear-gradient(135deg,#3BBDE8,#1A7FA8)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24,boxShadow:"0 8px 20px rgba(59,189,232,0.3)" }}>☀️</Box>
          <AppText variant="h4" sx={{ fontWeight:900 }}>
            Profil de l'enfant
          </AppText>
          {user?.firstName && (
            <AppText variant="body2" color="text.secondary">
              Bonjour <strong>{user.firstName}</strong> — complétez le profil pour accéder à l'assistant
            </AppText>
          )}
        </Box>

        {/* ── Stepper ── */}
        <Stepper activeStep={step} connector={<Connector />}
          alternativeLabel sx={{ mb:2 }}>
          {STEPS.map((s, i) => (
            <Step key={s.label} completed={i < step}>
              <StepLabel sx={{
                "& .MuiStepLabel-label":{ fontSize:"0.72rem", fontWeight:600, mt:0.5 },
                "& .MuiStepIcon-root.Mui-active":{ color:"primary.main" },
                "& .MuiStepIcon-root.Mui-completed":{ color:"success.main" },
              }}>
                {!isMobile && s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Barre progression */}
        <LinearProgress variant="determinate" value={progress}
          sx={{ mb:3, height:5, borderRadius:8, bgcolor:"background.blue",
            "& .MuiLinearProgress-bar":{ bgcolor:"primary.main" } }} />

        <Paper elevation={2} sx={{ borderRadius:4, border:"1.5px solid",
          borderColor:"divider", p:{ xs:3, md:5 } }}>

          {/* ────────────────────────────────────────────────── */}
          {/* ÉTAPE 1 — Informations personnelles               */}
          {/* ────────────────────────────────────────────────── */}
          {step === 0 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>👤 Informations personnelles</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>
                Ces données sont utilisées par les modèles ML/CNN pour la prédiction.
              </AppText>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Prénom" value={info.firstName}
                    onChange={e => { setInfo(i=>({...i,firstName:e.target.value})); setFieldErr(fe=>({...fe,firstName:""})); }}
                    error={!!fieldErr.firstName} helperText={fieldErr.firstName}
                    InputProps={{ startAdornment:
                      <Box sx={{ mr:1, color:"text.disabled", display:"flex" }}><ChildCareIcon fontSize="small"/></Box> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Nom" value={info.lastName}
                    onChange={e => { setInfo(i=>({...i,lastName:e.target.value})); setFieldErr(fe=>({...fe,lastName:""})); }}
                    error={!!fieldErr.lastName} helperText={fieldErr.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField fullWidth label="Date de naissance" type="date"
                    value={info.birthDate}
                    onChange={e => { setInfo(i=>({...i,birthDate:e.target.value})); setFieldErr(fe=>({...fe,birthDate:""})); }}
                    error={!!fieldErr.birthDate} helperText={fieldErr.birthDate}
                    InputLabelProps={{ shrink:true }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth select label="Genre" value={info.gender}
                    onChange={e => { setInfo(i=>({...i,gender:e.target.value})); setFieldErr(fe=>({...fe,gender:""})); }}
                    error={!!fieldErr.gender} helperText={fieldErr.gender}>
                    <MenuItem value="M">👦 Garçon</MenuItem>
                    <MenuItem value="F">👧 Fille</MenuItem>
                  </TextField>
                </Grid>

                {/* Photo CNN */}
                <Grid item xs={12}>
                  <Divider sx={{ mb:2.5 }}>
                    <Chip label="📸 Photo de visage — Modèle CNN (MobileNetV2)" size="small"
                      sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700, fontSize:"0.72rem" }} />
                  </Divider>

                  <Box sx={{ p:2.5, bgcolor:"background.subtle", borderRadius:3,
                    border:"1px solid", borderColor: fieldErr.photo ? "error.main" : "divider" }}>
                    <Box sx={{ display:"flex", gap:1.5, mb:2, alignItems:"flex-start" }}>
                      <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, mt:0.2, flexShrink:0 }} />
                      <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                        La photo est utilisée par <strong>MobileNetV2</strong> pour la détection CNN du TSA.
                        Utilisez une photo récente, de face, bien éclairée (max 5 MB).
                      </AppText>
                    </Box>

                    {photoPreview ? (
                      <Box sx={{ display:"flex", alignItems:"center", gap:3 }}>
                        <Box component="img" src={photoPreview}
                          sx={{ width:100, height:100, borderRadius:3,
                            objectFit:"cover", border:"2px solid", borderColor:"primary.main" }}
                        />
                        <Box>
                          <AppText variant="body2" sx={{ color:"success.main", fontWeight:700, mb:0.5 }}>
                            ✓ Photo sélectionnée
                          </AppText>
                          <AppText variant="caption" color="text.disabled">
                            {photo?.name} — {(photo?.size/1024).toFixed(0)} KB
                          </AppText>
                          <Box sx={{ mt:1 }}>
                            <AppButton variant="outlined" color="secondary" size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => { setPhoto(null); setPhotoPreview(null); if(photoRef.current) photoRef.current.value=""; }}>
                              Supprimer
                            </AppButton>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <input ref={photoRef} type="file" accept="image/*"
                          style={{ display:"none" }} onChange={handlePhoto} />
                        <Box sx={{ border:"2px dashed", borderColor: fieldErr.photo ? "error.main" : "primary.light",
                          borderRadius:3, p:4, textAlign:"center", cursor:"pointer",
                          transition:"all 0.2s",
                          "&:hover":{ borderColor:"primary.main", bgcolor:"background.blue" } }}
                          onClick={() => photoRef.current?.click()}>
                          <PhotoCameraIcon sx={{ fontSize:40, color:"primary.main", mb:1 }} />
                          <AppText variant="body2" sx={{ fontWeight:700, color:"primary.main" }}>
                            Cliquez pour sélectionner une photo
                          </AppText>
                          <AppText variant="caption" color="text.disabled">
                            JPG ou PNG — max 5 MB
                          </AppText>
                        </Box>
                        {fieldErr.photo && (
                          <AppText variant="caption" sx={{ color:"error.main", mt:1, display:"block" }}>
                            {fieldErr.photo}
                          </AppText>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ────────────────────────────────────────────────── */}
          {/* ÉTAPE 2 — Q-Chat-10                               */}
          {/* ────────────────────────────────────────────────── */}
          {step === 1 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>📋 Q-Chat-10</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:2 }}>
                Questionnaire de dépistage TSA (18–24 mois) — utilisé par le modèle XGBoost.
              </AppText>

              {/* Compteurs */}
              <Box sx={{ display:"flex", gap:2, mb:3 }}>
                <Box sx={{ flex:1, textAlign:"center", p:2, bgcolor:"background.subtle",
                  borderRadius:3, border:"1px solid", borderColor:"divider" }}>
                  <AppText variant="h4" sx={{ color:"primary.main", fontWeight:900 }}>
                    {qchatAnswered}/10
                  </AppText>
                  <AppText variant="caption" color="text.disabled">Répondues</AppText>
                </Box>
                <Box sx={{ flex:1, textAlign:"center", p:2, bgcolor:"background.subtle",
                  borderRadius:3, border:"1px solid", borderColor:"divider" }}>
                  <AppText variant="h4" sx={{ fontWeight:900,
                    color: qchatScore >= 3 ? "secondary.main" : "success.main" }}>
                    {qchatScore}/10
                  </AppText>
                  <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0.5 }}>
                    <AppText variant="caption" color="text.disabled">Score</AppText>
                    <Tooltip title="Score ≥ 3 : traits autistiques potentiels. Pas un diagnostic.">
                      <InfoOutlinedIcon sx={{ fontSize:14, color:"text.disabled", cursor:"help" }} />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {QCHAT.map((item, idx) => (
                <QuestionBlock key={item.id}
                  item={{ ...item, label: `${idx+1}. ${item.q}` }}
                  values={qchat}
                  onChange={(id, val) => { setQchat(q=>({...q,[id]:val})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]}
                />
              ))}
            </Box>
          )}

          {/* ────────────────────────────────────────────────── */}
          {/* ÉTAPE 3 — Questions RM                            */}
          {/* ────────────────────────────────────────────────── */}
          {step === 2 && (
            <Box>
              <AppText variant="h4" sx={{ mb:0.5 }}>📊 DS Survey — Déficience Intellectuelle</AppText>
              <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>
                Ces questions alimentent le modèle Isolation Forest (ROC-AUC = 0.9981).
              </AppText>

              <SectionChip label="Communication" />
              {RM_COMMUNICATION.map(item => (
                <QuestionBlock key={item.id} item={item} values={rmData}
                  onChange={(id,v) => { setRmData(d=>({...d,[id]:v})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]} row />
              ))}

              <SectionChip label="Mobilité & Équipements" />
              {RM_MOBILITY.map(item => (
                <QuestionBlock key={item.id} item={item} values={rmData}
                  onChange={(id,v) => { setRmData(d=>({...d,[id]:v})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]} row />
              ))}

              <SectionChip label="Problèmes de santé" color="secondary" />
              {RM_HEALTH.map(item => (
                <QuestionBlock key={item.id} item={{ ...item, opts:HEALTH_OPTS }} values={rmData}
                  onChange={(id,v) => { setRmData(d=>({...d,[id]:v})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]} row />
              ))}

              <SectionChip label="Comportement" color="secondary" />
              {RM_BEHAVIOR.map(item => (
                <QuestionBlock key={item.id} item={{ ...item, opts:BEHAV_OPTS }} values={rmData}
                  onChange={(id,v) => { setRmData(d=>({...d,[id]:v})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]} row />
              ))}

              <SectionChip label="Niveau de soutien global — PR_QQ" />
              {RM_SUPPORT.map(item => (
                <QuestionBlock key={item.id} item={item} values={rmData}
                  onChange={(id,v) => { setRmData(d=>({...d,[id]:v})); setFieldErr(fe=>({...fe,[id]:""})); }}
                  error={fieldErr[item.id]} />
              ))}

              <Box sx={{ mt:2, p:2, bgcolor:"background.blue", borderRadius:3,
                border:"1px solid", borderColor:"primary.light",
                display:"flex", gap:1.5 }}>
                <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, flexShrink:0, mt:0.2 }} />
                <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                  À la soumission, le profil sera <strong>créé en base de données</strong> puis
                  envoyé aux modèles ML/CNN/RM pour calculer la prédiction.
                </AppText>
              </Box>
            </Box>
          )}

          {/* ────────────────────────────────────────────────── */}
          {/* ÉTAPE 4 — Résultats                               */}
          {/* ────────────────────────────────────────────────── */}
          {step === 3 && (
            <Box>
              {/* Chargement */}
              {loading && (
                <Box sx={{ textAlign:"center", py:8 }}>
                  <CircularProgress size={64} thickness={3}
                    sx={{ color:"primary.main", mb:3 }} />
                  <AppText variant="h5" gutterBottom>Analyse en cours...</AppText>
                  <AppText variant="body2" color="text.secondary">
                    Création du profil → XGBoost → MobileNetV2 → Isolation Forest
                  </AppText>
                </Box>
              )}

              {/* Erreur */}
              {!loading && submitErr && (
                <Box>
                  <Alert severity="error" sx={{ mb:3, borderRadius:2 }}>{submitErr}</Alert>
                  <AppButton startIcon={<ArrowBackIcon />} onClick={() => { setStep(2); setSubmitErr(""); }}>
                    Retour aux questions
                  </AppButton>
                </Box>
              )}

              {/* Résultats */}
              {!loading && result && (
                <Box>
                  <AppText variant="h4" sx={{ mb:3, fontWeight:900 }}>🎯 Résultats du diagnostic</AppText>

                  {/* Résumé enfant */}
                  <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:3,
                    p:2, bgcolor:"background.subtle", borderRadius:3,
                    border:"1px solid", borderColor:"divider" }}>
                    {photoPreview
                      ? <Avatar src={photoPreview}
                          sx={{ width:56, height:56, border:"2px solid", borderColor:"primary.main" }} />
                      : <Avatar sx={{ width:56, height:56, bgcolor:"background.blue",
                          color:"primary.main", fontSize:20, fontWeight:800 }}>
                          {info.firstName?.[0]}
                        </Avatar>
                    }
                    <Box>
                      <AppText variant="h5" sx={{ fontWeight:800 }}>
                        {info.firstName} {info.lastName}
                      </AppText>
                      <AppText variant="caption" color="text.secondary">
                        {age !== null ? `${age} ans · ` : ""}
                        {info.gender === "M" ? "Garçon" : "Fille"} ·
                        Q-Chat-10 : {qchatScore}/10
                      </AppText>
                    </Box>
                  </Box>

                  {/* Résultat principal */}
                  <Box sx={{ p:3.5, borderRadius:4, mb:3, textAlign:"center",
                    border:"2px solid", borderColor:cfg.color, bgcolor:cfg.bg }}>
                    <Box sx={{ fontSize:56, mb:1 }}>{cfg.icon}</Box>
                    <Chip label={result.prediction}
                      sx={{ bgcolor:cfg.color, color:"white", fontWeight:900,
                        fontSize:"0.95rem", px:2, height:34, mb:2 }} />
                    <AppText variant="h3" sx={{ color:cfg.color, fontWeight:900, mb:1 }}>
                      {cfg.label}
                    </AppText>
                    <Box sx={{ maxWidth:280, mx:"auto" }}>
                      <LinearProgress variant="determinate"
                        value={Math.round((result.confidence??0)*100)}
                        sx={{ height:12, borderRadius:8, bgcolor:"rgba(0,0,0,0.08)",
                          "& .MuiLinearProgress-bar":{ bgcolor:cfg.color } }} />
                      <AppText variant="h4" sx={{ color:cfg.color, fontWeight:900, mt:0.8 }}>
                        Confiance : {Math.round((result.confidence??0)*100)}%
                      </AppText>
                    </Box>
                  </Box>

                  {/* Détail modèles */}
                  <Grid container spacing={2} sx={{ mb:3 }}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid",
                        borderColor:"#3BBDE8", textAlign:"center" }}>
                        <PsychologyIcon sx={{ color:"#3BBDE8", fontSize:32, mb:1 }} />
                        <AppText variant="caption" sx={{ fontWeight:700, display:"block", mb:1 }}>
                          XGBoost (ML)
                        </AppText>
                        <ProbBar label="Prob. TSA" value={result.prob_ml}
                          color="#3BBDE8" icon="🧠"
                          tooltip="AUC entraînement = 1.00" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid",
                        borderColor:"#9F7AEA", textAlign:"center" }}>
                        <CameraAltIcon sx={{ color:"#9F7AEA", fontSize:32, mb:1 }} />
                        <AppText variant="caption" sx={{ fontWeight:700, display:"block", mb:1 }}>
                          MobileNetV2 (CNN)
                        </AppText>
                        <ProbBar label="Prob. TSA" value={result.prob_cnn}
                          color="#9F7AEA" icon="📸"
                          tooltip="AUC entraînement = 0.90" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid",
                        borderColor:"#F5A623", textAlign:"center" }}>
                        <MergeTypeIcon sx={{ color:"#F5A623", fontSize:32, mb:1 }} />
                        <AppText variant="caption" sx={{ fontWeight:700, display:"block", mb:1 }}>
                          Isolation Forest (RM)
                        </AppText>
                        <ProbBar label="Score anomalie" value={result.score_anomalie}
                          color="#F5A623" icon="📊"
                          tooltip="AUC entraînement = 0.9981" />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Late Fusion */}
                  <Box sx={{ p:2.5, borderRadius:3, border:"1.5px solid", borderColor:"divider", mb:3 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:1.5 }}>
                      <AppText variant="body2" sx={{ fontWeight:800 }}>
                        ⚡ Late Fusion (logit-pondérée)
                      </AppText>
                      <Tooltip title="logit(P) = 0.556×logit(ML) + 0.444×logit(CNN) → sigmoid">
                        <InfoOutlinedIcon sx={{ fontSize:16, color:"text.disabled", cursor:"help" }} />
                      </Tooltip>
                    </Box>
                    <ProbBar label="Probabilité TSA fusionnée"
                      value={result.prob_tsa} color="#3BBDE8" icon="⚡" />
                    <Box sx={{ display:"flex", gap:2 }}>
                      {[["w_ML","0.556","#3BBDE8"],["w_CNN","0.444","#9F7AEA"]].map(([l,v,c])=>(
                        <Box key={l} sx={{ flex:1, textAlign:"center", p:1.5,
                          bgcolor:"background.subtle", borderRadius:2 }}>
                          <AppText variant="caption" color="text.disabled">{l}</AppText>
                          <AppText variant="h5" sx={{ color:c, fontWeight:900 }}>{v}</AppText>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Note médicale */}
                  <Box sx={{ p:2, bgcolor:"background.orange", borderRadius:3, mb:3,
                    border:"1px solid", borderColor:"secondary.light",
                    display:"flex", gap:1.5 }}>
                    <WarningAmberIcon sx={{ color:"secondary.main", fontSize:20, flexShrink:0, mt:0.2 }} />
                    <AppText variant="caption" sx={{ color:"text.secondary", lineHeight:1.7 }}>
                      <strong>Important :</strong> Ce résultat est une estimation basée sur des modèles
                      d'apprentissage automatique. Il ne constitue pas un diagnostic médical.
                      Consultez un spécialiste pour un diagnostic officiel.
                    </AppText>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
                    <AppButton size="large" startIcon={<ChatIcon />}
                      onClick={() => navigate(`/chat?childId=${result.childId}`)}>
                      Commencer une conversation
                    </AppButton>
                    <AppButton size="large" variant="outlined" color="secondary"
                      onClick={() => navigate("/dashboard")}>
                      Aller au dashboard
                    </AppButton>
                  </Box>

                  {/* Note légale */}
                  <AppText variant="caption" color="text.disabled"
                    sx={{ display:"block", mt:2.5, lineHeight:1.7 }}>
                    Q-Chat-10 : Allison C, Auyeung B, Baron-Cohen S (2012), JAACAP 51(2):202-12. ·
                    DS Survey : Gouvernement Ontario 2013.
                  </AppText>
                </Box>
              )}
            </Box>
          )}

          {/* ── Boutons navigation (étapes 0-2) ── */}
          {step < 3 && (
            <Box sx={{ display:"flex", gap:2, mt:4 }}>
              {step > 0 && (
                <AppButton variant="outlined" color="secondary"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setStep(s => s-1)} sx={{ flex:1 }}>
                  Retour
                </AppButton>
              )}
              <AppButton
                endIcon={step < 2 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
                onClick={handleNext}
                sx={{ flex: step===0 ? 1 : 2, py:1.5 }}>
                {step === 2 ? "Créer le profil & Analyser" : "Continuer"}
              </AppButton>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

// ── Helper : chip de section ─────────────────────────────────────
function SectionChip({ label, color = "primary" }) {
  return (
    <Divider sx={{ my:2.5 }}>
      <Chip label={label} size="small"
        sx={{
          bgcolor : color === "secondary" ? "background.orange" : "background.blue",
          color   : color === "secondary" ? "secondary.dark"    : "primary.dark",
          fontWeight:700, fontSize:"0.72rem",
        }} />
    </Divider>
  );
}
