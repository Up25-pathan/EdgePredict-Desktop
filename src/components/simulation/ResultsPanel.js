import React from 'react';
import { Gauge, Thermometer, Activity, Clock } from 'lucide-react';

const ResultsPanel = ({ metrics }) => {
    // Safely handle missing data from the new R&D JSON structure
    const stress = metrics?.max_stress_MPa || 0;
    const temp = metrics?.max_temperature_C || 0;
    const wear = metrics?.total_accumulated_wear_m || 0;
    const life = metrics?.tool_life_prediction?.predicted_hours || 0;

    const items = [
        { 
            label: "Stress Load", 
            value: `${stress.toFixed(0)} MPa`, 
            icon: <Gauge className="w-4 h-4 text-purple-400" />,
            desc: "Von Mises Stress"
        },
        { 
            label: "Peak Temp", 
            value: `${temp.toFixed(0)} °C`, 
            icon: <Thermometer className="w-4 h-4 text-orange-400" />,
            desc: "Thermal Load"
        },
        { 
            label: "Tool Life", 
            value: `${life.toFixed(1)} hrs`, 
            icon: <Clock className="w-4 h-4 text-green-400" />,
            desc: "Est. Failure Time"
        },
        { 
            label: "Total Wear", 
            value: `${(wear * 1000).toFixed(3)} µm`, 
            icon: <Activity className="w-4 h-4 text-blue-400" />,
            desc: "Flank Wear"
        },
    ];

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Metrics</h4>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-800 rounded-md mr-3 border border-gray-700">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">{item.label}</p>
                                <p className="text-[10px] text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultsPanel;