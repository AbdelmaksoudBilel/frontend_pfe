// src/components/atoms/AppInput.jsx
// ─────────────────────────────────────────────────────────────────
// ATOME : Champ de saisie réutilisable (TextField MUI)
// ─────────────────────────────────────────────────────────────────
import { TextField, InputAdornment } from "@mui/material";

export default function AppInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  type        = "text",
  placeholder,
  error       = false,
  helperText,
  required    = false,
  fullWidth   = true,
  disabled    = false,
  multiline   = false,
  rows        = 1,
  startIcon,
  endIcon,
  size        = "medium",
  autoComplete,
  sx          = {},
}) {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      type={type}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      size={size}
      autoComplete={autoComplete}
      sx={sx}
      InputProps={{
        ...(startIcon && {
          startAdornment: (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
        }),
        ...(endIcon && {
          endAdornment: (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }),
      }}
    />
  );
}
