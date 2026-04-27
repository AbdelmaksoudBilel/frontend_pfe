// src/pages/EmailSentPage.jsx
// ─────────────────────────────────────────────────────────────────
// Confirmation après inscription — email de vérification envoyé
// ─────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import AppButton from "../components/atoms/AppButton";
import AppText from "../components/atoms/AppText";

import logo from "../assets/logo.png";

import EmailIcon from '@mui/icons-material/Email';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const STEPS = [
  { icon: <EmailIcon color="primary" sx={{ fontSize: 30, mb: -1 }} />, title: "Vérifiez votre email", desc: "Cliquez sur le lien envoyé à votre adresse." },
  { icon: <HourglassTopOutlinedIcon color="primary" sx={{ fontSize: 30, mb: -1 }} />, title: "Validation par l'équipe", desc: "Notre équipe activera votre compte sous 24h." },
  { icon: <QuestionAnswerIcon color="primary" sx={{ fontSize: 30, mb: -3 }} />, title: "Contactez notre équipe", desc: "N'hésitez pas à nous contacter si vous avez des questions." },
];

export default function EmailSentPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF7FE 0%, #ffffff 60%, #FFF8EE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      px: 3, py: 6,
    }}>
      <Paper elevation={2} sx={{
        maxWidth: 500, width: "100%",
        p: { xs: 4, md: 5.5 },
        borderRadius: 4,
        border: "1.5px solid", borderColor: "divider",
        textAlign: "center",
      }}>

        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, mx: "auto", mb: 1.5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>
            <img width={150} src={logo} alt="Logo" srcset="" />
          </Box>
        </Box>

        {/* Icône animée */}
        <Box sx={{
          width: 88, height: 88, borderRadius: "50%",
          bgcolor: "background.blue", mx: "auto", mb: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "pulse 2.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%,100%": { boxShadow: "0 0 0 0 rgba(59,189,232,0.3)" },
            "50%": { boxShadow: "0 0 0 20px rgba(59,189,232,0)" },
          },
        }}>
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />
        </Box>

        <AppText variant="h3" gutterBottom>Compte créé avec succès !</AppText>
        <AppText variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          Un email de confirmation vous a été envoyé. Suivez les étapes
          ci-dessous pour activer votre compte.
        </AppText>

        {/* Étapes */}
        <Box sx={{ mb: 4, textAlign: "left" }}>
          {STEPS.map(({ icon, title, desc }, i) => (
            <Box key={i} sx={{
              display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5,
              p: 2, borderRadius: 3,
              bgcolor: i === 0 ? "background.blue" : "background.subtle",
              border: "1px solid", borderColor: i === 0 ? "primary.light" : "divider",
            }}>
              <Box sx={{ fontSize: 22, flexShrink: 0, mt: 0.2 }}>{icon}</Box>
              <Box>
                <AppText variant="body2" sx={{
                  fontWeight: 700, color: "text.primary",
                  lineHeight: 1.3, mb: 0.3
                }}>
                  {title}
                </AppText>
                <AppText variant="caption" color="text.secondary">{desc}</AppText>
              </Box>
              {i === 0 && (
                <Box sx={{
                  ml: "auto", px: 1.5, py: 0.5, bgcolor: "primary.main",
                  borderRadius: 2, flexShrink: 0
                }}>
                  <AppText variant="caption" sx={{ color: "white", fontWeight: 700 }}>
                    À faire
                  </AppText>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Note approbation */}
        <Box sx={{
          bgcolor: "background.orange", borderRadius: 3, p: 2.5, mb: 4,
          border: "1px solid", borderColor: "secondary.light", textAlign: "left"
        }}>
          <AppText variant="caption" sx={{
            color: "secondary.dark", fontWeight: 800,
            display: "block", mb: 0.6
          }}>
            <HourglassTopOutlinedIcon sx={{ fontSize: 18, mb: -0.5 }} /> Validation manuelle requise
          </AppText>
          <AppText variant="caption" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            Après vérification de votre email, notre équipe validera votre accès
            dans un délai de 24h. Vous recevrez un email de confirmation dès activation.
          </AppText>
        </Box>

        <AppButton fullWidth size="large" endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/login")} sx={{ mb: 2 }}>
          Aller à la connexion
        </AppButton>
        <AppButton fullWidth variant="outlined" color="secondary"
          onClick={() => navigate("/")} size="large">
          Retour à l'accueil
        </AppButton>

      </Paper>
    </Box>
  );
}
