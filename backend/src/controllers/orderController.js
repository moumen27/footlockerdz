import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .select('-adminNote')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, payment, wilaya, startDate, endDate, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (payment) filter['payment.status'] = payment;
    if (wilaya) filter['shipping.wilaya'] = wilaya;
    if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const query = Order.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    if (limit) query.limit(Number(limit));
    
    const orders = await query;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID (Admin)
// @route   GET /api/orders/:id/admin
// @access  Private/Admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Commande introuvable' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order stats for dashboard
// @route   GET /api/orders/stats
// @access  Private/Admin (All Admin Roles)
export const getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find({}).select('amounts items createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    // Only update if status is provided and different
    if (status && order.status !== status) {
      const prevStatus = order.status;
      order.status = status;
      
      // Sync payment status for COD when delivered
      if (status === 'delivered' && order.payment?.method === 'cod') {
        order.payment.status = 'paid';
      }

      // If order is cancelled or returned: restore product inventory
      if (['cancelled', 'returned'].includes(status) && !['cancelled', 'returned'].includes(prevStatus)) {
        if (order.payment?.method === 'cod') {
          order.payment.status = 'failed';
        }
        for (const item of order.items) {
          if (item.productId && item.variant) {
            await Product.updateOne(
              { 
                _id: item.productId, 
                variants: {
                   $elemMatch: {
                      color: new RegExp(`^\\s*${item.variant.color}\\s*$`, 'i'),
                      size: new RegExp(`^\\s*${item.variant.size}\\s*$`, 'i')
                   }
                }
              },
              { 
                $inc: { "variants.$.stock": Number(item.qty) } 
              }
            );
          }
        }
      }

      // If order was cancelled/returned and is restored to active
      if (!['cancelled', 'returned'].includes(status) && ['cancelled', 'returned'].includes(prevStatus)) {
        for (const item of order.items) {
          if (item.productId && item.variant) {
            await Product.updateOne(
              { 
                _id: item.productId, 
                variants: {
                   $elemMatch: {
                      color: new RegExp(`^\\s*${item.variant.color}\\s*$`, 'i'),
                      size: new RegExp(`^\\s*${item.variant.size}\\s*$`, 'i')
                   }
                }
              },
              { 
                $inc: { "variants.$.stock": -Number(item.qty) } 
              }
            );
          }
        }
      }
      
      order.timeline.push({
        status: status,
        note: `Statut mis à jour vers ${status}`,
        date: Date.now()
      });
    }

    if (adminNote !== undefined) {
      order.adminNote = adminNote; // Update the main field without touching timeline
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by number
// @route   GET /api/orders/:number
// @access  Private
export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ number: req.params.number })
      .select('-adminNote')
      .populate('userId', 'name email');

    if (order && order.userId && order.userId._id.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Commande introuvable ou accès non autorisé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Guest or Authenticated)
export const createOrder = async (req, res) => {
  try {
    const {
      guestEmail,
      guestPhone,
      items,
      amounts,
      shipping,
      payment,
      customerNote,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Aucun article dans la commande' });
    }

    // Generate Order Number FL-YYYY-XXXXXX safely
    const currentYear = new Date().getFullYear();
    const lastOrder = await Order.findOne({ number: new RegExp(`^FL-${currentYear}-`) }).sort({ createdAt: -1 });
    let lastSeq = 0;
    if (lastOrder && lastOrder.number) {
      const parts = lastOrder.number.split('-');
      if (parts.length === 3) {
        lastSeq = parseInt(parts[2], 10);
        if (isNaN(lastSeq)) lastSeq = 0;
      }
    }
    const sequentialNumber = String(lastSeq + 1).padStart(6, '0');
    const orderNumber = `FL-${currentYear}-${sequentialNumber}`;

    // Verify and/or decrement stock for each item safely
    for (const item of items) {
      if (item.productId && item.variant) {
        
        if (payment.method === 'stripe') {
          // ONLY VERIFY, DO NOT DECREMENT FOR STRIPE YET
          const product = await Product.findOne({
            _id: item.productId, 
            variants: {
               $elemMatch: {
                  color: new RegExp(`^\\s*${item.variant.color}\\s*$`, 'i'),
                  size: new RegExp(`^\\s*${item.variant.size}\\s*$`, 'i'),
                  stock: { $gte: Number(item.qty) }
               }
            }
          });
          
          if (!product) {
            return res.status(400).json({ message: `Stock insuffisant ou produit introuvable pour l'article ${item.name || 'sélectionné'}` });
          }
        } else {
          // DECREMENT IMMEDIATELY FOR COD/OTHERS
          const result = await Product.updateOne(
            { 
              _id: item.productId, 
              variants: {
                 $elemMatch: {
                    color: new RegExp(`^\\s*${item.variant.color}\\s*$`, 'i'),
                    size: new RegExp(`^\\s*${item.variant.size}\\s*$`, 'i'),
                    stock: { $gte: Number(item.qty) }
                 }
              }
            },
            { 
              $inc: { "variants.$.stock": -Number(item.qty) } 
            }
          );
          
          if (result.modifiedCount === 0) {
            return res.status(400).json({ message: `Stock insuffisant ou produit introuvable pour l'article ${item.name || 'sélectionné'}` });
          }
        }
      }
    }

    const order = new Order({
      number: orderNumber,
      userId: req.user ? req.user._id : undefined,
      guestEmail: req.user ? undefined : guestEmail,
      guestPhone: req.user ? undefined : guestPhone,
      items,
      amounts,
      shipping,
      payment,
      customerNote,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
