import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useSimulation } from '../../context/SimulationContext';
import SimulationService from '../../services/SimulationService';
import MaterialService from '../../services/MaterialService';
import ToolService from '../../services/ToolService';

import {
    Wrench, Settings as SettingsIcon, Cpu, Upload, Check,
    ChevronDown, ChevronRight, Play, FileText, Tag,
    RefreshCw, Layers, Activity, MousePointer, FileCode,
    Droplets, Target, Gauge, Box,
    Eye, X, Copy, CheckCheck
} from 'lucide-react';


// ═══════════════════════════════════════════════════════════════
// PER-TYPE DEFAULTS  —  auto-applied when user switches type
// ═══════════════════════════════════════════════════════════════

const TYPE_DEFAULTS = {
    drilling: {
        rpm: 800, feedRate: 200.0, depthOfCut: 15.0, widthOfCut: 0,
        toolPos: [0, 0, 2], toolDirection: [0, 0, -1],
        wpBlock: { x: 50, y: 50, z: 20 }, wpCylinder: { d: 100, l: 200 },
        numSteps: 10000, timeStep: '1e-6', outputInterval: 100,
        minTimeStep: '1e-12', maxTimeStep: '1e-5',
        smoothingRadius: '0.0003', gasStiffness: 5000, maxParticles: 200000,
        jc: [0.05, 3.44, -2.12, 0.002, 0.61],
        maxNodes: 20000, dampingRatio: 0.1, massScaling: 100.0, stiffnessScaling: 1.0,
        coolantType: 'Emulsion', inletVelocity: 10.0, inletTemperature: 25.0,
        optMaxStress: 3.0, optMaxTemp: 800, optMaxWear: 0.2, optMaxForce: 4000,
        tags: 'drilling, wear-test',
        gcFallback: 'drilling_op.gcode'
    },
    turning: {
        rpm: 1200, feedRate: 0.25, depthOfCut: 1.0, widthOfCut: 0,
        toolPos: [50, 0, 0], toolDirection: [0, 0, 1],
        wpBlock: { x: 100, y: 100, z: 50 }, wpCylinder: { d: 100, l: 200 },
        numSteps: 20000, timeStep: '2e-7', outputInterval: 500,
        minTimeStep: '1e-12', maxTimeStep: '2e-6',
        smoothingRadius: '0.0004', gasStiffness: 4000, maxParticles: 300000,
        jc: [0.05, 3.44, -2.12, 0.002, 0.61],
        maxNodes: 15000, dampingRatio: 0.1, massScaling: 50.0, stiffnessScaling: 1.0,
        coolantType: 'Oil', inletVelocity: 5.0, inletTemperature: 30.0,
        optMaxStress: 2.5, optMaxTemp: 900, optMaxWear: 0.25, optMaxForce: 4000,
        tags: 'turning, wear-test',
        gcFallback: 'turning_op.gcode'
    },
    milling: {
        rpm: 3000, feedRate: 1200, depthOfCut: 2.5, widthOfCut: 5.0,
        toolPos: [-5, 10, 2.5], toolDirection: [1, 0, 0],
        wpBlock: { x: 100, y: 100, z: 20 }, wpCylinder: { d: 100, l: 200 },
        numSteps: 15000, timeStep: '5e-7', outputInterval: 200,
        minTimeStep: '1e-12', maxTimeStep: '5e-6',
        smoothingRadius: '0.0005', gasStiffness: 2000, maxParticles: 500000,
        jc: [0.02, 1.5, -1.2, 0.001, 0.5],
        maxNodes: 30000, dampingRatio: 0.05, massScaling: 1.0, stiffnessScaling: 1.0,
        coolantType: 'Mist', inletVelocity: 25.0, inletTemperature: 20.0,
        optMaxStress: 1.5, optMaxTemp: 400, optMaxWear: 0.1, optMaxForce: 4000,
        tags: 'milling, wear-test',
        gcFallback: 'milling_op.gcode'
    }
};

const TOOL_DIRECTION_LABELS = {
    drilling: '[0, 0, -1] — downward into workpiece',
    turning: '[0, 0, 1] — axial along workpiece',
    milling: '[1, 0, 0] — lateral feed direction'
};


// ═══════════════════════════════════════════════════════════════
// REUSABLE UI PRIMITIVES (studio-* design tokens)
// ═══════════════════════════════════════════════════════════════

