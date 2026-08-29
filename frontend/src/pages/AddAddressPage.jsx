import React, { useState } from 'react';
import { MapPin, ArrowLeft, CheckCircle2, Home, Briefcase, Building } from 'lucide-react';

export default function AddAddressPage({
  userAddress,
  onSaveAddress,
  onCancel,
  theme,
  isMobileView
}) {
  const [formData, setFormData] = useState({
    fullName: userAddress?.fullName || '',
    phone: userAddress?.phone || '',
    street: userAddress?.street || '',
    city: userAddress?.city || '',
    state: userAddress?.state || 'Maharashtra',
    pincode: userAddress?.pincode || '',
    type: userAddress?.type || 'Home'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errs.phone = 'Valid 10-digit phone number is required';
    if (!formData.street.trim()) errs.street = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) errs.pincode = 'Valid 6-digit Pincode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSaveAddress(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black italic uppercase tracking-wide text-[var(--text-main)] flex items-center gap-2.5">
              <MapPin className="w-7 h-7 text-[#FF1E27]" />
              {userAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-sub)]">
              {userAddress ? 'Update your shipping details below' : 'Please provide your address to continue with checkout'}
            </p>
          </div>
        </div>

        {/* Address Form Card */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
          
          {/* Address Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase font-heading text-[var(--text-sub)] tracking-wider block">
              Address Type
            </label>
            <div className="flex items-center gap-3">
              {[
                { label: 'Home', icon: Home },
                { label: 'Work', icon: Briefcase },
                { label: 'Other', icon: Building }
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: label })}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formData.type === label
                      ? 'bg-[#FF1E27] text-white border-[#FF1E27] shadow-md'
                      : 'border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:border-[var(--text-sub)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-red-500 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Flat, House No, Building, Street */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
              Flat, House No., Building, Street / Area *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                errors.street ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
              }`}
            />
            {errors.street && <p className="text-[11px] text-red-500 font-medium">{errors.street}</p>}
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                City / Town *
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.city ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
                }`}
              />
              {errors.city && <p className="text-[11px] text-red-500 font-medium">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                State *
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                Pincode *
              </label>
              <input
                type="text"
                placeholder="6-digit Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.pincode ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
                }`}
              />
              {errors.pincode && <p className="text-[11px] text-red-500 font-medium">{errors.pincode}</p>}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              className="w-full btn-glow-red py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>SAVE ADDRESS & PROCEED TO CHECKOUT</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
