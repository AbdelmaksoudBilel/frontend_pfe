// src/pages/admin/AdminLayout.jsx — AVEC SÉLECTEUR DE LANGUE ADMIN
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Avatar, Divider, IconButton, useMediaQuery,
  useTheme, Chip, AppBar, Toolbar, Select, MenuItem,
  FormControl, CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon, PeopleAlt as PeopleIcon,
  Psychology as NLPIcon, Logout as LogoutIcon,
  Menu as MenuIcon, ChildCare as ChildIcon, Language as LangIcon,
} from "@mui/icons-material";
import AppText            from "../../components/atoms/AppText";
import { useAuth }        from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";
import { setUser }        from "../../store/slices/authSlice";
import api                from "../../services/api";
import logo               from "../../assets/logo.png";

const SIDEBAR_W = 260;

const NAV_ITEMS = [
  { path: "/admin",           icon: <DashboardIcon />, color: "#3BBDE8", labelKey: "adminDash.title"     },
  { path: "/admin/users",     icon: <PeopleIcon />,   color: "#F5A623", labelKey: "adminUsers.title"    },
  { path: "/admin/children",  icon: <ChildIcon />,    color: "#9F7AEA", labelKey: "adminChildren.title" },
  { path: "/admin/nlp",       icon: <NLPIcon />,      color: "#F56565", labelKey: "adminNLP.title"      },
];

const LANG_OPTIONS = [
  { value: "fr", flag: "🇫🇷", label: "Français" },
  { value: "ar", flag: "🇹🇳", label: "العربية"  },
  { value: "en", flag: "🇬🇧", label: "English"  },
];

// ── Sélecteur de langue — sauvegarde en DB ────────────────────────────────────
function LangSelector({ user, dispatch, t }) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (newLang) => {
    if (newLang === user?.language) return;
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", { language: newLang });
      // Mettre à jour localStorage + Redux
      const stored  = JSON.parse(localStorage.getItem("mc_user") || "{}");
      localStorage.setItem("mc_user", JSON.stringify({ ...stored, language: newLang }));
      dispatch(setUser(data));
    } catch (e) {
      console.error("[AdminLayout] lang save error:", e.message);
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
        <LangIcon sx={{ fontSize: 15, color: "text.disabled" }} />
        <AppText variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, flex: 1 }}>
          {t("nav.language")}
        </AppText>
        {saving && <CircularProgress size={12} />}
      </Box>
      <FormControl fullWidth size="small">
        <Select value={user?.language || "fr"} onChange={e => handleChange(e.target.value)}
          disabled={saving} sx={{ borderRadius: 2, bgcolor: "background.subtle", fontSize: "0.82rem" }}>
          {LANG_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.82rem" }}>
              {o.flag}&nbsp;{o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

// ── Contenu sidebar ───────────────────────────────────────────────────────────
function SidebarContent({ location, navigate, onClose, user, logout, t, isRTL, dispatch }) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "white", borderRight: "1px solid", borderColor: "divider" }}
      dir={isRTL ? "rtl" : "ltr"}>

      {/* Logo + badge */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img width={100} src={logo} alt="Logo" />
          <Chip label={t("adminLayout.admin")} size="small"
            sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 800, fontSize: "0.68rem" }} />
        </Box>
      </Box>

      {/* Profil admin */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: "secondary.main", fontWeight: 900 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <AppText variant="body2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.firstName} {user?.lastName}
            </AppText>
            <AppText variant="caption" color="text.disabled">{t("adminLayout.administrator")}</AppText>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: "auto" }}>
        <AppText variant="caption" sx={{ px: 3, mb: 1, display: "block", color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
          {t("adminLayout.menu")}
        </AppText>
        <List disablePadding>
          {NAV_ITEMS.map(({ path, icon, color, labelKey }) => {
            const active = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
            return (
              <ListItem disablePadding key={path} sx={{ px: 1.5, mb: 0.3 }}>
                <ListItemButton onClick={() => { navigate(path); onClose?.(); }}
                  sx={{ borderRadius: 2, py: 1.2, bgcolor: active ? `${color}18` : "transparent", "&:hover": { bgcolor: active ? `${color}25` : "background.subtle" }, transition: "all 0.15s" }}>
                  <ListItemIcon sx={{ minWidth: 38 }}>
                    <Box sx={{ color: active ? color : "text.disabled", display: "flex", fontSize: 20 }}>{icon}</Box>
                  </ListItemIcon>
                  <ListItemText primary={t(labelKey)}
                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: active ? 800 : 600, color: active ? color : "text.secondary" }} />
                  {active && <Box sx={{ width: 4, height: 24, bgcolor: color, borderRadius: 2, ml: 1 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Sélecteur langue */}
      <LangSelector user={user} dispatch={dispatch} t={t} />

      {/* Déconnexion */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton onClick={() => { logout(); navigate("/login"); }}
          sx={{ borderRadius: 2, py: 1, "&:hover": { bgcolor: "#FFF5F5" } }}>
          <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon sx={{ color: "error.main", fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary={t("nav.logout")} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600, color: "error.main" }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const navigate     = useNavigate();
  const location     = useLocation();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const { t, isRTL } = useTranslation();
  const dispatch     = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const props = { location, navigate, user, logout, onClose: () => setMobileOpen(false), t, isRTL, dispatch };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FBFF" }} dir={isRTL ? "rtl" : "ltr"}>
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0, height: "100vh", position: "sticky", top: 0 }}>
          <SidebarContent {...props} />
        </Box>
      )}
      {isMobile && (
        <>
          <AppBar position="fixed" elevation={0} sx={{ bgcolor: "white", borderBottom: "1px solid", borderColor: "divider" }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <img width={90} src={logo} alt="Logo" />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label={t("adminLayout.admin")} size="small" sx={{ bgcolor: "background.orange", color: "secondary.dark", fontWeight: 800 }} />
                <IconButton onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer anchor={isRTL ? "right" : "left"} open={mobileOpen} onClose={() => setMobileOpen(false)}
            PaperProps={{ sx: { width: SIDEBAR_W } }}>
            <SidebarContent {...props} />
          </Drawer>
        </>
      )}
      <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: { xs: isMobile ? 10 : 4, md: 4 }, maxWidth: "100%", overflow: "hidden" }}>
        {children}
      </Box>
    </Box>
  );
}