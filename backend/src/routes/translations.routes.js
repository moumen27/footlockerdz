import express from 'express';
import { getTranslations, updateTranslation } from '../controllers/translations.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('super_admin'), getTranslations);
router.put('/', protect, authorizeRoles('super_admin'), updateTranslation);

export default router;
