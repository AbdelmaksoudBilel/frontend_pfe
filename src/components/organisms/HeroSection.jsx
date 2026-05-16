import { Box, Grid, Container } from "@mui/material";
import AppButton      from "../atoms/AppButton";
import AppText        from "../atoms/AppText";
import AppBadge       from "../atoms/AppBadge";
import StatItem       from "../molecules/StatItem";
import ChatBubble     from "../molecules/ChatBubble";
import FloatingBadge  from "../molecules/FloatingBadge";
import logo from "../../assets/logo_pcai.png";
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

export default function HeroSection({ onStart, onLearnMore }) {
  return (
    <Box id="accueil" sx={{
      minHeight: "100vh", bgcolor: "background.default",
      display: "flex", alignItems: "center",
      pt: { xs: 10, md: 11 }, pb: 6,
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: "6%" } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">

          {/* ── Texte gauche ── */}
          <Grid item xs={12} md={6}>
            <AppBadge
              label="Parents Chance AI"
              color="primary.dark" dot
              sx={{ mb: 2.5, bgcolor: "background.blue" }}
            />

            <AppText variant="h1" gutterBottom>
              Accompagnez votre enfant{" "}
              <Box component="span" sx={{ color: "primary.main"   }}>avec</Box>{" "}
              <Box component="span" sx={{ color: "secondary.main" }}>confiance</Box>
            </AppText>

            <AppText variant="body1" sx={{ mb: 4, maxWidth: 460 }}>
              Un assistant IA pour les parents d'enfants présentant un{" "}
              <Box component="strong" sx={{ color: "primary.main"   }}>Trouble du Spectre Autistique</Box> ou une{" "}
              <Box component="strong" sx={{ color: "secondary.main" }}>Déficience Intellectuelle</Box>.
              Conseils personnalisés 24h/24.
            </AppText>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 5 }}>
              <AppButton size="large" onClick={onStart}>Créer mon compte</AppButton>
              <AppButton size="large" variant="outlined" color="secondary" onClick={onLearnMore}>
                En savoir plus
              </AppButton>
            </Box>

            <Box sx={{ display: "flex", gap: { xs: 2.5, md: 4 }, pt: 3, borderTop: "1px solid", borderColor: "divider", flexWrap: "wrap" }}>
              {[["2","Domaines"],["37","Questions"],["24/7","Disponible"],["3","Langues"]].map(([v,l]) => (
                <StatItem key={l} value={v} label={l} color="primary.main" />
              ))}
            </Box>
          </Grid>

          {/* ── Cards flottantes droite ── */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              position: "relative",
              height: { xs: 340, md: 420 },
              "@keyframes float":  { "0%,100%": { transform: "translateY(0)" },  "50%": { transform: "translateY(-10px)" } },
              "@keyframes floatB": { "0%,100%": { transform: "translateY(0)" },  "50%": { transform: "translateY(-6px)"  } },
            }}>

              {/* Card chat */}
              <Box sx={{
                position: "absolute", top: 0, left: "4%", width: "90%",
                bgcolor: "white", borderRadius: 4, p: 3,
                border: "1px solid #f0f8ff",
                boxShadow: "0 20px 60px rgba(59,189,232,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                animation: "float 5s ease-in-out infinite",
              }}>
                {/* Chat header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                    <img width={30} src={logo} alt="Logo" srcset="" />
                  </Box>
                  <Box>
                    <AppText variant="caption" sx={{ fontWeight: 800, color: "text.secondary", display: "block" }}>
                      Parents <Box component="span" sx={{ color: "primary.main" }}>CHANCE</Box> AI
                    </AppText>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                      <AppText variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>En ligne</AppText>
                    </Box>
                  </Box>
                </Box>
                <ChatBubble role="user"      message="Comment gérer les crises de mon enfant TSA ?" />
                <ChatBubble role="assistant" message="Identifiez les déclencheurs sensoriels. Créez un espace calme et utilisez des pictogrammes..." />
              </Box>

              {/* Badge profil */}
              <Box sx={{ position: "absolute", bottom: { xs: 90, md: 100 }, right: { xs: "-2%", md: "-5%" }, zIndex: 2 }}>
                <FloatingBadge icon={<TrackChangesIcon color="primary"/>} title="Profil estimé"  subtitle="TSA · Niveau modéré" color="secondary.main" animName="floatB" />
              </Box>

              {/* Badge progression */}
              <Box sx={{ position: "absolute", bottom: { xs: 10, md: 20 }, left: "2%", zIndex: 2 }}>
                <FloatingBadge icon={<QueryStatsIcon color="secondary"/>} title="Progression" subtitle="+12% ce mois ↑" color="primary.main" animName="float" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
