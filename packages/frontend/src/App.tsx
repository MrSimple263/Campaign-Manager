import { Routes, Route, Navigate } from "react-router-dom";

import ConfirmModal from "./components/ConfirmModal";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CampaignNewPage from "./pages/CampaignNewPage";
import CampaignsPage from "./pages/CampaignsPage";
import LoginPage from "./pages/LoginPage";
import { useAppSelector } from "./store/hooks";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <CampaignsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/new"
          element={
            <ProtectedRoute>
              <CampaignNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/:id"
          element={
            <ProtectedRoute>
              <CampaignDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/campaigns" replace />} />
        <Route path="*" element={<Navigate to="/campaigns" replace />} />
      </Routes>
      <ConfirmModal />
    </>
  );
}

export default App;
