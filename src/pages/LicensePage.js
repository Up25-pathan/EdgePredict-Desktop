import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../context/LicenseContext';
import Logo from '../components/common/Logo'; // Your new Logo component

// Simple SVG Icons for this page
const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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
        
        // Basic Client-Side Validation
        if (!licenseKey || licenseKey.length < 5) {
            setError("Please enter a valid license key format.");
            return;
        }

        setIsLoading(true);

        try {
            // CALL THE REAL BACKEND (via Context)
            const tier = await activate(licenseKey);
            
            // On Success
            setSuccess(true);
            setTimeout(() => {
                navigate('/'); // Redirect to Dashboard after 1.5s
            }, 1500);

        } catch (err) {
            // Show server error
            console.error("Activation Failed:", err);
            setError(typeof err === 'string' ? err : "Connection failed. Please check your internet.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            
            {/* MAIN CARD CONTAINER */}
            <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-700">
                
                {/* LEFT SIDE: Visual Branding */}
                <div className="md:w-5/12 bg-gradient-to-br from-indigo-900 to-gray-900 p-8 flex flex-col justify-between relative overflow-hidden">
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <Logo className="w-16 h-16 mb-6 shadow-lg shadow-indigo-500/20 rounded-xl" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">EdgePredict</h1>
                        <p className="text-indigo-200 mt-2 text-sm font-medium">Advanced Tool Wear Simulation & Forensics Platform</p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center text-gray-300 text-sm">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                                <LockIcon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span>Secure Node-Locked Activation</span>
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                                <KeyIcon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span>Instant Enterprise Validation</span>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 text-xs text-gray-500">
                        © 2026 EdgeNova Innovations. v1.0.2
                    </div>
                </div>

                {/* RIGHT SIDE: Interaction Form */}
                <div className="md:w-7/12 bg-gray-800 p-8 md:p-12 flex flex-col justify-center relative">
                    
                    {/* Success Overlay */}
                    {success ? (
                        <div className="absolute inset-0 bg-gray-800 z-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                <CheckCircleIcon className="w-12 h-12 text-white animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Activation Successful</h2>
                            <p className="text-gray-400 mt-2">Launching Workspace...</p>
                        </div>
                    ) : null}

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Product Activation</h2>
                        <p className="text-gray-400 text-sm mt-2">Enter the license key sent to your email to unlock the software.</p>
                    </div>

                    <form onSubmit={handleActivate} className="space-y-6">
                        
                        {/* License Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">License Key</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())} // Auto-uppercase
                                    placeholder="PRO-XXXX-XXXX-XXXX"
                                    className={`w-full bg-gray-900 border ${error ? 'border-red-500 animate-pulse' : 'border-gray-600 focus:border-indigo-500'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-lg tracking-wide transition-all`}
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-400 flex items-center animate-pulse">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                            ${isLoading ? 'cursor-wait' : ''}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validating Key...
                                </div>
                            ) : (
                                'ACTIVATE SOFTWARE'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 border-t border-gray-700 pt-6 flex justify-between text-sm">
                        <a href="https://omr-system.com/pricing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Purchase License
                        </a>
                        <a href="mailto:support@omr-system.com" className="text-gray-500 hover:text-gray-300 transition-colors">
                            Need Help?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LicensePage;