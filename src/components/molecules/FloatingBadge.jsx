import { Card, Box } from "@mui/material";
import AppText from "../atoms/AppText";
export default function FloatingBadge({ icon, title, subtitle, color = "primary.main", animName = "float" }) {
  return (
    <Card sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      p: 1.5, pr: 2.5, boxShadow: 4,
      animation: `${animName} 5s ease-in-out infinite`,
    }}>
      <Box sx={{ width: 38, height: 38, borderRadius: "11px", bgcolor: "background.blue", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <AppText variant="caption" sx={{ fontWeight: 800, color: "text.primary", display: "block" }}>{title}</AppText>
        <AppText variant="caption" sx={{ color, fontWeight: 700 }}>{subtitle}</AppText>
      </Box>
    </Card>
  );
}
