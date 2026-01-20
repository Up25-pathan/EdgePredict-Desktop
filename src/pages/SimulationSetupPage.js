import React from 'react';
import SimulationSetupForm from '../components/simulation/SimulationSetupForm';

const SimulationSetupPage = () => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Create New Simulation</h2>
            <SimulationSetupForm />
        </div>
    );
};

export default SimulationSetupPage;

