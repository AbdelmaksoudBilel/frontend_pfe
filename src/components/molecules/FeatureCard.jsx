// src/components/molecules/FeatureCard.jsx
// ─────────────────────────────────────────────────────────────────
// MOLÉCULE : Card service/fonctionnalité
// Compose : Card + Icon + AppText
// ─────────────────────────────────────────────────────────────────
import { Card, CardContent, Box } from "@mui/material";
import AppText from "../atoms/AppText";

export default function FeatureCard({ icon, title, description, accentColor = "primary.main", bgColor = "background.blue" }) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Barre accent top */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: accentColor }} />
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "13px", bgcolor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, mb: 2 }}>
          {icon}
        </Box>
        <AppText variant="h5" sx={{ mb: 1 }}>{title}</AppText>
        <AppText variant="body2" color="text.secondary">{description}</AppText>
      </CardContent>
    </Card>
  );
}
