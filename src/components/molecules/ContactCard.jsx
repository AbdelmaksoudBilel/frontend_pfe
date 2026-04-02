import { Card, CardContent, Box } from "@mui/material";
import AppText from "../atoms/AppText";
export default function ContactCard({ icon, label, value, color = "primary.main" }) {
  return (
    <Card sx={{ textAlign: "center", borderTop: "3px solid", borderTopColor: color }}>
      <CardContent sx={{ py: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "13px", bgcolor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, mx: "auto", mb: 1.5 }}>
          {icon}
        </Box>
        <AppText variant="caption" sx={{ color, textTransform: "uppercase", letterSpacing: 2, display: "block", mb: 0.5 }}>{label}</AppText>
        <AppText variant="body2" color="text.primary" sx={{ fontWeight: 600, whiteSpace: "pre-line" }}>{value}</AppText>
      </CardContent>
    </Card>
  );
}
