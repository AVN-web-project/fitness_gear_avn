import React from 'react';
import { MapPin, ArrowLeft, ArrowRight, Plus, Trash2, Edit3, CheckCircle, Check, ShieldCheck, ShoppingBag } from 'lucide-react';
import Button from '../components/Button';

export default function AddressListPage({
  savedAddresses = [],
  selectedAddressId = null,
  isCheckoutMode = false,
  onBack,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onSelectAddressForCheckout,
  theme = 'dark'
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="icon"
              title={isCheckoutMode ? 'Return to Checkout' : 'Back to Profile'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2.5 flex-wrap">
                <span>{isCheckoutMode ? 'SELECT DELIVERY ADDRESS' : 'MANAGE ADDRESSES'}</span>
                {isCheckoutMode && (
                  <span className="text-[10px] not-italic font-extrabold uppercase bg-[#FF1E27]/15 text-[#FF1E27] border border-[#FF1E27]/30 px-2.5 py-0.5 rounded-full font-mono">
                    CHECKOUT
                  </span>
                )}
              </h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                {isCheckoutMode
                  ? 'Click any address card to select it for your order.'
                  : 'View and manage your saved shipping destinations.'}
              </p>
            </div>
          </div>

          <Button onClick={onAddNewAddress} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            <span>ADD NEW ADDRESS</span>
          </Button>
        </div>

        {/* Empty State */}
        {savedAddresses.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center border border-[#FF1E27]/30">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading uppercase text-[var(--text-main)]">No saved addresses yet</h2>
              <p className="text-xs text-[var(--text-sub)] font-medium mt-2">
                Add your first delivery destination to proceed with checkout.
              </p>
            </div>
            <Button onClick={onAddNewAddress} variant="outline" className="mx-auto">
              + Create First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedAddresses.map((addr) => {
                const isCurrentSelected = addr.id === selectedAddressId || (!selectedAddressId && addr.isDefault);

                return (
                  <div
                    key={addr.id}
                    onClick={isCheckoutMode ? () => onSetDefaultAddress(addr.id) : undefined}
                    className={`glass-panel p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-4 relative group ${
                      isCheckoutMode
                        ? isCurrentSelected
                          ? 'border-2 border-[#FF1E27] shadow-[0_0_24px_rgba(255,30,39,0.22)] bg-[#FF1E27]/5 ring-1 ring-[#FF1E27]/30 cursor-pointer'
                          : 'border border-[var(--border-subtle)] hover:border-[var(--text-sub)]/60 hover:bg-white/[0.02] cursor-pointer'
                        : addr.isDefault
                          ? 'border border-emerald-500/30 bg-emerald-500/[0.02]'
                          : 'border border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges & Radio Indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase font-heading px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[#FF1E27]">
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase font-heading text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" /> DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Circular Selection Indicator (Checkout selection mode only) */}
                        {isCheckoutMode && (
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isCurrentSelected
                                ? 'bg-[#FF1E27] text-white shadow-sm'
                                : 'border-2 border-[var(--border-subtle)] group-hover:border-white/50'
                            }`}
                          >
                            {isCurrentSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        )}
                      </div>

                      {/* Recipient Details */}
                      <div>
                        <h3 className="text-sm font-black font-heading text-[var(--text-main)]">
                          {addr.fullName}
                        </h3>
                        <p className="text-[11px] text-[var(--text-sub)] font-medium">
                          Phone: <span className="text-[var(--text-main)] font-semibold">{addr.phone}</span>
                        </p>
                      </div>

                      {/* Address Lines */}
                      <div className="text-[11px] text-[var(--text-sub)] space-y-0.5 leading-relaxed">
                        {(addr.houseNo || addr.flatNo) && (
                          <p className="font-semibold text-[var(--text-main)]">
                            {[addr.houseNo, addr.flatNo].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state} - <span className="font-mono font-bold text-[var(--text-main)]">{addr.pincode}</span>
                        </p>
                        {addr.landmark && (
                          <p className="text-[10px] font-semibold text-[var(--text-main)] pt-0.5">
                            Landmark: {addr.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end text-[11px]">
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {!isCheckoutMode && !addr.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetDefaultAddress?.(addr.id);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-emerald-500 text-[var(--text-sub)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-heading uppercase tracking-wider"
                            title="Set as Default Address"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Set Default</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditAddress(addr);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-sub)] hover:text-[#FF1E27] hover:bg-[#FF1E27]/5 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-heading uppercase tracking-wider"
                          title="Edit Address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAddress(addr.id);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-rose-500 text-[var(--text-sub)] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-heading uppercase tracking-wider"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Checkout Continuation CTA */}
            {isCheckoutMode && (
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-[var(--text-sub)]">
                  Selected delivery address will automatically apply to your order.
                </p>
                <Button
                  onClick={onBack}
                  variant="primary"
                  size="md"
                  className="btn-cart-inward-glow"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>CONFIRM & RETURN TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
