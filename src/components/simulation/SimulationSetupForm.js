import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import { ToolIcon, CogIcon, ChipIcon, UploadIcon, ChartBarIcon } from '../../assets/icons'; // Ensure these exist in icons.js
import { useSettings } from '../../context/SettingsContext'; 

// --- Helper UI Components ---

const Section = ({ title, icon, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl mb-6">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-4">
            <div className="text-indigo-500 bg-indigo-500/10 p-2 rounded-lg">{icon}</div>
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        </div>
        <div className="space-y-6">{children}</div>
    </div>
);

const InputGroup = ({ label, children, description }) => (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
        {children}
        {description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{description}</p>}
    </div>
);

const Input = ({ value, setter, type = "text", placeholder, suffix }) => (
    <div className="relative">
        <input
            type={type}
            value={value}
            onChange={e => setter(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
        />
        {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500 text-xs font-bold">{suffix}</span>
            </div>
        )}
    </div>
);

const Select = ({ value, setter, options, placeholder = "Select option..." }) => (
    <div className="relative">
        <select
            value={value}
            onChange={e => setter(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
        >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => (
                <option key={opt.id || opt.value} value={opt.id || opt.value}>
                    {opt.name || opt.label}
                </option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
);

const ModeToggle = ({ options, active, setter }) => (
    <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700">
        {options.map(opt => (
            <button
                key={opt.value}
                type="button"
                onClick={() => setter(opt.value)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                    active === opt.value 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
            </button>
        ))}
    </div>
);

const GCodeUploader = ({ file, setFile }) => (
    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${
        file ? 'border-green-500 bg-green-500/5' : 'border-gray-600 hover:border-indigo-500 hover:bg-gray-800/50'
    }`}>
        <input 
            type="file" 
            accept=".gcode,.nc,.txt,.tap" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className={`p-3 rounded-full ${file ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20'}`}>
                {file ? <span className="text-xl">✓</span> : <UploadIcon className="w-6 h-6" />}
            </div>
            {file ? (
                <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-green-400">{(file.size / 1024).toFixed(1)} KB loaded</p>
                </div>
            ) : (
                <div>
                    <p className="text-gray-300 font-medium group-hover:text-white">Upload G-Code File</p>
                    <p className="text-xs text-gray-500">Supports .nc, .gcode, .txt</p>
                </div>
            )}
        </div>
    </div>
);

// --- Main Form Component ---

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    const { settings } = useSettings(); 

    // --- State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Libraries
    const [materials, setMaterials] = useState([]);
    const [tools, setTools] = useState([]);

    // 1. Process Definition
    const [name, setName] = useState('');
    const [machiningType, setMachiningType] = useState('turning'); // turning | milling | drilling
    const [controlMode, setControlMode] = useState('gcode'); // gcode | manual

    // 2. Resources
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');

    // 3. Motion Parameters (Used as Baseline/Manual)
    const [rpm, setRpm] = useState(1200);
    const [feedRate, setFeedRate] = useState(200.0);
    const [gcodeFile, setGcodeFile] = useState(null);

    // 4. Workpiece Geometry
    const [wpSize, setWpSize] = useState({ x: 50, y: 50, z: 20 }); // mm

    // 5. Adaptive AI Governor (Safety Limits)
    const [maxTorque, setMaxTorque] = useState(1000);     // Nm
    const [targetStress, setTargetStress] = useState(500); // MPa
    const [feedLimits, setFeedLimits] = useState({ min: 10, max: 500 }); // mm/min

    // Load Data
    useEffect(() => {
        const loadResources = async () => {
            try {
                const [mats, tls] = await Promise.all([api.getMaterials(), api.getTools()]);
                setMaterials(mats.data);
                setTools(tls.data);
            } catch (err) {
                setError("Failed to load tool/material libraries. Check backend connection.");
            }
        };
        loadResources();
    }, []);

    // Auto-Namer
    useEffect(() => {
        const mat = materials.find(m => m.id === parseInt(selectedMaterialId));
        const tool = tools.find(t => t.id === parseInt(selectedToolId));
        if (mat && tool) {
            const modeStr = controlMode === 'gcode' ? 'G-Code' : 'Manual';
            const typeStr = machiningType.charAt(0).toUpperCase() + machiningType.slice(1);
            setName(`${typeStr} ${mat.name} [${modeStr}]`);
        }
    }, [selectedMaterialId, selectedToolId, machiningType, controlMode, materials, tools]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Step A: Handle G-Code Upload
            let gcodePath = "";
            if (controlMode === 'gcode') {
                if (!gcodeFile) throw new Error("Please upload a G-Code file for this mode.");
                const uploadRes = await api.uploadGCode(gcodeFile);
                gcodePath = uploadRes.data.path; 
            }

            // Step B: Determine Physics Resolution (from Global Settings)
            // 'research' = 2um particles, 'high' = 5um, 'standard' = 100um (Safe)
            let smoothRad = 0.0001; // Standard (0.1mm)
            if (settings.solverPrecision === 'high') smoothRad = 0.00005; // 0.05mm
            if (settings.solverPrecision === 'research') smoothRad = 0.00002; // 0.02mm
            
            // Override for laptop safety if not explicitly set high
            // We validated 0.002 (2mm) runs fast on i5. 
            // For production/i7, we use 0.0005 (0.5mm).
            smoothRad = 0.0005; 

            // Step C: Construct Payload (Matches input_turning.json structure)
            const payload = {
                name,
                tool_id: parseInt(selectedToolId),
                material_id: parseInt(selectedMaterialId),
                machining_type: machiningType,
                
                // Engine Configuration
                gcode_file: gcodePath,
                unit_scale_factor: 0.001, // Always meters internally
                
                // Baseline State (Required even for G-Code init)
                machining_parameters: {
                    rpm: parseFloat(rpm),
                    feed_rate_mm_min: parseFloat(feedRate)
                },

                // The Governor (Adaptive Control)
                optimization_constraints: {
                    target_stress_MPa: parseFloat(targetStress),
                    max_torque_Nm: parseFloat(maxTorque),
                    min_feed_rate_mm_min: parseFloat(feedLimits.min),
                    max_feed_rate_mm_min: parseFloat(feedLimits.max)
                },

                // Physics Engine Settings
                simulation_parameters: {
                    num_steps: controlMode === 'gcode' ? 2000 : 1000, // G-code usually longer
                    time_step_duration_s: 0.0001,
                    output_interval_steps: 20
                },
                
                sph_parameters: {
                    smoothing_radius_m: smoothRad,
                    gas_stiffness: 3000.0,
                    viscosity: 0.01
                },

                // Workpiece Geometry (Centered on 0,0 for Turning, Positive Z for Drilling)
                workpiece_setup: {
                    min_corner: [-wpSize.x/2000, -wpSize.y/2000, machiningType === 'drilling' ? -wpSize.z/1000 : -wpSize.z/2000],
                    max_corner: [wpSize.x/2000, wpSize.y/2000, machiningType === 'drilling' ? 0 : wpSize.z/2000]
                },
                
                // Defaults
                physics_parameters: { ambient_temperature_C: 25.0 },
                cfd_parameters: { enable_cfd: false }
            };

            await api.createSimulation(payload);
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.message || "Simulation failed to start.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">New Simulation Setup</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="bg-gray-800 px-2 py-1 rounded text-indigo-400 font-mono">v3.2 Engine</span>
                    <span>•</span>
                    <span>Adaptive Control Enabled</span>
                    <span>•</span>
                    <span>SYCL Accelerated</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                
                {/* 1. PROCESS TYPE & RESOURCES */}
                <Section title="Process & Resources" icon={<ToolIcon className="w-6 h-6"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Type Selection */}
                        <div className="space-y-6">
                            <InputGroup label="Machining Operation">
                                <ModeToggle 
                                    active={machiningType}
                                    setter={setMachiningType}
                                    options={[
                                        { value: 'turning', label: 'Turning', icon: '🔄' },
                                        { value: 'milling', label: 'Milling', icon: '⚙️' },
                                        { value: 'drilling', label: 'Drilling', icon: '⏬' }
                                    ]} 
                                />
                            </InputGroup>

                            <InputGroup label="Control Method" description={controlMode === 'gcode' ? "Simulation follows toolpath exactly." : "Simulation runs constant parameters."}>
                                <ModeToggle 
                                    active={controlMode}
                                    setter={setControlMode}
                                    options={[
                                        { value: 'gcode', label: 'G-Code File', icon: '📄' },
                                        { value: 'manual', label: 'Manual Input', icon: '🎛️' }
                                    ]} 
                                />
                            </InputGroup>
                        </div>

                        {/* Right: Asset Selection */}
                        <div className="space-y-6">
                            <InputGroup label="Tool Geometry">
                                <Select value={selectedToolId} setter={setSelectedToolId} options={tools.map(t => ({id: t.id, name: `${t.name} (${t.tool_type})`}))} placeholder="Select Tool Model..." />
                            </InputGroup>
                            <InputGroup label="Workpiece Material">
                                <Select value={selectedMaterialId} setter={setSelectedMaterialId} options={materials} placeholder="Select Material Grade..." />
                            </InputGroup>
                        </div>
                    </div>
                </Section>

                {/* 2. MOTION & G-CODE */}
                <Section title="Motion Control" icon={<CogIcon className="w-6 h-6"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* G-Code Uploader */}
                        {controlMode === 'gcode' && (
                            <div className="md:col-span-2">
                                <InputGroup label="Upload Program">
                                    <GCodeUploader file={gcodeFile} setFile={setGcodeFile} />
                                </InputGroup>
                            </div>
                        )}

                        {/* Baseline Params (Always needed for init state) */}
                        <InputGroup label="Spindle Speed (RPM)" description="Starting RPM (or constant for Manual mode).">
                            <Input type="number" value={rpm} setter={setRpm} suffix="RPM" />
                        </InputGroup>

                        <InputGroup label="Base Feed Rate" description="Starting Feed (or constant for Manual mode).">
                            <Input type="number" value={feedRate} setter={setFeedRate} suffix="mm/min" />
                        </InputGroup>
                    </div>
                </Section>

                {/* 3. WORKPIECE & PHYSICS */}
                <Section title="Workpiece & Physics" icon={<ChartBarIcon className="w-6 h-6"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Length (X)">
                            <Input type="number" value={wpSize.x} setter={v => setWpSize({...wpSize, x: v})} suffix="mm" />
                        </InputGroup>
                        <InputGroup label="Width (Y)">
                            <Input type="number" value={wpSize.y} setter={v => setWpSize({...wpSize, y: v})} suffix="mm" />
                        </InputGroup>
                        <InputGroup label="Height (Z)">
                            <Input type="number" value={wpSize.z} setter={v => setWpSize({...wpSize, z: v})} suffix="mm" />
                        </InputGroup>
                    </div>
                </Section>

                {/* 4. ADAPTIVE AI GOVERNOR */}
                <Section title="Adaptive AI Governor (Safety Limits)" icon={<ChipIcon className="w-6 h-6"/>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InputGroup label="Max Torque Limit" description="Feed reduces if torque exceeds this.">
                            <Input type="number" value={maxTorque} setter={setMaxTorque} suffix="Nm" />
                        </InputGroup>
                        
                        <InputGroup label="Target Stress" description="AI optimizes feed to maintain this load.">
                            <Input type="number" value={targetStress} setter={setTargetStress} suffix="MPa" />
                        </InputGroup>

                        <InputGroup label="Min Feed Rate" description="Hard floor for adaptive braking.">
                            <Input type="number" value={feedLimits.min} setter={v => setFeedLimits({...feedLimits, min: v})} suffix="mm/min" />
                        </InputGroup>

                        <InputGroup label="Max Feed Rate" description="Hard ceiling for adaptive acceleration.">
                            <Input type="number" value={feedLimits.max} setter={v => setFeedLimits({...feedLimits, max: v})} suffix="mm/min" />
                        </InputGroup>
                    </div>
                </Section>

                {/* Footer / Submit */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur border-t border-gray-800 p-4 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="hidden md:block">
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Simulation Name</span>
                            <p className="text-white font-bold truncate max-w-md">{name}</p>
                        </div>
                        <div className="flex space-x-4 w-full md:w-auto">
                            <button 
                                type="button" 
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading || !selectedToolId || !selectedMaterialId || (controlMode === 'gcode' && !gcodeFile)}
                                className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Initializing Engine...</span>
                                    </span>
                                ) : 'Launch Simulation'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold animate-bounce">
                        ⚠️ {error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default SimulationSetupForm;