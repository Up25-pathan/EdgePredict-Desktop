import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    PlusIcon, DocumentReportIcon, CogIcon, ChartBarIcon, LibraryIcon, ToolIcon, Hexagon 
} from '../../assets/icons';
import { useLicense } from '../../context/LicenseContext'; // CHANGED
import Modal from '../common/Modal';
import Button from '../common/Button';

const Sidebar = () => {
    const { deactivate } = useLicense(); // CHANGED
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleDeactivate = () => {
        deactivate();
        setIsLogoutModalOpen(false);
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center p-3 text-base rounded-lg transition-colors duration-200 group ${
            isActive
                ? 'bg-hud-primary text-white shadow-lg shadow-hud-glow' 
                : 'text-hud-text-secondary hover:bg-hud-border hover:text-hud-text-primary'
        }`;

    return (
        <>
            <div className="w-64 bg-hud-surface border-r border-hud-border flex flex-col p-4 shrink-0">
                <div className="flex items-center mb-8 shrink-0">
                    <div className="w-10 h-10 mr-3 text-hud-primary flex items-center justify-center">
                         <Hexagon className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-hud-text-primary tracking-tight">EdgePredict</h1>
                </div>

                <nav className="flex-1 space-y-1">
                    <NavLink to="/" className={navLinkClasses}>
                        <ChartBarIcon className="w-6 h-6" />
                        <span className="ml-3">Dashboard</span>
                    </NavLink>

                    <div className="pt-4 pb-2">
                        <h3 className="px-3 text-xs font-semibold text-hud-text-secondary uppercase tracking-wider">Libraries</h3>
                    </div>
                    <NavLink to="/library/materials" className={navLinkClasses}>
                        <LibraryIcon className="w-6 h-6" />
                        <span className="ml-3">Materials</span>
                    </NavLink>
                    <NavLink to="/library/tools" className={navLinkClasses}>
                        <ToolIcon className="w-6 h-6" />
                        <span className="ml-3">Tools</span>
                    </NavLink>

                    <div className="pt-4 pb-2">
                        <h3 className="px-3 text-xs font-semibold text-hud-text-secondary uppercase tracking-wider">Manage</h3>
                    </div>
                    <NavLink to="/reports" className={navLinkClasses}>
                        <DocumentReportIcon className="w-6 h-6" />
                        <span className="ml-3">Reports</span>
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClasses}>
                        <CogIcon className="w-6 h-6" />
                        <span className="ml-3">Settings</span>
                    </NavLink>
                </nav>

                <div className="mt-auto space-y-2">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)} 
                        className="flex items-center justify-center w-full p-3 text-base text-hud-text-secondary rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                    >
                        <span className="ml-2 font-bold">Deactivate License</span>
                    </button>
                    
                    <NavLink
                        to="/simulation/new"
                        className="flex items-center justify-center w-full p-3 text-base text-white bg-hud-primary rounded-lg hover:bg-hud-primary-hover transition-all duration-200 shadow-lg shadow-hud-glow hover:scale-[1.02] active:scale-95"
                    >
                        <PlusIcon className="w-6 h-6" />
                        <span className="ml-2 font-bold">New Simulation</span>
                    </NavLink>
                </div>
            </div>

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