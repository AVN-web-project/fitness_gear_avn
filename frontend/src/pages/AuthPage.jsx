import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowLeft, CheckCircle2, Zap, ShieldAlert, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function AuthPage({
  onLoginSuccess,
  onBack,
  theme = 'dark'
}) {
  const { login, register, redirectPath, setRedirectPath } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let result;
      if (isSignUp) {
        result = await register(formData);
        setSuccessMessage('✓ Registration Successful! Welcome to AVN.');
      } else {
        result = await login(formData.email, formData.password);
        setSuccessMessage('✓ Login Successful! Redirecting...');
      }
      
      // Delay slightly for success toast, then trigger callback
      setTimeout(() => {
        if (onLoginSuccess && result && result.user) {
          onLoginSuccess(result.user);
        }
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-8 lg:px-16 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="relative flex items-center justify-center pb-4 border-b border-[var(--border-subtle)] text-center">
          <button
            onClick={onBack}
            className="absolute left-0 p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black font-heading italic uppercase text-[var(--text-main)] tracking-wide">
              {isSignUp ? 'JOIN AVN ATHLETICS' : 'ATHLETE SIGN IN'}
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium mt-0.5">
              Access your saved addresses, orders & pro perks.
            </p>
          </div>
        </div>



        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(''); setSuccessMessage(''); }}
            className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer " + (
              !isSignUp ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            )}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(''); setSuccessMessage(''); }}
            className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer " + (
              isSignUp ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            )}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
          
          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">FULL NAME *</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PHONE NUMBER *</label>
                <div className="relative flex items-center">
                  <Navigation className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                  <input
                    type="tel"
                    required={isSignUp}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">EMAIL ADDRESS *</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. athlete@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PASSWORD *</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              {isSignUp ? 'CREATE ATHLETE ACCOUNT' : 'SIGN IN TO AVN'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
