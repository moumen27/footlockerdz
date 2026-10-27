import Comment from '../models/Comment.model.js';

// Strip HTML tags helper (per §6.7 "Pas de HTML")
const stripHtml = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

// @desc    Create comment / question / reply
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { productId, content, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!productId || !content) {
      return res.status(400).json({ message: 'Produit et contenu requis' });
    }

    const cleanContent = stripHtml(content);
    if (!cleanContent) {
      return res.status(400).json({ message: 'Le commentaire ne peut pas être vide' });
    }

    const comment = new Comment({
      user: userId,
      product: productId,
      content: cleanContent,
      parentComment: parentCommentId || null,
      status: 'approved', // auto-publish V1
    });

    await comment.save();
    const populated = await Comment.findById(comment._id).populate('user', 'firstName lastName name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a product (public)
// @route   GET /api/comments/:productId
// @access  Public
export const getProductComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'firstName lastName name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all comments for admin moderation
// @route   GET /api/comments/admin/all
// @access  Private/SuperAdmin
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'firstName lastName name email')
      .sort({ createdAt: -1 })
      .lean();

    const Product = (await import('../models/Product.model.js')).default;
    const productIds = comments.map(c => c.product);
    const products = await Product.find({ _id: { $in: productIds } }, 'name variants sku');

    const populatedComments = comments.map(comment => {
      const productObj = products.find(p => p._id.toString() === comment.product.toString());
      return {
        ...comment,
        product: productObj || { name: { fr: 'Produit #' + comment.product, ar: 'منتج #' + comment.product } }
      };
    });

    res.json(populatedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update comment status (approve/reject/hide)
// @route   PATCH /api/comments/:id/status
// @access  Private/SuperAdmin
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    comment.status = status;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/SuperAdmin
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    await comment.deleteOne();
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
