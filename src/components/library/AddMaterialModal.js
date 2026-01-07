import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';

// --- PRESET DATA (Textbook Values) ---
const MATERIAL_PRESETS = {
    'custom': { label: 'Custom / Empty', data: null },
    'ti-6al-4v': {
        label: 'Titanium (Ti-6Al-4V)',
        data: {
            yield: '880', uts: '950', melt: '1660', density: '4430', heat: '526', cond: '6.7',
            jcB: '685', jcn: '0.47', jcm: '1.0', jcC: '0.014',
            cutEnergy: '3000', wear: '1.0', heatGen: '1.8'
        }
    },
    'al-6061-t6': {
        label: 'Aluminum (6061-T6)',
        data: {
            yield: '276', uts: '310', melt: '660', density: '2700', heat: '896', cond: '167',
            jcB: '114', jcn: '0.42', jcm: '1.34', jcC: '0.01',
            cutEnergy: '800', wear: '2.5', heatGen: '1.2' // Al is softer, wears differently
        }
    },
    'steel-4340': {
        label: 'Steel (AISI 4340)',
        data: {
            yield: '792', uts: '1100', melt: '1510', density: '7850', heat: '475', cond: '44.5',
            jcB: '510', jcn: '0.26', jcm: '1.03', jcC: '0.014',
            cutEnergy: '2400', wear: '1.5', heatGen: '1.6'
        }
    },
    'inconel-718': {
        label: 'Inconel 718 (Nickel Superalloy)',
        data: {
            yield: '980', uts: '1240', melt: '1300', density: '8190', heat: '435', cond: '11.4',
            jcB: '1370', jcn: '0.16', jcm: '1.0', jcC: '0.013',
            cutEnergy: '3500', wear: '0.8', heatGen: '2.2' // Very hard to cut
        }
    }
};

