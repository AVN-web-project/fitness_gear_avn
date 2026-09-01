import React from 'react';
import { MapPin, ArrowLeft, Plus, Trash2, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';

export default function AddressListPage({
  savedAddresses = [],
  onBack,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  theme = 'dark'
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} variant="icon" title="Back to Profile">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)]">
                MANAGE ADDRESSES
              </h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                View all saved shipping destinations and update your default address.
              </p>
            </div>
          </div>

          <Button onClick={onAddNewAddress} variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            <span>ADD NEW ADDRESS</span>
          </Button>
        </div>

        {savedAddresses.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center border border-[#FF1E27]/30">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading uppercase text-[var(--text-main)]">No saved addresses yet</h2>
              <p className="text-xs text-[var(--text-sub)] font-medium mt-2">
                Add your first delivery destination to continue shopping.
              </p>
            </div>
            <Button onClick={onAddNewAddress} variant="outline" className="mx-auto">
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
  );
}
