import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import Card from '../common/Card';

const MetricDisplay = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline p-3 bg-hud-dark rounded-md">
        <p className="text-sm font-medium text-hud-text-secondary">{label}</p>
        <div>
            <span className="text-lg font-bold text-hud-primary font-mono">{value.toFixed(2)}</span>
            <span className="ml-1 text-xs text-hud-text-secondary">{unit}</span>
        </div>
    </div>
);


const RealTimeMetrics = () => {
    // Get live metrics directly from the context
    const { metrics } = useSimulation();

    // Clamp values to realistic max/min for the simulation
    const clampedMetrics = {
        stress: Math.max(0, Math.min(metrics.stress, 900)),
        temp: Math.max(25, Math.min(metrics.temp, 500)),
        deflection: Math.max(0, Math.min(metrics.deflection, 0.025)),
    }

    return (
        <Card>
            <h3 className="text-lg font-bold text-hud-text-primary mb-4">Live Data Feed</h3>
            <div className="space-y-3">
                <MetricDisplay label="Max Stress" value={clampedMetrics.stress} unit="MPa" />
                <MetricDisplay label="Max Temperature" value={clampedMetrics.temp} unit="°C" />
                <MetricDisplay label="Bending Deflection" value={clampedMetrics.deflection} unit="mm" />
            </div>
        </Card>
    );
};

export default RealTimeMetrics;

