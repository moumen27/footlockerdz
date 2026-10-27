import express from 'express';
import { getAdminUsers, createAdminUser, updateAdminUser } from '../controllers/adminUsers.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('super_admin'), getAdminUsers);
router.post('/', protect, authorizeRoles('super_admin'), createAdminUser);
router.patch('/:id', protect, authorizeRoles('super_admin'), updateAdminUser);

export default router;
