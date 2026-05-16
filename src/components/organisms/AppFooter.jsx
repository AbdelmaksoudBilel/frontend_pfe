import { Box } from "@mui/material";
import AppText from "../atoms/AppText";
import logo from "../../assets/logo_pcai.png";

export default function AppFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#1a202c", py: 3, px: { xs: 2, md: "6%" }, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 60, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginBottom: 0.5 }}>
          <img width={50} src={logo} alt="Logo" srcset="" style={{marginBottom:-10}} />
        </Box>
        <Box>
          <Box component="span" sx={{ color: "#4a5568", fontSize: "0.75rem", ml: 1 }}>© 2026 — Parents Chance AI</Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        {["Confidentialité", "Conditions d'utilisation"].map(t => (
          <Box key={t} component="span" sx={{ color: "#4a5568", fontSize: "0.75rem", cursor: "pointer", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>{t}</Box>
        ))}
      </Box>
    </Box>
  );
}
