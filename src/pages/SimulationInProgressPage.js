import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Terminal, Activity, Pause, Square, Cpu, Clock, ChevronRight } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import Card from '../components/common/Card';

// Simulated Log Entry Component
const LogLine = ({ text, type = 'info' }) => {
    let color = 'text-gray-400';
    if (type === 'error') color = 'text-red-400';
    if (type === 'success') color = 'text-emerald-400';
    if (type === 'warning') color = 'text-yellow-400';
    
    return (
        <div className={`font-mono text-xs py-0.5 border-b border-gray-800/30 ${color}`}>
            <span className="text-gray-600 mr-2 select-none">[{new Date().toLocaleTimeString()}]</span>
            {text}
        </div>
    );
};

const SimulationInProgressPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { progress, simulationStatus, completeSimulation } = useSimulation();
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    // Auto-scroll logs
    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [logs]);

    // Simulate arriving logs (In reality, these come from Rust)
    useEffect(() => {
        if (simulationStatus !== 'RUNNING') return;

        const interval = setInterval(() => {
            const messages = [
                "Solver: Converging mesh at node 402...",
                "Physics: Thermal dissipation calculated (delta: 0.04s)",
                "Matrix: Inverting stiffness matrix...",
                "Contact: Tool-Chip interface updated.",
                "System: Memory usage 402MB"
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            setLogs(prev => [...prev.slice(-50), { text: msg, type: 'info' }]); // Keep last 50 logs
        }, 800);

        return () => clearInterval(interval);
    }, [simulationStatus]);

    // Auto-complete simulation for demo
    useEffect(() => {
        if (progress >= 100) {
            setLogs(prev => [...prev, { text: "SIMULATION COMPLETED SUCCESSFULLY.", type: 'success' }]);
            setTimeout(() => navigate(`/simulation/results/${id}`), 1500);
        }
    }, [progress, navigate, id]);

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            {/* HEADER STATUS */}
            <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-lg">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <h2 className="text-lg font-bold text-white">Solver Active</h2>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">Job ID: {id} • High Performance Mode</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white font-mono">{Math.round(progress)}%</div>
                        <div className="text-xs text-gray-500">Estimated Time: 12m 30s</div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20">
                            <Pause className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20">
                            <Square className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                
                {/* LEFT: VISUALIZATION PREVIEW */}
                <Card className="lg:col-span-2 bg-black border border-gray-800 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    
                    {/* Placeholder for 3D Viewport */}
                    <div className="text-center z-10">
                        <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-indigo-400 font-medium">Rendering Real-Time Viewport...</p>
                        <p className="text-gray-500 text-xs mt-2">GPU Acceleration: ON</p>
                    </div>

                    {/* Overlay Stats */}
                    <div className="absolute top-4 left-4 space-y-2 font-mono text-xs">
                        <div className="bg-black/50 backdrop-blur border border-gray-700 px-3 py-1 rounded text-green-400">
                            FPS: 58
                        </div>
                        <div className="bg-black/50 backdrop-blur border border-gray-700 px-3 py-1 rounded text-blue-400">
                            Nodes: 124,050
                        </div>
                    </div>
                </Card>

                {/* RIGHT: TERMINAL LOGS */}
                <Card className="bg-[#0c0c0c] border border-gray-800 flex flex-col overflow-hidden">
                    <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-300 flex items-center">
                            <Terminal className="w-3 h-3 mr-2" />
                            Engine Output
                        </span>
                        <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                        <LogLine text="EdgePredict Engine v3.1.0 Initialized" type="success" />
                        <LogLine text="Loading Geometry: Tool_Geometry.stl" />
                        <LogLine text="Mesh Generation: 154,200 elements created" />
                        <LogLine text="Boundary Conditions applied successfully" />
                        <div className="my-2 border-t border-dashed border-gray-800"></div>
                        {logs.map((log, i) => (
                            <LogLine key={i} text={log.text} type={log.type} />
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SimulationInProgressPage;