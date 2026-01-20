import React from 'react';

const MetricCard = ({ title, value, unit, icon: Icon }) => {
    return (
        <div className="relative group bg-hud-surface/40 backdrop-blur-md border border-hud-border rounded-xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-hud-primary/30">
             {/* Top Highlight Line */}
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hud-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-hud-text-secondary uppercase tracking-wider">{title}</h4>
                {Icon && <Icon className="w-5 h-5 text-hud-primary opacity-60 group-hover:opacity-100 group-hover:text-white transition-all duration-300" />}
            </div>
            
            <div className="flex items-baseline">
                <span className="text-2xl font-black text-white tracking-tighter">
                    {value}
                </span>
                {unit && (
                    <span className="ml-1.5 text-sm font-bold text-hud-text-secondary/70">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MetricCard;