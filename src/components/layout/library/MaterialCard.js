import React from 'react';
import { Trash2, Beaker, Thermometer, Activity, Scale } from 'lucide-react';

const MaterialCard = ({ material, onDelete }) => {
    // Helper to safely get properties (they might be a string in legacy data)
    let props = {};
    if (typeof material.properties === 'string') {
        try { props = JSON.parse(material.properties); } catch (e) { props = {}; }
    } else {
        props = material.properties || {};
    }

    const Stat = ({ icon: Icon, label, value, unit, color }) => (
        <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md bg-gray-800 ${color}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
                <span className="text-sm text-gray-200 font-mono">{value} <span className="text-xs text-gray-500">{unit}</span></span>
            </div>
        </div>
    );

    return (
        <div className="group relative flex flex-col justify-between bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-indigo-500/40 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Beaker className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{material.name}</h3>
                        <span className="text-xs text-gray-500">ID: #{material.id}</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => onDelete(material.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Material"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                <Stat 
                    icon={Activity} 
                    label="Yield Strength" 
                    value={props.A_yield_strength_MPa || '---'} 
                    unit="MPa" 
                    color="text-orange-400"
                />
                <Stat 
                    icon={Thermometer} 
                    label="Melting Point" 
                    value={props.melting_point_C || '---'} 
                    unit="°C" 
                    color="text-red-400"
                />
                <Stat 
                    icon={Scale} 
                    label="Density" 
                    value={props.density_kg_m3 || '---'} 
                    unit="kg/m³" 
                    color="text-blue-400"
                />
                <Stat 
                    icon={Beaker} 
                    label="Elastic Mod." 
                    value={props.elastic_modulus_GPa || '---'} 
                    unit="GPa" 
                    color="text-emerald-400"
                />
            </div>
        </div>
    );
};

export default MaterialCard;