import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, createUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('superuser', 'management'), getUsers)
  .post(protect, authorize('superuser'), createUser);

router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, authorize('superuser'), updateUser)
  .delete(protect, authorize('superuser'), deleteUser);

export default router;
