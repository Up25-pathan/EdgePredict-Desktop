import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import {
    Play, Activity, Lock,
    Plus, Terminal,
    Cpu, HardDrive, Zap, Database, FileText
} from 'lucide-react';
import MaterialService from '../services/MaterialService';
import ToolService from '../services/ToolService';
import VaultService from '../services/VaultService';

const DashboardPage = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        materials: 0,
        tools: 0,
        vaultAssets: 0,
    });

    const [sysStats, setSysStats] = useState({
        cpu: 0,
        memUsed: 0,
        memTotal: 0,
        gpu: 0,
        gpuMemUsed: 0,
        gpuMemTotal: 0
    });

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const [mats, tools, assets] = await Promise.all([
                    MaterialService.getAll(),
                    ToolService.getAll(),
                    VaultService.listAssets().catch(() => [])
                ]);

                setStats({
                    materials: mats.length,
                    tools: tools.length,
                    vaultAssets: assets.length,
                });
            } catch (err) {
                console.error("Dashboard Stats Fail", err);
            }
        };
        loadCounts();
    }, []);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const data = await invoke('get_system_stats');
                setSysStats({
                    cpu: data.cpu_usage,
                    memUsed: data.memory_used,
                    memTotal: data.memory_total,
                    gpu: data.gpu_usage,
                    gpuMemUsed: data.gpu_memory_used,
                    gpuMemTotal: data.gpu_memory_total
                });
            } catch (e) {
                console.warn("System stats failed:", e);
            }
        };

        fetchSystemStats();
        // Poll every 1 second for smoother UI
        const interval = setInterval(fetchSystemStats, 1000);
        return () => clearInterval(interval);
    }, []);

    const toGB = (bytes) => (bytes / (1024 * 1024 * 1024));
    const memPercent = sysStats.memTotal > 0 ? (sysStats.memUsed / sysStats.memTotal) * 100 : 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="max-w-7xl mx-auto py-6 h-[calc(100vh-6rem)] flex flex-col gap-8"
        >
            {/* HER0 / HEADER */}
            <motion.div variants={itemVariants} className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-semibold text-white tracking-tight">Command Center</h1>
                    <p className="text-sm text-studio-text-muted mt-2 max-w-lg leading-relaxed">System diagnostics and deep-learning engine coordination matrix. Environment stabilized.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Activity className="w-3.5 h-3.5" /> Engine Telemetry Connected
                    </span>
                </div>
            </motion.div>

            {/* LIVE METRICS (Rings) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
                <RingChart 
                    value={sysStats.cpu} 
                    label="CPU Load" 
                    icon={Cpu} 
                    colorClass="text-blue-400" 
                    unit="%" 
                />
                
                <RingChart 
                    value={memPercent} 
                    label="Sys Memory" 
                    icon={HardDrive} 
                    colorClass="text-purple-400" 
                    unit={`/ ${toGB(sysStats.memTotal).toFixed(0)} GB`} 
                />

                <RingChart 
                    value={sysStats.gpu} 
                    label="GPU Cores" 
                    icon={Zap} 
                    colorClass="text-emerald-400" 
                    unit="%" 
                />

                <StatCard
                    label="Indexed Assets"
                    value={stats.materials + stats.tools + stats.vaultAssets}
                    icon={Database}
                    colorClass="text-amber-400"
                />
            </motion.div>

            {/* ACTION PANELS */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                
                {/* QUICK LAUNCH GRID */}
                <div className="w-full lg:w-[45%] grid grid-cols-2 gap-4 shrink-0 auto-rows-fr">
                    <LaunchCard 
                        icon={Play} 
                        label="Compute Node" 
                        description="Configure and launch a new finite element prediction run."
                        onClick={() => navigate('/simulation-setup')} 
                        primary 
                        gradientClass="bg-studio-primary"
                    />
                    <LaunchCard 
                        icon={Plus} 
                        label="Material DB" 
                        description="Add or synthesize new library profiles."
                        onClick={() => navigate('/library/materials')} 
                        gradientClass="bg-blue-500"
                    />
                    <LaunchCard 
                        icon={Lock} 
                        label="IP Vault" 
                        description="Encrypt proprietary models securely."
                        onClick={() => navigate('/ip-vault')} 
                        gradientClass="bg-amber-500"
                    />
                    <LaunchCard 
                        icon={FileText} 
                        label="Report Studio" 
                        description="Generate client-ready deliverables."
                        onClick={() => navigate('/reports')} 
                        gradientClass="bg-purple-500"
                    />
                </div>

                {/* THE TERMINAL (Job Queue) */}
                <div className="flex-1 min-h-0">
                    <JobQueue />
                </div>
            </motion.div>
            
        </motion.div>
    );
};

