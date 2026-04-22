// src/router/index.jsx — version avec routes admin
// ─────────────────────────────────────────────────────────────────

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
import ChildWizardPage from "../pages/ChildWizardPage";
import ChatPage from "../pages/ChatPage";
import ProfilePage from "../pages/ProfilePage";

// ── Pages Admin ──────────────────────────────────────────────────
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminEvaluations from "../pages/admin/AdminEvaluations";
import AdminNLP from "../pages/admin/AdminNLP";
import AdminChildren from "../pages/admin/AdminChildren";
import DiagnosticPage from "../pages/DiagnosticPage";

// ── Guards ────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  if (user?.role == "admin") return <Navigate to="/admin" replace />;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/chat" replace />;
  return children;
}

// ── Router ────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Publiques ── */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/email-sent" element={<EmailSentPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Publiques uniquement ── */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* ── Privées parent ── */}
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/chat/:convId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/child-wizard" element={<PrivateRoute><ChildWizardPage /></PrivateRoute>} />
        <Route path="/diagnostic/:childId" element={<PrivateRoute><DiagnosticPage /></PrivateRoute>} />
        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/evaluations" element={<AdminRoute><AdminEvaluations /></AdminRoute>} />
        <Route path="/admin/nlp" element={<AdminRoute><AdminNLP /></AdminRoute>} />
        <Route path="/admin/children" element={<AdminRoute><AdminChildren /></AdminRoute>} />

        {/* Redirection /dashboard → selon rôle */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <RedirectByRole />
          </PrivateRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Helper redirection par rôle ──────────────────────────────────
function RedirectByRole() {
  const user = useSelector(selectUser);
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.isFirstLogin) return <Navigate to="/child-wizard" replace />;
  return <Navigate to="/chat" replace />;
}
