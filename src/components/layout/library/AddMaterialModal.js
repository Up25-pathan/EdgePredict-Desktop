import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import MaterialService from '../../../services/MaterialService';

// --- PRESET DATA (engine-exact field values) ---
const MATERIAL_PRESETS = {
    'custom': { label: 'Custom / Empty', data: null },
    'steel-1045': {
        label: 'Steel AISI 1045',
        data: {
            category: 'Carbon Steel',
            density_kg_m3: 7870, youngs_modulus_Pa: 200e9,
            specific_heat_J_kgK: 486, thermal_conductivity_W_mK: 51.9,
            melting_point_C: 1520, yield_strength_MPa: 530, failure_strain: 0.4,
            jcA: 553, jcB: 600, jcn: 0.234, jcC: 0.013, jcm: 1.0
        }
    },
    'ti-6al-4v': {
        label: 'Titanium Ti-6Al-4V',
        data: {
            category: 'Titanium Alloy',
            density_kg_m3: 4430, youngs_modulus_Pa: 113.8e9,
            specific_heat_J_kgK: 526, thermal_conductivity_W_mK: 6.7,
            melting_point_C: 1660, yield_strength_MPa: 880, failure_strain: 0.3,
            jcA: 880, jcB: 290, jcn: 0.47, jcC: 0.015, jcm: 1.0
        }
    },
    'al-6061-t6': {
        label: 'Aluminum 6061-T6',
        data: {
            category: 'Aluminum Alloy',
            density_kg_m3: 2700, youngs_modulus_Pa: 68.9e9,
            specific_heat_J_kgK: 896, thermal_conductivity_W_mK: 167,
            melting_point_C: 650, yield_strength_MPa: 276, failure_strain: 0.25,
            jcA: 324, jcB: 114, jcn: 0.42, jcC: 0.002, jcm: 1.34
        }
    },
    'inconel-718': {
        label: 'Inconel 718',
        data: {
            category: 'Nickel Superalloy',
            density_kg_m3: 8190, youngs_modulus_Pa: 200e9,
            specific_heat_J_kgK: 435, thermal_conductivity_W_mK: 11.4,
            melting_point_C: 1260, yield_strength_MPa: 1030, failure_strain: 0.2,
            jcA: 980, jcB: 1370, jcn: 0.45, jcC: 0.01, jcm: 1.2
        }
    },
    'steel-4340': {
        label: 'Steel AISI 4340',
        data: {
            category: 'Alloy Steel',
            density_kg_m3: 7850, youngs_modulus_Pa: 205e9,
            specific_heat_J_kgK: 475, thermal_conductivity_W_mK: 44.5,
            melting_point_C: 1510, yield_strength_MPa: 792, failure_strain: 0.35,
            jcA: 792, jcB: 510, jcn: 0.26, jcC: 0.014, jcm: 1.03
        }
    }
};

