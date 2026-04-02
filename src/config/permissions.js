// src/config/permissions.js

// 1. Define all available restricted features
export const FEATURES = {
    FORENSICS_LAB: 'forensics_module',
    EXPORT_REPORTS: 'export_reports',
    PROTECT_IP: 'protect_ip' // <--- The IP Vault Feature
};

// 2. Assign features to License Tiers
const TIER_PRIVILEGES = {
    // Basic users get nothing (or add specific basic features here)
    BASIC: [], 
    
    // Pro users get everything
    PRO: [
        FEATURES.FORENSICS_LAB,
        FEATURES.EXPORT_REPORTS,
        FEATURES.PROTECT_IP // <--- ESSENTIAL: This unlocks the vault for Pro users
    ]
};

// 3. Helper function to check access
export const checkPermission = (userTier, feature) => {
    const tier = userTier || 'BASIC'; 
    const allowed = TIER_PRIVILEGES[tier] || [];
    return allowed.includes(feature);
};