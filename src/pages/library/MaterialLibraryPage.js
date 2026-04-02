import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Database,
    Activity, Trash2, Copy,
    CheckCircle, Beaker, X, Save,
    Hammer, Disc, Shield, Zap, Lock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import Card from '../../components/common/Card';
import MaterialService from '../../services/MaterialService';
import VaultService from '../../services/VaultService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Material Library Page - Main Logic
const MaterialLibraryPage = () => {
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMat, setSelectedMat] = useState(null);
    const [activeTab, setActiveTab] = useState('workpiece'); // 'workpiece' | 'tool_material' | 'coating'
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // --- FORM STATE ---
    const defaultForm = {
        name: '',
        category: 'Custom',
        description: '',
        classification: 'workpiece',
        properties: {},
        plasticity: { johnsonCook: {} },
        wear: { usui: {} }
    };
    const [newMatForm, setNewMatForm] = useState(defaultForm);

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            const data = await MaterialService.getAll();
            setMaterials(data);
        } catch (err) {
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.classification === activeTab &&
        (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        if (filteredMaterials.length > 0) {
            setSelectedMat(filteredMaterials[0]);
        } else {
            setSelectedMat(null);
        }
    }, [activeTab, materials]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material permanently?")) return;
        try {
            const updated = await MaterialService.delete(id);
            setMaterials(updated);
            toast.success("Material deleted");
        } catch (err) {
            toast.error("Failed to delete material");
        }
    };

    const handleVault = async (mat) => {
        const password = prompt("Set a strict Master Key to encrypt this material inside the Zero-Trust Vault:\n\nWARNING: The plaintext copy will be PERMANENTLY ERASED from this library.");
        if (!password) return;

        const toastId = toast.loading("Encrypting to Secure Enclave...");
        try {
            await VaultService.lockAsset(mat, password, mat.name, 'material', 'System Operator');
            await MaterialService.delete(mat.id);
            toast.success("Asset Vaulted & Original Erased", { id: toastId });
            const updated = await MaterialService.getAll();
            setMaterials(updated);
        } catch (err) {
            toast.error("Encryption Failed", { id: toastId });
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        console.log("handleAddSubmit called"); // DEBUG
        try {
            console.log("Form Data:", newMatForm); // DEBUG
            // Parse numeric fields
            const parseNum = (val) => {
                if (val === '' || val === undefined || val === null) return 0;
                const parsed = parseFloat(val);
                return isNaN(parsed) ? 0 : parsed;
            };

            const payload = {
                ...newMatForm,
                classification: activeTab,
                properties: {
                    ...newMatForm.properties,
                    density: parseNum(newMatForm.properties.density),
                    youngsModulus: parseNum(newMatForm.properties.youngsModulus),
                    poissonsRatio: parseNum(newMatForm.properties.poissonsRatio),
                    meltingPoint: parseNum(newMatForm.properties.meltingPoint),
                    thermalConductivity: parseNum(newMatForm.properties.thermalConductivity),
                    specificHeat: parseNum(newMatForm.properties.specificHeat),
                    yieldStrength: parseNum(newMatForm.properties.yieldStrength),
                    frictionCoeff: parseNum(newMatForm.properties.frictionCoeff),
                    maxTemp: parseNum(newMatForm.properties.maxTemp)
                },
                plasticity: {
                    johnsonCook: {
                        A: parseNum(newMatForm.plasticity?.johnsonCook?.A),
                        B: parseNum(newMatForm.plasticity?.johnsonCook?.B),
                        n: parseNum(newMatForm.plasticity?.johnsonCook?.n),
                        C: parseNum(newMatForm.plasticity?.johnsonCook?.C),
                        m: parseNum(newMatForm.plasticity?.johnsonCook?.m)
                    }
                },
                wear: {
                    usui: {
                        A: parseNum(newMatForm.wear?.usui?.A),
                        B: parseNum(newMatForm.wear?.usui?.B)
                    }
                }
            };

            console.log("Payload prepared:", payload); // DEBUG

            const updated = await MaterialService.add(payload);
            console.log("MaterialService.add success"); // DEBUG
            setMaterials(updated);
            setIsAddModalOpen(false);
            setNewMatForm(defaultForm);
            toast.success("Material created successfully");
        } catch (err) {
            console.error("handleAddSubmit Error:", err);
            toast.error("Failed to create material: " + err.message);
        }
    };

    // --- RENDER HELPERS ---
    const renderDetailView = () => {
        if (!selectedMat) return <div className="p-10 text-studio-text-secondary text-center">Select an item to view details</div>;
        if (selectedMat.classification === 'workpiece') return <WorkpieceDetail mat={selectedMat} />;
        if (selectedMat.classification === 'tool_material') return <ToolMaterialDetail mat={selectedMat} />;
        if (selectedMat.classification === 'coating') return <CoatingDetail mat={selectedMat} />;
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 relative">

            {/* --- ADD MATERIAL MODAL --- */}
            {isAddModalOpen && (
                <AddMaterialModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddSubmit}
                    form={newMatForm}
                    setForm={setNewMatForm}
                    type={activeTab}
                />
            )}

            {/* 1. LEFT SIDEBAR: LIST & SEARCH */}
            <div className="w-full md:w-80 flex flex-col bg-studio-panel border border-studio-border rounded-xl shadow-lg overflow-hidden shrink-0">
                {/* TABS */}
                <div className="flex border-b border-studio-border">
                    {['workpiece', 'tool_material', 'coating'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors 
                            ${activeTab === tab ? 'bg-studio-accent/10 text-studio-accent border-b-2 border-studio-accent' : 'text-studio-text-secondary hover:text-studio-text hover:bg-white/5 border-b-2 border-transparent'}`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Header */}
                <div className="p-4 border-b border-studio-border">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-studio-text font-semibold flex items-center gap-2 text-sm capitalize">
                            <Database className="w-4 h-4 text-studio-accent" />
                            {activeTab.replace('_', ' ')} Library
                        </h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="p-1.5 bg-studio-accent/20 text-studio-accent hover:bg-studio-accent hover:text-white rounded transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-studio-text-secondary" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-studio-bg border border-studio-border rounded text-sm text-studio-text placeholder-studio-text-secondary focus:border-studio-accent outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-studio-text-secondary text-xs">Loading materials...</div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="p-8 text-center text-studio-text-secondary text-sm">No materials found</div>
                    ) : (
                        filteredMaterials.map(mat => (
                            <button
                                key={mat.id}
                                onClick={() => setSelectedMat(mat)}
                                className={`w-full text-left p-3 border-b border-studio-border transition-colors flex justify-between group 
                                    ${selectedMat?.id === mat.id ? 'bg-studio-accent/10 border-l-2 border-l-studio-accent' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}
                            >
                                <div>
                                    <h3 className={`text-sm font-medium ${selectedMat?.id === mat.id ? 'text-studio-text' : 'text-studio-text-secondary group-hover:text-studio-text'}`}>
                                        {mat.name}
                                    </h3>
                                    <p className="text-[10px] text-studio-text-secondary mt-0.5">{mat.category}</p>
                                </div>
                                {mat.type === 'standard' && (
                                    <CheckCircle className="w-3 h-3 text-emerald-500/50 mt-1" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* 2. MAIN CONTENT: DETAIL VIEW */}
            <div className="flex-1 flex flex-col min-w-0 bg-studio-panel border border-studio-border rounded-xl shadow-lg overflow-hidden">
                {selectedMat ? (
                    <>
                        <div className="p-6 border-b border-studio-border bg-gradient-to-r from-studio-panel to-studio-bg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-studio-bg border border-studio-border text-studio-text-secondary">
                                            {selectedMat.category}
                                        </span>
                                        <span className="text-studio-text-secondary text-[10px] font-mono">ID: {selectedMat.id}</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-studio-text mb-2">{selectedMat.name}</h1>
                                    <p className="text-studio-text-secondary max-w-2xl text-sm leading-relaxed">{selectedMat.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    {selectedMat.type === 'custom' && (
                                        <>
                                            <button onClick={() => handleVault(selectedMat)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded transition-colors" title="Lock in IP Vault">
                                                <Lock className="w-3.5 h-3.5" /> Vault IP
                                            </button>
                                            <button onClick={() => handleDelete(selectedMat.id)} className="p-2 text-studio-text-secondary hover:text-red-400 hover:bg-studio-bg rounded-lg transition-colors" title="Delete Material">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-studio-bg">
                            {renderDetailView()}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4">
                        <div className="w-16 h-16 rounded-full bg-studio-panel border border-studio-border flex items-center justify-center shadow-inner">
                            <Database className="w-8 h-8 text-studio-text-secondary" />
                        </div>
                        <p className="text-studio-text-secondary">Select a material to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const WorkpieceDetail = ({ mat }) => {
    const [activeTab, setActiveTab] = useState('thermal');

    // ─── Read engine-aligned flat fields ───
    const density = mat.density_kg_m3 || mat.properties?.density || 0;
    const youngsModulus = mat.youngs_modulus_Pa || mat.properties?.youngsModulus || 0;
    const specificHeat = mat.specific_heat_J_kgK || mat.properties?.specificHeat || 0;
    const thermalCond = mat.thermal_conductivity_W_mK || mat.properties?.thermalConductivity || 0;
    const meltingPoint = mat.melting_point_C || mat.properties?.meltingPoint || 0;
    const yieldStrength = mat.yield_strength_MPa || mat.properties?.yieldStrength || 0;
    const failureStrain = mat.failure_strain || 0;
    const jc = mat.johnson_cook || mat.plasticity?.johnsonCook || {};
    const jcA = jc.A || 0;
    const jcB = jc.B || 0;
    const jcn = jc.n || 0;
    const jcC = jc.C || 0;
    const jcm = jc.m || 1.0;

    // ─── Compute Yield Strength vs Temperature (Johnson-Cook thermal softening) ───
    // σ(T) = A · [1 − ((T − T_ref) / (T_melt − T_ref))^m]
    // T_ref = 25°C (room temperature)
    const computeThermalProfile = () => {
        if (!jcA || !meltingPoint) return null;
        const tRef = 25;
        const tMelt = meltingPoint;
        const steps = 20;
        const data = [];
        for (let i = 0; i <= steps; i++) {
            const temp = Math.round(tRef + (tMelt - tRef) * (i / steps));
            const tStar = (temp - tRef) / (tMelt - tRef);
            const strength = Math.max(0, jcA * (1 - Math.pow(Math.min(tStar, 1), jcm)));
            data.push({ temp, strength: Math.round(strength) });
        }
        return data;
    };

    const thermalProfile = computeThermalProfile();

    // Helper to generate simulation impact text
    const getSimulationImpact = () => {
        const impacts = [];
        if (density > 6000) impacts.push("High density may increase inertia forces in high-speed dynamics.");
        if (thermalCond < 10) impacts.push("Low thermal conductivity will concentrate heat in the shear zone, promoting thermal softening but increasing tool thermal load.");
        if (jcm > 0.8) impacts.push("High thermal softening sensitivity (m > 0.8) indicates significant strength reduction at elevated temperatures.");
        if (jcA > 1000) impacts.push("High initial yield strength requires rigid machine setup and high cutting forces.");
        return impacts.length > 0 ? impacts.join(" ") : "Standard material behavior expected.";
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* TABS */}
            <div className="flex border-b border-studio-border">
                {['physical', 'mechanical', 'thermal'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`mr-6 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 
                        ${activeTab === tab ? 'text-studio-accent border-studio-accent' : 'text-studio-text-secondary border-transparent hover:text-studio-text'}`}
                    >
                        {tab} Properties
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="min-h-[300px]">
                {activeTab === 'physical' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-5">
                            <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 border-b border-studio-border pb-2">Basic Properties</h3>
                            <div className="space-y-3">
                                <PropertyRow label="Density" value={density} unit="kg/m³" />
                                <PropertyRow label="Melting Point" value={meltingPoint} unit="°C" />
                                <PropertyRow label="Young's Modulus" value={youngsModulus ? (youngsModulus / 1e9).toFixed(1) : '-'} unit="GPa" />
                                <PropertyRow label="Yield Strength" value={yieldStrength} unit="MPa" />
                                <PropertyRow label="Failure Strain" value={failureStrain} unit="" />
                            </div>
                        </Card>
                        <Card className="p-5">
                            <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 border-b border-studio-border pb-2">Thermal Properties</h3>
                            <div className="space-y-3">
                                <PropertyRow label="Thermal Cond." value={thermalCond} unit="W/mK" />
                                <PropertyRow label="Specific Heat" value={specificHeat} unit="J/kgK" />
                                <PropertyRow label="Melting Point" value={meltingPoint} unit="°C" />
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'mechanical' && (
                    <div className="space-y-6">
                        <Card className="p-5">
                            <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-studio-border pb-2">
                                <Hammer className="w-4 h-4 text-amber-500" /> Johnson-Cook Plasticity Model
                            </h3>
                            {jcA ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Initial Yield (A)</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{jcA} <span className="text-xs text-studio-text-secondary">MPa</span></div>
                                    </div>
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Hardening Modulus (B)</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{jcB} <span className="text-xs text-studio-text-secondary">MPa</span></div>
                                    </div>
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Hardening Exp (n)</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{jcn}</div>
                                    </div>
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Strain Rate Coeff (C)</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{jcC}</div>
                                    </div>
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Thermal Softening (m)</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{jcm}</div>
                                    </div>
                                    <div className="p-3 bg-studio-bg rounded border border-studio-border">
                                        <div className="text-[10px] text-studio-text-secondary uppercase">Failure Strain</div>
                                        <div className="text-xl font-mono text-studio-text mt-1">{failureStrain}</div>
                                    </div>
                                </div>
                            ) : <div className="text-studio-text-secondary italic">No plasticity model defined.</div>}
                        </Card>
                    </div>
                )}

                {activeTab === 'thermal' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="p-5 col-span-2 h-80">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider">Yield Strength vs Temperature</h3>
                                <div className="px-2 py-1 rounded bg-studio-accent/10 border border-studio-accent/20 text-xs text-studio-accent font-mono flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Thermal Softening
                                </div>
                            </div>
                            {thermalProfile ? (
                                <ResponsiveContainer width="100%" height="85%">
                                    <LineChart data={thermalProfile}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} vertical={false} />
                                        <XAxis
                                            dataKey="temp"
                                            stroke="#666"
                                            tick={{ fontSize: 10, fill: '#888' }}
                                            label={{ value: 'Temperature (°C)', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 10 }}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            tick={{ fontSize: 10, fill: '#888' }}
                                            label={{ value: 'Strength (MPa)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#888', marginBottom: '4px' }}
                                            formatter={(v) => [`${v} MPa`, 'Yield Strength']}
                                            labelFormatter={(t) => `${t} °C`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="strength"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#000' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-studio-text-secondary text-sm flex-col gap-2">
                                    <Activity className="w-8 h-8 opacity-30" />
                                    <span>Missing Johnson-Cook A or melting point to compute profile</span>
                                </div>
                            )}
                        </Card>

                        <div className="space-y-6">
                            <Card className="p-5">
                                <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 border-b border-studio-border pb-2">Thermal Properties</h3>
                                <div className="space-y-3">
                                    <PropertyRow label="Thermal Cond." value={thermalCond} unit="W/mK" />
                                    <PropertyRow label="Specific Heat" value={specificHeat} unit="J/kgK" />
                                    <PropertyRow label="Melting Point" value={meltingPoint} unit="°C" />
                                </div>
                            </Card>

                            {/* J-C Parameters Summary */}
                            <Card className="p-5">
                                <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 border-b border-studio-border pb-2">Softening Parameters</h3>
                                <div className="space-y-3">
                                    <PropertyRow label="A (Yield)" value={jcA} unit="MPa" />
                                    <PropertyRow label="m (Thermal)" value={jcm} unit="" />
                                    <PropertyRow label="T_ref" value="25" unit="°C" />
                                    <PropertyRow label="T_melt" value={meltingPoint} unit="°C" />
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* SIMULATION IMPACT INSIGHT */}
            <div className="mt-6 p-4 rounded-lg bg-studio-accent/5 border border-studio-accent/20 flex gap-4 items-start">
                <div className="p-2 bg-studio-accent/10 rounded-lg shrink-0">
                    <Zap className="w-5 h-5 text-studio-accent" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-studio-text mb-1">Simulation Impact</h4>
                    <p className="text-sm text-studio-text-secondary leading-relaxed">
                        {getSimulationImpact()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ToolMaterialDetail = ({ mat }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
            <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-studio-border pb-2">
                <Disc className="w-3 h-3 text-amber-500" /> Substrate Properties
            </h3>
            <div className="space-y-3">
                <PropertyRow label="Density" value={mat.properties.density} unit="kg/m³" />
                <PropertyRow label="Young's Modulus" value={(mat.properties.youngsModulus / 1e9).toFixed(1)} unit="GPa" />
                <PropertyRow label="Poisson's Ratio" value={mat.properties.poissonsRatio} unit="" />
                <PropertyRow label="Yield Strength" value={mat.properties.yieldStrength} unit="GPa" />
                <PropertyRow label="Melting Point" value={mat.properties.meltingPoint} unit="°C" />
                <PropertyRow label="Thermal Cond." value={mat.properties.thermalConductivity} unit="W/mK" />
                <PropertyRow label="Specific Heat" value={mat.properties.specificHeat} unit="J/kgK" />
            </div>
        </Card>
        <Card className="p-5">
            <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-studio-border pb-2">
                <Activity className="w-3 h-3 text-red-500" /> Wear Parameters (Usui)
            </h3>
            {mat.wear?.usui ? (
                <div className="space-y-3">
                    <PropertyRow label="Coeff A" value={mat.wear.usui.A} unit="" />
                    <PropertyRow label="Coeff B" value={mat.wear.usui.B} unit="" />
                </div>
            ) : <div className="text-studio-text-secondary text-sm italic">No wear model defined</div>}
        </Card>
    </div>
);

const CoatingDetail = ({ mat }) => (
    <div className="max-w-2xl">
        <Card className="p-6 flex gap-6 items-center">
            <div
                className="w-20 h-20 rounded-full shadow-lg border-4 border-studio-bg shrink-0"
                style={{ backgroundColor: mat.properties.color || '#fff' }}
            ></div>
            <div className="flex-1 space-y-4">
                <h3 className="text-xs font-bold text-studio-text uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-studio-border pb-2">
                    <Shield className="w-3 h-3 text-purple-500" /> Coating Properties
                </h3>
                <PropertyRow label="Friction Coeff" value={mat.properties.frictionCoeff} unit="µ" />
                <PropertyRow label="Max Temp" value={mat.properties.maxTemp} unit="°C" />
            </div>
        </Card>
    </div>
);

const AddMaterialModal = ({ isOpen, onClose, onSubmit, form, setForm, type }) => {
    const [modalTab, setModalTab] = useState('general');
    if (!isOpen) return null;

    const renderModalFields = () => {
        if (modalTab === 'general') {
            return (
                <div className="space-y-4 animate-fadeIn">
                    <InputGroup label="Material Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Alloy X" required />
                    <InputGroup label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Steel, Carbide" />
                    <div>
                        <label className="block text-[10px] font-bold text-studio-text-secondary uppercase tracking-wider mb-1">Description</label>
                        <textarea className="w-full bg-studio-bg border border-studio-border rounded-lg p-2 text-studio-text text-sm focus:border-studio-accent outline-none h-24 resize-none transition-colors"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>
            );
        }
        if (modalTab === 'physics') {
            return (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    {/* Common Fields */}
                    <InputGroup label="Density (kg/m³)" type="number" value={form.properties.density} onChange={e => setForm({ ...form, properties: { ...form.properties, density: parseFloat(e.target.value) } })} />
                    <InputGroup label="Young's Mod (Pa)" type="number" value={form.properties.youngsModulus} onChange={e => setForm({ ...form, properties: { ...form.properties, youngsModulus: parseFloat(e.target.value) } })} />
                    <InputGroup label="Poisson's Ratio" type="number" step="0.01" value={form.properties.poissonsRatio} onChange={e => setForm({ ...form, properties: { ...form.properties, poissonsRatio: parseFloat(e.target.value) } })} />
                    <InputGroup label="Melting Pt (°C)" type="number" value={form.properties.meltingPoint} onChange={e => setForm({ ...form, properties: { ...form.properties, meltingPoint: parseFloat(e.target.value) } })} />

                    {/* Tool Material Specifics */}
                    {(type === 'tool_material' || type === 'workpiece') && (
                        <>
                            <InputGroup label="Thermal Cond. (W/mK)" type="number" value={form.properties.thermalConductivity} onChange={e => setForm({ ...form, properties: { ...form.properties, thermalConductivity: parseFloat(e.target.value) } })} />
                            <InputGroup label="Specific Heat (J/kgK)" type="number" value={form.properties.specificHeat} onChange={e => setForm({ ...form, properties: { ...form.properties, specificHeat: parseFloat(e.target.value) } })} />
                        </>
                    )}

                    {type === 'tool_material' && (
                        <InputGroup label="Yield Strength (GPa)" type="number" step="0.1" value={form.properties.yieldStrength} onChange={e => setForm({ ...form, properties: { ...form.properties, yieldStrength: parseFloat(e.target.value) } })} />
                    )}
                </div>
            );
        }
        if (modalTab === 'advanced') {
            return (
                <div className="animate-fadeIn">
                    {type === 'workpiece' && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-studio-accent uppercase tracking-wider border-b border-studio-border pb-2 mb-3">Johnson-Cook Plasticity</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="A (Yield MPa)" type="number" value={form.plasticity.johnsonCook.A} onChange={e => setForm({ ...form, plasticity: { ...form.plasticity, johnsonCook: { ...form.plasticity.johnsonCook, A: e.target.value } } })} small />
                                <InputGroup label="B (Hardening MPa)" type="number" value={form.plasticity.johnsonCook.B} onChange={e => setForm({ ...form, plasticity: { ...form.plasticity, johnsonCook: { ...form.plasticity.johnsonCook, B: e.target.value } } })} small />
                                <InputGroup label="n (Hardening Exp)" type="number" value={form.plasticity.johnsonCook.n} onChange={e => setForm({ ...form, plasticity: { ...form.plasticity, johnsonCook: { ...form.plasticity.johnsonCook, n: e.target.value } } })} small />
                                <InputGroup label="C (Strain Rate)" type="number" value={form.plasticity.johnsonCook.C} onChange={e => setForm({ ...form, plasticity: { ...form.plasticity, johnsonCook: { ...form.plasticity.johnsonCook, C: e.target.value } } })} small />
                                <InputGroup label="m (Thermal Soft)" type="number" value={form.plasticity.johnsonCook.m} onChange={e => setForm({ ...form, plasticity: { ...form.plasticity, johnsonCook: { ...form.plasticity.johnsonCook, m: e.target.value } } })} small />
                            </div>
                        </div>
                    )}
                    {type === 'tool_material' && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider border-b border-studio-border pb-2 mb-3">Usui Wear Parameters</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Coeff A" type="number" step="1e-10" value={form.wear.usui.A} onChange={e => setForm({ ...form, wear: { ...form.wear, usui: { ...form.wear.usui, A: parseFloat(e.target.value) } } })} small />
                                <InputGroup label="Coeff B" type="number" value={form.wear.usui.B} onChange={e => setForm({ ...form, wear: { ...form.wear, usui: { ...form.wear.usui, B: parseFloat(e.target.value) } } })} small />
                            </div>
                        </div>
                    )}
                    {type === 'coating' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-studio-text-secondary uppercase tracking-wider mb-1">Color</label>
                                <input type="color" className="w-full h-10 bg-studio-bg border border-studio-border rounded cursor-pointer" value={form.properties.color || '#ffffff'} onChange={e => setForm({ ...form, properties: { ...form.properties, color: e.target.value } })} />
                            </div>
                            <InputGroup label="Friction Coeff" type="number" step="0.01" value={form.properties.frictionCoeff} onChange={e => setForm({ ...form, properties: { ...form.properties, frictionCoeff: e.target.value } })} />
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-studio-panel border border-studio-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-scaleIn">
                <div className="p-5 border-b border-studio-border flex justify-between items-center bg-studio-bg/50">
                    <h2 className="text-lg font-bold text-studio-text flex items-center gap-2 capitalize">
                        <Plus className="w-5 h-5 text-studio-accent" /> New {type.replace('_', ' ')}
                    </h2>
                    <button onClick={onClose} className="text-studio-text-secondary hover:text-studio-text transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-studio-border bg-studio-bg/30 px-6 pt-2">
                    {['general', 'physics', 'advanced'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setModalTab(tab)}
                            className={`mr-6 pb-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 
                            ${modalTab === tab ? 'text-studio-accent border-studio-accent' : 'text-studio-text-secondary border-transparent hover:text-studio-text'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-studio-panel">
                    <form onSubmit={onSubmit} id="add-material-form">
                        {renderModalFields()}
                    </form>
                </div>

                <div className="p-4 border-t border-studio-border bg-studio-bg/50 flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button
                        type="submit"
                        form="add-material-form"
                        variant="primary"
                        icon={Save}
                        className="flex-1"
                        onClick={(e) => {
                            // Manual fallback if form attribute fails
                            if (!document.getElementById('add-material-form').checkValidity()) return;
                            // The submit type should handle it, but we can also ensure the event bubbles or is caught
                        }}
                    >
                        Create Material
                    </Button>
                </div>
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, type = "text", placeholder, required, step, small }) => (
    <div>
        <label className={`block font-bold text-studio-text-secondary uppercase tracking-wider mb-1 ${small ? 'text-[9px]' : 'text-[10px]'}`}>{label}</label>
        <input
            type={type}
            required={required}
            step={step}
            className={`w-full bg-studio-bg border border-studio-border rounded-lg text-studio-text focus:border-studio-accent outline-none transition-all focus:ring-1 focus:ring-studio-accent/20 ${small ? 'p-1.5 text-xs' : 'p-2 text-sm'}`}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
);

const PropertyRow = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-2 border-b border-studio-border/50 last:border-0 hover:bg-white/5 transition-colors px-1 rounded-sm">
        <span className="text-xs text-studio-text-secondary font-medium">{label}</span>
        <div className="flex items-baseline">
            <span className="text-studio-text font-mono text-sm">{value !== undefined ? value : '-'}</span>
            <span className="text-[10px] text-studio-text-secondary ml-1">{unit}</span>
        </div>
    </div>
);

export default MaterialLibraryPage;