import React from 'react';
import { Trash2, Beaker, Thermometer, Activity, Scale } from 'lucide-react';

const MaterialCard = ({ material, onDelete }) => {
    // For workpiece materials, engine fields are top-level.
    // For tool materials / coatings, fields are nested under `properties`.
    const isWorkpiece = material.classification === 'workpiece';

    const Stat = ({ icon: Icon, label, value, unit, color }) => (
        <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md bg-studio-surface ${color}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-studio-text-dim uppercase font-bold tracking-wider">{label}</span>
                <span className="text-sm text-studio-text-main font-mono">{value} <span className="text-xs text-studio-text-dim">{unit}</span></span>
            </div>
        </div>
    );

    // Resolve display values based on classification
    const yieldVal = isWorkpiece
        ? (material.yield_strength_MPa || '---')
        : (material.properties?.yieldStrength || '---');
    const meltVal = isWorkpiece
        ? (material.melting_point_C || '---')
        : (material.properties?.meltingPoint || '---');
    const densityVal = isWorkpiece
        ? (material.density_kg_m3 || '---')
        : (material.properties?.density || '---');
    const modulusVal = isWorkpiece
        ? (material.youngs_modulus_Pa ? (material.youngs_modulus_Pa / 1e9).toFixed(1) : '---')
        : (material.properties?.youngsModulus ? (material.properties.youngsModulus / 1e9).toFixed(1) : '---');

    // Badge color based on classification
    const badgeColor = isWorkpiece
        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
        : material.classification === 'tool_material'
            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400';

    return (
        <div className="group relative flex flex-col justify-between bg-studio-panel/60 backdrop-blur-sm border border-studio-border/50 hover:border-studio-primary/40 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-studio-primary/10 hover:-translate-y-1">

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg border ${badgeColor}`}>
                        <Beaker className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-studio-text-main leading-tight">{material.name}</h3>
                        <span className="text-xs text-studio-text-dim">{material.category || material.classification}</span>
                    </div>
                </div>

                {material.type !== 'standard' && (
                    <button
                        onClick={() => onDelete(material.id)}
                        className="p-2 rounded-lg text-studio-text-dim hover:text-studio-danger hover:bg-studio-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Material"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                <Stat
                    icon={Activity}
                    label="Yield Strength"
                    value={yieldVal}
                    unit="MPa"
                    color="text-orange-400"
                />
                <Stat
                    icon={Thermometer}
                    label="Melting Point"
                    value={meltVal}
                    unit="°C"
                    color="text-red-400"
                />
                <Stat
                    icon={Scale}
                    label="Density"
                    value={densityVal}
                    unit="kg/m³"
                    color="text-blue-400"
                />
                <Stat
                    icon={Beaker}
                    label="Young's Mod."
                    value={modulusVal}
                    unit="GPa"
                    color="text-emerald-400"
                />
            </div>
        </div>
    );
};

export default MaterialCard;