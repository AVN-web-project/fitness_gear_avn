import React, { useState } from 'react';
import { Tag, Sparkles, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function DiscountPromo({
  subtotal: propSubtotal,
  activeSelectedItems: propActiveItems,
  appliedCoupon: propAppliedCoupon,
  setAppliedCoupon: propSetAppliedCoupon,
  className = ''
}) {
  const cartContext = useCart();

  const subtotal = propSubtotal !== undefined ? propSubtotal : cartContext.subtotal;
  const activeSelectedItems = propActiveItems || cartContext.cartItems;
  const appliedCoupon = propAppliedCoupon !== undefined ? propAppliedCoupon : cartContext.appliedCoupon;
  const setAppliedCoupon = propSetAppliedCoupon || cartContext.setAppliedCoupon;

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const availablePromos = [
    { code: 'AVN10', desc: '10% OFF on all items' },
    { code: 'POWER20', desc: '20% OFF on orders > ₹1500' },
    { code: 'BULK500', desc: 'Flat ₹500 OFF on orders > ₹2500' },
    { code: 'MULTI15', desc: '15% OFF for 2+ items' }
  ];

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const code = (codeToApply || '').trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponMessage(null);

    if (cartContext.validateCart) {
      const validationResult = await cartContext.validateCart(code);
      if (validationResult && validationResult.appliedCoupon) {
        setCouponMessage(`🎉 Coupon '${validationResult.appliedCoupon.code}' applied! Savings: ₹${validationResult.discountAmount}`);
        return;
      } else if (validationResult && validationResult.couponError) {
        setCouponError(validationResult.couponError);
        setAppliedCoupon(null);
        return;
      }
    }

    // Local fallback validation
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
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
    setCouponError(null);
  };

  return (
    <div className={`glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] space-y-3 ${className}`}>
      <h3 className="text-xs font-extrabold font-heading uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-[#C41E24]" />
        Promotions & Coupon Codes
      </h3>

      {appliedCoupon ? (
        <div className="p-3 rounded-xl bg-[#C41E24]/10 border border-[#C41E24]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#FF1E27] font-bold">
            <Sparkles className="w-4 h-4 text-[#FF1E27]" />
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
            placeholder="Enter promo code"
            className="flex-1 bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-mono uppercase px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:border-[#C41E24] focus:outline-none"
          />
          <button
            onClick={() => handleApplyCoupon()}
            className="bg-[#C41E24] hover:bg-[#A8191E] px-4 py-2 rounded-lg text-xs font-bold uppercase text-white cursor-pointer"
          >
            APPLY
          </button>
        </div>
      )}

      {couponMessage && (
        <p className="text-[11px] text-[#FF1E27] font-bold bg-[#C41E24]/10 p-2 rounded border border-red-500/30">
          {couponMessage}
        </p>
      )}
      {couponError && (
        <p className="text-[11px] text-red-400 font-bold bg-[#C41E24]/10 p-2 rounded border border-red-500/30">
          {couponError}
        </p>
      )}

      {/* Available Promo Code Badges */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {availablePromos.map((p) => (
          <button
            key={p.code}
            onClick={() => {
              setCouponCode(p.code);
              handleApplyCoupon(p.code);
            }}
            className="p-1.5 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#C41E24] text-left transition-colors cursor-pointer group"
          >
            <div className="text-[10px] font-mono font-extrabold text-[#C41E24] flex items-center justify-between">
              <span>{p.code}</span>
              <Copy className="w-2.5 h-2.5 text-[var(--text-sub)]" />
            </div>
            <div className="text-[8px] text-[var(--text-sub)] line-clamp-1">{p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
