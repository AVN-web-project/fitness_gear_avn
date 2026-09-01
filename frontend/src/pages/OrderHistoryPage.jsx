import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Clock, CheckCircle2, ChevronRight, PackageCheck, AlertCircle, MessageSquarePlus, XCircle, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import { fetchOrdersByEmail } from '../services/api';

export default function OrderHistoryPage({
  onBack,
  onWriteReviewClick,
  currentUser,
  onViewOrderDetails,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' (IN PROGRESS) | 'completed' (PREVIOUSLY ORDERED)
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderHistory = async () => {
      setIsLoading(true);
      try {
        const userEmail = currentUser?.email || JSON.parse(localStorage.getItem('avn-user') || 'null')?.email;

        let backendOrders = [];
        if (userEmail) {
          backendOrders = await fetchOrdersByEmail(userEmail);
        }

        let savedLocalOrders = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
        
        // Filter out temporary test artifact orders
        savedLocalOrders = savedLocalOrders.filter(o => {
          const id = String(o.orderId || o.id || '');
          return !id.includes('1788256') && !id.includes('1788257');
        });
        try {
          localStorage.setItem('avn-user-orders', JSON.stringify(savedLocalOrders));
        } catch (e) {}

        if (backendOrders.length > 0) {
          const mapped = backendOrders.map((order) => {
            const targetIdStr = String(order.orderId || order.id || '').toLowerCase();
            const localMatch = savedLocalOrders.find((l) => String(l.orderId || l.id || '').toLowerCase() === targetIdStr);
            const finalStatus = localMatch ? localMatch.status : (order.status || 'Processing');
            const finalTimeline = localMatch && localMatch.statusTimeline ? localMatch.statusTimeline : (order.statusTimeline || []);

            return {
              id: order.orderId || order.id,
              orderId: order.orderId || order.id,
              transactionId: order.transactionId || `AVN-TXN-${order.orderId || order.id}`,
              date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              total: `₹${order.financials?.totalAmount || 0}`,
              status: finalStatus,
              items: (order.items || []).map((item) => ({
                ...item,
                qty: item.quantity || 1,
                price: `₹${item.price || 0}`,
                slug: item.slug || item.productId || item.id,
                image: item.image || '/product-placeholder.png',
                acceptedAtDelivery: Boolean(item.acceptedAtDelivery)
              })),
              deliveryDate: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              address: order.shippingAddress || order.address || null,
              paymentMethod: order.paymentMethod || 'UPI',
              financials: order.financials || { subtotal: 0, discountAmount: 0, shippingFee: 0, totalAmount: 0 },
              customerName: order.customerName || 'AVN Customer',
              createdAt: order.createdAt,
              statusTimeline: finalTimeline
            };
          });

          setUserOrders(mapped);
          return;
        }

        if (savedLocalOrders.length > 0) {
          const filtered = savedLocalOrders.filter((order) => {
            if (!userEmail) return true;
            return (order.customerEmail || '').toLowerCase() === userEmail.toLowerCase();
          });

          const normalized = (filtered.length > 0 ? filtered : savedLocalOrders).map((order) => ({
            id: order.orderId || order.id,
            orderId: order.orderId || order.id,
            transactionId: order.transactionId || `AVN-TXN-${order.orderId || order.id}`,
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (order.date || 'Recent'),
            total: order.total || `₹${order.financials?.totalAmount || 0}`,
            status: order.status || 'Processing',
            items: (order.items || []).map((item) => ({
              ...item,
              qty: item.quantity || item.qty || 1,
              price: item.price ? (String(item.price).startsWith('₹') ? item.price : `₹${item.price}`) : '₹0',
              slug: item.slug || item.productId || item.id,
              image: item.image || '/product-placeholder.png',
              acceptedAtDelivery: Boolean(item.acceptedAtDelivery)
            })),
            deliveryDate: order.deliveryDate || 'Recent',
            address: order.address || order.shippingAddress || null,
            paymentMethod: order.paymentMethod || 'UPI',
            financials: order.financials || { subtotal: 0, discountAmount: 0, shippingFee: 0, totalAmount: 0 },
            customerName: order.customerName || 'AVN Customer',
            createdAt: order.createdAt,
            statusTimeline: order.statusTimeline || []
          }));

          setUserOrders(normalized);
          return;
        }

        setUserOrders([]);

      } catch (e) {
        console.warn('Unable to load saved order history', e);
        setUserOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderHistory();
  }, [currentUser]);

  // Read local status overrides
  const savedLocalOrders = (() => {
    try {
      return JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
    } catch (e) {
      return [];
    }
  })();

  const allCombinedOrders = userOrders.map((order) => {
    const targetIdStr = String(order.orderId || order.id || '').toLowerCase();
    const localMatch = savedLocalOrders.find((l) => String(l.orderId || l.id || '').toLowerCase() === targetIdStr);
    if (localMatch && localMatch.status) {
      return {
        ...order,
        status: localMatch.status,
        statusTimeline: localMatch.statusTimeline || order.statusTimeline || order.steps
      };
    }
    return order;
  });

  const normalizeStatus = (status) => String(status || '').trim();

  const isOrderActive = (status) => {
    const normalized = normalizeStatus(status);
    const activeStatuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'In Transit', 'Pending Dispatch'];
    return activeStatuses.includes(normalized);
  };

  const getOrderProgressPercent = (status) => {
    const orderState = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const index = orderState.indexOf(status);
    if (index === -1) return 0;
    return ((index + 1) / orderState.length) * 100;
  };

  const inProgressOrders = allCombinedOrders.filter((order) => isOrderActive(order.status));
  const pastOrders = allCombinedOrders.filter((order) => !isOrderActive(order.status));

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button
            onClick={onBack}
            variant="icon"
            title="Back to Profile"
          >
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

        {/* Tab Selector */}
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

        {/* Tab Content */}
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
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl cursor-pointer hover:border-[#FF1E27]/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading">
                        ORDER {order.orderId || order.id}
                      </span>
                      <p className="text-xs text-[var(--text-sub)] font-medium">Placed on {order.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black font-mono text-[var(--text-main)]">{order.total}</span>
                      <span className="px-3 py-1 rounded-full bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)]" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)] truncate">{item.name}</h4>
                          <p className="text-[10px] text-[var(--text-sub)]">Qty: {item.qty} | {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-extrabold font-heading uppercase">
                      <span className="text-[#FF1E27]">{order.status}</span>
                      <span className="text-[var(--text-sub)]">{Math.round(getOrderProgressPercent(order.status))}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] overflow-hidden">
                      <div
                        className="h-full bg-[#FF1E27] rounded-full transition-all duration-500"
                        style={{ width: `${getOrderProgressPercent(order.status)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* PREVIOUSLY ORDERED TAB (Includes Delivered, Cancelled, and Returned Orders) */
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
                const isCancelled = order.status === 'Cancelled';
                const isReturned = order.status === 'Return Requested';

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
                    className={"glass-panel p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl cursor-pointer transition-colors " + (
                      isCancelled
                        ? 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5'
                        : isReturned
                        ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5'
                        : 'border-[var(--border-subtle)] hover:border-[#FF1E27]/60'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading">
                          ORDER {order.orderId || order.id}
                        </span>
                        <p className="text-xs text-[var(--text-sub)] font-medium">Placed on {order.date}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-[var(--text-main)]">{order.total}</span>
                        
                        {isCancelled ? (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> CANCELLED
                          </span>
                        ) : isReturned ? (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5" /> RETURN REQUESTED
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold font-heading uppercase flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> DELIVERED ({order.deliveryDate || 'Aug 27'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)]" />
                            <div>
                              <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">{item.name}</h4>
                              <p className="text-[10px] text-[var(--text-sub)]">Qty: {item.qty || 1} | {item.price}</p>
                            </div>
                          </div>

                          {!isCancelled && !isReturned && (
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
