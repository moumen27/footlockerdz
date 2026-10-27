import express from 'express';
import { mergeCart } from '../controllers/cart.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/merge', protect, mergeCart);

export default router;
