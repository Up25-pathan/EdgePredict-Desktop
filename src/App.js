import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pages
import LicensePage from './pages/LicensePage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SimulationSetupPage from './pages/SimulationSetupPage';
import SimulationResultsPage from './pages/SimulationResultsPage';
import MaterialLibraryPage from './pages/library/MaterialLibraryPage';
import ToolLibraryPage from './pages/library/ToolLibraryPage';
import SettingsPage from './pages/SettingsPage';

// Context
import { useLicense } from './context/LicenseContext';

// --- The New Gatekeeper (License Check) ---
const RequireLicense = ({ children }) => {
  const { isLicensed, loading } = useLicense();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-indigo-500">Loading System...</div>;
  }

  if (!isLicensed) {
    return <Navigate to="/activate" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* 1. The Entry Point: Activation Screen */}
      <Route path="/activate" element={<LicensePage />} />

      {/* 2. The Main App (Protected by License) */}
      <Route path="/" element={
          <RequireLicense>
            <Layout />
          </RequireLicense>
        }>
        
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />
        
        {/* Core Features */}
        <Route path="simulation-setup" element={<SimulationSetupPage />} />
        <Route path="simulation/:id" element={<SimulationResultsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Libraries */}
        <Route path="library/materials" element={<MaterialLibraryPage />} />
        <Route path="library/tools" element={<ToolLibraryPage />} />
        
        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;