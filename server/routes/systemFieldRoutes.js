import express from 'express';
import {
  getSystemFields,
  updateSystemField,
  deleteSystemField,
} from '../controllers/systemFieldController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSystemFields);
router.put('/:name', authorize('superuser'), updateSystemField);
router.delete('/:name', authorize('superuser'), deleteSystemField);

export default router;
