import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Clock, CheckCircle2,
  PackageCheck, MessageSquarePlus, XCircle, RotateCcw, Truck, Package
} from 'lucide-react';
import Button from '../components/Button';
import { fetchMyOrdersApi } from '../services/api';

export default function OrderHistoryPage({
  onBack,
  onWriteReviewClick,
  currentUser,
  onViewOrderDetails,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderHistory = async () => {
      setIsLoading(true);
      try {
        // Fetch from backend using authenticated API endpoint (MongoDB)
        const backendOrders = await fetchMyOrdersApi();
        const genuineOrders = [];

        if (Array.isArray(backendOrders) && backendOrders.length > 0) {
          backendOrders.forEach((order) => {
            const orderKey = order.orderNumber || order._id || order.id;
            let rawStatus = String(order.orderStatus || order.status || 'processing').toLowerCase().trim();
            if (rawStatus === 'pending_payment') {
              rawStatus = 'processing';
            }
            const totalPayable = order.pricing?.totalPayable ?? order.totalPayable ?? order.financials?.totalAmount ?? 0;
            const paymentProvider = String(
              order.paymentInfo?.method || order.paymentDetails?.method || order.paymentInfo?.provider || order.paymentDetails?.provider || order.paymentMethod || order.paymentMethodType || 'COD'
            ).toUpperCase();
            const providerType = String(order.paymentInfo?.provider || order.paymentDetails?.provider || paymentProvider).toUpperCase();
            const isCod = providerType.includes('COD') || providerType.includes('CASH') || paymentProvider === 'COD';
            const isDelivered = rawStatus === 'delivered';
            const wasEverDelivered = isDelivered || rawStatus === 'return_requested' || rawStatus === 'returned' || rawStatus === 'refunded' || order.acceptedAtDelivery || order.statusHistory?.some(h => h.status === 'delivered') || !!order.deliveredAt;
            const rawPaymentStatus = String(order.paymentInfo?.paymentStatus || order.paymentStatus || '').toLowerCase();
            const isCancelled = rawStatus === 'cancelled';
            const isPaymentPending = isCancelled ? false : (wasEverDelivered ? false : (isCod ? rawPaymentStatus !== 'captured' : (rawPaymentStatus === 'pending')));

            genuineOrders.push({
              id: order._id || order.id || orderKey,
              orderId: orderKey,
              orderNumber: orderKey,
              transactionId: order.paymentInfo?.transactionId || order.paymentDetails?.transactionId || order.transactionId || `TXN-${orderKey}`,
              date: order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              total: `₹${Number(totalPayable).toLocaleString('en-IN')}`,
              status: rawStatus,
              orderStatus: rawStatus,
              isPaymentPending,
              wasEverDelivered,
              isCod,
              paymentProvider,
              paymentInfo: order.paymentInfo || { provider: providerType, method: paymentProvider, paymentStatus: isPaymentPending ? 'pending' : 'captured' },
              paymentStatus: isPaymentPending ? 'pending' : 'captured',
              items: (order.items || []).map((item) => ({
                productId: item.productId || item.product?._id || item.product || item.id,
                sku: item.variantSku || item.sku || '',
                name: item.name || item.title || 'AVN Gear',
                variantTitle: item.variantTitle || item.selectedSize || '',
                qty: item.quantity || item.qty || 1,
                price: `₹${(item.price ?? item.unitPrice ?? 0).toLocaleString('en-IN')}`,
                image: item.image || item.webpImage || null,
              })),
              deliveryDate: order.shipmentInfo?.deliveredAt
                ? new Date(order.shipmentInfo.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : order.fulfillmentDetails?.deliveredAt
                  ? new Date(order.fulfillmentDetails.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : order.createdAt
                    ? new Date(new Date(order.createdAt).getTime() + 3 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Pending',
              address: order.shippingAddress || order.address || null,
              paymentMethod: paymentProvider,
              financials: {
                subtotal: order.pricing?.subtotal ?? order.subtotal ?? totalPayable,
                discountAmount: order.pricing?.discount ?? order.pricing?.discountAmount ?? order.discountAmount ?? 0,
                shippingFee: order.pricing?.shippingFee ?? order.shippingFee ?? 0,
                totalAmount: totalPayable
              },
              cancellation: order.cancellation || null,
              returnRequest: order.returnRequest || null,
              cancelledAt: order.cancellation?.cancelledAt || order.cancelledAt || null,
              cancelReason: order.cancellation?.reason || order.cancelReason || null,
              returnReason: order.returnRequest?.reason || order.returnReason || null,
              createdAt: order.createdAt,
              rawOrder: order
            });
          });
        }

        setUserOrders(genuineOrders);
        if (genuineOrders.length > 0) {
          localStorage.setItem('avn-user-orders', JSON.stringify(genuineOrders));
        } else {
          localStorage.removeItem('avn-user-orders');
        }
      } catch (e) {
        console.warn('Unable to load order history from database', e);
        try {
          const localSaved = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
          setUserOrders(Array.isArray(localSaved) ? localSaved.filter(o => o.orderNumber?.startsWith('ORD-') || o.id?.startsWith('ORD-')) : []);
        } catch (err) {
          setUserOrders([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderHistory();
  }, [currentUser]);

  // Live database orders are the single source of truth
  const allCombinedOrders = userOrders;

  const getReadableStatus = (status) => {
    const map = {
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
    return map[String(status).toLowerCase()] || status;
  };

  const isOrderActive = (status) => {
    const s = String(status || '').toLowerCase();
    return ['pending_payment', 'paid', 'paid_confirmed', 'processing', 'shipped'].includes(s);
  };

  const getOrderProgressPercent = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending_payment') return 10;
    if (s === 'paid' || s === 'paid_confirmed') return 25;
    if (s === 'processing') return 50;
    if (s === 'shipped') return 75;
    if (s === 'delivered') return 100;
    return 0;
  };

  const getMilestoneIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending_payment' || s === 'paid' || s === 'paid_confirmed') return 0; // Confirmed
    if (s === 'processing') return 1;
    if (s === 'shipped') return 2;
    if (s === 'delivered') return 4;
    return 0;
  };

  const inProgressOrders = allCombinedOrders.filter((order) => isOrderActive(order.status));
  const pastOrders = allCombinedOrders.filter((order) => !isOrderActive(order.status));

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button onClick={onBack} variant="icon" title="Back to Profile">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)]">
              ORDERS & RETURNS
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium">
              Track active orders and review previously purchased equipment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 " + (
              activeTab === 'active' ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>IN PROGRESS ({inProgressOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 " + (
              activeTab === 'completed' ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            )}
          >
            <PackageCheck className="w-4 h-4" />
            <span>PREVIOUSLY ORDERED ({pastOrders.length})</span>
          </button>
        </div>

        {activeTab === 'active' ? (
          <div className="space-y-6">
            {isLoading ? (
              <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center text-xs text-[var(--text-sub)] animate-pulse">
                Loading order status...
              </div>
            ) : inProgressOrders.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
                <Clock className="w-10 h-10 text-[var(--text-sub)] mx-auto opacity-50" />
                <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">NO IN-PROGRESS ORDERS</h3>
                <p className="text-xs text-[var(--text-sub)]">You have no active shipments in transit right now.</p>
                <Button onClick={onBack} variant="primary" size="sm" className="w-fit mx-auto">
                  Browse Equipment
                </Button>
              </div>
            ) : (
              inProgressOrders.map((order) => (
                <div
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewOrderDetails?.(order)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onViewOrderDetails?.(order);
                    }
                  }}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl cursor-pointer hover:border-[#FF1E27]/60 transition-colors animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading">
                        ORDER {order.orderNumber}
                      </span>
                      <p className="text-xs text-[var(--text-sub)] font-medium">Placed on {order.date}</p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                      <span className="text-xs font-black font-mono text-[var(--text-main)]">{order.total}</span>
                      {order.isPaymentPending ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> COD • Due on Delivery
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {order.isCod ? 'Paid on Delivery' : 'Paid Online'}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                        <Truck className="w-3 h-3" /> {getReadableStatus(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)]" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)] text-[var(--text-sub)] shrink-0">
                            <Package className="w-5 h-5 opacity-40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)] truncate">{item.name}</h4>
                          <p className="text-[10px] text-[var(--text-sub)]">Qty: {item.qty} {item.variantTitle ? `| Var: ${item.variantTitle}` : ''} | {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between text-[11px] font-extrabold font-heading uppercase">
                      <span className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#FF1E27]" /> LIVE TRACKING FLOW
                      </span>
                      <span className="text-[#FF1E27] font-mono">{Math.round(getOrderProgressPercent(order.status))}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF1E27] to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${getOrderProgressPercent(order.status)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-5 gap-1 pt-2 text-center">
                      {['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((stepName, stepIdx) => {
                        const currentIdx = getMilestoneIndex(order.status);
                        const isCompleted = stepIdx <= currentIdx;
                        const isCurrent = stepIdx === currentIdx;

                        return (
                          <div key={stepName} className="flex flex-col items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${isCompleted
                              ? 'bg-[#FF1E27] border-[#FF1E27] text-white shadow-[0_0_10px_rgba(255,30,39,0.5)]'
                              : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-sub)]'
                              }`}>
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepIdx + 1}
                            </div>
                            <span className={`text-[9px] font-heading uppercase leading-tight font-extrabold ${isCurrent ? 'text-[#FF1E27]' : isCompleted ? 'text-[var(--text-main)]' : 'text-[var(--text-sub)]'
                              }`}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center text-xs text-[var(--text-sub)] animate-pulse">
                Loading order history...
              </div>
            ) : pastOrders.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
                <PackageCheck className="w-10 h-10 text-[var(--text-sub)] mx-auto opacity-50" />
                <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">NO PREVIOUS ORDERS</h3>
                <p className="text-xs text-[var(--text-sub)]">Completed or cancelled orders will appear here.</p>
                <Button onClick={onBack} variant="primary" size="sm" className="w-fit mx-auto">
                  Browse Equipment
                </Button>
              </div>
            ) : (
              pastOrders.map((order) => {
                const s = String(order.status || '').toLowerCase();
                const isCancelled = s === 'cancelled';
                const isReturned = s === 'return_requested' || s === 'returned';
                const isFailed = s === 'payment_failed';
                const isDelivered = s === 'delivered';

                return (
                  <div
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onViewOrderDetails?.(order)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewOrderDetails?.(order);
                      }
                    }}
                    className={"glass-panel p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl cursor-pointer transition-colors animate-in fade-in slide-in-from-bottom-4 " + (
                      isCancelled || isFailed
                        ? 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5'
                        : isReturned
                          ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5'
                          : 'border-[var(--border-subtle)] hover:border-[#FF1E27]/60'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading">
                          ORDER {order.orderNumber}
                        </span>
                        <p className="text-xs text-[var(--text-sub)] font-medium">Placed on {order.date}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-[var(--text-main)]">{order.total}</span>

                        {isCancelled || isFailed ? (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> {getReadableStatus(order.status)}
                          </span>
                        ) : isReturned ? (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5" /> {getReadableStatus(order.status)}
                          </span>
                        ) : isDelivered ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> DELIVERED ({order.deliveryDate})
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {getReadableStatus(order.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)]" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)] text-[var(--text-sub)] shrink-0">
                                <Package className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">{item.name}</h4>
                              <p className="text-[10px] text-[var(--text-sub)]">Qty: {item.qty} {item.variantTitle ? `| Var: ${item.variantTitle}` : ''} | {item.price}</p>
                            </div>
                          </div>

                          {!isCancelled && !isReturned && !isFailed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onWriteReviewClick) onWriteReviewClick(item, order);
                              }}
                              className="w-fit flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase font-heading hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {isCancelled && (order.cancellation?.reason || order.cancelReason) && (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                        <span className="font-bold uppercase text-[10px] tracking-wider text-rose-400 shrink-0 mt-0.5">Cancellation Reason:</span>
                        <span className="italic">"{order.cancellation?.reason || order.cancelReason}"</span>
                      </div>
                    )}

                    {isReturned && (order.returnRequest?.reason || order.returnReason) && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                        <span className="font-bold uppercase text-[10px] tracking-wider text-amber-400 shrink-0 mt-0.5">Return Reason:</span>
                        <span className="italic">"{order.returnRequest?.reason || order.returnReason}"</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}