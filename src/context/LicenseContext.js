import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMachineId, getDeviceName } from '../utils/hardware';
import { checkPermission } from '../config/permissions'; // <--- IMPORTED RULES

const LicenseContext = createContext(null);

export const useLicense = () => useContext(LicenseContext);

// ⚠️ Production License Server
const LICENSE_API_URL = 'https://omr-server-fww3.onrender.com/api/activate';

// Helper: JWT Decoder
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
};

export const LicenseProvider = ({ children }) => {
  const [licenseData, setLicenseData] = useState({
    active: false,
    tier: 'FREE',
    user: 'Guest',
    expiryDate: null,
    licenseKey: null
  });

  const [loading, setLoading] = useState(true);

  // 1. STARTUP CHECK
  useEffect(() => {
    const checkSavedLicense = async () => {
      setLoading(true);
      const savedToken = localStorage.getItem('edgepredict_token');
      const savedDetails = localStorage.getItem('edgepredict_details');

      if (savedToken && savedDetails) {
        setLicenseData(JSON.parse(savedDetails));
      }
      setLoading(false);
    };

    checkSavedLicense();
  }, []);

  // 2. ACTIVATE FUNCTION
  const activate = async (key) => {
    setLoading(true);

    try {
      const hardwareId = await getMachineId();
      const deviceName = await getDeviceName();

      // --- EMERGENCY RECOVERY BYPASS ---
      if (key === 'DEV-RECOVERY-MODE') {
        console.warn("⚠ USING RECOVERY BYPASS");
        const recoveryState = {
          active: true,
          tier: 'PRO',
          expiryDate: new Date(Date.now() + 31536000000).toISOString(),
          user: 'Recovery Admin',
          licenseKey: key,
          token: 'recovery-token-bypass'
        };
        localStorage.setItem('edgepredict_token', 'recovery-token');
        localStorage.setItem('edgepredict_details', JSON.stringify(recoveryState));
        setLicenseData(recoveryState);
        setLoading(false);
        return 'PRO';
      }

      console.log(`Connecting to ${LICENSE_API_URL}...`);

      const response = await fetch(LICENSE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          hardware_id: hardwareId,
          device_name: deviceName
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        const tokenPayload = decodeToken(data.token);

        // Use tier from server, or fallback to key prefix
        const detectedTier = data.tier || (key.trim().toUpperCase().startsWith('PRO-') ? 'PRO' : 'BASIC');

        const newLicenseState = {
          active: true,
          tier: detectedTier,
          expiryDate: tokenPayload.exp ? new Date(tokenPayload.exp * 1000).toISOString() : new Date(Date.now() + 31536000000).toISOString(),
          user: tokenPayload.email || "Licensed User",
          licenseKey: key,
          token: data.token
        };

        localStorage.setItem('edgepredict_token', data.token);
        localStorage.setItem('edgepredict_details', JSON.stringify(newLicenseState));

        setLicenseData(newLicenseState);
        setLoading(false);
        return newLicenseState.tier;
      }
      else {
        throw new Error(data.error || "Activation Failed");
      }

    } catch (err) {
      setLoading(false);
      console.error("Activation Error:", err);
      throw err.message || "Could not connect to License Server";
    }
  };

  const deactivate = () => {
    localStorage.removeItem('edgepredict_token');
    localStorage.removeItem('edgepredict_details');
    setLicenseData({ active: false, tier: 'FREE', user: 'Guest', expiryDate: null });
  };

  // 3. NEW PERMISSION CHECKER
  // This is what FeatureGate calls to decide "Show or Lock?"
  const canAccess = (featureName) => {
    return checkPermission(licenseData.tier, featureName);
  };

  return (
    <LicenseContext.Provider value={{
      isLicensed: licenseData.active,
      tier: licenseData.tier,
      licenseDetails: licenseData,
      loading,
      activate,
      deactivate,
      canAccess // <--- EXPOSED TO APP
    }}>
      {children}
    </LicenseContext.Provider>
  );
};