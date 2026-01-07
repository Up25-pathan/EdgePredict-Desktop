import React, { useState, useEffect } from 'react';
import { 
    Save, Monitor, HardDrive, Shield, AlertCircle, 
    CheckCircle, Zap, Sliders, Server, Cpu, 
    QrCode, LogOut, FileKey, Activity, RefreshCw // <--- ADDED RefreshCw HERE
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLicense } from '../context/LicenseContext';

const SettingsPage = () => {
    const { settings, saveSettings } = useSettings();
    const { licenseDetails, deactivate } = useLicense();
    
    const [activeTab, setActiveTab] = useState('solver');
    const [formData, setFormData] = useState(settings);
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => { setFormData(settings); }, [settings]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
        setSaveStatus('idle');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            saveSettings(formData);
            setSaveStatus('success');
            setIsDirty(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 800);
    };

    const handleReset = () => {
        setFormData(settings);
        setIsDirty(false);
    };

    const tabs = [
        { id: 'solver', label: 'Physics Engine', icon: Zap },
        { id: 'graphics', label: 'Graphics & Viewport', icon: Monitor },
        { id: 'storage', label: 'Data & Storage', icon: HardDrive },
        { id: 'license', label: 'License & System', icon: Shield },
    ];

    const PALETTE_GRADIENTS = {
        'turbo': 'linear-gradient(90deg, #23171b 0%, #4a98cb 25%, #9ce667 50%, #f9d134 75%, #900c00 100%)',
        'inferno': 'linear-gradient(90deg, #000004 0%, #420a68 25%, #932667 50%, #dd513a 75%, #fca50a 100%)',
        'viridis': 'linear-gradient(90deg, #440154 0%, #3b528b 25%, #21918c 50%, #5ec962 75%, #fde725 100%)'
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
            
            {/* 1. SIDEBAR */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="mb-6 px-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Configuration</h1>
                    <p className="text-gray-500 text-xs mt-1">System Control Panel</p>
                </div>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 2. MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden relative">
                
                {/* UNSAVED CHANGES BAR */}
                {isDirty && (
                    <div className="absolute top-0 left-0 w-full bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 flex justify-between items-center z-20 backdrop-blur-sm animate-fade-in-down">
                        <span className="text-yellow-400 text-xs font-semibold flex items-center">
                            <AlertCircle className="w-3 h-3 mr-2" />
                            Unsaved configuration changes
                        </span>
                        <div className="flex space-x-3">
                            <button onClick={handleReset} className="text-xs text-yellow-400 hover:text-white underline">Reset</button>
                            <button onClick={handleSave} className="text-xs bg-yellow-500 text-black px-3 py-1 rounded font-bold hover:bg-yellow-400">Save Now</button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    
                    {/* --- TAB: PHYSICS --- */}
                    {activeTab === 'solver' && (
                        <div className="space-y-8 animate-fade-in">
                            <SectionHeader title="Solver Configuration" description="Manage computational resources and precision levels." />
                            
                            <SettingRow label="Precision Mode" description="Determines mesh density and time-step duration.">
                                <Select 
                                    value={formData.solverPrecision} 
                                    onChange={(v) => handleChange('solverPrecision', v)}
                                    options={[
                                        { value: 'standard', label: 'Standard (Balanced)' },
                                        { value: 'high', label: 'High Precision (Engineering)' },
                                        { value: 'research', label: 'Research Grade (Sub-Micron)' }
                                    ]}
                                />
                            </SettingRow>

                            <SettingRow label="Multi-Threading" description="Max CPU threads allocated to the matrix solver.">
                                <RangeSlider 
                                    value={formData.cpuThreads || 4} 
                                    min={1} max={32} step={1} unit=" Threads"
                                    onChange={(v) => handleChange('cpuThreads', v)}
                                />
                            </SettingRow>

                            <div className="p-4 bg-indigo-900/10 border border-indigo-500/30 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-white font-semibold flex items-center">
                                            <Cpu className="w-4 h-4 mr-2 text-yellow-400" />
                                            GPU Acceleration (CUDA)
                                        </h4>
                                        <p className="text-gray-400 text-xs mt-1">Offload matrix operations to dedicated GPU memory.</p>
                                    </div>
                                    <Toggle 
                                        checked={formData.gpuEnabled || false} 
                                        onChange={(v) => handleChange('gpuEnabled', v)} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: GRAPHICS --- */}
                    {activeTab === 'graphics' && (
                        <div className="space-y-8 animate-fade-in">
                            <SectionHeader title="Viewport Settings" description="Configure real-time 3D rendering performance." />
                            
                            <SettingRow label="Stress Heatmap Palette" description="Select the scientific color map for results.">
                                <div className="grid grid-cols-3 gap-3 mt-2 w-full md:w-80">
                                    {['turbo', 'inferno', 'viridis'].map(palette => (
                                        <button 
                                            key={palette}
                                            onClick={() => handleChange('heatmapPalette', palette)}
                                            className={`h-12 rounded-lg border overflow-hidden relative transition-all shadow-sm group ${formData.heatmapPalette === palette ? 'border-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-900' : 'border-gray-700 opacity-70 hover:opacity-100'}`}
                                            style={{ background: PALETTE_GRADIENTS[palette] }}
                                        >
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-white uppercase bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                {palette}
                                            </span>
                                            {formData.heatmapPalette === palette && (
                                                <div className="absolute top-1 right-1 bg-white text-indigo-900 rounded-full p-0.5">
                                                    <CheckCircle className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </SettingRow>

                            <SettingRow label="Anti-Aliasing" description="Smooths jagged edges in 3D view (MSAA).">
                                <Toggle checked={formData.antialiasing || true} onChange={(v) => handleChange('antialiasing', v)} />
                            </SettingRow>

                            <SettingRow label="Show Node Mesh" description="Overlay wireframe mesh on top of solid geometry.">
                                <Toggle checked={formData.showMesh || false} onChange={(v) => handleChange('showMesh', v)} />
                            </SettingRow>
                        </div>
                    )}

                    {/* --- TAB: STORAGE --- */}
                    {activeTab === 'storage' && (
                        <div className="space-y-8 animate-fade-in">
                            <SectionHeader title="Data Management" description="Control local storage usage and caching policies." />
                            
                            <SettingRow label="Auto-Save Interval" description="Frequency of writing intermediate checkpoints to disk.">
                                <Select 
                                    value={formData.autoSaveInterval || '5m'} 
                                    onChange={(v) => handleChange('autoSaveInterval', v)}
                                    options={[
                                        { value: 'off', label: 'Off (Manual Only)' },
                                        { value: '5m', label: 'Every 5 Minutes' },
                                        { value: '15m', label: 'Every 15 Minutes' },
                                        { value: 'step', label: 'Every Time Step (Slow)' }
                                    ]}
                                />
                            </SettingRow>

                            <SettingRow label="Result Retention" description="Automatically delete simulation results older than:">
                                <Select 
                                    value={formData.dataRetention} 
                                    onChange={(v) => handleChange('dataRetention', v)}
                                    options={[
                                        { value: 'forever', label: 'Keep Forever' },
                                        { value: '90d', label: '90 Days' },
                                        { value: '1y', label: '1 Year' }
                                    ]}
                                />
                            </SettingRow>
                            
                             <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div>
                                    <h4 className="text-white text-sm font-semibold flex items-center">
                                        <Server className="w-4 h-4 mr-2 text-gray-400" />
                                        Local Cache
                                    </h4>
                                    <p className="text-gray-500 text-xs">Used: 1.2 GB / 50 GB</p>
                                </div>
                                <button className="px-3 py-1.5 bg-gray-700 hover:bg-red-900/30 text-gray-300 hover:text-red-400 text-xs font-medium rounded-lg transition-colors border border-transparent hover:border-red-500/30">
                                    Clear Data
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: LICENSE (THE "QUANTUM KEY" LOOK) --- */}
                    {activeTab === 'license' && (
                        <div className="space-y-8 animate-fade-in">
                            <SectionHeader title="Entitlement" description="Digital access keys and hardware fingerprint." />
                            
                            <div className="flex justify-center py-6">
                                {/* THE QUANTUM KEY CARD */}
                                <div className="relative w-[400px] h-[240px] bg-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden group select-none">
                                    
                                    {/* Animated Glow Border */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                                    
                                    {/* Background Texture */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="absolute right-[-50px] top-[-50px] w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>

                                    {/* Content */}
                                    <div className="relative p-6 h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-2 bg-indigo-900/50 rounded-lg border border-indigo-500/30">
                                                    <FileKey className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <span className="text-indigo-100 font-bold tracking-wider text-sm">ACCESS KEY</span>
                                            </div>
                                            <QrCode className="w-8 h-8 text-white opacity-80" />
                                        </div>

                                        <div className="space-y-1 my-4">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Authorized User</p>
                                            <p className="text-xl text-white font-mono tracking-tight shadow-black drop-shadow-md">
                                                {licenseDetails?.user || 'UNKNOWN_USER'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                    {licenseDetails?.license_type || 'STANDARD'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {licenseDetails?.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-gray-800 pt-4">
                                            <div>
                                                <p className="text-[9px] text-gray-600 uppercase">Hardware ID</p>
                                                <p className="text-[10px] text-gray-400 font-mono">
                                                    {licenseDetails?.machine_id || 'HW-ID-NULL'}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                 <span className="text-[10px] text-emerald-500 font-bold">VALID</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4">
                                <button 
                                    onClick={deactivate}
                                    className="flex items-center px-4 py-2 bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-bold rounded hover:bg-red-900/50 transition-colors"
                                >
                                    <LogOut className="w-3 h-3 mr-2" /> Deactivate Key
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end items-center space-x-4 z-10 relative">
                     {saveStatus === 'success' && (
                        <span className="text-emerald-400 text-sm flex items-center animate-fade-in">
                            <CheckCircle className="w-4 h-4 mr-2" /> Saved
                        </span>
                     )}
                     <button 
                        onClick={handleSave}
                        disabled={!isDirty || saveStatus === 'saving'}
                        className="w-40 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 disabled:shadow-none"
                     >
                         {saveStatus === 'saving' ? (
                             <RefreshCw className="w-4 h-4 animate-spin" />
                         ) : (
                             <>
                                <Save className="w-4 h-4 mr-2" /> Apply
                             </>
                         )}
                     </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const SectionHeader = ({ title, description }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        <div className="h-px bg-gray-800 mt-4 w-full"></div>
    </div>
);

const SettingRow = ({ label, description, children }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-gray-800/50 last:border-0">
        <div className="max-w-md">
            <h4 className="text-sm font-medium text-white">{label}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="w-full md:w-72 shrink-0">
            {children}
        </div>
    </div>
);

const Select = ({ value, onChange, options }) => (
    <div className="relative group">
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-gray-950 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-gray-500"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="absolute right-3 top-3 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
            <Sliders className="w-4 h-4" />
        </div>
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <button 
        type="button" 
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 ring-offset-gray-900 focus:ring-2 focus:ring-indigo-500 ${checked ? 'bg-indigo-600' : 'bg-gray-700'}`}
    >
        <span 
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${checked ? 'right-1' : 'left-1'}`} 
        />
    </button>
);

const RangeSlider = ({ value, onChange, min, max, step, unit }) => (
    <div className="flex items-center space-x-3 w-full">
        <input 
            type="range" 
            min={min} max={max} step={step} 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span className="w-20 text-right font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 shrink-0">
            {value}{unit}
        </span>
    </div>
);

export default SettingsPage;