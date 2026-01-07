import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // FIX: Missing import
import { useLicense } from '../context/LicenseContext';
import { Key, Mail, ShieldCheck, Loader, Lock, ArrowRight, Hexagon } from 'lucide-react';

const LicensePage = () => {
  const navigate = useNavigate(); // FIX: Initialize Navigation
  const { activateLicense, loading, isLicensed } = useLicense();
  
  // Form State
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-redirect if already licensed (prevents getting stuck)
  useEffect(() => {
    if (isLicensed) {
      navigate('/');
    }
  }, [isLicensed, navigate]);

  const handleActivation = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    if (!email || !licenseKey) {
        setError("All fields are required.");
        setIsVerifying(false);
        return;
    }

    // Artificial delay to make it feel like it's "Thinking"/Connecting to satellite
    setTimeout(async () => {
        const result = await activateLicense(email, licenseKey);
        
        if (result.success) {
             // FIX: Explicitly go to Dashboard on success
             navigate('/');
        } else {
             setError(result.message);
             setIsVerifying(false);
        }
    }, 1500); 
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- BACKGROUND ANIMATION LAYERS --- */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.05]" 
               style={{ 
                   backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, 
                   backgroundSize: '40px 40px' 
               }}>
          </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="p-10 flex flex-col justify-between bg-gradient-to-br from-indigo-900/40 to-gray-900/40 border-r border-white/5">
            <div>
                <div className="flex items-center space-x-3 mb-8">
                    <Hexagon className="w-8 h-8 text-indigo-500" strokeWidth={2} />
                    <span className="text-xl font-bold text-white tracking-wide">EdgePredict</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    Professional <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Simulation Engine
                    </span>
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Access the industry-standard tool for Physics-Informed Neural Networks and Finite Element Analysis.
                </p>
            </div>
            
            <div className="mt-12 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    </div>
                    <span>Enterprise Grade Security</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-indigo-400" />
                    </div>
                    <span>Offline License Token</span>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="p-10 flex flex-col justify-center relative">
            
            {/* Loading Overlay */}
            {(loading || isVerifying) && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300">
                    <Loader className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <div className="text-center">
                        <h3 className="text-white font-medium text-lg">Authenticating</h3>
                        <p className="text-indigo-300/70 text-sm mt-1">Verifying cryptographic signature...</p>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Activate License</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your credentials to unlock the engine.</p>
            </div>

            <form onSubmit={handleActivation} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 bg-gray-950/50 border border-gray-700 rounded-lg py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                            placeholder="name@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">License Key</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            className="block w-full pl-10 bg-gray-950/50 border border-gray-700 rounded-lg py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono tracking-widest outline-none"
                            placeholder="XXXX-XXXX-XXXX"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
                        <div className="text-red-400 text-sm">{error}</div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || isVerifying}
                    className="w-full group relative flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all duration-200 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center">
                        Verify & Launch Engine <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </form>

            <div className="mt-8 flex justify-center">
                <p className="text-xs text-gray-600">
                    Machine ID: <span className="font-mono text-gray-500">HW-{Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;