import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, CreditCard, Truck, MapPin, ReceiptText, BadgeCheck, PackageCheck, Download, XCircle, RotateCcw, Clock, CheckCircle2, AlertCircle, X, QrCode, Building2 } from 'lucide-react';
import Button from '../components/Button';
import { cancelOrderApi, requestOrderReturnApi } from '../services/api';

export default function OrderDetailsPage({ order, onBack, theme = 'dark', onOrderUpdated }) {
  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-[var(--border-subtle)] text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--text-sub)]">No order selected</p>
          <Button onClick={onBack} variant="primary" className="mt-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Button>
        </div>
      </div>
    );
  }

  const [localOrder, setLocalOrder] = useState(order);

  // Cancellation & Return Reason Modal States (Direct user input, not auto-filled)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [refundAccountDetails, setRefundAccountDetails] = useState({
    method: '',
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  const items = localOrder.items || [];
  const financials = localOrder.financials || {};
  const address = localOrder.address || localOrder.shippingAddress || {};
  const totalAmount = Number(financials.totalAmount || 0);
  const subtotal = Number(financials.subtotal || 0);
  const discountAmount = Number(financials.discountAmount || 0);
  const shippingFee = Number(financials.shippingFee || 0);
  const handlingFee = Number(localOrder.pricing?.handlingFee || financials.handlingFee || localOrder.handlingFee || 0);
  const codSurcharge = Number(localOrder.pricing?.codSurcharge || financials.codSurcharge || localOrder.codSurcharge || 0);

  const normStatus = String(localOrder.orderStatus || localOrder.status || 'processing').toLowerCase().trim();

  const getReadableStatus = (s) => {
    const statusMap = {
      'pending_payment': 'Processing',
      'paid': 'Processing',
      'paid_confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'return_requested': 'Return Requested',
      'returned': 'Returned',
      'refunded': 'Refunded',
      'payment_failed': 'Payment Failed'
    };
    return statusMap[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  };
  const displayStatus = getReadableStatus(normStatus);

  const isDelivered = normStatus === 'delivered';
  const isCancelled = normStatus === 'cancelled';
  const isReturnRequested = normStatus === 'return_requested' || normStatus === 'returned';
  const isRefunded = normStatus === 'refunded';

  // An order was delivered if it is delivered, in return review, returned, refunded, or marked delivered in status history
  const wasDelivered = isDelivered || isReturnRequested || isRefunded || localOrder.acceptedAtDelivery || localOrder.statusHistory?.some(h => h.status === 'delivered') || !!localOrder.deliveredAt;

  const paymentProvider = String(
    localOrder.paymentInfo?.method || localOrder.paymentMethod || localOrder.paymentMethodType || localOrder.paymentInfo?.provider || 'COD'
  ).toUpperCase();
  const providerType = String(localOrder.paymentInfo?.provider || paymentProvider).toUpperCase();
  const isCod = providerType.includes('COD') || providerType.includes('CASH') || paymentProvider === 'COD';
  const refundableAfterFees = Math.max(0, totalAmount - handlingFee - (isCod ? codSurcharge : 0));
  const rawPaymentStatus = String(localOrder.paymentInfo?.paymentStatus || localOrder.paymentStatus || '').toLowerCase().trim();

  // Online payments are confirmed upon order placement.
  // COD payments remain pending UNTIL physical delivery. Once delivered (or in return/refund stage), COD payment was collected.
  const isPaymentPending = !isCancelled && !wasDelivered && (
    isCod ? rawPaymentStatus !== 'captured' : (rawPaymentStatus === 'pending' || normStatus === 'pending_payment')
  );

  const orderCreatedAt = localOrder.createdAt || localOrder.date || new Date().toISOString();
  const daysSinceOrder = (Date.now() - new Date(orderCreatedAt).getTime()) / (1000 * 60 * 60 * 24);

  const buildStatusTimeline = (status) => {
    const firstStepDate = isCod ? 'Order Placed' : 'Paid Online';
    if (status === 'delivered') {
      return [
        { label: 'Confirmed', done: true, date: firstStepDate },
        { label: 'Processing', done: true, date: 'Packed' },
        { label: 'Shipped', done: true, date: 'Dispatched' },
        { label: 'Out for Delivery', done: true, date: 'On the way' },
        { label: 'Delivered', done: true, date: isCod ? 'Delivered & Paid' : 'Delivered' }
      ];
    }
    if (status === 'cancelled') {
      return [
        { label: 'Processing', done: true, date: 'Placed' },
        { label: 'Packed', done: false, date: 'Cancelled' },
        { label: 'Shipped', done: false, date: 'Cancelled' },
        { label: 'Out for Delivery', done: false, date: 'Cancelled' },
        { label: 'Delivered', done: false, date: 'Cancelled' }
      ];
    }
    if (status === 'return_requested' || status === 'returned') {
      return [
        { label: 'Processing', done: true, date: 'Placed' },
        { label: 'Packed', done: true, date: 'Packed' },
        { label: 'Shipped', done: true, date: 'Dispatched' },
        { label: 'Out for Delivery', done: true, date: 'On the way' },
        { label: 'Delivered', done: true, date: 'Delivered' }
      ];
    }
    if (status === 'shipped') {
      return [
        { label: 'Confirmed', done: true, date: firstStepDate },
        { label: 'Processing', done: true, date: 'Packed' },
        { label: 'Shipped', done: true, date: 'Dispatched' },
        { label: 'Out for Delivery', done: false, date: 'Pending' },
        { label: 'Delivered', done: false, date: 'Pending' }
      ];
    }
    if (status === 'processing') {
      return [
        { label: 'Confirmed', done: true, date: firstStepDate },
        { label: 'Processing', done: true, date: 'In Warehouse' },
        { label: 'Shipped', done: false, date: 'Pending' },
        { label: 'Out for Delivery', done: false, date: 'Pending' },
        { label: 'Delivered', done: false, date: 'Pending' }
      ];
    }
    // For other initial statuses
    return [
      { label: 'Confirmed', done: true, date: firstStepDate },
      { label: 'Processing', done: false, date: 'Pending' },
      { label: 'Shipped', done: false, date: 'Pending' },
      { label: 'Out for Delivery', done: false, date: 'Pending' },
      { label: 'Delivered', done: false, date: 'Pending' }
    ];
  };

  const rawSteps = buildStatusTimeline(normStatus);
  const statusSteps = (Array.isArray(rawSteps) && rawSteps.length > 0) ? rawSteps : [
    { label: 'Processing', done: true, date: 'Placed' },
    { label: 'Packed', done: false, date: 'Pending' },
    { label: 'Shipped', done: false, date: 'Pending' },
    { label: 'Out for Delivery', done: false, date: 'Pending' },
    { label: 'Delivered', done: false, date: 'Pending' }
  ];
  const doneCount = statusSteps.filter((step) => Boolean(step && step.done)).length;
  const totalCount = statusSteps.length || 1;
  const rawPct = isDelivered ? 100 : Math.round((doneCount / totalCount) * 100);
  const progressPercent = isNaN(rawPct) ? 0 : Math.min(100, Math.max(0, rawPct));
  const isDispatchState = ['shipped', 'delivered', 'out for delivery'].includes(normStatus);
  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      let d;
      if (typeof dateVal === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(dateVal)) {
        const parts = dateVal.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*(\d{2}):(\d{2}):(\d{2}))?/);
        if (parts) {
          const day = parts[1];
          const month = parts[2];
          const year = parts[3];
          const hour = parts[4] || '12';
          const min = parts[5] || '00';
          const sec = parts[6] || '00';
          d = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
        }
      }
      if (!d || isNaN(d.getTime())) d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateFormatted} • ${timeFormatted}`;
    } catch (e) {
      return String(dateVal);
    }
  };

  const isCancelable = ['processing', 'pending_payment', 'paid_confirmed', 'paid'].includes(normStatus) && !isCancelled && !isReturnRequested;
  const canRequestReturn = isDelivered && daysSinceOrder <= 10;

  const persistOrderUpdate = async (nextOrder) => {
    setLocalOrder(nextOrder);

    const targetId = nextOrder.orderId || nextOrder.id;

    // Persist to localStorage ('avn-user-orders')
    try {
      const savedOrders = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
      const targetIdStr = String(targetId).toLowerCase();

      let matched = false;
      const updatedSavedOrders = savedOrders.map((o) => {
        const oIdStr = String(o.orderId || o.id || '').toLowerCase();
        if (oIdStr === targetIdStr) {
          matched = true;
          return { ...o, ...nextOrder };
        }
        return o;
      });

      if (!matched) {
        updatedSavedOrders.push(nextOrder);
      }

      localStorage.setItem('avn-user-orders', JSON.stringify(updatedSavedOrders));
    } catch (e) {
      console.warn('Failed to update localStorage for order cancellation', e);
    }

    if (onOrderUpdated) onOrderUpdated(nextOrder);
  };

  const openCancelModal = () => {
    setCancelReason('');
    setActionError('');
    setShowCancelModal(true);
  };

  const openReturnModal = () => {
    setReturnReason('');
    setRefundAccountDetails({ method: '', upiId: '', accountHolderName: '', accountNumber: '', ifscCode: '' });
    setActionError('');
    setShowReturnModal(true);
  };

  const handleConfirmCancel = async () => {
    const finalReason = cancelReason.trim();
    if (!finalReason) {
      setActionError('Please enter a reason for cancellation.');
      return;
    }
    if (finalReason.length < 5) {
      setActionError('Please provide a reason with at least 5 characters.');
      return;
    }
    if (isCod) {
      if (refundAccountDetails.method === 'upi') {
        const upiId = refundAccountDetails.upiId.trim();
        if (upiId.length > 100 || !/^[a-z0-9][a-z0-9._-]{1,}@[a-z0-9][a-z0-9.-]{1,}[a-z0-9]$/i.test(upiId)) {
          setActionError('Enter a valid UPI ID.');
          return;
        }
      } else if (refundAccountDetails.method === 'bank') {
        const { accountHolderName, accountNumber, ifscCode } = refundAccountDetails;
        const trimmedHolderName = accountHolderName.trim();
        const validHolderName = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u.test(trimmedHolderName);
        if (trimmedHolderName.length < 2 || trimmedHolderName.length > 100 || !validHolderName || !/^\d{6,34}$/.test(accountNumber.trim()) || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase())) {
          setActionError('Enter a valid account holder name, bank account number, and IFSC code.');
          return;
        }
      } else {
        setActionError('Choose UPI or bank transfer for your COD refund.');
        return;
      }
    }

    setIsSubmittingAction(true);
    setActionError('');
    try {
      const targetId = localOrder.orderNumber || localOrder._id || localOrder.orderId || localOrder.id;
      const res = await cancelOrderApi(targetId, finalReason);
      if (res && res.success === false) {
        setActionError(res.message || 'Unable to cancel order');
        setIsSubmittingAction(false);
        return;
      }
      const nowIso = new Date().toISOString();
      const cancelledOrder = {
        ...localOrder,
        id: targetId,
        orderId: targetId,
        orderNumber: localOrder.orderNumber || targetId,
        status: 'Cancelled',
        orderStatus: 'cancelled',
        cancellation: {
          isCancelled: true,
          reason: finalReason,
          cancelledAt: nowIso
        },
        cancelledAt: nowIso,
        cancelReason: finalReason,
        updatedAt: nowIso,
        statusTimeline: buildStatusTimeline('Cancelled'),
        paymentStatus: 'Cancelled'
      };
      persistOrderUpdate(cancelledOrder);
      setShowCancelModal(false);
    } catch (err) {
      console.error('Cancellation failed:', err);
      setActionError(err.message || 'Cancellation failed. Please try again.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReturn = async () => {
    const finalReason = returnReason.trim();

    if (!finalReason) {
      setActionError('Please enter a reason for your return request.');
      return;
    }
    if (finalReason.length < 5) {
      setActionError('Please provide a reason with at least 5 characters.');
      return;
    }

    setIsSubmittingAction(true);
    setActionError('');
    try {
      const targetId = localOrder.orderNumber || localOrder._id || localOrder.orderId || localOrder.id;
      const res = await requestOrderReturnApi(targetId, finalReason, isCod ? {
        method: refundAccountDetails.method,
        ...(refundAccountDetails.method === 'upi'
          ? { upiId: refundAccountDetails.upiId.trim() }
          : {
              accountHolderName: refundAccountDetails.accountHolderName.trim(),
              accountNumber: refundAccountDetails.accountNumber.trim(),
              ifscCode: refundAccountDetails.ifscCode.trim().toUpperCase()
            })
      } : undefined);
      if (res && res.success === false) {
        setActionError(res.message || 'Unable to request return');
        setIsSubmittingAction(false);
        return;
      }
      const nowIso = new Date().toISOString();
      const returnRequestedOrder = {
        ...localOrder,
        id: targetId,
        orderId: targetId,
        orderNumber: localOrder.orderNumber || targetId,
        status: 'Return Requested',
        orderStatus: 'return_requested',
        returnRequest: {
          isRequested: true,
          reason: finalReason,
          requestedAt: nowIso,
          status: 'pending',
          refundAccountDetails: isCod ? refundAccountDetails : undefined
        },
        returnRequestedAt: localOrder.returnRequestedAt || nowIso,
        returnReason: finalReason,
        updatedAt: nowIso,
        statusTimeline: buildStatusTimeline('Return Requested'),
        paymentStatus: 'captured',
        acceptedAtDelivery: true,
        paymentInfo: {
          ...(localOrder.paymentInfo || {}),
          paymentStatus: 'captured',
          paidAt: localOrder.paymentInfo?.paidAt || nowIso
        }
      };
      persistOrderUpdate(returnRequestedOrder);
      setShowReturnModal(false);
    } catch (err) {
      console.error('Return request failed:', err);
      setActionError(err.message || 'Failed to submit return request. Please try again.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceText = [
      'AVN Gear Invoice',
      `Order ID: ${order.id || order.orderId}`,
      `Transaction ID: ${order.transactionId || 'N/A'}`,
      `Status: ${order.status || 'Processing'}`,
      '',
      'Products:',
      ...items.map((item) => `- ${item.name || item.productName || 'Product'} x ${item.qty || item.quantity || 1} @ ${item.price || `₹${item.total || 0}`}`),
      '',
      `Subtotal: ₹${subtotal}`,
      `Discount: -₹${discountAmount}`,
      `Shipping: ₹${shippingFee}`,
      `Total: ₹${totalAmount}`,
      '',
      `Delivery Address: ${address.fullName || order.customerName || 'AVN Customer'}`,
      `${address.flatNo || ''} ${address.street || ''}`,
      `${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`,
      `${address.phone || ''}`
    ].join('\n');

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(order.id || order.orderId || 'order').replace(/\s+/g, '-').toLowerCase()}-invoice.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button onClick={onBack} variant="icon" title="Back to order history">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)]">ORDER DETAILS</h1>
            <p className="text-xs text-[var(--text-sub)] font-medium">Full order summary and purchase information</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 flex-wrap">
          {isCancelable && (
            <Button onClick={openCancelModal} variant="secondary">
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </Button>
          )}

          {canRequestReturn && (
            <Button onClick={openReturnModal} variant="primary">
              <RotateCcw className="w-4 h-4" />
              <span>Request Return</span>
            </Button>
          )}

          <Button onClick={handleDownloadInvoice} variant="primary">
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Order ID</p>
                <h2 className="text-lg font-black font-heading text-[#FF1E27]">{order.orderNumber || order.orderId || order.id}</h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Order placed (Date & Time)</p>
                <p className="text-xs font-bold text-[var(--text-main)]">{formatDateTime(localOrder.createdAt || order.createdAt || order.date)}</p>
              </div>
            </div>

            {/* DEDICATED SEPARATE PAYMENT STATUS BOX */}
            {isPaymentPending ? (
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-950/25 border-2 border-amber-500/40 p-5 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-inner">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-heading">Payment Status</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/25 text-amber-300 border border-amber-500/40">
                          Pending Payment
                        </span>
                        <span className="text-[10px] font-bold text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                          {isCod ? 'Cash on Delivery (COD)' : paymentProvider}
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-[var(--text-main)] mt-1">
                        {isCod ? 'Cash on Delivery • Payment pending until delivery' : 'Payment awaiting confirmation'}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right bg-black/30 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-amber-500/20 sm:border-0">
                    <p className="text-[10px] uppercase font-bold text-[var(--text-sub)]">Amount Due</p>
                    <p className="text-xl font-black text-amber-400 font-mono tracking-tight">₹{Number(totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-amber-300/90 gap-2">
                  <p className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span>
                      {isCod
                        ? `Please keep ₹${Number(totalAmount).toLocaleString('en-IN')} cash or UPI ready. Payment will be collected upon physical delivery.`
                        : 'Your online payment verification is in progress.'}
                    </span>
                  </p>
                  <span className="shrink-0 text-[10px] font-extrabold font-mono text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {isCod ? 'COD • Due on Delivery' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-950/20 border border-emerald-500/40 p-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-heading">Payment Status</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {isReturnRequested
                            ? (isCod ? 'Paid on Delivery • Return Under Review' : 'Confirmed & Paid • Return Under Review')
                            : isRefunded
                            ? 'Refunded'
                            : (isCod && wasDelivered ? 'Paid on Delivery' : 'Confirmed & Paid')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-main)] mt-0.5">
                        {isReturnRequested
                          ? (isCod
                              ? `Cash on Delivery payment of ₹${Number(totalAmount).toLocaleString('en-IN')} was collected upon delivery. Refund will be processed upon return verification.`
                              : `Payment of ₹${Number(totalAmount).toLocaleString('en-IN')} confirmed via ${paymentProvider}. Refund will be processed upon return approval.`)
                          : isRefunded
                          ? `Refund of ₹${Number(totalAmount).toLocaleString('en-IN')} has been processed.`
                          : (isCod && wasDelivered
                              ? 'Cash on Delivery payment collected and verified upon delivery'
                              : `Payment of ₹${Number(totalAmount).toLocaleString('en-IN')} confirmed via ${paymentProvider}`)}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-[var(--text-sub)]">
                      {isReturnRequested ? 'Amount for Refund' : isRefunded ? 'Amount Refunded' : 'Amount Paid'}
                    </p>
                    <p className="text-base font-black text-emerald-400 font-mono">₹{Number(totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-2 text-[#FF1E27] mb-2">
                  <ReceiptText className="w-4 h-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Transaction ID</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-main)]">{order.transactionId || (isCod ? (wasDelivered ? 'COD-COLLECTED' : 'COD-DUE-ON-DELIVERY') : `TXN-${order.orderNumber || 'PROCESSED'}`)}</p>
              </div>

              <div className="rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-2 text-[#FF1E27] mb-2">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Fulfillment Status</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-main)] capitalize">{displayStatus}</p>
              </div>

              {isCancelled && (
                <div className="rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-rose-950/30 border border-rose-500/40 p-5 sm:col-span-2 shadow-lg space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-heading">ORDER CANCELLED</p>
                        <p className="text-xs font-mono text-zinc-300">{formatDateTime(localOrder.cancelledAt || localOrder.cancellation?.cancelledAt || localOrder.updatedAt || new Date().toISOString())}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase font-heading px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                      CANCELLED
                    </span>
                  </div>
                  {(localOrder.cancellation?.reason || localOrder.cancelReason) && (
                    <div className="pt-2.5 border-t border-rose-500/20 text-xs text-rose-200/90 flex items-start gap-2">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-rose-400 shrink-0 mt-0.5">Cancellation Reason:</span>
                      <span className="italic">"{localOrder.cancellation?.reason || localOrder.cancelReason}"</span>
                    </div>
                  )}
                </div>
              )}

              {isReturnRequested && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-950/30 border border-amber-500/40 p-5 sm:col-span-2 shadow-lg space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-heading">RETURN REQUESTED &bull; UNDER REVIEW</p>
                        <p className="text-xs text-amber-200/90">Our operations team is reviewing your return request. We will contact you shortly with reverse pickup instructions.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase font-heading px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      UNDER REVIEW
                    </span>
                  </div>
                  {(localOrder.returnRequest?.reason || localOrder.returnReason) && (
                    <div className="pt-2.5 border-t border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-amber-400 shrink-0 mt-0.5">Return Reason:</span>
                      <span className="italic">"{localOrder.returnRequest?.reason || localOrder.returnReason}"</span>
                    </div>
                  )}
                </div>
              )}

              {isDelivered && (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 to-emerald-950/30 border border-emerald-500/40 p-4 sm:col-span-2 flex items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-heading">DELIVERY ACCEPTED</p>
                      <p className="text-xs font-bold text-white">Delivered & verified. You can now write reviews on the product page!</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase font-heading px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    DELIVERED
                  </span>
                </div>
              )}
            </div>

            {!isCancelled && !isDelivered && !isReturnRequested && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Truck className="w-4 h-4 text-[#FF1E27]" />
                  <h3 className="text-xs font-black uppercase tracking-wider">Track order</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF1E27] to-amber-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="relative mt-6">
                  <div className="absolute left-4 top-5 h-[calc(100%-2rem)] w-0.5 bg-[var(--border-subtle)]" />
                  <div className="space-y-5">
                    {statusSteps.map((step, index) => (
                      <div key={`${step.label}-${index}`} className="relative flex items-start gap-4">
                        <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${step.done ? 'border-[#FF1E27] bg-[#FF1E27] text-white' : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-sub)]'}`}>
                          {step.done ? <BadgeCheck className="w-4 h-4" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                        </div>
                        <div className="pt-1">
                          <p className="text-xs font-black uppercase text-[var(--text-main)]">{step.label}</p>
                          <p className="text-[10px] text-[var(--text-sub)]">{step.date || 'In progress'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--text-main)]">
                <ShoppingBag className="w-4 h-4 text-[#FF1E27]" />
                <h3 className="text-xs font-black uppercase tracking-wider">Products purchased</h3>
              </div>

              {items.map((item, index) => (
                <div key={`${item.slug || item.productId || index}`} className="flex items-start gap-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm font-extrabold uppercase text-[var(--text-main)]">{item.name || item.productName || 'Product'}</p>
                      <p className="text-xs font-bold text-[var(--text-sub)]">Qty: {item.qty || item.quantity || 1}</p>
                    </div>
                    <p className="text-[11px] text-[var(--text-sub)] mt-1">{item.slug || item.productId || item.id || 'SKU not available'}</p>
                    <p className="text-sm font-bold text-[#FF1E27] mt-2">{item.price || `₹${item.total || 0}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl">
              <div className="flex items-center gap-2 text-[#FF1E27] mb-4">
                <CreditCard className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">Payment summary</h3>
              </div>

              <div className="space-y-2 text-xs text-[var(--text-sub)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[var(--text-main)]">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-bold text-[var(--text-main)]">-₹{discountAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-[var(--text-main)]">₹{shippingFee}</span>
                </div>
                {handlingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Handling fee (non-refundable)</span>
                    <span className="font-bold text-[var(--text-main)]">₹{handlingFee}</span>
                  </div>
                )}
                {codSurcharge > 0 && (
                  <div className="flex items-center justify-between">
                    <span>COD fee (non-refundable)</span>
                    <span className="font-bold text-[var(--text-main)]">₹{codSurcharge}</span>
                  </div>
                )}
                <div className="border-t border-[var(--border-subtle)] pt-2 flex items-center justify-between text-sm text-[var(--text-main)] font-black">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
                {(handlingFee > 0 || codSurcharge > 0) && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-sub)]">
                    <div className="flex items-center justify-between">
                      <span>Refundable after non-refundable fees</span>
                      <span className="font-mono font-bold text-[var(--text-main)]">₹{refundableAfterFees}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Payment method</span>
                  <span className="text-xs font-black text-[var(--text-main)] uppercase">{paymentProvider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Payment status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    isPaymentPending
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isPaymentPending
                      ? (isCod ? 'Pending (Due on Delivery)' : 'Pending Payment')
                      : (isReturnRequested
                          ? 'Paid (Return Under Review)'
                          : isRefunded
                          ? 'Refunded'
                          : (isCod && wasDelivered ? 'Paid on Delivery' : 'Confirmed & Paid'))}
                  </span>
                </div>
                {(handlingFee > 0 || codSurcharge > 0) && (
                  <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)]/60 p-3 text-[11px] text-[var(--text-sub)]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Refund estimate</span>
                      <span className="font-mono font-bold text-[var(--text-main)]">₹{refundableAfterFees}</span>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-[var(--text-sub)]">
                      {handlingFee > 0 && `₹${handlingFee} handling fee is non-refundable.`}
                      {codSurcharge > 0 && ` ₹${codSurcharge} COD fee is also non-refundable.`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl">
              <div className="flex items-center gap-2 text-[#FF1E27] mb-4">
                <MapPin className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">Delivery address</h3>
              </div>

              <div className="space-y-1 text-sm text-[var(--text-main)]">
                <p className="font-extrabold uppercase">{address.fullName || order.customerName || 'AVN Customer'}</p>
                <p>{address.type || 'Home'}</p>
                <p>{address.flatNo || ''}{address.flatNo && address.street ? ', ' : ''}{address.street || ''}</p>
                <p>{address.city || ''}{address.city && address.state ? ', ' : ''}{address.state || ''} - {address.pincode || ''}</p>
                <p>{address.phone || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141419] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-[var(--text-main)] relative">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase text-white tracking-wide">
                    Cancel Order #{localOrder.orderNumber || localOrder.id}
                  </h3>
                  <p className="text-xs text-[var(--text-sub)]">
                    Please provide the reason for cancelling this order.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSubmittingAction && setShowCancelModal(false)}
                className="text-[var(--text-sub)] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="cancel-reason-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Reason for cancellation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="cancel-reason-input"
                  name="cancellationReason"
                  rows={4}
                  autoFocus
                  autoComplete="off"
                  spellCheck="true"
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (actionError) setActionError('');
                  }}
                  placeholder="Please type your reason for cancelling this order..."
                  className="w-full rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--text-sub)] mt-1.5 px-1">
                  <span>Please type your reason directly (required)</span>
                  <span className={cancelReason.trim().length >= 5 ? 'text-emerald-400 font-mono font-bold' : 'text-zinc-400 font-mono'}>
                    {cancelReason.trim().length} chars {cancelReason.trim().length < 5 ? '(min 5)' : '✓'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-300/80 leading-relaxed">
                ℹ️ <strong>Cancellation Policy:</strong> Once confirmed, this order will be permanently cancelled. Any pre-paid amount will be refunded to your original payment mode within 3-5 business days.
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="secondary"
                size="sm"
                disabled={isSubmittingAction}
              >
                Keep Order
              </Button>
              <button
                onClick={handleConfirmCancel}
                disabled={isSubmittingAction || cancelReason.trim().length < 5}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase text-xs tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                {isSubmittingAction ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Reason Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141419] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-[var(--text-main)] relative">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase text-white tracking-wide">
                    Request Return & Refund
                  </h3>
                  <p className="text-xs text-[var(--text-sub)]">
                    Order #{localOrder.orderNumber || localOrder.id}. Please specify your return reason.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSubmittingAction && setShowReturnModal(false)}
                className="text-[var(--text-sub)] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="return-reason-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Reason for return <span className="text-amber-500">*</span>
                </label>
                <textarea
                  id="return-reason-input"
                  name="returnReason"
                  rows={4}
                  autoFocus
                  autoComplete="off"
                  spellCheck="true"
                  value={returnReason}
                  onChange={(e) => {
                    setReturnReason(e.target.value);
                    if (actionError) setActionError('');
                  }}
                  placeholder="Please type your return reason here (e.g. Defective stitch, wrong size delivered, missing parts)..."
                  className="w-full rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--text-sub)] mt-1.5 px-1">
                  <span>Please describe your reason directly (required)</span>
                  <span className={returnReason.trim().length >= 5 ? 'text-emerald-400 font-mono font-bold' : 'text-zinc-400 font-mono'}>
                    {returnReason.trim().length} chars {returnReason.trim().length < 5 ? '(min 5)' : '✓'}
                  </span>
                </div>
              </div>

              {isCod && (
                <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)]/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Choose COD refund method</p>
                  <p className="text-[11px] text-[var(--text-sub)]">The ₹10 handling fee and the ₹50 COD fee are non-refundable.</p>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="COD refund method">
                    {[
                      { value: 'upi', label: 'UPI', Icon: QrCode },
                      { value: 'bank', label: 'Bank transfer', Icon: Building2 }
                    ].map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={refundAccountDetails.method === value}
                        onClick={() => setRefundAccountDetails({ ...refundAccountDetails, method: value })}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${refundAccountDetails.method === value ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-[var(--border-subtle)] text-[var(--text-main)] hover:border-amber-500/60'}`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {refundAccountDetails.method === 'upi' && (
                    <label className="block text-xs font-semibold text-zinc-300">
                      UPI ID
                      <input
                        type="text"
                        autoComplete="off"
                        maxLength={100}
                        pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,}@[A-Za-z0-9][A-Za-z0-9.-]{1,}[A-Za-z0-9]"
                        title="Enter a valid UPI ID, such as name@upi"
                        value={refundAccountDetails.upiId}
                        onChange={(e) => setRefundAccountDetails({ ...refundAccountDetails, upiId: e.target.value })}
                        placeholder="name@upi"
                        required
                        className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-sub)] focus:border-amber-500 focus:outline-none"
                      />
                    </label>
                  )}

                  {refundAccountDetails.method === 'bank' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Account holder name
                        <input
                          type="text"
                          autoComplete="name"
                          minLength={2}
                          maxLength={100}
                          value={refundAccountDetails.accountHolderName}
                          onChange={(e) => setRefundAccountDetails({ ...refundAccountDetails, accountHolderName: e.target.value })}
                          className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-zinc-300">
                        Bank account number
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          minLength={6}
                          maxLength={34}
                          pattern="[0-9]{6,34}"
                          title="Use 6 to 34 digits"
                          value={refundAccountDetails.accountNumber}
                          onChange={(e) => setRefundAccountDetails({ ...refundAccountDetails, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 34) })}
                          required
                          className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-zinc-300">
                        IFSC code
                        <input
                          type="text"
                          autoComplete="off"
                          maxLength={11}
                          minLength={11}
                          pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                          title="Use the 11-character IFSC format, such as HDFC0001234"
                          value={refundAccountDetails.ifscCode}
                          onChange={(e) => setRefundAccountDetails({ ...refundAccountDetails, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })}
                          required
                          className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2.5 text-sm uppercase text-[var(--text-main)] focus:border-amber-500 focus:outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300/80 leading-relaxed">
                ℹ️ <strong>AVN 10-Day Guarantee:</strong> Equipment must be unused and in original packaging. Once submitted, our operations team will review your request within 24-48 hours and coordinate reverse pickup.
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                onClick={() => setShowReturnModal(false)}
                variant="secondary"
                size="sm"
                disabled={isSubmittingAction}
              >
                Close
              </Button>
              <button
                onClick={handleConfirmReturn}
                disabled={isSubmittingAction || returnReason.trim().length < 5}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/50"
              >
                {isSubmittingAction ? (
                  <>
                    <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Submit Return Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
