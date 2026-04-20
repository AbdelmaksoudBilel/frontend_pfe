// src/pages/admin/AdminLayout.jsx
// =============================================================================
// Layout admin — sidebar avec : Dashboard, Utilisateurs, Enfants, Évaluations, NLP
// =============================================================================

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Avatar, Divider, IconButton, useMediaQuery,
  useTheme, Chip, Tooltip, AppBar, Toolbar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon, PeopleAlt as PeopleIcon,
  Assignment as EvalIcon, Psychology as NLPIcon,
  Logout as LogoutIcon, Menu as MenuIcon, ChildCare as ChildIcon,
} from "@mui/icons-material";
import AppText from "../../components/atoms/AppText";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";
import logo from "../../assets/logo.png";

const SIDEBAR_W = 260;

const NAV_ITEMS = [
  { labelKey: "admin.dashboard",  path: "/admin",             icon: <DashboardIcon />, color: "#3BBDE8" },
  { labelKey: "admin.users",      path: "/admin/users",        icon: <PeopleIcon />,   color: "#F5A623" },
  { labelKey: "admin.children",   path: "/admin/children",     icon: <ChildIcon />,    color: "#9F7AEA" },
  // { labelKey: "admin.evaluations",path: "/admin/evaluations",  icon: <EvalIcon />,     color: "#48BB78" },
  { labelKey: "admin.nlp",        path: "/admin/nlp",          icon: <NLPIcon />,      color: "#F56565" },
];

function SidebarContent({ location, navigate, onClose, user, logout, t, isRTL }) {
  return (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column",
      bgcolor:"white", borderRight:"1px solid", borderColor:"divider" }}
      dir={isRTL ? "rtl" : "ltr"}>
      {/* Logo */}
      <Box sx={{ px:3, py:2.5, borderBottom:"1px solid", borderColor:"divider" }}>
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <img width={100} src={logo} alt="Logo" />
          <Chip label="Admin" size="small"
            sx={{ bgcolor:"background.orange", color:"secondary.dark", fontWeight:800, fontSize:"0.68rem" }} />
        </Box>
      </Box>

      {/* Profil */}
      <Box sx={{ px:2.5, py:2, borderBottom:"1px solid", borderColor:"divider" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Avatar sx={{ width:38, height:38, bgcolor:"secondary.main", fontWeight:900 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ minWidth:0 }}>
            <AppText variant="body2" sx={{ fontWeight:700, color:"text.primary",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.firstName} {user?.lastName}
            </AppText>
            <AppText variant="caption" color="text.disabled">Administrateur</AppText>
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex:1, py:1.5, overflowY:"auto" }}>
        <AppText variant="caption" sx={{ px:3, mb:1, display:"block", color:"text.disabled",
          fontWeight:700, textTransform:"uppercase", letterSpacing:1.2 }}>
          Menu
        </AppText>
        <List disablePadding>
          {NAV_ITEMS.map(({ labelKey, path, icon, color }) => {
            const active = location.pathname === path ||
              (path !== "/admin" && location.pathname.startsWith(path));
            return (
              <ListItem disablePadding key={path} sx={{ px:1.5, mb:0.3 }}>
                <ListItemButton onClick={() => { navigate(path); if(onClose) onClose(); }}
                  sx={{ borderRadius:2, py:1.2,
                    bgcolor: active ? `${color}18` : "transparent",
                    "&:hover": { bgcolor: active ? `${color}25` : "background.subtle" },
                    transition:"all 0.15s" }}>
                  <ListItemIcon sx={{ minWidth:38 }}>
                    <Box sx={{ color: active ? color : "text.disabled", display:"flex", fontSize:20 }}>{icon}</Box>
                  </ListItemIcon>
                  <ListItemText primary={t(labelKey)}
                    primaryTypographyProps={{ fontSize:"0.875rem", fontWeight: active ? 800 : 600,
                      color: active ? color : "text.secondary" }} />
                  {active && <Box sx={{ width:4, height:24, bgcolor:color, borderRadius:2, ml:1 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p:2, borderTop:"1px solid", borderColor:"divider" }}>
        <ListItemButton onClick={() => { logout(); navigate("/login"); }}
          sx={{ borderRadius:2, py:1, "&:hover":{ bgcolor:"#FFF5F5" } }}>
          <ListItemIcon sx={{ minWidth:36 }}>
            <LogoutIcon sx={{ color:"error.main", fontSize:20 }} />
          </ListItemIcon>
          <ListItemText primary={t("nav.logout")}
            primaryTypographyProps={{ fontSize:"0.85rem", fontWeight:600, color:"error.main" }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const { t, isRTL } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarProps = { location, navigate, user, logout, onClose:()=>setMobileOpen(false), t, isRTL };

  return (
    <Box sx={{ display:"flex", minHeight:"100vh", bgcolor:"#F8FBFF" }}
      dir={isRTL ? "rtl" : "ltr"}>
      {!isMobile && (
        <Box sx={{ width:SIDEBAR_W, flexShrink:0, height:"100vh", position:"sticky", top:0 }}>
          <SidebarContent {...sidebarProps} />
        </Box>
      )}
      {isMobile && (
        <>
          <AppBar position="fixed" elevation={0} sx={{ bgcolor:"white", borderBottom:"1px solid", borderColor:"divider" }}>
            <Toolbar sx={{ justifyContent:"space-between" }}>
              <img width={90} src={logo} alt="Logo" />
              <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                <Chip label="Admin" size="small" sx={{ bgcolor:"background.orange", color:"secondary.dark", fontWeight:800 }} />
                <IconButton onClick={()=>setMobileOpen(true)}><MenuIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer anchor={isRTL?"right":"left"} open={mobileOpen} onClose={()=>setMobileOpen(false)}
            PaperProps={{ sx:{ width:SIDEBAR_W } }}>
            <SidebarContent {...sidebarProps} />
          </Drawer>
        </>
      )}
      <Box sx={{ flex:1, px:{ xs:2, md:4 }, py:{ xs:isMobile?10:4, md:4 }, maxWidth:"100%", overflow:"hidden" }}>
        {children}
      </Box>
    </Box>
  );
}