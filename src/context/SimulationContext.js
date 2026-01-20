import React, { createContext, useContext, useState } from 'react';

const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
    const [activeSimulationId, setActiveSimulationId] = useState(null);
    const [simulationStatus, setSimulationStatus] = useState('IDLE'); // IDLE, RUNNING, COMPLETED, FAILED
    const [progress, setProgress] = useState(0);
    const [realTimeMetrics, setRealTimeMetrics] = useState({
        temperature: 0,
        stress: 0,
        deformation: 0
    });

    // This function will be called by the Rust backend to update UI
    const updateProgress = (newProgress, metrics) => {
        setProgress(newProgress);
        if (metrics) setRealTimeMetrics(metrics);
    };

    const startSimulation = (id) => {
        setActiveSimulationId(id);
        setSimulationStatus('RUNNING');
        setProgress(0);
    };

    const completeSimulation = () => {
        setSimulationStatus('COMPLETED');
        setProgress(100);
    };

    return (
        <SimulationContext.Provider value={{
            activeSimulationId,
            simulationStatus,
            progress,
            realTimeMetrics,
            updateProgress,
            startSimulation,
            completeSimulation,
            setSimulationStatus
        }}>
            {children}
        </SimulationContext.Provider>
    );
};