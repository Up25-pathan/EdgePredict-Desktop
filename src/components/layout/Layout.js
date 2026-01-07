import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();

    const getPageTitle = (pathname) => {
        if (pathname.startsWith('/simulations/live/')) return 'Simulation Lab: Live Analysis';
        if (pathname.startsWith('/simulations/')) return 'Simulation Results';
        const cleanPath = pathname.split('/').pop();
        switch (cleanPath) {
            case '': return 'Dashboard';
            case 'dashboard': return 'Dashboard';
            case 'simulation-setup': return 'New Simulation Setup';
            case 'reports': return 'Reports';
            case 'settings': return 'Settings';
            case 'materials': return 'Material Library';
            case 'tools': return 'Tool Library';
            // Admin Routes
            case 'users': return 'User Management';
            case 'requests': return 'Access Requests';
            default: return 'EdgePredict';
        }
    };
    
    const pageTitle = getPageTitle(location.pathname);

    return (
        // FIX: Changed 'bg-hud-bg' to 'bg-transparent' so the background layers are visible
        <div className="flex h-screen font-sans bg-transparent text-hud-text-primary relative overflow-hidden">
             {/* --- BACKGROUND LAYERS --- */}
            <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden -z-10 pointer-events-none">
                
                {/* Layer 1: Vivid Glowing Orbs (Bottom) */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                
                {/* Layer 2: Noise Texture (Subtle texture) */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                {/* Layer 3: Technical Grid Pattern (Top of background) */}
                <div 
                    className="absolute inset-0" 
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
                                          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)', 
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                    }}
                ></div>
            </div>

            {/* Main Content */}
            <div className="flex w-full h-full z-10">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar pageTitle={pageTitle} />
                    <main 
                        key={location.pathname} 
                        className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative animate-fade-in"
                    >
                        <Outlet /> 
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;