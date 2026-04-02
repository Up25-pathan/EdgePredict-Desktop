import { type, arch, version, hostname } from '@tauri-apps/plugin-os';

/**
 * Generates a unique fingerprint for this machine.
 * In a pure Tauri environment, we combine OS info with a stored UUID.
 */
export const getMachineId = async () => {
  try {
    // 1. Get OS Identifiers
    const osType = await type();
    const osArch = await arch();
    const host = await hostname();
    
    // 2. Check for an existing unique install ID
    let installId = localStorage.getItem('omr_install_id');
    if (!installId) {
        installId = crypto.randomUUID();
        localStorage.setItem('omr_install_id', installId);
    }

    // 3. Create the Fingerprint (e.g., "Windows_NT-x86_64-MyPC-UUID")
    // This satisfies the backend requirement for a unique string
    const fingerprint = `${osType}-${osArch}-${host}-${installId}`;
    
    console.log("Generated Hardware ID:", fingerprint);
    return fingerprint;
  } catch (error) {
    console.warn("Failed to generate HWID, using fallback", error);
    return "UNKNOWN-DEVICE-" + crypto.randomUUID();
  }
};

export const getDeviceName = async () => {
    try {
        return await hostname();
    } catch {
        return "Unknown Desktop PC";
    }
};