import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  applyCartCouponApi,
  clearGuestCartOnExitBeacon,
  resolveMediaUrl
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

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const showCartToast = (message) => {
    if (!message) return;
    setToastMessage(String(message));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 6000);
  };
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
              sizes: bi.sizes || [],
              colors: bi.colors || [],
              variants: bi.variants || [],
              image: resolveMediaUrl(bi.image) || null

            }));
            setCartItems(mapped);
            setIsBackendConnected(true);
            setAppliedCoupon(backendCart.appliedCoupon || null);

            if (mapped.length === 0) {
              try {
                localStorage.removeItem('avn-user-cart');
                localStorage.removeItem('avn-cart-items');
                sessionStorage.removeItem('avn-session-cart');
              } catch { }
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
            } catch { }
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
        } catch { }

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
          } catch { }
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
              sizes: bi.sizes || [],
              colors: bi.colors || [],
              variants: bi.variants || [],
              image: resolveMediaUrl(bi.image) || null

            }));
            setCartItems(mapped);
            setIsBackendConnected(true);
            setAppliedCoupon(backendCart.appliedCoupon || null);
            if (mapped.length === 0) {
              try {
                localStorage.removeItem('avn-user-cart');
                localStorage.removeItem('avn-cart-items');
              } catch { }
            }
          } else {
            setCartItems([]);
            setIsBackendConnected(true);
            setAppliedCoupon(null);
            try {
              localStorage.removeItem('avn-user-cart');
              localStorage.removeItem('avn-cart-items');
            } catch { }
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
      } catch { }
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

    // Resolve the variant for the size/colour actually selected.
    //
    // This used to fall back to `product.variants[0]` whenever the match failed, which quietly
    // turned "add Large" into "add the first variant" — and since the line was then deduped on
    // that SKU, the quantity went onto whatever was already in the cart instead of creating a
    // second line. A miss must stay a miss.
    const variantList = Array.isArray(product.variants) ? product.variants : [];
    const matchedVariant =
      variantList.find(
        (v) =>
          v.isActive !== false &&
          (!v.size || !size || v.size === size || v.title?.includes(size)) &&
          (!v.color || !color || v.color === color || v.title?.includes(color))
      ) || null;

    const variantSku = product.variantSku || matchedVariant?.sku || '';
    // The variant's price wins over the product's, otherwise a cheaper/ dearer size is mispriced.
    const itemPrice = Number(matchedVariant?.price ?? product.price ?? 0);

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
      resistanceLevel: matchedVariant?.resistanceLevel || '',
      image: resolveMediaUrl(product.image || product.images?.[0]?.url) || null,
      slug: product.slug || product.id
    };

    // A line is identified by its variant, not by its product: two sizes of the same product are
    // two separate lines, and adding to one must never touch the other.
    const lineKey = (item) => {
      if (variantSku && item.variantSku) return `sku:${item.variantSku}`;
      const pid = item.productId || item.id || item.slug || '';
      return `p:${pid}|${item.selectedSize || ''}|${item.selectedColor || ''}|${item.selectedPack || ''}`;
    };
    const newLineKey = variantSku
      ? `sku:${variantSku}`
      : `p:${newItem.productId || newItem.id || newItem.slug || ''}|${size}|${color}|${pack}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => lineKey(item) === newLineKey);
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
      const result = await addToCartApi({
        productId: product._id || product.productId || product.id,
        variantSku,
        selectedSize: size,
        selectedColor: color,
        quantity: qtyToAdd
      });
      if (result && result.success === false) {
        showCartToast(result.message || 'Could not save this item to your cart.');
      }
    } catch (err) {
      console.warn('Backend cart add failed:', err);
      showCartToast(err?.message || 'Could not save this item to your cart.');
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
        const removed = await removeCartItemApi(itemId);
        if (removed && removed.success === false) showCartToast(removed.message || 'Could not update your cart.');
      } else {
        const updated = await updateCartItemApi(itemId, { quantity: qty });
        if (updated && updated.success === false) showCartToast(updated.message || 'Could not update your cart.');
      }
    } catch (err) {
      console.warn('Backend cart update failed:', err);
      showCartToast(err?.message || 'Could not update your cart.');
    }
  };

  const updateVariant = async (itemId, field, value) => {
    if (field !== 'selectedSize' && field !== 'selectedColor') return;

    const isSameLine = (item) =>
      (item.id || item.productId || item._id) === itemId || item.variantSku === itemId;

    const current = cartItems.find(isSameLine);
    if (!current) return;

    const draft = { ...current, [field]: value };

    const variants = Array.isArray(current.variants) ? current.variants : [];
    const matched =
      variants.find(
        (v) =>
          (!draft.selectedSize || v.size === draft.selectedSize || v.title?.includes(draft.selectedSize)) &&
          (!draft.selectedColor || v.color === draft.selectedColor || v.title?.includes(draft.selectedColor)) &&
          v.isActive !== false
      ) || null;

    if (matched) {
      draft.variantSku = matched.sku;
      if (matched.price != null) draft.price = Number(matched.price);
      if (matched.compareAtPrice != null) draft.compareAtPrice = Number(matched.compareAtPrice);
      draft.resistanceLevel = matched.resistanceLevel || '';
    }

    setCartItems((prev) => prev.map((item) => (isSameLine(item) ? draft : item)));

    if (!matched || matched.sku === current.variantSku) return;

    try {
      const removed = await removeCartItemApi(current.variantSku || current.id);
      if (removed && removed.success === false) {
        showCartToast(removed.message || 'Could not change the variant.');
        return;
      }
      const added = await addToCartApi({
        productId: draft.productId || draft._id || draft.id,
        variantSku: matched.sku,
        selectedSize: draft.selectedSize,
        selectedColor: draft.selectedColor,
        quantity: draft.quantity
      });
      if (added && added.success === false) {
        showCartToast(added.message || 'Could not change the variant.');
      }
    } catch (err) {
      console.warn('Cart variant change sync failed:', err);
      showCartToast(err?.message || 'Could not change the variant.');
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
    } catch { }

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
    } catch { }

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
  const handlingFee = subtotal === 0 ? 0 : 10;
  const totalAmount = subtotal === 0 ? 0 : Math.max(0, subtotal - discountAmount + shippingFee + handlingFee);
  const totalCartCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        toastMessage,
        addToCart,
        updateQuantity,
        updateVariant,
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
        handlingFee,
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
