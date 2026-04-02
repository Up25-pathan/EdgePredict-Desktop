import { getVersion } from '@tauri-apps/api/app';
import { type, arch, platform } from '@tauri-apps/plugin-os';

const API_URL = 'https://omr-server-fww3.onrender.com/api/support';

export const SupportService = {
    /**
     * Gather System Information for debugging
     */
    getSystemInfo: async () => {
        try {
            const appVersion = await getVersion();
            const osType = await type();
            const osArch = await arch();
            const osPlatform = await platform();

            return {
                appVersion,
                os: `${osType} (${osPlatform})`,
                arch: osArch,
                userAgent: navigator.userAgent
            };
        } catch (error) {
            console.warn("Could not fetch system info (likely running in browser mode)", error);
            return {
                appVersion: 'Web-Dev-Mode',
                os: 'Unknown',
                arch: 'Unknown',
                userAgent: navigator.userAgent
            };
        }
    },

    /**
     * Submit a new support ticket
     */
    submitTicket: async (ticketData) => {
        try {
            const systemInfo = await SupportService.getSystemInfo();

            const payload = {
                ...ticketData,
                system_info: JSON.stringify(systemInfo),
                timestamp: new Date().toISOString()
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Auth header if user is logged in (optional but recommended)
                    // 'Authorization': `Bearer ${localStorage.getItem('edgepredict_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit ticket');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
};
