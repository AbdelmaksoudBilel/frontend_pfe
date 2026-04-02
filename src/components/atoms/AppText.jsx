// src/components/atoms/AppText.jsx
// ─────────────────────────────────────────────────────────────────
// ATOME : Typographie réutilisable
// ─────────────────────────────────────────────────────────────────
import { Typography } from "@mui/material";

/**
 * @param {string} variant  - h1|h2|h3|h4|h5|h6|body1|body2|caption|overline
 * @param {string} color    - "primary"|"secondary"|"text.primary"|"text.secondary"|hex
 * @param {string} align    - "left"|"center"|"right"
 * @param {bool}   gutterBottom
 */
export default function AppText({
  children,
  variant      = "body1",
  color,
  align        = "left",
  gutterBottom = false,
  fontWeight,
  sx           = {},
  component,
}) {
  return (
    <Typography
      variant={variant}
      color={color}
      align={align}
      gutterBottom={gutterBottom}
      component={component}
      sx={{
        ...(fontWeight && { fontWeight }),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
