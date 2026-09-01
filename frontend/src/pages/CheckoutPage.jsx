import React, { useState } from 'react';
import { 
  MapPin, 
  Edit3, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle, 
  ChevronRight,
  QrCode,
  Banknote,
  Building2,
  Lock,
  Check
} from 'lucide-react';
import ProductGraphic from '../components/ProductGraphic';
import Button from '../components/Button';
import { createCheckoutOrderApi } from '../services/api';

export default function CheckoutPage({
  checkoutData,
  userAddress,
  onChangeAddress,
  onPlaceOrder,
  onNavigateCart,
  onNavigateHome,
  theme,
  isMobileView
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);

  const items = checkoutData?.items || [];
  const subtotal = checkoutData?.subtotal || 0;
  const discountAmount = checkoutData?.discountAmount || 0;
  const shippingFee = checkoutData?.shippingFee || 0;
  const totalAmount = checkoutData?.totalAmount || subtotal - discountAmount + shippingFee;
  const appliedCoupon = checkoutData?.appliedCoupon;

  const handleConfirmOrder = async () => {
    setIsPlacingOrder(true);
    const mockOrderId = `AVN-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `AVN-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderDetails = {
      orderId: mockOrderId,
      transactionId,
      items: (items || []).map((item) => ({
        ...item,
        slug: item.slug || item.productSlug || item.id || `product-${Date.now()}-${Math.random()}`,
        productId: item.productId || item.id,
        acceptedAtDelivery: false,
        deliveryStatus: 'delivered'
      })),
      address: userAddress,
      financials: { subtotal, discountAmount, shippingFee, totalAmount },
      paymentMethod: selectedPaymentMethod,
      createdAt: new Date().toISOString(),
      customerEmail: (() => {
        try {
          const savedUser = JSON.parse(localStorage.getItem('avn-user') || 'null');
          return savedUser?.email || 'guest@avngear.com';
        } catch (e) {
          return 'guest@avngear.com';
        }
      })(),
      customerName: (() => {
        try {
          const savedUser = JSON.parse(localStorage.getItem('avn-user') || 'null');
          return savedUser?.name || userAddress?.fullName || 'AVN Customer';
        } catch (e) {
          return userAddress?.fullName || 'AVN Customer';
        }
      })(),
      status: 'Processing'
    };

    const orderPayload = {
      items: (items || []).map((item) => ({
        ...item,
        id: item.productId || item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        slug: item.slug || item.productId || item.id
      })),
      shippingAddress: userAddress,
      paymentMethod: selectedPaymentMethod,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      customerEmail: (() => {
        try {
          const savedUser = JSON.parse(localStorage.getItem('avn-user') || 'null');
          return savedUser?.email || 'guest@avngear.com';
        } catch (e) {
          return 'guest@avngear.com';
        }
      })(),
      customerName: (() => {
        try {
          const savedUser = JSON.parse(localStorage.getItem('avn-user') || 'null');
          return savedUser?.name || userAddress?.fullName || 'AVN Customer';
        } catch (e) {
          return userAddress?.fullName || 'AVN Customer';
        }
      })()
    };

    try {
      const apiResponse = await createCheckoutOrderApi(orderPayload);
      const backendOrder = apiResponse?.data || orderDetails;

      const savedOrders = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
      localStorage.setItem('avn-user-orders', JSON.stringify([...savedOrders, backendOrder]));

      if (apiResponse?.success) {
        orderDetails.transactionId = backendOrder.transactionId || orderDetails.transactionId;
        orderDetails.orderId = backendOrder.orderId || orderDetails.orderId;
        orderDetails.status = backendOrder.status || orderDetails.status;
        orderDetails.paymentStatus = backendOrder.paymentStatus || orderDetails.paymentStatus;
      }
    } catch (e) {
      console.warn('Unable to persist order history locally', e);
    }

    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderCompleted(orderDetails);
      if (onPlaceOrder) onPlaceOrder(orderDetails);
    }, 1200);
  };

  // If order was successfully placed, render Order Success Confirmation Screen
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-12 transition-colors duration-300 flex items-center justify-center">
        <div className="max-w-xl w-full glass-panel p-8 sm:p-10 rounded-3xl border border-green-500/30 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto border border-green-500/40">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
              ORDER CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-3xl font-sans font-black italic uppercase text-[var(--text-main)]">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-sub)]">
              Your order <span className="font-mono font-bold text-[#FF1E27]">{orderCompleted.orderId}</span> has been received and is being prepared for dispatch.
            </p>
          </div>

          {/* Delivery Summary Box */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-left text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-bold font-heading">
              <span>DELIVERY ADDRESS</span>
              <span className="text-[10px] text-[#FF1E27] uppercase">{orderCompleted.address?.type || 'Home'}</span>
            </div>
            <p className="font-bold text-[var(--text-main)]">{orderCompleted.address?.fullName} ({orderCompleted.address?.phone})</p>
            <p className="text-[var(--text-sub)]">{orderCompleted.address?.street}, {orderCompleted.address?.city}, {orderCompleted.address?.state} - {orderCompleted.address?.pincode}</p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onNavigateHome}
              variant="primary" className="flex-1"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>CONTINUE SHOPPING</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-6 px-4 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto space-y-6">

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onNavigateCart}
              variant="icon"
              title="Back to Cart"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-sans font-black italic uppercase tracking-wide text-[var(--text-main)]">
              CHECKOUT
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-heading font-extrabold uppercase text-[var(--text-sub)]">
            <span className="text-green-500 flex items-center gap-1">
              <Check className="w-4 h-4" /> Cart
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#FF1E27]">Delivery & Payment</span>
            <ChevronRight className="w-4 h-4" />
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Delivery Address & Payment Methods (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. DELIVERY ADDRESS CARD (View & Edit) */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 font-extrabold font-heading text-sm sm:text-base uppercase text-[var(--text-main)]">
                  <MapPin className="w-5 h-5 text-[#FF1E27]" />
                  <span>1. Delivery Address</span>
                </div>
                <Button
                  onClick={onChangeAddress}
                  variant="tag"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change / Edit</span>
                </Button>
              </div>

              {userAddress ? (
                <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-subtle)] space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[var(--text-main)] text-base">
                      {userAddress.fullName}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase font-heading bg-[#FF1E27]/10 text-[#FF1E27] px-2.5 py-0.5 rounded-full border border-[#FF1E27]/30">
                      {userAddress.type || 'Home'}
                    </span>
                  </div>
                  <p className="text-[var(--text-sub)] text-xs leading-relaxed">
                    {userAddress.street}, {userAddress.city}, {userAddress.state} - <span className="font-mono font-bold text-[var(--text-main)]">{userAddress.pincode}</span>
                  </p>
                  <p className="text-xs font-mono text-[var(--text-sub)] pt-1 flex items-center gap-1">
                    <span>Phone:</span>
                    <span className="font-bold text-[var(--text-main)]">+91 {userAddress.phone}</span>
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-[var(--text-sub)]">No delivery address saved yet.</p>
                  <Button
                    onClick={onChangeAddress}
                    variant="primary" size="md"
                  >
                    Add Address Now
                  </Button>
                </div>
              )}
            </div>

            {/* 2. PAYMENT METHODS CARD */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-md">
              <div className="flex items-center gap-2 font-extrabold font-heading text-sm sm:text-base uppercase text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-3">
                <CreditCard className="w-5 h-5 text-[#FF1E27]" />
                <span>2. Select Payment Method</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'upi',
                    name: 'UPI / QR Code',
                    desc: 'Google Pay, PhonePe, Paytm, BHIM UPI',
                    icon: QrCode
                  },
                  {
                    id: 'card',
                    name: 'Credit / Debit Card',
                    desc: 'Visa, Mastercard, RuPay, Maestro',
                    icon: CreditCard
                  },
                  {
                    id: 'netbanking',
                    name: 'Net Banking',
                    desc: 'HDFC, ICICI, SBI, Axis & all Indian banks',
                    icon: Building2
                  },
                  {
                    id: 'cod',
                    name: 'Cash on Delivery (COD)',
                    desc: 'Pay with cash upon express dispatch delivery',
                    icon: Banknote
                  }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedPaymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#FF1E27] bg-[#FF1E27]/5 shadow-md'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)]/40 hover:border-[var(--text-sub)]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-[#FF1E27] text-white' : 'bg-[var(--border-subtle)] text-[var(--text-sub)]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm uppercase font-heading text-[var(--text-main)] block">
                            {pm.name}
                          </span>
                          <span className="text-xs text-[var(--text-sub)] font-mono">
                            {pm.desc}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FF1E27] bg-[#FF1E27]' : 'border-[var(--text-sub)]'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* UPI ID Input (if UPI selected) */}
              {selectedPaymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                    Enter UPI ID (VPA)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okicici"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 bg-[var(--bg-main)] text-[var(--text-main)] text-xs px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="tag"
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Place Order CTA (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-sans font-black italic uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />
                  <span>Order Summary</span>
                </h2>
                <span className="text-xs font-mono font-bold text-[#FF1E27] bg-[#FF1E27]/10 px-2.5 py-0.5 rounded-full border border-[#FF1E27]/30">
                  {items.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[var(--border-subtle)]">
                {items.map((item) => (
                  <div key={item.id || item.productId} className="pt-3 first:pt-0 flex items-center gap-3">
                    <ProductGraphic
                      image={item.image}
                      imageLight={item.imageLight}
                      type={item.imageType}
                      theme={theme}
                      className="w-14 h-14 rounded-lg shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-main)]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold uppercase font-sans tracking-wide text-[var(--text-main)] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[var(--text-sub)] font-mono">
                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-black font-heading text-[#FF1E27]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[var(--text-sub)]">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-mono font-bold text-[var(--text-main)]">₹{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-500 font-bold">
                    <span>Discount / Savings</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[var(--text-sub)]">
                  <span>Express Shipping</span>
                  <span className="font-mono font-bold text-green-500 uppercase">FREE</span>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between text-base font-black font-heading text-[var(--text-main)]">
                  <span>Total Amount Payable</span>
                  <span className="text-xl text-[#FF1E27]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <Button
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder || !userAddress}
                variant="primary" fullWidth
              >
                {isPlacingOrder ? (
                  <span>PROCESSING ORDER...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>PLACE ORDER • ₹{totalAmount}</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--text-sub)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>256-Bit SSL Encrypted & 100% Genuine AVN Guarantee</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
