import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../context/LicenseContext';
import { Key, Shield, Cpu, ExternalLink, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';

const LicensePage = () => {
    const navigate = useNavigate();
    const { activate } = useLicense();

    const [licenseKey, setLicenseKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleActivate = async (e) => {
        e.preventDefault();
        setError('');

        if (!licenseKey || licenseKey.length < 5) {
            setError("Please enter a valid license key format.");
            return;
        }

        setIsLoading(true);

        try {
            await activate(licenseKey);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error("Activation Failed:", err);
            setError(typeof err === 'string' ? err : "Connection failed. Please check your internet and try again.");
            setIsLoading(false);
        }
    };

    const openPricingPage = async () => {
        try {
            const { open } = await import('@tauri-apps/plugin-shell');
            await open('https://omr-system.netlify.app/pricing');
        } catch {
            window.open('https://omr-system.netlify.app/pricing', '_blank');
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center overflow-hidden app-ambient"
            style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(14, 165, 164, 0.12), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.08), transparent 50%), linear-gradient(180deg, #080e1a 0%, #0b1220 40%, #0f1b2a 100%)',
            }}
        >
            {/* Ambient dots */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(rgba(230, 237, 245, 0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[960px] mx-4 flex rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(51, 65, 85, 0.4)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(14, 165, 164, 0.06)',
                }}
            >
                {/* LEFT PANEL — Branding */}
                <div className="w-5/12 relative p-8 flex flex-col justify-between overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg, rgba(14, 165, 164, 0.12) 0%, rgba(15, 23, 42, 0.8) 60%, rgba(245, 158, 11, 0.06) 100%)',
                        borderRight: '1px solid rgba(51, 65, 85, 0.3)',
                    }}
                >
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(230,237,245,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,237,245,0.5) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* Glow */}
                    <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-30 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(14, 165, 164, 0.4), transparent 70%)' }}
                    />

                    {/* Top: Logo + Name */}
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(14, 165, 164, 0.2), rgba(245, 158, 11, 0.1))',
                                border: '1px solid rgba(14, 165, 164, 0.25)',
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="rgba(14,165,164,0.9)" strokeWidth="1.5" fill="rgba(14,165,164,0.08)" />
                                <path d="M20 4L20 36" stroke="rgba(14,165,164,0.3)" strokeWidth="0.5" />
                                <path d="M4 12L36 28" stroke="rgba(14,165,164,0.3)" strokeWidth="0.5" />
                                <path d="M36 12L4 28" stroke="rgba(14,165,164,0.3)" strokeWidth="0.5" />
                                <circle cx="20" cy="20" r="4" fill="rgba(14,165,164,0.5)" stroke="rgba(14,165,164,0.9)" strokeWidth="1" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-wide"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                background: 'linear-gradient(135deg, #e6edf5, #0ea5a4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            EdgePredict
                        </h1>
                        <p className="text-xs mt-1.5 tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                            Cutting Tool Simulation Engine
                        </p>
                    </div>

                    {/* Middle: Features */}
                    <div className="relative z-10 space-y-4 my-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(14, 165, 164, 0.1)', border: '1px solid rgba(14, 165, 164, 0.15)' }}>
                                <Cpu size={14} style={{ color: '#0ea5a4' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'rgba(230, 237, 245, 0.8)' }}>CUDA-Powered Simulation</p>
                                <p className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.45)' }}>SPH + FEM physics on GPU</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(14, 165, 164, 0.1)', border: '1px solid rgba(14, 165, 164, 0.15)' }}>
                                <Shield size={14} style={{ color: '#0ea5a4' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'rgba(230, 237, 245, 0.8)' }}>Secure Node-Locked License</p>
                                <p className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.45)' }}>Tied to your machine ID</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                <Key size={14} style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'rgba(230, 237, 245, 0.8)' }}>Instant Activation</p>
                                <p className="text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.45)' }}>Enter key and start working</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Version + Copyright */}
                    <div className="relative z-10">
                        <p className="text-[10px] tracking-[0.2em]">
                            <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>© 2026 </span>
                            <span style={{
                                background: 'linear-gradient(90deg, #0ea5a4, #f59e0b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 600,
                            }}>OMR Systems</span>
                            <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}> • v0.1.0</span>
                        </p>
                    </div>
                </div>

                {/* RIGHT PANEL — Activation Form */}
                <div className="w-7/12 p-8 md:p-10 flex flex-col justify-center relative">

                    {/* Success Overlay */}
                    {success && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-r-2xl"
                            style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)' }}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                            >
                                <CheckCircle size={32} style={{ color: '#10b981' }} />
                            </div>
                            <h2 className="text-xl font-bold" style={{ color: '#e6edf5' }}>Activation Successful</h2>
                            <p className="text-sm mt-2" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>Launching workspace...</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-7">
                        <h2 className="text-xl font-bold" style={{ color: '#e6edf5' }}>Product Activation</h2>
                        <p className="text-sm mt-1.5" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                            Enter your license key to unlock EdgePredict.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleActivate} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                                style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                                License Key
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Key size={16} style={{ color: 'rgba(148, 163, 184, 0.3)' }} />
                                </div>
                                <input
                                    type="text"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="w-full rounded-xl py-3 pl-10 pr-4 text-base tracking-widest outline-none transition-all"
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(51, 65, 85, 0.4)',
                                        color: '#e6edf5',
                                        boxShadow: error ? '0 0 12px rgba(239, 68, 68, 0.1)' : 'none',
                                    }}
                                    onFocus={(e) => {
                                        if (!error) e.target.style.borderColor = 'rgba(14, 165, 164, 0.5)';
                                        e.target.style.boxShadow = error ? '0 0 12px rgba(239, 68, 68, 0.1)' : '0 0 12px rgba(14, 165, 164, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        if (!error) e.target.style.borderColor = 'rgba(51, 65, 85, 0.4)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-xs flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                                    <AlertCircle size={13} />
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Activate Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all"
                            style={{
                                background: isLoading
                                    ? 'rgba(14, 165, 164, 0.15)'
                                    : 'linear-gradient(135deg, rgba(14, 165, 164, 0.25), rgba(14, 165, 164, 0.15))',
                                border: '1px solid rgba(14, 165, 164, 0.35)',
                                color: isLoading ? 'rgba(14, 165, 164, 0.5)' : '#0ea5a4',
                                cursor: isLoading ? 'wait' : 'pointer',
                                boxShadow: '0 0 20px rgba(14, 165, 164, 0.08)',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(14, 165, 164, 0.35), rgba(14, 165, 164, 0.25))';
                                    e.target.style.boxShadow = '0 0 25px rgba(14, 165, 164, 0.15)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(14, 165, 164, 0.25), rgba(14, 165, 164, 0.15))';
                                    e.target.style.boxShadow = '0 0 20px rgba(14, 165, 164, 0.08)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Validating Key...
                                </span>
                            ) : (
                                'Activate Software'
                            )}
                        </button>
                    </form>

                    {/* Important Info */}
                    <div className="mt-6 p-3.5 rounded-xl" style={{ background: 'rgba(14, 165, 164, 0.04)', border: '1px solid rgba(14, 165, 164, 0.1)' }}>
                        <div className="flex items-start gap-2.5">
                            <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'rgba(14, 165, 164, 0.6)' }} />
                            <div className="space-y-1.5">
                                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(148, 163, 184, 0.55)' }}>
                                    <strong style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Node-Locked License:</strong> Your key is tied to this device. It cannot be transferred or used on another machine without deactivation.
                                </p>
                                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(148, 163, 184, 0.55)' }}>
                                    <strong style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Internet Required:</strong> A one-time internet connection is needed for activation. The software works offline after that.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-5 pt-4 flex items-center justify-between"
                        style={{ borderTop: '1px solid rgba(51, 65, 85, 0.25)' }}
                    >
                        <button
                            onClick={openPricingPage}
                            className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: '#0ea5a4' }}
                        >
                            <ExternalLink size={12} />
                            Purchase a License
                        </button>
                        <a href="mailto:support@omr-systems.com"
                            className="text-[11px] transition-colors hover:opacity-80"
                            style={{ color: 'rgba(148, 163, 184, 0.4)' }}
                        >
                            Need Help? Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LicensePage;