const AddMaterialModal = ({ isOpen, onClose, onMaterialAdded }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ─── Engine-aligned fields ───
    const [density, setDensity] = useState('');
    const [youngsModulus, setYoungsModulus] = useState('');
    const [specificHeat, setSpecificHeat] = useState('');
    const [thermalConductivity, setThermalConductivity] = useState('');
    const [meltingPoint, setMeltingPoint] = useState('');
    const [yieldStrength, setYieldStrength] = useState('');
    const [failureStrain, setFailureStrain] = useState('');

    // ─── Johnson-Cook Plasticity ───
    const [jcA, setJcA] = useState('');
    const [jcB, setJcB] = useState('');
    const [jcn, setJcn] = useState('');
    const [jcC, setJcC] = useState('');
    const [jcm, setJcm] = useState('');

    const handlePresetChange = (e) => {
        const key = e.target.value;
        const preset = MATERIAL_PRESETS[key];
        if (preset && preset.data) {
            const d = preset.data;
            setName(preset.label);
            setCategory(d.category || '');
            setDensity(d.density_kg_m3);
            setYoungsModulus(d.youngs_modulus_Pa);
            setSpecificHeat(d.specific_heat_J_kgK);
            setThermalConductivity(d.thermal_conductivity_W_mK);
            setMeltingPoint(d.melting_point_C);
            setYieldStrength(d.yield_strength_MPa);
            setFailureStrain(d.failure_strain);
            setJcA(d.jcA); setJcB(d.jcB); setJcn(d.jcn); setJcC(d.jcC); setJcm(d.jcm);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!name.trim()) { setError('Material name is required.'); return; }
        if (!density || !yieldStrength || !meltingPoint) { setError('Density, yield strength, and melting point are required.'); return; }

        setIsLoading(true);
        try {
            // Save with engine-exact field names
            const material = {
                name: name.trim(),
                category: category || 'Custom',
                classification: 'workpiece',
                description: `Custom workpiece material: ${name.trim()}`,
                density_kg_m3: parseFloat(density) || 0,
                youngs_modulus_Pa: parseFloat(youngsModulus) || 0,
                specific_heat_J_kgK: parseFloat(specificHeat) || 0,
                thermal_conductivity_W_mK: parseFloat(thermalConductivity) || 0,
                melting_point_C: parseFloat(meltingPoint) || 0,
                yield_strength_MPa: parseFloat(yieldStrength) || 0,
                failure_strain: parseFloat(failureStrain) || 0,
                johnson_cook: {
                    A: parseFloat(jcA) || parseFloat(yieldStrength) || 0,
                    B: parseFloat(jcB) || 0,
                    n: parseFloat(jcn) || 0,
                    C: parseFloat(jcC) || 0,
                    m: parseFloat(jcm) || 1.0
                }
            };

            await MaterialService.add(material);
            onMaterialAdded();
            onClose();
            // Reset form
            setName(''); setCategory(''); setDensity(''); setYoungsModulus('');
            setSpecificHeat(''); setThermalConductivity(''); setMeltingPoint('');
            setYieldStrength(''); setFailureStrain('');
            setJcA(''); setJcB(''); setJcn(''); setJcC(''); setJcm('');
        } catch (err) {
            setError('Failed to add material.');
        } finally {
            setIsLoading(false);
        }
    };

    const Input = ({ label, val, set, desc, step = "any", unit }) => (
        <div>
            <label className="block text-xs font-medium text-studio-text-muted mb-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    step={step}
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2 bg-studio-surface border border-studio-border/60 rounded-lg text-studio-text-main text-sm focus:ring-1 focus:ring-studio-primary focus:border-studio-primary outline-none transition-colors"
                />
                {unit && <span className="absolute right-3 top-2 text-xs text-studio-text-dim font-mono">{unit}</span>}
            </div>
            {desc && <p className="text-[10px] text-studio-text-dim mt-0.5">{desc}</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Workpiece Material">
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">

                {/* PRESET LOADER */}
                <div className="bg-studio-primary/5 border border-studio-primary/20 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-studio-primary uppercase tracking-wider mb-2">
                        Start from Template
                    </label>
                    <select
                        onChange={handlePresetChange}
                        className="w-full bg-studio-surface border border-studio-border/60 text-studio-text-main text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-studio-primary outline-none"
                        defaultValue="custom"
                    >
                        {Object.entries(MATERIAL_PRESETS).map(([key, preset]) => (
                            <option key={key} value={key}>{preset.label}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-studio-text-dim mt-2">
                        Select a material to auto-fill all parameters with textbook values.
                    </p>
                </div>

                {/* NAME & CATEGORY */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-studio-text-muted mb-1">Material Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Steel AISI 1045"
                            className="w-full px-3 py-2 bg-studio-surface border border-studio-border/60 rounded-lg text-studio-text-main text-sm focus:ring-1 focus:ring-studio-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-studio-text-muted mb-1">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder="e.g., Carbon Steel"
                            className="w-full px-3 py-2 bg-studio-surface border border-studio-border/60 rounded-lg text-studio-text-main text-sm focus:ring-1 focus:ring-studio-primary outline-none"
                        />
                    </div>
                </div>

                {/* BASIC PHYSICAL PROPERTIES */}
                <div className="p-4 bg-studio-surface/30 rounded-xl border border-studio-border/40">
                    <h4 className="text-xs font-bold text-studio-text-main uppercase tracking-wider mb-3">Physical Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Density *" val={density} set={setDensity} unit="kg/m³" />
                        <Input label="Young's Modulus" val={youngsModulus} set={setYoungsModulus} unit="Pa" desc="e.g. 200e9" />
                        <Input label="Specific Heat" val={specificHeat} set={setSpecificHeat} unit="J/kg·K" />
                        <Input label="Thermal Conductivity" val={thermalConductivity} set={setThermalConductivity} unit="W/m·K" />
                        <Input label="Melting Point *" val={meltingPoint} set={setMeltingPoint} unit="°C" />
                        <Input label="Yield Strength *" val={yieldStrength} set={setYieldStrength} unit="MPa" />
                        <Input label="Failure Strain" val={failureStrain} set={setFailureStrain} step="0.01" desc="0.0 – 1.0" />
                    </div>
                </div>

                {/* TOGGLE ADVANCED */}
                <div className="border-t border-studio-border/40 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-left text-xs font-medium text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface/60 rounded-lg transition-colors"
                    >
                        <span>{showAdvanced ? 'Hide' : 'Show'} Johnson-Cook Plasticity Parameters</span>
                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* JOHNSON-COOK */}
                {showAdvanced && (
                    <div className="p-4 bg-studio-surface/30 rounded-xl border border-studio-border/40 animate-fade-in">
                        <h4 className="text-xs font-bold text-studio-primary uppercase tracking-wider mb-1">Johnson-Cook Plasticity</h4>
                        <p className="text-[10px] text-studio-text-dim mb-3">These define how the material deforms under cutting conditions.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="A — Yield Strength" val={jcA} set={setJcA} unit="MPa" desc="Initial yield (auto-fills from above if blank)" />
                            <Input label="B — Strain Hardening" val={jcB} set={setJcB} unit="MPa" desc="Hardening modulus" />
                            <Input label="n — Hardening Exponent" val={jcn} set={setJcn} step="0.01" desc="Rate of strain hardening" />
                            <Input label="C — Strain Rate Sensitivity" val={jcC} set={setJcC} step="0.001" desc="Dynamic viscosity effect" />
                            <Input label="m — Thermal Softening" val={jcm} set={setJcm} step="0.01" desc="Strength loss from heat" />
                        </div>
                    </div>
                )}

                {error && <p className="text-studio-danger text-sm bg-studio-danger/10 p-2.5 rounded-lg">{error}</p>}

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