import React, { useState } from 'react';
import { User, MapPin, PackageCheck, ShieldCheck, ArrowLeft, ChevronRight, Award, LogOut, Plus, Trash2, Edit3, CheckCircle, Mail, Phone, Lock, KeyRound, AlertCircle, X, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function UserProfilePage({
  currentUser,
  savedAddresses = [],
  onSetDefaultAddress,
  onDeleteAddress,
  onEditAddress,
  onAddNewAddress,
  onNavigateOrders,
  onNavigateAuth,
  onOpenAddressManager,
  onBack,
  onSignOut,
  theme = 'dark'
}) {
  const { user: authUser, updateProfile, setPassword, sendEmailOtp } = useAuth();

  const user = authUser || currentUser || {
    name: 'Not Logged In',
    email: 'N/A',
    phone: 'N/A',
    tier: 'MEMBER',
    memberSince: ''
  };

  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  // Dynamic Latest Order Preview
  const latestActiveOrder = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
      const userEmail = (user.email || '').toLowerCase();
      const userOrders = saved.filter(
        (o) => !userEmail || (o.customerEmail || '').toLowerCase() === userEmail
      );
      const activeStatuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'In Transit', 'Pending Dispatch', 'Paid & Confirmed', 'paid_confirmed'];
      const activeMatch = userOrders.find((o) => activeStatuses.includes(o.status));
      return activeMatch || null;
    } catch (e) {
      return null;
    }
  })();

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMode, setVerificationMode] = useState('password'); // 'password' | 'code'
  const [sentCode, setSentCode] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const openEditModal = () => {
    setFormData({
      name: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setCurrentPassword('');
    setVerificationCode('');
    setSentCode(null);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditModalOpen(true);
  };

  const isEmailChanged = (formData.email || '').toLowerCase().trim() !== (user.email || '').toLowerCase().trim();

  const handleSendCode = async () => {
    try {
      if (sendEmailOtp && user?.email) {
        await sendEmailOtp(user.email, 'login');
      }
      setSentCode(true);
      setSuccessMessage(`✓ Verification code sent to ${user.email}! Please check your inbox.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code. Please try again.');
    }
  };

  // Set / Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const openPasswordModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError('');
    setPasswordSuccess('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setPasswordLoading(true);
    try {
      await setPassword(newPassword);
      setPasswordSuccess('✓ Password saved successfully!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 1200);
    } catch (err) {
      setPasswordError(err.message || 'Failed to save password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isEmailChanged && !currentPassword && !verificationCode) {
      setErrorMessage('Current email verification required to change email address.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        {
          currentPassword,
          verificationCode
        }
      );

      setSuccessMessage('✓ Profile details updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

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
                ACCOUNT & PROFILE
              </h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                Manage your membership, profile details, saved addresses, and active orders.
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={openEditModal}
              variant="outline"
              size="sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT DETAILS</span>
            </Button>
            <Button
              onClick={onSignOut}
              variant="danger"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </Button>
          </div>
        </div>

        {/* Quick Shortcut Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Order History & Live Tracking Tile */}
          <div
            onClick={onNavigateOrders}
            className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all duration-300 cursor-pointer space-y-4 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">
                    ORDERS & RETURNS
                  </h3>
                  <p className="text-xs text-[var(--text-sub)] font-medium">
                    View active dispatches, returns & order history
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-sub)] group-hover:text-[#FF1E27] transition-colors" />
            </div>

            {latestActiveOrder ? (
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold font-heading text-[var(--text-main)]">
                    ORDER #{latestActiveOrder.orderId || latestActiveOrder.id}
                  </span>
                  <span className={"text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full " + (
                    latestActiveOrder.status === 'Cancelled'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : ['Processing', 'Shipped', 'In Transit', 'Pending Dispatch'].includes(latestActiveOrder.status)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-300'
                  )}>
                    {latestActiveOrder.status || 'Processing'}
                  </span>
                </div>
                <p className="text-[var(--text-sub)] text-[11px] truncate">
                  {(latestActiveOrder.items || []).map((i) => `${i.quantity || i.qty || 1}x ${i.name || i.productName || 'Equipment'}`).join(', ')}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs flex items-center justify-between text-[var(--text-sub)]">
                <span>No active shipments. Click to view order history.</span>
                <span className="text-[9px] font-extrabold uppercase font-heading bg-slate-700/40 text-slate-400 px-2 py-0.5 rounded-full">
                  ALL CLEAR
                </span>
              </div>
            )}
          </div>

          {/* Account Security & Password Tile */}
          <div
            onClick={openPasswordModal}
            className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all duration-300 cursor-pointer space-y-4 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">
                    ACCOUNT SECURITY
                  </h3>
                  <p className="text-xs text-[var(--text-sub)] font-medium">
                    Manage password & sign-in credentials
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-sub)] group-hover:text-[#FF1E27] transition-colors" />
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
              <span className="text-[var(--text-sub)]">
                {user.authProvider === 'local' ? 'Password login enabled' : 'Password not configured'}
              </span>
              <span className={"text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full " + (
                user.authProvider === 'local'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              )}>
                {user.authProvider === 'local' ? 'CHANGE PASSWORD' : 'SET PASSWORD'}
              </span>
            </div>
          </div>

        </div>

        {/* Default Address Section */}
        <div id="saved-addresses-section" className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-heading italic uppercase text-[var(--text-main)]">
                DEFAULT ADDRESS
              </h2>
              <p className="text-xs text-[var(--text-sub)] font-medium">
                Your selected primary delivery destination.
              </p>
            </div>
            <Button
              onClick={onOpenAddressManager || onAddNewAddress}
              variant="primary" size="sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>MANAGE ADDRESSES</span>
            </Button>
          </div>

          {!defaultAddress ? (
            <div className="glass-panel p-8 rounded-3xl border border-[var(--border-subtle)] text-center space-y-3">
              <p className="text-xs text-[var(--text-sub)] italic">No default address set. Add a shipping destination.</p>
              <Button
                onClick={onAddNewAddress}
                variant="outline" size="sm" className="w-fit mx-auto"
              >
                + Add Address
              </Button>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-3xl border-2 border-[#FF1E27] shadow-lg bg-[#FF1E27]/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase font-heading px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[#FF1E27]">
                    {defaultAddress.type || 'HOME'}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase font-heading text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" /> DEFAULT
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black font-heading text-[var(--text-main)]">
                    {defaultAddress.fullName}
                  </h3>
                  <p className="text-[11px] text-[var(--text-sub)] font-medium">
                    Phone: <span className="text-[var(--text-main)] font-semibold">{defaultAddress.phone}</span>
                  </p>
                </div>

                <div className="text-[11px] text-[var(--text-sub)] space-y-0.5 leading-relaxed">
                  {(defaultAddress.houseNo || defaultAddress.flatNo) && (
                    <p className="font-semibold text-[var(--text-main)]">
                      {[defaultAddress.houseNo, defaultAddress.flatNo].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p>{defaultAddress.street}</p>
                  <p>{defaultAddress.city}, {defaultAddress.state} - <span className="font-mono font-bold text-[var(--text-main)]">{defaultAddress.pincode}</span></p>
                  {defaultAddress.landmark && (
                    <p className="text-[10px] font-semibold text-[var(--text-main)] pt-0.5">Landmark: {defaultAddress.landmark}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* EDIT PROFILE MODAL WITH EMAIL VERIFICATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF1E27]" /> EDIT ATHLETE PROFILE
                </h2>
                <p className="text-xs text-[var(--text-sub)] font-medium">Update your name, phone number, or email address.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF1E27]" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#FF1E27]" /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FF1E27]" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>

              {/* EMAIL CHANGE VERIFICATION STEP */}
              {isEmailChanged && (
                <div className="p-4 rounded-2xl bg-[#FF1E27]/10 border-2 border-[#FF1E27]/40 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#FF1E27] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black font-heading uppercase text-white tracking-wider">
                        SECURITY VERIFICATION REQUIRED
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5">
                        You are changing your account email from <span className="text-[#FF1E27] font-mono font-bold">{user.email}</span> to <span className="text-emerald-400 font-mono font-bold">{formData.email}</span>. Verification of your current email is required.
                      </p>
                    </div>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setVerificationMode('password')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${verificationMode === 'password' ? 'bg-[#FF1E27] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Verify via Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationMode('code')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${verificationMode === 'code' ? 'bg-[#FF1E27] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Verify via Code (OTP)
                    </button>
                  </div>

                  {verificationMode === 'password' ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#FF1E27]" /> Current Password
                      </label>
                      <input
                        type="password"
                        required={isEmailChanged}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[var(--bg-main)] text-white text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                        placeholder="Enter your current password to confirm email change"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#FF1E27]" /> Verification Code (OTP)
                        </label>
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="text-[10px] font-extrabold uppercase text-[#FF1E27] hover:underline"
                        >
                          {sentCode ? 'Resend Code' : 'Send Code to Current Email'}
                        </button>
                      </div>
                      <input
                        type="text"
                        required={isEmailChanged}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-[var(--bg-main)] text-white font-mono tracking-widest text-center text-sm px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                        placeholder="Enter 6-digit verification code"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Submit / Cancel CTAs */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  size="md"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  variant="primary"
                  size="md"
                >
                  SAVE CHANGES
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* SET / CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#FF1E27]" />
                  {user.authProvider === 'local' ? 'CHANGE PASSWORD' : 'SET ACCOUNT PASSWORD'}
                </h2>
                <p className="text-xs text-[var(--text-sub)] font-medium">
                  {user.authProvider === 'local'
                    ? 'Update your password for faster sign-in next time.'
                    : 'Create a password to sign in without waiting for an email OTP.'}
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 rounded-xl border border-[var(--border-subtle)] hover:border-[#FF1E27] text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF1E27]" /> New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm pl-4 pr-11 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF1E27]" /> Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm pl-4 pr-11 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-sub)] leading-relaxed">
                Once saved, you will be able to sign in using either your password or 6-digit OTP codes.
              </p>

              {/* Submit / Cancel CTAs */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  variant="outline"
                  size="md"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  loading={passwordLoading}
                  variant="primary"
                  size="md"
                >
                  {user.authProvider === 'local' ? 'UPDATE PASSWORD' : 'SAVE PASSWORD'}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

