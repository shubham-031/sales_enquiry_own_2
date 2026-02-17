import axios from '../utils/axios';

export const dashboardService = {
  getStats: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/stats', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Stats error:', error);
      throw error;
    }
  },

  getTeamPerformance: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/team-performance', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Team performance error:', error);
      throw error;
    }
  },

  getMarketAnalysis: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/market-analysis', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Market analysis error:', error);
      throw error;
    }
  },

  getTrendAnalysis: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/trend-analysis', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Trend analysis error:', error);
      throw error;
    }
  },

  getActivityDistribution: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/activity-distribution', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Activity distribution error:', error);
      throw error;
    }
  },

  getProductDistribution: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/product-distribution', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Product distribution error:', error);
      throw error;
    }
  },

  getFulfillmentAnalysis: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/fulfillment-analysis', { params });
      return response.data.data;
    } catch (error) {
      console.error('❌ Fulfillment analysis error:', error);
      throw error;
    }
  },

  // Member monthly performance
  getMemberMonthlyPerformance: async (memberName, params = {}) => {
    try {
      const encodedName = encodeURIComponent(memberName);
      const url = `/dashboard/member-monthly/${encodedName}`;
      
      const response = await axios.get(url, { params });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Member monthly performance error:', error.response?.data || error.message);
      throw error;
    }
  },
};