import express from 'express';
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getOrCreateCustomField,
} from '../controllers/customFieldController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All custom field routes require authentication
router.use(protect);

// Get all custom fields (all authenticated users)
router.get('/', getCustomFields);

// Create custom field (superuser only)
router.post('/', authorize('superuser'), createCustomField);

// Update custom field (superuser only)
router.put('/:id', authorize('superuser'), updateCustomField);

// Delete custom field (superuser only)
router.delete('/:id', authorize('superuser'), deleteCustomField);

// Get or auto-create custom field (superuser only) - used during import
router.post('/auto-create', authorize('superuser'), getOrCreateCustomField);

export default router;
