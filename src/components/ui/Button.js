import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className,
    disabled = false,
    type = 'button',
    ...props // Capture other props like 'form', 'id', etc.
}) => {

    // Base: Rounded, medium font weight, smooth transition
    const baseStyles = "relative font-medium transition-all duration-200 flex items-center justify-center rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0";

    const variants = {
        primary: "bg-gradient-to-r from-studio-primary to-studio-accent border-transparent text-white shadow-soft hover:shadow-card focus:ring-studio-primary/40",
        secondary: "bg-studio-panel/70 border-studio-border/70 text-studio-text-main hover:bg-studio-surface/80 hover:border-studio-border focus:ring-studio-primary/20",
        danger: "bg-studio-danger text-white border-transparent hover:bg-studio-danger/90 shadow-soft focus:ring-studio-danger/40",
        ghost: "bg-transparent border-transparent text-studio-text-muted hover:bg-studio-panel/60 hover:text-studio-text-main focus:ring-studio-primary/20"
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5 h-8",
        md: "text-sm px-4 py-2 h-9",
        lg: "text-base px-6 py-2.5 h-11"
    };

    return (
        <motion.button
            type={type}
            whileHover={!disabled ? { y: -1 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            {...props} // Pass through valid HTML attributes like 'form'
        >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </motion.button>
    );
};

export default Button;
