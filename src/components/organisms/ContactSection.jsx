import { Box, Container, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppText     from "../atoms/AppText";
import AppButton   from "../atoms/AppButton";
import SectionLabel  from "../atoms/SectionLabel";
import ContactCard   from "../molecules/ContactCard";
import logo from "../../assets/mini_logo.png";

const CONTACTS = [
  { icon:"📍", label:"Adresse",   value:"Centre Ma Chance\nTunis, Sfax", color:"primary.main"   },
  { icon:"📞", label:"Téléphone", value:"+216 58 662 000",                  color:"secondary.main" },
  { icon:"✉️",  label:"Email",    value:"machance2019@yahoo.com",               color:"primary.main"   },
  { icon:"🕐", label:"Horaires",  value:"LUN – VEN  (SAM)\n7h30 – 17h00   (7h30–13h00)",            color:"secondary.main" },
];

export default function ContactSection() {
  const navigate = useNavigate();
  return (
    <Box id="contact" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.subtle" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: "6%" } }}>
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <SectionLabel>Contact</SectionLabel>
          <AppText variant="h2" gutterBottom>
            Contactez{" "}
            <Box component="span" sx={{ color: "primary.main" }}>le centre</Box>
          </AppText>
          <AppText variant="body1" color="text.secondary">Notre équipe est disponible pour répondre à vos questions</AppText>
        </Box>

        <Grid container spacing={2} sx={{ mb: 7 }}>
          {CONTACTS.map(c => (
            <Grid item xs={6} md={3} key={c.label}>
              <ContactCard {...c} />
            </Grid>
          ))}
        </Grid>

        {/* CTA final */}
        <Box sx={{ bgcolor: "background.default", borderRadius: 4, p: { xs: 4, md: 7 }, textAlign: "center", border: "1.5px solid", borderColor: "divider", boxShadow: "0 12px 40px rgba(59,189,232,0.08)" }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 68, height: 68, mb: 3, fontSize: 26 }}>
            <img width={90} src={logo} alt="Logo" srcset="" />
          </Box>
          <AppText variant="h2" gutterBottom>Prêt à commencer votre accompagnement ?</AppText>
          <AppText variant="body1" sx={{ maxWidth: 500, mx: "auto", mb: 4 }}>
            Créez votre compte, remplissez le profil de votre enfant et accédez à des conseils personnalisés en quelques minutes.
          </AppText>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <AppButton size="large" onClick={() => navigate("/register")}>Créer mon compte gratuitement</AppButton>
            <AppButton size="large" variant="outlined" color="secondary"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
              Voir les services
            </AppButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
