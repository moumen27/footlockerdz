import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: 'Produit manquant' });
    }

    // 2. Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ user: userId, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Vous avez déjà donné votre avis sur ce produit' });
    }

    // 3. Rule "delivered": User must have an order with this product that has been delivered
    // Order model items snapshot has productId
    const hasPurchasedAndDelivered = await Order.findOne({
      userId: userId,
      status: 'delivered',
      'items.productId': productId,
    });

    if (!hasPurchasedAndDelivered) {
      return res.status(403).json({ 
        message: 'Vous devez avoir acheté et reçu ce produit pour laisser un avis' 
      });
    }

    // 4. Create review
    const review = new Review({
      user: userId,
      product: productId,
      rating: Number(rating),
      title,
      comment,
    });

    await review.save();
    await updateProductReviewStats(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to recalculate and update product's rating and review count
const updateProductReviewStats = async (productId) => {
  try {
    const Product = (await import('../models/Product.model.js')).default;
    const approvedReviews = await Review.find({ product: productId, status: 'approved' });
    const count = approvedReviews.length;
    const avg = count > 0 
      ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;

    await Product.findByIdAndUpdate(productId, {
      reviewsCount: count,
      averageRating: avg
    });
  } catch (err) {
    console.error('Error updating product review stats:', err);
  }
};

// @desc    Get reviews for a product (only approved/public reviews)
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'firstName lastName name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/me
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

    const Product = (await import('../models/Product.model.js')).default;
    const productIds = reviews.map(r => r.product);
    const products = await Product.find({ _id: { $in: productIds } }, 'name images');

    const populatedReviews = reviews.map(review => {
      const productObj = products.find(p => p._id.toString() === review.product.toString());
      return {
        ...review,
        product: productObj || null
      };
    });

    res.json(populatedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for admin moderation
// @route   GET /api/reviews/admin/all
// @access  Private/SuperAdmin
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName name email')
      .sort({ createdAt: -1 })
      .lean();

    const Product = (await import('../models/Product.model.js')).default;
    const productIds = reviews.map(r => r.product);
    const products = await Product.find({ _id: { $in: productIds } }, 'name variants sku');

    const populatedReviews = reviews.map(review => {
      const productObj = products.find(p => p._id.toString() === review.product.toString());
      return {
        ...review,
        product: productObj || { name: { fr: 'Produit #' + review.product, ar: 'منتج #' + review.product } }
      };
    });

    res.json(populatedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review status (approve/reject/hide)
// @route   PATCH /api/reviews/:id/status
// @access  Private/SuperAdmin
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avis introuvable' });
    }

    review.status = status;
    await review.save();
    await updateProductReviewStats(review.product);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/SuperAdmin
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avis introuvable' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductReviewStats(productId);

    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
