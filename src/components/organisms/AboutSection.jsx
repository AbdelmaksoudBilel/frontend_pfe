import { Box, Container, Grid, Card, CardContent } from "@mui/material";
import AppText from "../atoms/AppText";
import AppButton from "../atoms/AppButton";
import SectionLabel from "../atoms/SectionLabel";
import logo from "../../assets/logo.png";
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LanguageIcon from '@mui/icons-material/Language';

export default function AboutSection() {
  return (
    <Box id="apropos" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.subtle" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: "6%" } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

          {/* Visuel */}
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ width: "100%", height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 3 }}>
                  <img width={250} src={logo} alt="Logo" srcset="" />
                </Box>
                {[[<LocalPharmacyIcon color="primary" sx={{ mb: -0.5 }} />, "Suivi pluridisciplinaire"], [<LibraryBooksIcon color="secondary" sx={{ mb: -0.5 }} />, "Méthodes : DSM-5, TEACCH, PECS"], [<HandshakeIcon color="primary" sx={{ mb: -0.5 }} />, "Accompagnement familial"], [<LanguageIcon color="secondary" sx={{ mb: -0.5 }} />, "Arabe · Français · Anglais"]].map(([ic, t]) => (
                  <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "background.subtle", borderRadius: 2, p: 1.5, mb: 1.2, border: "1px solid", borderColor: "divider" }}>
                    <span style={{ fontSize: 18 }}>{ic}</span>
                    <AppText variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{t}</AppText>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Texte */}
          <Grid item xs={12} md={6}>
            <SectionLabel>À propos</SectionLabel>
            <AppText variant="h2" gutterBottom>
              Un centre dédié aux enfants à{" "}
              <Box component="span" sx={{ color: "primary.main" }}>besoins spécifiques</Box>
            </AppText>
            <AppText variant="body1" sx={{ mb: 2 }}>
              Le <Box component="strong" sx={{ color: "secondary.main" }}>Centre Ma Chance</Box> accompagne les enfants présentant des troubles du développement et leurs familles grâce à une équipe pluridisciplinaire dédiée.
            </AppText>
            <AppText variant="body1" sx={{ mb: 3.5 }}>
              Notre assistant s'appuie sur le <Box component="strong" sx={{ color: "primary.main" }}>DSM-5</Box>, les méthodes <Box component="strong" sx={{ color: "primary.main" }}>TEACCH</Box> et <Box component="strong" sx={{ color: "primary.main" }}>PECS</Box>.
            </AppText>
            {["Ne pose aucun diagnostic médical", "Oriente vers les professionnels de santé", "Données personnelles protégées"].map(t => (
              <Box key={t} sx={{ display: "flex", gap: 1.2, mb: 1.2, alignItems: "center" }}>
                <Box component="span" sx={{ color: "success.main", fontWeight: 800, fontSize: "1.1rem" }}>✓</Box>
                <AppText variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{t}</AppText>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
