import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { AcceptInvitationPage } from "./pages/auth/AcceptInvitationPage";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { PengawasDashboard } from "./pages/pengawas/PengawasDashboard";
import { VotingPage } from "./pages/warga/VotingPage";
import { ResultsPage } from "./pages/warga/ResultsPage";

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<VotingPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                <Route path="/superadmin" element={<SuperAdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN", "PENGAWAS"]} />}>
                <Route path="/pengawas" element={<PengawasDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
    </ToastProvider>
  );
};

export default App;