import express from 'express';
import {
  createComment,
  getProductComments,
  getAllCommentsAdmin,
  updateCommentStatus,
  deleteComment
} from '../controllers/commentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createComment);

// Admin Moderation routes
router.route('/admin/all')
  .get(protect, authorizeRoles('super_admin'), getAllCommentsAdmin);

router.route('/:id/status')
  .patch(protect, authorizeRoles('super_admin'), updateCommentStatus);

router.route('/:id')
  .delete(protect, authorizeRoles('super_admin'), deleteComment);

router.route('/:productId')
  .get(getProductComments);

export default router;
