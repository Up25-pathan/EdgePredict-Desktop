import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMachineId, getDeviceName } from '../utils/hardware';

const LicenseContext = createContext(null);

export const useLicense = () => useContext(LicenseContext);

// ⚠️ UPDATE THIS to your real server URL when deploying!
const LICENSE_API_URL = 'http://localhost:3000/api/activate';

export const LicenseProvider = ({ children }) => {
  const [licenseData, setLicenseData] = useState({
    active: false,
    tier: 'FREE',
    expiryDate: null,
    licenseKey: null
  });
  
  const [loading, setLoading] = useState(true);

  // 1. STARTUP CHECK: "Do we have a saved token?"
  useEffect(() => {
    const checkSavedLicense = async () => {
      setLoading(true);
      const savedToken = localStorage.getItem('edgepredict_token');
      const savedDetails = localStorage.getItem('edgepredict_details');

      if (savedToken && savedDetails) {
        // In a real app, you might ping the server here to verify the token is still valid.
        // For V1, we trust the local file if it exists.
        setLicenseData(JSON.parse(savedDetails));
      }
      setLoading(false);
    };

    checkSavedLicense();
  }, []);

  // 2. ACTIVATE FUNCTION (Calls the Backend)
  const activate = async (key) => {
    setLoading(true);
    
    try {
      // A. Prepare Data for Backend
      const hardwareId = await getMachineId();
      const deviceName = await getDeviceName();
      
      console.log(`Connecting to ${LICENSE_API_URL}...`);

      // B. Send POST Request
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

      // C. Handle Success
      if (data.success) {
        // Determine Tier based on Key Prefix (Client-side logic for UI)
        // Ideally, the backend should return the "tier" in the response too.
        let detectedTier = key.trim().toUpperCase().startsWith('PRO-') ? 'PRO' : 'BASIC';
        
        // Mocking expiry for 1 year (Backend should ideally provide this)
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        const newLicenseState = {
          active: true,
          tier: detectedTier,
          expiryDate: expiry.toISOString(),
          licenseKey: key,
          token: data.token // Save the JWT
        };

        // D. Save to Disk (The "Hidden File")
        localStorage.setItem('edgepredict_token', data.token);
        localStorage.setItem('edgepredict_details', JSON.stringify(newLicenseState));
        
        setLicenseData(newLicenseState);
        setLoading(false);
        return detectedTier;
      } 
      
      // D. Handle Failure
      else {
        throw new Error(data.error || "Activation Failed");
      }

    } catch (err) {
      setLoading(false);
      console.error("Activation Error:", err);
      // Pass the specific error message back to the UI
      throw err.message || "Could not connect to License Server";
    }
  };

  // 3. DEACTIVATE
  const deactivate = () => {
    // Clear local storage
    localStorage.removeItem('edgepredict_token');
    localStorage.removeItem('edgepredict_details');
    // Reset State
    setLicenseData({ active: false, tier: 'FREE', expiryDate: null });
  };

  return (
    <LicenseContext.Provider value={{ 
      isLicensed: licenseData.active, 
      tier: licenseData.tier,         
      details: licenseData,           
      loading, 
      activate, 
      deactivate 
    }}>
      {children}
    </LicenseContext.Provider>
  );
};