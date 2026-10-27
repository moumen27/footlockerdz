import express from 'express';
import { getMyOrders, getOrderByNumber, createOrder, getAllOrders, updateOrderStatus, getOrderStats, getOrderById } from '../controllers/orderController.js';
import { protect, optionalAuth, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyOrders);
router.get('/all', protect, authorizeRoles('super_admin', 'admin_orders'), getAllOrders);
router.get('/:id/admin', protect, authorizeRoles('super_admin', 'admin_orders'), getOrderById);
router.get('/stats', protect, authorizeRoles('super_admin', 'admin_orders', 'admin_catalog'), getOrderStats);
router.patch('/:id/status', protect, authorizeRoles('super_admin', 'admin_orders'), updateOrderStatus);

// Middleware for customer only order creation
const customerOnly = (req, res, next) => {
  if (req.user && ['super_admin', 'admin_orders', 'admin_catalog'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Les administrateurs ne peuvent pas créer de commandes clientes.' });
  }
  next();
};

router.post('/', optionalAuth, customerOnly, createOrder);
router.get('/:number', protect, getOrderByNumber);

export default router;
