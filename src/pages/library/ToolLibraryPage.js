import React, { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Search, Plus, Wrench, X, Upload, Save, Trash2, Box, CircleDot, Layers, Shield, Ruler, Crosshair, PenTool, Circle, Lock } from 'lucide-react';
import Panel from '../../components/ui/Panel';
import Button from '../../components/ui/Button';
import Tool3DViewer from '../../components/library/Tool3DViewer';
import ToolService, { TOOL_CATEGORIES, ALL_TOOL_TYPES, getCategoryForType } from '../../services/ToolService';
import VaultService from '../../services/VaultService';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════
// CATEGORY COLORS
// ═══════════════════════════════════════════════════════
const CAT_COLORS = {
    drilling: {
        bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
        text: 'text-emerald-400', ring: 'ring-emerald-500/40',
        dot: 'bg-emerald-500', hover: 'hover:border-emerald-500/50'
    },
    milling: {
        bg: 'bg-blue-500/10', border: 'border-blue-500/30',
        text: 'text-blue-400', ring: 'ring-blue-500/40',
        dot: 'bg-blue-500', hover: 'hover:border-blue-500/50'
    },
    turning: {
        bg: 'bg-orange-500/10', border: 'border-orange-500/30',
        text: 'text-orange-400', ring: 'ring-orange-500/40',
        dot: 'bg-orange-500', hover: 'hover:border-orange-500/50'
    }
};

