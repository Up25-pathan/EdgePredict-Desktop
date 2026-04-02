import React from 'react';
import { 
  Zap, Thermometer, Gauge, Activity, 
  ArrowDownCircle, RotateCcw, Box, Crosshair
} from 'lucide-react';
import MetricDisplay from '../ui/MetricDisplay';

/**
 * Milling Layout: Focus on multi-axis forces and spindle load.
 */
export const MillingLayout = ({ metrics }) => {
    const latest = metrics[metrics.length - 1] || {};
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <MetricDisplay 
                    label="Peak Temperature" 
                    value={`${(latest.max_temp_c || 0).toFixed(1)} °C`} 
                    status={(latest.max_temp_c > 800) ? 'warning' : 'success'}
                    icon={<Thermometer className="w-4 h-4" />}
                />
                <MetricDisplay 
                    label="Resultant Force" 
                    value={`${(latest.resultant_force_n || 0).toFixed(0)} N`} 
                    status="success"
                    icon={<Zap className="w-4 h-4" />}
                />
            </div>
            <div className="bg-studio-surface/50 rounded-xl p-4 border border-studio-border/40">
                <h4 className="text-[10px] font-bold text-studio-text-muted uppercase tracking-widest mb-3 flex items-center">
                    <Activity className="w-3 h-3 mr-1.5 text-indigo-400" />
                    Milling Force Vectors
                </h4>
                <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                        <span className="text-gray-500">Fx (Feed)</span>
                        <span className="text-white">{(latest.force_x || 0).toFixed(1)} N</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                        <span className="text-gray-500">Fy (Normal)</span>
                        <span className="text-white">{(latest.force_y || 0).toFixed(1)} N</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                        <span className="text-gray-500">Fz (Axial)</span>
                        <span className="text-white">{(latest.force_z || 0).toFixed(1)} N</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Drilling Layout: Focus on Thrust (Fz) and Torque.
 */
export const DrillingLayout = ({ metrics }) => {
    const latest = metrics[metrics.length - 1] || {};
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <MetricDisplay 
                    label="Thrust Force (Fz)" 
                    value={`${(latest.force_z || 0).toFixed(0)} N`} 
                    status="success"
                    icon={<ArrowDownCircle className="w-4 h-4" />}
                />
                <MetricDisplay 
                    label="Drilling Torque" 
                    value={`${(latest.torque_nm || 0).toFixed(2)} Nm`} 
                    status="success"
                    icon={<RotateCcw className="w-4 h-4" />}
                />
            </div>
            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                <h4 className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-3 flex items-center">
                    <Thermometer className="w-3 h-3 mr-1.5" />
                    Tip Thermal Profile
                </h4>
                <div className="flex items-end justify-between h-12 gap-1 px-1">
                    {metrics.slice(-20).map((m, i) => (
                        <div 
                            key={i} 
                            className="bg-amber-500/40 rounded-t-sm w-full transition-all duration-300"
                            style={{ height: `${Math.min(100, (m.max_temp_c / 1000) * 100)}%` }}
                        ></div>
                    ))}
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-amber-500/60 uppercase">
                    <span>Infeed</span>
                    <span>{(latest.max_temp_c || 0).toFixed(0)}°C</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Turning Layout: Focus on Tangential Force and Surface Ra.
 */
export const TurningLayout = ({ metrics }) => {
    const latest = metrics[metrics.length - 1] || {};
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <MetricDisplay 
                    label="Cutting Force (Fc)" 
                    value={`${(latest.force_x || 0).toFixed(0)} N`} 
                    status="success"
                    icon={<Crosshair className="w-4 h-4" />}
                />
                <MetricDisplay 
                    label="Surface Ra" 
                    value={`${(latest.surface_roughness_ra || 3.2).toFixed(2)} µm`} 
                    status="warning"
                    icon={<Box className="w-4 h-4" />}
                />
            </div>
            <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                <h4 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-3 flex items-center">
                    <Gauge className="w-3 h-3 mr-1.5" />
                    Feed Force Stability
                </h4>
                <div className="h-16 flex items-center justify-center border-b border-white/5 pb-2">
                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                        <div 
                            className="absolute top-1/2 left-0 h-4 w-1 bg-emerald-500 -translate-y-1/2 transition-all duration-100"
                            style={{ left: `${Math.min(100, (latest.force_y / 1000) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-emerald-500/60 uppercase">
                    <span>Ff: {(latest.force_y || 0).toFixed(1)} N</span>
                    <span>Stable Flow</span>
                </div>
            </div>
        </div>
    );
};
