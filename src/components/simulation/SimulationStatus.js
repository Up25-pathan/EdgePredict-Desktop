import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { useSimulationData } from '../../context/SimulationDataContext';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SimulationStatus = () => {
    const { progress, setProgress, isComplete } = useSimulation();
    const { addReport } = useSimulationData();
    const navigate = useNavigate();
    const { simulationId } = useParams();
    const [reportSaved, setReportSaved] = useState(false); // New state to prevent duplicates
    let statusText = "Initializing...";

    if (progress >= 100) {
        statusText = "Finalizing results...";
    } else if (progress > 75) {
        statusText = "Calculating Thermal Dynamics...";
    } else if (progress > 40) {
        statusText = "Analyzing Stress & Strain...";
    } else if (progress > 10) {
        statusText = "Meshing Geometry...";
    }

    useEffect(() => {
        // This effect simulates the progress bar filling up
        const interval = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return Math.min(oldProgress + Math.random() * 5, 100);
            });
        }, 500);
        return () => clearInterval(interval);
    }, [setProgress]);

    useEffect(() => {
        // This effect waits for the simulation to complete and then saves the report
        const saveReportAndNavigate = async () => {
            if (isComplete && !reportSaved) {
                setReportSaved(true); // Mark as saved immediately to prevent re-runs
                
                const newReport = {
                    id: simulationId,
                    name: `Simulation Report - ${new Date(parseInt(simulationId)).toLocaleTimeString()}`,
                    date: new Date().toISOString().split('T')[0],
                    format: 'PDF'
                };
                
                try {
                    await addReport(newReport);
                    toast.success("Report successfully saved!");

                    setTimeout(() => {
                        navigate(`/simulations/results/${simulationId}`);
                    }, 1500); // Wait 1.5s before navigating
                } catch (error) {
                    toast.error("Failed to save report to database.");
                    console.error(error);
                }
            }
        };

        saveReportAndNavigate();

    }, [isComplete, reportSaved, simulationId, addReport, navigate]);

    return (
       <Card>
            <h3 className="text-lg font-bold text-hud-text-primary mb-4">Simulation Status</h3>
            <div className="w-full bg-hud-dark rounded-full h-4 mb-2 border border-hud-border">
                <div 
                    className="bg-hud-primary h-full rounded-full transition-all duration-500 ease-linear" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-right text-hud-text-primary font-mono text-lg">{progress.toFixed(1)}%</p>
            <p className="text-center text-hud-text-secondary mt-2">{statusText}</p>
            <div className="mt-6 flex gap-2">
                <Button variant="secondary" className="w-full" disabled={isComplete}>Pause</Button>
                <Button variant="destructive" className="w-full" disabled={isComplete}>Cancel</Button>
            </div>
        </Card>
    );
};

export default SimulationStatus;

