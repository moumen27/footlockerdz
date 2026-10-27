import express from 'express';
import { 
  createReview, 
  getProductReviews, 
  getUserReviews, 
  getAllReviewsAdmin, 
  updateReviewStatus, 
  deleteReview 
} from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/user/me')
  .get(protect, getUserReviews);

// Admin Moderation routes
router.route('/admin/all')
  .get(protect, authorizeRoles('super_admin'), getAllReviewsAdmin);

router.route('/:id/status')
  .patch(protect, authorizeRoles('super_admin'), updateReviewStatus);

router.route('/:id')
  .delete(protect, authorizeRoles('super_admin'), deleteReview);

router.route('/:productId')
  .get(getProductReviews);

export default router;
