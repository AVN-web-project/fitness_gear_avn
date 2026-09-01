import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, CreditCard, Truck, MapPin, ReceiptText, BadgeCheck, PackageCheck, Download, XCircle, RotateCcw } from 'lucide-react';
import Button from '../components/Button';

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
  const orderStatus = localOrder.status || 'Processing';
  const orderCreatedAt = localOrder.createdAt || localOrder.date || new Date().toISOString();
  const daysSinceOrder = (Date.now() - new Date(orderCreatedAt).getTime()) / (1000 * 60 * 60 * 24);

  const buildStatusTimeline = (status) => {
    const baseSteps = [
      { label: 'Processing', done: true, date: 'Placed' },
      { label: 'Packed', done: true, date: 'Packed' },
      { label: 'Shipped', done: true, date: 'Dispatched' },
      { label: 'Out for Delivery', done: status === 'Out for Delivery' || status === 'Delivered' || status === 'Return Requested', date: 'On the way' },
      { label: 'Delivered', done: status === 'Delivered' || status === 'Return Requested', date: 'Delivered' }
    ];

    if (status === 'Cancelled') {
      return [
        { label: 'Processing', done: true, date: 'Placed' },
        { label: 'Packed', done: false, date: 'Cancelled' },
        { label: 'Shipped', done: false, date: 'Cancelled' },
        { label: 'Out for Delivery', done: false, date: 'Cancelled' },
        { label: 'Delivered', done: false, date: 'Cancelled' }
      ];
    }

    if (status === 'Return Requested') {
      return [
        { label: 'Processing', done: true, date: 'Placed' },
        { label: 'Packed', done: true, date: 'Packed' },
        { label: 'Shipped', done: true, date: 'Dispatched' },
        { label: 'Out for Delivery', done: true, date: 'On the way' },
        { label: 'Delivered', done: true, date: 'Delivered' }
      ];
    }

    return localOrder.statusTimeline || baseSteps;
  };

  const rawSteps = buildStatusTimeline(orderStatus);
  const statusSteps = (Array.isArray(rawSteps) && rawSteps.length > 0) ? rawSteps : [
    { label: 'Processing', done: true, date: 'Placed' },
    { label: 'Packed', done: false, date: 'Pending' },
    { label: 'Shipped', done: false, date: 'Pending' },
    { label: 'Out for Delivery', done: false, date: 'Pending' },
    { label: 'Delivered', done: false, date: 'Pending' }
  ];
  const doneCount = statusSteps.filter((step) => Boolean(step && step.done)).length;
  const totalCount = statusSteps.length || 1;
  const rawPct = Math.round((doneCount / totalCount) * 100);
  const progressPercent = isNaN(rawPct) ? 0 : Math.min(100, Math.max(0, rawPct));
  const isDispatchState = ['Shipped', 'Out for Delivery', 'Delivered', 'In Transit', 'Pending Dispatch'].includes(orderStatus);
  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateFormatted} • ${timeFormatted}`;
    } catch (e) {
      return String(dateVal);
    }
  };

  const isCancelable = ['Processing', 'Packed', 'Pending Dispatch'].includes(orderStatus) && !['Cancelled', 'Return Requested'].includes(orderStatus);
  const canRequestReturn = orderStatus === 'Delivered' && daysSinceOrder <= 10;

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
          return { ...o, status: nextOrder.status, statusTimeline: nextOrder.statusTimeline };
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

    // Sync to backend API if available
    try {
      await updateOrderStatusApi(targetId, {
        status: nextOrder.status,
        statusTimeline: nextOrder.statusTimeline
      });
    } catch (e) {
      console.warn('Failed to sync order status update to API', e);
    }

    if (onOrderUpdated) onOrderUpdated(nextOrder);
  };

  const handleCancelOrder = () => {
    const nowIso = new Date().toISOString();
    const cancelledOrder = {
      ...localOrder,
      id: localOrder.id || localOrder.orderId,
      orderId: localOrder.orderId || localOrder.id,
      status: 'Cancelled',
      cancelledAt: localOrder.cancelledAt || nowIso,
      updatedAt: nowIso,
      statusTimeline: buildStatusTimeline('Cancelled'),
      paymentStatus: 'Cancelled'
    };
    persistOrderUpdate(cancelledOrder);
  };

  const handleRequestReturn = () => {
    const nowIso = new Date().toISOString();
    const returnRequestedOrder = {
      ...localOrder,
      id: localOrder.id || localOrder.orderId,
      orderId: localOrder.orderId || localOrder.id,
      status: 'Return Requested',
      returnRequestedAt: localOrder.returnRequestedAt || nowIso,
      updatedAt: nowIso,
      statusTimeline: buildStatusTimeline('Return Requested'),
      paymentStatus: 'Return Requested'
    };
    persistOrderUpdate(returnRequestedOrder);
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
            <Button onClick={handleCancelOrder} variant="secondary">
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </Button>
          )}

          {canRequestReturn && (
            <Button onClick={handleRequestReturn} variant="primary">
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
                <h2 className="text-lg font-black font-heading text-[#FF1E27]">{order.id || order.orderId}</h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Order placed (Date & Time)</p>
                <p className="text-xs font-bold text-[var(--text-main)]">{formatDateTime(localOrder.createdAt || order.createdAt || order.date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-2 text-[#FF1E27] mb-2">
                  <ReceiptText className="w-4 h-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Transaction ID</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-main)]">{order.transactionId || 'N/A'}</p>
              </div>

              <div className="rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-2 text-[#FF1E27] mb-2">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Status</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-main)]">{orderStatus}</p>
              </div>

              {orderStatus === 'Cancelled' && (
                <div className="rounded-2xl bg-gradient-to-r from-rose-500/15 to-rose-950/30 border border-rose-500/40 p-4 sm:col-span-2 flex items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-heading">ORDER CANCELLED ON</p>
                      <p className="text-xs font-black text-white font-mono">{formatDateTime(localOrder.cancelledAt || localOrder.updatedAt || new Date().toISOString())}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase font-heading px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    CANCELLED
                  </span>
                </div>
              )}

              {orderStatus === 'Return Requested' && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-950/30 border border-amber-500/40 p-4 sm:col-span-2 flex items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-heading">RETURN REQUESTED ON</p>
                      <p className="text-xs font-black text-white font-mono">{formatDateTime(localOrder.returnRequestedAt || localOrder.updatedAt || new Date().toISOString())}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase font-heading px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    RETURN INITIATED
                  </span>
                </div>
              )}
            </div>

            {!['Cancelled', 'Delivered', 'Return Requested'].includes(orderStatus) && (
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
                <div className="border-t border-[var(--border-subtle)] pt-2 flex items-center justify-between text-sm text-[var(--text-main)] font-black">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Payment method</p>
                <p className="mt-2 text-sm font-bold text-[var(--text-main)]">{order.paymentMethod || 'UPI'}</p>
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
    </div>
  );
}
