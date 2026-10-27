import express from 'express';
import { mergeWishlist } from '../controllers/likes.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/merge', protect, mergeWishlist);

export default router;
