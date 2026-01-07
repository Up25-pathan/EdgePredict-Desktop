import React from 'react';
import { BellIcon, SearchIcon } from '../../assets/icons';
import { useLicense } from '../../context/LicenseContext'; // CHANGED

const Navbar = () => {
    const { licenseDetails } = useLicense(); // CHANGED

    // Get initials from license user name
    const getInitials = () => {
        if (licenseDetails && licenseDetails.user) {
            return licenseDetails.user.substring(0, 2).toUpperCase();
        }
        return "EP";
    };

    return (
        <header className="bg-hud-surface border-b border-hud-border h-16 flex items-center justify-between px-6 shrink-0">
            <div className="flex-1 max-w-2xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-hud-text-secondary" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-hud-border rounded-md leading-5 bg-hud-bg placeholder-hud-text-secondary focus:outline-none focus:bg-hud-surface focus:border-hud-primary focus:ring-1 focus:ring-hud-primary sm:text-sm transition-colors duration-200 text-hud-text-primary"
                        placeholder="Search simulations..."
                    />
                </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <button className="p-1 rounded-full text-hud-text-secondary hover:text-hud-primary focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="relative">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-hud-primary flex items-center justify-center text-sm font-bold text-white shadow-sm shadow-hud-glow">
                            {getInitials()}
                        </div>
                        <span className="ml-3 text-sm font-medium text-hud-text-primary hidden md:block">
                            {licenseDetails?.user || 'Unlicensed'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;