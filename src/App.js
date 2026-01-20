// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Layout & Components ---
import Layout from './components/layout/Layout';

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

// --- 3. Context ---
import { useLicense } from './context/LicenseContext';

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
  return (
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
  );
}

export default App;