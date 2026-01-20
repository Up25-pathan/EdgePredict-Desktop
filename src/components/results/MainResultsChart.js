import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MainResultsChart = ({ timeSeriesData }) => {
    // Allow user to switch between metrics
    const [metric, setMetric] = useState('temperature'); // 'temperature', 'stress', 'wear'

    if (!timeSeriesData || timeSeriesData.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                No time-series data available.
            </div>
        );
    }

    // Helper to configure the chart based on selected metric
    const chartConfig = {
        temperature: {
            key: "max_temperature_C",
            color: "#f87171", // Red-400
            label: "Max Temp (°C)",
            yAxisId: "temp"
        },
        stress: {
            key: "max_stress_MPa",
            color: "#fbbf24", // Amber-400
            label: "Max Stress (MPa)",
            yAxisId: "stress"
        },
        wear: {
            key: "total_accumulated_wear_m",
            color: "#818cf8", // Indigo-400
            label: "Total Wear (m)",
            yAxisId: "wear"
        }
    };

    const currentConfig = chartConfig[metric];

    // Format data for better tooltips
    const formattedData = timeSeriesData.map(d => ({
        ...d,
        // Ensure wear is readable (convert m to µm for display if needed, or keep raw)
        time_ms: (d.time_s * 1000).toFixed(2)
    }));

    return (
        <div className="w-full h-full flex flex-col">
            {/* Metric Toggles */}
            <div className="flex space-x-2 mb-4">
                {Object.keys(chartConfig).map((key) => (
                    <button
                        key={key}
                        onClick={() => setMetric(key)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider
                            ${metric === key 
                                ? 'bg-gray-700 text-white border border-gray-600' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* The Chart */}
            <div className="flex-grow min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="step" 
                            stroke="#9ca3af" 
                            fontSize={12}
                            label={{ value: 'Step', position: 'insideBottomRight', offset: -5, fill: '#9ca3af' }}
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickFormatter={(val) => val.toExponential(1)} // Handle small wear numbers
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                            itemStyle={{ color: '#f3f4f6' }}
                            formatter={(value, name) => [value.toExponential(2), name]}
                            labelFormatter={(label) => `Step: ${label}`}
                        />
                        <Legend verticalAlign="top" height={36}/>
                        
                        <Line
                            type="monotone"
                            dataKey={currentConfig.key}
                            name={currentConfig.label}
                            stroke={currentConfig.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MainResultsChart;