// src/pages/WelcomePage.jsx
// Compose les organismes — aucun style inline ici, tout vient des atomes/molécules/organismes
import { useNavigate } from "react-router-dom";
import Navbar          from "../components/organisms/Navbar";
import HeroSection     from "../components/organisms/HeroSection";
import AboutSection    from "../components/organisms/AboutSection";
import ServicesSection from "../components/organisms/ServicesSection";
import ContactSection  from "../components/organisms/ContactSection";
import AppFooter       from "../components/organisms/AppFooter";
import { Box }         from "@mui/material";

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Navbar onStart={() => navigate("/register")} />
      <HeroSection
        onStart     ={() => navigate("/register")}
        onLearnMore ={() => document.getElementById("apropos")?.scrollIntoView({ behavior: "smooth" })}
      />
      <AboutSection />
      <ServicesSection />
      <ContactSection />
      <AppFooter />
    </Box>
  );
}