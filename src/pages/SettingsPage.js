import React, { useState, useEffect } from 'react';
import {
    Monitor, Cloud, Save, RefreshCw, Ruler, Zap, Database, User,
    Cpu, Wifi, Key, ShieldCheck, CreditCard, Info, Palette, FileDown,
    Download, Loader2, HelpCircle
} from 'lucide-react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import toast from 'react-hot-toast';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { useLicense } from '../context/LicenseContext';
import SettingsSupportTab from '../components/settings/SettingsSupportTab';

const SettingsPage = () => {
    const { licenseDetails, tier: realTier, deactivate } = useLicense();
    const defaultSettings = {
        units: 'metric',
        physicsDetail: 'high',
        autoSave: true,
        reducedMotion: false,
        compactMode: false,
        telemetry: true,
        twoFactor: false,
        retentionDays: 30,
        theme: 'dark',
        defaultExportFormat: 'PDF',
    };

    // State for various settings
    const [tier, setTier] = useState(realTier || 'BASIC');

    useEffect(() => {
        if (realTier) setTier(realTier);
    }, [realTier]);

    const [units, setUnits] = useState(defaultSettings.units);
    const [physicsDetail, setPhysicsDetail] = useState(defaultSettings.physicsDetail);
    const [autoSave, setAutoSave] = useState(defaultSettings.autoSave);
    const [reducedMotion, setReducedMotion] = useState(defaultSettings.reducedMotion);
    const [compactMode, setCompactMode] = useState(defaultSettings.compactMode);
    const [telemetry, setTelemetry] = useState(defaultSettings.telemetry);
    const [aiTraining, setAiTraining] = useState(true);
    const [twoFactor, setTwoFactor] = useState(defaultSettings.twoFactor);
    const [retentionDays, setRetentionDays] = useState(defaultSettings.retentionDays);
    const [theme, setTheme] = useState(defaultSettings.theme);
    const [defaultExportFormat, setDefaultExportFormat] = useState(defaultSettings.defaultExportFormat);
    const [activeTab, setActiveTab] = useState('general');
    const [syncStatus, setSyncStatus] = useState('All changes saved');
    const [hydrated, setHydrated] = useState(false);

    // Update State
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [updateManifest, setUpdateManifest] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [updateStatus, setUpdateStatus] = useState('idle'); // idle, downloading, done, error

    const checkForUpdates = async () => {
        setCheckingUpdate(true);
        try {
            const update = await check();
            if (update?.available) {
                setUpdateManifest(update);
                setShowUpdateModal(true);
            } else {
                toast.success("EdgePredict is up to date");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to check for updates");
        } finally {
            setCheckingUpdate(false);
        }
    };

    const startUpdate = async () => {
        if (!updateManifest) return;
        setUpdateStatus('downloading');
        setDownloadProgress(0);

        try {
            let downloaded = 0;
            let total = 0;

            await updateManifest.downloadAndInstall((event) => {
                if (event.event === 'Started') {
                    total = event.data.contentLength || 0;
                } else if (event.event === 'Progress') {
                    downloaded += event.data.chunkLength;
                    if (total > 0) setDownloadProgress((downloaded / total) * 100);
                } else if (event.event === 'Finished') {
                    setDownloadProgress(100);
                }
            });

            setUpdateStatus('done');
            setTimeout(async () => {
                await relaunch();
            }, 1000);
        } catch (e) {
            console.error(e);
            setUpdateStatus('error');
            toast.error("Update failed to install");
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem('edgepredict.settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.units) setUnits(parsed.units);
                if (parsed.physicsDetail) setPhysicsDetail(parsed.physicsDetail);
                if (typeof parsed.autoSave === 'boolean') setAutoSave(parsed.autoSave);
                if (typeof parsed.reducedMotion === 'boolean') setReducedMotion(parsed.reducedMotion);
                if (typeof parsed.compactMode === 'boolean') setCompactMode(parsed.compactMode);
                if (typeof parsed.telemetry === 'boolean') setTelemetry(parsed.telemetry);
                if (typeof parsed.aiTraining === 'boolean') setAiTraining(parsed.aiTraining);
                if (typeof parsed.twoFactor === 'boolean') setTwoFactor(parsed.twoFactor);
                if (typeof parsed.retentionDays === 'number') setRetentionDays(parsed.retentionDays);
                if (parsed.theme) setTheme(parsed.theme);
                if (parsed.defaultExportFormat) setDefaultExportFormat(parsed.defaultExportFormat);
            }
        } catch (error) {
            // ignore malformed settings
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        const payload = { units, physicsDetail, autoSave, reducedMotion, compactMode, telemetry, aiTraining, twoFactor, retentionDays, theme, defaultExportFormat };
        localStorage.setItem('edgepredict.settings', JSON.stringify(payload));
        setSyncStatus('Saving...');
        const timer = setTimeout(() => setSyncStatus('All changes saved'), 600);
        return () => clearTimeout(timer);
    }, [units, physicsDetail, autoSave, reducedMotion, compactMode, telemetry, aiTraining, twoFactor, retentionDays, theme, defaultExportFormat, hydrated]);

    const handleForceSave = () => {
        const payload = { units, physicsDetail, autoSave, reducedMotion, compactMode, telemetry, aiTraining, twoFactor, retentionDays, theme, defaultExportFormat };
        localStorage.setItem('edgepredict.settings', JSON.stringify(payload));
        setSyncStatus('Saved just now');
        setTimeout(() => setSyncStatus('All changes saved'), 1600);
    };

    const handleReset = () => {
        setUnits(defaultSettings.units);
        setPhysicsDetail(defaultSettings.physicsDetail);
        setAutoSave(defaultSettings.autoSave);
        setReducedMotion(defaultSettings.reducedMotion);
        setCompactMode(defaultSettings.compactMode);
        setTelemetry(defaultSettings.telemetry);
        setAiTraining(true);
        setTwoFactor(defaultSettings.twoFactor);
        setRetentionDays(defaultSettings.retentionDays);
        setTheme(defaultSettings.theme);
        setDefaultExportFormat(defaultSettings.defaultExportFormat);
        setSyncStatus('Defaults restored');
        setTimeout(() => setSyncStatus('All changes saved'), 1600);
    };

    const navItems = [
        { id: 'general', label: 'General & Display', icon: Monitor },
        { id: 'simulation', label: 'Simulation Engine', icon: Zap },
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'account', label: 'Account & License', icon: User },
        { id: 'support', label: 'Support & Help', icon: HelpCircle },
        { id: 'about', label: 'About', icon: Info },
    ];

    const tabDescriptions = {
        general: 'Display, units, and UI behavior preferences.',
        simulation: 'Solver accuracy, performance, and engine controls.',
        data: 'Storage, autosave, export defaults, and telemetry policies.',
        account: 'Profile, license, and security settings.',
        support: 'Contact support, report bugs, and request features.',
        about: 'Application version, build, and engine information.',
    };

    const activeMeta = navItems.find((item) => item.id === activeTab);

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

            <div className="mb-6 border-b border-studio-border/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-studio-text-main tracking-tight font-display">System Configuration</h1>
                    <p className="text-sm text-studio-text-muted mt-1">Global preferences, physics engine tuning, and account settings.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReset}>
                        Restore Defaults
                    </Button>
                    <Button variant="secondary" size="sm" icon={Save} onClick={handleForceSave}>
                        Save Snapshot
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Navigation Sidebar (Inner) */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === item.id
                                ? 'bg-studio-surface/80 text-studio-primary ring-1 ring-studio-primary/20'
                                : 'text-studio-text-muted hover:bg-studio-surface/50 hover:text-studio-text-main'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <div className="mt-4 px-3 py-2 text-xs text-studio-text-dim border border-studio-border/60 rounded-lg bg-studio-panel/70">
                        Preferences are stored locally on this device.
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-studio-text-main font-display">{activeMeta?.label}</h2>
                            <p className="text-xs text-studio-text-muted mt-1">{tabDescriptions[activeTab]}</p>
                        </div>
                    </div>

                    {activeTab === 'general' && (
                        <>
                            <Panel title="Engineering Standards">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-studio-surface/70 rounded-lg text-studio-text-muted">
                                                <Ruler className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-studio-text-main">Unit System</h4>
                                                <p className="text-xs text-studio-text-muted mt-1 max-w-sm">
                                                    Select your preferred system of measurement for length, force, and temperature.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex bg-studio-surface/70 p-1 rounded-lg border border-studio-border/70">
                                            <button
                                                onClick={() => setUnits('metric')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${units === 'metric' ? 'bg-studio-panel/90 shadow-soft text-studio-primary' : 'text-studio-text-muted hover:text-studio-text-main'}`}
                                            >
                                                Metric (mm/N)
                                            </button>
                                            <button
                                                onClick={() => setUnits('imperial')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${units === 'imperial' ? 'bg-studio-panel/90 shadow-soft text-studio-primary' : 'text-studio-text-muted hover:text-studio-text-main'}`}
                                            >
                                                Imperial (in/lbf)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Appearance">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-studio-surface/70 rounded-lg text-studio-text-muted">
                                                <Palette className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-studio-text-main">Theme</h4>
                                                <p className="text-xs text-studio-text-muted mt-1 max-w-sm">
                                                    Choose your interface color scheme.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex bg-studio-surface/70 p-1 rounded-lg border border-studio-border/70">
                                            {['dark', 'light', 'system'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTheme(t)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${theme === t ? 'bg-studio-panel/90 shadow-soft text-studio-primary' : 'text-studio-text-muted hover:text-studio-text-main'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Display & Workflow">
                                <div className="space-y-4">
                                    <ToggleSetting
                                        label="Compact Mode"
                                        description="Reduce spacing for dense workflows"
                                        value={compactMode}
                                        onChange={() => setCompactMode(!compactMode)}
                                    />
                                    <ToggleSetting
                                        label="Reduced Motion"
                                        description="Disable motion-heavy transitions"
                                        value={reducedMotion}
                                        onChange={() => setReducedMotion(!reducedMotion)}
                                    />
                                </div>
                            </Panel>
                        </>
                    )}

                    {activeTab === 'simulation' && (
                        <>
                            <Panel title="Physics Engine Configuration">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-studio-surface/70 rounded-lg text-studio-text-muted">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-studio-text-main">Solver Precision</h4>
                                            <p className="text-xs text-studio-text-muted mt-1 mb-3">
                                                Higher precision increases simulation accuracy but requires more GPU compute time.
                                            </p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Low (Draft)', 'Medium (Standard)', 'High (Scientific)'].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${physicsDetail === level.split(' ')[0].toLowerCase()
                                                            ? 'border-studio-primary/60 bg-studio-primary/10 text-studio-primary ring-1 ring-studio-primary/30'
                                                            : 'border-studio-border/70 hover:border-studio-primary/40'
                                                            }`}
                                                        onClick={() => setPhysicsDetail(level.split(' ')[0].toLowerCase())}
                                                    >
                                                        <span className="text-xs font-bold">{level}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                            <Panel title="Execution Controls">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-studio-border/70 rounded-lg p-3">
                                        <div className="text-xs text-studio-text-muted">GPU Allocation</div>
                                        <div className="text-sm font-semibold text-studio-text-main mt-1">Balanced</div>
                                        <p className="text-xs text-studio-text-muted mt-2">Optimized for accuracy + throughput.</p>
                                    </div>
                                    <div className="border border-studio-border/70 rounded-lg p-3">
                                        <div className="text-xs text-studio-text-muted">Thermal Safety</div>
                                        <div className="text-sm font-semibold text-studio-text-main mt-1">Auto Throttle</div>
                                        <p className="text-xs text-studio-text-muted mt-2">Prevent thermal runaway on heavy runs.</p>
                                    </div>
                                </div>
                            </Panel>
                        </>
                    )}

                    {activeTab === 'data' && (
                        <>
                            <Panel title="Data Management">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex gap-3 items-center">
                                            <Cloud className="w-4 h-4 text-studio-text-dim" />
                                            <div>
                                                <span className="text-sm font-semibold text-studio-text-main block">Auto-Save Checkpoints</span>
                                                <span className="text-xs text-studio-text-muted">Save simulation state every 500ms</span>
                                            </div>
                                        </div>
                                        <Toggle value={autoSave} onChange={() => setAutoSave(!autoSave)} />
                                    </div>

                                    <ToggleSetting
                                        label="Telemetry Upload"
                                        description="Share anonymized diagnostics to improve models"
                                        value={telemetry}
                                        onChange={() => setTelemetry(!telemetry)}
                                    />

                                    {/* AI Training Opt-in */}
                                    <div className="border-t border-studio-border/30 mt-2 pt-4">
                                        <ToggleSetting
                                            label="AI Training Contribution"
                                            description="Allow uploading tool images to fine-tune the Forensic AI model"
                                            value={aiTraining}
                                            onChange={() => setAiTraining(!aiTraining)}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Export Preferences">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-studio-surface/70 rounded-lg text-studio-text-muted">
                                                <FileDown className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-studio-text-main">Default Export Format</h4>
                                                <p className="text-xs text-studio-text-muted mt-1 max-w-sm">
                                                    Preferred format when exporting simulation and forensic reports.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex bg-studio-surface/70 p-1 rounded-lg border border-studio-border/70">
                                            {['PDF', 'Excel', 'PPT', 'XML'].map((fmt) => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => setDefaultExportFormat(fmt)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${defaultExportFormat === fmt ? 'bg-studio-panel/90 shadow-soft text-studio-primary' : 'text-studio-text-muted hover:text-studio-text-main'}`}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Retention Policy">
                                <div className="space-y-3">
                                    <div className="text-xs text-studio-text-muted">Local cache retention</div>
                                    <div className="flex gap-2">
                                        {[7, 30, 90].map((days) => (
                                            <button
                                                key={days}
                                                onClick={() => setRetentionDays(days)}
                                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${retentionDays === days
                                                    ? 'border-studio-primary/60 bg-studio-primary/10 text-studio-primary'
                                                    : 'border-studio-border/70 text-studio-text-main hover:border-studio-primary/40'
                                                    }`}
                                            >
                                                {days} days
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Panel>
                        </>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* User Profile Section */}
                            <Panel title="User Profile">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-studio-secondary/20 to-studio-primary/20 rounded-full flex items-center justify-center text-studio-primary border border-studio-primary/30 shadow-inner">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-studio-text-main">{licenseDetails?.user || 'Guest User'}</h4>
                                        <div className="flex gap-4 mt-1 text-xs text-studio-text-muted">
                                            <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {licenseDetails?.device_name || 'Unknown Device'}</span>
                                            <span className="flex items-center gap-1"><Cloud className="w-3 h-3" /> ID: {licenseDetails?.licenseKey ? '••••' + licenseDetails.licenseKey.slice(-4) : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-studio-text-muted uppercase tracking-wider mb-1">Status</div>
                                        <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${licenseDetails?.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-studio-danger/10 text-studio-danger border border-studio-danger/20'}`}>
                                            {licenseDetails?.active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            {/* License Access Card UI */}
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className={`relative w-96 h-56 rounded-xl shadow-2xl transition-all duration-500 transform hover:scale-105 perspective-1000 ${tier === 'PRO'
                                    ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-purple-500/50'
                                    : 'bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-gray-400/50'
                                    }`}>
                                    {/* Glassmorphism Overlay/Texture */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-xl"></div>
                                    <div className={`absolute inset-0 rounded-xl ${tier === 'PRO' ? 'bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent' : 'bg-gradient-to-tr from-transparent via-white/40 to-transparent'}`}></div>

                                    {/* Card Content Grid */}
                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">

                                        {/* Header: Chip & Contactless */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <Wifi className={`w-6 h-6 rotate-90 ${tier === 'PRO' ? 'text-white/80' : 'text-gray-600/80'}`} />
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-bold tracking-widest uppercase ${tier === 'PRO' ? 'text-purple-300' : 'text-gray-600'}`}>
                                                    {tier === 'PRO' ? 'Professional' : 'Standard'}
                                                </div>
                                                <div className={`text-[10px] tracking-wider font-mono ${tier === 'PRO' ? 'text-purple-200/60' : 'text-gray-500'}`}>
                                                    ACCESS KEY
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Key / ID Number */}
                                        <div className="mt-2">
                                            <div className={`text-[10px] uppercase tracking-wider mb-1 ${tier === 'PRO' ? 'text-gray-400' : 'text-gray-500'}`}>License ID</div>
                                            <div className={`font-mono text-xl tracking-widest drop-shadow-md flex items-center gap-2 ${tier === 'PRO' ? 'text-white text-shadow-glow' : 'text-gray-800'}`}>
                                                {licenseDetails?.licenseKey
                                                    ? `${licenseDetails.licenseKey.slice(0, 4)} •••• •••• ${licenseDetails.licenseKey.slice(-4)}`
                                                    : '0000 0000 0000 0000'}
                                                {licenseDetails?.active && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                            </div>
                                        </div>

                                        {/* Footer: Name & Expiry */}
                                        <div className="flex justify-between items-end mt-auto">
                                            <div>
                                                <div className={`text-[9px] uppercase tracking-wider mb-0.5 ${tier === 'PRO' ? 'text-gray-400' : 'text-gray-500'}`}>Authorized User</div>
                                                <div className={`font-display font-bold text-lg tracking-wide uppercase ${tier === 'PRO' ? 'text-white' : 'text-gray-800'}`}>
                                                    {licenseDetails?.user || 'UNREGISTERED'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[8px] uppercase tracking-wider mb-0.5 ${tier === 'PRO' ? 'text-gray-400' : 'text-gray-500'}`}>Valid Thru</div>
                                                <div className={`font-mono text-xs font-bold ${tier === 'PRO' ? 'text-white' : 'text-gray-800'}`}>
                                                    {licenseDetails?.expiryDate ? new Date(licenseDetails.expiryDate).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' }) : 'MM/YY'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Holographic Strip Effect (Pro Only) */}
                                    {tier === 'PRO' && (
                                        <div className="absolute right-8 top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none mix-blend-overlay"></div>
                                    )}
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
                                    <div className="bg-studio-panel/50 border border-studio-border/50 p-3 rounded-lg flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tier === 'PRO' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            <Key className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-studio-text-muted">License Type</div>
                                            <div className="text-sm font-bold text-studio-text-main">{tier === 'PRO' ? 'Enterprise Pro' : 'Standard Basic'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-studio-panel/50 border border-studio-border/50 p-3 rounded-lg flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tier === 'PRO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-studio-text-muted">Billing Cycle</div>
                                            <div className="text-sm font-bold text-studio-text-main">Annual (Active)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deactivate License */}
                            <Panel title="Session">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-red-500/10 rounded-lg">
                                            <Key className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-studio-text-main">Deactivate License</h4>
                                            <p className="text-xs text-studio-text-muted mt-1 max-w-md">
                                                This will remove your license from this device and return to the activation screen.
                                                You can reactivate with the same key or a different one at any time.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to deactivate your license? You will need to re-enter your key to use EdgePredict again.')) {
                                                    deactivate();
                                                    window.location.href = '/activate';
                                                }
                                            }}
                                            className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-red-500/20"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: '#ef4444',
                                            }}
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <SettingsSupportTab />
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-6 animate-fadeIn">
                            <Panel title="EdgePredict Application">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-studio-surface/50 rounded-lg border border-studio-border/50">
                                        <div className="w-12 h-12 bg-gradient-to-br from-studio-primary to-studio-accent rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-studio-text-main">EdgePredict Desktop</h3>
                                            <p className="text-xs text-studio-text-muted">Advanced machining simulation & analysis platform</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoRow label="App Version" value="2.2.0" />
                                        <InfoRow label="Build" value="2026.02.16-stable" />
                                        <InfoRow label="Engine Version" value="Core v2.2.0" />
                                        <InfoRow label="UI Framework" value="React 18 + Tauri 2" />
                                        <InfoRow label="Physics Backend" value="CUDA / SPH Solver" />
                                        <InfoRow label="Platform" value="Windows (x86_64)" />
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-studio-border/40">
                                        <div className="text-xs text-studio-text-muted">
                                            Auto-updates enabled
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon={checkingUpdate ? Loader2 : RefreshCw}
                                            onClick={checkForUpdates}
                                            disabled={checkingUpdate}
                                            className={checkingUpdate ? "animate-pulse opacity-70" : ""}
                                        >
                                            {checkingUpdate ? "Checking..." : "Check for Updates"}
                                        </Button>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Components">
                                <div className="space-y-2">
                                    {[
                                        { name: 'Simulation Engine', version: 'v2.2.0', status: 'active' },
                                        { name: 'Forensic AI Model', version: 'v1.4.0', status: 'active' },
                                        { name: 'IP Vault (Encryption)', version: 'AES-256-GCM', status: 'active' },
                                        { name: 'Material Database', version: 'Local SQLite', status: 'active' },
                                        { name: 'Report Generator', version: 'v1.1.0', status: 'active' },
                                    ].map((comp) => (
                                        <div key={comp.name} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-studio-surface/50 transition-colors border border-transparent hover:border-studio-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-sm font-medium text-studio-text-main">{comp.name}</span>
                                            </div>
                                            <span className="text-xs font-mono text-studio-text-dim">{comp.version}</span>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <div className="text-center py-4">
                                <p className="text-xs text-studio-text-dim">
                                    © 2026 EdgePredict — All rights reserved.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-3">
                        <div className="text-xs text-studio-text-muted self-center italic">{syncStatus}</div>
                        <Button variant="primary" icon={Save} onClick={handleForceSave}>Force Save</Button>
                    </div>
                </div>
            </div>
            {showUpdateModal && (
                <UpdateModal
                    manifest={updateManifest}
                    onClose={() => setShowUpdateModal(false)}
                    onUpdate={startUpdate}
                    status={updateStatus}
                    progress={downloadProgress}
                />
            )}
        </div>
    );
};

// --- Reusable Sub-Components ---
const Toggle = ({ value, onChange }) => (
    <div
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${value ? 'bg-studio-primary' : 'bg-studio-border'}`}
        onClick={onChange}
    >
        <div className={`absolute top-1 w-3 h-3 bg-studio-surface rounded-full transition-transform ${value ? 'left-6' : 'left-1'}`}></div>
    </div>
);

const ToggleSetting = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <span className="text-sm font-semibold text-studio-text-main block">{label}</span>
            <span className="text-xs text-studio-text-muted">{description}</span>
        </div>
        <Toggle value={value} onChange={onChange} />
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center p-2.5 bg-studio-surface/30 rounded-lg border border-studio-border/40">
        <span className="text-xs text-studio-text-muted">{label}</span>
        <span className="text-xs font-mono font-semibold text-studio-text-main">{value}</span>
    </div>
);

export default SettingsPage;

const UpdateModal = ({ manifest, onClose, onUpdate, status, progress }) => {
    if (!manifest) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-studio-panel border border-studio-border rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <h3 className="text-lg font-bold text-studio-text-main mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5 text-studio-primary" />
                    Update Available
                </h3>

                <div className="space-y-4">
                    <p className="text-sm text-studio-text-muted">
                        Version <span className="font-mono font-bold text-studio-text-main">{manifest.version}</span> is ready to install.
                    </p>

                    {manifest.body && (
                        <div className="bg-studio-surface/50 p-3 rounded-lg text-xs text-studio-text-secondary max-h-32 overflow-y-auto font-mono custom-scrollbar">
                            {manifest.body}
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="flex gap-3 justify-end mt-4">
                            <Button variant="ghost" onClick={onClose}>Later</Button>
                            <Button variant="primary" icon={Download} onClick={onUpdate}>Update Now</Button>
                        </div>
                    )}

                    {status === 'downloading' && (
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-xs text-studio-text-dim">
                                <span>Downloading...</span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-studio-surface rounded-full overflow-hidden">
                                <div className="h-full bg-studio-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="text-center py-4">
                            <p className="text-sm font-bold text-emerald-400 mb-1">Update Ready!</p>
                            <p className="text-xs text-studio-text-muted">Restarting application...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-2">
                            <p className="text-xs text-red-400">Update failed. Please try again later.</p>
                            <div className="flex justify-center mt-2">
                                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};