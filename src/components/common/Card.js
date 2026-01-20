import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`
            relative
            bg-hud-surface/80
            border border-hud-border
            rounded-xl
            shadow-xl shadow-black/20
            overflow-hidden
            transition-all duration-300 ease-out
            /* NEW HOVER EFFECTS: Lift up slightly, brighter border, stronger shadow */
            hover:-translate-y-1
            hover:border-hud-primary/40
            hover:shadow-2xl hover:shadow-hud-glow/10
            ${className}
        `}>
             {/* Optional: Subtle top lighting effect that brightens on hover */}
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {children}
        </div>
    );
};

export default Card;