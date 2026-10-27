import express from 'express';
import { createCheckoutSession, markOrderAsPaid } from '../controllers/stripe.controller.js';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/mark-paid', markOrderAsPaid);

export default router;
