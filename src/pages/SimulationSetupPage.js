import React from 'react';
import SimulationSetupForm from '../components/simulation/SimulationSetupForm';

const SimulationSetupPage = () => {
    return (
        <div className="p-6 md:p-10">
            {/* Header */}
            <div className="mb-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-studio-text-main tracking-tight">New Simulation Setup</h1>
                <div className="flex items-center space-x-2 text-sm text-studio-text-muted mt-1">
                    <span className="bg-studio-primary/10 px-2 py-0.5 rounded text-studio-primary border border-studio-primary/20 font-mono text-xs">v3.2 Engine</span>
                    <span>•</span>
                    <span>Adaptive Control Enabled</span>
                    <span>•</span>
                    <span>CUDA Accelerated</span>
                </div>
            </div>

            <SimulationSetupForm />
        </div>
    );
};

export default SimulationSetupPage;