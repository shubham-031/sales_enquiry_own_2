import express from 'express';
import { body } from 'express-validator';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  deleteAllEnquiries,
  uploadAttachment,
} from '../controllers/enquiryController.js';
import { bulkImportEnquiries } from '../controllers/importController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { enforceFieldPermissions, getEditableFields } from '../middlewares/rolePermissions.js';
import upload from '../config/multer.js';

const router = express.Router();

// Bulk import route (must be before /:id route)
router.post(
  '/bulk-import',
  protect,
  authorize('admin', 'sales'),
  upload.single('file'),
  bulkImportEnquiries
);

// Delete all enquiries route (Admin only - must be before /:id route)
router.delete(
  '/all',
  protect,
  authorize('admin'),
  deleteAllEnquiries
);

// Get editable fields for current user role
router.get(
  '/permissions/editable-fields',
  protect,
  getEditableFields
);

router
  .route('/')
  .get(protect, getEnquiries)
  .post(
    protect,
    authorize('admin', 'sales', 'r&d'),
    [
      // Removed customerName validation as it may not be present in Excel imports
      body('marketType').notEmpty().withMessage('Market type is required'),
      body('productType').notEmpty().withMessage('Product type is required'),
    ],
    validate,enforceFieldPermissions, 
    createEnquiry
  );

router
  .route('/:id')
  .get(protect, getEnquiryById)
  .put(protect, authorize('admin', 'sales', 'r&d'), updateEnquiry)
  .delete(protect, authorize('admin'), deleteEnquiry);

router.post('/:id/attachments', protect, uploadAttachment);

export default router;
