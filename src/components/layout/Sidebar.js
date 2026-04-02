
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Play, FileText, Settings,
    Database, Microscope, Shield, Wrench
} from 'lucide-react';
import { clsx } from 'clsx';
import { useLicense } from '../../context/LicenseContext';

const Sidebar = () => {
    const { licenseDetails, tier } = useLicense();
    const userName = licenseDetails?.user || 'Guest User';
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Play, label: 'Simulation', path: '/simulation-setup' },
        { icon: Microscope, label: 'Forensics', path: '/ai-lab' },
        { icon: Database, label: 'Materials', path: '/library/materials' },
        { icon: Wrench, label: 'Tooling', path: '/library/tools' },
        { icon: Shield, label: 'Vault', path: '/ip-vault' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-studio-panel/80 backdrop-blur border-r border-studio-border/60 shadow-card flex flex-col z-20">
            {/* Brand */}
            <div className="h-14 flex items-center px-5 border-b border-transparent">
                <div className="w-7 h-7 bg-gradient-to-br from-studio-primary to-studio-accent rounded-md mr-3 flex items-center justify-center text-white shadow-soft">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="text-studio-text-main font-bold tracking-tight font-display">EdgePredict</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-studio-surface/80 text-studio-primary shadow-soft ring-1 ring-studio-primary/20"
                                : "text-studio-text-muted hover:text-studio-text-main hover:bg-studio-surface/50"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx("w-4 h-4 mr-3 transition-colors", isActive ? "text-studio-primary" : "text-studio-text-dim")} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Info — from License */}
            <div className="p-4 border-t border-studio-border/60 bg-studio-panel/70">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-studio-primary/20 to-studio-accent/20 flex items-center justify-center text-xs font-bold text-studio-primary border border-studio-primary/20">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-studio-text-main truncate">{userName}</p>
                        <div className="flex items-center gap-1.5">
                            <span className={clsx(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                                tier === 'PRO'
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                    : 'bg-studio-canvas text-studio-text-dim border border-studio-border'
                            )}>
                                {tier || 'BASIC'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