const Section = ({ title, icon, children, collapsible, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-studio-panel rounded-xl border border-studio-border/60 overflow-hidden shadow-soft">
            <button
                type="button"
                onClick={() => collapsible && setOpen(!open)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-studio-surface/30 border-b border-studio-border/40 ${collapsible ? 'cursor-pointer hover:bg-studio-surface/50' : 'cursor-default'}`}
            >
                <div className="flex items-center space-x-2.5 text-studio-text-main">
                    <span className="text-studio-primary">{icon}</span>
                    <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
                </div>
                {collapsible && (open ? <ChevronDown className="w-4 h-4 text-studio-text-dim" /> : <ChevronRight className="w-4 h-4 text-studio-text-dim" />)}
            </button>
            {open && <div className="p-5">{children}</div>}
        </div>
    );
};

const InputGroup = ({ label, description, children, className }) => (
    <div className={className}>
        <label className="block text-xs font-medium text-studio-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
        {children}
        {description && <p className="text-xs text-studio-text-dim mt-1">{description}</p>}
    </div>
);

const Input = ({ type = 'text', value, setter, suffix, step, placeholder }) => (
    <div className="relative">
        <input
            type={type}
            value={value}
            onChange={(e) => setter(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            step={step}
            placeholder={placeholder}
            className="w-full bg-studio-surface text-studio-text-main rounded-lg px-3 py-2 text-sm border border-studio-border/60 focus:border-studio-primary focus:ring-1 focus:ring-studio-primary/30 outline-none transition-colors placeholder:text-studio-text-dim/50"
        />
        {suffix && <span className="absolute right-3 top-2 text-xs text-studio-text-dim font-mono">{suffix}</span>}
    </div>
);

const TextArea = ({ value, setter, placeholder }) => (
    <textarea
        value={value}
        onChange={(e) => setter(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-studio-surface text-studio-text-main rounded-lg px-3 py-2 text-sm border border-studio-border/60 focus:border-studio-primary focus:ring-1 focus:ring-studio-primary/30 outline-none transition-colors resize-none placeholder:text-studio-text-dim/50"
    />
);

const Select = ({ value, setter, options, placeholder }) => (
    <select
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="w-full bg-studio-surface text-studio-text-main rounded-lg px-3 py-2 text-sm border border-studio-border/60 focus:border-studio-primary focus:ring-1 focus:ring-studio-primary/30 outline-none transition-colors appearance-none cursor-pointer"
    >
        <option value="" disabled>{placeholder || 'Select...'}</option>
        {options.map(o => <option key={o.id || o.value} value={o.id || o.value}>{o.name || o.label}</option>)}
    </select>
);

const ModeToggle = ({ active, setter, options }) => (
    <div className="flex rounded-lg overflow-hidden border border-studio-border/60 bg-studio-surface">
        {options.map(o => (
            <button
                key={o.value}
                type="button"
                onClick={() => setter(o.value)}
                className={`flex-1 text-center px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${active === o.value
                    ? 'bg-studio-primary text-white shadow-inner'
                    : 'text-studio-text-dim hover:text-studio-text-muted hover:bg-studio-surface/80'
                    }`}
            >
                {o.icon}{o.label && <span>{o.label}</span>}
            </button>
        ))}
    </div>
);

const FileUploader = ({ file, setFile, accept, label, description }) => (
    <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${file ? 'border-studio-success bg-studio-success/5' : 'border-studio-border/60 hover:border-studio-primary hover:bg-studio-primary/5'
        }`}>
        <input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className={`p-2.5 rounded-full ${file ? 'bg-studio-success/20 text-studio-success' : 'bg-studio-surface text-studio-text-dim group-hover:text-studio-primary group-hover:bg-studio-primary/10'}`}>
                {file ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            {file ? (
                <div>
                    <p className="text-studio-text-main font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-studio-success">{(file.size / 1024).toFixed(1)} KB loaded</p>
                </div>
            ) : (
                <div>
                    <p className="text-studio-text-muted font-medium text-sm group-hover:text-studio-text-main">{label}</p>
                    <p className="text-xs text-studio-text-dim">{description}</p>
                </div>
            )}
        </div>
    </div>
);

const ToggleSwitch = ({ enabled, setter, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-studio-text-main font-medium">{label}</span>
        <button
            type="button"
            onClick={() => setter(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-studio-primary' : 'bg-studio-surface'} border border-studio-border/60`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


// ═══════════════════════════════════════════════════════════════
// MAIN FORM COMPONENT
// ═══════════════════════════════════════════════════════════════

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    const { startSimulation, updateLiveMetrics, updateParticles, completeSimulation, failSimulation } = useSimulation();

    // --- Core State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- JSON Preview ---
    const [showJsonPreview, setShowJsonPreview] = useState(false);
    const [previewJson, setPreviewJson] = useState('');
    const [copied, setCopied] = useState(false);

    // Libraries (loaded from local services)
    const [allMaterials, setAllMaterials] = useState([]);
    const [allTools, setAllTools] = useState([]);

    // Derived filtered lists
    const workpieceMaterials = allMaterials.filter(m => m.classification === 'workpiece');
    const coatings = allMaterials.filter(m => m.classification === 'coating');
    const toolSubstrates = allMaterials.filter(m => m.classification === 'tool_material');

    // ─── 1. Process Definition ───
    const [name, setName] = useState('');
    const [machiningType, setMachiningType] = useState('drilling');
    const [controlMode, setControlMode] = useState('gcode');

    // ─── 2. Resource Selection ───
    const [selectedWorkpieceId, setSelectedWorkpieceId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [selectedSubstrateId, setSelectedSubstrateId] = useState('');
    const [selectedCoatingId, setSelectedCoatingId] = useState('');

    // ─── 3. Motion / Machining Parameters ───
    const [rpm, setRpm] = useState(800);
    const [feedRate, setFeedRate] = useState(200.0);
    const [depthOfCut, setDepthOfCut] = useState(15.0);
    const [widthOfCut, setWidthOfCut] = useState(5.0);   // Milling only
    const [gcodeFile, setGcodeFile] = useState(null);

    // Tool position (all types)
    const [toolPosX, setToolPosX] = useState(0.0);
    const [toolPosY, setToolPosY] = useState(0.0);
    const [toolPosZ, setToolPosZ] = useState(2.0);

    // ─── 4. Workpiece Geometry ───
    // Block mode (drilling, milling)
    const [wpSize, setWpSize] = useState({ x: 50, y: 50, z: 20 });
    // Cylinder mode (turning)
    const [wpDiameter, setWpDiameter] = useState(100);
    const [wpLength, setWpLength] = useState(200);

    // ─── 5. Simulation Parameters ───
    const [numSteps, setNumSteps] = useState(10000);
    const [timeStepDuration, setTimeStepDuration] = useState('1e-6');
    const [outputInterval, setOutputInterval] = useState(100);
    const [minTimeStep, setMinTimeStep] = useState('1e-12');
    const [maxTimeStep, setMaxTimeStep] = useState('1e-5');

    // ─── 6. SPH Parameters ───
    const [smoothingRadius, setSmoothingRadius] = useState('0.0003');
    const [gasStiffness, setGasStiffness] = useState(5000);
    const [maxParticles, setMaxParticles] = useState(200000);
    const [jcD1, setJcD1] = useState(0.05);
    const [jcD2, setJcD2] = useState(3.44);
    const [jcD3, setJcD3] = useState(-2.12);
    const [jcD4, setJcD4] = useState(0.002);
    const [jcD5, setJcD5] = useState(0.61);

    // ─── 7. FEM Parameters ───
    const [maxNodes, setMaxNodes] = useState(20000);
    const [dampingRatio, setDampingRatio] = useState(0.1);
    const [massScaling, setMassScaling] = useState(100.0);
    const [stiffnessScaling, setStiffnessScaling] = useState(1.0);

    // ─── 8. CFD Parameters ───
    const [cfdEnabled, setCfdEnabled] = useState(true);
    const [cfdGridX, setCfdGridX] = useState(40);
    const [cfdGridY, setCfdGridY] = useState(40);
    const [cfdGridZ, setCfdGridZ] = useState(60);
    const [cfdCellSize, setCfdCellSize] = useState('0.001');
    const [coolantType, setCoolantType] = useState('Emulsion');
    const [inletVelocity, setInletVelocity] = useState(10.0);
    const [inletTemperature, setInletTemperature] = useState(25.0);

    // ─── 9. Optimization ───
    const [optEnabled, setOptEnabled] = useState(false);
    const [optMaxStress, setOptMaxStress] = useState(3.0);
    const [optMaxTemp, setOptMaxTemp] = useState(800);
    const [optMaxWear, setOptMaxWear] = useState(0.2);
    const [optMaxForce, setOptMaxForce] = useState(4000);

    // ─── 10. Engineering Context ───
    const [reasoning, setReasoning] = useState('');
    const [tags, setTags] = useState('drilling, wear-test');

    // ═══════════════════════════════════════════════════════════
    // DATA LOADING
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [mats, tls] = await Promise.all([
                    MaterialService.getAll(),
                    ToolService.getAll()
                ]);
                setAllMaterials(mats);
                setAllTools(tls);
            } catch (err) {
                console.error("Failed to load libraries:", err);
                setError("Failed to load material/tool libraries.");
            }
        };
        loadResources();
    }, []);

    // ═══════════════════════════════════════════════════════════
    // AUTO-RESET DEFAULTS ON TYPE CHANGE
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        const d = TYPE_DEFAULTS[machiningType];
        if (!d) return;

        setRpm(d.rpm);
        setFeedRate(d.feedRate);
        setDepthOfCut(d.depthOfCut);
        setWidthOfCut(d.widthOfCut);
        setToolPosX(d.toolPos[0]);
        setToolPosY(d.toolPos[1]);
        setToolPosZ(d.toolPos[2]);
        setWpSize(d.wpBlock);
        setWpDiameter(d.wpCylinder.d);
        setWpLength(d.wpCylinder.l);
        setNumSteps(d.numSteps);
        setTimeStepDuration(d.timeStep);
        setOutputInterval(d.outputInterval);
        setMinTimeStep(d.minTimeStep);
        setMaxTimeStep(d.maxTimeStep);
        setSmoothingRadius(d.smoothingRadius);
        setGasStiffness(d.gasStiffness);
        setMaxParticles(d.maxParticles);
        setJcD1(d.jc[0]); setJcD2(d.jc[1]); setJcD3(d.jc[2]); setJcD4(d.jc[3]); setJcD5(d.jc[4]);
        setMaxNodes(d.maxNodes);
        setDampingRatio(d.dampingRatio);
        setMassScaling(d.massScaling);
        setStiffnessScaling(d.stiffnessScaling);
        setCoolantType(d.coolantType);
        setInletVelocity(d.inletVelocity);
        setInletTemperature(d.inletTemperature);
        setOptMaxStress(d.optMaxStress);
        setOptMaxTemp(d.optMaxTemp);
        setOptMaxWear(d.optMaxWear);
        setOptMaxForce(d.optMaxForce);
        setTags(d.tags);
    }, [machiningType]);

    // Auto-Namer
    useEffect(() => {
        const mat = allMaterials.find(m => m.id === selectedWorkpieceId);
        const tool = allTools.find(t => t.id === selectedToolId);
        if (mat && tool) {
            const modeStr = controlMode === 'gcode' ? 'G-Code' : 'Manual';
            const typeStr = machiningType.charAt(0).toUpperCase() + machiningType.slice(1);
            setName(`${typeStr} ${mat.name} — ${tool.name} [${modeStr}]`);
        }
    }, [selectedWorkpieceId, selectedToolId, machiningType, controlMode, allMaterials, allTools]);

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════

    const getSelectedWorkpiece = () => allMaterials.find(m => m.id === selectedWorkpieceId);
    const getSelectedTool = () => allTools.find(t => t.id === selectedToolId);
    const getSelectedSubstrate = () => allMaterials.find(m => m.id === selectedSubstrateId);
    const getSelectedCoating = () => allMaterials.find(m => m.id === selectedCoatingId);

    const isTurning = machiningType === 'turning';
    const isDrilling = machiningType === 'drilling';
    const isMilling = machiningType === 'milling';

    // Workpiece geometry path — auto-generated
    const getWorkpieceGeometryPath = () => {
        if (isTurning) return `workpieces/cylinder_d${wpDiameter}_l${wpLength}.stp`;
        return `workpieces/block_${wpSize.x}x${wpSize.y}x${wpSize.z}.stp`;
    };

    // ═══════════════════════════════════════════════════════════
    // BUILD PAYLOAD — shared by View JSON and Launch
    // ═══════════════════════════════════════════════════════════

    const buildPayload = () => {
        const workpiece = getSelectedWorkpiece();
        const tool = getSelectedTool();
        const substrate = getSelectedSubstrate();
        const coating = getSelectedCoating();
        const d = TYPE_DEFAULTS[machiningType];

        if (!workpiece || !tool || !substrate) return null;

        // ── Machining parameters (type-specific) ──
        const machParams = {
            rpm: parseFloat(rpm),
            feed_rate_mm_min: parseFloat(feedRate),
            depth_of_cut_mm: parseFloat(depthOfCut),
            initial_tool_position_mm: [
                parseFloat(toolPosX),
                parseFloat(toolPosY),
                parseFloat(toolPosZ)
            ],
            tool_direction: d.toolDirection
        };
        if (isMilling) {
            machParams.width_of_cut_mm = parseFloat(widthOfCut);
        }

        // ── CFD parameters (type-specific) ──
        const cfdParams = {
            enabled: cfdEnabled,
            coolant_type: coolantType,
            inlet_velocity_m_s: parseFloat(inletVelocity),
            inlet_temperature_C: parseFloat(inletTemperature)
        };
        if (isDrilling) {
            cfdParams.grid_x = parseInt(cfdGridX);
            cfdParams.grid_y = parseInt(cfdGridY);
            cfdParams.grid_z = parseInt(cfdGridZ);
            cfdParams.cell_size_m = parseFloat(cfdCellSize);
        }

        // ── Optimization (type-specific) ──
        const optParams = {
            enabled: optEnabled,
            max_stress_GPa: parseFloat(optMaxStress),
            max_temperature_C: parseFloat(optMaxTemp),
            max_wear_mm: parseFloat(optMaxWear)
        };
        if (isDrilling) {
            optParams.max_force_N = parseFloat(optMaxForce);
        }

        return {
            simulation_name: name || `${machiningType.charAt(0).toUpperCase() + machiningType.slice(1)} Process Simulation`,
            machining_type: machiningType,

            simulation_parameters: {
                num_steps: parseInt(numSteps),
                time_step_duration_s: parseFloat(timeStepDuration),
                output_interval_steps: parseInt(outputInterval),
                min_time_step_s: parseFloat(minTimeStep),
                max_time_step_s: parseFloat(maxTimeStep)
            },

            machining_parameters: machParams,

            file_paths: {
                tool_geometry: tool.geometryPath || `tools_geo/${tool.name.replace(/\s+/g, '_').toLowerCase()}.stp`,
                workpiece_geometry: getWorkpieceGeometryPath(),
                gcode_file: gcodeFile ? gcodeFile.name : d.gcFallback,
                output_directory: `output/${machiningType}`,
                output_results: "results.json"
            },

            material_properties: {
                name: workpiece.name,
                density_kg_m3: workpiece.density_kg_m3 || 0,
                youngs_modulus_Pa: workpiece.youngs_modulus_Pa || 0,
                specific_heat_J_kgK: workpiece.specific_heat_J_kgK || 0,
                thermal_conductivity_W_mK: workpiece.thermal_conductivity_W_mK || 0,
                melting_point_C: workpiece.melting_point_C || 0,
                yield_strength_MPa: workpiece.yield_strength_MPa || 0,
                failure_strain: workpiece.failure_strain || 0,
                johnson_cook_plasticity: {
                    A_yield_strength_MPa: workpiece.johnson_cook?.A || 0,
                    B_strain_hardening_MPa: workpiece.johnson_cook?.B || 0,
                    n_strain_hardening_exp: workpiece.johnson_cook?.n || 0,
                    C_strain_rate_sensitivity: workpiece.johnson_cook?.C || 0,
                    m_thermal_softening_exp: workpiece.johnson_cook?.m || 0
                }
            },

            tool_material: {
                name: substrate.name,
                density_kg_m3: substrate.properties?.density || 14900,
                youngs_modulus_GPa: substrate.properties?.youngsModulus
                    ? substrate.properties.youngsModulus / 1e9
                    : 620,
                poissons_ratio: substrate.properties?.poissonsRatio || 0.22,
                specific_heat_J_kgK: substrate.properties?.specificHeat || 200,
                thermal_conductivity_W_mK: substrate.properties?.thermalConductivity || 90,
                melting_point_C: substrate.properties?.meltingPoint || 2870,
                yield_strength_GPa: substrate.properties?.yieldStrength || 5.0,
                coating: coating?.name || "None",
                coating_thickness_um: 3.0,
                usui_wear: {
                    A: substrate.wear?.usui?.A || 1e-9,
                    B: substrate.wear?.usui?.B || 1000.0
                }
            },

            sph_parameters: {
                smoothing_radius_m: parseFloat(smoothingRadius),
                gas_stiffness: parseFloat(gasStiffness),
                max_particles: parseInt(maxParticles),
                jc_D1: parseFloat(jcD1),
                jc_D2: parseFloat(jcD2),
                jc_D3: parseFloat(jcD3),
                jc_D4: parseFloat(jcD4),
                jc_D5: parseFloat(jcD5)
            },

            fem_parameters: {
                max_nodes: parseInt(maxNodes),
                damping_ratio: parseFloat(dampingRatio),
                mass_scaling_factor: parseFloat(massScaling),
                stiffness_scaling_factor: parseFloat(stiffnessScaling)
            },

            cfd_parameters: cfdParams,

            optimization: optParams
        };
    };

    // ═══════════════════════════════════════════════════════════
    // VIEW JSON
    // ═══════════════════════════════════════════════════════════

    const handleViewJson = () => {
        setError('');
        if (!selectedWorkpieceId || !selectedSubstrateId || !selectedToolId) {
            setError('Please select a tool, workpiece material, and tool substrate first.');
            return;
        }
        const payload = buildPayload();
        if (!payload) {
            setError('Invalid selection — cannot build payload.');
            return;
        }
        setPreviewJson(JSON.stringify(payload, null, 2));
        setCopied(false);
        setShowJsonPreview(true);
    };

    const handleCopyJson = async () => {
        try {
            await navigator.clipboard.writeText(previewJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard not available */ }
    };

    // ═══════════════════════════════════════════════════════════
    // SUBMIT — Launch simulation
    // ═══════════════════════════════════════════════════════════

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!selectedWorkpieceId || !selectedSubstrateId || !selectedToolId) {
                throw new Error("Please select a tool, workpiece material, and tool substrate.");
            }
            if (controlMode === 'gcode' && !gcodeFile) {
                throw new Error("Please upload a G-Code file for G-Code mode.");
            }

            const payload = buildPayload();
            if (!payload) throw new Error("Invalid selection.");

            const simId = `sim_${Date.now()}`;
            
            // 1. Initialize Context
            startSimulation(simId, machiningType);

            // 2. Start Sidecar (Async call, don't wait for completion here)
            SimulationService.startLiveSimulation(payload, {
                onMetrics: (data) => updateLiveMetrics(data),
                onParticles: (data) => updateParticles(data),
                onComplete: () => {
                    completeSimulation();
                    console.log("Simulation complete!");
                },
                onError: (err) => {
                    failSimulation(err);
                    setError(err);
                },
                onLog: (msg) => console.log(`[ENGINE] ${msg}`)
            }).catch(err => {
                failSimulation(err.message);
                setError(err.message);
            });

            // 3. Navigate to results page (Live View)
            navigate(`/simulation/results/${simId}`);

        } catch (err) {
            console.error(err);
            setError(err.message || "Simulation failed to start.");
        } finally {
            setIsLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    // Build dropdown options
    const toolOptions = allTools.map(t => ({
        id: t.id, name: `${t.name} (${t.type || 'Tool'})`
    }));

    const workpieceOptions = workpieceMaterials.map(m => ({
        id: m.id, name: `${m.name} — ${m.category || ''}`
    }));

    const substrateOptions = toolSubstrates.map(m => ({
        id: m.id, name: `${m.name} — ${m.category || ''}`
    }));

    const coatingOptions = [
        { id: '__none__', name: 'None (Uncoated)' },
        ...coatings.map(c => ({ id: c.id, name: `${c.name} — ${c.category || ''}` }))
    ];

    // Selected summaries
    const selectedWp = getSelectedWorkpiece();
    const selectedToolObj = getSelectedTool();
    const selectedSub = getSelectedSubstrate();

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fade-in">

            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ══════════════════════════════════ LEFT COLUMN ══════════════════════════════════ */}
                    <div className="space-y-6">

                        {/* 1. PROCESS & RESOURCES */}
                        <Section title="Process & Resources" icon={<Wrench className="w-5 h-5" />}>
                            <div className="space-y-5">
                                <InputGroup label="Machining Operation">
                                    <ModeToggle
                                        active={machiningType}
                                        setter={setMachiningType}
                                        options={[
                                            { value: 'turning', label: 'Turning', icon: <RefreshCw className="w-4 h-4" /> },
                                            { value: 'milling', label: 'Milling', icon: <SettingsIcon className="w-4 h-4" /> },
                                            { value: 'drilling', label: 'Drilling', icon: <ChevronDown className="w-4 h-4" /> }
                                        ]}
                                    />
                                </InputGroup>

                                <InputGroup label="Control Method" description={controlMode === 'gcode' ? "Simulation follows G-Code toolpath exactly." : "Simulation runs with constant manual parameters."}>
                                    <ModeToggle
                                        active={controlMode}
                                        setter={setControlMode}
                                        options={[
                                            { value: 'gcode', label: 'G-Code File', icon: <FileCode className="w-4 h-4" /> },
                                            { value: 'manual', label: 'Manual Input', icon: <MousePointer className="w-4 h-4" /> }
                                        ]}
                                    />
                                </InputGroup>

                                <InputGroup label="Tool" description="Select a tool from your Tool Library">
                                    <Select
                                        value={selectedToolId}
                                        setter={setSelectedToolId}
                                        options={toolOptions}
                                        placeholder="Select Tool from Library..."
                                    />
                                    {selectedToolObj && (
                                        <div className="mt-2 text-xs text-studio-text-dim bg-studio-surface/50 rounded-lg p-2.5 border border-studio-border/40">
                                            <span className="text-studio-text-muted font-medium">Substrate:</span> {selectedToolObj.substrate || 'N/A'} &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Coating:</span> {selectedToolObj.coating || 'None'} &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Geometry:</span> {selectedToolObj.geometryPath ? '✓ Loaded' : 'None'}
                                        </div>
                                    )}
                                </InputGroup>

                                <InputGroup label="Workpiece Material">
                                    <Select
                                        value={selectedWorkpieceId}
                                        setter={setSelectedWorkpieceId}
                                        options={workpieceOptions}
                                        placeholder="Select from Material Library..."
                                    />
                                    {selectedWp && (
                                        <div className="mt-2 text-xs text-studio-text-dim bg-studio-surface/50 rounded-lg p-2.5 border border-studio-border/40">
                                            <span className="text-studio-text-muted font-medium">Density:</span> {selectedWp.properties?.density} kg/m³ &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Yield:</span> {selectedWp.plasticity?.yieldStrength} MPa &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Melt:</span> {selectedWp.properties?.meltingPoint}°C
                                        </div>
                                    )}
                                </InputGroup>

                                <InputGroup label="Tool Substrate Material">
                                    <Select
                                        value={selectedSubstrateId}
                                        setter={setSelectedSubstrateId}
                                        options={substrateOptions}
                                        placeholder="Select Tool Material..."
                                    />
                                    {selectedSub && (
                                        <div className="mt-2 text-xs text-studio-text-dim bg-studio-surface/50 rounded-lg p-2.5 border border-studio-border/40">
                                            <span className="text-studio-text-muted font-medium">Density:</span> {selectedSub.properties?.density} kg/m³ &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Hardness:</span> {selectedSub.properties?.hardness || 'N/A'} &nbsp;•&nbsp;
                                            <span className="text-studio-text-muted font-medium">Melt:</span> {selectedSub.properties?.meltingPoint}°C
                                        </div>
                                    )}
                                </InputGroup>

                                <InputGroup label="Tool Coating">
                                    <Select
                                        value={selectedCoatingId}
                                        setter={setSelectedCoatingId}
                                        options={coatingOptions}
                                        placeholder="Select Coating..."
                                    />
                                </InputGroup>
                            </div>
                        </Section>

                        {/* 2. MOTION CONTROL */}
                        <Section title="Motion Control" icon={<Gauge className="w-5 h-5" />}>
                            <div className="space-y-5">
                                {controlMode === 'gcode' && (
                                    <InputGroup label="Upload Program">
                                        <FileUploader
                                            file={gcodeFile}
                                            setFile={setGcodeFile}
                                            accept=".gcode,.nc,.txt,.tap"
                                            label="Upload G-Code File"
                                            description="Supports .nc, .gcode, .txt"
                                        />
                                    </InputGroup>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Spindle Speed">
                                        <Input type="number" value={rpm} setter={setRpm} suffix="RPM" />
                                    </InputGroup>
                                    <InputGroup label="Feed Rate">
                                        <Input type="number" value={feedRate} setter={setFeedRate} suffix="mm/min" />
                                    </InputGroup>
                                </div>

                                <div className={`grid ${isMilling ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                    <InputGroup label="Depth of Cut">
                                        <Input type="number" value={depthOfCut} setter={setDepthOfCut} suffix="mm" step="0.1" />
                                    </InputGroup>
                                    {isMilling && (
                                        <InputGroup label="Width of Cut" description="Radial engagement (milling only)">
                                            <Input type="number" value={widthOfCut} setter={setWidthOfCut} suffix="mm" step="0.1" />
                                        </InputGroup>
                                    )}
                                </div>
                            </div>
                        </Section>

                        {/* 3. ENGINEERING CONTEXT */}
                        <Section title="Engineering Context" icon={<FileText className="w-5 h-5" />}>
                            <div className="space-y-4">
                                <InputGroup label="Decision Reasoning" description="Why are you running this simulation? (Saved to history)">
                                    <TextArea
                                        value={reasoning}
                                        setter={setReasoning}
                                        placeholder="e.g. Testing thermal limits with new carbide coating..."
                                    />
                                </InputGroup>

                                <InputGroup label="Simulation Tags">
                                    <div className="relative">
                                        <Input value={tags} setter={setTags} placeholder="drilling, wear-test" />
                                        <Tag className="absolute right-3 top-2.5 w-4 h-4 text-studio-text-dim pointer-events-none" />
                                    </div>
                                </InputGroup>
                            </div>
                        </Section>
                    </div>

                    {/* ══════════════════════════════════ RIGHT COLUMN ══════════════════════════════════ */}
                    <div className="space-y-6">

                        {/* 4. WORKPIECE GEOMETRY + TOOL POSITION */}
                        <Section title={`Workpiece ${isTurning ? '(Cylinder)' : '(Block)'} & Tool Position`} icon={<Box className="w-5 h-5" />}>

                            {/* Turning → Cylinder inputs */}
                            {isTurning ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Diameter">
                                        <Input type="number" value={wpDiameter} setter={setWpDiameter} suffix="mm" />
                                    </InputGroup>
                                    <InputGroup label="Length">
                                        <Input type="number" value={wpLength} setter={setWpLength} suffix="mm" />
                                    </InputGroup>
                                </div>
                            ) : (
                                /* Drilling / Milling → Block inputs */
                                <div className="grid grid-cols-3 gap-4">
                                    <InputGroup label="Length (X)">
                                        <Input type="number" value={wpSize.x} setter={v => setWpSize({ ...wpSize, x: v })} suffix="mm" />
                                    </InputGroup>
                                    <InputGroup label="Width (Y)">
                                        <Input type="number" value={wpSize.y} setter={v => setWpSize({ ...wpSize, y: v })} suffix="mm" />
                                    </InputGroup>
                                    <InputGroup label="Height (Z)">
                                        <Input type="number" value={wpSize.z} setter={v => setWpSize({ ...wpSize, z: v })} suffix="mm" />
                                    </InputGroup>
                                </div>
                            )}

                            {/* Tool Start Position — ALL TYPES */}
                            <div className="mt-5">
                                <label className="block text-xs font-medium text-studio-text-muted mb-3 uppercase tracking-wider">Initial Tool Position (mm)</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <InputGroup label="X">
                                        <Input type="number" value={toolPosX} setter={setToolPosX} suffix="mm" step="0.1" />
                                    </InputGroup>
                                    <InputGroup label="Y">
                                        <Input type="number" value={toolPosY} setter={setToolPosY} suffix="mm" step="0.1" />
                                    </InputGroup>
                                    <InputGroup label="Z">
                                        <Input type="number" value={toolPosZ} setter={setToolPosZ} suffix="mm" step="0.1" />
                                    </InputGroup>
                                </div>
                                <p className="text-xs text-studio-text-dim mt-2">
                                    Tool Direction: <span className="font-mono text-studio-primary">{TOOL_DIRECTION_LABELS[machiningType]}</span>
                                </p>
                            </div>
                        </Section>

                        {/* 5. SIMULATION PARAMETERS */}
                        <Section title="Simulation Parameters" icon={<Cpu className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Number of Steps">
                                    <Input type="number" value={numSteps} setter={setNumSteps} />
                                </InputGroup>
                                <InputGroup label="Time Step Duration">
                                    <Input value={timeStepDuration} setter={setTimeStepDuration} suffix="s" />
                                </InputGroup>
                                <InputGroup label="Output Interval">
                                    <Input type="number" value={outputInterval} setter={setOutputInterval} suffix="steps" />
                                </InputGroup>
                                <InputGroup label="Min Time Step">
                                    <Input value={minTimeStep} setter={setMinTimeStep} suffix="s" />
                                </InputGroup>
                                <InputGroup label="Max Time Step" className="col-span-2">
                                    <Input value={maxTimeStep} setter={setMaxTimeStep} suffix="s" />
                                </InputGroup>
                            </div>
                        </Section>

                        {/* 6. SPH PARAMETERS (Collapsible) */}
                        <Section title="SPH Parameters" icon={<Activity className="w-5 h-5" />} collapsible defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Smoothing Radius">
                                    <Input value={smoothingRadius} setter={setSmoothingRadius} suffix="m" />
                                </InputGroup>
                                <InputGroup label="Gas Stiffness">
                                    <Input type="number" value={gasStiffness} setter={setGasStiffness} />
                                </InputGroup>
                                <InputGroup label="Max Particles">
                                    <Input type="number" value={maxParticles} setter={setMaxParticles} />
                                </InputGroup>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-medium text-studio-text-muted mb-3 uppercase tracking-wider">Johnson-Cook Damage (D1–D5)</label>
                                <div className="grid grid-cols-5 gap-3">
                                    <InputGroup label="D1"><Input type="number" value={jcD1} setter={setJcD1} step="0.01" /></InputGroup>
                                    <InputGroup label="D2"><Input type="number" value={jcD2} setter={setJcD2} step="0.01" /></InputGroup>
                                    <InputGroup label="D3"><Input type="number" value={jcD3} setter={setJcD3} step="0.01" /></InputGroup>
                                    <InputGroup label="D4"><Input type="number" value={jcD4} setter={setJcD4} step="0.001" /></InputGroup>
                                    <InputGroup label="D5"><Input type="number" value={jcD5} setter={setJcD5} step="0.01" /></InputGroup>
                                </div>
                            </div>
                        </Section>

                        {/* 7. FEM PARAMETERS (Collapsible) */}
                        <Section title="FEM Parameters" icon={<Layers className="w-5 h-5" />} collapsible defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Max Nodes">
                                    <Input type="number" value={maxNodes} setter={setMaxNodes} />
                                </InputGroup>
                                <InputGroup label="Damping Ratio">
                                    <Input type="number" value={dampingRatio} setter={setDampingRatio} step="0.01" />
                                </InputGroup>
                                <InputGroup label="Mass Scaling Factor">
                                    <Input type="number" value={massScaling} setter={setMassScaling} />
                                </InputGroup>
                                <InputGroup label="Stiffness Scaling">
                                    <Input type="number" value={stiffnessScaling} setter={setStiffnessScaling} step="0.1" />
                                </InputGroup>
                            </div>
                        </Section>

                        {/* 8. CFD COOLANT (Collapsible) */}
                        <Section title="CFD Coolant Simulation" icon={<Droplets className="w-5 h-5" />} collapsible defaultOpen={false}>
                            <ToggleSwitch enabled={cfdEnabled} setter={setCfdEnabled} label="Enable CFD Simulation" />

                            {cfdEnabled && (
                                <div className="mt-4 space-y-4">
                                    {/* Grid params — DRILLING ONLY */}
                                    {isDrilling && (
                                        <>
                                            <div className="grid grid-cols-3 gap-4">
                                                <InputGroup label="Grid X">
                                                    <Input type="number" value={cfdGridX} setter={setCfdGridX} />
                                                </InputGroup>
                                                <InputGroup label="Grid Y">
                                                    <Input type="number" value={cfdGridY} setter={setCfdGridY} />
                                                </InputGroup>
                                                <InputGroup label="Grid Z">
                                                    <Input type="number" value={cfdGridZ} setter={setCfdGridZ} />
                                                </InputGroup>
                                            </div>
                                            <InputGroup label="Cell Size">
                                                <Input value={cfdCellSize} setter={setCfdCellSize} suffix="m" />
                                            </InputGroup>
                                        </>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Coolant Type">
                                            <Select
                                                value={coolantType}
                                                setter={setCoolantType}
                                                options={[
                                                    { value: 'Emulsion', label: 'Emulsion' },
                                                    { value: 'Flood', label: 'Flood Coolant' },
                                                    { value: 'Oil', label: 'Oil' },
                                                    { value: 'Mist', label: 'Mist' },
                                                    { value: 'MQL', label: 'MQL (Min. Quantity)' },
                                                    { value: 'Dry', label: 'Dry Machining' },
                                                    { value: 'Cryogenic', label: 'Cryogenic (LN₂)' }
                                                ]}
                                                placeholder="Select coolant..."
                                            />
                                        </InputGroup>
                                        <InputGroup label="Inlet Velocity">
                                            <Input type="number" value={inletVelocity} setter={setInletVelocity} suffix="m/s" step="0.1" />
                                        </InputGroup>
                                        <InputGroup label="Inlet Temperature">
                                            <Input type="number" value={inletTemperature} setter={setInletTemperature} suffix="°C" />
                                        </InputGroup>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* 9. OPTIMIZATION (Collapsible) */}
                        <Section title="Optimization Constraints" icon={<Target className="w-5 h-5" />} collapsible defaultOpen={false}>
                            <ToggleSwitch enabled={optEnabled} setter={setOptEnabled} label="Enable Optimization" />

                            {optEnabled && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <InputGroup label="Max Stress">
                                        <Input type="number" value={optMaxStress} setter={setOptMaxStress} suffix="GPa" step="0.1" />
                                    </InputGroup>
                                    <InputGroup label="Max Temperature">
                                        <Input type="number" value={optMaxTemp} setter={setOptMaxTemp} suffix="°C" />
                                    </InputGroup>
                                    <InputGroup label="Max Tool Wear">
                                        <Input type="number" value={optMaxWear} setter={setOptMaxWear} suffix="mm" step="0.01" />
                                    </InputGroup>
                                    {/* Max Force — DRILLING ONLY */}
                                    {isDrilling && (
                                        <InputGroup label="Max Cutting Force">
                                            <Input type="number" value={optMaxForce} setter={setOptMaxForce} suffix="N" />
                                        </InputGroup>
                                    )}
                                </div>
                            )}
                        </Section>
                    </div>
                </div>

                {/* ══════════════════════════════════ FOOTER / SUBMIT ══════════════════════════════════ */}
                <div className="fixed bottom-0 left-0 right-0 bg-studio-panel/95 backdrop-blur-md border-t border-studio-border/60 p-4 z-50 shadow-card">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="hidden md:block">
                            <span className="text-studio-text-dim text-xs uppercase font-medium tracking-wider">Simulation Name</span>
                            <p className="text-studio-text-main font-semibold truncate max-w-md text-sm">{name || 'Untitled Simulation'}</p>
                        </div>
                        <div className="flex space-x-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-lg font-medium text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface/60 transition-colors text-sm border border-studio-border/60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleViewJson}
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-lg font-medium text-studio-primary hover:text-white hover:bg-studio-primary/20 transition-colors text-sm border border-studio-primary/50 flex items-center justify-center"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                <span>View JSON</span>
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !selectedToolId || !selectedWorkpieceId || !selectedSubstrateId || (controlMode === 'gcode' && !gcodeFile)}
                                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-studio-primary to-studio-accent hover:brightness-110 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                        <span>Initializing Engine...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-2 fill-current" />
                                        <span>Launch Simulation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-studio-danger text-white px-5 py-2.5 rounded-lg shadow-card font-medium text-sm flex items-center animate-fade-in z-50">
                        <Activity className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}

                {/* ══════════════════════════════════ JSON PREVIEW MODAL ══════════════════════════════════ */}
                {showJsonPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowJsonPreview(false)}>
                        <div
                            className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-studio-panel rounded-2xl border border-studio-border/60 shadow-2xl flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border/60 bg-studio-surface/30">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-studio-primary/15">
                                        <FileCode className="w-5 h-5 text-studio-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-studio-text-main font-semibold text-base">Engine Payload Preview</h2>
                                        <p className="text-studio-text-dim text-xs mt-0.5">input.json — {machiningType} • {previewJson.split('\n').length} lines</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleCopyJson}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all border ${copied
                                            ? 'bg-studio-success/15 text-studio-success border-studio-success/40'
                                            : 'bg-studio-surface text-studio-text-muted border-studio-border/60 hover:text-studio-text-main hover:border-studio-primary/50'
                                            }`}
                                    >
                                        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowJsonPreview(false)}
                                        className="p-1.5 rounded-lg text-studio-text-dim hover:text-studio-text-main hover:bg-studio-surface/60 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* JSON Body */}
                            <div className="flex-1 overflow-auto p-6">
                                <pre className="text-xs font-mono leading-relaxed text-studio-text-muted whitespace-pre select-all">
                                    <code>{previewJson}</code>
                                </pre>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t border-studio-border/40 bg-studio-surface/20 flex items-center justify-between">
                                <p className="text-xs text-studio-text-dim">
                                    This is the exact JSON that will be passed to the EdgePredict Engine.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowJsonPreview(false)}
                                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-studio-text-muted hover:text-studio-text-main bg-studio-surface border border-studio-border/60 hover:border-studio-primary/50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SimulationSetupForm;