import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();

    const getPageTitle = (pathname) => {
        if (pathname.startsWith('/simulations/live/')) return 'Live Analysis';
        if (pathname.startsWith('/simulations/')) return 'Results Console';
        const cleanPath = pathname.split('/').pop();
        switch (cleanPath) {
            case '': return 'Command Center';
            case 'dashboard': return 'Command Center';
            case 'simulation-setup': return 'New Simulation';
            case 'reports': return 'Report Vault';
            case 'settings': return 'System Configuration';
            case 'materials': return 'Material Database';
            case 'tools': return 'Tool Library';
            case 'ai-lab': return 'AI Forensics Lab';
            case 'ip-vault': return 'IP Secure Vault';
            default: return 'EdgePredict';
        }
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="relative flex h-screen w-screen text-studio-text-main overflow-hidden font-sans app-ambient">
            {/* Ambient Background */}
            <div className="absolute inset-0 app-dots bg-[length:22px_22px] opacity-[0.35] pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-grid-pattern bg-[length:64px_64px] opacity-[0.06] pointer-events-none z-0"></div>
            <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-studio-primary/30 via-studio-accent/10 to-transparent blur-3xl animate-float z-0"></div>
            <div
                className="absolute -bottom-24 -right-16 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-studio-accent/20 via-studio-primary/10 to-transparent blur-3xl animate-float z-0"
                style={{ animationDelay: '2s' }}
            ></div>

            {/* Main Flex Layout */}
            <div className="relative z-10 flex w-full h-full overflow-hidden">
                <Sidebar />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar pageTitle={pageTitle} />

                    <main className="flex-1 overflow-y-auto p-6 relative min-h-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
