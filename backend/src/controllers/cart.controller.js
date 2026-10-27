import Cart from '../models/Cart.model.js';

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = async (req, res) => {
  try {
    const { cartItems: guestItems } = req.body; // Guest cart items sent from frontend
    const userId = req.user._id;

    if (!guestItems || guestItems.length === 0) {
      // Nothing to merge, just return user cart
      const userCart = await Cart.findOne({ user: userId });
      return res.json({ items: userCart ? userCart.items : [] });
    }

    // Ensure productId is present since frontend might send 'id' instead of 'productId'
    const formattedGuestItems = guestItems.map(item => ({
      ...item,
      productId: item.productId || item.id,
    }));

    let userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      // Create new cart for user with guest items
      userCart = await Cart.create({
        user: userId,
        items: formattedGuestItems
      });
    } else {
      // Merge logic: append new items, update quantity if same SKU
      formattedGuestItems.forEach(guestItem => {
        const existingItemIndex = userCart.items.findIndex(item => item.sku === guestItem.sku);
        if (existingItemIndex >= 0) {
          // Increment quantity
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          userCart.items.push(guestItem);
        }
      });
      await userCart.save();
    }

    res.json({ items: userCart.items, message: 'Panier fusionné avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
