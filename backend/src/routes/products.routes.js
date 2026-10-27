import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getPurchasedProducts
} from '../controllers/products.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected User routes
router.get('/user/purchased', protect, getPurchasedProducts);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Admin routes
router.post('/', protect, authorizeRoles('admin_catalog', 'super_admin'), createProduct);
router.put('/:id', protect, authorizeRoles('admin_catalog', 'super_admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin_catalog', 'super_admin'), deleteProduct);

export default router;
