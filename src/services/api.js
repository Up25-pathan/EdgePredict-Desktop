import axios from 'axios';

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
  // --- Auth (Unchanged) ---
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

  // --- Access Requests (Unchanged) ---
  submitAccessRequest: (requestData) => {
    return apiClient.post('/request-access', requestData);
  },
  adminGetAccessRequests: () => {
    return apiClient.get('/admin/access-requests');
  },
  adminUpdateAccessRequestStatus: (requestId, status) => {
    return apiClient.patch(`/admin/access-requests/${requestId}?status=${status}`);
  },

  // --- Admin Functions (Unchanged) ---
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

  // --- Simulations (UPGRADED) ---
  
  /**
   * Creates a simulation by sending the "smart" JSON payload.
   * @param {object} simulationData - The JSON object matching schemas.SimulationCreate
   */
  createSimulation: (simulationData) => {
      // --- UPGRADED: We no longer send FormData. We send the raw JSON object. ---
      // The 'Content-Type: application/json' is now default.
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

  // --- Materials (Unchanged) ---
  // This already sends JSON, which is what our new backend expects.
  getMaterials: () => {
    return apiClient.get('/materials/');
  },
  createMaterial: (materialData) => {
    return apiClient.post('/materials/', materialData);
  },
  deleteMaterial: (materialId) => {
    return apiClient.delete(`/materials/${materialId}`);
  },

  // --- Tools (Unchanged) ---
  // This already correctly sends FormData to the /tools/ endpoint.
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
};

export default api;