import { Box } from "@mui/material";
import AppText from "../atoms/AppText";
export default function StatItem({ value, label, color = "primary.main" }) {
  return (
    <Box>
      <AppText variant="h3" sx={{ color, fontWeight: 900, lineHeight: 1 }}>{value}</AppText>
      <AppText variant="caption" color="text.disabled" sx={{ mt: 0.4, display: "block" }}>{label}</AppText>
    </Box>
  );
}
