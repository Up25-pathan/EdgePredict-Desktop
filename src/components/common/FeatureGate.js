import React from 'react';
import { useLicense } from '../../context/LicenseContext';
import { Link } from 'react-router-dom';

const FeatureGate = ({ feature, children, showLock = false }) => {
    const { canAccess } = useLicense();

    // 1. If user has permission, just render the content normally
    if (canAccess(feature)) {
        return children; 
    }

    // 2. If user is LOCKED out (Basic Tier):
    if (showLock) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-gray-700 bg-gray-900/40">
                {/* A. The Blurred Content Behind */}
                <div className="filter blur-sm opacity-40 pointer-events-none select-none" aria-hidden="true">
                    {children}
                </div>

                {/* B. The Lock Overlay */}
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-600 shadow-2xl text-center max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
                        
                        {/* Icon */}
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        {/* Text */}
                        <h3 className="text-white font-bold text-lg tracking-tight">Enterprise Feature</h3>
                        <p className="text-gray-400 text-sm mt-2 mb-4 leading-relaxed">
                            Upgrade to <span className="text-indigo-400 font-semibold">Pro</span> to unlock AI Forensics and Advanced Reporting.
                        </p>

                        {/* Action Button */}
                        <Link 
                            to="/settings" 
                            className="block w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-bold text-sm transition-all shadow-md transform hover:scale-[1.02]"
                        >
                            Upgrade License
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. If access denied and we don't want to show a lock (just hide it)
    return null; 
};

export default FeatureGate;