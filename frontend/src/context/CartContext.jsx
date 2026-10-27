import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { settingsApi } from '../api/settingsApi';
import { toast } from 'react-toastify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch cart data
  const { data: cartData, isLoading: syncing } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
    initialData: { items: [], subtotal: 0 },
  });

  const cartItems = cartData?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

  // Fetch settings for dynamic values
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const freeShippingThreshold = settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 10000;

  // Mutations
  const addMutation = useMutation({
    mutationFn: cartApi.addItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      
      queryClient.setQueryData(['cart'], old => {
        const items = old?.items ? [...old.items] : [];
        const existingIndex = items.findIndex(i => i.sku === newItem.sku);
        if (existingIndex > -1) {
          items[existingIndex].quantity += newItem.quantity;
        } else {
          items.push(newItem);
        }
        return { ...old, items };
      });
      setIsCartOpen(true);
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error(err.message || "Erreur lors de l'ajout au panier");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ sku, quantity }) => cartApi.updateItemQty(sku, quantity),
    onMutate: async ({ sku, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      
      queryClient.setQueryData(['cart'], old => {
        const items = old?.items ? [...old.items] : [];
        const existingIndex = items.findIndex(i => i.sku === sku);
        if (existingIndex > -1) {
          items[existingIndex].quantity = quantity;
        }
        return { ...old, items };
      });
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error(err.message || "Erreur lors de la mise à jour");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onMutate: async (sku) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      
      queryClient.setQueryData(['cart'], old => {
        return {
          ...old,
          items: old?.items?.filter(i => i.sku !== sku) || []
        };
      });
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error(err.message || "Erreur lors de la suppression");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('fldz.cart.v1');
      return { data: { items: [] } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const addToCart = (arg) => {
    if (!arg) return;
    const product = arg.product || (arg.name ? arg : {});
    const variant = arg.variant || (arg.size ? { size: arg.size, color: arg.color, sku: arg.sku, image: arg.image } : {});
    const qty = Number(arg.qty || arg.quantity || 1) || 1;

    const prodId = product?.id || product?._id || variant?.sku || 'item';
    const sku = variant?.sku || (variant?.size ? `${prodId}-${variant.size}` : `${prodId}-default`);
    const item = {
      id: prodId,
      sku: sku,
      name: product?.name || 'Produit',
      price: Number(variant?.price ?? product?.price) || 0,
      image: variant?.image || (variant?.images && variant.images[0]) || product?.image || (product?.images && product?.images[0]) || '',
      color: variant?.color || '',
      size: variant?.size || '',
      quantity: qty,
      variant: variant?.stock !== undefined ? variant : { stock: 99 } // Default fallback
    };
    addMutation.mutate(item);
  };

  const updateQty = (sku, quantity) => {
    updateMutation.mutate({ sku, quantity });
  };

  const removeFromCart = (sku) => {
    removeMutation.mutate(sku);
  };

  const clearCart = () => {
    clearMutation.mutate();
  };

  const isInCart = (sku) => {
    return cartItems.some(item => item.sku === sku);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      subtotal,
      syncing,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      isInCart,
      freeShippingThreshold,
      settings
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
