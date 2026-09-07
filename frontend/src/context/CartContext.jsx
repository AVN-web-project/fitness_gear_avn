import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  applyCartCouponApi,
  clearGuestCartOnExitBeacon
} from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Load initial cart:
  // - If authenticated: try avn-user-cart (cached)
  // - If guest: load avn-session-cart (session-only, wiped upon site exit)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('avn-token'));
      if (hasToken) {
        const saved = localStorage.getItem('avn-user-cart');
        return saved ? JSON.parse(saved) : [];
      } else {
        const sessionSaved = sessionStorage.getItem('avn-session-cart');
        return sessionSaved ? JSON.parse(sessionSaved) : [];
      }
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Storage Persistence:
  // - Authenticated: saved to localStorage ('avn-user-cart')
  // - Unauthenticated Guest: saved to sessionStorage ('avn-session-cart')
  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem('avn-user-cart', JSON.stringify(cartItems));
      } else {
        sessionStorage.setItem('avn-session-cart', JSON.stringify(cartItems));
      }
    } catch (e) {
      console.warn('Unable to persist cart to storage:', e);
    }
  }, [cartItems, isAuthenticated]);

  // Initial cart hydration from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function initCart() {
      try {
        const backendCart = await fetchCart();
        if (isMounted) {
          if (backendCart && Array.isArray(backendCart.items)) {
            const mapped = backendCart.items.map((bi) => ({
              id: bi._id || bi.id || bi.variantSku,
              _id: bi._id,
              productId: bi.productId,
              name: bi.name,
              slug: bi.slug,
              price: bi.price,
              compareAtPrice: bi.compareAtPrice,
              quantity: bi.quantity,
              selectedSize: bi.selectedSize || 'Standard',
              selectedColor: bi.selectedColor || 'Crimson Red',
              variantSku: bi.variantSku,
              variantTitle: bi.variantTitle,
              image: bi.image || null
            }));
            setCartItems(mapped);
            setIsBackendConnected(true);
            setAppliedCoupon(backendCart.appliedCoupon || null);

            if (mapped.length === 0) {
              try {
                localStorage.removeItem('avn-user-cart');
                localStorage.removeItem('avn-cart-items');
                sessionStorage.removeItem('avn-session-cart');
              } catch {}
            }
          } else if (backendCart === null) {
            // DB has no cart or user has an empty cart
            setCartItems([]);
            setIsBackendConnected(true);
            setAppliedCoupon(null);
            try {
              localStorage.removeItem('avn-user-cart');
              localStorage.removeItem('avn-cart-items');
              sessionStorage.removeItem('avn-session-cart');
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Initial cart sync failed:', err);
      }
    }
    initCart();
    return () => { isMounted = false; };
  }, []);

  // Site Exit Listener:
  // When an unauthenticated guest exits the site (window close / beforeunload),
  // delete their temporary guest cart document from MongoDB.
  useEffect(() => {
    const handleSiteExit = () => {
      clearGuestCartOnExitBeacon();
    };

    window.addEventListener('pagehide', handleSiteExit);
    window.addEventListener('beforeunload', handleSiteExit);
    return () => {
      window.removeEventListener('pagehide', handleSiteExit);
      window.removeEventListener('beforeunload', handleSiteExit);
    };
  }, []);

  // Auth Synchronization & Guest Migration Effect:
  // When an athlete signs in, migrate guest session items to MongoDB and fetch their persistent cart
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function syncAndMigrateCart() {
      try {
        let guestSessionItems = [];
        try {
          const raw = sessionStorage.getItem('avn-session-cart');
          guestSessionItems = raw ? JSON.parse(raw) : [];
        } catch {}

        // Migrate guest session items to authenticated user's MongoDB cart
        if (guestSessionItems.length > 0) {
          for (const item of guestSessionItems) {
            await addToCartApi({
              productId: item.productId || item.id,
              variantSku: item.variantSku,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              quantity: item.quantity || 1
            });
          }
          try {
            sessionStorage.removeItem('avn-session-cart');
            sessionStorage.removeItem('avn-guest-id');
          } catch {}
        }

        // Fetch latest authoritative cart from MongoDB
        const backendCart = await fetchCart();
        if (isMounted) {
          if (backendCart && Array.isArray(backendCart.items)) {
            const mapped = backendCart.items.map((bi) => ({
              id: bi._id || bi.id || bi.variantSku,
              _id: bi._id,
              productId: bi.productId,
              name: bi.name,
              slug: bi.slug,
              price: bi.price,
              compareAtPrice: bi.compareAtPrice,
              quantity: bi.quantity,
              selectedSize: bi.selectedSize || 'Standard',
              selectedColor: bi.selectedColor || 'Crimson Red',
              variantSku: bi.variantSku,
              variantTitle: bi.variantTitle,
              image: bi.image || null
            }));
            setCartItems(mapped);
            setIsBackendConnected(true);
            setAppliedCoupon(backendCart.appliedCoupon || null);
            if (mapped.length === 0) {
              try {
                localStorage.removeItem('avn-user-cart');
                localStorage.removeItem('avn-cart-items');
              } catch {}
            }
          } else {
            setCartItems([]);
            setIsBackendConnected(true);
            setAppliedCoupon(null);
            try {
              localStorage.removeItem('avn-user-cart');
              localStorage.removeItem('avn-cart-items');
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Cart sync on auth failed:', err);
      }
    }

    syncAndMigrateCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  // Logout Effect:
  // Reset cart when user signs out so subsequent guests do not see the prior user's items
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      setCartItems([]);
      setAppliedCoupon(null);
      try {
        sessionStorage.removeItem('avn-session-cart');
        localStorage.removeItem('avn-user-cart');
        localStorage.removeItem('avn-cart-items');
      } catch {}
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Add Item to Cart (Syncs to MongoDB for both authenticated users and active guests)
  const addToCart = async (product) => {
    const qtyToAdd = Math.max(1, Number(product.quantity) || 1);
    const size = product.selectedSize || (product.sizes ? product.sizes[0] : 'Standard');
    const color = typeof product.selectedColor === 'string'
      ? product.selectedColor
      : (product.colors ? product.colors[0].name : 'Crimson Red');
    const pack = product.selectedPack || (product.packQuantityOptions ? product.packQuantityOptions[0] : 'Single Pair');

    // Resolve variant SKU from product.variants
    const matchedVariant = product.variants?.find(
      (v) =>
        (!size || v.size === size || v.title?.includes(size)) &&
        (!color || v.color === color || v.title?.includes(color))
    ) || product.variants?.[0];
    const variantSku = product.variantSku || matchedVariant?.sku || product.sku || 'AVN-STD-SKU';
    const itemPrice = Number(product.price ?? matchedVariant?.price ?? 0);

    const newItem = {
      ...product,
      id: product.id || product.productId || `cart-${Date.now()}`,
      productId: product._id || product.productId || product.id,
      name: product.name,
      price: itemPrice,
      quantity: qtyToAdd,
      selectedSize: size,
      selectedColor: color,
      selectedPack: pack,
      variantSku,
      image: product.image || product.images?.[0]?.url || null,
      slug: product.slug || product.id
    };

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.variantSku && item.variantSku === variantSku) ||
          ((item.id === product.id || item.productId === product.id) &&
            item.selectedSize === size &&
            item.selectedColor === color)
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
      return [...prevItems, newItem];
    });

    // Always sync to MongoDB (with user auth token or x-guest-id header)
    try {
      await addToCartApi({
        productId: product._id || product.productId || product.id,
        variantSku,
        selectedSize: size,
        selectedColor: color,
        quantity: qtyToAdd
      });
    } catch (err) {
      console.warn('Backend cart add failed:', err);
    }
  };

  // Update Line Item Quantity (Explicit target quantity)
  const updateQuantity = async (itemId, newQty) => {
    const qty = Math.max(0, Number(newQty) || 0);

    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          const matchId = item.id || item.productId || item._id;
          if (matchId === itemId || item.variantSku === itemId) {
            return { ...item, quantity: qty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    try {
      if (qty === 0) {
        await removeCartItemApi(itemId);
      } else {
        await updateCartItemApi(itemId, { quantity: qty });
      }
    } catch (err) {
      console.warn('Backend cart update failed:', err);
    }
  };

  // Remove Item Completely
  const removeFromCart = async (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          item.id !== itemId &&
          item.productId !== itemId &&
          item._id !== itemId &&
          item.variantSku !== itemId
      )
    );

    try {
      await removeCartItemApi(itemId);
    } catch (err) {
      console.warn('Backend cart remove failed:', err);
    }
  };

  // Clear Entire Cart
  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    try {
      sessionStorage.removeItem('avn-session-cart');
      sessionStorage.removeItem('avn-guest-id');
      localStorage.removeItem('avn-user-cart');
      localStorage.removeItem('avn-cart-items');
    } catch {}

    try {
      await clearCartApi();
    } catch (err) {
      console.warn('Backend cart clear failed:', err);
    }
  };

  // Coupon Logic
  const applyCoupon = async (code) => {
    const cleanCode = code.trim().toUpperCase();

    try {
      const res = await applyCartCouponApi(cleanCode);
      if (res?.success && res?.data?.cart?.appliedCoupon) {
        setAppliedCoupon(res.data.cart.appliedCoupon);
        return { success: true, coupon: res.data.cart.appliedCoupon };
      }
    } catch {}

    // Local fallback if offline
    if (cleanCode === 'AVN10') {
      const couponObj = { code: 'AVN10', discountPercent: 10, description: '10% OFF AVN Pro Gear' };
      setAppliedCoupon(couponObj);
      return { success: true, coupon: couponObj };
    } else if (cleanCode === 'PRO20') {
      const couponObj = { code: 'PRO20', discountPercent: 20, description: '20% OFF Pro Athlete Discount' };
      setAppliedCoupon(couponObj);
      return { success: true, coupon: couponObj };
    } else {
      return { success: false, message: 'Invalid or inactive promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Financial Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * (appliedCoupon.discountPercent || 0)) / 100) : 0;
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalCartCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

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
