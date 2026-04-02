import React, { createContext, useContext, useState } from 'react';

// Default settings
const DEFAULT_SETTINGS = {
    units: 'metric', 
    solverPrecision: 'standard', 
    heatmapPalette: 'turbo', 
    autoSave: true,
    emailNotifications: true,
    dataRetention: 'forever'
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('edgepredict_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const updateSetting = (key, value) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            localStorage.setItem('edgepredict_settings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('edgepredict_settings', JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);