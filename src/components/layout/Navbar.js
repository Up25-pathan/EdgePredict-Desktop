import React from 'react';
import {
    Bell, Search, ChevronRight
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ pageTitle }) => {
    const { unreadCount, isOpen, setIsOpen } = useNotifications();

    return (
        <header className="h-14 bg-studio-panel/70 backdrop-blur border-b border-studio-border/60 flex items-center justify-between px-6 z-10 sticky top-0 shadow-soft">
            {/* Breadcrumb / Title */}
            <div className="flex items-center text-sm">
                <span className="text-studio-text-muted font-medium">Project</span>
                <ChevronRight className="w-4 h-4 text-studio-text-dim mx-1" />
                <h1 className="text-studio-text-main font-semibold font-display">
                    {pageTitle}
                </h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-studio-surface/70 border border-studio-border/70 rounded-lg px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-studio-primary/20 transition-all">
                    <Search className="w-4 h-4 text-studio-text-dim mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm text-studio-text-main placeholder-studio-text-dim w-full"
                    />
                </div>

                <div className="h-4 w-px bg-studio-border/80 mx-2"></div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`transition-colors relative ${isOpen ? 'text-studio-primary' : 'text-studio-text-muted hover:text-studio-text-main'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-studio-danger text-[10px] font-bold text-white border-2 border-studio-panel">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <NotificationDropdown onClose={() => setIsOpen(false)} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
