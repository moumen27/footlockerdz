// Mock API implementation for Cart following the CDC requirements

const MOCK_DELAY = 500;

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated Database
let mockCart = {
  items: [],
  subtotal: 0,
};

export const cartApi = {
  getCart: async () => {
    await delay(MOCK_DELAY);
    const guestCart = JSON.parse(localStorage.getItem('fldz.cart.v1') || '{"items":[]}');
    // If logged in, we'd fetch from DB. For now, simulate guest cart as truth if no DB mock
    // Let's just use localStorage to persist the mock DB for this session
    return { data: guestCart };
  },

  addItem: async (item) => {
    await delay(MOCK_DELAY);
    // item: { sku, productId, quantity, ... }
    const cart = JSON.parse(localStorage.getItem('fldz.cart.v1') || '{"items":[]}');
    
    // Check variant stock (Simulated)
    if (item.quantity > (item.variant?.stock || 99)) {
      throw new Error('Stock insuffisant');
    }

    const existingItemIndex = cart.items.findIndex(i => i.sku === item.sku);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    
    localStorage.setItem('fldz.cart.v1', JSON.stringify(cart));
    return { data: cart };
  },

  updateItemQty: async (sku, quantity) => {
    await delay(MOCK_DELAY);
    const cart = JSON.parse(localStorage.getItem('fldz.cart.v1') || '{"items":[]}');
    const existingItemIndex = cart.items.findIndex(i => i.sku === sku);
    
    if (existingItemIndex > -1) {
       cart.items[existingItemIndex].quantity = quantity;
    }
    
    localStorage.setItem('fldz.cart.v1', JSON.stringify(cart));
    return { data: cart };
  },

  removeItem: async (sku) => {
    await delay(MOCK_DELAY);
    const cart = JSON.parse(localStorage.getItem('fldz.cart.v1') || '{"items":[]}');
    cart.items = cart.items.filter(i => i.sku !== sku);
    
    localStorage.setItem('fldz.cart.v1', JSON.stringify(cart));
    return { data: cart };
  },

  quoteCheckout: async (cartData) => {
    await delay(MOCK_DELAY);
    // Recalculate everything on the server
    let subtotal = 0;
    cartData.items.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    // Simulate a price change error randomly (10% chance) just to show the feature? 
    // No, let's keep it reliable for now.
    
    return {
      data: {
        subtotal,
        deliveryFee: 500, // mock
        total: subtotal + 500,
        isValid: true
      }
    };
  }
};
