import api from '../utils/axios';

export const dashboardService = {
  // Get dashboard stats
  getStats: async (params = {}) => {
    const response = await api.get('/dashboard/stats', { params });
    return response.data.data; // Return just the data
  },

  // Get team performance
  getTeamPerformance: async (params = {}) => {
    const response = await api.get('/dashboard/team-performance', { params });
    return response.data.data; // Return just the data
  },

  // Get market analysis
  getMarketAnalysis: async (params = {}) => {
    const response = await api.get('/dashboard/market-analysis', { params });
    return response.data.data; // Return just the data
  },

  // Get trend analysis
  getTrendAnalysis: async (params = {}) => {
    const response = await api.get('/dashboard/trend-analysis', { params });
    return response.data.data; // Return just the data
  },

  // Get activity distribution
  getActivityDistribution: async (params = {}) => {
    const response = await api.get('/dashboard/activity-distribution', { params });
    return response.data.data;
  },

  // Get product distribution
  getProductDistribution: async (params = {}) => {
    const response = await api.get('/dashboard/product-distribution', { params });
    return response.data.data;
  },

  // Get fulfillment analysis
  getFulfillmentAnalysis: async (params = {}) => {
    const response = await api.get('/dashboard/fulfillment-analysis', { params });
    return response.data.data;
  },
};
