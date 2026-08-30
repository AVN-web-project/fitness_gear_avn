import DiscountPromo from '../components/DiscountPromo';
import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Copy,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Share2,
  Check,
  Info,
  Gift,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ProductGraphic from '../components/ProductGraphic';
import { createCheckoutOrderApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function CartPage({
  isMobileView = false,
  cartItems: propsCartItems,
  onUpdateQuantity: propsUpdateQuantity,
  onRemoveItem: propsRemoveItem,
  onUpdateVariant: propsUpdateVariant,
  onNavigateHome,
  onClearCart: propsClearCart,
  onProceedToCheckout,
  onSelectProduct,
  theme = 'dark'
}) {
  const context = useCart();

  const rawCartItems = propsCartItems || context.cartItems;
  const onUpdateQuantity = propsUpdateQuantity || context.updateQuantity;
  const onRemoveItem = propsRemoveItem || context.removeItem;
  const onUpdateVariant = propsUpdateVariant || context.updateVariant;
  const onClearCart = propsClearCart || context.clearCart;

  // Selected item checkboxes (Amazon style item selection)
  const [selectedItemIds, setSelectedItemIds] = useState(() =>
    rawCartItems.map((i) => i.id || i.itemId || i.productId)
  );

  // Saved for Later state
  const [savedForLaterItems, setSavedForLaterItems] = useState([]);

  // Coupon & EMI State
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [isEmiAccordionOpen, setIsEmiAccordionOpen] = useState(false);

  // Order processing modal state
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Available Promo Codes List
  const availablePromos = [
    { code: 'AVN10', desc: '10% OFF on all items' },
    { code: 'POWER20', desc: '20% OFF on orders > ₹1500' },
    { code: 'BULK500', desc: 'Flat ₹500 OFF on orders > ₹2500' },
    { code: 'MULTI15', desc: '15% OFF for 2+ items' }
  ];

  // Filter items into active checked items and unchecked items
  const activeSelectedItems = rawCartItems.filter((i) =>
    selectedItemIds.includes(i.id || i.itemId || i.productId)
  );

  // Financial calculations based on CHECKED items (Amazon style)
  const subtotal = activeSelectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = context.freeShippingThreshold || 1499;
  const isFreeShipping = subtotal >= freeShippingThreshold || activeSelectedItems.length === 0;
  const shippingFee = isFreeShipping ? 0 : 99;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const appliedCoupon = context.appliedCoupon;
  const setAppliedCoupon = context.setAppliedCoupon;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'AVN10') discountAmount = Math.round(subtotal * 0.1);
    else if (appliedCoupon.code === 'POWER20' && subtotal >= 1500) discountAmount = Math.round(subtotal * 0.2);
    else if (appliedCoupon.code === 'BULK500' && subtotal >= 2500) discountAmount = 500;
    else if (appliedCoupon.code === 'MULTI15' && activeSelectedItems.reduce((a, b) => a + b.quantity, 0) >= 2) discountAmount = Math.round(subtotal * 0.15);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Toggle single item checkbox
  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Toggle Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedItemIds.length === rawCartItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(rawCartItems.map((i) => i.id || i.itemId || i.productId));
    }
  };

  // Move item to Saved for Later
  const handleSaveForLater = (item) => {
    const itemId = item.id || item.itemId || item.productId;
    onRemoveItem(itemId);
    setSavedForLaterItems((prev) => [...prev, item]);
    showToast(`Moved ${item.name} to Saved for Later`);
  };

  // Move item back to Active Cart
  const handleMoveToCart = (item) => {
    const itemId = item.id || item.itemId || item.productId;
    setSavedForLaterItems((prev) => prev.filter((i) => (i.id || i.itemId || i.productId) !== itemId));
    if (context.addToCart) context.addToCart(item);
    setSelectedItemIds((prev) => [...prev, itemId]);
    showToast(`Moved ${item.name} back to Shopping Cart`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Apply Coupon Code handler
  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const code = (codeToApply || '').trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponMessage(null);

    const validationResult = await context.validateCart(code);
    if (validationResult && validationResult.appliedCoupon) {
      setCouponMessage(`🎉 Coupon '${validationResult.appliedCoupon.code}' applied! Savings: ₹${validationResult.discountAmount}`);
    } else if (validationResult && validationResult.couponError) {
      setCouponError(validationResult.couponError);
      setAppliedCoupon(null);
    } else {
      if (code === 'AVN10') {
        if (subtotal < 500) setCouponError("Coupon 'AVN10' requires minimum subtotal of ₹500.");
        else { setAppliedCoupon({ code: 'AVN10', value: 10, type: 'percentage' }); setCouponMessage("🎉 Coupon 'AVN10' applied successfully!"); }
      } else if (code === 'POWER20') {
        if (subtotal < 1500) setCouponError("Coupon 'POWER20' requires minimum order of ₹1500.");
        else { setAppliedCoupon({ code: 'POWER20', value: 20, type: 'percentage' }); setCouponMessage("🎉 Coupon 'POWER20' applied successfully!"); }
      } else if (code === 'BULK500') {
        if (subtotal < 2500) setCouponError("Coupon 'BULK500' requires minimum subtotal of ₹2500.");
        else { setAppliedCoupon({ code: 'BULK500', value: 500, type: 'fixed' }); setCouponMessage("🎉 Coupon 'BULK500' applied successfully!"); }
      } else if (code === 'MULTI15') {
        const totalQty = activeSelectedItems.reduce((a, b) => a + b.quantity, 0);
        if (totalQty < 2) setCouponError("Coupon 'MULTI15' requires at least 2 selected items.");
        else { setAppliedCoupon({ code: 'MULTI15', value: 15, type: 'percentage' }); setCouponMessage("🎉 Multi-Item discount applied (15% OFF)!"); }
      } else {
        setCouponError("Invalid promo code. Try AVN10, POWER20, BULK500, or MULTI15.");
        setAppliedCoupon(null);
      }
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
    setCouponError(null);
  };

  // Direct Checkout Trigger
  const handleProceedClick = async () => {
    if (activeSelectedItems.length === 0) return;

    if (onProceedToCheckout) {
      onProceedToCheckout({
        items: activeSelectedItems,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount: finalTotal,
        appliedCoupon,
        isGiftOrder
      });
      return;
    }

    setIsSubmittingOrder(true);
    const payload = {
      items: activeSelectedItems.map((item) => ({
        id: item.id || item.productId,
        productId: item.id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || (item.sizes ? item.sizes[0] : 'Standard'),
        selectedColor: item.selectedColor || (item.colors ? item.colors[0].name : 'Stealth Black'),
        selectedPack: item.selectedPack || (item.packQuantityOptions ? item.packQuantityOptions[0] : 'Single')
      })),
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount: finalTotal,
      isGiftOrder
    };

    const res = await createCheckoutOrderApi(payload);
    setIsSubmittingOrder(false);

    if (res && res.success && res.data) {
      setCompletedOrder(res.data);
      if (onClearCart) onClearCart();
    } else {
      const fallbackOrder = {
        orderId: `AVN-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        items: payload.items,
        financials: { subtotal, discountAmount, shippingFee, totalAmount: finalTotal },
        status: 'pending_payment',
        createdAt: new Date().toISOString()
      };
      setCompletedOrder(fallbackOrder);
      if (onClearCart) onClearCart();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-6 px-4 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="max-w-[1480px] mx-auto space-y-6">

        {/* 1. TOP SYSTEM ALERT / NOTIFICATION BANNER (Amazon style amber/gold notice box) */}
        <div className="p-4 rounded-xl bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-[var(--text-main)] text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold font-heading text-sm text-[#FF1E27]">
            <Info className="w-4 h-4 text-[#FF1E27] shrink-0" />
            <span>Important messages for items in your Cart:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 text-[11px] font-mono text-[var(--text-main)] opacity-90">
            <li>Standard Express Shipping rates applied to all cart line items.</li>
            <li>Free Express Dispatch available for all orders placed before 6:00 PM today.</li>
          </ul>
        </div>

        {/* 2. EXPRESS DELIVERY BANNER (Amazon Now / Express Banner) */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C41E24]/20 flex items-center justify-center border border-[#C41E24]/40">
              <Truck className="w-4 h-4 text-[#C41E24]" />
            </div>
            <div>
              <span className="font-extrabold uppercase font-heading text-[var(--text-main)] block">
                Guaranteed Express Delivery from AVN Warehouse
              </span>
              <span className="text-[10px] text-[var(--text-sub)] font-mono">
                Dispatched within 24 Hours • 100% Genuine Gear & Free Size Exchanges
              </span>
            </div>
          </div>
          <span className="text-[#C41E24] font-mono font-bold text-xs bg-[#C41E24]/10 px-2.5 py-1 rounded-md border border-[#C41E24]/30 hidden sm:inline">
            Fast Delivery Available
          </span>
        </div>

        {/* 3. MAIN SKELETAL LAYOUT: Left Cart List (75%) vs Right Sticky Summary Sidebar (25%) */}
        {rawCartItems.length === 0 && savedForLaterItems.length === 0 && !completedOrder ? (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-6 max-w-xl mx-auto border border-[var(--border-subtle)] my-12">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/30">
              <ShoppingBag className="w-12 h-12 text-[#C41E24]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-sans font-black italic text-[var(--text-main)] uppercase">YOUR SHOPPING CART IS EMPTY</h2>
              <p className="text-sm text-[var(--text-sub)]">
                Explore our heavy-duty knee wraps, wrist supports, elbow compression sleeves, and lifting accessories.
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="bg-[#C41E24] hover:bg-[#A8191E] active:scale-[0.98] px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>EXPLORE PRODUCTS</span>
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 items-start ${isMobileView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
            
            {/* LEFT MAIN COLUMN: Cart Items & Saved for Later (Cols 1-8) */}
            <div className={`${isMobileView ? "col-span-1" : "lg:col-span-8"} space-y-6`}>
              
              {/* CART ITEMS CONTAINER CARD */}
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] space-y-5">
                
                {/* Header Bar: Title, Select All link & Price Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div>
                    <h1 className="text-2xl font-sans font-black italic uppercase tracking-wide text-[var(--text-main)] flex items-center gap-2.5">
                      Shopping Cart
                      <span className="text-xs font-mono font-bold text-[#C41E24] bg-[#C41E24]/10 px-2.5 py-0.5 rounded-full border border-red-500/30 not-italic">
                        {rawCartItems.reduce((a, b) => a + b.quantity, 0)} Items
                      </span>
                    </h1>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-[#C41E24] hover:underline font-bold mt-1 inline-block cursor-pointer"
                    >
                      {selectedItemIds.length === rawCartItems.length ? 'Deselect all items' : 'Select all items'}
                    </button>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider hidden sm:block">
                    Price
                  </span>
                </div>

                {/* ITEM CARDS LIST */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {rawCartItems.map((item) => {
                    const itemIdKey = item.id || item.itemId || item.productId;
                    const isChecked = selectedItemIds.includes(itemIdKey);
                    const maxStock = item.stockQuantity || 10;
                    const isAtStockLimit = item.quantity >= maxStock;

                    return (
                      <div
                        key={itemIdKey}
                        className={`p-4 sm:p-5 my-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)]/30 hover:border-[#FF1E27]/40 transition-all duration-300 shadow-sm space-y-3 ${!isChecked ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-3 sm:gap-5">
                          
                          {/* Item Selection Checkbox */}
                          <div className="pt-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemSelection(itemIdKey)}
                              className="w-4 h-4 accent-[#FF1E27] rounded cursor-pointer"
                              title="Select item for purchase"
                            />
                          </div>

                          {/* Product Image Thumbnail */}
                          <div
                            onClick={() => onSelectProduct && onSelectProduct(item)}
                            className="cursor-pointer shrink-0"
                          >
                            <ProductGraphic
                              image={item.image}
                              imageLight={item.imageLight}
                              type={item.imageType}
                              theme={theme}
                              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Product Details (Shifted Rightward) */}
                          <div className="flex-1 min-w-0 pl-1 sm:pl-2 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                {/* Bolder & More Prominent Product Name */}
                                <h3
                                  onClick={() => onSelectProduct && onSelectProduct(item)}
                                  className="text-base sm:text-lg lg:text-xl font-black font-sans italic uppercase tracking-wider text-[var(--text-main)] hover:text-[#FF1E27] transition-colors cursor-pointer leading-tight line-clamp-2"
                                >
                                  {item.name}
                                </h3>

                                {/* Stock Status Badge & SKU */}
                                <div className="flex items-center gap-2 text-xs pt-0.5">
                                  <span className="text-[#FF1E27] font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> In stock
                                  </span>
                                  <span className="text-[var(--text-sub)]">•</span>
                                  <span className="text-[10px] text-[var(--text-sub)] font-mono">
                                    SKU: {item.sku || `AVN-${(item.id || '').toUpperCase()}`}
                                  </span>
                                </div>

                                {/* Delivery & Fulfilled Badge */}
                                <div className="flex items-center gap-2 text-[11px] text-[var(--text-sub)] pt-0.5 flex-wrap">
                                  <span className="text-[var(--text-main)] font-medium">
                                    FREE Express Delivery Fri, 28 Aug available
                                  </span>
                                  <span className="bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase font-heading">
                                    AVN Fulfilled
                                  </span>
                                </div>
                              </div>

                              {/* Price Display & Remove Button directly underneath Price Area */}
                              <div className="text-right shrink-0">
                                <span className="text-lg sm:text-xl font-black font-heading text-[#FF1E27] block leading-none">
                                  ₹{item.price * item.quantity}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="text-[11px] text-[var(--text-sub)] block mt-1 font-medium">
                                    ₹{item.price} each
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* In-Line Variant Dropdowns */}
                            <div className="flex items-center gap-3 pt-2 text-xs flex-wrap">
                              {item.sizes && item.sizes.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[var(--text-sub)] font-bold text-[10px] uppercase">Size:</span>
                                  <select
                                    value={item.selectedSize || item.sizes[0]}
                                    onChange={(e) => onUpdateVariant && onUpdateVariant(itemIdKey, 'selectedSize', e.target.value)}
                                    className="bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-bold px-2 py-0.5 rounded border border-[var(--border-subtle)] focus:border-[#C41E24] focus:outline-none"
                                  >
                                    {item.sizes.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {item.colors && item.colors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[var(--text-sub)] font-bold text-[10px] uppercase">Color:</span>
                                  <select
                                    value={item.selectedColor || item.colors[0].name}
                                    onChange={(e) => onUpdateVariant && onUpdateVariant(itemIdKey, 'selectedColor', e.target.value)}
                                    className="bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-bold px-2 py-0.5 rounded border border-[var(--border-subtle)] focus:border-[#C41E24] focus:outline-none"
                                  >
                                    {item.colors.map((c) => (
                                      <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Bottom Action Bar: Pill Quantity Selector & Links */}
                            <div className="flex items-center justify-between gap-3 pt-3 flex-wrap text-xs">
                              
                              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                              
                              {/* Compact Pill Quantity Selector */}
                              <div className="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-main)] overflow-hidden">
                                <button
                                  onClick={() => onUpdateQuantity(itemIdKey, item.quantity - 1)}
                                  className="px-2.5 py-1 text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
                                  title={item.quantity === 1 ? 'Remove Item' : 'Decrease Quantity'}
                                >
                                  {item.quantity === 1 ? (
                                    <Trash2 className="w-3.5 h-3.5 text-[#C41E24]" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className="px-3 text-xs font-extrabold font-heading text-[var(--text-main)] min-w-[28px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(itemIdKey, item.quantity + 1)}
                                  disabled={isAtStockLimit}
                                  className={`px-2.5 py-1 transition-colors ${
                                    isAtStockLimit
                                      ? 'text-gray-500 bg-gray-800/30 cursor-not-allowed'
                                      : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] cursor-pointer'
                                  }`}
                                  title="Increase Quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-[var(--text-sub)] font-mono">|</span>

                              {/* Action Links: Delete, Save for later, Share */}
                              <button
                                onClick={() => handleSaveForLater(item)}
                                className="text-[var(--text-sub)] hover:text-[#FF1E27] hover:underline font-medium cursor-pointer"
                              >
                                Save for later
                              </button>
                              <span className="text-[var(--text-sub)] font-mono">|</span>
                              <button
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({ title: item.name, url: window.location.href });
                                  } else {
                                    showToast('Copied product link to clipboard!');
                                  }
                                }}
                                className="text-[var(--text-sub)] hover:text-[var(--text-main)] hover:underline font-medium cursor-pointer flex items-center gap-1"
                              >
                                <Share2 className="w-3 h-3" /> Share
                              </button>
                              </div>

                              {/* Remove Button leveled horizontally with Save for later */}
                              <button
                                onClick={() => onRemoveItem(itemIdKey)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[#FF1E27] border border-red-500/30 hover:border-red-500/60 transition-all text-xs font-extrabold font-heading uppercase tracking-wider cursor-pointer group/rem shadow-sm ml-auto"
                                title="Remove from Cart"
                              >
                                <Trash2 className="w-3.5 h-3.5 group-hover/rem:scale-110 transition-transform" />
                                <span>Remove</span>
                              </button>

                              {isAtStockLimit && (
                                <span className="text-[10px] text-[#FF1E27] bg-red-950/60 px-2 py-0.5 rounded border border-[#FF1E27]/30 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Stock Limit Reached
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SAVED FOR LATER SECTION (Amazon style Saved Items container) */}
              {savedForLaterItems.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                  <h2 className="text-lg font-sans font-black italic uppercase tracking-wide text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-3">
                    Saved for Later ({savedForLaterItems.length} items)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedForLaterItems.map((item) => (
                      <div
                        key={item.id || item.itemId || item.productId}
                        className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex gap-3 items-center"
                      >
                        <ProductGraphic
                          image={item.image}
                          imageLight={item.imageLight}
                          type={item.imageType}
                          theme={theme}
                          className="w-16 h-16 rounded-lg shrink-0 border border-[var(--border-subtle)]"
                        />
                        <div className="flex-1 min-w-0 text-left space-y-1">
                          <h4 className="text-xs font-bold font-heading uppercase text-[var(--text-main)] truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs font-bold text-[#FF1E27]">₹{item.price}</p>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="text-xs bg-[#C41E24]/20 hover:bg-[#C41E24] text-white px-2.5 py-1 rounded-md border border-[#C41E24]/40 font-bold transition-all cursor-pointer inline-block"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TRUST & GUARANTEE BADGES CARD */}
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--text-sub)] text-center">
                <div className="space-y-1">
                  <ShieldCheck className="w-5 h-5 text-[#C41E24] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">100% Genuine Gear</div>
                  <div className="text-[10px]">Tested for extreme strength</div>
                </div>
                <div className="space-y-1">
                  <Truck className="w-5 h-5 text-[#C41E24] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">Dispatch in 24 Hours</div>
                  <div className="text-[10px]">Express delivery across India</div>
                </div>
                <div className="space-y-1">
                  <Lock className="w-5 h-5 text-[#C41E24] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">7-Day Replacements</div>
                  <div className="text-[10px]">Hassle-free size exchanges</div>
                </div>
              </div>

            </div>

            {/* RIGHT STICKY ORDER SUMMARY SIDEBAR (Cols 9-12) */}
            <div className={`${isMobileView ? "col-span-1 static" : "lg:col-span-4 sticky top-24"} space-y-5`}>
              
              {/* STICKY SUMMARY CARD (Amazon style primary Checkout box) */}
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
                
                {/* Free Shipping Qualification Notice & Progress Bar */}
                <div className="space-y-1.5 pb-3 border-b border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-sub)]">
                    {isFreeShipping ? (
                      <span className="text-[var(--text-main)] font-bold flex items-center gap-1">
                        <Check className="w-4 h-4 text-[#C41E24]" /> Part of your order qualifies for FREE delivery.
                      </span>
                    ) : (
                      <>Add <span className="font-extrabold text-[#C41E24]">₹{freeShippingThreshold - subtotal}</span> more to qualify for <span className="text-[var(--text-main)] font-bold">FREE Delivery</span>.</>
                    )}
                  </p>
                  <div className="w-full h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-gradient-to-r from-red-700 via-[#C41E24] to-red-500 transition-all duration-500 rounded-full"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Subtotal Display */}
                <div className="space-y-1">
                  <div className="text-lg font-extrabold font-heading text-[var(--text-main)]">
                    Subtotal ({activeSelectedItems.reduce((a, b) => a + b.quantity, 0)} items):{' '}
                    <span className="text-[#FF1E27] font-mono">₹{finalTotal}</span>
                  </div>
                  
                </div>

                {/* Gift Option Checkbox */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-sub)]">
                  <input
                    type="checkbox"
                    id="giftCheckbox"
                    checked={isGiftOrder}
                    onChange={(e) => setIsGiftOrder(e.target.checked)}
                    className="w-4 h-4 accent-[#C41E24] rounded cursor-pointer"
                  />
                  <label htmlFor="giftCheckbox" className="cursor-pointer flex items-center gap-1.5 font-medium">
                    <Gift className="w-3.5 h-3.5 text-[#FF1E27]" /> This order contains a gift
                  </label>
                </div>

                {/* PROCEED TO CHECKOUT / BUY BUTTON */}
                <button
                  onClick={handleProceedClick}
                  disabled={isSubmittingOrder || activeSelectedItems.length === 0}
                  className="w-full bg-[#C41E24] hover:bg-[#A8191E] active:scale-[0.98] py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Buy</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* EMI & Financial Details Accordion */}
                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden text-xs">
                  <button
                    onClick={() => setIsEmiAccordionOpen(!isEmiAccordionOpen)}
                    className="w-full p-3 bg-[var(--bg-main)] text-[var(--text-main)] font-bold flex items-center justify-between hover:bg-[var(--border-subtle)]/30 transition-colors"
                  >
                    <span>EMI Options Available</span>
                    {isEmiAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isEmiAccordionOpen && (
                    <div className="p-3 bg-[var(--bg-main)] text-[11px] text-[var(--text-sub)] space-y-1.5 border-t border-[var(--border-subtle)] font-mono">
                      <div>• No-Cost EMI starting from ₹350/mo on HDFC, ICICI, SBI Cards.</div>
                      <div>• Debit Card EMI available for eligible users.</div>
                    </div>
                  )}
                </div>

              </div>

              
            </div>

          </div>
        )}

        {/* ORDER CONFIRMATION / RECEIPT MODAL */}
        {completedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xl bg-[var(--bg-main)] border border-[#C41E24] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#C41E24]/10 flex items-center justify-center border border-[#C41E24]">
                  <CheckCircle2 className="w-10 h-10 text-[#C41E24]" />
                </div>
                <h2 className="text-2xl font-sans font-black italic text-[var(--text-main)] uppercase tracking-wider">
                  ORDER GENERATED SUCCESSFULLY!
                </h2>
                <div className="inline-flex items-center gap-2 bg-[#FF1E27]/10 text-[#FF1E27] text-xs font-mono font-bold px-3 py-1 rounded-full border border-[#FF1E27]/40">
                  <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-ping" />
                  <span>State: {completedOrder.status || 'pending_payment'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3 text-xs">
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2 font-mono">
                  <span className="text-[var(--text-sub)]">ORDER ID:</span>
                  <span className="text-[#C41E24] font-bold">{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[var(--text-sub)]">TOTAL PAYABLE:</span>
                  <span className="text-[#C41E24] font-extrabold text-sm">₹{completedOrder.financials?.totalAmount || finalTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  if (onNavigateHome) onNavigateHome();
                }}
                className="w-full bg-[#C41E24] hover:bg-[#A8191E] active:scale-[0.98] py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-none"
              >
                <span>CONTINUE SHOPPING</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#12121a] border border-[#C41E24] text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs font-heading flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#C41E24]" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}



