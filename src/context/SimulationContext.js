import React, { createContext, useContext, useState } from 'react';

const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
    const [activeSimulationId, setActiveSimulationId] = useState(null);
    const [simulationStatus, setSimulationStatus] = useState('IDLE'); // IDLE, RUNNING, COMPLETED, FAILED
    const [progress, setProgress] = useState(0);
    const [machiningType, setMachiningType] = useState('milling'); // milling, drilling, turning
    
    const [liveMetrics, setLiveMetrics] = useState([]); // Array of { step, time, ...metrics }
    const [currentParticles, setCurrentParticles] = useState({
        positions: new Float32Array(0),
        temperatures: new Float32Array(0),
        count: 0,
        step: 0
    });

    // This function will be called by the SimulationService to update UI
    const updateLiveMetrics = (metricData) => {
        setLiveMetrics(prev => [...prev.slice(-100), metricData]); // Keep last 100 for charts
        setProgress(metricData.percentage || 0);
    };

    const updateParticles = (particleData) => {
        setCurrentParticles(particleData);
    };

    const startSimulation = (id, type = 'milling') => {
        setActiveSimulationId(id);
        setMachiningType(type);
        setSimulationStatus('RUNNING');
        setProgress(0);
        setLiveMetrics([]);
        setCurrentParticles({
            positions: new Float32Array(0),
            temperatures: new Float32Array(0),
            count: 0,
            step: 0
        });
    };

    const completeSimulation = () => {
        setSimulationStatus('COMPLETED');
        setProgress(100);
    };

    const failSimulation = (error) => {
        setSimulationStatus('FAILED');
        console.error("Simulation failed:", error);
    };

    return (
        <SimulationContext.Provider value={{
            activeSimulationId,
            simulationStatus,
            progress,
            machiningType,
            liveMetrics,
            currentParticles,
            updateLiveMetrics,
            updateParticles,
            startSimulation,
            completeSimulation,
            failSimulation,
            setSimulationStatus
        }}>
            {children}
        </SimulationContext.Provider>
    );
};