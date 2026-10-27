import Stripe from 'stripe';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

// @desc    Create Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Public
export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    // Prepare line items for Stripe Checkout
    const lineItems = order.items.map((item) => {
      return {
        price_data: {
          currency: 'dzd', // Stripe supports DZD
          product_data: {
            name: item.name,
            images: item.image && item.image.startsWith('http') ? [item.image] : [], // Optional, must be valid URL
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
        },
        quantity: item.qty,
      };
    });

    // Add Shipping Cost as a line item if > 0
    if (order.amounts.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'dzd',
          product_data: {
            name: 'Frais de livraison',
          },
          unit_amount: Math.round(order.amounts.shipping * 100),
        },
        quantity: 1,
      });
    }

    // Determine the frontend URL dynamically or from env
    const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?orderId=${order._id}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark Order as Paid (Naive approach for testing without Webhooks)
// @route   POST /api/stripe/mark-paid
// @access  Public
export const markOrderAsPaid = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    if (order.payment.status !== 'paid') {
      // Decrement stock for each item now that payment is confirmed
      for (const item of order.items) {
        if (item.productId && item.variant) {
          const product = await Product.findById(item.productId);
          if (product) {
            const variant = product.variants.find(v => 
              v.color.trim().toLowerCase() === item.variant.color.trim().toLowerCase() && 
              v.size.trim().toLowerCase() === item.variant.size.trim().toLowerCase()
            );
            if (variant) {
              variant.stock = Math.max(0, variant.stock - Number(item.qty));
              await product.save();
            }
          }
        }
      }

      order.payment.status = 'paid';
      order.status = 'confirmed'; // Auto-confirm on payment
      order.timeline.push({
        status: 'confirmed',
        note: 'Paiement Stripe reçu avec succès.',
        date: Date.now()
      });
      await order.save();
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
