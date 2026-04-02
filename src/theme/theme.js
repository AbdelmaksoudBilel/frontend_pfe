// src/theme/theme.js
// ─────────────────────────────────────────────────────────────────
// Thème MUI personnalisé — Charte graphique Centre Ma Chance
// Couleurs : Bleu #3BBDE8 (principal) | Orange #F5A623 (secondaire)
// ─────────────────────────────────────────────────────────────────
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // ── Palette ───────────────────────────────────────────────────
  palette: {
    primary: {
      light:       "#7DD6F0",
      main:        "#3BBDE8",   // Bleu Ma Chance
      dark:        "#1A7FA8",
      contrastText:"#ffffff",
    },
    secondary: {
      light:       "#FFCC6F",
      main:        "#F5A623",   // Orange Ma Chance
      dark:        "#D4891A",
      contrastText:"#ffffff",
    },
    success: {
      main: "#48BB78",
      contrastText: "#ffffff",
    },
    error: {
      main: "#F56565",
    },
    background: {
      default: "#ffffff",
      paper:   "#ffffff",
      subtle:  "#F8FBFF",
      blue:    "#EBF7FE",
      orange:  "#FFF8EE",
    },
    text: {
      primary:   "#1a202c",
      secondary: "#64748b",
      disabled:  "#94a3b8",
    },
    divider: "#E2ECF5",
  },

  // ── Typographie ───────────────────────────────────────────────
  typography: {
    fontFamily: "'Nunito', 'Cairo', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.2 },
    h2: { fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", lineHeight: 1.3 },
    h3: { fontWeight: 800, fontSize: "clamp(1.2rem, 2vw, 1.6rem)", lineHeight: 1.4 },
    h4: { fontWeight: 700, fontSize: "1.2rem" },
    h5: { fontWeight: 700, fontSize: "1rem" },
    h6: { fontWeight: 700, fontSize: "0.9rem" },
    body1: { fontSize: "1rem",   lineHeight: 1.8, color: "#64748b" },
    body2: { fontSize: "0.875rem", lineHeight: 1.7, color: "#64748b" },
    caption:{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 },
    button: { fontWeight: 800, textTransform: "none", letterSpacing: 0.3 },
  },

  // ── Shape ─────────────────────────────────────────────────────
  shape: {
    borderRadius: 12,
  },

  // ── Ombres personnalisées ─────────────────────────────────────
  shadows: [
    "none",
    "0 2px 8px rgba(0,0,0,0.04)",
    "0 4px 16px rgba(0,0,0,0.06)",
    "0 8px 24px rgba(59,189,232,0.10)",
    "0 12px 32px rgba(59,189,232,0.12)",
    "0 16px 40px rgba(59,189,232,0.14)",
    "0 20px 50px rgba(59,189,232,0.16)",
    ...Array(19).fill("none"),
  ],

  // ── Overrides composants ──────────────────────────────────────
  components: {
    // Bouton
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 800,
          fontSize: "0.9rem",
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3BBDE8, #1A7FA8)",
          "&:hover": {
            background: "linear-gradient(135deg, #1A9FC4, #15668A)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(59,189,232,0.35) !important",
          },
          transition: "all 0.25s ease",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #F5A623, #D4891A)",
          "&:hover": {
            background: "linear-gradient(135deg, #e09400, #b87315)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(245,166,35,0.35) !important",
          },
          transition: "all 0.25s ease",
        },
        outlinedPrimary: {
          borderWidth: "2px",
          "&:hover": { borderWidth: "2px", backgroundColor: "#EBF7FE" },
        },
        outlinedSecondary: {
          borderWidth: "2px",
          "&:hover": { borderWidth: "2px", backgroundColor: "#FFF8EE" },
        },
        sizeLarge: {
          padding: "14px 36px",
          fontSize: "1rem",
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: "0.8rem",
        },
      },
    },

    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1.5px solid #E2ECF5",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          transition: "transform 0.28s, box-shadow 0.28s, border-color 0.28s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 16px 40px rgba(59,189,232,0.12)",
            borderColor: "#3BBDE8",
          },
        },
      },
    },

    // TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": { borderColor: "#E2ECF5", borderWidth: "1.5px" },
            "&:hover fieldset": { borderColor: "#3BBDE8" },
            "&.Mui-focused fieldset": { borderColor: "#3BBDE8" },
          },
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 8 },
        colorPrimary: { backgroundColor: "#EBF7FE", color: "#1A7FA8" },
        colorSecondary: { backgroundColor: "#FFF8EE", color: "#D4891A" },
      },
    },

    // AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          borderBottom: "1px solid #f0f4f8",
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: { boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
        elevation2: { boxShadow: "0 8px 30px rgba(59,189,232,0.1)" },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 800 },
        colorDefault: { backgroundColor: "#EBF7FE", color: "#1A7FA8" },
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#E2ECF5" },
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1a202c",
          fontSize: "0.75rem",
          borderRadius: 8,
          padding: "6px 12px",
        },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 600 },
      },
    },

    // LinearProgress
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, height: 8, backgroundColor: "#EBF7FE" },
        barColorPrimary: { backgroundColor: "#3BBDE8" },
      },
    },
  },
});

export default theme;
