import { readTextFile, writeTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';

const FILE_NAME = 'materials.json';

// --- SEED DATA ---
// Workpiece materials use engine-exact field names for zero-mapping payload generation.
// Tool materials and coatings keep their existing structure.
const SEED_DATA = [
    // ═══════════════════════════════════════════════════════
    // TYPE A: WORKPIECE MATERIALS (engine-aligned fields)
    // ═══════════════════════════════════════════════════════
    {
        id: 'mat_wp_001',
        name: 'Ti-6Al-4V (Grade 5)',
        category: 'Titanium Alloy',
        type: 'standard',
        classification: 'workpiece',
        description: 'Workhorse titanium alloy. High strength-to-weight ratio. Difficult to machine.',
        density_kg_m3: 4430,
        youngs_modulus_Pa: 113.8e9,
        specific_heat_J_kgK: 526,
        thermal_conductivity_W_mK: 6.7,
        melting_point_C: 1660,
        yield_strength_MPa: 880,
        failure_strain: 0.3,
        johnson_cook: {
            A: 880,
            B: 290,
            n: 0.47,
            C: 0.015,
            m: 1.0
        }
    },
    {
        id: 'mat_wp_002',
        name: 'Inconel 718',
        category: 'Nickel Superalloy',
        type: 'standard',
        classification: 'workpiece',
        description: 'Precipitation-hardenable nickel-chromium alloy. Extreme heat resistance.',
        density_kg_m3: 8190,
        youngs_modulus_Pa: 200e9,
        specific_heat_J_kgK: 435,
        thermal_conductivity_W_mK: 11.4,
        melting_point_C: 1260,
        yield_strength_MPa: 1030,
        failure_strain: 0.2,
        johnson_cook: {
            A: 980,
            B: 1370,
            n: 0.45,
            C: 0.01,
            m: 1.2
        }
    },
    {
        id: 'mat_wp_003',
        name: 'Steel AISI 1045',
        category: 'Carbon Steel',
        type: 'standard',
        classification: 'workpiece',
        description: 'Medium carbon steel. Good balance of strength and machinability.',
        density_kg_m3: 7870,
        youngs_modulus_Pa: 200e9,
        specific_heat_J_kgK: 486,
        thermal_conductivity_W_mK: 51.9,
        melting_point_C: 1520,
        yield_strength_MPa: 530,
        failure_strain: 0.4,
        johnson_cook: {
            A: 553,
            B: 600,
            n: 0.234,
            C: 0.013,
            m: 1.0
        }
    },
    {
        id: 'mat_wp_004',
        name: 'Aluminum 6061-T6',
        category: 'Aluminum Alloy',
        type: 'standard',
        classification: 'workpiece',
        description: 'General-purpose aluminum alloy. Easy to machine, lightweight.',
        density_kg_m3: 2700,
        youngs_modulus_Pa: 68.9e9,
        specific_heat_J_kgK: 896,
        thermal_conductivity_W_mK: 167,
        melting_point_C: 650,
        yield_strength_MPa: 276,
        failure_strain: 0.25,
        johnson_cook: {
            A: 324,
            B: 114,
            n: 0.42,
            C: 0.002,
            m: 1.34
        }
    },
    {
        id: 'mat_wp_005',
        name: 'Steel AISI 4340',
        category: 'Alloy Steel',
        type: 'standard',
        classification: 'workpiece',
        description: 'High-strength alloy steel. Used in aerospace and automotive.',
        density_kg_m3: 7850,
        youngs_modulus_Pa: 205e9,
        specific_heat_J_kgK: 475,
        thermal_conductivity_W_mK: 44.5,
        melting_point_C: 1510,
        yield_strength_MPa: 792,
        failure_strain: 0.35,
        johnson_cook: {
            A: 792,
            B: 510,
            n: 0.26,
            C: 0.014,
            m: 1.03
        }
    },

    // ═══════════════════════════════════════════════════════
    // TYPE B: TOOL MATERIALS (SUBSTRATES)
    // ═══════════════════════════════════════════════════════
    {
        id: 'mat_tool_001',
        name: 'Tungsten-Carbide (WC-Co)',
        category: 'Carbide',
        type: 'standard',
        classification: 'tool_material',
        description: 'Standard cemented carbide substrate for cutting tools.',
        properties: {
            density: 14500,
            youngsModulus: 600e9,
            poissonsRatio: 0.22,
            specificHeat: 200,
            thermalConductivity: 80,
            meltingPoint: 2870,
            yieldStrength: 4.0
        },
        wear: {
            usui: {
                A: 1e-9,
                B: 1000.0
            }
        }
    },
    {
        id: 'mat_tool_002',
        name: 'HSS (High Speed Steel)',
        category: 'Steel',
        type: 'standard',
        classification: 'tool_material',
        description: 'Tougher than carbide but lower heat resistance.',
        properties: {
            density: 8200,
            youngsModulus: 210e9,
            poissonsRatio: 0.30,
            specificHeat: 450,
            thermalConductivity: 40,
            meltingPoint: 1450,
            yieldStrength: 1.2
        },
        wear: {
            usui: { A: 2e-9, B: 800.0 }
        }
    },
    {
        id: 'mat_tool_003',
        name: 'Cermet (TiC-TiN)',
        category: 'Cermet',
        type: 'standard',
        classification: 'tool_material',
        description: 'Ceramic-metal composite. Good for finishing operations.',
        properties: {
            density: 7000,
            youngsModulus: 450e9,
            poissonsRatio: 0.24,
            specificHeat: 400,
            thermalConductivity: 25,
            meltingPoint: 2500,
            yieldStrength: 3.0
        },
        wear: {
            usui: { A: 5e-10, B: 1200.0 }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TYPE C: COATINGS
    // ═══════════════════════════════════════════════════════
    {
        id: 'mat_coat_001',
        name: 'TiAlN',
        category: 'PVD Coating',
        type: 'standard',
        classification: 'coating',
        description: 'Titanium Aluminum Nitride. Excellent for high temp machining.',
        properties: {
            color: '#4b0082',
            frictionCoeff: 0.4,
            maxTemp: 900
        }
    },
    {
        id: 'mat_coat_002',
        name: 'TiN',
        category: 'CVD Coating',
        type: 'standard',
        classification: 'coating',
        description: 'Titanium Nitride. General purpose gold-colored coating.',
        properties: {
            color: '#ffd700',
            frictionCoeff: 0.5,
            maxTemp: 600
        }
    },
    {
        id: 'mat_coat_003',
        name: 'AlCrN',
        category: 'PVD Coating',
        type: 'standard',
        classification: 'coating',
        description: 'Aluminum Chromium Nitride. Extreme heat resistance.',
        properties: {
            color: '#a9a9a9',
            frictionCoeff: 0.35,
            maxTemp: 1100
        }
    },
    {
        id: 'mat_coat_004',
        name: 'DLC',
        category: 'PVD Coating',
        type: 'standard',
        classification: 'coating',
        description: 'Diamond-Like Carbon. Ultra-low friction for aluminum machining.',
        properties: {
            color: '#1a1a2e',
            frictionCoeff: 0.15,
            maxTemp: 500
        }
    }
];

const MaterialService = {
    /**
     * initialize and load materials
     */
    getAll: async () => {
        try {
            const dirExists = await exists('', { baseDir: BaseDirectory.AppData });
            if (!dirExists) {
                await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            const fileExists = await exists(FILE_NAME, { baseDir: BaseDirectory.AppData });
            if (fileExists) {
                const content = await readTextFile(FILE_NAME, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            } else {
                await writeTextFile(FILE_NAME, JSON.stringify(SEED_DATA, null, 2), { baseDir: BaseDirectory.AppData });
                return SEED_DATA;
            }
        } catch (err) {
            console.error("MaterialService Init Error:", err);
            return [];
        }
    },

    /**
     * Add a new material
     */
    add: async (material) => {
        try {
            const current = await MaterialService.getAll();
            const id = material.id || `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newMaterial = {
                ...material,
                id,
                type: 'custom'
            };
            const updated = [...current, newMaterial];
            await writeTextFile(FILE_NAME, JSON.stringify(updated, null, 2), { baseDir: BaseDirectory.AppData });
            return updated;
        } catch (err) {
            console.error("MaterialService Add Error:", err);
            throw err;
        }
    },

    /**
     * Delete a material by ID
     */
    delete: async (id) => {
        try {
            const current = await MaterialService.getAll();
            const updated = current.filter(m => m.id !== id);
            await writeTextFile(FILE_NAME, JSON.stringify(updated, null, 2), { baseDir: BaseDirectory.AppData });
            return updated;
        } catch (err) {
            console.error("MaterialService Delete Error:", err);
            throw err;
        }
    },

    /**
     * Reset to default seed data
     */
    reset: async () => {
        await writeTextFile(FILE_NAME, JSON.stringify(SEED_DATA, null, 2), { baseDir: BaseDirectory.AppData });
        return SEED_DATA;
    }
};

export default MaterialService;
