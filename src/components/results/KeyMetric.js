import React from 'react';

const KeyMetric = ({ title, value, icon: Icon, color = "text-hud-primary" }) => {
    // Extract base color for dynamic background utility (e.g., 'indigo' from 'text-indigo-400')
    const colorBase = color.replace('text-', '').split('-')[0]; 

    return (
        <div className="relative group bg-hud-surface/60 backdrop-blur-lg border border-hud-border rounded-2xl p-5 flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-hud-primary/40 overflow-hidden">
             {/* Subtle internal gradient glow based on the metric color */}
            <div className={`absolute -left-10 -bottom-10 w-32 h-32 bg-${colorBase}-500/10 rounded-full blur-[50px] group-hover:bg-${colorBase}-500/20 transition-all duration-500`}></div>

            <div className={`relative p-3.5 rounded-xl bg-hud-bg/80 border border-hud-border/50 mr-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 ${color}`} style={{ filter: `drop-shadow(0 0 8px currentColor)` }} />
            </div>
            
            <div className="relative">
                <p className="text-xs font-bold uppercase tracking-wider text-hud-text-secondary mb-1.5">{title}</p>
                <p className="text-3xl font-extrabold text-white tracking-tight leading-none">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default KeyMetric;