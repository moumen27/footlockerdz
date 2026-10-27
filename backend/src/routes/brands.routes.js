import express from 'express';
import { 
  getBrands, 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from '../controllers/brands.controller.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to list all brands
router.get('/', getBrands);

// Protected Admin routes
router.post('/', protect, authorizeRoles('admin_catalog', 'super_admin'), createBrand);
router.put('/:id', protect, authorizeRoles('admin_catalog', 'super_admin'), updateBrand);
router.delete('/:id', protect, authorizeRoles('admin_catalog', 'super_admin'), deleteBrand);

export default router;
