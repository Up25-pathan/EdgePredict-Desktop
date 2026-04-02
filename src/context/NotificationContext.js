import React, { createContext, useContext, useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Poll Server for Notifications
    const fetchNotifications = async () => {
        try {
            // Replace with your actual server URL
            const response = await fetch('https://omr-server-fww3.onrender.com/api/notifications');
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.notifications)) {
                    // Merge with existing ensuring no duplicates if you have IDs
                    // For now, simple replace or append logic
                    // We'll trust server to send relevant list

                    // Simple logic: filter out ones user already cleared locally? 
                    // For MVP: just show what server sends
                    const newNotes = data.notifications.map(n => ({
                        ...n,
                        read: false, // defaulted to unread for new fetches
                        source: 'server'
                    }));

                    // In a real app, you'd track 'read' state by ID in localStorage or DB
                    setNotifications(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = newNotes.filter(n => !existingIds.has(n.id));
                        return [...uniqueNew, ...prev];
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Check for App Updates
    const checkUpdate = async () => {
        try {
            const update = await check();
            if (update?.available) {
                const updateNote = {
                    id: `update-${update.version}`,
                    type: 'UPDATE',
                    title: 'New Update Available',
                    message: `Version ${update.version} is ready to install.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    action: 'UPDATE', // Special action trigger
                    manifest: update
                };

                setNotifications(prev => {
                    if (prev.some(n => n.id === updateNote.id)) return prev;
                    return [updateNote, ...prev];
                });
                toast.success(`Update v${update.version} available!`);
            }
        } catch (error) {
            console.error("Update check failed", error);
        }
    };

    // Actions
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Effects
    useEffect(() => {
        // Initial Fetch
        fetchNotifications();
        checkUpdate();

        // Poll every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Update Badge Count
    useEffect(() => {
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
    }, [notifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isOpen,
            setIsOpen,
            markAsRead,
            markAllAsRead,
            clearNotification,
            checkUpdate
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
