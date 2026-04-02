import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Panel = ({ children, title, className, headerAction }) => {
    return (
        <div className={twMerge(
            "relative bg-studio-panel/85 border border-studio-border/60 shadow-soft rounded-xl overflow-hidden backdrop-blur before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-studio-primary/50 before:via-transparent before:to-studio-accent/50",
            className
        )}>
            {/* Header */}
            {title && (
                <div className="flex justify-between items-center px-5 py-3 border-b border-studio-border/60 bg-studio-surface/60 backdrop-blur">
                    <h3 className="text-studio-text-main font-semibold text-sm tracking-tight flex items-center">
                        {title}
                    </h3>
                    {headerAction}
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
};

export default Panel;
