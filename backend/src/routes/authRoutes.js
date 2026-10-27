import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', optionalAuth, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.put('/password', protect, updatePassword);

// Addresses routes
router.post('/me/addresses', protect, addAddress);
router.put('/me/addresses/:id', protect, updateAddress);
router.delete('/me/addresses/:id', protect, deleteAddress);
router.put('/me/addresses/:id/default', protect, setDefaultAddress);

router.get('/verify/:token', verifyEmail);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

export default router;
