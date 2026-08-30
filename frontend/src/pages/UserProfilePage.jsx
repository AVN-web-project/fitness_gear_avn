import React from 'react';
import { User, MapPin, PackageCheck, ShieldCheck, ArrowLeft, ChevronRight, Award, LogOut, Plus, Trash2, Edit3, CheckCircle } from 'lucide-react';
import Button from '../components/Button';

export default function UserProfilePage({
  currentUser,
  savedAddresses = [],
  onSetDefaultAddress,
  onDeleteAddress,
  onEditAddress,
  onAddNewAddress,
  onNavigateOrders,
  onNavigateAuth,
  onNavigateAdminDashboard,
  onBack,
  onSignOut,
  theme = 'dark'
}) {
  const user = currentUser || {
    name: 'Not Logged In',
    email: 'N/A',
    phone: 'N/A',
    tier: 'MEMBER',
    memberSince: ''
  };

  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="icon"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)]">
                MY ACCOUNT & PROFILE
              </h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                Manage your membership, saved addresses, and active orders.
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-[#FF1E27] text-xs font-extrabold font-heading uppercase">
            <Award className="w-4 h-4" /> {user.tier || 'PRO ATHLETE'}
          </span>
        </div>

        {/* User Info Overview Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#FF1E27]/20 border-2 border-[#FF1E27] text-[#FF1E27] flex items-center justify-center font-black font-heading text-3xl shadow-lg shrink-0">
              {(user.name || user.fullName || 'V').charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black font-heading uppercase text-[var(--text-main)]">
                  {user.name || user.fullName}
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-[var(--text-sub)] font-medium">{user.email}</p>
              <p className="text-xs text-[var(--text-sub)] font-medium">Phone: {user.phone}</p>
              <p className="text-[10px] text-emerald-400 font-extrabold uppercase font-heading pt-1">
                ✓ AVN Verified Member (Since {user.memberSince || '2023'})
              </p>
            </div>
          </div>

          <Button
            onClick={onSignOut}
            variant="danger" size="md"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </Button>
        </div>

        {/* Quick Shortcut Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {user && user.role === 'admin' && (
            <div
              onClick={onNavigateAdminDashboard}
              className="glass-panel p-6 rounded-3xl border border-amber-500/30 hover:border-amber-400 bg-amber-500/5 transition-all duration-300 cursor-pointer space-y-4 group shadow-lg md:col-span-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading uppercase text-amber-400">
                      🛡️ ADMIN CONSOLE
                    </h3>
                    <p className="text-xs text-[var(--text-sub)] font-medium">
                      Manage products, orders, stock levels, and user reviews.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
          )}

          {/* Order History & Live Tracking Tile (Full Width) */}
          <div
            onClick={onNavigateOrders}
            className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all duration-300 cursor-pointer space-y-4 group shadow-lg md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">
                    MY ORDERS & TRACKING
                  </h3>
                  <p className="text-xs text-[var(--text-sub)] font-medium">
                    View active dispatches, tracking timelines & order history
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-sub)] group-hover:text-[#FF1E27] transition-colors" />
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold font-heading text-[var(--text-main)]">ORDER #AVN-89421</span>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                  IN TRANSIT
                </span>
              </div>
              <p className="text-[var(--text-sub)] text-[11px]">2x Competition Knee Wraps, 1x Power Belt</p>
            </div>
          </div>

        </div>

        {/* Integrated Saved Addresses Section */}
        <div id="saved-addresses-section" className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-heading italic uppercase text-[var(--text-main)]">
                SAVED ADDRESS DESTINATIONS
              </h2>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                Manage your shipping destinations directly inside your athlete profile.
              </p>
            </div>
            <Button
              onClick={onAddNewAddress}
              variant="primary" size="sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD NEW ADDRESS</span>
            </Button>
          </div>

          {savedAddresses.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-[var(--border-subtle)] text-center space-y-3">
              <p className="text-xs text-[var(--text-sub)] italic">No saved addresses found. Add a default shipping destination.</p>
              <Button
                onClick={onAddNewAddress}
                variant="outline" size="sm" className="w-fit mx-auto"
              >
                + Create First Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`glass-panel p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    addr.isDefault
                      ? 'border-2 border-[#FF1E27] shadow-lg bg-[#FF1E27]/5'
                      : 'border-[var(--border-subtle)] hover:border-[var(--text-sub)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase font-heading px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[#FF1E27]">
                        {addr.type || 'HOME'}
                      </span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase font-heading text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" /> DEFAULT
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-black font-heading text-[var(--text-main)]">
                        {addr.fullName}
                      </h3>
                      <p className="text-[11px] text-[var(--text-sub)] font-medium">
                        Phone: <span className="text-[var(--text-main)] font-semibold">{addr.phone}</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-[var(--text-sub)] space-y-0.5 leading-relaxed">
                      {(addr.houseNo || addr.flatNo) && (
                        <p className="font-semibold text-[var(--text-main)]">
                          {[addr.houseNo, addr.flatNo].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - <span className="font-mono font-bold text-[var(--text-main)]">{addr.pincode}</span></p>
                      {addr.landmark && (
                        <p className="text-[10px] font-semibold text-[var(--text-main)] pt-0.5">Landmark: {addr.landmark}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => onSetDefaultAddress(addr.id)}
                        className="text-[10px] font-bold text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors cursor-pointer"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Primary Shipping Address
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditAddress(addr)}
                        className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-main)] transition-colors cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => onDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-rose-500 text-rose-400 transition-colors cursor-pointer"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
