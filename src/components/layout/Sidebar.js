import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// 👇 Ensure you created the Logo.js file in components/common/
import Logo from '../common/Logo'; 
import { 
    PlusIcon, DocumentReportIcon, CogIcon, ChartBarIcon, LibraryIcon, ToolIcon 
} from '../../assets/icons';
import { useLicense } from '../../context/LicenseContext'; 
import Modal from '../common/Modal';
import Button from '../common/Button';

// --- CUSTOM ICON: AI MICROCHIP ---
const AIIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const Sidebar = () => {
    const { deactivate } = useLicense(); 
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleDeactivate = () => {
        deactivate();
        setIsLogoutModalOpen(false);
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center p-3 text-base rounded-lg transition-all duration-200 group relative ${
            isActive
                ? 'bg-hud-primary text-white shadow-lg shadow-hud-glow' 
                : 'text-hud-text-secondary hover:bg-hud-border hover:text-hud-text-primary'
        }`;

    return (
        <>
            <div className="w-64 bg-hud-surface border-r border-hud-border flex flex-col p-4 shrink-0 z-50">
                {/* --- HEADER / LOGO --- */}
                <div className="flex items-center mb-8 shrink-0 pl-2">
                    <div className="mr-3">
                         {/* The New Logo Component */}
                         <Logo className="w-10 h-10 shadow-lg shadow-cyan-500/20 rounded-lg" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-hud-text-primary tracking-tight leading-none">EdgePredict</h1>
                        <span className="text-[10px] text-hud-text-secondary tracking-widest uppercase opacity-70">Desktop v1.0</span>
                    </div>
                </div>

                {/* --- NAVIGATION --- */}
                <nav className="flex-1 space-y-1">
                    <NavLink to="/" className={navLinkClasses}>
                        <ChartBarIcon className="w-6 h-6" />
                        <span className="ml-3 font-medium">Dashboard</span>
                    </NavLink>

                    {/* ✨ AI ANALYSIS LAB ✨ */}
                    <NavLink to="/ai-lab" className={navLinkClasses}>
                        <AIIcon className="w-6 h-6" /> 
                        <span className="ml-3 font-medium">AI Analysis Lab</span>
                        {/* Status Dot */}
                        <span className="absolute right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-sm shadow-indigo-500"></span>
                    </NavLink>

                    <div className="pt-6 pb-2">
                        <h3 className="px-3 text-[10px] font-bold text-hud-text-secondary uppercase tracking-widest opacity-80">Libraries</h3>
                    </div>
                    <NavLink to="/library/materials" className={navLinkClasses}>
                        <LibraryIcon className="w-6 h-6" />
                        <span className="ml-3 font-medium">Materials</span>
                    </NavLink>
                    <NavLink to="/library/tools" className={navLinkClasses}>
                        <ToolIcon className="w-6 h-6" />
                        <span className="ml-3 font-medium">Tools</span>
                    </NavLink>

                    <div className="pt-6 pb-2">
                        <h3 className="px-3 text-[10px] font-bold text-hud-text-secondary uppercase tracking-widest opacity-80">Manage</h3>
                    </div>
                    <NavLink to="/reports" className={navLinkClasses}>
                        <DocumentReportIcon className="w-6 h-6" />
                        <span className="ml-3 font-medium">Reports</span>
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClasses}>
                        <CogIcon className="w-6 h-6" />
                        <span className="ml-3 font-medium">Settings</span>
                    </NavLink>
                </nav>

                {/* --- FOOTER --- */}
                <div className="mt-auto space-y-3 pt-6 border-t border-hud-border/50">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)} 
                        className="flex items-center justify-center w-full p-2 text-sm text-hud-text-secondary rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                    >
                        <span className="font-semibold">Deactivate License</span>
                    </button>
                    
                    <NavLink
                        to="/simulation-setup" 
                        className="flex items-center justify-center w-full p-3 text-base text-white bg-hud-primary rounded-lg hover:bg-hud-primary-hover transition-all duration-200 shadow-lg shadow-hud-glow hover:scale-[1.02] active:scale-95 group"
                    >
                        <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        <span className="ml-2 font-bold tracking-wide">New Simulation</span>
                    </NavLink>
                </div>
            </div>

            {/* --- DEACTIVATE MODAL --- */}
            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}>
                <h2 className="text-xl font-bold text-hud-text-primary mb-4">Deactivate License?</h2>
                <p className="text-hud-text-secondary mb-6">This will remove the license from this machine. You will need to enter the key again to use the software.</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeactivate}>
                        Deactivate
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Sidebar;