// src/pages/SetupChildPage.jsx
// =============================================================================
// Formulaire enfant complet — affiché automatiquement après le 1er login
// Collecte TOUTES les features nécessaires aux modèles ML et DL :
//
//  Étape 1 : Infos de base + photo de visage (CNN)
//  Étape 2 : Q-Chat-10 (ML TSA) + variables comportementales
//  Étape 3 : DS Survey RM (Isolation Forest)
//
// Après soumission → appel API Python /predict automatique
// =============================================================================
import { useState, useRef } from "react";
import { useNavigate }      from "react-router-dom";
import {
  Box, Grid, TextField, MenuItem, Stepper, Step, StepLabel,
  LinearProgress, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, Tooltip, Paper, Divider,
  Alert, Chip,
} from "@mui/material";
import ChildCareIcon      from "@mui/icons-material/ChildCare";
import ArrowForwardIcon   from "@mui/icons-material/ArrowForward";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon   from "@mui/icons-material/InfoOutlined";
import PhotoCameraIcon    from "@mui/icons-material/PhotoCamera";
import DeleteIcon         from "@mui/icons-material/Delete";

import AppButton  from "../components/atoms/AppButton";
import AppText    from "../components/atoms/AppText";
import { useChild } from "../hooks/useChild";
import { useAuth }  from "../hooks/useAuth";

