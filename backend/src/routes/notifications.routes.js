import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', notificationsController.getUserNotifications);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

export default router;
