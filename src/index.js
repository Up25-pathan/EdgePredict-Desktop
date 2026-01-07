import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- 1. IMPORT STYLES (Crucial for Tailwind) ---
import './index.css'; 
import './styles/main.css'; // If you have custom styles here

// --- 2. IMPORT CONTEXTS ---
import App from './App';
import { LicenseProvider } from './context/LicenseContext';
import { SettingsProvider } from './context/SettingsContext';
import { SimulationProvider } from './context/SimulationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap the App in all necessary Providers */}
      <LicenseProvider>
        <SettingsProvider>
          <SimulationProvider>
             <App />
          </SimulationProvider>
        </SettingsProvider>
      </LicenseProvider>
    </BrowserRouter>
  </React.StrictMode>
);