import React, { useState } from 'react';
import { Shield, Package, ShoppingBag, MessageSquare, ArrowLeft, Trash2, CheckCircle2, TrendingUp, AlertTriangle, Users, Edit } from 'lucide-react';
import Button from '../components/Button';

export default function AdminDashboardPage({
  products = [],
  onBack,
  onDeleteProduct,
  onAddProduct,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orderList, setOrderList] = useState([
    { id: 'AVN-89421', customer: 'Vikram Malhotra', items: '2x Competition Knee Wraps, 1x Power Belt', total: 6499, date: '2026-08-28', status: 'In Transit' },
    { id: 'AVN-89422', customer: 'Rohan Gupta', items: '1x Olympic Barbell, 2x 20kg Plates', total: 24999, date: '2026-08-29', status: 'Pending' },
    { id: 'AVN-89423', customer: 'Sania Mirza', items: '1x Premium Gym Chalk, 1x Wrist Straps', total: 1199, date: '2026-08-30', status: 'Delivered' }
  ]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'WEIGHTS',
    image: '/iron-dumbbell.png',
    stock: 50,
    rating: 4.8,
    reviewsCount: 12
  });

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    const productPayload = {
      id: 'prod-' + Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image,
      stock: parseInt(newProduct.stock) || 0,
      rating: newProduct.rating,
      reviewsCount: newProduct.reviewsCount
    };

    if (onAddProduct) onAddProduct(productPayload);
    
    setNewProduct({
      name: '',
      price: '',
      category: 'WEIGHTS',
      image: '/iron-dumbbell.png',
      stock: 50,
      rating: 4.8,
      reviewsCount: 12
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="icon"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#FF1E27]" />
                <span>AVN OPERATIONS PANEL</span>
              </h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                Privileged Administrator Dashboard to manage products, orders, and review moderation.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase font-heading bg-[#FF1E27] text-white px-3 py-1.5 rounded-full shadow-md">
            🛡️ LIVE SECURITY: ENFORCED
          </span>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Revenue', value: '₹32,697', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Active Dispatches', value: orderList.filter(o => o.status !== 'Delivered').length, icon: ShoppingBag, color: 'text-[#FF1E27]', bg: 'bg-[#FF1E27]/10' },
            { label: 'In-Stock Catalog', value: products.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Low Stock Alerts', value: products.filter(p => (p.stock || 0) < 5).length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-black font-heading">{stat.value}</p>
              </div>
              <div className={"w-10 h-10 rounded-xl " + stat.bg + " " + stat.color + " flex items-center justify-center"}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[var(--border-subtle)] space-x-6">
          {[
            { id: 'orders', label: 'Order Dispatch Queue', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory Manager', icon: Package }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"flex items-center gap-2 py-4 border-b-2 text-xs font-black font-heading uppercase tracking-wider transition-colors cursor-pointer " + (
                activeTab === tab.id
                  ? 'border-[#FF1E27] text-[var(--text-main)]'
                  : 'border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'orders' ? (
          <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
              <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">Live Customer Orders</h3>
              <p className="text-[11px] text-[var(--text-sub)]">Modify delivery dispatch status here to update tracking details instantly.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)] text-[10px] font-black uppercase text-[var(--text-sub)] tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items / Description</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                  {orderList.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="p-4 font-bold text-[#FF1E27]">{order.id}</td>
                      <td className="p-4 font-semibold">{order.customer}</td>
                      <td className="p-4 text-[var(--text-sub)]">{order.items}</td>
                      <td className="p-4 font-bold">₹{order.total}</td>
                      <td className="p-4 text-[var(--text-sub)]">{order.date}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-[#FF1E27]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Inventory Listing */}
            <div className="lg:col-span-2 glass-panel rounded-3xl border border-[var(--border-subtle)] overflow-hidden shadow-xl flex flex-col">
              <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
                <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">Stock Levels & SKU Management</h3>
                <p className="text-[11px] text-[var(--text-sub)]">Instantly moderate availability, delete product items, or monitor low quantities.</p>
              </div>

              <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto max-h-[600px]">
                {products.map((p) => {
                  const isLowStock = (p.stock || 0) < 5;
                  return (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-main)]/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-neutral-900 border border-[var(--border-subtle)] p-1 rounded-xl" />
                        <div>
                          <h4 className="text-xs font-extrabold uppercase font-heading text-[var(--text-main)] line-clamp-1">{p.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#FF1E27]">₹{p.price}</span>
                            <span className="text-[10px] text-[var(--text-sub)]">Stock: <span className="font-bold text-[var(--text-main)]">{p.stock || 50}</span></span>
                            {isLowStock && (
                              <span className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                LOW
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 border border-[var(--border-subtle)] hover:border-rose-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create Product Form */}
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xl space-y-4 h-fit">
              <div>
                <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">Add Product to Catalog</h3>
                <p className="text-[11px] text-[var(--text-sub)]">Populate initial parameters below to add a new catalog item instantly.</p>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PRODUCT NAME *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. AVN Powerlifting Belt"
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[#FF1E27]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PRICE (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 3499"
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[#FF1E27]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">CATEGORY</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-xs px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] outline-none focus:border-[#FF1E27]"
                    >
                      <option value="WEIGHTS">WEIGHTS</option>
                      <option value="SUPPORT GEAR">SUPPORT GEAR</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">STOCK LEVEL</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[#FF1E27]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary" fullWidth size="md"
                  >
                    + ADD PRODUCT
                  </Button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
