import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Layout & Components ---
import Layout from './components/layout/Layout';
import SplashScreen from './components/SplashScreen';

// --- 2. Pages (Check these paths match your folder structure!) ---
import LicensePage from './pages/LicensePage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SimulationSetupPage from './pages/SimulationSetupPage';
import SimulationResultsPage from './pages/SimulationResultsPage';
import SettingsPage from './pages/SettingsPage';

// Libraries
import MaterialLibraryPage from './pages/library/MaterialLibraryPage';
import ToolLibraryPage from './pages/library/ToolLibraryPage';

// Forensics / AI Lab
// ⚠️ IF THIS FAILS, check if the file is in 'pages/' or 'pages/forensics/'
import ForensicsLabPage from './pages/ForensicsLabPage';

// IP Vault
import IpVaultPage from './pages/IpVaultPage';

// --- 3. Context ---
import { useLicense } from './context/LicenseContext';
import { NotificationProvider } from './context/NotificationContext';

// --- 4. License Gatekeeper Component ---
const RequireLicense = ({ children }) => {
  const { isLicensed, loading } = useLicense();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!isLicensed) {
    return <Navigate to="/activate" replace />;
  }

  return children;
};

// --- 5. Main App Component ---
function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        try {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          const appWindow = getCurrentWindow();
          const isFullscreen = await appWindow.isFullscreen();
          await appWindow.setFullscreen(!isFullscreen);
        } catch (err) {
          console.error("Failed to toggle fullscreen:", err);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <NotificationProvider>
      <Routes>
        {/* Public Route: Activation */}
        <Route path="/activate" element={<LicensePage />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <RequireLicense>
            <Layout />
          </RequireLicense>
        }>

          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* NEW: AI Lab Route */}
          <Route path="ai-lab" element={<ForensicsLabPage />} />

          {/* Security */}
          <Route path="ip-vault" element={<IpVaultPage />} />

          {/* Features */}
          <Route path="simulation-setup" element={<SimulationSetupPage />} />
          <Route path="simulation/:id" element={<SimulationResultsPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Libraries */}
          <Route path="library/materials" element={<MaterialLibraryPage />} />
          <Route path="library/tools" element={<ToolLibraryPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;