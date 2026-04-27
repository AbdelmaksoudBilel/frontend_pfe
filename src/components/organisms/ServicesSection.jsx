import { Box, Container, Grid } from "@mui/material";
import AppText from "../atoms/AppText";
import SectionLabel from "../atoms/SectionLabel";
import FeatureCard from "../molecules/FeatureCard";
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssistantIcon from '@mui/icons-material/Assistant';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

const FEATURES = [
  { icon: <AssistantIcon color="secondary" />, title: "Assistant IA", desc: "Conseils basés sur DSM-5, TEACCH et PECS selon le profil de votre enfant.", accent: "primary.main", bg: "background.blue" },
  { icon: <TrackChangesIcon color="secondary" />, title: "Profil Q-Chat-10", desc: "Formulaire de dépistage TSA pour adapter les recommandations.", accent: "primary.main", bg: "background.blue" },
  { icon: <QueryStatsIcon color="secondary" />, title: "Suivi & Évaluation", desc: "2 domaines, 37 questions cliniques et détection de profile.", accent: "primary.main", bg: "background.blue" },
  { icon: <QuestionAnswerIcon color="primary" />, title: "Multilingue", desc: "Réponses en arabe, français et anglais selon votre préférence.", accent: "secondary.main", bg: "background.orange" },
  { icon: <LockIcon color="primary" />, title: "Données sécurisées", desc: "Accès validé par l'équipe. Authentification JWT sécurisée.", accent: "secondary.main", bg: "background.orange" },
  { icon: <PublicIcon color="primary" />, title: "Disponible 24h/24", desc: "Posez vos questions à tout moment, depuis n'importe quel appareil.", accent: "secondary.main", bg: "background.orange" },
];

export default function ServicesSection() {
  return (
    <Box id="services" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: "6%" } }}>
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <SectionLabel color="secondary">Services</SectionLabel>
          <AppText variant="h2" gutterBottom>
            Ce que l'assistant peut faire{" "}
            <Box component="span" sx={{ color: "primary.main" }}>pour vous</Box>
          </AppText>
          <AppText variant="body1" color="text.secondary">Conçu pour les parents d'enfants TSA et DI</AppText>
        </Box>
        <Grid container spacing={2.5}>
          {FEATURES.map(f => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <FeatureCard icon={f.icon} title={f.title} description={f.desc} accentColor={f.accent} bgColor={f.bg} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
