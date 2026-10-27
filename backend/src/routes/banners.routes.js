import express from 'express';
import { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/banners.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getActiveBanners);
router.get('/all', protect, authorizeRoles('super_admin'), getAllBanners);
router.post('/', protect, authorizeRoles('super_admin'), createBanner);
router.put('/:id', protect, authorizeRoles('super_admin'), updateBanner);
router.delete('/:id', protect, authorizeRoles('super_admin'), deleteBanner);

export default router;
