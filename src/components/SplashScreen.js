import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('logo'); // 'logo' -> 'fullscreen' -> 'done'

    useEffect(() => {
        // Phase 1: Show logo for ~3 seconds
        const logoTimer = setTimeout(() => setPhase('fullscreen'), 3000);
        return () => clearTimeout(logoTimer);
    }, []);

    useEffect(() => {
        if (phase === 'fullscreen') {
            // Phase 2: Show fullscreen tip for ~2.5 seconds, then complete
            const fsTimer = setTimeout(() => {
                setPhase('done');
                setTimeout(onComplete, 600); // Wait for fade-out animation
            }, 2500);
            return () => clearTimeout(fsTimer);
        }
    }, [phase, onComplete]);

    const handleSkip = () => {
        setPhase('done');
        setTimeout(onComplete, 600);
    };

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(14, 165, 164, 0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.1), transparent 50%), linear-gradient(180deg, #080e1a 0%, #0b1220 40%, #0f1b2a 100%)',
                    }}
                    onClick={handleSkip}
                >
                    {/* Ambient particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: 2 + Math.random() * 3,
                                    height: 2 + Math.random() * 3,
                                    left: `${15 + Math.random() * 70}%`,
                                    top: `${15 + Math.random() * 70}%`,
                                    background: i % 2 === 0
                                        ? 'rgba(14, 165, 164, 0.6)'
                                        : 'rgba(245, 158, 11, 0.5)',
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    opacity: [0, 0.8, 0],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>

                    {/* Glow ring behind logo */}
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: 280,
                            height: 280,
                            background: 'radial-gradient(circle, rgba(14, 165, 164, 0.12) 0%, transparent 70%)',
                        }}
                        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="relative flex flex-col items-center">
                        {/* Phase 1: Logo + Name */}
                        <AnimatePresence mode="wait">
                            {phase === 'logo' && (
                                <motion.div
                                    key="logo"
                                    className="flex flex-col items-center gap-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Logo icon */}
                                    <motion.div
                                        className="relative"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(14, 165, 164, 0.2), rgba(245, 158, 11, 0.15))',
                                                border: '1px solid rgba(14, 165, 164, 0.3)',
                                                boxShadow: '0 0 40px rgba(14, 165, 164, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                                                    stroke="rgba(14, 165, 164, 0.9)"
                                                    strokeWidth="1.5"
                                                    fill="rgba(14, 165, 164, 0.08)" />
                                                <path d="M20 4L20 36" stroke="rgba(14, 165, 164, 0.4)" strokeWidth="0.5" />
                                                <path d="M4 12L36 28" stroke="rgba(14, 165, 164, 0.4)" strokeWidth="0.5" />
                                                <path d="M36 12L4 28" stroke="rgba(14, 165, 164, 0.4)" strokeWidth="0.5" />
                                                <circle cx="20" cy="20" r="4" fill="rgba(14, 165, 164, 0.6)" stroke="rgba(14, 165, 164, 0.9)" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    </motion.div>

                                    {/* App Name */}
                                    <motion.div
                                        className="text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    >
                                        <h1 className="text-3xl font-bold tracking-wider"
                                            style={{
                                                fontFamily: "'Space Grotesk', sans-serif",
                                                background: 'linear-gradient(135deg, #e6edf5 0%, #0ea5a4 50%, #f59e0b 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            EDGEPREDICT
                                        </h1>
                                        <motion.p
                                            className="text-xs tracking-[0.3em] mt-2 uppercase"
                                            style={{ color: 'rgba(148, 163, 184, 0.6)' }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8, duration: 0.6 }}
                                        >
                                            Cutting Tool Simulation Engine
                                        </motion.p>
                                    </motion.div>

                                    {/* Loading bar */}
                                    <motion.div
                                        className="w-48 h-[2px] rounded-full mt-4 overflow-hidden"
                                        style={{ background: 'rgba(30, 41, 59, 0.8)' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.0 }}
                                    >
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{
                                                background: 'linear-gradient(90deg, #0ea5a4, #f59e0b)',
                                            }}
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ delay: 1.0, duration: 1.8, ease: 'easeInOut' }}
                                        />
                                    </motion.div>

                                    <motion.p
                                        className="text-[11px] mt-2"
                                        style={{ color: 'rgba(148, 163, 184, 0.4)' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2 }}
                                    >
                                        Initializing workspace...
                                    </motion.p>
                                </motion.div>
                            )}

                            {/* Phase 2: Fullscreen suggestion */}
                            {phase === 'fullscreen' && (
                                <motion.div
                                    key="fullscreen"
                                    className="flex flex-col items-center gap-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Monitor icon */}
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(14, 165, 164, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                        </svg>
                                    </motion.div>

                                    <div className="text-center">
                                        <p className="text-base font-medium" style={{ color: 'rgba(230, 237, 245, 0.9)' }}>
                                            For the best experience
                                        </p>
                                        <p className="text-sm mt-1" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                                            Use full screen mode
                                        </p>
                                    </div>

                                    {/* F11 Key Badge */}
                                    <motion.div
                                        className="flex items-center gap-3 px-5 py-2.5 rounded-xl"
                                        style={{
                                            background: 'rgba(14, 165, 164, 0.08)',
                                            border: '1px solid rgba(14, 165, 164, 0.2)',
                                        }}
                                        animate={{
                                            boxShadow: [
                                                '0 0 0px rgba(14, 165, 164, 0)',
                                                '0 0 20px rgba(14, 165, 164, 0.15)',
                                                '0 0 0px rgba(14, 165, 164, 0)',
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Press</span>
                                        <kbd className="px-3 py-1 rounded-lg text-sm font-mono font-bold"
                                            style={{
                                                background: 'rgba(14, 165, 164, 0.15)',
                                                border: '1px solid rgba(14, 165, 164, 0.35)',
                                                color: '#0ea5a4',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            F11
                                        </kbd>
                                        <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>to toggle</span>
                                    </motion.div>

                                    <motion.p
                                        className="text-[11px] mt-2 cursor-pointer hover:underline"
                                        style={{ color: 'rgba(148, 163, 184, 0.35)' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        onClick={handleSkip}
                                    >
                                        Click anywhere to continue
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom branding */}
                    <motion.div
                        className="absolute bottom-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                    >
                        <p className="text-[10px] tracking-[0.2em] uppercase"
                            style={{ color: 'rgba(148, 163, 184, 0.25)' }}
                        >
                            OMR Systems • v0.1.0
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