// ── Q-Chat-10 ─────────────────────────────────────────────────────
const QCHAT = [
  { id:"A1",  q:"Est-ce que votre enfant vous regarde lorsque vous l'appelez ?",
    opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"] },
  { id:"A2",  q:"À quel point est-ce facile d'avoir un contact visuel avec votre enfant ?",
    opts:["Très facile","Plutôt facile","Plutôt difficile","Très difficile","Impossible"] },
  { id:"A3",  q:"Est-ce que votre enfant pointe pour indiquer ce qu'il veut avoir ? (ex. jouet hors de portée)",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"] },
  { id:"A4",  q:"Est-ce que votre enfant pointe pour attirer votre attention sur quelque chose qui l'intéresse ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"] },
  { id:"A5",  q:"Est-ce que votre enfant joue à faire semblant ? (ex. poupées, téléphone jouet)",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"] },
  { id:"A6",  q:"Est-ce que votre enfant regarde dans la direction que vous regardez ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"] },
  { id:"A7",  q:"Si vous ou quelqu'un de votre famille est triste, est-ce que votre enfant essaie de le réconforter ?",
    opts:["Toujours","Habituellement","Parfois","Rarement","Jamais"] },
  { id:"A8",  q:"Est-ce que les premiers mots de votre enfant étaient :",
    opts:["Très typique","Plutôt typique","Légèrement inhabituel","Très inhabituel","Mon enfant ne parle pas"] },
  { id:"A9",  q:"Est-ce que votre enfant utilise spontanément des gestes simples ? (ex. saluer de la main)",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"] },
  { id:"A10", q:"Est-ce que votre enfant regarde fixement dans le vide, sans but apparent ?",
    opts:["Plusieurs fois/jour","Quelques fois/jour","Quelques fois/semaine","Moins d'une fois/semaine","Jamais"],
    isA10: true },
];

// ── Variables comportementales supplémentaires ────────────────────
const BEHAV_VARS = [
  { id:"jaundice",         label:"Votre enfant a-t-il eu un ictère (jaunisse) à la naissance ?",
    opts:["Non","Oui"] },
  { id:"familyMemWithASD", label:"Un membre de la famille a-t-il été diagnostiqué TSA ?",
    opts:["Non","Oui"] },
  { id:"speechDelayDisorder", label:"Votre enfant présente-t-il un retard de langage ou trouble du langage ?",
    opts:["Non","Oui"] },
  { id:"learningDisorder",    label:"Votre enfant présente-t-il un trouble de l'apprentissage ?",
    opts:["Non","Oui"] },
  { id:"geneticDisorders",    label:"Votre enfant a-t-il un trouble génétique diagnostiqué ?",
    opts:["Non","Oui"] },
  { id:"depression",          label:"Votre enfant présente-t-il des signes de dépression ?",
    opts:["Non","Oui"] },
  { id:"globalDevelopmentalDelay", label:"Votre enfant a-t-il un retard global de développement ?",
    opts:["Non","Oui"] },
  { id:"socialBehaviouralIssues",  label:"Votre enfant a-t-il des problèmes sociaux ou comportementaux significatifs ?",
    opts:["Non","Oui"] },
  { id:"anxietyDisorder",     label:"Votre enfant présente-t-il un trouble anxieux diagnostiqué ?",
    opts:["Non","Oui"] },
];

// ── DS Survey RM ──────────────────────────────────────────────────
const DS_COMMUNICATION = [
  { id:"PR_QF1A", label:"Quel mode d'expression cette personne utilise-t-elle le plus ?",
    opts:["Langage parlé","Autres modes d'expression","Jamais / que rarement"] },
  { id:"PR_QG1A", label:"Quel mode d'expression cette personne comprend-elle le mieux ?",
    opts:["Langage parlé","Autres modes d'expression","Jamais / que rarement"] },
];

const DS_MOBILITY = [
  { id:"PR_QH1A", label:"À quelle fréquence utilise-t-il/elle une aide à la mobilité (canne, déambulateur, fauteuil) ?",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QH1B", label:"Doit-il/elle utiliser un fauteuil roulant pour la plupart des activités ?",
    opts:["Oui","Non"] },
  { id:"PR_QI1",  label:"À quelle fréquence utilise-t-il/elle des prothèses auditives ou équipements spécialisés (surdité) ?",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QJ1",  label:"À quelle fréquence utilise-t-il/elle des aides visuelles (loupe, braille, canne blanche) ?",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
  { id:"PR_QK1",  label:"À quelle fréquence a-t-il/elle besoin d'aide pour manger ou d'équipement nutritionnel spécialisé ?",
    opts:["Jamais","Rarement","Occasionnellement","Fréquemment","Systématiquement"] },
];

const DS_HEALTH = [
  { id:"PR_QN1_A", label:"Trouble du spectre autistique (autisme, syndrome d'Asperger, TED) ?" },
  { id:"PR_QN1_B", label:"Autre trouble du développement rare (Prader-Willi, Angelman, X fragile, SAF...) ?" },
  { id:"PR_QN1_C", label:"Asthme ou maladie respiratoire nécessitant un équipement spécialisé ?" },
  { id:"PR_QN1_D", label:"Trouble de santé mentale (hors démence / Alzheimer) ?" },
  { id:"PR_QN1_E", label:"Démence ou maladie d'Alzheimer ?" },
  { id:"PR_QN1_F", label:"Diabète (type 1 ou type 2) ?" },
  { id:"PR_QN1_G", label:"Troubles épileptiques, crises ou convulsions ?" },
  { id:"PR_QN1_H", label:"Lésion cérébrale acquise ?" },
];

const DS_HEALTH_OPTS = ["Non","Oui (non diagnostiqué)","Oui (diagnostiqué)"];

const DS_BEHAVIOR = [
  { id:"PR_QO1_A_COMBINE", label:"Agresse-t-il/elle physiquement d'autres personnes ?" },
  { id:"PR_QO1_B_COMBINE", label:"Détruit-il/elle des objets ou meubles ?" },
  { id:"PR_QO1_C_COMBINE", label:"S'inflige-t-il/elle des blessures (se frappe, ingère des objets, morsures) ?" },
  { id:"PR_QO1_D_COMBINE", label:"Manifeste-t-il/elle des comportements sexuels inappropriés ?" },
  { id:"PR_QO1_E_COMBINE", label:"Se livre-t-il/elle au vagabondage ou à des fugues répétées ?" },
];

const DS_BEHAV_OPTS = ["Non","Non (grâce au soutien)","Oui (malgré le soutien)"];

const DS_SUPPORT = [
  { id:"PR_QQ", label:"Niveau de soutien global requis pour les activités quotidiennes :",
    opts:[
      "Soutien non-quotidien (rendez-vous médicaux uniquement)",
      "Soutien quotidien réduit (rappels / incitations occasionnels)",
      "Soutien quotidien modéré (assistance physique fréquente)",
      "Soutien quotidien important (surveillance nuit, sécurité)",
    ] },
];

// ── Score Q-Chat ──────────────────────────────────────────────────
function calcQChat(raw) {
  return QCHAT.reduce((score, q) => {
    const val = raw[q.id];
    if (val === undefined || val === null) return score;
    if (q.isA10) return score + (val <= 2 ? 1 : 0);
    return score + (val >= 2 ? 1 : 0);
  }, 0);
}

const STEPS = ["Infos & Photo", "Q-Chat-10 + Comportement", "DS Survey RM"];

// ═════════════════════════════════════════════════════════════════
export default function SetupChildPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { create, loading } = useChild();

  const [step, setStep]         = useState(0);
  const [fieldErr, setFieldErr] = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const photoInputRef = useRef(null);

  // ── État formulaire ────────────────────────────────────────────
  const [basic, setBasic] = useState({
    firstName: "", lastName: "", birthDate: "", gender: "",
  });
  const [photo, setPhoto]       = useState(null);   // File object
  const [photoPreview, setPhotoPreview] = useState(null);

  const [qchatRaw, setQchatRaw] = useState(
    Object.fromEntries(QCHAT.map(q => [q.id, null]))
  );
  const [behavVars, setBehavVars] = useState(
    Object.fromEntries(BEHAV_VARS.map(v => [v.id, null]))
  );
  const [dsData, setDsData] = useState(
    Object.fromEntries([
      ...DS_COMMUNICATION, ...DS_MOBILITY,
      ...DS_HEALTH, ...DS_BEHAVIOR, ...DS_SUPPORT,
    ].map(v => [v.id, null]))
  );

  // ── Photo ──────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFieldErr(fe => ({ ...fe, photo: "Veuillez sélectionner une image (JPG, PNG)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErr(fe => ({ ...fe, photo: "Image trop volumineuse (max 5 MB)" }));
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFieldErr(fe => ({ ...fe, photo: "" }));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // ── Handlers génériques ────────────────────────────────────────
  const setNum = (setter, id, val) => {
    setter(prev => ({ ...prev, [id]: Number(val) }));
    setFieldErr(fe => ({ ...fe, [id]: "" }));
  };

  // ── Validation par étape ───────────────────────────────────────
  const validateStep0 = () => {
    const e = {};
    if (!basic.firstName.trim()) e.firstName = "Le prénom est requis";
    if (!basic.lastName.trim())  e.lastName  = "Le nom est requis";
    if (!basic.birthDate)        e.birthDate = "La date de naissance est requise";
    if (!basic.gender)           e.gender    = "Le genre est requis";
    if (!photo) e.photo = "La photo de visage est requise pour le modèle CNN";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    QCHAT.forEach(q => {
      if (qchatRaw[q.id] === null) e[q.id] = "Réponse requise";
    });
    BEHAV_VARS.forEach(v => {
      if (behavVars[v.id] === null) e[v.id] = "Réponse requise";
    });
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    [...DS_COMMUNICATION, ...DS_MOBILITY, ...DS_HEALTH, ...DS_BEHAVIOR, ...DS_SUPPORT].forEach(v => {
      if (dsData[v.id] === null) e[v.id] = "Réponse requise";
    });
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ─────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
    if (step === 1 && validateStep1()) setStep(2);
  };

  // ── Soumission finale ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitErr("");

    // Construire le FormData (multipart pour la photo)
    const fd = new FormData();

    // Infos de base
    fd.append("firstName", basic.firstName);
    fd.append("lastName",  basic.lastName);
    fd.append("birthDate", basic.birthDate);
    fd.append("gender",    basic.gender);

    // Photo de visage → CNN
    if (photo) fd.append("facePhoto", photo);

    // Q-Chat-10 binaire
    const qchatScore = calcQChat(qchatRaw);
    QCHAT.forEach(q => {
      const binary = q.isA10
        ? (qchatRaw[q.id] <= 2 ? 1 : 0)
        : (qchatRaw[q.id] >= 2 ? 1 : 0);
      fd.append(q.id, binary);
      fd.append(`${q.id}_raw`, qchatRaw[q.id]);
    });
    fd.append("QChatScore", qchatScore);

    // Variables comportementales
    Object.entries(behavVars).forEach(([k, v]) => fd.append(k, v));

    // DS Survey RM
    Object.entries(dsData).forEach(([k, v]) => fd.append(k, v + 1)); // index → valeur 1-based

    try {
      const result = await create(fd);
      if (result?.payload) navigate("/dashboard");
      else setSubmitErr("Une erreur est survenue. Réessayez.");
    } catch {
      setSubmitErr("Erreur réseau. Vérifiez votre connexion.");
    }
  };

  const qchatScore   = calcQChat(qchatRaw);
  const qchatAnswered = QCHAT.filter(q => qchatRaw[q.id] !== null).length;
  const progress     = (step / STEPS.length) * 100;

  // ═══════════════════════════════════════════════════════════════
  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 55%, #FFF8EE 100%)",
      display: "flex", justifyContent: "center",
      px: 3, py: 6,
    }}>
      <Box sx={{ maxWidth: 680, width: "100%" }}>

        {/* Logo */}
        <Box sx={{ textAlign:"center", mb:4 }}>
          <Box sx={{ width:52,height:52,borderRadius:"14px",mx:"auto",mb:1.5,
            background:"linear-gradient(135deg,#3BBDE8,#1A7FA8)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24, boxShadow:"0 8px 20px rgba(59,189,232,0.3)" }}>☀️</Box>
          <AppText variant="h5" sx={{ fontWeight:900, lineHeight:1 }}>
            Ma<Box component="span" sx={{ color:"primary.main" }}>CHANCE</Box>
          </AppText>
          {user?.firstName && (
            <AppText variant="body2" color="text.secondary" sx={{ mt:0.5 }}>
              Bienvenue <strong>{user.firstName}</strong> — configurons le profil de votre enfant
            </AppText>
          )}
        </Box>

        <Paper elevation={2} sx={{ borderRadius:4, border:"1.5px solid", borderColor:"divider",
          p:{ xs:3, md:5 } }}>

          {/* Titre étape */}
          <AppText variant="h3" sx={{ mb:0.8 }}>
            {step === 0 && "Informations de base & Photo"}
            {step === 1 && "Q-Chat-10 & Variables comportementales"}
            {step === 2 && "DS Survey — Déficience Intellectuelle"}
          </AppText>
          <AppText variant="body2" color="text.secondary" sx={{ mb:3 }}>
            {step === 0 && "Ces informations sont utilisées par les modèles ML et CNN pour l'estimation du profil."}
            {step === 1 && "Le Q-Chat-10 est utilisé par le modèle XGBoost pour la détection TSA."}
            {step === 2 && "Ces questions alimentent le modèle Isolation Forest pour la détection de déficience intellectuelle."}
          </AppText>

          {/* Stepper */}
          <Stepper activeStep={step} sx={{ mb:2.5 }}>
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel sx={{
                  "& .MuiStepLabel-label":{ fontSize:"0.75rem", fontWeight:600 },
                  "& .MuiStepIcon-root.Mui-active":{ color:"primary.main" },
                  "& .MuiStepIcon-root.Mui-completed":{ color:"success.main" },
                }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <LinearProgress variant="determinate" value={progress}
            sx={{ mb:3.5, height:5, borderRadius:8, bgcolor:"background.blue",
              "& .MuiLinearProgress-bar":{ bgcolor:"primary.main" } }} />

          {submitErr && (
            <Alert severity="error" sx={{ mb:2.5, borderRadius:2 }}>
              {submitErr}
            </Alert>
          )}

          {/* ══ ÉTAPE 0 : Infos de base + Photo CNN ══════════════ */}
          {step === 0 && (
            <Box>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Prénom de l'enfant" name="firstName"
                    value={basic.firstName}
                    onChange={e => { setBasic(b=>({...b,firstName:e.target.value})); setFieldErr(fe=>({...fe,firstName:""})); }}
                    error={!!fieldErr.firstName} helperText={fieldErr.firstName}
                    InputProps={{ startAdornment: <Box component="span" sx={{ mr:1, color:"text.disabled" }}><ChildCareIcon fontSize="small"/></Box> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Nom" name="lastName"
                    value={basic.lastName}
                    onChange={e => { setBasic(b=>({...b,lastName:e.target.value})); setFieldErr(fe=>({...fe,lastName:""})); }}
                    error={!!fieldErr.lastName} helperText={fieldErr.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField fullWidth label="Date de naissance" type="date"
                    value={basic.birthDate}
                    onChange={e => { setBasic(b=>({...b,birthDate:e.target.value})); setFieldErr(fe=>({...fe,birthDate:""})); }}
                    error={!!fieldErr.birthDate} helperText={fieldErr.birthDate}
                    InputLabelProps={{ shrink:true }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth select label="Genre"
                    value={basic.gender}
                    onChange={e => { setBasic(b=>({...b,gender:e.target.value})); setFieldErr(fe=>({...fe,gender:""})); }}
                    error={!!fieldErr.gender} helperText={fieldErr.gender}>
                    <MenuItem value="M">👦 Garçon</MenuItem>
                    <MenuItem value="F">👧 Fille</MenuItem>
                  </TextField>
                </Grid>

                {/* Upload photo visage */}
                <Grid item xs={12}>
                  <Divider sx={{ mb:2.5 }}>
                    <Chip label="📸 Photo de visage — Modèle CNN (MobileNetV2)" size="small"
                      sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700, fontSize:"0.72rem" }} />
                  </Divider>

                  <Box sx={{ p:2.5, bgcolor:"background.subtle", borderRadius:3,
                    border:"1px solid", borderColor: fieldErr.photo ? "error.main" : "divider" }}>

                    <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.5, mb:2 }}>
                      <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, mt:0.2, flexShrink:0 }} />
                      <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                        La photo de visage est utilisée par le modèle <strong>MobileNetV2</strong> pour
                        la détection CNN du TSA. Utilisez une photo récente, de face, bien éclairée.
                        La photo est stockée de façon sécurisée et n'est pas partagée.
                      </AppText>
                    </Box>

                    {photoPreview ? (
                      <Box sx={{ display:"flex", alignItems:"center", gap:2.5 }}>
                        <Box
                          component="img" src={photoPreview} alt="Aperçu"
                          sx={{ width:100, height:100, borderRadius:3,
                            objectFit:"cover", border:"2px solid", borderColor:"primary.main" }}
                        />
                        <Box sx={{ flex:1 }}>
                          <AppText variant="body2" sx={{ color:"success.main", fontWeight:700, mb:0.5 }}>
                            ✓ Photo sélectionnée
                          </AppText>
                          <AppText variant="caption" color="text.secondary">
                            {photo?.name} ({(photo?.size / 1024).toFixed(0)} KB)
                          </AppText>
                          <Box sx={{ mt:1 }}>
                            <AppButton variant="outlined" color="secondary" size="small"
                              startIcon={<DeleteIcon />} onClick={removePhoto}>
                              Supprimer
                            </AppButton>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign:"center" }}>
                        <input
                          ref={photoInputRef}
                          type="file" accept="image/*"
                          style={{ display:"none" }}
                          onChange={handlePhotoChange}
                        />
                        <Box sx={{
                          border:"2px dashed", borderColor: fieldErr.photo ? "error.main" : "primary.light",
                          borderRadius:3, p:4, cursor:"pointer",
                          transition:"all 0.2s",
                          "&:hover":{ borderColor:"primary.main", bgcolor:"background.blue" },
                        }} onClick={() => photoInputRef.current?.click()}>
                          <PhotoCameraIcon sx={{ fontSize:40, color:"primary.main", mb:1 }} />
                          <AppText variant="body2" sx={{ fontWeight:700, color:"primary.main" }}>
                            Cliquez pour sélectionner une photo
                          </AppText>
                          <AppText variant="caption" color="text.disabled">
                            JPG, PNG — max 5 MB — photo de visage de face
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

          {/* ══ ÉTAPE 1 : Q-Chat-10 + Variables comportementales ═ */}
          {step === 1 && (
            <Box>
              {/* Compteurs */}
              <Box sx={{ display:"flex", gap:2, mb:3, flexWrap:"wrap" }}>
                <Box sx={{ flex:1, bgcolor:"background.subtle", borderRadius:3, p:2,
                  border:"1px solid", borderColor:"divider", textAlign:"center" }}>
                  <AppText variant="h4" sx={{ color:"primary.main", fontWeight:900 }}>
                    {qchatAnswered}/10
                  </AppText>
                  <AppText variant="caption" color="text.disabled">Q-Chat répondues</AppText>
                </Box>
                <Box sx={{ flex:1, bgcolor:"background.subtle", borderRadius:3, p:2,
                  border:"1px solid", borderColor:"divider", textAlign:"center" }}>
                  <AppText variant="h4" sx={{ fontWeight:900,
                    color: qchatScore >= 3 ? "secondary.main" : "success.main" }}>
                    {qchatScore}/10
                  </AppText>
                  <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0.5 }}>
                    <AppText variant="caption" color="text.disabled">Score Q-Chat</AppText>
                    <Tooltip title="Score ≥ 3 : traits autistiques potentiels. Pas un diagnostic médical.">
                      <InfoOutlinedIcon sx={{ fontSize:14, color:"text.disabled", cursor:"help" }} />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Q-Chat-10 */}
              <Divider sx={{ mb:2.5 }}>
                <Chip label="Q-Chat-10 — Modèle XGBoost TSA" size="small"
                  sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700, fontSize:"0.72rem" }} />
              </Divider>

              {QCHAT.map((item, idx) => (
                <Box key={item.id} sx={{ mb:3, pb:3,
                  borderBottom: "1px solid", borderColor:"divider" }}>
                  <FormControl component="fieldset" error={!!fieldErr[item.id]} fullWidth>
                    <FormLabel component="legend" sx={{ mb:1, fontSize:"0.87rem",
                      fontWeight:600, color:"text.primary", lineHeight:1.6 }}>
                      <Box component="span" sx={{ color:"primary.main", fontWeight:800, mr:1 }}>
                        {idx+1}.
                      </Box>
                      {item.q}
                    </FormLabel>
                    <RadioGroup value={qchatRaw[item.id] ?? ""}
                      onChange={e => setNum(setQchatRaw, item.id, e.target.value)}>
                      {item.opts.map((opt, oi) => (
                        <FormControlLabel key={oi} value={oi}
                          control={<Radio size="small"
                            sx={{ "&.Mui-checked":{ color:"primary.main" } }} />}
                          label={<AppText variant="caption" sx={{ fontSize:"0.82rem" }}>{opt}</AppText>}
                          sx={{ mb:0.2,
                            bgcolor: qchatRaw[item.id] === oi ? "background.blue" : "transparent",
                            borderRadius:2, px:1, transition:"background 0.15s" }}
                        />
                      ))}
                    </RadioGroup>
                    {fieldErr[item.id] && (
                      <AppText variant="caption" sx={{ color:"error.main" }}>{fieldErr[item.id]}</AppText>
                    )}
                  </FormControl>
                </Box>
              ))}

              {/* Variables comportementales */}
              <Divider sx={{ mb:2.5, mt:1 }}>
                <Chip label="Variables comportementales — Modèle ML enrichi" size="small"
                  sx={{ bgcolor:"background.orange", color:"secondary.dark", fontWeight:700, fontSize:"0.72rem" }} />
              </Divider>

              {BEHAV_VARS.map(item => (
                <Box key={item.id} sx={{ mb:2.5, pb:2.5,
                  borderBottom:"1px solid", borderColor:"divider" }}>
                  <FormControl component="fieldset" error={!!fieldErr[item.id]} fullWidth>
                    <FormLabel component="legend" sx={{ mb:1, fontSize:"0.87rem",
                      fontWeight:600, color:"text.primary", lineHeight:1.6 }}>
                      {item.label}
                    </FormLabel>
                    <RadioGroup row value={behavVars[item.id] ?? ""}
                      onChange={e => setNum(setBehavVars, item.id, e.target.value)}>
                      {item.opts.map((opt, oi) => (
                        <FormControlLabel key={oi} value={oi}
                          control={<Radio size="small"
                            sx={{ "&.Mui-checked":{ color:"primary.main" } }} />}
                          label={<AppText variant="caption">{opt}</AppText>}
                          sx={{ bgcolor: behavVars[item.id] === oi ? "background.blue" : "transparent",
                            borderRadius:2, px:1, transition:"background 0.15s" }}
                        />
                      ))}
                    </RadioGroup>
                    {fieldErr[item.id] && (
                      <AppText variant="caption" sx={{ color:"error.main" }}>{fieldErr[item.id]}</AppText>
                    )}
                  </FormControl>
                </Box>
              ))}
            </Box>
          )}

          {/* ══ ÉTAPE 2 : DS Survey RM ════════════════════════════ */}
          {step === 2 && (
            <Box>
              {/* Communication */}
              <Divider sx={{ mb:2.5 }}>
                <Chip label="Communication" size="small"
                  sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700 }} />
              </Divider>
              {DS_COMMUNICATION.map(item => (
                <QuestionBlock key={item.id} item={item} values={dsData} onChange={setNum}
                  setter={setDsData} errors={fieldErr} />
              ))}

              {/* Mobilité & équipements */}
              <Divider sx={{ my:2.5 }}>
                <Chip label="Mobilité & Équipements spécialisés" size="small"
                  sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700 }} />
              </Divider>
              {DS_MOBILITY.map(item => (
                <QuestionBlock key={item.id} item={item} values={dsData} onChange={setNum}
                  setter={setDsData} errors={fieldErr} />
              ))}

              {/* Santé */}
              <Divider sx={{ my:2.5 }}>
                <Chip label="Problèmes de santé" size="small"
                  sx={{ bgcolor:"background.orange", color:"secondary.dark", fontWeight:700 }} />
              </Divider>
              {DS_HEALTH.map(item => (
                <QuestionBlock key={item.id} item={{ ...item, opts: DS_HEALTH_OPTS }}
                  values={dsData} onChange={setNum} setter={setDsData} errors={fieldErr} />
              ))}

              {/* Comportement */}
              <Divider sx={{ my:2.5 }}>
                <Chip label="Traits comportementaux" size="small"
                  sx={{ bgcolor:"background.orange", color:"secondary.dark", fontWeight:700 }} />
              </Divider>
              {DS_BEHAVIOR.map(item => (
                <QuestionBlock key={item.id} item={{ ...item, opts: DS_BEHAV_OPTS }}
                  values={dsData} onChange={setNum} setter={setDsData} errors={fieldErr} />
              ))}

              {/* Niveau de soutien */}
              <Divider sx={{ my:2.5 }}>
                <Chip label="Niveau de soutien global — Variable cible PR_QQ" size="small"
                  sx={{ bgcolor:"background.blue", color:"primary.dark", fontWeight:700 }} />
              </Divider>
              {DS_SUPPORT.map(item => (
                <QuestionBlock key={item.id} item={item} values={dsData} onChange={setNum}
                  setter={setDsData} errors={fieldErr} />
              ))}

              {/* Note */}
              <Box sx={{ mt:2, p:2, bgcolor:"background.blue", borderRadius:3,
                border:"1px solid", borderColor:"primary.light",
                display:"flex", gap:1.5 }}>
                <InfoOutlinedIcon sx={{ color:"primary.main", fontSize:18, flexShrink:0, mt:0.2 }} />
                <AppText variant="caption" sx={{ color:"primary.dark", lineHeight:1.7 }}>
                  Ces données sont transmises au modèle <strong>Isolation Forest</strong> pour
                  estimer si le profil correspond à une déficience intellectuelle (RM).
                  Elles ne constituent pas un diagnostic médical.
                </AppText>
              </Box>
            </Box>
          )}

          {/* ── Boutons ──────────────────────────────────────────── */}
          <Box sx={{ display:"flex", gap:2, mt:4 }}>
            {step > 0 && (
              <AppButton variant="outlined" color="secondary"
                startIcon={<ArrowBackIcon />}
                onClick={() => setStep(s=>s-1)} sx={{ flex:1 }}>
                Retour
              </AppButton>
            )}
            {step < 2 ? (
              <AppButton endIcon={<ArrowForwardIcon />}
                onClick={handleNext} sx={{ flex: step===0 ? 1 : 2, py:1.5 }}>
                Continuer
              </AppButton>
            ) : (
              <AppButton endIcon={!loading && <CheckCircleIcon />}
                loading={loading} onClick={handleSubmit}
                sx={{ flex:2, py:1.5 }}>
                Créer le profil & Lancer la prédiction
              </AppButton>
            )}
          </Box>
        </Paper>

        {/* Note légale */}
        <AppText variant="caption" color="text.disabled"
          sx={{ textAlign:"center", display:"block", mt:2.5, lineHeight:1.7, px:2 }}>
          Q-Chat-10 : Allison C, Auyeung B, Baron-Cohen S (2012), JAACAP 51(2):202-12.
          DS Survey : Gouvernement de l'Ontario — Developmental Services Survey 2013.
          Ces données sont utilisées uniquement pour l'estimation du profil d'accompagnement.
        </AppText>
      </Box>
    </Box>
  );
}

