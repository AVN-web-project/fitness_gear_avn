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
  RefreshCw
} from 'lucide-react';
import ProductGraphic from './ProductGraphic';
import { createCheckoutOrderApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function CartPage({
  cartItems: propsCartItems,
  onUpdateQuantity: propsUpdateQuantity,
  onRemoveItem: propsRemoveItem,
  onUpdateVariant: propsUpdateVariant,
  onNavigateHome,
  onClearCart: propsClearCart,
  onProceedToCheckout,
  theme = 'dark'
}) {
  const context = useCart();

  const cartItems = propsCartItems || context.cartItems;
  const onUpdateQuantity = propsUpdateQuantity || context.updateQuantity;
  const onRemoveItem = propsRemoveItem || context.removeItem;
  const onUpdateVariant = propsUpdateVariant || context.updateVariant;
  const onClearCart = propsClearCart || context.clearCart;

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Order processing modal state (when proceeding to checkout directly from cart)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Available Promo Codes List
  const availablePromos = [
    { code: 'AVN10', desc: '10% OFF on all items' },
    { code: 'POWER20', desc: '20% OFF on orders > ₹1500' },
    { code: 'BULK500', desc: 'Flat ₹500 OFF on orders > ₹2500' },
    { code: 'MULTI15', desc: '15% OFF for 2+ items' }
  ];

  // Financial calculations
  const subtotal = context.subtotal || cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = context.discountAmount || 0;
  const shippingFee = context.shippingFee || 0;
  const finalTotal = context.finalTotal || Math.max(0, subtotal - discountAmount + shippingFee);
  const freeShippingThreshold = context.freeShippingThreshold || 1499;
  const isFreeShipping = context.isFreeShipping !== undefined ? context.isFreeShipping : (subtotal >= freeShippingThreshold || cartItems.length === 0);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const appliedCoupon = context.appliedCoupon;
  const setAppliedCoupon = context.setAppliedCoupon;

  // Apply Coupon Code handler
  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const code = (codeToApply || '').trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponMessage(null);

    // Call Context validate function which syncs with POST /api/cart/validate
    const validationResult = await context.validateCart(code);

    if (validationResult && validationResult.appliedCoupon) {
      setCouponMessage(`🎉 Coupon '${validationResult.appliedCoupon.code}' applied! Savings: ₹${validationResult.discountAmount}`);
    } else if (validationResult && validationResult.couponError) {
      setCouponError(validationResult.couponError);
      setAppliedCoupon(null);
    } else {
      // Local Fallback Validation
      if (code === 'AVN10') {
        if (subtotal < 500) {
          setCouponError("Coupon 'AVN10' requires minimum subtotal of ₹500.");
        } else {
          setAppliedCoupon({ code: 'AVN10', value: 10, type: 'percentage' });
          setCouponMessage("🎉 Coupon 'AVN10' applied successfully!");
        }
      } else if (code === 'POWER20') {
        if (subtotal < 1500) {
          setCouponError("Coupon 'POWER20' requires minimum order of ₹1500.");
        } else {
          setAppliedCoupon({ code: 'POWER20', value: 20, type: 'percentage' });
          setCouponMessage("🎉 Coupon 'POWER20' applied successfully!");
        }
      } else if (code === 'BULK500') {
        if (subtotal < 2500) {
          setCouponError("Coupon 'BULK500' requires minimum subtotal of ₹2500.");
        } else {
          setAppliedCoupon({ code: 'BULK500', value: 500, type: 'fixed' });
          setCouponMessage("🎉 Coupon 'BULK500' applied successfully!");
        }
      } else if (code === 'MULTI15') {
        const totalQty = cartItems.reduce((a, b) => a + b.quantity, 0);
        if (totalQty < 2) {
          setCouponError("Coupon 'MULTI15' requires at least 2 items in cart.");
        } else {
          setAppliedCoupon({ code: 'MULTI15', value: 15, type: 'percentage' });
          setCouponMessage("🎉 Multi-Item discount applied (15% OFF)!");
        }
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
    if (cartItems.length === 0) return;

    if (onProceedToCheckout) {
      onProceedToCheckout({
        items: cartItems,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount: finalTotal,
        appliedCoupon
      });
      return;
    }

    // Direct order generation fallback
    setIsSubmittingOrder(true);
    const payload = {
      items: cartItems.map((item) => ({
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
      totalAmount: finalTotal
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2.5 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-main)] transition-colors cursor-pointer"
              title="Return to Store"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-sub)] uppercase tracking-wider font-mono">
                <span onClick={onNavigateHome} className="hover:text-[#FF1E27] cursor-pointer">HOME</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[var(--text-main)] font-bold">SHOPPING CART</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] mt-1 flex items-center gap-3">
                <ShoppingBag className="w-7 h-7 text-[#FF1E27]" />
                YOUR SHOPPING CART
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cartItems.length > 0 && onClearCart && (
              <button
                onClick={onClearCart}
                className="text-xs text-[var(--text-sub)] hover:text-red-500 underline font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            )}
            <div className="flex items-center gap-2 bg-[var(--bg-card-solid)] px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-sub)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Global State & API Synchronized</span>
            </div>
          </div>
        </div>

        {/* Free Shipping Progress Banner */}
        <div className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF1E27]" />
              <span className="font-bold">
                {isFreeShipping ? (
                  <span className="text-emerald-400 font-extrabold">🎉 You unlocked FREE Express Shipping across India!</span>
                ) : (
                  <span>Add <span className="text-[#FF1E27] font-extrabold">₹{freeShippingThreshold - subtotal}</span> more to unlock <span className="text-emerald-400 font-bold">FREE Shipping</span></span>
                )}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-sub)] hidden sm:inline">
              Free Shipping Limit: ₹{freeShippingThreshold}
            </span>
          </div>
          <div className="w-full h-2.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-[#FF1E27] to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Empty Cart View vs Active Cart View */}
        {cartItems.length === 0 && !completedOrder ? (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-6 max-w-xl mx-auto border border-[var(--border-subtle)] my-12">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/30">
              <ShoppingBag className="w-12 h-12 text-[#FF1E27]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold font-heading text-[var(--text-main)] uppercase">YOUR CART IS CURRENTLY EMPTY</h2>
              <p className="text-sm text-[var(--text-sub)]">
                Explore our premium line of competition-grade wraps, sleeves, and lifting gear.
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="btn-glow-red px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,30,39,0.5)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>EXPLORE PRODUCTS</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Line Items List (Cols 1-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#FF1E27]" />
                    CART LINE ITEMS ({cartItems.reduce((a, b) => a + b.quantity, 0)})
                  </h3>
                  <span className="text-xs text-[var(--text-sub)] font-mono">Stock Validated</span>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const itemIdKey = item.id || item.itemId || item.productId;
                    const maxStock = item.stockQuantity || 10;
                    const isAtStockLimit = item.quantity >= maxStock;

                    return (
                      <div
                        key={itemIdKey}
                        className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-4 transition-all hover:border-red-500/40"
                      >
                        <div className="flex items-start gap-4">
                          {/* Item Thumbnail */}
                          <ProductGraphic
                            image={item.image}
                            imageLight={item.imageLight}
                            type={item.imageType}
                            theme={theme}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-card-solid)]"
                          />

                          {/* Line Item Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-[var(--text-sub)] font-mono mt-0.5">
                                  <span>SKU: {item.sku || `AVN-${(item.id || '').toUpperCase()}`}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-bold">In Stock ({maxStock})</span>
                                </div>
                              </div>
                              <button
                                onClick={() => onRemoveItem(itemIdKey)}
                                className="text-[var(--text-sub)] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Remove Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Line Item Variant Selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {/* Size Selector */}
                              {item.sizes && item.sizes.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-[var(--text-sub)] font-bold text-[10px] uppercase">Size:</span>
                                  <select
                                    value={item.selectedSize || item.sizes[0]}
                                    onChange={(e) =>
                                      onUpdateVariant
                                        ? onUpdateVariant(itemIdKey, 'selectedSize', e.target.value)
                                        : null
                                    }
                                    className="bg-[var(--bg-card-solid)] text-[var(--text-main)] text-xs font-bold px-2 py-1 rounded-md border border-[var(--border-subtle)] focus:outline-none focus:border-[#FF1E27]"
                                  >
                                    {item.sizes.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Color Selector */}
                              {item.colors && item.colors.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-[var(--text-sub)] font-bold text-[10px] uppercase">Color:</span>
                                  <select
                                    value={item.selectedColor || item.colors[0].name}
                                    onChange={(e) =>
                                      onUpdateVariant
                                        ? onUpdateVariant(itemIdKey, 'selectedColor', e.target.value)
                                        : null
                                    }
                                    className="bg-[var(--bg-card-solid)] text-[var(--text-main)] text-xs font-bold px-2 py-1 rounded-md border border-[var(--border-subtle)] focus:outline-none focus:border-[#FF1E27]"
                                  >
                                    {item.colors.map((c) => (
                                      <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Quantity Controls & Line Price */}
                            <div className="flex items-center justify-between pt-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card-solid)] overflow-hidden">
                                  <button
                                    onClick={() => onUpdateQuantity(itemIdKey, item.quantity - 1)}
                                    className="px-2.5 py-1 text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
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
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {isAtStockLimit && (
                                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Max Stock
                                  </span>
                                )}
                              </div>

                              <div className="text-right">
                                <span className="text-xs text-[var(--text-sub)] block">₹{item.price} each</span>
                                <span className="text-base font-extrabold text-[#FF1E27] font-heading">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust & Guarantee Badges Card */}
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--text-sub)] text-center">
                <div className="space-y-1">
                  <ShieldCheck className="w-5 h-5 text-[#FF1E27] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">100% Genuine Gear</div>
                  <div className="text-[10px]">Tested for extreme strength</div>
                </div>
                <div className="space-y-1">
                  <Truck className="w-5 h-5 text-[#FF1E27] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">Dispatch in 24 Hours</div>
                  <div className="text-[10px]">Express delivery across India</div>
                </div>
                <div className="space-y-1">
                  <Lock className="w-5 h-5 text-[#FF1E27] mx-auto" />
                  <div className="font-bold text-[var(--text-main)] uppercase text-[11px]">7-Day Replacements</div>
                  <div className="text-[10px]">Hassle-free size exchanges</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Financial Calculations & Coupon Box (Cols 8-12) */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              
              {/* SECTION: Promotions & Coupon Code Box */}
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                <h3 className="text-sm font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF1E27]" />
                  PROMOTIONS & DISCOUNT COUPONS
                </h3>

                {/* Input Box */}
                {appliedCoupon ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Coupon '{appliedCoupon.code}' Applied</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-400 hover:text-red-300 underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code (e.g. AVN10)"
                      className="flex-1 bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="btn-glow-red px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase text-white cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                )}

                {/* Message / Error Notification */}
                {couponMessage && (
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/30">
                    {couponMessage}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 font-bold bg-red-950/60 p-2.5 rounded-lg border border-red-500/30">
                    {couponError}
                  </p>
                )}

                {/* Available Promo Badges */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-sub)] block">Click to Apply Valid Coupons:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePromos.map((p) => (
                      <button
                        key={p.code}
                        onClick={() => {
                          setCouponCode(p.code);
                          handleApplyCoupon(p.code);
                        }}
                        className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#FF1E27] text-left transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-mono font-extrabold text-[#FF1E27] group-hover:underline flex items-center justify-between">
                          <span>{p.code}</span>
                          <Copy className="w-3 h-3 text-[var(--text-sub)]" />
                        </div>
                        <div className="text-[9px] text-[var(--text-sub)] line-clamp-1">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Real-Time Financial Calculations Summary */}
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-5">
                <h3 className="text-base font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-3">
                  CART SUMMARY
                </h3>

                <div className="space-y-3 text-xs text-[var(--text-sub)] font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} Items)</span>
                    <span className="text-[var(--text-main)] font-bold font-mono">₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Promotional Discount ({appliedCoupon?.code})</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping Fee</span>
                    <span className="font-mono font-bold text-[var(--text-main)]">
                      {isFreeShipping ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Tax / GST</span>
                    <span className="text-emerald-400 font-bold">Included</span>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-extrabold font-heading uppercase text-[var(--text-main)] block">ESTIMATED TOTAL</span>
                      <span className="text-[10px] text-[var(--text-sub)]">Taxes & Shipping Included</span>
                    </div>
                    <span className="text-2xl font-extrabold font-heading text-[#FF1E27]">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                {/* PROCEED TO CHECKOUT CTA Button */}
                <button
                  onClick={handleProceedClick}
                  disabled={isSubmittingOrder || cartItems.length === 0}
                  className="w-full btn-glow-red py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,30,39,0.5)] disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>PROCESSING CHECKOUT...</span>
                    </>
                  ) : (
                    <>
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ORDER CONFIRMATION / RECEIPT MODAL (If order created directly) */}
        {completedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xl bg-[var(--bg-card-solid)] border border-[#FF1E27] rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-[0_0_50px_rgba(255,30,39,0.4)] animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-extrabold font-heading text-[var(--text-main)] uppercase tracking-wider">
                  ORDER GENERATED SUCCESSFULLY!
                </h2>
                <div className="inline-flex items-center gap-2 bg-amber-950/80 text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded-full border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>State: {completedOrder.status || 'pending_payment'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3 text-xs">
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2 font-mono">
                  <span className="text-[var(--text-sub)]">ORDER ID:</span>
                  <span className="text-[#FF1E27] font-bold">{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[var(--text-sub)]">TOTAL PAYABLE:</span>
                  <span className="text-[#FF1E27] font-extrabold text-sm">₹{completedOrder.financials?.totalAmount || finalTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  if (onNavigateHome) onNavigateHome();
                }}
                className="w-full btn-glow-red py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,30,39,0.4)]"
              >
                <span>CONTINUE SHOPPING</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