// --- SUB-COMPONENTS ---

const RingChart = ({ value, label, icon: Icon, colorClass, unit = "%", max = 100 }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min((value / max) * 100, 100);
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative group bg-studio-panel/40 border border-studio-border/50 p-6 rounded-2xl shadow-soft flex flex-col items-center justify-center overflow-hidden hover:bg-studio-panel hover:border-studio-border transition-all">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-studio-surface" />
                    {/* Active track */}
                    <motion.circle 
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        cx="50" cy="50" r={radius} 
                        stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeLinecap="round"
                        className={colorClass}
                        style={{
                            strokeDasharray: circumference,
                            filter: 'drop-shadow(0px 0px 4px currentColor)'
                        }}
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute flex flex-col items-center mt-0.5">
                    <span className="text-xl font-mono font-bold text-white drop-shadow">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                    <span className="text-[9px] font-mono text-studio-text-dim uppercase tracking-widest mt-0.5">{unit}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/20 border border-white/5 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">{label}</span>
            </div>
        </div>
    );
};

// Alternate static tile for counts
const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="relative bg-studio-panel/40 border border-studio-border/50 p-6 rounded-2xl flex flex-col justify-center items-center shadow-soft overflow-hidden hover:bg-studio-panel transition-all">
        <div className={`p-4 rounded-full bg-black/20 mb-3 ${colorClass}`}>
            <Icon className="w-7 h-7 filter drop-shadow-[0_0_8px_currentColor]" />
        </div>
        <div className="text-3xl font-mono font-bold text-white mb-1">{value}</div>
        <div className="text-xs font-semibold text-studio-text-muted uppercase tracking-wider">{label}</div>
    </div>
);

const LaunchCard = ({ icon: Icon, label, description, onClick, primary, gradientClass }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative p-5 rounded-2xl border text-left overflow-hidden group shadow-soft transition-all w-full h-full flex flex-col justify-between
        ${primary 
            ? 'bg-gradient-to-br from-studio-primary/20 to-[#0b1220] border-studio-primary/40 hover:border-studio-primary shadow-[0_4px_30px_rgba(14,165,164,0.15)]' 
            : 'bg-studio-panel/40 border-studio-border/50 hover:bg-studio-panel hover:border-studio-border/80 hover:shadow-lg'
        }`}
    >
        {/* Hover flare glow */}
        <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700 ${gradientClass}`}></div>
        
        <div className={`p-3 w-fit rounded-xl backdrop-blur-sm mb-4 ${primary ? 'bg-studio-primary text-white shadow-md' : 'bg-studio-surface border border-studio-border text-studio-text-dim group-hover:text-white group-hover:bg-studio-surface/50 transition-colors'}`}>
            <Icon className="w-5 h-5" />
        </div>
        
        <div className="relative z-10 z-[2]">
            <h4 className="text-[15px] font-bold text-white mb-1.5">{label}</h4>
            <p className="text-[11px] text-studio-text-muted leading-relaxed hidden sm:block">{description}</p>
        </div>
    </motion.button>
);

const JobQueue = () => (
    <div className="bg-[#040811] border border-studio-border/60 rounded-2xl h-full flex flex-col relative overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-studio-secondary/30 to-transparent"></div>
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/5 bg-black/20 backdrop-blur z-10">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-studio-text-muted tracking-wide uppercase">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Live Feed Terminal
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-studio-text-dim uppercase">Status_Idle</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-transparent to-studio-primary/5">
            <div className="absolute inset-0 app-dots opacity-[0.05] pointer-events-none"></div>
            <Activity className="w-10 h-10 text-studio-border mb-5 animate-pulse duration-[2000ms]" />
            <p className="text-sm font-mono text-studio-text-dim/80 text-center">Awaiting execution payloads...</p>
        </div>
    </div>
);

export default DashboardPage;
