import { readTextFile, writeTextFile, BaseDirectory, exists, mkdir, readDir, remove } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

const VAULT_DIR = 'vault';

// Helper to convert buffers
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

// Generate a key from a password
const getKeyFromPassword = async (password, salt) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: base64ToArrayBuffer(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

const VaultService = {
    /**
     * Initialize Vault Directory
     */
    init: async () => {
        try {
            const vaultExists = await exists(VAULT_DIR, { baseDir: BaseDirectory.AppData });
            if (!vaultExists) {
                await mkdir(VAULT_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
            }
            console.log("Vault Service initialized");
        } catch (error) {
            console.error("Failed to init vault:", error);
        }
    },

    /**
     * Encrypt data using a password
     * @param {Object} data - The JSON object to encrypt
     * @param {String} password - User password
     * @param {String} assetName - Name of the asset
     * @param {String} type - 'material' | 'tool' | 'recipe'
     */
    lockAsset: async (data, password, assetName, type, owner = "Unknown") => {
        try {
            // 1. Generate Salt and Key
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const saltBase64 = arrayBufferToBase64(salt);
            const key = await getKeyFromPassword(password, saltBase64);

            // 2. Encrypt Content
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const enc = new TextEncoder();
            const encodedData = enc.encode(JSON.stringify(data));

            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encodedData
            );

            // 3. Structure the Vault File
            const vaultFile = {
                id: crypto.randomUUID(),
                meta: {
                    name: assetName,
                    type: type, // 'material', 'tool'
                    owner: owner,
                    created: new Date().toISOString(),
                    salt: saltBase64,
                    iv: arrayBufferToBase64(iv)
                },
                content: arrayBufferToBase64(encryptedContent) // The encrypted blob
            };

            // 4. Save to Disk
            const filename = `${VAULT_DIR}/${vaultFile.id}.epv`;
            await writeTextFile(filename, JSON.stringify(vaultFile, null, 2), { baseDir: BaseDirectory.AppData });

            return vaultFile.id;
        } catch (err) {
            console.error("Encryption failed:", err);
            throw err;
        }
    },

    /**
     * Decrypt data using a password
     * @param {String} assetId - ID of the vault file
     * @param {String} password - User password
     */
    unlockAsset: async (assetId, password) => {
        try {
            // 1. Read File
            const filename = `${VAULT_DIR}/${assetId}.epv`;
            const fileContent = await readTextFile(filename, { baseDir: BaseDirectory.AppData });
            const vaultFile = JSON.parse(fileContent);

            // 2. Re-derive Key
            const key = await getKeyFromPassword(password, vaultFile.meta.salt);

            // 3. Decrypt
            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: base64ToArrayBuffer(vaultFile.meta.iv) },
                key,
                base64ToArrayBuffer(vaultFile.content)
            );

            const dec = new TextDecoder();
            return JSON.parse(dec.decode(decryptedContent));

        } catch (err) {
            console.error("Decryption failed (Password might be wrong):", err);
            throw new Error("Invalid Password or Corrupted File");
        }
    },

    /**
     * List all assets in the vault (Metadata only)
     */
    listAssets: async () => {
        try {
            const entries = await readDir(VAULT_DIR, { baseDir: BaseDirectory.AppData });
            const assets = [];

            for (const entry of entries) {
                if (entry.name.endsWith('.epv')) {
                    try {
                        const content = await readTextFile(`${VAULT_DIR}/${entry.name}`, { baseDir: BaseDirectory.AppData });
                        const json = JSON.parse(content);
                        assets.push({
                            id: json.id,
                            ...json.meta
                        });
                    } catch (e) {
                        console.warn("Skipping corrupted vault file:", entry.name);
                    }
                }
            }
            return assets;
        } catch (err) {
            console.error("Failed to list vault assets:", err);
            return [];
        }
    },

    /**
     * Delete an asset from the vault
     */
    deleteAsset: async (assetId) => {
        try {
            await remove(`${VAULT_DIR}/${assetId}.epv`, { baseDir: BaseDirectory.AppData });
        } catch (err) {
            console.error("Failed to delete asset", err);
        }
    }
};

export default VaultService;
