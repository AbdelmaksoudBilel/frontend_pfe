import { Box } from "@mui/material";
export default function NavLink({ label, onClick, active = false }) {
  return (
    <Box component="span" onClick={onClick} sx={{
      color: active ? "primary.main" : "text.secondary",
      fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
      pb: "2px", borderBottom: "2px solid",
      borderBottomColor: active ? "primary.main" : "transparent",
      transition: "all 0.2s",
      "&:hover": { color: "primary.main", borderBottomColor: "primary.main" },
    }}>
      {label}
    </Box>
  );
}
