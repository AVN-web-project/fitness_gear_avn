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
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add Line Item to Cart (Optimistic State Update + Syncs with POST /api/cart)
  const addToCart = async (product) => {
    const qtyToAdd = product.quantity || 1;
    const size = product.selectedSize || (product.sizes ? product.sizes[0] : 'Standard');
    const color = product.selectedColor || (product.colors ? product.colors[0].name : 'Crimson Red');
    const pack = product.selectedPack || (product.packQuantityOptions ? product.packQuantityOptions[0] : 'Single Pair');

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.id === product.id || item.productId === product.id) &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += qtyToAdd;
        return updated;
      }
      return [
        ...prevItems,
        {
          ...product,
          productId: product.id,
          quantity: qtyToAdd,
          selectedSize: size,
          selectedColor: color,
          selectedPack: pack
        }
      ];
    });

    showToast(`Added ${product.name} to cart!`);

    // Sync with backend API asynchronously
    addToCartApi({
      productId: product.id,
      quantity: qtyToAdd,
      selectedSize: size,
      selectedColor: color,
      selectedPack: pack
    });
  };

  // Update Line Item Quantity
  const updateQuantity = async (itemId, delta) => {
    let newQty = 0;
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === itemId || item.productId === itemId) {
            newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    updateCartItemApi(itemId, { quantity: newQty });
  };

  // Remove Item Completely
  const removeFromCart = async (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId && item.productId !== itemId)
    );

    showToast('Item removed from cart.');
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
      showToast('Coupon AVN10 applied successfully! (10% OFF)');
      return { success: true, coupon: couponObj };
    } else if (cleanCode === 'PRO20') {
      const couponObj = { code: 'PRO20', discountPercent: 20, description: '20% OFF Pro Athlete Discount' };
      setAppliedCoupon(couponObj);
      showToast('Coupon PRO20 applied successfully! (20% OFF)');
      return { success: true, coupon: couponObj };
    } else {
      showToast('Invalid promo code. Try AVN10 or PRO20.');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Promo code removed.');
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
