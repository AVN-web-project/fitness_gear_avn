import React, { createContext, useContext, useState } from 'react';
import { loginUserApi, registerUserApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUserApi(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('avn-user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      if (err.status) {
        throw err;
      }
      console.warn('Backend Auth API unreachable, using simulated fallback for user role...');
      
      // Fallback for standalone frontend or local offline execution
      let loggedUser;
      if (email === 'admin@avngear.com') {
        loggedUser = {
          id: 'usr-admin-101',
          name: 'Vikram Malhotra',
          email: 'admin@avngear.com',
          phone: '+91 98765 43210',
          role: 'admin',
          tier: 'AVN ADMIN',
          memberSince: '2023'
        };
      } else {
        loggedUser = {
          id: 'usr-cust-202',
          name: 'Karan Sharma',
          email: email || 'customer@avngear.com',
          phone: '+91 91234 56789',
          role: 'customer',
          tier: 'AVN ELITE CUSTOMER',
          memberSince: '2024'
        };
      }
      
      setUser(loggedUser);
      localStorage.setItem('avn-user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerUserApi(userData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('avn-user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      if (err.status) {
        throw err;
      }
      console.warn('Backend Auth API unreachable, using simulated fallback for registration...');
      
      const newUser = {
        id: 'usr-' + Date.now(),
        name: userData.name || 'New AVN Athlete',
        email: userData.email,
        phone: userData.phone || '+91 98765 43210',
        role: 'customer',
        tier: 'AVN MEMBER',
        memberSince: new Date().getFullYear().toString()
      };
      
      setUser(newUser);
      localStorage.setItem('avn-user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('avn-user');
    setRedirectPath(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: Boolean(user), 
      login, 
      register, 
      logout,
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
