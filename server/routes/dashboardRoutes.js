import express from 'express';
import {
  getDashboardStats,
  getTeamPerformance,
  getMarketAnalysis,
  getTrendAnalysis,
  getActivityDistribution,
  getProductDistribution,
  getFulfillmentAnalysis,
  getMemberMonthlyPerformance, // NEW
} from '../controllers/dashboardController.js';
import { protect } from '../middlewares/auth.js';
const router = express.Router();
// Protect all routes
router.use(protect);
// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/team-performance', getTeamPerformance);
router.get('/market-analysis', getMarketAnalysis);
router.get('/trend-analysis', getTrendAnalysis);
router.get('/activity-distribution', getActivityDistribution);
router.get('/product-distribution', getProductDistribution);
router.get('/fulfillment-analysis', getFulfillmentAnalysis);
// NEW: Member monthly performance drilldown
router.get('/member-monthly/:memberName', getMemberMonthlyPerformance);
export default router;