// ── Composant question réutilisable ───────────────────────────────
function QuestionBlock({ item, values, setter, errors }) {
  const setNum = (id, val) => {
    setter(prev => ({ ...prev, [id]: Number(val) }));
  };
  return (
    <Box sx={{ mb:2.5, pb:2.5, borderBottom:"1px solid", borderColor:"divider" }}>
      <FormControl component="fieldset" error={!!errors[item.id]} fullWidth>
        <FormLabel component="legend" sx={{ mb:1, fontSize:"0.87rem",
          fontWeight:600, color:"text.primary", lineHeight:1.6 }}>
          {item.label}
        </FormLabel>
        <RadioGroup row={item.opts.length <= 3} value={values[item.id] ?? ""}
          onChange={e => setNum(item.id, e.target.value)}>
          {item.opts.map((opt, oi) => (
            <FormControlLabel key={oi} value={oi}
              control={<Radio size="small"
                sx={{ "&.Mui-checked":{ color:"primary.main" } }} />}
              label={<AppText variant="caption" sx={{ fontSize:"0.82rem" }}>{opt}</AppText>}
              sx={{ mb:0.2,
                bgcolor: values[item.id] === oi ? "background.blue" : "transparent",
                borderRadius:2, px:1, transition:"background 0.15s" }}
            />
          ))}
        </RadioGroup>
        {errors[item.id] && (
          <AppText variant="caption" sx={{ color:"error.main" }}>{errors[item.id]}</AppText>
        )}
      </FormControl>
    </Box>
  );
}
