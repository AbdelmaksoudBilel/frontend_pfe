// src/components/organisms/Navbar.jsx
// ─────────────────────────────────────────────────────────────────
// ORGANISME : Barre de navigation principale
// Compose : AppBar + NavLink + AppButton + Logo placeholder
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, Drawer, List, ListItem, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AppButton from "../atoms/AppButton";
import NavLink from "../molecules/NavLink";
import logo from "../../assets/logo_pcai.png";
const NAV_ITEMS = [
  { label: "Accueil",        id: "accueil"  },
  { label: "À propos",       id: "apropos"  },
  { label: "Services",       id: "services" },
  { label: "Contact",        id: "contact"  },
];

export default function Navbar({ onStart }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId,   setActiveId]   = useState("accueil");

  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor:      scrolled ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow:    scrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
          borderBottom: scrolled ? "1px solid" : "none",
          borderColor:  "divider",
          transition:   "all 0.3s",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: "6%" }, height: 68, justifyContent: "space-between" }}>

          {/* Logo placeholder */}
          <Box sx={{
            width: { xs: 130, md: 150 }, height: 42,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 0.8, flexShrink: 0, cursor: "pointer",
          }} onClick={() => scrollTo("accueil")}>
            <img width={50} src={logo} alt="Logo" srcset="" />
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 3.5 }}>
              {NAV_ITEMS.map(({ label, id }) => (
                <NavLink key={id} label={label} onClick={() => scrollTo(id)} active={activeId === id} />
              ))}
              <AppButton size="small" onClick={onStart} sx={{ ml: 1 }}>
                Commencer
              </AppButton>
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} color="inherit" sx={{ color: "text.primary" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260, p: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <List disablePadding>
          {NAV_ITEMS.map(({ label, id }) => (
            <ListItem key={id} disablePadding sx={{ mb: 0.5 }}>
              <Box
                onClick={() => scrollTo(id)}
                sx={{ width: "100%", py: 1.5, px: 2, borderRadius: 2, cursor: "pointer",
                  color: activeId === id ? "primary.main" : "text.primary",
                  bgcolor: activeId === id ? "background.blue" : "transparent",
                  fontWeight: 700, fontSize: "0.95rem",
                  "&:hover": { bgcolor: "background.blue", color: "primary.main" },
                  transition: "all 0.2s",
                }}
              >
                {label}
              </Box>
            </ListItem>
          ))}
          <ListItem sx={{ mt: 2 }}>
            <AppButton fullWidth onClick={() => { onStart(); setMobileOpen(false); }}>
              Commencer
            </AppButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
