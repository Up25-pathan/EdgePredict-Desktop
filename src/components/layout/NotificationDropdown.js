import React from 'react';
import {
    Bell, Check, Trash2, Info, AlertTriangle, Download, X
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../ui/Button';

const NotificationDropdown = ({ onClose }) => {
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
        checkUpdate
    } = useNotifications();

    const handleAction = (note) => {
        if (note.action === 'UPDATE') {
            // In a real app, this might open the Settings modal
            // For now, re-trigger check to show toast or navigate
            checkUpdate();
            // Or better: navigate to settings
            window.location.href = '/settings';
        }
        markAsRead(note.id);
    };

    return (
        <div className="absolute right-0 top-12 w-80 bg-studio-panel border border-studio-border rounded-xl shadow-xl z-50 animate-fadeIn">
            <div className="flex items-center justify-between p-3 border-b border-studio-border/50">
                <h3 className="text-sm font-semibold text-studio-text-main">Notifications</h3>
                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="text-xs text-studio-primary hover:text-studio-primary-hover transition-colors"
                        title="Mark all as read"
                    >
                        Mark read
                    </button>
                </div>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-studio-text-muted text-sm flex flex-col items-center">
                        <Bell className="w-8 h-8 opacity-20 mb-2" />
                        No new notifications
                    </div>
                ) : (
                    notifications.map(note => (
                        <div
                            key={note.id}
                            className={`p-3 border-b border-studio-border/30 hover:bg-studio-surface/40 transition-colors relative group ${!note.read ? 'bg-studio-surface/20' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                                    ${note.type === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                                        note.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-studio-surface text-studio-text-dim'}`}
                                >
                                    {note.type === 'UPDATE' ? <Download className="w-4 h-4" /> :
                                        note.type === 'WARNING' ? <AlertTriangle className="w-4 h-4" /> :
                                            <Info className="w-4 h-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-studio-text-main leading-tight mb-0.5">
                                        {note.title}
                                    </h4>
                                    <p className="text-xs text-studio-text-muted leading-relaxed mb-2">
                                        {note.message}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-studio-text-dim opacity-70">
                                            {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>

                                        {note.action && (
                                            <Button
                                                variant="secondary"
                                                size="xs"
                                                className="h-6 text-[10px] py-0 px-2"
                                                onClick={() => handleAction(note)}
                                            >
                                                {note.action === 'UPDATE' ? 'Update Now' : 'View'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); clearNotification(note.id); }}
                                    className="absolute top-2 right-2 p-1 text-studio-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {!note.read && (
                                <div className="absolute top-3 right-3 w-2 h-2 bg-studio-primary rounded-full animate-pulse pointer-events-none"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
