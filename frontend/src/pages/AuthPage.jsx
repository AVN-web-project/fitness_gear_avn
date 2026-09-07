import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({
  onLoginSuccess,
  onBack
}) {
  const {
    login,
    register,
    sendEmailOtp,
    verifyEmailOtp,
    setPassword
  } = useAuth();

  // Mode: 'signin' vs 'signup'
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In method: 'password' vs 'otp'
  const [signInMethod, setSignInMethod] = useState('password');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // Sign-In OTP Flow State
  const [loginOtpStep, setLoginOtpStep] = useState('request'); // 'request' | 'verify'
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpTimer, setLoginOtpTimer] = useState(0);
  const [loginDevOtpHint, setLoginDevOtpHint] = useState('');

  // Create Account Flow State (with email OTP verification & optional password creation)
  const [signUpStep, setSignUpStep] = useState('form'); // 'form' | 'verify' | 'password'
  const [signUpOtp, setSignUpOtp] = useState('');
  const [signUpTimer, setSignUpTimer] = useState(0);
  const [signUpDevOtpHint, setSignUpDevOtpHint] = useState('');
  const activeDevOtp = loginDevOtpHint || signUpDevOtpHint;
  const [registeredUser, setRegisteredUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback State
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cooldown countdown timer for Login OTP resend
  useEffect(() => {
    let interval = null;
    if (loginOtpTimer > 0) {
      interval = setInterval(() => {
        setLoginOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginOtpTimer]);

  // Cooldown countdown timer for Signup OTP resend
  useEffect(() => {
    let interval = null;
    if (signUpTimer > 0) {
      interval = setInterval(() => {
        setSignUpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [signUpTimer]);

  const handleSuccess = (user) => {
    setTimeout(() => {
      if (onLoginSuccess && user) {
        onLoginSuccess(user);
      }
    }, 600);
  };

  const switchToCreateAccount = () => {
    setIsSignUp(true);
    setSignUpStep('form');
    setErrorMessage('');
    setSuccessMessage('');
    setSignUpDevOtpHint('');
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
    setErrorMessage('');
    setSuccessMessage('');
    setLoginOtpStep('request');
    setLoginDevOtpHint('');
  };

  // 1. Password Sign-In Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      setSuccessMessage('✓ Login successful! Redirecting...');
      handleSuccess(result?.user);
    } catch (err) {
      const isNotFound =
        err.status === 404 ||
        err.data?.statusCode === 404 ||
        err.message?.toLowerCase().includes('no account found') ||
        err.data?.errors?.some((item) => item.reason === 'USER_NOT_FOUND');

      if (isNotFound) {
        // Automatically switch to Create Account with email pre-filled (no spoon-feeding)
        setIsSignUp(true);
        setSignUpStep('form');
        setErrorMessage('');
        setSuccessMessage('');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Request Login OTP Code
  const handleSendLoginOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetEmail = (formData.email || '').trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your email address first.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await sendEmailOtp(targetEmail, 'login');
      const devOtp = res?.devOtp || res?.data?.devOtp;
      if (devOtp) {
        setLoginDevOtpHint(devOtp);
      }
      setLoginOtpStep('verify');
      setLoginOtpTimer(60);
      setSuccessMessage(`✓ 6-digit code sent to ${targetEmail}`);
    } catch (err) {
      const isNotFound =
        err.status === 404 ||
        err.data?.statusCode === 404 ||
        err.message?.toLowerCase().includes('no account found') ||
        err.data?.errors?.some((item) => item.reason === 'USER_NOT_FOUND');

      if (isNotFound) {
        // Automatically switch to Create Account with email pre-filled (no spoon-feeding)
        setIsSignUp(true);
        setSignUpStep('form');
        setErrorMessage('');
        setSuccessMessage('');
      } else {
        setErrorMessage(err.message || 'Failed to send OTP. Please verify email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify Login OTP Code
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!loginOtpCode || loginOtpCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const result = await verifyEmailOtp(formData.email, loginOtpCode);
      setSuccessMessage('✓ Code verified! Signing in...');
      handleSuccess(result?.user);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Create Account - Step 1: Request Email Verification OTP
  const handleSignUpRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMessage('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendEmailOtp(formData.email, 'register');
      const devOtp = res?.devOtp || res?.data?.devOtp;
      if (devOtp) {
        setSignUpDevOtpHint(devOtp);
      }
      setSignUpStep('verify');
      setSignUpTimer(60);
      setSuccessMessage(`✓ 6-digit verification code sent to ${formData.email}`);
    } catch (err) {
      if (err.status === 409 || err.message?.toLowerCase().includes('already exists')) {
        setErrorMessage('Account exists! Switched to Sign In with Email OTP.');
        setIsSignUp(false);
        setSignInMethod('otp');
        setLoginOtpStep('request');
      } else {
        setErrorMessage(err.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Create Account - Step 2: Verify OTP & Complete Registration -> Transition to Password Creation
  const handleSignUpComplete = async (e) => {
    e.preventDefault();
    if (!signUpOtp || signUpOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        otp: signUpOtp
      };
      const result = await register(payload);
      setRegisteredUser(result?.user);
      setSignUpStep('password');
      setSuccessMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Create Password - Step 3: Set Password (Optional)
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setPassword(newPassword);
      setSuccessMessage('✓ Password saved successfully! Entering...');
      handleSuccess(registeredUser);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip Password Setup
  const handleSkipPassword = () => {
    setSuccessMessage('✓ Entering AVN Athletics...');
    handleSuccess(registeredUser);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-4 sm:px-8 lg:px-16 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">

        {/* Top Header */}
        <div className="relative flex items-center justify-center pb-4 border-b border-[var(--border-subtle)] text-center">
          <button
            onClick={signUpStep === 'password' ? handleSkipPassword : onBack}
            className="absolute left-0 p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black font-heading italic uppercase text-[var(--text-main)] tracking-wide">
              {signUpStep === 'password'
                ? 'CREATE PASSWORD'
                : isSignUp
                  ? 'JOIN AVN ATHLETICS'
                  : 'ATHLETE SIGN IN'}
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium mt-0.5">
              {signUpStep === 'password'
                ? 'Optional: Set a password for future logins, or skip.'
                : 'Access your orders, saved addresses & pro athlete perks.'}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
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


        {/* Top Mode Switcher: Only for Sign In / Sign Up */}
        {signUpStep !== 'password' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={switchToSignIn}
              className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer " + (
                !isSignUp ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              )}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={switchToCreateAccount}
              className={"py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading transition-all cursor-pointer " + (
                isSignUp ? 'bg-[#FF1E27] text-white shadow-md' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              )}
            >
              CREATE ACCOUNT
            </button>
          </div>
        )}

        {/* Main Form Glass Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-xl">

          {/* ======================================================== */}
          {/* VIEW A: SIGN IN (PASSWORD vs EMAIL OTP)                  */}
          {/* ======================================================== */}
          {!isSignUp && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[11px] font-extrabold font-heading uppercase tracking-wider text-[var(--text-sub)] mb-2">
                  CHOOSE SIGN-IN METHOD:
                </p>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('password');
                      setErrorMessage('');
                    }}
                    className={"py-2.5 rounded-lg text-xs font-black uppercase font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 " + (
                      signInMethod === 'password'
                        ? 'bg-[#FF1E27] text-white shadow-md'
                        : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                    )}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>PASSWORD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('otp');
                      setErrorMessage('');
                    }}
                    className={"py-2.5 rounded-lg text-xs font-black uppercase font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 " + (
                      signInMethod === 'otp'
                        ? 'bg-[#FF1E27] text-white shadow-md'
                        : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                    )}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>EMAIL OTP</span>
                  </button>
                </div>
              </div>

              {/* OPTION 1: Email with Password */}
              {signInMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">EMAIL ADDRESS *</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. athlete@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PASSWORD *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('otp');
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="text-[10px] font-bold text-[#FF1E27] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'SIGNING IN...' : 'SIGN IN WITH PASSWORD'}
                    </button>
                  </div>
                </form>
              )}

              {/* OPTION 2: Email with OTP */}
              {signInMethod === 'otp' && (
                <div className="space-y-4 animate-fade-in">
                  {loginOtpStep === 'request' ? (
                    /* Sub-step 2A: Request 6-digit Code */
                    <form onSubmit={handleSendLoginOtp} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">EMAIL ADDRESS *</label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errorMessage) setErrorMessage('');
                            }}
                            placeholder="e.g. athlete@domain.com"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                          />
                        </div>
                        <p className="text-[10px] text-[var(--text-sub)] pt-1">
                          We'll send a 6-digit one-time code to sign into your account instantly.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>{isSubmitting ? 'SENDING CODE...' : 'SEND 6-DIGIT OTP'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Sub-step 2B: Verify 6-digit Code */
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-4 animate-fade-in">
                      <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[var(--text-sub)]">Code sent to:</p>
                          <p className="font-extrabold font-mono text-[var(--text-main)]">{formData.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginOtpStep('request');
                            setLoginDevOtpHint('');
                          }}
                          className="text-[10px] font-bold text-[#FF1E27] hover:underline cursor-pointer"
                        >
                          Change Email
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">ENTER 6-DIGIT OTP *</label>
                        <div className="relative flex items-center">
                          <KeyRound className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                          <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            value={loginOtpCode}
                            onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••••"
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-lg tracking-[8px] font-mono font-bold rounded-xl text-[var(--text-main)] text-center outline-none focus:border-[#FF1E27]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[10px] text-[var(--text-sub)]">
                          {loginOtpTimer > 0 ? (
                            <span>Resend in <strong className="font-mono text-[var(--text-main)]">{loginOtpTimer}s</strong></span>
                          ) : (
                            <span>Didn't receive the code?</span>
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={loginOtpTimer > 0 || isSubmitting}
                          onClick={handleSendLoginOtp}
                          className="text-xs font-bold text-[#FF1E27] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting || loginOtpCode.length < 6}
                          className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW B: CREATE ACCOUNT (WITH EMAIL OTP VERIFICATION)     */}
          {/* ======================================================== */}
          {isSignUp && (
            <div className="space-y-4">
              {signUpStep === 'form' ? (
                /* Step 1: Athlete Details Form */
                <form onSubmit={handleSignUpRequestOtp} className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">FULL NAME *</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">PHONE NUMBER</label>
                    <div className="relative flex items-center">
                      <Navigation className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">EMAIL ADDRESS *</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. athlete@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-sub)] pt-0.5">
                      We'll send a 6-digit OTP code to verify this email.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{isSubmitting ? 'SENDING VERIFICATION CODE...' : 'VERIFY EMAIL & CONTINUE'}</span>
                    </button>
                  </div>
                </form>
              ) : signUpStep === 'verify' ? (
                /* Step 2: Email OTP Verification */
                <form onSubmit={handleSignUpComplete} className="space-y-4 animate-fade-in">
                  <div className="text-center pb-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#FF1E27] text-[10px] font-black uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Step 2 of 2: Email Verification</span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase font-heading">
                      Verify Your Email Address
                    </h3>
                    <p className="text-xs text-[var(--text-sub)] mt-1">
                      Enter the 6-digit verification code sent to your email to complete registration.
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-sub)]">Athlete Email:</p>
                      <p className="font-extrabold font-mono text-[var(--text-main)]">{formData.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSignUpStep('form');
                        setSignUpDevOtpHint('');
                        setErrorMessage('');
                      }}
                      className="text-[10px] font-bold text-[#FF1E27] hover:underline cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">ENTER 6-DIGIT OTP *</label>
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={signUpOtp}
                        onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-lg tracking-[8px] font-mono font-bold rounded-xl text-[var(--text-main)] text-center outline-none focus:border-[#FF1E27]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-[var(--text-sub)]">
                      {signUpTimer > 0 ? (
                        <span>Resend in <strong className="font-mono text-[var(--text-main)]">{signUpTimer}s</strong></span>
                      ) : (
                        <span>Didn't receive the code?</span>
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={signUpTimer > 0 || isSubmitting}
                      onClick={handleSignUpRequestOtp}
                      className="text-xs font-bold text-[#FF1E27] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || signUpOtp.length < 6}
                      className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CONFIRM & CREATE ACCOUNT'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 3: Optional Password Creation */
                <form onSubmit={handleSavePassword} className="space-y-4 animate-fade-in">
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">CREATE PASSWORD *</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-sub)] uppercase">CONFIRM PASSWORD *</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[var(--text-sub)]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder="Re-enter your password"
                        className="w-full pl-10 pr-10 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--text-main)] outline-none focus:border-[#FF1E27]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons: Save Password + Skip */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPassword || newPassword.length < 6}
                      className="w-full btn-glow-red py-4 rounded-xl text-xs font-extrabold font-heading text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isSubmitting ? 'SAVING PASSWORD...' : 'SAVE PASSWORD & CONTINUE'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipPassword}
                      className="w-full py-3 rounded-xl text-xs font-bold font-heading text-[var(--text-sub)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Skip for Now</span>
                      <span className="text-[10px]">→</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
