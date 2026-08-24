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
  const [cartItems, setCartItems] = useState([
    {
      ...LOCAL_PRODUCTS[0],
      quantity: 1,
      selectedSize: 'Standard 79"',
      selectedColor: 'Crimson Red',
      selectedPack: 'Single Pair (2 Wraps)'
    },
    {
      ...LOCAL_PRODUCTS[2],
      quantity: 1,
      selectedSize: '18 Inch Competition',
      selectedColor: 'Crimson Red',
      selectedPack: 'Single Pair (2 Wraps)'
    }
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Initial cart synchronization with /api/cart endpoint
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
        return prevItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + qtyToAdd, product.stockQuantity || 10) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...product,
          id: product.id || product.productId,
          productId: product.id || product.productId,
          quantity: qtyToAdd,
          selectedSize: size,
          selectedColor: color,
          selectedPack: pack
        }
      ];
    });

    const res = await addToCartApi({
      productId: product.id || product.productId,
      name: product.name,
      price: product.price,
      quantity: qtyToAdd,
      selectedSize: size,
      selectedColor: color,
      selectedPack: pack,
      image: product.image,
      imageLight: product.imageLight,
      imageType: product.imageType
    });

    if (res && res.data && res.data.items) {
      setCartItems(res.data.items);
      setIsBackendConnected(true);
    }

    showToast(`Added ${product.name} to cart!`);
  };

  // Update Line Item Quantity (Optimistic State Update + Syncs with PATCH /api/cart/:itemId)
  const updateQuantity = async (id, newQty) => {
    if (newQty <= 0) {
      return removeItem(id);
    }

    const item = cartItems.find((i) => i.id === id || i.itemId === id || i.productId === id);
    const maxStock = item?.stockQuantity || 10;
    const safeQty = Math.min(newQty, maxStock);

    setCartItems((prev) =>
      prev.map((i) => ((i.id === id || i.itemId === id || i.productId === id) ? { ...i, quantity: safeQty } : i))
    );

    const targetId = item?.itemId || id;
    const res = await updateCartItemApi(targetId, { quantity: safeQty });
    if (res && res.data && res.data.items) {
      setCartItems(res.data.items);
    }
  };

  // Update Line Item Variant Selection (Optimistic State Update + Syncs with PATCH /api/cart/:itemId)
  const updateVariant = async (id, field, value) => {
    setCartItems((prev) =>
      prev.map((item) =>
        (item.id === id || item.itemId === id || item.productId === id) ? { ...item, [field]: value } : item
      )
    );

    const item = cartItems.find((i) => i.id === id || i.itemId === id || i.productId === id);
    const targetId = item?.itemId || id;
    const res = await updateCartItemApi(targetId, { [field]: value });
    if (res && res.data && res.data.items) {
      setCartItems(res.data.items);
    }
  };

  // Remove Line Item (Optimistic State Update + Syncs with DELETE /api/cart/:itemId)
  const removeItem = async (id) => {
    const itemToRemove = cartItems.find((i) => i.id === id || i.itemId === id || i.productId === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id && i.itemId !== id && i.productId !== id));

    const targetId = itemToRemove?.itemId || id;
    const res = await removeCartItemApi(targetId);
    if (res && res.data && res.data.items) {
      setCartItems(res.data.items);
    }
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Validate Cart & Coupon Code (Calls POST /api/cart/validate)
  const validateCart = async (code = couponCode) => {
    const res = await validateCartApi(cartItems, code);
    if (res && res.data) {
      if (res.data.items) setCartItems(res.data.items);
      if (res.data.appliedCoupon) setAppliedCoupon(res.data.appliedCoupon);
      return res.data;
    }
    return null;
  };

  // Financial calculations
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 1499;
  const isFreeShipping = subtotal >= freeShippingThreshold || cartItems.length === 0;
  const shippingFee = isFreeShipping ? 0 : 99;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'AVN10') discountAmount = Math.round(subtotal * 0.1);
    else if (appliedCoupon.code === 'POWER20' && subtotal >= 1500) discountAmount = Math.round(subtotal * 0.2);
    else if (appliedCoupon.code === 'BULK500' && subtotal >= 2500) discountAmount = 500;
    else if (appliedCoupon.code === 'MULTI15' && totalCartCount >= 2) discountAmount = Math.round(subtotal * 0.15);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCartCount,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        freeShippingThreshold,
        isFreeShipping,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        setCouponCode,
        appliedCoupon,
        setAppliedCoupon,
        toastMessage,
        isBackendConnected,
        addToCart,
        updateQuantity,
        updateVariant,
        removeItem,
        clearCart,
        validateCart,
        showToast
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
