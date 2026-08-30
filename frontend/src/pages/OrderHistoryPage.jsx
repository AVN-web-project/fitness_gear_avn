import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Clock, CheckCircle2, ChevronRight, PackageCheck, AlertCircle, MessageSquarePlus } from 'lucide-react';
import Button from '../components/Button';

export default function OrderHistoryPage({
  onBack,
  onWriteReviewClick,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  const inProgressOrders = [
    {
      id: 'AVN-89421',
      date: 'Aug 28, 2026',
      total: '₹6,499',
      status: 'In Transit',
      items: [
        { name: 'Competition Knee Wraps', qty: 2, price: '₹1,999', slug: 'competition-knee-wraps', image: '/knee-wraps.png' },
        { name: 'AVN Power Belt', qty: 1, price: '₹2,500', slug: 'avn-power-belt', image: '/power-belt.png' }
      ],
      steps: [
        { label: 'Order Placed', date: 'Aug 28, 10:15 AM', done: true },
        { label: 'Confirmed', date: 'Aug 28, 02:30 PM', done: true },
        { label: 'Shipped', date: 'Aug 29, 09:00 AM', done: true },
        { label: 'In Transit', date: 'Aug 30, 08:00 AM', done: true },
        { label: 'Delivered', date: 'Estimated: Aug 31', done: false }
      ]
    },
    {
      id: 'AVN-89422',
      date: 'Aug 29, 2026',
      total: '₹24,999',
      status: 'Pending Dispatch',
      items: [
        { name: 'Olympic Barbell', qty: 1, price: '₹14,999', slug: 'olympic-barbell', image: '/olympic-barbell.png' },
        { name: 'Cast Iron Plate (20kg)', qty: 2, price: '₹5,000', slug: 'cast-iron-plate', image: '/plates.png' }
      ],
      steps: [
        { label: 'Order Placed', date: 'Aug 29, 04:20 PM', done: true },
        { label: 'Confirmed', date: 'Aug 30, 11:00 AM', done: true },
        { label: 'Shipped', date: '-', done: false },
        { label: 'In Transit', date: '-', done: false },
        { label: 'Delivered', date: '-', done: false }
      ]
    }
  ];

  const completedOrders = [
    {
      id: 'AVN-89423',
      date: 'Aug 25, 2026',
      total: '₹1,199',
      status: 'Delivered',
      items: [
        { name: 'Premium Gym Chalk', qty: 1, price: '₹399', slug: 'premium-gym-chalk', image: '/gym-chalk.png' },
        { name: 'AVN Wrist Straps', qty: 1, price: '₹800', slug: 'avn-wrist-straps', image: '/wrist-straps.png' }
      ],
      deliveryDate: 'Aug 27, 2026'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
<<<<<<< HEAD
          <Button
=======
          <button
>>>>>>> bf6d8c7d2eae56c1f22685767dc0faaaad48adeb
            onClick={onBack}
            variant="icon"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
<<<<<<< HEAD
          </Button>
=======
          </button>
>>>>>>> bf6d8c7d2eae56c1f22685767dc0faaaad48adeb
          <div>
            <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)]">
              MY ORDERS & SHIPMENTS
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium">
              Track live workout gear dispatches and review previously purchased equipment.
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
            <span>IN PROGRESS DISPATCHES</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 " + (
              activeTab === 'completed' ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            )}
          >
            <PackageCheck className="w-4 h-4" />
            <span>PREVIOUSLY ORDERED</span>
          </button>
        </div>

        {/* List of Orders */}
        {activeTab === 'active' ? (
          <div className="space-y-6">
            {inProgressOrders.map((order) => (
              <div key={order.id} className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
                
                {/* Order Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase">ORDER ID</span>
                    <h3 className="text-sm font-black font-heading text-[#FF1E27]">{order.id}</h3>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase">ORDER DATE & AMOUNT</span>
                    <p className="text-xs text-[var(--text-main)] font-extrabold">{order.date} • {order.total}</p>
                  </div>
                  <span className="w-fit px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase">
                    {order.status}
                  </span>
                </div>

                {/* Items in the Order */}
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-neutral-900 border border-[var(--border-subtle)] rounded-xl p-1 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase font-heading text-[var(--text-main)]">{item.name}</h4>
                        <p className="text-[10px] text-[var(--text-sub)]">Quantity: {item.qty} • Price: {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-time Shipment Timeline Tracker */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">TRACK DISPATCH TIMELINE</h4>
                  
                  <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-4 md:items-start pt-2">
                    {/* Horizontal Connector Line for Desktop */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-neutral-800 hidden md:block z-0" />
                    
                    {order.steps.map((step, idx) => (
                      <div key={idx} className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10 flex-1 relative">
                        <div className={"w-8 h-8 rounded-full border flex items-center justify-center shrink-0 " + (
                          step.done 
                            ? 'bg-[#FF1E27] border-[#FF1E27] text-white shadow-md' 
                            : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-sub)]'
                        )}>
                          {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="space-y-0.5 text-left">
                          <p className={"text-[10px] font-black uppercase font-heading " + (
                            step.done ? 'text-[var(--text-main)]' : 'text-[var(--text-sub)]'
                          )}>{step.label}</p>
                          <p className="text-[9px] text-[var(--text-sub)] font-medium leading-none">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {completedOrders.map((order) => (
              <div key={order.id} className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
                
                {/* Order Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase">ORDER ID</span>
                    <h3 className="text-sm font-black font-heading text-[#FF1E27]">{order.id}</h3>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase">DELIVERED DATE & AMOUNT</span>
                    <p className="text-xs text-[var(--text-main)] font-extrabold">{order.deliveryDate} • {order.total}</p>
                  </div>
                  <span className="w-fit px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-extrabold uppercase">
                    {order.status}
                  </span>
                </div>

                {/* Items in the Order + Write Review CTA */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-neutral-900 border border-[var(--border-subtle)] rounded-xl p-1 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold uppercase font-heading text-[var(--text-main)]">{item.name}</h4>
                          <p className="text-[10px] text-[var(--text-sub)]">Quantity: {item.qty} • Price: {item.price}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onWriteReviewClick) onWriteReviewClick(item.slug);
                        }}
                        className="w-fit flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[#FF1E27] hover:bg-[#FF1E27]/5 text-xs font-bold uppercase font-heading transition-colors cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-[#FF1E27]" />
                        <span>WRITE A REVIEW</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
