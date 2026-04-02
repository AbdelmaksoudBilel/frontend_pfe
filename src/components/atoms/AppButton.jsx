// src/components/atoms/AppButton.jsx
// ─────────────────────────────────────────────────────────────────
// ATOME : Bouton réutilisable
// Utilise le thème MUI — variantes : primary | secondary | text | outlined
// ─────────────────────────────────────────────────────────────────
import { Button, CircularProgress } from "@mui/material";

/**
 * @param {string}   variant    - "contained" | "outlined" | "text"
 * @param {string}   color      - "primary" | "secondary"
 * @param {string}   size       - "small" | "medium" | "large"
 * @param {boolean}  loading    - affiche un spinner
 * @param {boolean}  fullWidth
 * @param {function} onClick
 * @param {node}     startIcon
 * @param {node}     endIcon
 */
export default function AppButton({
  children,
  variant   = "contained",
  color     = "primary",
  size      = "medium",
  loading   = false,
  fullWidth = false,
  disabled  = false,
  onClick,
  startIcon,
  endIcon,
  sx        = {},
  type      = "button",
}) {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      sx={{ minWidth: 120, ...sx }}
    >
      {loading ? (
        <CircularProgress
          size={20}
          thickness={4}
          sx={{ color: variant === "contained" ? "white" : "primary.main" }}
        />
      ) : (
        children
      )}
    </Button>
  );
}
