// src/router/index.jsx — version corrigée
// Ajout : /verify-email route pour le lien du mail de confirmation
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/slices/authSlice";

import WelcomePage from "../pages/WelcomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EmailSentPage from "../pages/EmailSentPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ChildWizardPage     from "../pages/ChildWizardPage";
// import DashboardPage      from "../pages/DashboardPage";
import ChatPage           from "../pages/ChatPage";
import ProfilePage        from "../pages/Profilepage";

// ── Guards ─────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
}

// Redirige vers /setup-child si 1er login (pas encore de fiche enfant)
// function DashboardRoute() {
//   const user   = useSelector(selectUser);
//   const isAuth = useSelector(selectIsAuthenticated);
//   if (!isAuth) return <Navigate to="/login" replace />;
//   if (user?.isFirstLogin) return <Navigate to="/setup-child" replace />;
//   return <DashboardPage />;
// }

// ── Router ──────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Publiques ── */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/email-sent" element={<EmailSentPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />   {/* ← lien du mail */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* ── Publiques uniquement (redirige si connecté) ── */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* ── Privées ── */}
        {/* <Route path="/dashboard" element={<DashboardRoute />} /> */}
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/chat/:convId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/child-wizard"
          element={<PrivateRoute><ChildWizardPage /></PrivateRoute>} />
        {/* <Route path="/diagnostic/:childId"
          element={<PrivateRoute><DiagnosticPage /></PrivateRoute>} /> */}

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}