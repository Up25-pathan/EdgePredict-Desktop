import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Cpu, HardDrive, Activity, Clock, Plus, FolderOpen, 
    MoreVertical, Play, AlertCircle, CheckCircle, FileText 
} from 'lucide-react';
import Card from '../components/common/Card';

const DashboardPage = () => {
    const navigate = useNavigate();
    
    // Mock System Stats (In Phase 3, we connect this to Tauri System Info)
    const [systemStats, setSystemStats] = useState({
        cpu: 12,
        ram: 45,
        gpu: 5,
        disk: 60
    });

    // Mock Recent Projects
    const recentProjects = [
        { id: 101, name: "Ti6Al4V - High Speed Turning", date: "2025-12-24 14:30", status: "COMPLETED", duration: "4h 20m" },
        { id: 102, name: "Inconel 718 - Face Milling", date: "2025-12-23 09:15", status: "FAILED", duration: "12m" },
        { id: 103, name: "Al6061 - Drill Optimization", date: "2025-12-22 16:45", status: "COMPLETED", duration: "1h 05m" },
    ];

    // Live "Heartbeat" effect for stats
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemStats(prev => ({
                cpu: Math.max(5, Math.min(100, prev.cpu + (Math.random() * 10 - 5))),
                ram: prev.ram,
                gpu: Math.max(0, Math.min(100, prev.gpu + (Math.random() * 20 - 10))),
                disk: prev.disk
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'COMPLETED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'RUNNING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. WELCOME SECTION */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-gray-400 text-sm mt-1">System ready. No active solver jobs.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-all">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Open Project
                    </button>
                    <button 
                        onClick={() => navigate('/simulation-setup')}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Simulation
                    </button>
                </div>
            </div>

            {/* 2. SYSTEM HEALTH HUD */}
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
                    label="RAM Available" 
                    value={`${100 - systemStats.ram}%`} 
                    subValue="16GB / 32GB"
                    color="text-emerald-400" 
                    barColor="bg-emerald-500"
                    percent={systemStats.ram}
                />
                <StatusCard 
                    icon={Clock} 
                    label="Uptime" 
                    value="4h 32m" 
                    color="text-orange-400" 
                    barColor="bg-orange-500"
                    percent={100} // Always full for uptime
                    hideBar
                />
            </div>

            {/* 3. RECENT ACTIVITY TABLE */}
            <Card className="bg-gray-900 border border-gray-800 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                        Recent Simulations
                    </h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">View All History</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-6 py-3 font-medium">Project Name</th>
                                <th className="px-6 py-3 font-medium">Date Run</th>
                                <th className="px-6 py-3 font-medium">Duration</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-800/50">
                            {recentProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{project.date}</td>
                                    <td className="px-6 py-4 text-gray-400 font-mono">{project.duration}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-md" title="Rerun">
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-1.5 hover:bg-gray-700 text-gray-400 rounded-md"
                                                onClick={() => navigate(`/simulation/${project.id}`)}
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
            </Card>
        </div>
    );
};

// Helper Component for Stats
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