import React, { useEffect, useState } from 'react';
import { 
    FileText, AlertTriangle, CheckCircle, 
    Thermometer, Activity, Clock, Shield 
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '../../services/api';

const AnalysisReport = ({ simulationId, initialData }) => {
    // initialData might be the full simulation object or just the results string
    const [resultsJson, setResultsJson] = useState(null);
    const [aiText, setAiText] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!initialData) return;

        try {
            // If initialData is the raw JSON string from the DB
            const parsed = typeof initialData === 'string' ? JSON.parse(initialData) : initialData;
            
            // Separate the Engineering Data from the AI Text
            if (parsed.final_metrics || parsed.tool_life_prediction) {
                setResultsJson(parsed);
            }
            
            if (parsed.ai_analysis) {
                setAiText(parsed.ai_analysis);
            }
        } catch (e) {
            console.error("Error parsing results:", e);
        }
    }, [initialData]);

    const generateReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.generateReport(simulationId);
            setAiText(res.data.analysis);
        } catch (err) {
            console.error(err);
            setError("Failed to generate AI report.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HELPER: Status Badge ---
    const getStatusBadge = () => {
        if (!resultsJson?.final_metrics) return null;
        const fractured = resultsJson.final_metrics.final_fractured_nodes > 0;
        
        return (
            <div className={`flex items-center px-4 py-3 rounded-lg border ${
                fractured 
                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                : 'bg-green-500/10 border-green-500/50 text-green-400'
            }`}>
                {fractured ? <AlertTriangle className="w-6 h-6 mr-3"/> : <CheckCircle className="w-6 h-6 mr-3"/>}
                <div>
                    <h3 className="font-bold text-lg">{fractured ? "STRUCTURAL FAILURE" : "DESIGN VALIDATED"}</h3>
                    <p className="text-xs opacity-80">
                        {fractured 
                            ? "Critical fracture detected in tool geometry." 
                            : "Tool withstood operational stresses."}
                    </p>
                </div>
            </div>
        );
    };

    // --- RENDER ---
    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6">
            
            {/* 1. ENGINEERING DASHBOARD */}
            {resultsJson && (
                <div className="grid grid-cols-1 gap-4">
                    {/* Pass/Fail Status */}
                    {getStatusBadge()}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Life */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase tracking-wider">Tool Life</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {resultsJson.tool_life_prediction?.predicted_hours?.toFixed(1) || "--"} <span className="text-sm font-normal text-gray-500">hrs</span>
                            </div>
                        </div>

                        {/* Wear */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Activity className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase tracking-wider">Total Wear</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">
                                {(resultsJson.final_metrics?.total_accumulated_wear_m * 1000)?.toFixed(3) || "0"} <span className="text-sm font-normal text-gray-500">µm</span>
                            </div>
                        </div>

                        {/* Max Temp */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Thermometer className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase tracking-wider">Peak Temp</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-400">
                                {resultsJson.final_metrics?.max_temperature_C?.toFixed(0) || "0"} <span className="text-sm font-normal text-gray-500">°C</span>
                            </div>
                        </div>

                        {/* Max Stress */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center text-gray-400 mb-2">
                                <Shield className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase tracking-wider">Peak Stress</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-400">
                                {resultsJson.final_metrics?.max_stress_MPa?.toFixed(0) || "0"} <span className="text-sm font-normal text-gray-500">MPa</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Area */}
                    {resultsJson.time_series_data && (
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="text-sm font-bold text-gray-300 mb-4">Physics Over Time</h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={resultsJson.time_series_data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="time_s" tickFormatter={(v) => v.toFixed(3)} stroke="#9CA3AF" fontSize={12} />
                                        <YAxis yAxisId="left" stroke="#F87171" fontSize={12} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#F87171' }} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" fontSize={12} label={{ value: 'Stress (MPa)', angle: 90, position: 'insideRight', fill: '#A78BFA' }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                            itemStyle={{ fontSize: '12px' }}
                                            labelFormatter={(v) => `Time: ${Number(v).toFixed(4)}s`}
                                        />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="max_temperature_C" name="Max Temp" stroke="#F87171" dot={false} strokeWidth={2} />
                                        <Line yAxisId="right" type="monotone" dataKey="max_stress_MPa" name="Max Stress" stroke="#A78BFA" dot={false} strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="border-t border-gray-700 my-6"></div>

            {/* 2. AI ANALYSIS SECTION */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                    AI Analysis Report
                </h3>
                
                {!aiText ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 p-6 bg-gray-900/50 rounded-lg border border-dashed border-gray-800">
                        <p className="text-sm text-center mb-4">
                            Detailed AI analysis requires manual generation.
                        </p>
                        <button 
                            onClick={generateReport}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center"
                        >
                            {isLoading ? <span className="animate-spin mr-2">●</span> : null}
                            Generate R&D Report
                        </button>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                        {aiText.split('\n').map((line, i) => (
                            <p key={i} className={`
                                ${line.startsWith('#') ? 'text-lg font-bold text-white mt-4 mb-2' : 'text-gray-300 mb-2'}
                                ${line.startsWith('-') ? 'pl-4 border-l-2 border-indigo-500/30' : ''}
                            `}>
                                {line.replace(/^[#\-*]+ /, '')}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisReport;