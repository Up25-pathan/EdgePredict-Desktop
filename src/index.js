import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import './styles/main.css'; 

import App from './App';
// 👇 REMOVE AuthProvider import
import { LicenseProvider } from './context/LicenseContext';
import { SettingsProvider } from './context/SettingsContext';
import { SimulationProvider } from './context/SimulationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 👇 NO AuthProvider here anymore. Just License. */}
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