import Like from '../models/Like.model.js';

// @desc    Merge guest wishlist with user wishlist
// @route   POST /api/wishlist/merge
// @access  Private
export const mergeWishlist = async (req, res) => {
  try {
    const { wishlistItems: guestLikes } = req.body; // array of productIds
    const userId = req.user._id;

    if (!guestLikes || guestLikes.length === 0) {
      const userLikeDoc = await Like.findOne({ user: userId });
      return res.json({ items: userLikeDoc ? userLikeDoc.products : [] });
    }

    let userLikeDoc = await Like.findOne({ user: userId });

    if (!userLikeDoc) {
      userLikeDoc = await Like.create({
        user: userId,
        products: guestLikes
      });
    } else {
      // Merge logic: ensure unique productIds
      const uniqueProducts = new Set([...userLikeDoc.products, ...guestLikes]);
      userLikeDoc.products = Array.from(uniqueProducts);
      await userLikeDoc.save();
    }

    res.json({ items: userLikeDoc.products, message: 'Liste de souhaits fusionnée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
