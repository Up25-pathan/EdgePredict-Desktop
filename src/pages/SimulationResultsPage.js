import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

import LoadingPage from './LoadingPage';
import InProgressDisplay from '../components/results/InProgressDisplay';
import ThreeDeePlayer from '../components/simulation/ThreeDeePlayer'; 
import AnalysisReport from '../components/results/AnalysisReport';    
import { ChevronsLeft, AlertCircle, Share2, Database } from 'lucide-react';

const SimulationResultsPage = () => {
    const { id } = useParams();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toolUrl, setToolUrl] = useState(null);
    const [showRawData, setShowRawData] = useState(false);

    // --- 1. FETCH DATA ---
    const fetchSimulation = useCallback(async (isPolling = false) => {
        try {
            if (!isPolling) setLoading(true);
            const res = await api.getSimulationById(id);
            setSimulation(res.data);
            
            // Construct Tool URL for the 3D Player (Optional fallback)
            if (res.data.tool_id) {
                const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                setToolUrl(`${baseUrl}/tool-file/${res.data.tool_id}`);
            }

            setError(null);
        } catch (err) {
            console.error("Error fetching simulation:", err);
            if (!isPolling) setError("Failed to load simulation results.");
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchSimulation(); }, [fetchSimulation]);

    // --- 2. POLLING (If Running) ---
    useEffect(() => {
        let intervalId;
        if (simulation?.status === 'RUNNING' || simulation?.status === 'PENDING') {
            intervalId = setInterval(() => { fetchSimulation(true); }, 3000);
        }
        return () => { if (intervalId) clearInterval(intervalId); };
    }, [simulation?.status, fetchSimulation]);

    // --- 3. RENDER STATES ---
    if (loading) return <LoadingPage />;
    
    if (error) return (
        <div className="h-full flex items-center justify-center">
            <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center">
                <AlertCircle className="w-6 h-6 mr-3" />
                {error}
            </div>
        </div>
    );

    if (simulation?.status === 'RUNNING' || simulation?.status === 'PENDING') {
        return <InProgressDisplay simulation={simulation} />;
    }

    if (!simulation) return null;

    // Check if we actually have valid results
    const hasResults = simulation.results && simulation.results.length > 10;

    return (
        <div className="p-4 md:p-6 space-y-8 pb-32 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                    <Link to="/reports" className="flex items-center text-xs text-gray-500 hover:text-indigo-400 mb-2 transition-colors">
                        <ChevronsLeft className="w-3 h-3 mr-1" /> Back to Library
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{simulation.name}</h1>
                    <p className="text-gray-400 text-sm mt-1">{simulation.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        simulation.status === 'COMPLETED' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400'
                    }`}>
                        {simulation.status}
                    </span>
                    <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- SECTION 1: DIGITAL TWIN (3D) --- */}
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 animate-pulse"></span>
                        3D Digital Twin
                    </h3>
                </div>
                
                {/* 3D PLAYER - LARGE VIEW */}
                <div className="w-full h-[650px] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl relative">
                    {hasResults ? (
                        <ThreeDeePlayer simulation={simulation} toolFileUrl={toolUrl} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Simulation finished but returned no 3D data. Check Raw Data below.
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECTION 2: INTELLIGENCE DASHBOARD --- */}
            <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">
                    Engineering Analysis
                </h3>
                
                <div className="w-full bg-gray-900 rounded-xl border border-gray-800 shadow-lg p-6">
                     {hasResults ? (
                        <AnalysisReport 
                            simulationId={id} 
                            initialData={simulation.results} 
                        />
                     ) : (
                        <div className="text-center py-10 text-red-400">
                            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>No analysis data available.</p>
                        </div>
                     )}
                </div>
            </div>

            {/* --- DEBUG: RAW DATA INSPECTOR --- */}
            <div className="pt-10 border-t border-gray-800">
                <button 
                    onClick={() => setShowRawData(!showRawData)}
                    className="flex items-center text-xs text-gray-500 hover:text-white transition-colors"
                >
                    <Database className="w-3 h-3 mr-2" />
                    {showRawData ? "Hide Raw Engine Output" : "Inspect Raw Engine Output (Debug)"}
                </button>
                
                {showRawData && (
                    <div className="mt-4 p-4 bg-black rounded-lg border border-gray-800 font-mono text-xs text-green-400 overflow-auto max-h-96">
                        <pre>{JSON.stringify(simulation, null, 2)}</pre>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SimulationResultsPage;