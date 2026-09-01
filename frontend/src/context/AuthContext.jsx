import React, { createContext, useContext, useState } from 'react';
import { loginUserApi, registerUserApi, updateUserProfileApi } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  {
    id: 'usr-cust-202',
    name: 'Karan Sharma',
    email: 'customer@avngear.com',
    password: 'password123',
    phone: '+91 91234 56789',
    role: 'customer',
    tier: 'AVN ATHLETE MEMBER',
    memberSince: '2024'
  }
];

const getStoredUsers = () => {
  try {
    const saved = localStorage.getItem('avn-registered-users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  } catch (e) {
    return DEFAULT_USERS;
  }
};

const saveStoredUsers = (usersList) => {
  try {
    localStorage.setItem('avn-registered-users', JSON.stringify(usersList));
  } catch (e) {}
};

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
        throw new Error(res.message || 'Invalid email or password');
      }
    } catch (err) {
      if (err.status) {
        // Backend returned a specific HTTP error response (e.g. 401 Invalid Credentials)
        throw err;
      }
      
      console.warn('Backend Auth API unreachable, validating against local account registry...');
      
      // Strict offline verification
      const allUsers = getStoredUsers();
      const matchedUser = allUsers.find(
        u => u.email.toLowerCase().trim() === (email || '').toLowerCase().trim()
      );

      if (!matchedUser || matchedUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Return sanitized user object without password
      const loggedUser = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone,
        role: matchedUser.role,
        tier: matchedUser.tier,
        memberSince: matchedUser.memberSince
      };
      
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
      console.warn('Backend Auth API unreachable, storing registration locally...');
      
      const allUsers = getStoredUsers();
      if (allUsers.some(u => u.email.toLowerCase() === (userData.email || '').toLowerCase())) {
        throw new Error('An account with this email already exists.');
      }

      const newUserObj = {
        id: 'usr-' + Date.now(),
        name: userData.name || 'New AVN Athlete',
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '+91 98765 43210',
        role: 'customer',
        tier: 'AVN MEMBER',
        memberSince: new Date().getFullYear().toString()
      };
      
      const updatedUsers = [...allUsers, newUserObj];
      saveStoredUsers(updatedUsers);

      const loggedUser = {
        id: newUserObj.id,
        name: newUserObj.name,
        email: newUserObj.email,
        phone: newUserObj.phone,
        role: newUserObj.role,
        tier: newUserObj.tier,
        memberSince: newUserObj.memberSince
      };

      setUser(loggedUser);
      localStorage.setItem('avn-user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('avn-user');
    setRedirectPath(null);
  };

  
  const updateProfile = async (updatedFields, verificationData = {}) => {
    setLoading(true);
    try {
      const payload = {
        id: user?.id,
        oldEmail: user?.email,
        name: updatedFields.name,
        email: updatedFields.email,
        phone: updatedFields.phone,
        currentPassword: verificationData.currentPassword,
        verificationCode: verificationData.verificationCode
      };

      const res = await updateUserProfileApi(payload);
      if (res && res.success && res.user) {
        const newUser = { ...user, ...res.user };
        setUser(newUser);
        localStorage.setItem('avn-user', JSON.stringify(newUser));

        const allUsers = getStoredUsers();
        const updatedUsers = allUsers.map(u => {
          if (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) {
            return { ...u, fullName: newUser.name, name: newUser.name, email: newUser.email, phone: newUser.phone };
          }
          return u;
        });
        saveStoredUsers(updatedUsers);

        return { success: true, user: newUser };
      }
    } catch (err) {
      if (err.status || err.requiresEmailVerification) {
        throw err;
      }
    }

    // Offline fallback for profile update
    const allUsers = getStoredUsers();
    const currentAccount = allUsers.find(
      u => u.id === user?.id || u.email.toLowerCase() === (user?.email || '').toLowerCase()
    );

    const isEmailChanging = updatedFields.email && updatedFields.email.toLowerCase() !== (user?.email || '').toLowerCase();

    if (isEmailChanging) {
      const verifyPassword = verificationData.currentPassword;
      const verifyCode = verificationData.verificationCode;

      if (!verifyPassword && verifyCode !== '849201') {
        const error = new Error('Current email verification required to change email address');
        error.requiresEmailVerification = true;
        throw error;
      }

      if (verifyPassword && currentAccount && currentAccount.password && currentAccount.password !== verifyPassword) {
        throw new Error('Incorrect password for current email verification');
      }

      const isTaken = allUsers.some(u => u.id !== user?.id && u.email.toLowerCase() === updatedFields.email.toLowerCase());
      if (isTaken) {
        throw new Error('An account with this email address already exists.');
      }
    }

    const updatedUserObj = {
      ...user,
      name: updatedFields.name || user.name,
      email: updatedFields.email || user.email,
      phone: updatedFields.phone || user.phone
    };

    const updatedUsers = allUsers.map(u => {
      if (u.id === user?.id || u.email.toLowerCase() === (user?.email || '').toLowerCase()) {
        return {
          ...u,
          name: updatedUserObj.name,
          fullName: updatedUserObj.name,
          email: updatedUserObj.email,
          phone: updatedUserObj.phone
        };
      }
      return u;
    });
    saveStoredUsers(updatedUsers);

    setUser(updatedUserObj);
    localStorage.setItem('avn-user', JSON.stringify(updatedUserObj));
    return { success: true, user: updatedUserObj };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: Boolean(user), 
      login, 
      register, 
      logout,
      updateProfile,
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
