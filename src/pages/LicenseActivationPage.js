import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../context/LicenseContext';
import { Key, ShieldCheck, Cpu, ArrowRight, AlertCircle, Loader2, Lock } from 'lucide-react';
// Assuming Logo exists, replacing with Lucide Icon stub if not specific
import { Hexagon } from 'lucide-react';

const LicenseActivationPage = () => {
    const { activate } = useLicense();
    const navigate = useNavigate();

    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = async (e) => {
        e.preventDefault();
        setError('');
        setIsActivating(true);

        try {
            await activate(key);
            navigate('/');
        } catch (err) {
            setError(err || "Activation failed. Please check your key.");
            setIsActivating(false);
        }
    };

    return (
        <div className="min-h-screen bg-studio-canvas flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#cdd6e1_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-studio-primary/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-studio-panel/80 rounded-xl shadow-soft border border-studio-border/70 mb-4 text-studio-primary">
                        <Hexagon className="w-6 h-6 fill-current" />
                    </div>
                    <h1 className="text-2xl font-bold text-studio-text-main tracking-tight">Welcome Back</h1>
                    <p className="text-studio-text-muted text-sm mt-1">Sign in with your license key to continue</p>
                </div>

                {/* Card */}
                <div className="bg-studio-panel/80 border border-studio-border/60 rounded-xl p-8 shadow-card backdrop-blur">
                    <form onSubmit={handleActivate} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-studio-text-main uppercase tracking-wide">License Key</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 w-4 h-4 text-studio-text-dim" />
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="w-full bg-studio-surface/70 border border-studio-border/70 rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono text-studio-text-main placeholder-studio-text-dim focus:ring-2 focus:ring-studio-primary/20 focus:border-studio-primary outline-none transition-all uppercase"
                                    disabled={isActivating}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 p-3 rounded-lg text-red-600 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!key || isActivating}
                            className="w-full flex items-center justify-center py-2.5 bg-studio-primary hover:bg-studio-primary/90 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isActivating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Activate License
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-studio-border flex justify-between items-center text-xs text-studio-text-dim">
                        <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Secure Verification</span>
                        </div>
                        <span>v2.4.0</span>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-studio-text-muted">
                        Lost your key? <span className="text-studio-primary font-medium cursor-pointer hover:underline">Recover Access</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LicenseActivationPage;
