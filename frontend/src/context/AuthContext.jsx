import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUserApi,
  registerUserApi,
  logoutUserApi,
  fetchUserProfileApi,
  updateUserProfileApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  sendOtpApi,
  verifyOtpApi,
  setPasswordApi
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  // 1. Initial Session Hydration on page load (supports both JWT & HttpOnly cookies)
  useEffect(() => {
    let isMounted = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('avn-token') : null;

    fetchUserProfileApi()
      .then((res) => {
        if (!isMounted) return;
        const profileUser = res?.data?.user || res?.user;
        if (profileUser) {
          setUser(profileUser);
          localStorage.setItem('avn-user', JSON.stringify(profileUser));
        }
      })
      .catch((err) => {
        if (token) {
          console.warn('Session verification notice:', err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Login with MongoDB backend
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUserApi(email, password);
      const userObj = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (userObj) {
        if (token) {
          localStorage.setItem('avn-token', token);
        }
        setUser(userObj);
        localStorage.setItem('avn-user', JSON.stringify(userObj));
        return { success: true, user: userObj, token };
      } else {
        throw new Error(res?.message || 'Invalid email or password');
      }
    } catch (err) {
      // Re-throw with user-friendly backend message preserving status code
      const error = new Error(err.message || 'Login failed. Please check your credentials.');
      error.status = err.status || err.data?.statusCode;
      error.data = err.data;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. Register with MongoDB backend
  const register = async (userData) => {
    setLoading(true);
    try {
      const payload = {
        name: userData.name,
        email: (userData.email || '').trim().toLowerCase(),
        password: userData.password || undefined,
        phone: userData.phone || undefined,
        otp: userData.otp,
      };

      const res = await registerUserApi(payload);
      const userObj = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (userObj) {
        if (token) {
          localStorage.setItem('avn-token', token);
        }
        setUser(userObj);
        localStorage.setItem('avn-user', JSON.stringify(userObj));
        return { success: true, user: userObj, token };
      } else {
        throw new Error(res?.message || 'Registration failed');
      }
    } catch (err) {
      const error = new Error(err.message || 'Registration failed. Please try again.');
      error.status = err.status || err.data?.statusCode;
      error.data = err.data;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3.1 Send Email OTP Code
  const sendEmailOtp = async (email, purpose = 'login') => {
    setLoading(true);
    try {
      const res = await sendOtpApi(email, purpose);
      const payload = res?.data || res;
      const devOtp = payload?.devOtp || res?.data?.devOtp || res?.devOtp;
      if (devOtp) {
        payload.devOtp = devOtp;
        console.log([
          '=========================================',
          '⚡ [AVN ATHLETICS OTP VERIFICATION]',
          `📩 Recipient: ${email}`,
          `🔑 Verification Code: ${devOtp}`,
          '⏰ Valid for: 5 minutes',
          '=========================================',
        ].join('\n'));
      }
      return payload;
    } catch (err) {
      const error = new Error(err.message || 'Failed to send OTP. Please check your email address.');
      error.status = err.status || err.data?.statusCode;
      error.data = err.data;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3.2 Verify Email OTP & Sign In / Register
  const verifyEmailOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await verifyOtpApi(email, otp);
      const userObj = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (userObj) {
        if (token) {
          localStorage.setItem('avn-token', token);
        }
        setUser(userObj);
        localStorage.setItem('avn-user', JSON.stringify(userObj));
        return { success: true, user: userObj, token };
      } else {
        throw new Error(res?.message || 'Verification failed');
      }
    } catch (err) {
      const error = new Error(err.message || 'Invalid or expired verification code.');
      error.status = err.status || err.data?.statusCode;
      error.data = err.data;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3.3 Set Password (for post-registration or profile update)
  const setPassword = async (password) => {
    setLoading(true);
    try {
      const res = await setPasswordApi(password);
      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('avn-user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (err) {
      const error = new Error(err.message || 'Failed to set password.');
      error.status = err.status || err.data?.statusCode;
      error.data = err.data;
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout
  const logout = async () => {
    try {
      await logoutUserApi();
    } catch {
      // Proceed even if network fails
    } finally {
      setUser(null);
      localStorage.removeItem('avn-user');
      localStorage.removeItem('avn-token');
      setRedirectPath(null);
    }
  };

  // 4.1 Automatic session expiration listener (401 Interceptor)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('avn:auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('avn:auth:unauthorized', handleUnauthorized);
  }, []);

  // 5. Update Profile (Name, Phone)
  const updateProfile = async (updatedFields) => {
    setLoading(true);
    try {
      const payload = {};
      if (updatedFields.name) payload.name = updatedFields.name;
      if (updatedFields.phone !== undefined) payload.phone = updatedFields.phone;

      const res = await updateUserProfileApi(payload);
      const updatedUser = res?.data?.user || res?.user;

      if (updatedUser) {
        const mergedUser = { ...user, ...updatedUser };
        setUser(mergedUser);
        localStorage.setItem('avn-user', JSON.stringify(mergedUser));
        return { success: true, user: mergedUser };
      } else {
        throw new Error(res?.message || 'Failed to update profile');
      }
    } catch (err) {
      throw new Error(err.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Address Management Helpers
  const addAddress = async (addressData) => {
    try {
      const res = await addAddressApi(addressData);
      const updatedAddresses = res?.data?.addresses || [];
      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('avn-user', JSON.stringify(updatedUser));
      return { success: true, addresses: updatedAddresses };
    } catch (err) {
      throw new Error(err.message || 'Failed to add address');
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const res = await updateAddressApi(addressId, addressData);
      const updatedAddresses = res?.data?.addresses || [];
      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('avn-user', JSON.stringify(updatedUser));
      return { success: true, addresses: updatedAddresses };
    } catch (err) {
      throw new Error(err.message || 'Failed to update address');
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await deleteAddressApi(addressId);
      const updatedAddresses = res?.data?.addresses || [];
      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('avn-user', JSON.stringify(updatedUser));
      return { success: true, addresses: updatedAddresses };
    } catch (err) {
      throw new Error(err.message || 'Failed to delete address');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isInitializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      sendEmailOtp,
      verifyEmailOtp,
      setPassword,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      redirectPath,
      setRedirectPath,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
