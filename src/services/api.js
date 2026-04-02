import axios from 'axios';
// FIX: Use the new plugin import for Shell execution
import { Command } from '@tauri-apps/plugin-shell'; 

// Use environment variable if available, otherwise fallback to localhost for dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // --- Auth ---
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getCurrentUser: () => {
    return apiClient.get('/users/me/');
  },

  // --- Access Requests ---
  submitAccessRequest: (requestData) => {
    return apiClient.post('/request-access', requestData);
  },
  adminGetAccessRequests: () => {
    return apiClient.get('/admin/access-requests');
  },
  adminUpdateAccessRequestStatus: (requestId, status) => {
    return apiClient.patch(`/admin/access-requests/${requestId}?status=${status}`);
  },

  // --- Admin Functions ---
  adminGetUsers: () => {
    return apiClient.get('/admin/users/');
  },
  adminCreateUser: (userData) => {
    return apiClient.post('/admin/users/', userData);
  },
  adminUpdateUser: (userId, updateData) => {
    return apiClient.patch(`/admin/users/${userId}`, updateData);
  },
  adminResetUserPassword: (userId, newPassword) => {
    return apiClient.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
  },
  adminDeleteUser: (userId) => {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  // --- Simulations ---
  createSimulation: (simulationData) => {
      return apiClient.post('/simulations/', simulationData);
  },
  getSimulations: () => {
      return apiClient.get('/simulations/');
  },
  getSimulationById: (id) => {
      return apiClient.get(`/simulations/${id}`);
  },
  deleteSimulation: (id) => {
      return apiClient.delete(`/simulations/${id}`);
  },
  generateReport: (simulationId) => {
      return apiClient.post(`/simulations/${simulationId}/analyze`);
  },

  // --- Materials ---
  getMaterials: () => {
    return apiClient.get('/materials/');
  },
  createMaterial: (materialData) => {
    return apiClient.post('/materials/', materialData);
  },
  deleteMaterial: (materialId) => {
    return apiClient.delete(`/materials/${materialId}`);
  },

  // --- Tools ---
  getTools: () => {
    return apiClient.get('/tools/');
  },
  createTool: (formData) => {
    return apiClient.post('/tools/', formData);
  },
  getToolFileById: (toolId) => {
    return apiClient.get(`/tool-file/${toolId}`, {
      responseType: 'blob',
    });
  },
  deleteTool: (toolId) => {
    return apiClient.delete(`/tools/${toolId}`);
  },

  // --- NEW: AI FORENSICS LAB (Sidecar) ---
  /**
   * Executes the local Python binary to analyze a tool image.
   * @param {string} imagePath - Full local path to the image file
   */
  analyzeDefectLocal: async (imagePath) => {
    console.log("Launching AI Sidecar for:", imagePath);
    
    // 'binaries/ai-lab' must match the externalBin entry in tauri.conf.json
    // The Command.sidecar function handles the architecture suffix automatically
    const command = Command.sidecar('binaries/ai-lab', [
      '--image', imagePath
    ]);

    try {
      const output = await command.execute();
      
      // Log stderr if there are warnings (but don't fail unless stdout is empty)
      if (output.stderr) {
        console.warn("AI Sidecar Stderr:", output.stderr);
      }

      if (output.stdout) {
        return JSON.parse(output.stdout);
      } else {
        throw new Error("No output received from AI Engine");
      }
    } catch (error) {
      console.error("AI Lab Execution Failed:", error);
      throw error;
    }
  },
};

export default api;