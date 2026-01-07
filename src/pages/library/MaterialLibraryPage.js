import React, { useState } from 'react';
import { 
    Search, Plus, Filter, Database, Thermometer, 
    Activity, Layers, MoreVertical, Trash2, Copy, 
    CheckCircle, AlertTriangle, ChevronRight, Beaker
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import Card from '../../components/common/Card';

// --- MOCK SCIENTIFIC DATA ---
const MATERIALS_DB = [
    {
        id: 'mat_001',
        name: 'Ti-6Al-4V (Grade 5)',
        category: 'Titanium Alloy',
        type: 'standard',
        description: 'Workhorse titanium alloy. High strength-to-weight ratio. Difficult to machine due to low thermal conductivity.',
        properties: {
            density: 4.43, // g/cm3
            hardness: 349, // HV
            meltingPoint: 1660, // C
        },
        // Graph Data: Yield Strength vs Temperature
        thermalProfile: [
            { temp: 20, strength: 880 },
            { temp: 200, strength: 720 },
            { temp: 400, strength: 590 },
            { temp: 600, strength: 410 },
            { temp: 800, strength: 120 },
            { temp: 1000, strength: 20 },
        ]
    },
    {
        id: 'mat_002',
        name: 'Inconel 718',
        category: 'Nickel Superalloy',
        type: 'standard',
        description: 'Precipitation-hardenable nickel-chromium alloy. Extreme heat resistance. Used in jet engines.',
        properties: {
            density: 8.19,
            hardness: 390,
            meltingPoint: 1260,
        },
        thermalProfile: [
            { temp: 20, strength: 1030 },
            { temp: 400, strength: 980 },
            { temp: 600, strength: 890 },
            { temp: 700, strength: 810 },
            { temp: 800, strength: 550 },
            { temp: 1000, strength: 120 },
        ]
    },
    {
        id: 'mat_003',
        name: 'Al 6061-T6',
        category: 'Aluminum Alloy',
        type: 'standard',
        description: 'Precipitation-hardened aluminum. Good machinability and weldability. Common in aerospace structures.',
        properties: {
            density: 2.70,
            hardness: 107,
            meltingPoint: 582,
        },
        thermalProfile: [
            { temp: 20, strength: 276 },
            { temp: 100, strength: 250 },
            { temp: 200, strength: 180 },
            { temp: 300, strength: 60 },
            { temp: 400, strength: 15 },
        ]
    },
    {
        id: 'mat_custom_01',
        name: 'Experimental Steel X-1',
        category: 'User Defined',
        type: 'custom',
        description: 'High-carbon variant for durability testing.',
        properties: {
            density: 7.85,
            hardness: 600,
            meltingPoint: 1500,
        },
        thermalProfile: [
            { temp: 20, strength: 1200 },
            { temp: 500, strength: 800 },
            { temp: 1000, strength: 100 },
        ]
    }
];

const MaterialLibraryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMat, setSelectedMat] = useState(MATERIALS_DB[0]);
    const [activeView, setActiveView] = useState('mechanical'); // mechanical, thermal

    // Filter Logic
    const filteredMaterials = MATERIALS_DB.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
            
            {/* 1. LEFT SIDEBAR: LIST & SEARCH */}
            <div className="w-full md:w-80 flex flex-col bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white font-bold flex items-center">
                            <Database className="w-5 h-5 mr-2 text-indigo-500" />
                            Library
                        </h2>
                        <button className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search alloys..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredMaterials.map(mat => (
                        <button
                            key={mat.id}
                            onClick={() => setSelectedMat(mat)}
                            className={`w-full text-left p-4 border-b border-gray-800 transition-colors hover:bg-gray-800/50 flex justify-between group ${
                                selectedMat.id === mat.id ? 'bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                            <div>
                                <h3 className={`text-sm font-semibold ${selectedMat.id === mat.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                    {mat.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">{mat.category}</p>
                            </div>
                            {mat.type === 'standard' && (
                                <CheckCircle className="w-4 h-4 text-emerald-500/50 mt-1" />
                            )}
                        </button>
                    ))}
                </div>
                
                {/* Footer Stats */}
                <div className="p-3 bg-gray-950 border-t border-gray-800 text-[10px] text-gray-500 text-center uppercase tracking-wider">
                    {filteredMaterials.length} Materials Loaded
                </div>
            </div>

            {/* 2. MAIN CONTENT: DETAIL VIEW */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                
                {/* Hero Header */}
                <div className="p-8 border-b border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Beaker className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    selectedMat.type === 'standard' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {selectedMat.type === 'standard' ? 'Verified Standard' : 'User Custom'}
                                </span>
                                <span className="text-gray-500 text-xs font-mono">ID: {selectedMat.id}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{selectedMat.name}</h1>
                            <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">{selectedMat.description}</p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Clone Material">
                                <Copy className="w-5 h-5" />
                            </button>
                            {selectedMat.type === 'custom' && (
                                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Material">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* KEY PROPERTIES CARD */}
                        <Card className="bg-gray-950/50 border-gray-800 h-fit">
                            <div className="p-4 border-b border-gray-800 flex items-center">
                                <Layers className="w-4 h-4 mr-2 text-indigo-500" />
                                <h3 className="text-sm font-semibold text-white">Physical Properties</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <PropertyRow label="Density" value={selectedMat.properties.density} unit="g/cm³" />
                                <PropertyRow label="Hardness (Vickers)" value={selectedMat.properties.hardness} unit="HV" />
                                <PropertyRow label="Melting Point" value={selectedMat.properties.meltingPoint} unit="°C" />
                                <PropertyRow label="Poisson's Ratio" value="0.33" unit="" />
                            </div>
                        </Card>

                        {/* CHART SECTION */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Tabs */}
                            <div className="flex space-x-4 border-b border-gray-800 pb-1">
                                <button 
                                    onClick={() => setActiveView('mechanical')}
                                    className={`text-sm font-medium pb-3 border-b-2 transition-colors ${activeView === 'mechanical' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Mechanical Behavior
                                </button>
                                <button 
                                    onClick={() => setActiveView('thermal')}
                                    className={`text-sm font-medium pb-3 border-b-2 transition-colors ${activeView === 'thermal' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Thermal Properties
                                </button>
                            </div>

                            {/* The Graph */}
                            <Card className="bg-black/40 border-gray-800 h-80 relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded border border-gray-700">
                                        <Activity className="w-3 h-3 text-emerald-400" />
                                        <span>Yield Strength (MPa)</span>
                                    </div>
                                </div>
                                <div className="w-full h-full p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedMat.thermalProfile}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                                            <XAxis 
                                                dataKey="temp" 
                                                stroke="#9CA3AF" 
                                                tick={{fontSize: 10}} 
                                                label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5, fill: '#6B7280', fontSize: 10 }}
                                            />
                                            <YAxis 
                                                stroke="#9CA3AF" 
                                                tick={{fontSize: 10}}
                                                label={{ value: 'Strength (MPa)', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 10 }} 
                                            />
                                            <Tooltip 
                                                contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px'}}
                                                itemStyle={{color: '#fff', fontSize: '12px'}}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="strength" 
                                                stroke="#10B981" 
                                                strokeWidth={2} 
                                                dot={{r: 4, fill: '#10B981', strokeWidth: 0}}
                                                activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}}
                                            />
                                            <ReferenceLine y={selectedMat.properties.meltingPoint} stroke="red" strokeDasharray="3 3" label={{ value: 'Melting Pt', fill: 'red', fontSize: 10 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <div className="flex items-start p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-indigo-400 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Simulation Impact</h4>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                        The rapid drop in yield strength at <strong>{activeView === 'mechanical' ? '600°C' : '800°C'}</strong> indicates potential for thermal softening during high-speed machining. Ensure coolant pressure is sufficient to maintain tool life.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Sub-component
const PropertyRow = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
        <span className="text-sm text-gray-400">{label}</span>
        <div className="flex items-baseline">
            <span className="text-white font-mono font-medium">{value}</span>
            <span className="text-xs text-gray-500 ml-1">{unit}</span>
        </div>
    </div>
);

export default MaterialLibraryPage;