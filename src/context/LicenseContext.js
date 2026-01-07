import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'; // Tauri v2 import

const LicenseContext = createContext();

export const useLicense = () => useContext(LicenseContext);

export const LicenseProvider = ({ children }) => {
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check on App Startup
  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    try {
      // Call Rust to read the secure file
      const response = await invoke('check_license_status');
      
      if (response.success) {
        setIsLicensed(true);
        setLicenseDetails(response.profile);
      } else {
        setIsLicensed(false);
      }
    } catch (error) {
      console.error("License Check Failed:", error);
      setIsLicensed(false);
    } finally {
      setLoading(false);
    }
  };

  // 2. Activate with Server (via Rust)
  const activateLicense = async (email, key) => {
    setLoading(true);
    try {
      const response = await invoke('activate_license', { email, licenseKey: key });
      
      if (response.success) {
        setIsLicensed(true);
        setLicenseDetails(response.profile);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: "Connection Error: " + error };
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async () => {
    // In real app, call Rust to delete the file
    // For now, we just reset state
    setIsLicensed(false);
    setLicenseDetails(null);
  };

  return (
    <LicenseContext.Provider value={{ isLicensed, licenseDetails, loading, activateLicense, deactivate }}>
      {children}
    </LicenseContext.Provider>
  );
};