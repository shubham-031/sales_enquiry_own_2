import axios from '../utils/axios';

export const dashboardService = {
  getStats: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/stats', { params });
      console.log('✅ Stats loaded:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Stats error:', error);
      throw error;
    }
  },

  getTeamPerformance: async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/team-performance', { params });
      console.log('✅ Team performance loaded:', {
        sales: response.data.data.salesTeam?.length || 0,
        rnd: response.data.data.rndTeam?.length || 0
      });
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

  // Member monthly performance with detailed logging
  getMemberMonthlyPerformance: async (memberName, params = {}) => {
    try {
      console.log('🔍 Fetching monthly data for:', memberName);
      console.log('📅 With params:', params);
      
      const encodedName = encodeURIComponent(memberName);
      const url = `/dashboard/member-monthly/${encodedName}`;
      
      console.log('🌐 Request URL:', url);
      
      const response = await axios.get(url, { params });
      
      console.log('✅ Member monthly data received:', {
        member: response.data.data.memberName,
        totalInDB: response.data.data.totalEnquiriesInDB,
        monthsFound: response.data.data.monthlyPerformance?.length || 0,
        summary: response.data.data.summary
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Member monthly performance error:', error.response?.data || error.message);
      throw error;
    }
  },
};