import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  updateCartItemVariantApi,
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

  // ---- one shape for a cart line ----------------------------------------------------------
  // Every cart mutation returns the same computed cart from the server. These helpers turn that
  // payload into state, so a line is identical whether it arrived from a click, a quantity change
  // or a page refresh. Nothing about a line is invented on the client any more — that divergence
  // is why the variant selectors and the weight/pack subtitle vanished on refresh.
  const toCartLine = (line) => ({
    ...line,
    id: line._id || line.id || line.variantSku,
    _id: line._id,
    image: resolveMediaUrl(line.image) || null,
    selectedSize: line.selectedSize || 'Standard',
    selectedColor: line.selectedColor || 'Crimson Red',
    sizes: Array.isArray(line.sizes) ? line.sizes : [],
    colors: Array.isArray(line.colors) ? line.colors : [],
    variants: Array.isArray(line.variants) ? line.variants : [],
  });

  const applyServerCart = (payload) => {
    // The API client is inconsistent: fetchCart unwraps to the cart, while the mutation helpers
    // return the raw envelope. Accept every shape rather than making the caller remember which is
    // which — getting this wrong silently no-ops, which is what left a newly added line invisible
    // until the page was refreshed.
    const cart =
      (payload && payload.data && payload.data.cart) ||
      (payload && payload.cart) ||
      (payload && payload.data && Array.isArray(payload.data.items) ? payload.data : null) ||
      (payload && Array.isArray(payload.items) ? payload : null);

    if (!cart) return false;
    setCartItems(cart.items.map(toCartLine));
    setAppliedCoupon(cart.appliedCoupon || null);
    setIsBackendConnected(true);
    return true;
  };

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
            const mapped = backendCart.items.map(toCartLine);
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
            const added = await addToCartApi({
              productId: item.productId || item.id,
              variantSku: item.variantSku,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              quantity: item.quantity || 1
            });

            if (added && added.success === false) {
              showCartToast(added.message || 'Could not add that to your cart.');
            } else {
              // Adopt the server cart, including the new line, replacing the optimistic one.
              applyServerCart(added);
            }
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
    // Exact match only. `v.title?.includes(size)` matched on a substring, so selecting "M"
    // could pick "Medium  Stealth Black" when "M  Stealth Red" was asked for — the line that
    // landed in the cart was a different variant from the one on screen.
    const norm = (x) => String(x || '').trim().toLowerCase();
    const sizeOf = (v) => norm(v.size) || norm(v.title);
    const bySize = (v) => !size || sizeOf(v) === norm(size);
    const matchedVariant =
      variantList.find(
        (v) => v.isActive !== false && bySize(v) && color && v.color && norm(v.color) === norm(color)
      ) ||
      variantList.find((v) => v.isActive !== false && bySize(v) && !v.color) ||
      null;


    const variantSku = product.variantSku || matchedVariant?.sku || '';

    // Never send an empty SKU. The server would then have to guess which variant was meant, and
    // that is how the wrong line (often an inactive one) ended up in the cart.
    if (!variantSku) {
      showCartToast('That combination is not available. Please pick another size or colour.');
      return;
    }
    // The variant's price wins over the product's, otherwise a cheaper/ dearer size is mispriced.
    const itemPrice = Number(matchedVariant?.price ?? product.price ?? 0);

    // Always sync to MongoDB (with user auth token or x-guest-id header)
    try {
      const result = await addToCartApi({
        productId: product._id || product.productId || product.id,
        variantSku,
        selectedSize: size,
        selectedColor: color,
        quantity: qtyToAdd
      });

      // Adopt the server cart. The line the server returns carries the full shape (sizes,
      // colours, weight, pack), so the card renders correctly straight away instead of showing a
      // reduced version until the next refresh.
      if (result && result.success === false) {
        showCartToast(result.message || 'Could not save this item to your cart.');
      } else {
        applyServerCart(result);
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
      const res = qty === 0
        ? await removeCartItemApi(itemId)
        : await updateCartItemApi(itemId, { quantity: qty });

      if (res && res.success === false) {
        showCartToast(res.message || 'Could not update your cart.');
      } else {
        applyServerCart(res);
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

    // One validated server call. It checks the combination exists and has stock, merges into an
    // existing line if needed, and returns the recomputed cart. The previous remove-then-add
    // could leave the cart missing the line entirely if the second call failed.
    const payload =
      field === 'selectedSize'
        ? { selectedSize: value, selectedColor: current.selectedColor }
        : { selectedSize: current.selectedSize, selectedColor: value };

    try {
      const res = await updateCartItemVariantApi(itemId, payload);
      if (res && res.success === false) {
        showCartToast(res.message || 'Could not change the variant.');
        return;
      }
      applyServerCart(res);
    } catch (err) {
      console.warn('Cart variant change failed:', err);
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
      const res = await removeCartItemApi(itemId);
      if (res && res.success === false) {
        showCartToast(res.message || 'Could not remove that item.');
      } else {
        applyServerCart(res);
      }
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
