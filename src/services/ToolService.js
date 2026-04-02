import { readTextFile, writeTextFile, BaseDirectory, exists, mkdir, copyFile, remove } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

const FILE_NAME = 'tools.json';
const TOOLS_DIR = 'tools_geometry';

// ═══════════════════════════════════════════════════════
// TOOL CATEGORIES — maps tool types → machining operations
// ═══════════════════════════════════════════════════════
export const TOOL_CATEGORIES = {
    drilling: {
        label: 'Drilling',
        types: ['Drill', 'Center Drill', 'Reamer'],
        color: 'emerald'
    },
    milling: {
        label: 'Milling',
        types: ['End Mill', 'Ball Nose', 'Face Mill', 'Bull Nose'],
        color: 'blue'
    },
    turning: {
        label: 'Turning',
        types: ['Turning Insert', 'Boring Bar', 'Grooving Tool'],
        color: 'orange'
    }
};

// All valid tool types (flattened)
export const ALL_TOOL_TYPES = Object.values(TOOL_CATEGORIES).flatMap(c => c.types);

// Find category for a given tool type
export const getCategoryForType = (type) => {
    for (const [key, cat] of Object.entries(TOOL_CATEGORIES)) {
        if (cat.types.includes(type)) return key;
    }
    return 'milling'; // fallback
};

const DEFAULT_TOOLS = [
    // ─── DRILLING ───
    {
        id: 'T-001',
        name: 'HSS Drill Bit 6mm',
        type: 'Drill',
        substrate: 'HSS-Co',
        coating: 'None',
        diameter_mm: 6,
        life: '85%'
    },
    {
        id: 'T-002',
        name: 'Carbide Drill 10mm',
        type: 'Drill',
        substrate: 'Carbide',
        coating: 'TiAlN',
        diameter_mm: 10,
        life: '92%'
    },
    {
        id: 'T-003',
        name: 'Center Drill 3mm',
        type: 'Center Drill',
        substrate: 'HSS-Co',
        coating: 'None',
        diameter_mm: 3,
        life: '100%'
    },

    // ─── MILLING ───
    {
        id: 'T-004',
        name: 'Carbide End Mill 12mm',
        type: 'End Mill',
        substrate: 'Carbide',
        coating: 'TiAlN',
        diameter_mm: 12,
        life: '78%'
    },
    {
        id: 'T-005',
        name: 'Ball Nose 6mm',
        type: 'Ball Nose',
        substrate: 'Carbide',
        coating: 'AlCrN',
        diameter_mm: 6,
        life: '90%'
    },
    {
        id: 'T-006',
        name: 'Face Mill 50mm',
        type: 'Face Mill',
        substrate: 'Carbide',
        coating: 'TiN',
        diameter_mm: 50,
        life: '65%'
    },

    // ─── TURNING ───
    {
        id: 'T-007',
        name: 'CNMG 120408 Insert',
        type: 'Turning Insert',
        substrate: 'Carbide',
        coating: 'TiAlN',
        diameter_mm: null,
        life: '70%'
    },
    {
        id: 'T-008',
        name: 'DNMG 150604 Insert',
        type: 'Turning Insert',
        substrate: 'Cermet',
        coating: 'TiN',
        diameter_mm: null,
        life: '88%'
    },
    {
        id: 'T-009',
        name: 'Boring Bar 16mm',
        type: 'Boring Bar',
        substrate: 'Carbide',
        coating: 'None',
        diameter_mm: 16,
        life: '95%'
    }
];

const ToolService = {
    getAll: async () => {
        try {
            const appDirExists = await exists('', { baseDir: BaseDirectory.AppData });
            if (!appDirExists) await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });

            const toolsDirExists = await exists(TOOLS_DIR, { baseDir: BaseDirectory.AppData });
            if (!toolsDirExists) await mkdir(TOOLS_DIR, { baseDir: BaseDirectory.AppData, recursive: true });

            const fileExists = await exists(FILE_NAME, { baseDir: BaseDirectory.AppData });
            if (fileExists) {
                const content = await readTextFile(FILE_NAME, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            } else {
                await writeTextFile(FILE_NAME, JSON.stringify(DEFAULT_TOOLS, null, 2), { baseDir: BaseDirectory.AppData });
                return DEFAULT_TOOLS;
            }
        } catch (err) {
            console.error("ToolService Init Error:", err);
            return [];
        }
    },

    saveAll: async (tools) => {
        await writeTextFile(FILE_NAME, JSON.stringify(tools, null, 2), { baseDir: BaseDirectory.AppData });
    },

    add: async (toolData, sourceFilePath) => {
        const tools = await ToolService.getAll();
        const newId = `T-${Date.now().toString().slice(-4)}`;
        let finalGeometryPath = null;

        if (sourceFilePath) {
            const fileExt = sourceFilePath.split('.').pop();
            const newFileName = `${newId}.${fileExt}`;
            const destPath = `${TOOLS_DIR}/${newFileName}`;
            await copyFile(sourceFilePath, destPath, { toPathBaseDir: BaseDirectory.AppData });
            finalGeometryPath = destPath;
        }

        const newTool = {
            id: newId,
            name: toolData.name,
            type: toolData.type,
            substrate: toolData.substrate,
            coating: toolData.coating,
            diameter_mm: toolData.diameter_mm || null,
            life: '100%',
            geometryPath: finalGeometryPath
        };

        const updated = [...tools, newTool];
        await ToolService.saveAll(updated);
        return updated;
    },

    delete: async (id) => {
        const tools = await ToolService.getAll();
        const toolToDelete = tools.find(t => t.id === id);

        if (toolToDelete && toolToDelete.geometryPath) {
            try {
                await remove(toolToDelete.geometryPath, { baseDir: BaseDirectory.AppData });
            } catch (e) {
                console.warn("Could not delete associated geometry file", e);
            }
        }

        const updated = tools.filter(t => t.id !== id);
        await ToolService.saveAll(updated);
        return updated;
    },

    resolvePath: async (relativePath) => {
        if (!relativePath) return null;
        try {
            const appData = await appDataDir();
            return await join(appData, relativePath);
        } catch (e) {
            console.error("Path resolve error", e);
            return null;
        }
    },

    reset: async () => {
        await writeTextFile(FILE_NAME, JSON.stringify(DEFAULT_TOOLS, null, 2), { baseDir: BaseDirectory.AppData });
        return DEFAULT_TOOLS;
    }
};

export default ToolService;
