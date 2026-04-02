import { Box, Typography } from "@mui/material";
export default function SectionLabel({ children, color = "primary" }) {
  return (
    <Box sx={{ display: "inline-block", bgcolor: color === "primary" ? "#EBF7FE" : "#FFF8EE", borderRadius: "8px", px: 1.8, py: 0.5, mb: 2 }}>
      <Typography variant="caption" sx={{ color: color === "primary" ? "#1A7FA8" : "#D4891A", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
        {children}
      </Typography>
    </Box>
  );
}
