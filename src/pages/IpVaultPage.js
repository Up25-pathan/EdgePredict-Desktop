import React, { useState, useEffect } from 'react';
import { Shield, Lock, Fingerprint, Key, Unlock, Trash2, FileText, Activity, CheckCircle, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import VaultService from '../services/VaultService';
import toast from 'react-hot-toast';

const IpVaultPage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [unlockedAssets, setUnlockedAssets] = useState(new Set()); // Tracks which asset IDs have valid sessions

    useEffect(() => {
        loadVault();
    }, []);

    const loadVault = async () => {
        try {
            setLoading(true);
            await VaultService.init();
            const list = await VaultService.listAssets();
            setAssets(list);
        } catch (error) {
            console.error("Failed to load vault:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!selectedAsset || !passwordInput) return;

        const toastId = toast.loading("Verifying cryptographic signature...");
        try {
            // We unlock the asset to verify the password, but we explicitly DO NOT
            // save the decrypted payload to the UI state to respect zero-trust policies.
            await VaultService.unlockAsset(selectedAsset.id, passwordInput);
            
            setUnlockedAssets(prev => {
                const newSet = new Set(prev);
                newSet.add(selectedAsset.id);
                return newSet;
            });
            
            toast.success("Identity Verified. Asset Ready for Engine.", { id: toastId });
            setPasswordInput(""); 
        } catch (error) {
            toast.error("Decryption Failed: Invalid Authentication", { id: toastId });
        }
    };

    const handleLock = () => {
        if (selectedAsset) {
            setUnlockedAssets(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedAsset.id);
                return newSet;
            });
            toast.success("Asset session terminated and locked");
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("CRITICAL WARNING: This action will permanently destroy the encrypted asset. It cannot be recovered. Proceed?")) {
            await VaultService.deleteAsset(id);
            toast.success("Asset destroyed securely");
            loadVault();
            if (selectedAsset?.id === id) {
                setSelectedAsset(null);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0b1220] via-[#0f1f2e] to-[#144a4f] rounded-2xl p-8 text-white relative overflow-hidden shadow-card shrink-0 border border-studio-border/50">
                <div className="absolute inset-0 app-dots opacity-[0.15]"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-studio-primary rounded-full blur-[120px] opacity-20 transform -translate-y-1/2"></div>

                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-white/70">
                            <Shield className="w-5 h-5 text-amber-500" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Zero-Trust Enclave</span>
                        </div>
                        <h1 className="text-3xl font-display font-semibold tracking-tight mb-2">Intellectual Property Vault</h1>
                        <p className="text-white/60 max-w-lg text-sm leading-relaxed">
                            AES-256 Encrypted storage for proprietary engineering assets. 
                            Data remains encrypted at rest and is only decrypted in-memory by the physics engine during execution.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Asset List */}
                <div className="lg:col-span-1 bg-studio-panel/50 border border-studio-border rounded-xl flex flex-col overflow-hidden backdrop-blur-sm shadow-soft">
                    <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                            <Lock className="w-4 h-4 text-studio-text-muted" />
                            Encrypted Volumes
                        </h3>
                        <span className="text-xs font-mono text-studio-text-dim px-2 py-0.5 bg-black/30 rounded">{assets.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-studio-text-dim">
                                <Activity className="w-6 h-6 animate-pulse" />
                                <span className="text-xs uppercase tracking-widest">Scanning Sectors...</span>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center p-8 text-studio-text-dim flex flex-col items-center gap-3 mt-10">
                                <ShieldAlert className="w-10 h-10 opacity-20" />
                                <p className="text-sm">Vault is strictly empty.</p>
                                <p className="text-[10px] uppercase tracking-wider text-studio-text-muted/60 mt-2 text-center leading-relaxed">
                                    To vault an asset, locate it in the Library and select "Secure in Vault".
                                </p>
                            </div>
                        ) : (
                            assets.map((asset) => {
                                const isUnlocked = unlockedAssets.has(asset.id);
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => { setSelectedAsset(asset); setPasswordInput(""); }}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden
                                            ${selectedAsset?.id === asset.id
                                                ? 'bg-studio-primary/10 border-studio-primary shadow-[0_0_20px_rgba(14,165,164,0.1)]'
                                                : 'bg-black/20 border-white/5 hover:border-studio-primary/50 hover:bg-studio-primary/5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border 
                                                    ${isUnlocked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-studio-canvas border-studio-border text-studio-text-muted'}`}>
                                                    {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </div>
                                                <div className="min-w-0 pr-6">
                                                    <h4 className="font-bold text-sm text-white truncate group-hover:text-studio-primary transition-colors">
                                                        {asset.name}
                                                    </h4>
                                                    <div className="text-[10px] text-studio-text-dim flex items-center gap-2 mt-1">
                                                        <span className="uppercase tracking-wider">{asset.type}</span>
                                                        <span>•</span>
                                                        <span className="font-mono">{new Date(asset.created).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, asset.id)}
                                            className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-lg text-studio-text-dim hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-20"
                                            title="Destroy Asset"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Dashboard Panel */}
                <div className="lg:col-span-2 bg-studio-panel/50 border border-studio-border rounded-xl flex flex-col overflow-hidden relative backdrop-blur-sm shadow-soft">
                    {!selectedAsset ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-studio-text-dim gap-4">
                            <div className="w-20 h-20 rounded-full bg-black/20 border border-white/5 flex items-center justify-center shadow-inner">
                                <Fingerprint className="w-10 h-10 opacity-30 text-studio-primary" />
                            </div>
                            <p className="text-sm font-mono tracking-wider uppercase text-studio-text-muted">Awaiting Asset Selection</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Asset Header Info */}
                            <div className="p-6 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-white tracking-wide">{selectedAsset.name}</h2>
                                        {unlockedAssets.has(selectedAsset.id) ? (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded">
                                                <CheckCircle className="w-3 h-3" /> VERIFIED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded">
                                                <Lock className="w-3 h-3" /> ENCRYPTED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-studio-text-dim font-mono tracking-widest mt-2">{selectedAsset.id}</p>
                                </div>
                                <div className="text-left md:text-right bg-black/30 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-studio-text-dim mb-1">Registered Custodian</div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2 md:justify-end">
                                        <Shield className="w-4 h-4 text-studio-primary" />
                                        {selectedAsset.owner || "System Operator"}
                                    </div>
                                </div>
                            </div>

                            {/* Telemetry & Action Area */}
                            <div className="flex-1 p-8 flex flex-col relative bg-gradient-to-b from-transparent to-black/30">
                                {unlockedAssets.has(selectedAsset.id) ? (
                                    <div className="flex-1 flex flex-col h-full animate-fadeIn max-w-2xl mx-auto w-full">
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 mb-6">
                                            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-wide text-sm">
                                                <CheckCircle className="w-5 h-5" /> Signature Validated
                                            </h3>
                                            <p className="text-sm text-studio-text-muted leading-relaxed">
                                                This asset's cryptographic signature has been verified. The encryption keys are maintained in volatile memory. 
                                                <strong> The raw geometry and thermo-mechanical parameters are actively hidden from this interface to maintain Zero-Trust compliance.</strong>
                                            </p>
                                        </div>

                                        <div className="flex-1 border border-white/5 rounded-xl bg-black/40 p-6 flex flex-col justify-center items-center relative overflow-hidden">
                                            <div className="absolute inset-0 app-grid opacity-10"></div>
                                            <Activity className="w-12 h-12 text-emerald-500/40 mb-4 animate-pulse" />
                                            <p className="text-sm text-white font-mono tracking-wider text-center relative z-10">
                                                ASSET READY FOR SIMULATION ENGINE
                                            </p>
                                            <p className="text-xs text-emerald-500/60 font-mono tracking-wide mt-2 relative z-10">
                                                {">"} AWAITING DISPATCH...
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <Button variant="secondary" icon={Lock} onClick={handleLock}>
                                                Terminate Session & Relock
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center h-full animate-fadeIn">
                                        <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-50"></div>
                                            
                                            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 ring-1 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-6">
                                                <Key className="w-7 h-7" />
                                            </div>
                                            
                                            <div className="text-center mb-8">
                                                <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
                                                <p className="text-sm text-studio-text-muted">
                                                    Supply the cryptographic key to verify this volume's integrity and authorize it for engine execution.
                                                </p>
                                            </div>

                                            <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-5">
                                                <div>
                                                    <input
                                                        type="password"
                                                        placeholder="Enter Master Password / Key"
                                                        value={passwordInput}
                                                        onChange={(e) => setPasswordInput(e.target.value)}
                                                        className="w-full bg-black/60 border border-studio-border rounded-xl px-4 py-3.5 text-center text-white placeholder-white/20 focus:outline-none focus:border-studio-primary focus:ring-1 focus:ring-studio-primary/50 transition-all font-mono tracking-widest shadow-inner"
                                                        autoFocus
                                                    />
                                                </div>
                                                <Button
                                                    fullWidth
                                                    variant="primary"
                                                    icon={Unlock}
                                                    disabled={!passwordInput}
                                                    className="py-3"
                                                >
                                                    Verify Signature
                                                </Button>
                                            </form>
                                            
                                            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 justify-center items-center text-[10px] font-mono text-studio-text-dim uppercase tracking-wider">
                                                <Shield className="w-3 h-3 text-studio-text-muted" /> AES-256 GCM Encryption
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IpVaultPage;
