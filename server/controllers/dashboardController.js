import Enquiry from '../models/Enquiry.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.enquiryDate = {};
      if (startDate) dateFilter.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleFilter = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleFilter.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedFilter = { ...dateFilter, ...roleFilter };
    
    const totalEnquiries = await Enquiry.countDocuments(combinedFilter);
    const openEnquiries = await Enquiry.countDocuments({ ...combinedFilter, status: 'Open' });
    const closedEnquiries = await Enquiry.countDocuments({ ...combinedFilter, status: 'Closed' });
    const quotedEnquiries = await Enquiry.countDocuments({ ...combinedFilter, activity: 'Quoted' });
    const regrettedEnquiries = await Enquiry.countDocuments({ ...combinedFilter, activity: 'Regretted' });

    // Calculate closure rate
    const closureRate = totalEnquiries > 0 ? ((closedEnquiries / totalEnquiries) * 100).toFixed(2) : 0;

    // Calculate average fulfillment time
    const enquiriesWithFulfillment = await Enquiry.find({ 
      ...combinedFilter,
      fulfillmentTime: { $exists: true, $ne: null } 
    });
    const avgFulfillmentTime = enquiriesWithFulfillment.length > 0
      ? (enquiriesWithFulfillment.reduce((sum, enq) => sum + enq.fulfillmentTime, 0) / enquiriesWithFulfillment.length).toFixed(2)
      : 0;

    // Market distribution
    const domesticCount = await Enquiry.countDocuments({ ...combinedFilter, marketType: 'Domestic' });
    const exportCount = await Enquiry.countDocuments({ ...combinedFilter, marketType: 'Export' });

    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        openEnquiries,
        closedEnquiries,
        quotedEnquiries,
        regrettedEnquiries,
        closureRate: parseFloat(closureRate),
        avgFulfillmentTime: parseFloat(avgFulfillmentTime),
        marketDistribution: {
          domestic: domesticCount,
          export: exportCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team performance
// @route   GET /api/dashboard/team-performance
// @access  Private
export const getTeamPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleMatch = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedMatch = { ...dateMatch, ...roleMatch };
    
    const salesPerformance = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: '$salesRepName',
          totalEnquiries: { $sum: 1 },
          quotedEnquiries: {
            $sum: { $cond: [{ $eq: ['$activity', 'Quoted'] }, 1, 0] },
          },
          closedEnquiries: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalEnquiries: -1 } },
    ]);

    const rndPerformance = await Enquiry.aggregate([
      { $match: { rndHandlerName: { $exists: true, $ne: null }, ...combinedMatch } },
      {
        $group: {
          _id: '$rndHandlerName',
          totalEnquiries: { $sum: 1 },
          avgFulfillmentTime: { $avg: '$fulfillmentTime' },
        },
      },
      { $sort: { totalEnquiries: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        salesTeam: salesPerformance,
        rndTeam: rndPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get market analysis
// @route   GET /api/dashboard/market-analysis
// @access  Private
export const getMarketAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleMatch = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedMatch = { ...dateMatch, ...roleMatch };
    
    const marketAnalysis = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: {
            marketType: '$marketType',
            productType: '$productType',
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const activityByMarket = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: {
            marketType: '$marketType',
            activity: '$activity',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Top products analysis
    const topProducts = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: '$productType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        marketAnalysis,
        activityByMarket,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity distribution
// @route   GET /api/dashboard/activity-distribution
// @access  Private
export const getActivityDistribution = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleMatch = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedMatch = { ...dateMatch, ...roleMatch };
    
    const activityDistribution = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: '$activity',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: activityDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product type distribution
// @route   GET /api/dashboard/product-distribution
// @access  Private
export const getProductDistribution = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleMatch = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedMatch = { ...dateMatch, ...roleMatch };
    
    const productDistribution = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: '$productType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: productDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fulfillment time analysis
// @route   GET /api/dashboard/fulfillment-analysis
// @access  Private
export const getFulfillmentAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {
      fulfillmentTime: { $exists: true, $ne: null, $gte: 0 },
    };
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      dateMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const fulfillmentData = await Enquiry.aggregate([
      {
        $match: dateMatch,
      },
      {
        $bucket: {
          groupBy: '$fulfillmentTime',
          boundaries: [0, 1, 3, 5, 10, 1000],
          default: '10+',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: fulfillmentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trend analysis
// @route   GET /api/dashboard/trend-analysis
// @access  Private
export const getTrendAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    
    // Build date filter
    const dateMatch = {};
    if (startDate || endDate) {
      dateMatch.enquiryDate = {};
      if (startDate) dateMatch.enquiryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateMatch.enquiryDate.$lte = end;
      }
    }
    
    // Build role filter
    let roleMatch = {};
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      roleMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    
    const combinedMatch = { ...dateMatch, ...roleMatch };
    
    const monthlyTrends = await Enquiry.aggregate([
      ...(Object.keys(combinedMatch).length > 0 ? [{ $match: combinedMatch }] : []),
      {
        $group: {
          _id: {
            year: { $year: '$enquiryDate' },
            month: { $month: '$enquiryDate' },
          },
          totalEnquiries: { $sum: 1 },
          quoted: {
            $sum: { $cond: [{ $eq: ['$activity', 'Quoted'] }, 1, 0] },
          },
          regretted: {
            $sum: { $cond: [{ $eq: ['$activity', 'Regretted'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: monthlyTrends,
    });
  } catch (error) {
    next(error);
  }
};
