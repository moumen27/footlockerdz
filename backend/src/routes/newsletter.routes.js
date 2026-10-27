import express from 'express';
import {
  subscribe,
  getStats,
  broadcastFlashSale,
  broadcastProduct
} from '../controllers/newsletter.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Subscribe
router.post('/subscribe', subscribe);

// Admin only: Stats and broadcasts
router.get('/stats', protect, authorizeRoles('admin', 'super_admin'), getStats);
router.post('/broadcast-flash-sale', protect, authorizeRoles('admin', 'super_admin'), broadcastFlashSale);
router.post('/broadcast-product/:id', protect, authorizeRoles('admin', 'super_admin'), broadcastProduct);

export default router;
