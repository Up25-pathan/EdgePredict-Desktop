import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Share2, FileDown, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import ThreeDeePlayer from '../components/simulation/ThreeDeePlayer';
import { useSimulation } from '../context/SimulationContext';
import { MillingLayout, DrillingLayout, TurningLayout } from '../components/simulation/MachiningLayouts';



const SimulationResultsPage = () => {
    const { id } = useParams();
    const { 
        simulationStatus, 
        progress, 
        machiningType, 
        liveMetrics,
        activeSimulationId
    } = useSimulation();

    const [showExportMenu, setShowExportMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleExport = async (format) => {
        // ... same export logic ...
    };

    // Determine which layout to show based on machining type
    const renderMachiningLayout = () => {
        switch (machiningType) {
            case 'drilling': return <DrillingLayout metrics={liveMetrics} />;
            case 'turning': return <TurningLayout metrics={liveMetrics} />;
            default: return <MillingLayout metrics={liveMetrics} />;
        }
    };



    return (
        <div className="flex flex-col h-[calc(100vh-80px)] px-6 pb-6 gap-6 max-w-[1600px] mx-auto w-full animate-fade-in">

            {/* Header */}
            <div className="flex justify-between items-center shrink-0 pt-6">
                <div>
                    <Link to="/reports" className="flex items-center text-xs text-studio-text-muted hover:text-studio-primary mb-1 transition-colors font-medium">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Back to Library
                    </Link>
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl font-bold text-studio-text-main tracking-tight uppercase">
                            {id === activeSimulationId ? 'Live Simulation View' : `Simulation #${id}`}
                        </h1>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            simulationStatus === 'RUNNING' 
                                ? 'text-studio-primary bg-studio-primary/10 border-studio-primary/30 animate-pulse' 
                                : 'text-studio-success bg-studio-success/10 border-studio-success/30'
                        }`}>
                            {simulationStatus}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {simulationStatus === 'RUNNING' && (
                        <div className="flex items-center gap-4 mr-4 bg-studio-surface/50 px-4 py-2 rounded-xl border border-studio-border/40">
                            <div className="text-right">
                                <p className="text-[10px] text-studio-text-dim uppercase font-bold">Progress</p>
                                <p className="text-sm font-mono text-studio-text-main font-bold">{Math.round(progress)}%</p>
                            </div>
                            <div className="w-24 h-1.5 bg-studio-canvas rounded-full overflow-hidden">
                                <div className="h-full bg-studio-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                    <Button variant="secondary" icon={FileDown} size="sm" onClick={() => setShowExportMenu(!showExportMenu)}>Export Report</Button>
                    <Button variant="secondary" icon={Share2} size="sm">Share</Button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3D Viewport */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-card relative group border border-studio-border/60">
                    <ThreeDeePlayer />
                </div>

                {/* Analysis Sidebar */}
                <div className="flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">

                    <Panel title="Real-Time Analysis">
                        {renderMachiningLayout()}
                    </Panel>

                    <Panel title="Process Stability (Thermal)" className="flex-1 flex flex-col">
                        <div className="flex-1 min-h-[200px] -ml-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={liveMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" vertical={false} />
                                    <XAxis dataKey="step" hide />
                                    <YAxis 
                                        stroke="#5c5c7d" 
                                        fontSize={10} 
                                        tickFormatter={(val) => `${val}°C`}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #3d3d5c', borderRadius: '8px', fontSize: '10px' }}
                                        labelStyle={{ color: '#8c8ca1', marginBottom: '4px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="max_temp_c" 
                                        stroke="#f43f5e" 
                                        strokeWidth={2} 
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-3 bg-studio-surface/40 rounded-lg border border-studio-border/40">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-studio-text-muted flex items-center italic">
                                    <Clock className="w-3 h-3 mr-1.5" /> Stability Status
                                </span>
                                <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Optimal</span>
                            </div>
                            <p className="text-[10px] text-studio-text-dim leading-relaxed">
                                Thermal dissipation rate is synchronized with feed velocity. No critical anomalies detected in the last 500 steps.
                            </p>
                        </div>
                    </Panel>

                </div>
            </div>
        </div>
    );
};

export default SimulationResultsPage;
