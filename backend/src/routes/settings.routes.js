import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorizeRoles('super_admin'), updateSettings);

export default router;
