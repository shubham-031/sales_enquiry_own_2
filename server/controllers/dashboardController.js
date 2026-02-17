
import Enquiry from '../models/Enquiry.js';
import User from '../models/User.js';
// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
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
    const closureRate = totalEnquiries > 0 ? ((closedEnquiries / totalEnquiries) * 100).toFixed(2) : 0;
    const enquiriesWithFulfillment = await Enquiry.find({
      ...combinedFilter,
      fulfillmentTime: { $exists: true, $ne: null }
    });
    const avgFulfillmentTime = enquiriesWithFulfillment.length > 0
      ? (enquiriesWithFulfillment.reduce((sum, enq) => sum + enq.fulfillmentTime, 0) / enquiriesWithFulfillment.length).toFixed(2)
      : 0;
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
          _id: "$salesRepName",
          totalEnquiries: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          },
          quoted: {
            $sum: { $cond: [{ $eq: ["$activity", "Quoted"] }, 1, 0] }
          },
          regretted: {
            $sum: { $cond: [{ $eq: ["$activity", "Regretted"] }, 1, 0] }
          }
        }
      },
      { $sort: { totalEnquiries: -1 } },
      { $limit: 10 }
    ]);
    const rndPerformance = await Enquiry.aggregate([
      { $match: { rndHandlerName: { $exists: true, $ne: null }, ...combinedMatch } },
      {
        $group: {
          _id: '$rndHandlerName',
          totalEnquiries: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          },
          quoted: {
            $sum: { $cond: [{ $eq: ["$activity", "Quoted"] }, 1, 0] }
          },
          regretted: {
            $sum: { $cond: [{ $eq: ["$activity", "Regretted"] }, 1, 0] }
          },
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
};// @desc    Get member monthly performance (FIXED - WITH ALL METRICS)
// @route   GET /api/dashboard/member-monthly/:memberName
// @access  Private
export const getMemberMonthlyPerformance = async (req, res, next) => {
  try {
    const { memberName } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateMatch = {
      rndHandlerName: memberName,
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
    
    const monthlyData = await Enquiry.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            year: { $year: '$enquiryDate' },
            month: { $month: '$enquiryDate' }
          },
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          },
          quoted: {
            $sum: { $cond: [{ $eq: ["$activity", "Quoted"] }, 1, 0] }
          },
          regretted: {
            $sum: { $cond: [{ $eq: ["$activity", "Regretted"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$activity", "In Progress"] }, 1, 0] }
          },
          onHold: {
            $sum: { $cond: [{ $eq: ["$activity", "On Hold"] }, 1, 0] }
          },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const formattedData = monthlyData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      year: item._id.year,
      monthNumber: item._id.month,
      total: item.total,
      open: item.open,
      closed: item.closed,
      quoted: item.quoted,
      regretted: item.regretted,
      inProgress: item.inProgress,
      onHold: item.onHold || 0,
    }));
    
    // ⭐ ENHANCED SUMMARY WITH ALL CALCULATIONS
    const totalEnquiries = formattedData.reduce((sum, item) => sum + item.total, 0);
    const totalOpen = formattedData.reduce((sum, item) => sum + item.open, 0);
    const totalClosed = formattedData.reduce((sum, item) => sum + item.closed, 0);
    const totalQuoted = formattedData.reduce((sum, item) => sum + item.quoted, 0);
    const totalRegretted = formattedData.reduce((sum, item) => sum + item.regretted, 0);
    const totalInProgress = formattedData.reduce((sum, item) => sum + item.inProgress, 0);
    const totalOnHold = formattedData.reduce((sum, item) => sum + item.onHold, 0);
    const monthsTracked = formattedData.length;
    
    res.status(200).json({
      success: true,
      data: {
        memberName,
        monthlyPerformance: formattedData,
        summary: {
          totalEnquiries,
          totalOpen,
          totalClosed,
          totalQuoted,
          totalRegretted,
          totalInProgress,
          totalOnHold,
          monthsTracked,
          averagePerMonth: monthsTracked > 0 
            ? (totalEnquiries / monthsTracked).toFixed(1)
            : '0',
          successRate: totalEnquiries > 0
            ? ((totalQuoted / totalEnquiries) * 100).toFixed(1)
            : '0'
        }
      },
    });  
  } catch (error) {
    console.error('Member monthly performance error:', error);
    next(error);
  }
};


// @desc    Get market analysis
// @route   GET /api/dashboard/market-analysis
// @access  Private
export const getMarketAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
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
    if (role) {
      const usersWithRole = await User.find({ role }).select('_id');
      const userIds = usersWithRole.map(u => u._id);
      dateMatch.$or = [
        { salesRepresentative: { $in: userIds } },
        { rndHandler: { $in: userIds } }
      ];
    }
    const fulfillmentData = await Enquiry.aggregate([
      { $match: dateMatch },
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