const AddMaterialModal = ({ isOpen, onClose, onMaterialAdded }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Toggle for "Scary Math" sections
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- 1. STANDARD PROPERTIES ---
    const [yieldStrength, setYieldStrength] = useState('');
    const [uts, setUts] = useState('');
    const [meltingPoint, setMeltingPoint] = useState('');
    const [density, setDensity] = useState('');
    const [specificHeat, setSpecificHeat] = useState('');
    const [thermalConductivity, setThermalConductivity] = useState('');

    // --- 2. MECHANICAL (JOHNSON-COOK) ---
    const [jcB, setJcB] = useState('0');
    const [jcn, setJcn] = useState('0');
    const [jcm, setJcm] = useState('0');
    const [jcC, setJcC] = useState('0.014');

    // --- 3. ADVANCED CALIBRATION ---
    const [specificCuttingEnergy, setSpecificCuttingEnergy] = useState('2000');
    const [wearFactor, setWearFactor] = useState('1.0'); 
    const [heatGenFactor, setHeatGenFactor] = useState('1.8'); 

    const handlePresetChange = (e) => {
        const key = e.target.value;
        const preset = MATERIAL_PRESETS[key];
        
        if (preset && preset.data) {
            const d = preset.data;
            setName(preset.label.split(' (')[0]); // Auto-fill simplistic name
            setYieldStrength(d.yield); setUts(d.uts); setMeltingPoint(d.melt);
            setDensity(d.density); setSpecificHeat(d.heat); setThermalConductivity(d.cond);
            setJcB(d.jcB); setJcn(d.jcn); setJcm(d.jcm); setJcC(d.jcC);
            setSpecificCuttingEnergy(d.cutEnergy); setWearFactor(d.wear); setHeatGenFactor(d.heatGen);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!name.trim()) { setError('Material name is required.'); return; }
        if (!yieldStrength || !meltingPoint) { setError('Basic physical properties are required.'); return; }

        setIsLoading(true);
        try {
            const properties = {
                // Standard & Thermal
                density_kg_m3: parseFloat(density),
                specific_heat_J_kgC: parseFloat(specificHeat),
                thermal_conductivity_W_mK: parseFloat(thermalConductivity),
                melting_point_C: parseFloat(meltingPoint),

                // Johnson-Cook (Use 0/defaults if user didn't open advanced)
                A_yield_strength_MPa: parseFloat(yieldStrength),
                B_strain_hardening_MPa: parseFloat(jcB) || 0,
                n_strain_hardening_exp: parseFloat(jcn) || 0,
                m_thermal_softening_exp: parseFloat(jcm) || 1.0,
                C_strain_rate_sensitivity: parseFloat(jcC) || 0.014,
                
                // Calibration
                specific_cutting_energy_MPa: parseFloat(specificCuttingEnergy) || 2000,
                wear_calibration_factor: parseFloat(wearFactor) || 1.0,
                heat_generation_factor: parseFloat(heatGenFactor) || 1.8,
                
                usui_wear_model: { A_constant: 0.0000001, B_inv_temp_K: 10000.0 },
                failure_criterion: { ultimate_tensile_strength_MPa: parseFloat(uts) || (parseFloat(yieldStrength) * 1.2) }
            };

            await api.createMaterial({ name, properties });
            onMaterialAdded();
            onClose();
            setName(''); 
        } catch (err) {
            setError('Failed to add material.');
        } finally {
            setIsLoading(false);
        }
    };

    const Input = ({ label, val, set, desc, step="any" }) => (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            <input 
                type="number" 
                step={step}
                value={val} 
                onChange={e => set(e.target.value)} 
                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
            {desc && <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Material">
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* PRESET LOADER */}
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg">
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                        Start from Template
                    </label>
                    <select 
                        onChange={handlePresetChange}
                        className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                        defaultValue="custom"
                    >
                        {Object.entries(MATERIAL_PRESETS).map(([key, preset]) => (
                            <option key={key} value={key}>{preset.label}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-indigo-300/70 mt-2">
                        Select a material to auto-fill physics parameters.
                    </p>
                </div>

                {/* NAME */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Material Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Custom Steel Alloy" className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>

                {/* STANDARD SECTION */}
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Basic Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Yield Strength (MPa)" val={yieldStrength} set={setYieldStrength} />
                        <Input label="Ultimate Strength (MPa)" val={uts} set={setUts} />
                        <Input label="Melting Point (°C)" val={meltingPoint} set={setMeltingPoint} />
                        <Input label="Density (kg/m³)" val={density} set={setDensity} />
                    </div>
                </div>

                {/* TOGGLE ADVANCED */}
                <div className="border-t border-gray-800 pt-2">
                    <button 
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Physics (Johnson-Cook & Calibration)</span>
                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* ADVANCED SECTIONS (HIDDEN BY DEFAULT) */}
                {showAdvanced && (
                    <div className="space-y-4 animate-fade-in">
                        {/* THERMAL EXTENDED */}
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Extended Thermal</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Specific Heat (J/kg·C)" val={specificHeat} set={setSpecificHeat} />
                                <Input label="Thermal Cond. (W/m·K)" val={thermalConductivity} set={setThermalConductivity} />
                            </div>
                        </div>

                        {/* MECHANICAL */}
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Plasticity (Johnson-Cook)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Hardening Modulus (B) [MPa]" val={jcB} set={setJcB} desc="Strength increase from strain" />
                                <Input label="Hardening Exp. (n)" val={jcn} set={setJcn} step="0.01" desc="Rate of hardening" />
                                <Input label="Thermal Softening (m)" val={jcm} set={setJcm} step="0.01" desc="Strength loss from heat" />
                                <Input label="Strain Rate Sens. (C)" val={jcC} set={setJcC} step="0.001" desc="Viscosity effect" />
                            </div>
                        </div>

                        {/* CALIBRATION */}
                        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Engine Calibration</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Cutting Energy (MPa)" val={specificCuttingEnergy} set={setSpecificCuttingEnergy} desc="Force fallback" />
                                <Input label="Wear Factor" val={wearFactor} set={setWearFactor} desc="1.0 = Standard" />
                                <div className="col-span-2">
                                    <Input label="Heat Gen Factor" val={heatGenFactor} set={setHeatGenFactor} desc="1.8 = Machining Standard" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</p>}

                <div className="flex justify-end space-x-3 pt-2">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Add Material
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddMaterialModal;