import api from '../utils/axios';
import useAuthStore from '../store/authStore';

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Token is already saved by authService, just return response
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Token is already saved by authService, just return response
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state even if API call fails
      const { logout } = useAuthStore.getState();
      logout();
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};
