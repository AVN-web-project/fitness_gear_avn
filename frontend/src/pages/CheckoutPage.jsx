import React, { useState } from 'react';
import {
  MapPin,
  Edit3,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  QrCode,
  Banknote,
  Building2,
  Lock,
  Check,
  PackageCheck,
  AlertCircle,
  Mail
} from 'lucide-react';
import ProductGraphic from '../components/ProductGraphic';
import Button from '../components/Button';
import {
  createCheckoutOrderApi,
  verifyPaymentApi
} from '../services/api';

export default function CheckoutPage({
  checkoutData,
  userAddress,
  onChangeAddress,
  onPlaceOrder,
  onNavigateCart,
  onNavigateHome,
  onViewOrderDetails,
  theme,
  isMobileView
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState('upi');

  const [upiId, setUpiId] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [orderCompleted, setOrderCompleted] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState('');

  const items = checkoutData?.items || [];

  /*
   * These values are displayed from the current cart/checkout
   * state only.
   *
   * They are NOT sent back to the backend as authoritative
   * financial values.
   */
  const subtotal = Number(checkoutData?.subtotal || 0);
  const shippingFee = Number(
    checkoutData?.shippingFee || 0
  );
  const discountAmount = Number(
    checkoutData?.discountAmount || 0
  );

  const baseTotalAmount = Math.max(
    0,
    subtotal - discountAmount + shippingFee
  );
  const handlingFee = subtotal === 0 ? 0 : 10;
  const codSurcharge = selectedPaymentMethod === 'cod' ? 50 : 0;
  const totalAmount = baseTotalAmount + handlingFee + codSurcharge;

  /**
   * Converts the frontend address representation into
   * the backend shippingAddress contract.
   */
  const buildShippingAddress = () => {
    if (!userAddress) {
      return null;
    }

    const street =
      userAddress.street ||
      [
        userAddress.houseNo,
        userAddress.flatNo,
        userAddress.area
      ]
        .filter(Boolean)
        .join(', ');

    return {
      title:
        userAddress.title ||
        userAddress.type ||
        'Home',

      fullName:
        userAddress.fullName ||
        'AVN Athlete',

      phone:
        userAddress.phone ||
        '',

      street:
        street || '',

      city:
        userAddress.city ||
        '',

      state:
        userAddress.state ||
        '',

      pincode:
        userAddress.pincode ||
        '',

      country:
        userAddress.country ||
        'India',

      isDefault:
        Boolean(userAddress.isDefault)
    };
  };

  const handleConfirmOrder = async () => {
    setErrorMessage('');

    if (!userAddress) {
      setErrorMessage(
        'Please select or provide a delivery address to place your order.'
      );
      return;
    }

    const shippingAddress =
      buildShippingAddress();

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      setErrorMessage(
        'Please complete your delivery address before placing the order.'
      );
      return;
    }

    /*
     * The backend checkout endpoint requires an
     * authenticated customer.
     *
     * Do not create a local/fake order here.
     */
    setIsPlacingOrder(true);

    try {
      /*
       * IMPORTANT:
       *
       * Do NOT send:
       * - items with client-controlled prices
       * - subtotal
       * - discount
       * - shippingFee
       * - totalPayable
       * - transactionId
       *
       * The backend should calculate these values from the
       * authenticated user's cart, Product/Variant records,
       * stock and coupon state.
       *
      * Online methods use the backend's development-only mock provider
      * until a payment gateway is configured.
       *
       * paymentMethod:
       *   - upi
       *   - card
       *   - netbanking
       *   - cod
       */
      const orderPayload = {
        shippingAddress,

        paymentProvider:
          selectedPaymentMethod === 'cod'
            ? 'cod'
            : 'mock',

        paymentMethod:
          selectedPaymentMethod
      };

      /*
       * Step 1:
       * Ask backend to create the order from the
       * authenticated user's cart.
       */
      const apiResponse =
        await createCheckoutOrderApi(
          orderPayload
        );

      if (
        !apiResponse?.success &&
        !apiResponse?.data
      ) {
        throw new Error(
          apiResponse?.message ||
          'Failed to create order on server.'
        );
      }

      const createdOrder =
        apiResponse?.data?.order ||
        apiResponse?.data;

      if (!createdOrder) {
        throw new Error(
          'The server did not return a created order.'
        );
      }

      let finalizedOrder =
        createdOrder;

      if (
        selectedPaymentMethod !== 'cod'
      ) {
        const orderId = createdOrder.orderId || createdOrder._id || createdOrder.id;
        const paymentId = `mock_pay_${Date.now()}`;
        const verificationResponse = await verifyPaymentApi({
          orderId,
          paymentId,
          signature: `mock_signature_${Date.now()}`,
          status: 'success'
        });

        if (!verificationResponse?.success || !verificationResponse?.data?.order) {
          throw new Error(verificationResponse?.message || 'Simulated payment could not be verified.');
        }

        const verifiedOrder = verificationResponse.data.order;
        finalizedOrder = {
          ...createdOrder,
          ...verifiedOrder,
          id: verifiedOrder._id || orderId,
          orderId: verifiedOrder._id || orderId,
          orderNumber: verifiedOrder.orderNumber || createdOrder.orderNumber,
          status: verifiedOrder.orderStatus,
          paymentStatus: verifiedOrder.paymentInfo?.paymentStatus,
          paymentMethod: verifiedOrder.paymentInfo?.method || selectedPaymentMethod
        };
      }

      /*
       * Order has been successfully created by the backend.
       */
      if (
        typeof window !== 'undefined'
      ) {
        sessionStorage.removeItem(
          'avn-guest-id'
        );

        sessionStorage.removeItem(
          'avn-session-cart'
        );
      }

      setOrderCompleted(
        finalizedOrder
      );

      if (onPlaceOrder) {
        onPlaceOrder(
          finalizedOrder
        );
      }
    } catch (error) {
      console.error(
        'Checkout order creation failed:',
        error
      );

      setErrorMessage(
        error?.message ||
        'Unable to place your order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /*
   * ORDER SUCCESS CONFIRMATION SCREEN
   */
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-12 transition-colors duration-300 flex items-center justify-center">
        <div className="max-w-xl w-full glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">

          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              ✓ ORDER CONFIRMED
            </span>

            <h1 className="text-2xl sm:text-3xl font-sans font-black italic uppercase text-[var(--text-main)]">
              THANK YOU FOR YOUR ORDER!
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-sub)]">
              Order{' '}
              <span className="font-mono font-bold text-[#FF1E27]">
                {orderCompleted.orderNumber ||
                  orderCompleted.orderId}
              </span>{' '}
              has been placed and queued for express dispatch.
            </p>
            <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 pt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>A confirmation email with your invoice details has been sent to your inbox.</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-left text-xs space-y-2">

            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-bold font-heading">
              <span>
                DELIVERY ADDRESS
              </span>

              <span className="text-[10px] text-[#FF1E27] uppercase">
                {orderCompleted.shippingAddress?.title ||
                  orderCompleted.shippingAddress?.type ||
                  'Home'}
              </span>
            </div>

            <p className="font-bold text-[var(--text-main)]">
              {orderCompleted.shippingAddress?.fullName}{' '}
              (
              {
                orderCompleted.shippingAddress?.phone
              }
              )
            </p>

            <p className="text-[var(--text-sub)]">
              {
                orderCompleted.shippingAddress?.street
              }
              ,{' '}
              {
                orderCompleted.shippingAddress?.city
              }
              ,{' '}
              {
                orderCompleted.shippingAddress?.state
              }{' '}
              -{' '}
              {
                orderCompleted.shippingAddress?.pincode
              }
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">

            {onViewOrderDetails && (
              <Button
                onClick={() =>
                  onViewOrderDetails(
                    orderCompleted
                  )
                }
                variant="primary"
                className="flex-1"
              >
                <PackageCheck className="w-4 h-4" />
                <span>
                  TRACK ORDER / DETAILS
                </span>
              </Button>
            )}

            <Button
              onClick={onNavigateHome}
              variant={
                onViewOrderDetails
                  ? 'outline'
                  : 'primary'
              }
              className="flex-1"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                CONTINUE SHOPPING
              </span>
            </Button>

          </div>
        </div>
      </div>
    );
  }

  /*
   * CHECKOUT FORM
   */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-6 px-4 sm:px-6 lg:px-12 transition-colors duration-300">

      <div className="max-w-[1440px] mx-auto space-y-6">

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
              <Check className="w-4 h-4" />
              Cart
            </span>

            <ChevronRight className="w-4 h-4" />

            <span className="text-[#FF1E27]">
              Delivery & Payment
            </span>

            <ChevronRight className="w-4 h-4" />

            <span>
              Confirmation
            </span>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDE */}
          <div className="lg:col-span-7 space-y-6">

            {/* DELIVERY ADDRESS */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-md">

              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">

                <div className="flex items-center gap-2 font-extrabold font-heading text-sm sm:text-base uppercase text-[var(--text-main)]">
                  <MapPin className="w-5 h-5 text-[#FF1E27]" />
                  <span>
                    1. Delivery Address
                  </span>
                </div>

                <Button
                  onClick={onChangeAddress}
                  variant="tag"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    Change / Edit
                  </span>
                </Button>

              </div>

              {userAddress ? (
                <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-subtle)] space-y-2 text-sm">

                  <div className="flex items-center justify-between">

                    <span className="font-extrabold text-[var(--text-main)] text-base">
                      {userAddress.fullName}
                    </span>

                    <span className="text-[10px] font-extrabold uppercase font-heading bg-[#FF1E27]/10 text-[#FF1E27] px-2.5 py-0.5 rounded-full border border-[#FF1E27]/30">
                      {userAddress.title ||
                        userAddress.type ||
                        'Home'}
                    </span>

                  </div>

                  <p className="text-[var(--text-sub)] text-xs leading-relaxed">
                    {userAddress.street ||
                      [
                        userAddress.houseNo,
                        userAddress.flatNo,
                        userAddress.area
                      ]
                        .filter(Boolean)
                        .join(', ')}

                    {userAddress.city &&
                      `, ${userAddress.city}`}

                    {userAddress.state &&
                      `, ${userAddress.state}`}

                    {userAddress.pincode && (
                      <>
                        {' '}
                        -{' '}
                        <span className="font-mono font-bold text-[var(--text-main)]">
                          {userAddress.pincode}
                        </span>
                      </>
                    )}
                  </p>

                  <p className="text-xs font-mono text-[var(--text-sub)] pt-1 flex items-center gap-1">
                    <span>
                      Phone:
                    </span>

                    <span className="font-bold text-[var(--text-main)]">
                      {userAddress.phone
                        ? `+91 ${userAddress.phone}`
                        : 'Not provided'}
                    </span>
                  </p>

                </div>
              ) : (
                <div className="text-center py-4 space-y-3">

                  <p className="text-xs text-[var(--text-sub)]">
                    No delivery address saved yet.
                  </p>

                  <Button
                    onClick={onChangeAddress}
                    variant="primary"
                    size="md"
                  >
                    Add Address Now
                  </Button>

                </div>
              )}

            </div>

            {/* PAYMENT */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-md">

              <div className="flex items-center gap-2 font-extrabold font-heading text-sm sm:text-base uppercase text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-3">

                <CreditCard className="w-5 h-5 text-[#FF1E27]" />

                <span>
                  2. Select Payment Method
                </span>

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

                  const isSelected =
                    selectedPaymentMethod ===
                    pm.id;

                  return (
                    <div
                      key={pm.id}
                      onClick={() =>
                        setSelectedPaymentMethod(
                          pm.id
                        )
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                          ? 'border-[#FF1E27] bg-[#FF1E27]/5 shadow-md'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)]/40 hover:border-[var(--text-sub)]'
                        }`}
                    >

                      <div className="flex items-center gap-3.5">

                        <div
                          className={`p-2.5 rounded-lg ${isSelected
                              ? 'bg-[#FF1E27] text-white'
                              : 'bg-[var(--border-subtle)] text-[var(--text-sub)]'
                            }`}
                        >
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

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected
                            ? 'border-[#FF1E27] bg-[#FF1E27]'
                            : 'border-[var(--text-sub)]'
                          }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>

              {selectedPaymentMethod !== 'cod' && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs text-amber-200">
                  Test mode: this payment will be simulated and marked paid. No money will be charged.
                </div>
              )}

              {selectedPaymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 animate-in slide-in-from-top-2">

                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                    Enter UPI ID (VPA)
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okicici"
                      value={upiId}
                      onChange={(e) =>
                        setUpiId(e.target.value)
                      }
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

          {/* RIGHT SIDE */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-6 shadow-xl">

              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">

                <h2 className="text-lg font-sans font-black italic uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">

                  <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />

                  <span>
                    Order Summary
                  </span>

                </h2>

                <span className="text-xs font-mono font-bold text-[#FF1E27] bg-[#FF1E27]/10 px-2.5 py-0.5 rounded-full border border-[#FF1E27]/30">
                  {
                    items.reduce(
                      (a, b) =>
                        a +
                        Number(
                          b.quantity || 0
                        ),
                      0
                    )
                  }{' '}
                  Items
                </span>

              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[var(--border-subtle)]">

                {items.map((item) => (

                  <div
                    key={
                      item.id ||
                      item.productId ||
                      item.variantSku
                    }
                    className="pt-3 first:pt-0 flex items-center gap-3"
                  >

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
                        Qty:{' '}
                        {item.quantity}

                        {item.variantTitle
                          ? ` • Var: ${item.variantTitle}`
                          : ''}
                      </p>

                    </div>

                    <span className="text-xs font-black font-heading text-[#FF1E27]">
                      ₹
                      {Number(
                        item.price || 0
                      ) *
                        Number(
                          item.quantity || 0
                        )}
                    </span>

                  </div>

                ))}

              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2.5 text-xs">

                <div className="flex items-center justify-between text-[var(--text-sub)]">

                  <span>
                    Subtotal (
                    {
                      items.reduce(
                        (a, b) =>
                          a +
                          Number(
                            b.quantity || 0
                          ),
                        0
                      )
                    }{' '}
                    items)
                  </span>

                  <span className="font-mono font-bold text-[var(--text-main)]">
                    ₹{subtotal}
                  </span>

                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-500">

                    <span>
                      Discount Applied
                    </span>

                    <span className="font-mono font-bold">
                      -₹{discountAmount}
                    </span>

                  </div>
                )}

                <div className="flex items-center justify-between text-[var(--text-sub)]">

                  <span>
                    Express Shipping
                  </span>

                  <span className="font-mono font-bold text-emerald-500 uppercase">
                    {shippingFee === 0
                      ? 'FREE'
                      : `₹${shippingFee}`}
                  </span>

                </div>

                <div className="flex items-center justify-between text-[var(--text-sub)]">
                  <span>Handling fee (non-refundable)</span>
                  <span className="font-mono font-bold text-[var(--text-main)]">₹{handlingFee}</span>
                </div>

                {codSurcharge > 0 && (
                  <div className="flex items-center justify-between text-[var(--text-sub)]">
                    <span>Cash on Delivery fee</span>
                    <span className="font-mono font-bold text-[var(--text-main)]">₹{codSurcharge}</span>
                  </div>
                )}

                <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between text-base font-black font-heading text-[var(--text-main)]">

                  <span>
                    Total Amount Payable
                  </span>

                  <span className="text-xl text-[#FF1E27]">
                    ₹{totalAmount}
                  </span>

                </div>

              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">

                  <AlertCircle className="w-4 h-4 shrink-0" />

                  <span>
                    {errorMessage}
                  </span>

                </div>
              )}

              <Button
                onClick={
                  handleConfirmOrder
                }
                disabled={
                  isPlacingOrder ||
                  !userAddress
                }
                variant="primary"
                fullWidth
              >
                {isPlacingOrder ? (
                  <span>
                    PROCESSING ORDER...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />

                    <span>
                      {selectedPaymentMethod === 'cod' ? 'PLACE COD ORDER' : 'SIMULATE PAYMENT'} • ₹
                      {totalAmount}
                    </span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--text-sub)] font-mono">

                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />

                <span>
                  256-Bit SSL Encrypted & 100% Genuine AVN Guarantee
                </span>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}