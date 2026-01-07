import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import { ToolIcon, CogIcon } from '../../assets/icons';
// --- Connect to global settings ---
import { useSettings } from '../../context/SettingsContext'; 

// --- "Smart" UI Components ---

const Input = ({ label, description, value, setter, type = "text" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => setter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
);

const Select = ({ label, description, value, setter, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            value={value}
            onChange={e => setter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none"
        >
            {children}
        </select>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
);

// --- MODIFIED: Compact Slider ---
const SliderInput = ({ label, description, value, setter, min, max, step }) => {
    
    const handleValueChange = (e) => {
        let num = parseFloat(e.target.value);
        if (isNaN(num)) num = min;
        if (num > max) num = max;
        if (num < min) num = min;
        setter(num);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <div className="flex items-center space-x-4">
                {/* Slider is now constrained width */}
                <input
                    type="range"
                    value={value}
                    onChange={handleValueChange}
                    min={min}
                    max={max}
                    step={step}
                    className="flex-grow max-w-[200px] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                {/* Precise Number Box */}
                <input
                    type="number"
                    value={value}
                    onChange={handleValueChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-24 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    );
};

const RadioCard = ({ label, description, icon, value, selectedValue, setter }) => (
    <label 
        className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer
            ${selectedValue === value 
                ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' 
                : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
            }`}
    >
        <input 
            type="radio" 
            name="machiningType" 
            value={value} 
            checked={selectedValue === value} 
            onChange={e => setter(e.target.value)} 
            className="hidden"
        />
        <div className="w-10 h-10 bg-gray-900 text-indigo-400 rounded-lg flex items-center justify-center mr-4">
            {icon}
        </div>
        <div>
            <span className="font-bold text-white">{label}</span>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </label>
);

// --- FIX: Corrected Toggle Component ---
const Toggle = ({ label, description, checked, setter }) => (
    <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setter(!checked)} // Direct state toggle on click
    >
        <div>
            <span className="font-medium text-gray-300">{label}</span>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-indigo-600' : 'bg-gray-700'}`}>
            <span 
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </div>
    </div>
);

// --- Main Form Component ---

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    
    // --- USE GLOBAL SETTINGS ---
    const { settings } = useSettings(); 

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Library Data
    const [materials, setMaterials] = useState([]);
    const [tools, setTools] = useState([]);
    
    // Step 1: General Setup
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    
    // Step 2: Physics Strategy
    const [machiningType, setMachiningType] = useState('milling');
    
    // "Turning (Linear)" Physics
    const [slidingVelocity, setSlidingVelocity] = useState(1.5);
    const [strainRate, setStrainRate] = useState(1000);
    const [rakeAngle, setRakeAngle] = useState(8.0);
    const [enableCfd, setEnableCfd] = useState(false);

    // "Milling (Rotational)" Physics
    const [spindleSpeed, setSpindleSpeed] = useState(8000); // RPM
    const [feedRate, setFeedRate] = useState(0.1); // mm/rev
    const [ambientTemp, setAmbientTemp] = useState(25);
    
    // Abstracted Workpiece Inputs
    const [wpLength, setWpLength] = useState(20); // mm
    const [wpWidth, setWpWidth] = useState(2);   // mm
    const [wpHeight, setWpHeight] = useState(5);  // mm
    
    // Auto-generate Name & Description
    useEffect(() => {
        const tool = tools.find(t => t.id === parseInt(selectedToolId));
        const mat = materials.find(m => m.id === parseInt(selectedMaterialId));
        if (tool && mat) {
            const typeStr = machiningType === 'milling' ? 'Milling' : 'Turning';
            setName(`${typeStr} ${mat.name} with ${tool.name}`);
            setDescription(`R&D test of ${tool.name} on ${mat.name} via ${typeStr} physics.`);
        }
    }, [selectedToolId, selectedMaterialId, machiningType, tools, materials]);
    
    // Load Libraries
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const [mats, tls] = await Promise.all([api.getMaterials(), api.getTools()]);
                setMaterials(mats.data);
                if (mats.data.length > 0) setSelectedMaterialId(mats.data[0].id);
                setTools(tls.data);
                if (tls.data.length > 0) setSelectedToolId(tls.data[0].id);
            } catch (err) { setError("Failed to load your Tool & Material libraries."); }
        };
        fetchLibrary();
    }, []);

    // "Smart" handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(''); 
        if (!selectedToolId || !selectedMaterialId) {
            setError("Please select a valid tool and material from your library.");
            return;
        }
        setIsLoading(true);

        // --- 1. FUNCTIONAL SETTINGS INTEGRATION ---
        // We read the global setting here to decide physics fidelity.
        const precision = settings.solverPrecision || 'standard';
        
        let simParams = {};
        let sphParams = {};

        if (precision === 'research') {
            // "Research Grade" (Very Slow, Ultra High Res)
            simParams = { num_steps: 2000, time_step_duration_s: 5e-8 };
            sphParams = { smoothing_radius_m: 0.000025, gas_stiffness: 3000.0, viscosity: 0.01 }; 
        } else if (precision === 'high') {
            // "High Precision"
            simParams = { num_steps: 1000, time_step_duration_s: 1e-7 };
            sphParams = { smoothing_radius_m: 0.00005, gas_stiffness: 3000.0, viscosity: 0.01 }; 
        } else { 
            // "Standard" (Default)
            simParams = { num_steps: 500, time_step_duration_s: 1e-6 };
            sphParams = { smoothing_radius_m: 0.0001, gas_stiffness: 3000.0, viscosity: 0.01 }; 
        }

        // 2. Build the "Smart" JSON Payload
        let simulationData = {
            name: name,
            description: description,
            tool_id: parseInt(selectedToolId),
            material_id: parseInt(selectedMaterialId),
            machining_type: machiningType,
            simulation_parameters: simParams,
            turning_params: null,
            milling_params: null,
            legacy_cfd_parameters: null,
            sph_parameters: null,
            workpiece_setup: null
        };
        
        const shared_physics = {
            ambient_temperature_C: parseFloat(ambientTemp)
        };

        if (machiningType === 'turning') {
            simulationData.turning_params = {
                ...shared_physics,
                sliding_velocity_m_s: parseFloat(slidingVelocity),
                strain_rate: parseFloat(strainRate)
            };
            simulationData.legacy_cfd_parameters = {
                enable_cfd: enableCfd,
                rake_angle_degrees: parseFloat(rakeAngle)
            };
        } else if (machiningType === 'milling') {
            simulationData.milling_params = {
                ...shared_physics,
                spindle_speed_rpm: parseFloat(spindleSpeed),
                feed_rate_mm_per_rev: parseFloat(feedRate),
                tool_axis: [0, 0, 1],
                feed_direction: [0, 1, 0] 
            };

            // Build Workpiece & SPH JSON
            const [x_min, x_max] = [-wpLength / 2000.0, wpLength / 2000.0];
            const [y_min, y_max] = [-0.001, (wpWidth - 1) / 1000.0];
            const [z_min, z_max] = [-wpHeight / 2000.0, wpHeight / 2000.0];
            
            simulationData.workpiece_setup = {
                min_corner: [x_min, y_min, z_min],
                max_corner: [x_max, y_max, z_max]
            };
            simulationData.sph_parameters = sphParams;
        }
        
        // 3. Send to the "Smart" Backend
        try {
            const res = await api.createSimulation(simulationData);
            navigate(`/simulation/${res.data.id}`);
        } catch (err) {
            console.error("Simulation creation failed:", err);
            setError(err.response?.data?.detail || "Failed to create simulation.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">New Simulation</h1>
                <p className="text-gray-400">
                    Configure your R&D test. 
                    Using <span className="text-indigo-400 font-mono">{settings?.solverPrecision || 'standard'}</span> precision (change in Settings).
                </p>
            </div>
            
            {/* --- Step 1: General Setup --- */}
            <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl space-y-6"> 
                <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Step 1: Select Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Tool" value={selectedToolId} setter={setSelectedToolId} description="The 3D tool design to be tested.">
                        {tools.length === 0 ? <option value="">Upload to Tool Library first</option> : tools.map(t=><option key={t.id} value={t.id}>{t.name} ({t.tool_type})</option>)}
                    </Select>
                    <Select label="Material" value={selectedMaterialId} setter={setSelectedMaterialId} description="The workpiece material to be cut.">
                         {materials.length === 0 ? <option value="">Create in Material Library first</option> : materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                </div>
                <Input label="Simulation Name (Auto-Generated)" value={name} setter={setName} type="text" description="This will be auto-filled, or you can type a custom name."/>
            </div>

            {/* --- Step 2: Physics Strategy --- */}
            <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Step 2: Select Physics Engine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RadioCard 
                        label="Milling / Drilling"
                        description="Rotational Physics (Smart R&D)"
                        icon={<ToolIcon />} 
                        value="milling"
                        selectedValue={machiningType}
                        setter={setMachiningType}
                    />
                    <RadioCard 
                        label="Turning / Lathe"
                        description="Linear Physics (Legacy CFD)"
                        icon={<CogIcon />}
                        value="turning"
                        selectedValue={machiningType}
                        setter={setMachiningType}
                    />
                </div>
            </div>
            
            {/* --- Step 3: Configure Parameters --- */}
            <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Step 3: Configure Parameters</h3>
                
                {/* --- "Smart" Conditional Physics Section --- */}
                {machiningType === 'milling' ? (
                    // --- MILLING (R&D) ---
                    <div className="space-y-6">
                        <SliderInput label="Spindle Speed (RPM)" description="Real-world rotational speed of the tool." value={spindleSpeed} setter={setSpindleSpeed} min={1000} max={20000} step={100} />
                        <SliderInput label="Feed Rate (mm/rev)" description="Real-world tool advancement per revolution." value={feedRate} setter={setFeedRate} min={0.01} max={0.5} step={0.01} />
                        <SliderInput label="Ambient Temp (°C)" description="Starting temperature of the tool and workpiece." value={ambientTemp} setter={setAmbientTemp} min={0} max={100} step={1} />
                        
                        <hr className="border-gray-700"/>
                        <h4 className="text-md font-semibold text-white">Workpiece Geometry</h4>
                        <SliderInput label="Workpiece Length (mm)" description="Length of the material block (X-axis)." value={wpLength} setter={setWpLength} min={5} max={100} step={1} />
                        <SliderInput label="Workpiece Width (mm)" description="Width of the material block (Y-axis / Depth of Cut)." value={wpWidth} setter={setWpWidth} min={1} max={20} step={0.5} />
                        <SliderInput label="Workpiece Height (mm)" description="Height of the material block (Z-axis)." value={wpHeight} setter={setWpHeight} min={1} max={50} step={1} />
                    </div>
                ) : (
                    // --- TURNING (LINEAR) ---
                    <div className="space-y-6">
                        <SliderInput label="Sliding Velocity (m/s)" description="Abstracted tool speed for the linear engine." value={slidingVelocity} setter={setSlidingVelocity} min={0.1} max={5} step={0.1} />
                        <SliderInput label="Strain Rate (1/s)" description="Abstracted deformation rate." value={strainRate} setter={setStrainRate} min={100} max={20000} step={100} />
                        <SliderInput label="Rake Angle (°)" description="Manual rake angle (CFD only)." value={rakeAngle} setter={setRakeAngle} min={-15} max={25} step={1} disabled={!enableCfd} />
                        <Toggle label="Enable Legacy CFD" description="Simulate 2D chip flow (slower)." checked={enableCfd} setter={setEnableCfd} />
                    </div>
                )}
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center font-medium">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading || tools.length === 0 || materials.length === 0} 
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Initializing...' : 'Start R&D Simulation'}
                </button>
            </div>
        </form>
    );
};

export default SimulationSetupForm;