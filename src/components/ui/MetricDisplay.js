import React from 'react';
import { motion } from 'framer-motion';

const MetricDisplay = ({ label, value, unit, trend, status = 'neutral' }) => {

    // Status color mapping for Light Theme
    const statusColors = {
        neutral: "bg-studio-secondary",
        success: "bg-studio-success",
        warning: "bg-studio-accent", // Using violet for warning/emphasis in this theme usually, but sticking to standard map
        danger: "bg-studio-danger"
    };

    const statusText = {
        neutral: "text-studio-text-muted",
        success: "text-studio-success",
        warning: "text-studio-accent",
        danger: "text-studio-danger"
    };

    return (
        <div className="bg-studio-panel/85 border border-studio-border/60 rounded-xl p-4 shadow-soft flex flex-col justify-between h-full backdrop-blur">
            <div className="text-xs font-medium text-studio-text-muted uppercase tracking-wide mb-1">
                {label}
            </div>

            <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-studio-text-main tracking-tight">
                        {value}
                    </span>
                    {unit && <span className="text-sm text-studio-text-muted font-medium">{unit}</span>}
                </div>

                {/* Micro Chart / Trend Indicator */}
                <div className="w-16 h-8 flex items-end gap-0.5 opacity-80">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: "20%" }}
                            animate={{ height: `${20 + Math.random() * 80}%` }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                            className={`w-full rounded-t-sm ${statusColors[status]}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MetricDisplay;
