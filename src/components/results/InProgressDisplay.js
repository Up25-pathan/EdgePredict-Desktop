import React from 'react';
import Card from '../common/Card';
import { Loader2, Cpu, Timer } from 'lucide-react';

const InProgressDisplay = ({ simulation }) => {
    return (
        <div className="max-w-3xl mx-auto mt-20">
            <Card className="p-8 text-center relative overflow-hidden">
                {/* Animated background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-hud-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    {/* Spinning Status Icon */}
                    <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-hud-primary/30 border-t-hud-primary animate-spin"></div>
                        <Cpu className="w-8 h-8 text-hud-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Simulation in Progress
                    </h2>
                    <p className="text-hud-text-secondary mb-8 max-w-md">
                        EdgePredict is currently crunching the physics on our high-performance compute nodes. This may take a few minutes depending on complexity.
                    </p>

                    {/* Status Pills */}
                    <div className="flex space-x-4">
                        <div className="flex items-center px-4 py-2 bg-hud-bg/50 rounded-lg border border-hud-border">
                            <Loader2 className="w-4 h-4 text-hud-primary mr-2 animate-spin" />
                            <span className="text-sm text-hud-text-primary">Status: {simulation?.status || 'INITIALIZING'}</span>
                        </div>
                        <div className="flex items-center px-4 py-2 bg-hud-bg/50 rounded-lg border border-hud-border">
                            <Timer className="w-4 h-4 text-hud-text-secondary mr-2" />
                            <span className="text-sm text-hud-text-primary">Est. Remaining: ~2 min</span>
                        </div>
                    </div>
                </div>

                {/* Bottom progress bar (indeterminate) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-hud-bg">
                    <div className="h-full bg-gradient-to-r from-transparent via-hud-primary to-transparent w-1/2 animate-[shimmer_2s_infinite] relative overflow-hidden">
                        {/* Tailwind doesn't have a built-in shimmer for this exact look, 
                            but a simple moving standard animate-pulse or custom css works too. 
                            For now standard Pulse on a full bar is easier: */}
                    </div>
                     <div className="h-full w-full bg-hud-primary/50 animate-pulse"></div>
                </div>
            </Card>
        </div>
    );
};

export default InProgressDisplay;