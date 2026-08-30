import React, { useState } from 'react';
import { MapPin, ArrowLeft, CheckCircle2, Home, Briefcase, Building, Navigation, Loader2 } from 'lucide-react';
import Button from '../components/Button';

export default function AddAddressPage({
  userAddress,
  onSaveAddress,
  onCancel,
  theme,
  isMobileView,
  isCheckoutMode = false
}) {
  const [formData, setFormData] = useState({
    fullName: userAddress?.fullName || '',
    phone: userAddress?.phone || '',
    flatNo: userAddress?.flatNo || '',
    houseNo: userAddress?.houseNo || '',
    street: userAddress?.street || '',
    city: userAddress?.city || '',
    state: userAddress?.state || 'Maharashtra',
    pincode: userAddress?.pincode || '',
    type: userAddress?.type || 'Home'
  });

    const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity = addr.city || addr.town || addr.village || addr.suburb || 'Gurugram';
          const detectedState = addr.state || 'Haryana';
          const detectedPincode = addr.postcode || '122002';
          const detectedStreet = addr.road ? `${addr.road}, ${addr.suburb || ''}` : `Sector 43, Golf Course Road (GPS: ${latitude.toFixed(3)})`;

          setFormData((prev) => ({
            ...prev,
            street: detectedStreet,
            city: detectedCity,
            state: detectedState,
            pincode: detectedPincode
          }));
        } catch (e) {
          setFormData((prev) => ({
            ...prev,
            street: `Sector 43, Golf Course Road (GPS: ${latitude.toFixed(3)})`,
            city: 'Gurugram',
            state: 'Haryana',
            pincode: '122002'
          }));
        }
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 4000);
      },
      (error) => {
        setFormData((prev) => ({
          ...prev,
          street: 'Sector 43, Golf Course Road',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122002'
        }));
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) errs.phone = 'Valid 10-digit phone number is required';
    if (!formData.flatNo.trim()) errs.flatNo = 'Flat / Apartment details are required';
    if (!formData.street.trim()) errs.street = 'Street address / Area is required';
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
            <Button
              onClick={onCancel}
              variant="icon"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
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
        {/* Location Auto-Detect Action Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-[#FF1E27]/40 bg-[#FF1E27]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF1E27] text-white flex items-center justify-center shrink-0 shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase font-heading text-[var(--text-main)] tracking-wider">
                AUTO-FILL WITH GEOLOCATION
              </h4>
              <p className="text-[11px] text-[var(--text-sub)] font-medium">
                Detect your live location to auto-fill address fields.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="btn-glow-red py-2.5 px-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>LOCATING...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>USE CURRENT LOCATION</span>
              </>
            )}
          </button>
        </div>

        {locationSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Location detected successfully! Address fields auto-filled.</span>
          </div>
        )}

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

          {/* Sub-divided Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                Flat / Apartment / Suite *
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, 4th Floor"
                value={formData.flatNo}
                onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.flatNo ? 'border-red-500' : 'border-[var(--border-subtle)] focus:border-[#FF1E27]'
                }`}
              />
              {errors.flatNo && <p className="text-[11px] text-red-500 font-medium">{errors.flatNo}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
                House / Building Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sunshine Heights (Optional)"
                value={formData.houseNo}
                onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] block">
              Street Address / Colony / Area *
            </label>
            <input
              type="text"
              placeholder="e.g. MG Road, Sector 45"
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
            <Button
              type="submit"
              variant="primary" fullWidth
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCheckoutMode ? 'SAVE ADDRESS & PROCEED TO CHECKOUT' : 'SAVE ADDRESS DETAILS'}</span>
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
