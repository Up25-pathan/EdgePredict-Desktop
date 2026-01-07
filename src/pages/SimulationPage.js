import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ThreeDeeViewer from '../components/simulation/ThreeDeePlayer';
import ResultsPanel from '../components/simulation/ResultsPanel';

// Mock data for a single simulation result
const mockSimulationData = {
    id: 1,
    name: 'End Mill - Aluminum 6061',
    status: 'Completed',
    date: '2023-10-25',
    metrics: {
        maxVonMisesStress: 850, // MPa
        maxTemperature: 450, // °C
        bendingDeflection: 0.02, // mm
        toolLifeEstimate: 120, // minutes
    },
    // This would eventually contain the 3D model data
    modelData: {} 
};

const SimulationPage = () => {
    // In a real app, we would use this ID to fetch data from the backend
    const { simulationId } = useParams();

    return (
        <div>
             <div className="mb-4">
                <Link to="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{mockSimulationData.name}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Viewer takes up 2/3 of the space on large screens */}
                <div className="lg:col-span-2">
                    <ThreeDeeViewer modelData={mockSimulationData.modelData} />
                </div>

                {/* Results Panel takes up 1/3 of the space */}
                <div className="lg:col-span-1">
                    <ResultsPanel metrics={mockSimulationData.metrics} />
                </div>
            </div>
        </div>
    );
};

export default SimulationPage;
