import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import real API
import { 
    Cpu, HardDrive, Activity, Clock, Plus, FolderOpen, 
    MoreVertical, Play, AlertCircle, CheckCircle, FileText, Loader 
} from 'lucide-react';
import Card from '../components/common/Card';

const DashboardPage = () => {
    const navigate = useNavigate();
    
    // --- REAL STATE ---
    const [recentProjects, setRecentProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState(null);

    // --- SYSTEM STATS (Simulated for Web Demo) ---
    const [systemStats, setSystemStats] = useState({
        cpu: 10,
        ram: 30,
        gpu: 0,
        uptime: 0
    });

    // --- 1. FETCH REAL DATA ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Call real backend
                const res = await api.getRecentSimulations(); 
                
                // Format data for UI
                // Sort by ID descending (newest first) and take top 5
                const sorted = res.data.sort((a, b) => b.id - a.id).slice(0, 5);
                
                const formatted = sorted.map(sim => ({
                    id: sim.id,
                    name: sim.name,
                    date: new Date(sim.created_at).toLocaleString(),
                    status: sim.status || 'PENDING',
                    duration: sim.execution_time_s ? `${(sim.execution_time_s / 60).toFixed(1)}m` : '--',
                    machiningType: sim.input_parameters?.machining_type || 'Standard'
                }));
                
                setRecentProjects(formatted);
            } catch (err) {
                console.error("Dashboard Load Failed:", err);
                setProjectError("Failed to load recent activity.");
            } finally {
                setIsLoadingProjects(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- 2. LIVE MONITOR (Simulated) ---
    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            setSystemStats(prev => ({
                cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 10 - 5))), 
                ram: 30 + (recentProjects.length * 2), // Dynamic visualization
                gpu: Math.random() > 0.8 ? Math.random() * 40 : 5, 
                uptime: Math.floor((Date.now() - startTime) / 1000 / 60) 
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, [recentProjects.length]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'COMPLETED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'RUNNING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-gray-400 text-sm mt-1">System ready. {recentProjects.length} active projects.</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => navigate('/simulation-setup')}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Simulation
                    </button>
                </div>
            </div>

            {/* SYSTEM HUD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatusCard 
                    icon={Cpu} 
                    label="CPU Load" 
                    value={`${Math.round(systemStats.cpu)}%`} 
                    color="text-blue-400" 
                    barColor="bg-blue-500"
                    percent={systemStats.cpu}
                />
                <StatusCard 
                    icon={Activity} 
                    label="GPU Usage" 
                    value={`${Math.round(systemStats.gpu)}%`} 
                    color="text-purple-400" 
                    barColor="bg-purple-500"
                    percent={systemStats.gpu}
                />
                <StatusCard 
                    icon={HardDrive} 
                    label="RAM Usage" 
                    value={`${systemStats.ram} GB`} 
                    subValue="Reserved"
                    color="text-emerald-400" 
                    barColor="bg-emerald-500"
                    percent={(systemStats.ram / 64) * 100} 
                />
                <StatusCard 
                    icon={Clock} 
                    label="Session Uptime" 
                    value={`${systemStats.uptime}m`} 
                    color="text-orange-400" 
                    barColor="bg-orange-500"
                    percent={100} 
                    hideBar
                />
            </div>

            {/* REAL ACTIVITY TABLE */}
            <Card className="bg-gray-900 border border-gray-800 shadow-xl overflow-hidden min-h-[300px]">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                        Recent Simulations
                    </h3>
                    <button onClick={() => window.location.reload()} className="text-xs text-indigo-400 hover:text-indigo-300">Refresh Data</button>
                </div>
                
                {isLoadingProjects ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        <Loader className="w-8 h-8 animate-spin mr-3 text-indigo-500" />
                        Syncing with backend...
                    </div>
                ) : projectError ? (
                    <div className="flex items-center justify-center h-64 text-red-400 bg-red-500/5">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        {projectError}
                    </div>
                ) : recentProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
                        <p>No history found. Launch a new simulation to begin.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3 font-medium">Project Name</th>
                                    <th className="px-6 py-3 font-medium">Strategy</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Runtime</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-800/50">
                                {recentProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                                        <td className="px-6 py-4 text-xs text-indigo-300 uppercase tracking-wide">{project.machiningType}</td>
                                        <td className="px-6 py-4 text-gray-400">{project.date}</td>
                                        <td className="px-6 py-4 text-gray-400 font-mono">{project.duration}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md transition-colors"
                                                    onClick={() => navigate(`/simulations/${project.id}`)}
                                                    title="View Results"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

// Standard Status Card
const StatusCard = ({ icon: Icon, label, value, subValue, color, barColor, percent, hideBar }) => (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    {subValue && <span className="ml-2 text-xs text-gray-500">{subValue}</span>}
                </div>
            </div>
            <div className={`p-2 rounded-lg bg-gray-800 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        {!hideBar && (
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        )}
    </div>
);

export default DashboardPage;