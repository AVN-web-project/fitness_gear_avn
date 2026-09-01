import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  validateCartApi
} from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Load saved cart items from localStorage, defaulting to an empty cart []
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-cart-items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Persist cartItems to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('avn-cart-items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [cartItems]);

  // Initial cart synchronization with backend /api/cart endpoint if available
  useEffect(() => {
    async function syncCartFromBackend() {
      const apiCart = await fetchCart();
      if (apiCart && apiCart.items && apiCart.items.length > 0) {
        setCartItems(apiCart.items);
        setIsBackendConnected(true);
        if (apiCart.appliedCoupon) setAppliedCoupon(apiCart.appliedCoupon);
      }
    }
    syncCartFromBackend();
  }, []);

  // Helper: Trigger Toast Notification
  const showToast = () => {};

    // Add Line Item to Cart (Immutable update preventing React StrictMode double increments)
  const addToCart = async (product) => {
    const qtyToAdd = Math.max(1, Number(product.quantity) || 1);
    const size = product.selectedSize || (product.sizes ? product.sizes[0] : 'Standard');
    const color = typeof product.selectedColor === 'string' ? product.selectedColor : (product.colors ? product.colors[0].name : 'Crimson Red');
    const pack = product.selectedPack || (product.packQuantityOptions ? product.packQuantityOptions[0] : 'Single Pair');

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.id === product.id || item.productId === product.id) &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        return prevItems.map((item, idx) => {
          if (idx === existingIndex) {
            const currentQty = Math.max(1, Number(item.quantity) || 1);
            return {
              ...item,
              quantity: currentQty + qtyToAdd
            };
          }
          return item;
        });
      }
      return [
        ...prevItems,
        {
          ...product,
          id: product.id || product.productId || `cart-${Date.now()}`,
          productId: product.id,
          quantity: qtyToAdd,
          selectedSize: size,
          selectedColor: color,
          selectedPack: pack
        }
      ];
    });

    addToCartApi({
      productId: product.id,
      quantity: qtyToAdd,
      selectedSize: size,
      selectedColor: color,
      selectedPack: pack
    });
  };

  // Update Line Item Quantity (Explicit target quantity)
  const updateQuantity = async (itemId, newQty) => {
    const qty = Math.max(0, Number(newQty) || 0);
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          const matchId = item.id || item.productId;
          if (matchId === itemId || item.id === itemId || item.productId === itemId) {
            return { ...item, quantity: qty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    updateCartItemApi(itemId, { quantity: qty });
  };

  // Remove Item Completely
  const removeFromCart = async (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId && item.productId !== itemId)
    );

    // Toast removed
    removeCartItemApi(itemId);
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('avn-cart-items');
    } catch (e) {}
  };

  // Coupon Logic
  const applyCoupon = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'AVN10') {
      const couponObj = { code: 'AVN10', discountPercent: 10, description: '10% OFF AVN Pro Gear' };
      setAppliedCoupon(couponObj);
      // Toast removed
      return { success: true, coupon: couponObj };
    } else if (cleanCode === 'PRO20') {
      const couponObj = { code: 'PRO20', discountPercent: 20, description: '20% OFF Pro Athlete Discount' };
      setAppliedCoupon(couponObj);
      // Toast removed
      return { success: true, coupon: couponObj };
    } else {
      // Toast removed
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    // Toast removed
  };

  // Financial Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const shippingFee = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        removeItem: removeFromCart,
        clearCart,
        couponCode,
        setCouponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        totalCartCount,
        toastMessage,
        showToast,
        isBackendConnected
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
