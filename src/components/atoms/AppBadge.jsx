import { Box, Typography } from "@mui/material";
export default function AppBadge({ label, color = "primary.main", bg, dot = false, sx = {} }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, bgcolor: bg || "#EBF7FE", borderRadius: "8px", px: 1.5, py: 0.5, ...sx }}>
      {dot && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />}
      <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: "0.72rem", letterSpacing: 0.3 }}>{label}</Typography>
    </Box>
  );
}