// ═══════════════════════════════════════════════════════
// ADD TOOL MODAL
// ═══════════════════════════════════════════════════════
const AddToolModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'End Mill',
        substrate: 'Carbide',
        coating: 'None',
        diameter_mm: '',
        geometryPath: null
    });

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileSelect = async () => {
        try {
            const selectedPath = await open({
                multiple: false,
                filters: [{ name: '3D Models', extensions: ['stl', 'obj', 'step', 'stp'] }]
            });
            if (selectedPath) {
                setFormData({ ...formData, geometryPath: selectedPath });
            }
        } catch (err) {
            console.error("File selection failed:", err);
            toast.error("Failed to select file");
        }
    };

    const handleSubmit = () => {
        if (!formData.name) return toast.error("Please enter a tool name");
        onSave(formData);
    };

    // Group types by category for the selector
    const typeOptions = Object.entries(TOOL_CATEGORIES).map(([key, cat]) => ({
        label: cat.label,
        types: cat.types
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-studio-panel border border-studio-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
                <div className="flex justify-between items-center border-b border-studio-border pb-4">
                    <h2 className="text-lg font-bold text-studio-text-main">Add New Tool</h2>
                    <button onClick={onClose} className="text-studio-text-muted hover:text-studio-text-main transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-studio-text-muted mb-1">Tool Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-studio-surface border border-studio-border/60 rounded-lg px-3 py-2.5 text-sm text-studio-text-main focus:ring-1 focus:ring-studio-primary focus:border-studio-primary outline-none transition-colors" placeholder="e.g. Carbide End Mill 12mm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-studio-text-muted mb-1">Tool Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-studio-surface border border-studio-border/60 rounded-lg px-3 py-2.5 text-sm text-studio-text-main focus:ring-1 focus:ring-studio-primary outline-none">
                                {typeOptions.map(group => (
                                    <optgroup key={group.label} label={`── ${group.label} ──`}>
                                        {group.types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-studio-text-muted mb-1">Diameter (mm)</label>
                            <input name="diameter_mm" type="number" value={formData.diameter_mm} onChange={handleChange} className="w-full bg-studio-surface border border-studio-border/60 rounded-lg px-3 py-2.5 text-sm text-studio-text-main focus:ring-1 focus:ring-studio-primary outline-none" placeholder="Optional" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-studio-text-muted mb-1">Substrate</label>
                            <select name="substrate" value={formData.substrate} onChange={handleChange} className="w-full bg-studio-surface border border-studio-border/60 rounded-lg px-3 py-2.5 text-sm text-studio-text-main focus:ring-1 focus:ring-studio-primary outline-none">
                                <option>Carbide</option>
                                <option>HSS-Co</option>
                                <option>Cermet</option>
                                <option>CBN</option>
                                <option>Diamond</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-studio-text-muted mb-1">Coating</label>
                            <input name="coating" value={formData.coating} onChange={handleChange} className="w-full bg-studio-surface border border-studio-border/60 rounded-lg px-3 py-2.5 text-sm text-studio-text-main focus:ring-1 focus:ring-studio-primary outline-none" placeholder="e.g. TiAlN" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-studio-text-muted mb-1">3D Geometry (Optional)</label>
                        <div className="flex gap-2">
                            <input readOnly value={formData.geometryPath ? formData.geometryPath.split(/[/\\]/).pop() : ''} className="flex-1 bg-studio-surface/50 border border-studio-border/60 rounded-lg px-3 py-2 text-xs text-studio-text-muted" placeholder="No file selected" />
                            <Button size="sm" variant="secondary" onClick={handleFileSelect} icon={Upload}>Browse</Button>
                        </div>
                        <p className="text-[10px] text-studio-text-dim mt-1">.stl, .obj, .step supported</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-studio-border/40">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" icon={Save} onClick={handleSubmit}>Save Tool</Button>
                </div>
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedToolId, setSelectedToolId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'drilling' | 'milling' | 'turning'

    const selectedTool = tools.find(t => t.id === selectedToolId) || null;
    const [absoluteGeometryPath, setAbsoluteGeometryPath] = useState(null);

    // Resolve Absolute Path
    useEffect(() => {
        const resolve = async () => {
            if (selectedTool?.geometryPath) {
                const path = await ToolService.resolvePath(selectedTool.geometryPath);
                setAbsoluteGeometryPath(path);
            } else {
                setAbsoluteGeometryPath(null);
            }
        };
        resolve();
    }, [selectedTool]);

    // Load Tools
    useEffect(() => { loadLibrary(); }, []);

    const loadLibrary = async () => {
        setLoading(true);
        const data = await ToolService.getAll();
        setTools(data);
        setLoading(false);
    };

    // Handle Save
    const handleSaveTool = async (formData) => {
        try {
            const updated = await ToolService.add(
                { name: formData.name, type: formData.type, substrate: formData.substrate, coating: formData.coating, diameter_mm: formData.diameter_mm ? parseFloat(formData.diameter_mm) : null },
                formData.geometryPath
            );
            setTools(updated);
            setIsModalOpen(false);
            toast.success("Tool added successfully");
        } catch (err) {
            toast.error("Failed to save tool");
        }
    };

    // Handle Delete
    const handleDeleteTool = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Delete this tool?")) return;
        try {
            const updated = await ToolService.delete(id);
            setTools(updated);
            if (selectedToolId === id) setSelectedToolId(null);
            toast.success("Tool deleted");
        } catch (err) {
            toast.error("Failed to delete tool");
        }
    };

    // Handle Vault
    const handleVaultTool = async (tool) => {
        const password = prompt("Set a strict Master Key to encrypt this tool geometry inside the Zero-Trust Vault:\n\nWARNING: The plaintext copy will be PERMANENTLY ERASED from this library.");
        if (!password) return;

        const toastId = toast.loading("Encrypting to Secure Enclave...");
        try {
            await VaultService.lockAsset(tool, password, tool.name, 'tool', 'System Operator');
            await ToolService.delete(tool.id);
            toast.success("Tool Vaulted & Original Erased", { id: toastId });
            loadLibrary();
            setSelectedToolId(null);
        } catch (err) {
            toast.error("Encryption Failed", { id: toastId });
        }
    };

    // ─── FILTERING ───
    const filteredTools = tools.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.type.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        return matchesSearch && getCategoryForType(t.type) === activeFilter;
    });

    // Group tools by category
    const groupedTools = {};
    filteredTools.forEach(tool => {
        const cat = getCategoryForType(tool.type);
        if (!groupedTools[cat]) groupedTools[cat] = [];
        groupedTools[cat].push(tool);
    });

    // Category counts (from full list, not filtered)
    const categoryCounts = { all: tools.length };
    tools.forEach(t => {
        const cat = getCategoryForType(t.type);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-5 h-[calc(100vh-6rem)] flex flex-col">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-studio-text-main tracking-tight">Tool Library</h1>
                    <p className="text-sm text-studio-text-muted mt-1">{tools.length} tools across {Object.keys(TOOL_CATEGORIES).length} categories</p>
                </div>
                <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>Add New Tool</Button>
            </div>

            {/* Toolbar — Search + Category Filters */}
            <div className="shrink-0 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-studio-text-dim" />
                    <input
                        type="text"
                        placeholder="Search tools by name or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-studio-surface/70 border border-studio-border/70 rounded-lg pl-10 pr-4 py-2.5 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 outline-none"
                    />
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    <FilterTab label="All" count={categoryCounts.all} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                    {Object.entries(TOOL_CATEGORIES).map(([key, cat]) => (
                        <FilterTab
                            key={key}
                            label={cat.label}
                            count={categoryCounts[key] || 0}
                            active={activeFilter === key}
                            onClick={() => setActiveFilter(key)}
                            color={CAT_COLORS[key]}
                        />
                    ))}
                </div>
            </div>

            {/* Content Area: Tool List + Preview */}
            <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">

                {/* Left: Tool List grouped by category */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-studio-text-dim">Loading library...</div>
                    ) : filteredTools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-studio-text-dim">
                            <Wrench className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No tools found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedTools).map(([catKey, catTools]) => {
                                const cat = TOOL_CATEGORIES[catKey];
                                const colors = CAT_COLORS[catKey];
                                return (
                                    <div key={catKey}>
                                        {/* Category Header (only when filter = 'all') */}
                                        {activeFilter === 'all' && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                                <h3 className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{cat.label}</h3>
                                                <span className="text-[10px] text-studio-text-dim">({catTools.length})</span>
                                                <div className="flex-1 border-b border-studio-border/30" />
                                            </div>
                                        )}

                                        {/* Tool Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {catTools.map((tool) => (
                                                <ToolCard
                                                    key={tool.id}
                                                    tool={tool}
                                                    catKey={catKey}
                                                    selected={selectedToolId === tool.id}
                                                    onClick={() => setSelectedToolId(tool.id)}
                                                    onDelete={(e) => handleDeleteTool(e, tool.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* + Add Card */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full border-2 border-dashed border-studio-border/50 rounded-xl p-4 flex items-center justify-center gap-2 text-studio-text-dim hover:border-studio-primary hover:text-studio-primary hover:bg-studio-primary/5 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-xs font-medium">Add New Tool</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Preview Panel — FIXED width + full-height canvas */}
                <div className="w-full lg:w-[480px] shrink-0 flex flex-col gap-4 min-h-0">
                    <Panel title="3D Geometry Preview" className="flex-1 flex flex-col min-h-[350px]">
                        <div className="flex-1 relative rounded-lg overflow-hidden border border-studio-border/40" style={{ minHeight: '320px' }}>
                            <Tool3DViewer geometryPath={absoluteGeometryPath} />
                        </div>
                    </Panel>

                    {/* Tool Details */}
                    {selectedTool && (
                        <Panel title="Tool Details" className="shrink-0" headerAction={
                            <button onClick={() => handleVaultTool(selectedTool)} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded transition-colors" title="Lock in IP Vault">
                                <Lock className="w-3 h-3" /> Vault IP
                            </button>
                        }>
                            <div className="space-y-2 text-sm">
                                <DetailRow label="Name" value={selectedTool.name} bold />
                                <DetailRow label="Type" value={selectedTool.type} badge catKey={getCategoryForType(selectedTool.type)} />
                                <DetailRow label="Substrate" value={selectedTool.substrate} />
                                <DetailRow label="Coating" value={selectedTool.coating || 'None'} />
                                {selectedTool.diameter_mm && <DetailRow label="Diameter" value={`${selectedTool.diameter_mm} mm`} />}
                                <DetailRow label="Life" value={selectedTool.life || '—'} life />
                                <DetailRow label="Geometry" value={selectedTool.geometryPath ? '✓ Linked' : '✗ None'} mono />
                            </div>
                        </Panel>
                    )}
                </div>
            </div>

            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTool}
            />
        </div>
    );
};


// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

const FilterTab = ({ label, count, active, onClick, color }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${active
            ? `${color?.bg || 'bg-studio-primary/10'} ${color?.border || 'border-studio-primary/50'} ${color?.text || 'text-studio-primary'} ring-1 ${color?.ring || 'ring-studio-primary/30'}`
            : 'bg-studio-surface/50 border-studio-border/50 text-studio-text-muted hover:text-studio-text-main hover:border-studio-border'
            }`}
    >
        {color && <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />}
        <span>{label}</span>
        <span className={`text-[10px] ${active ? 'opacity-70' : 'opacity-40'}`}>{count}</span>
    </button>
);

// ─── TYPE-SPECIFIC ICON MAP ───
const TOOL_ICONS = {
    'Drill': PenTool,
    'Center Drill': Crosshair,
    'Reamer': Layers,
    'End Mill': Box,
    'Ball Nose': CircleDot,
    'Face Mill': Layers,
    'Bull Nose': Box,
    'Turning Insert': Circle,
    'Boring Bar': Ruler,
    'Grooving Tool': Layers
};

const ToolCard = ({ tool, catKey, selected, onClick, onDelete }) => {
    const colors = CAT_COLORS[catKey] || CAT_COLORS.milling;
    const lifePercent = parseInt(tool.life) || 0;
    const lifeBarColor = lifePercent > 60 ? 'bg-emerald-500' : lifePercent > 30 ? 'bg-amber-500' : 'bg-red-500';
    const lifeBarBg = lifePercent > 60 ? 'bg-emerald-500/10' : lifePercent > 30 ? 'bg-amber-500/10' : 'bg-red-500/10';
    const lifeTextColor = lifePercent > 60 ? 'text-emerald-400' : lifePercent > 30 ? 'text-amber-400' : 'text-red-400';
    const ToolIcon = TOOL_ICONS[tool.type] || Wrench;

    return (
        <div
            onClick={onClick}
            className={`relative bg-studio-panel/80 border rounded-xl p-4 transition-all duration-200 cursor-pointer group overflow-hidden ${selected
                    ? `border-studio-primary/60 ring-1 ring-studio-primary/30 bg-studio-primary/5 shadow-lg shadow-studio-primary/5`
                    : `border-studio-border/50 hover:border-studio-border hover:shadow-md hover:shadow-black/10 ${colors.hover}`
                }`}
        >
            {/* Top Row: Icon + Type + Delete */}
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg transition-colors ${selected ? 'bg-studio-primary text-white shadow-sm' : `${colors.bg} ${colors.text}`
                    }`}>
                    <ToolIcon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {tool.type}
                    </span>
                    <button
                        onClick={onDelete}
                        className="p-1 rounded text-studio-text-dim hover:text-studio-danger hover:bg-studio-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Name */}
            <h3 className="font-bold text-sm text-studio-text-main mb-1 truncate leading-tight" title={tool.name}>{tool.name}</h3>
            <p className="text-[10px] text-studio-text-dim font-mono mb-3">{tool.id}</p>

            {/* Info Row: Substrate + Coating + Diameter */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {/* Substrate */}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-studio-surface border border-studio-border/50 text-studio-text-muted">
                    <Shield className="w-2.5 h-2.5 opacity-50" />
                    {tool.substrate}
                </span>
                {/* Coating */}
                {tool.coating && tool.coating !== 'None' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Layers className="w-2.5 h-2.5 opacity-60" />
                        {tool.coating}
                    </span>
                )}
                {/* Diameter */}
                {tool.diameter_mm && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-studio-surface border border-studio-border/50 text-studio-text-muted">
                        <Ruler className="w-2.5 h-2.5 opacity-50" />
                        Ø{tool.diameter_mm}mm
                    </span>
                )}
            </div>

            {/* Life Bar */}
            <div className="mt-auto">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-studio-text-dim font-medium">Tool Life</span>
                    <span className={`text-[10px] font-bold ${lifeTextColor}`}>{tool.life}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${lifeBarBg}`}>
                    <div
                        className={`h-full rounded-full ${lifeBarColor} transition-all duration-500`}
                        style={{ width: `${lifePercent}%` }}
                    />
                </div>
            </div>

            {/* 3D Geometry indicator */}
            {tool.geometryPath && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono bg-studio-primary/10 text-studio-primary border border-studio-primary/30 rounded px-1.5 py-0.5">3D</span>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ label, value, bold, mono, badge, catKey, life }) => {
    const colors = catKey ? CAT_COLORS[catKey] : null;
    const lifePercent = life ? parseInt(value) : 0;
    const lifeColor = lifePercent > 60 ? 'text-emerald-400' : lifePercent > 30 ? 'text-amber-400' : 'text-red-400';

    return (
        <div className="flex justify-between py-1.5 border-b border-studio-border/30 last:border-0 px-1 rounded">
            <span className="text-studio-text-muted text-xs">{label}</span>
            {badge && colors ? (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{value}</span>
            ) : (
                <span className={`${bold ? 'font-medium' : ''} ${mono ? 'font-mono text-[10px]' : 'text-xs'} ${life ? lifeColor : 'text-studio-text-main'} truncate max-w-[200px]`}>{value}</span>
            )}
        </div>
    );
};

export default ToolLibraryPage;
