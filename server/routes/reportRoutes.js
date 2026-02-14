import express from 'express';
import { generateReport, exportToExcel, exportToCSV } from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', protect, authorize('superuser', 'management', 'sales', 'r&d'), generateReport);
router.post('/export/excel', protect, exportToExcel);
router.post('/export/csv', protect, exportToCSV);

export default router;
