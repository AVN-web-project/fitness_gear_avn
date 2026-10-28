import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import CartPage from './pages/CartPage';
import ProductModal from './components/ProductModal';
import SearchModal from './components/SearchModal';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import AddAddressPage from './pages/AddAddressPage';
import AddressListPage from './pages/AddressListPage';
import UserProfilePage from './pages/UserProfilePage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import SupportPage from './pages/SupportPage';
import ContactPage from './pages/ContactPage';
import WhyAvnPage from './pages/WhyAvnPage';
import AboutUsPage from './pages/AboutUsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PRODUCTS as LOCAL_PRODUCTS } from './data/products';
import { CartProvider, useCart } from './context/CartContext';
import { fetchProducts, fetchCategoriesApi } from './services/api';

const ROUTE_FOR_VIEW = {
  home: '/',
  search: '/search',
  pdp: '/products',
  auth: '/login',
  profile: '/account',
  addresses: '/account/addresses',
  'add-address': '/account/addresses/new',
  'order-history': '/orders',
  'order-details': '/orders',
  contact: '/contact',
  support: '/support',
  'about-us': '/about',
  'why-avn': '/why-avn',
  cart: '/cart',
  checkout: '/checkout'
};

const SEARCH_PARAMS = [
  'q', 'category', 'ageGroup', 'gender', 'minPrice', 'maxPrice',
  'discount', 'sort', 'page', 'viewMode'
];

const decodePathParam = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

function getRoute(location) {
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(location.search);
  const legacyView = params.get('view');

  if (pathname === '/') {
    if (params.has('resetToken') || params.has('token')) return { view: 'auth' };
    if (legacyView) {
      if (ROUTE_FOR_VIEW[legacyView]) {
        if (legacyView === 'pdp') return { view: 'pdp', productId: params.get('product') };
        if (legacyView === 'order-details') return { view: 'order-details', orderId: params.get('order') };
        return { view: legacyView };
      }
    }
    if ([...params.keys()].some((key) => SEARCH_PARAMS.includes(key))) return { view: 'search' };
    return legacyView ? { view: 'not-found' } : { view: 'home' };
  }
  if (pathname === '/search') return { view: 'search' };
  if (pathname === '/login' || pathname === '/reset-password') return { view: 'auth' };
  if (pathname === '/account') return { view: 'profile' };
  if (pathname === '/account/addresses') return { view: 'addresses' };
  if (pathname === '/account/addresses/new') return { view: 'add-address' };
  if (pathname === '/orders') return { view: 'order-history' };
  const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) return { view: 'order-details', orderId: decodePathParam(orderMatch[1]) };
  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch) return { view: 'pdp', productId: decodePathParam(productMatch[1]) };

  const staticRoutes = {
    '/contact': 'contact',
    '/support': 'support',
    '/about': 'about-us',
    '/why-avn': 'why-avn',
    '/cart': 'cart',
    '/checkout': 'checkout'
  };
  return staticRoutes[pathname] ? { view: staticRoutes[pathname] } : { view: 'not-found' };
}

function readSavedOrder(orderId) {
  if (!orderId) return null;
  try {
    const savedOrders = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
    if (!Array.isArray(savedOrders)) return null;
    return savedOrders.find((item) => String(item.orderId || item.id) === orderId) || null;
  } catch (error) {
    console.warn('Could not restore the selected order from local storage:', error);
    return null;
  }
}

function AppContent() {
  const { user, isAuthenticated, isInitializing, logout, setRedirectPath, redirectPath, addAddress, updateAddress, deleteAddress } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const route = getRoute(location);
  const activeView = route.view;
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('avn-theme') || 'dark';
  });

  const cart = useCart();

  // Saved Addresses (Single Source of Truth: MongoDB Authenticated vs Guest Fallback)
  const [localAddresses, setLocalAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-saved-addresses');
      return saved ? JSON.parse(saved) : [
        {
          id: 'addr-demo-1',
          fullName: 'Vikram Malhotra',
          phone: '+91 98765 43210',
          houseNo: 'House No. 42-B',
          flatNo: 'Flat 402, 4th Floor',
          area: 'Sector 29, Golf Course Road',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122002',
          type: 'HOME',
          landmark: 'Near DLF Cyber Hub',
          isDefault: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const userAddresses = user?.addresses;
  // Single Source of Truth: derive directly from MongoDB authenticated user or local storage
  const savedAddresses = useMemo(() => {
    if (isAuthenticated && userAddresses && userAddresses.length > 0) {
      return userAddresses.map((addr) => ({
        id: addr._id || addr.id,
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        houseNo: addr.houseNo || '',
        flatNo: addr.flatNo || addr.street || '',
        area: addr.area || addr.street || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
        type: addr.title ? addr.title.toUpperCase() : 'HOME',
        isDefault: Boolean(addr.isDefault)
      }));
    }
    return localAddresses;
  }, [isAuthenticated, userAddresses, localAddresses]);

  const userAddress = useMemo(() => {
    if (savedAddresses.length > 0) {
      if (selectedAddressId) {
        const found = savedAddresses.find(a => a.id === selectedAddressId);
        if (found) return found;
      }
      return savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    }
    return null;
  }, [savedAddresses, selectedAddressId]);

  // Address Handlers
  const handleSetDefaultAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setLocalAddresses((prev) => {
      const updated = prev.map((a) => ({ ...a, isDefault: a.id === addressId }));
      try {
        localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isAuthenticated) {
      const isBackendAddr = user?.addresses?.some((a) => String(a._id || a.id) === String(addressId));
      if (isBackendAddr) {
        updateAddress(addressId, { isDefault: true }).catch((err) => console.warn('Sync default address failed:', err));
      }
    }
  };

  const handleDeleteAddress = (addressId) => {
    setLocalAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addressId);
      try {
        localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isAuthenticated) {
      const isBackendAddr = user?.addresses?.some((a) => String(a._id || a.id) === String(addressId));
      if (isBackendAddr) {
        deleteAddress(addressId).catch((err) => console.warn('Sync delete address failed:', err));
      }
    }
  };

  const handleSaveAddress = async (addressData) => {
    let savedId = addressData.id;

    if (isAuthenticated) {
      const combinedStreet = addressData.street
        ? (addressData.flatNo ? `${addressData.flatNo}, ` : '') + (addressData.houseNo ? `${addressData.houseNo}, ` : '') + addressData.street
        : `${addressData.flatNo || ''} ${addressData.houseNo || ''} ${addressData.area || ''}`.trim();

      const payload = {
        title: addressData.type || addressData.title || 'Home',
        fullName: addressData.fullName || user?.name || 'Customer',
        phone: addressData.phone || user?.phone || '9876543210',
        street: combinedStreet || 'Default Street',
        city: addressData.city || 'City',
        state: addressData.state || 'State',
        pincode: addressData.pincode || '110001',
        country: addressData.country || 'India',
        isDefault: Boolean(addressData.isDefault)
      };

      try {
        if (addressData.id && !addressData.id.toString().startsWith('addr-demo')) {
          await updateAddress(addressData.id, payload);
        } else {
          const res = await addAddress(payload);
          if (res?.addresses?.length > 0) {
            const newest = res.addresses[res.addresses.length - 1];
            savedId = newest._id || newest.id;
          }
        }
      } catch (err) {
        console.warn('Sync address failed:', err);
      }
    } else {
      const localId = addressData.id || 'addr-' + Date.now();
      savedId = localId;
      setLocalAddresses((prev) => {
        let updated;
        if (addressData.id) {
          updated = prev.map((a) => (a.id === addressData.id ? { ...addressData, id: localId } : a));
        } else {
          const newObj = { ...addressData, id: localId, isDefault: prev.length === 0 };
          updated = [...prev, newObj];
        }
        try {
          localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    if (savedId) {
      setSelectedAddressId(savedId);
    }
    setEditingAddress(null);

    const nextView = addressReturnView === 'checkout'
      ? (addressSourceView === 'addresses' && addressData.id ? 'addresses' : 'checkout')
      : (addressSourceView || addressReturnView || 'addresses');

    setAddressReturnView(nextView);
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    logout();
    setActiveView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddProduct = (newProd) => {
    setProducts(prev => [...prev, newProd]);
  };

  // Dynamic Window Dimension & Aspect Ratio Listener
  const [windowDimensions, setWindowDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Condition: When dimension of width in desktop view becomes larger than length (width > height)
  // OR when screen width is mobile (width <= 768)
  const isMobileView = windowDimensions.width <= 768;

  useEffect(() => {
    const root = document.documentElement;
    if (isMobileView) {
      root.classList.add('force-mobile-mode');
    } else {
      root.classList.remove('force-mobile-mode');
    }
  }, [isMobileView]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('avn-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Synchronize with live MongoDB Product Catalog & Categories
  useEffect(() => {
    let isMounted = true;
    const loadLiveCatalog = async () => {
      try {
        const [liveCatalog, liveCategories] = await Promise.all([
          fetchProducts(),
          fetchCategoriesApi(),
        ]);
        if (isMounted) {
          if (Array.isArray(liveCatalog) && liveCatalog.length > 0) {
            setProducts(liveCatalog);
            setIsBackendConnected(true);
          }
          if (Array.isArray(liveCategories) && liveCategories.length > 0) {
            setCategories(liveCategories);
          }
        }
      } catch (err) {
        console.warn('Backend catalog fetch failed, using offline fallback catalog:', err);
      }
    };
    loadLiveCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const [currentPdpProduct, setCurrentPdpProduct] = useState(null);
  const [checkoutData, setCheckoutData] = useState(() => {
    if (route.view !== 'checkout') return null;
    const items = cart.cartItems || [];
    if (items.length === 0) return null;
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    return { items, subtotal, discountAmount: 0, shippingFee: 0, totalAmount: subtotal };
  });
  const [selectedOrder, setSelectedOrder] = useState(() => readSavedOrder(route.orderId));
  const [orderJustPlaced, setOrderJustPlaced] = useState(false);
  const [addressReturnView, setAddressReturnView] = useState('profile');
  const [addressSourceView, setAddressSourceView] = useState('addresses');
  const [editingAddress, setEditingAddress] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const activePdpProduct = activeView === 'pdp' && route.productId
    ? products.find((item) =>
      item.slug === route.productId || item.id === route.productId || item._id === route.productId
    )
    : currentPdpProduct;
  const activeOrder = useMemo(() => {
    if (!route.orderId) return selectedOrder;
    const matchesRoute = (order) =>
      order && String(order.orderId || order.id) === route.orderId;
    if (matchesRoute(selectedOrder)) return selectedOrder;
    if (matchesRoute(location.state?.order)) return location.state.order;
    return readSavedOrder(route.orderId);
  }, [location.state, route.orderId, selectedOrder]);

  const setActiveView = (view, { productSlug, orderId, replace = false, state } = {}) => {
    let path = ROUTE_FOR_VIEW[view];
    if (!path) return;

    if (view === 'pdp') {
      const slug = productSlug || currentPdpProduct?.slug || currentPdpProduct?.id || currentPdpProduct?._id;
      if (!slug) return;
      path = `${path}/${encodeURIComponent(slug)}`;
    } else if (view === 'order-details') {
      const id = orderId || selectedOrder?.orderId || selectedOrder?.id;
      if (!id) return;
      path = `${path}/${encodeURIComponent(id)}`;
    } else if (view === 'search') {
      const params = new URLSearchParams();
      const currentParams = new URLSearchParams(location.search);
      SEARCH_PARAMS.forEach((key) => {
        if (currentParams.has(key)) params.set(key, currentParams.get(key));
      });
      const query = params.toString();
      if (query) path += `?${query}`;
    }

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (path !== currentPath) {
      navigate(path, { replace, state });
    }
  };

  useEffect(() => {
    const protectedViews = new Set([
      'profile', 'addresses', 'add-address', 'order-history', 'order-details', 'checkout'
    ]);
    if (isInitializing || user || !protectedViews.has(activeView)) return;

    if (activeView === 'checkout') setRedirectPath('checkout');
    navigate('/login', {
      replace: true,
      state: { from: `${location.pathname}${location.search}${location.hash}` }
    });
  }, [activeView, isInitializing, location.hash, location.pathname, location.search, navigate, setRedirectPath, user]);

  useEffect(() => {
    if (
      activeView === 'checkout' &&
      user &&
      !isInitializing &&
      !orderJustPlaced &&
      !checkoutData?.items?.length &&
      cart.cartItems.length === 0
    ) {
      navigate('/cart', { replace: true });
    }
  }, [activeView, cart.cartItems.length, checkoutData, isInitializing, navigate, orderJustPlaced, user]);

  useEffect(() => {
    if (activeView !== 'checkout') setOrderJustPlaced(false);
  }, [activeView]);

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, '') || '/';
    if (pathname !== '/') return;

    const params = new URLSearchParams(location.search);
    if (params.has('resetToken') || params.has('token')) return;
    const legacyView = params.get('view');
    const protectedLegacyViews = new Set([
      'profile', 'addresses', 'add-address', 'order-history', 'order-details', 'checkout'
    ]);
    if (protectedLegacyViews.has(legacyView) && (!user || isInitializing)) return;
    if (legacyView && ROUTE_FOR_VIEW[legacyView]) {
      const legacyRoute = getRoute(location);
      let path = ROUTE_FOR_VIEW[legacyRoute.view];
      if (legacyRoute.view === 'pdp' && legacyRoute.productId) {
        path += `/${encodeURIComponent(legacyRoute.productId)}`;
      } else if (legacyRoute.view === 'order-details' && legacyRoute.orderId) {
        path += `/${encodeURIComponent(legacyRoute.orderId)}`;
      }
      if (legacyRoute.view === 'search') {
        const search = new URLSearchParams();
        SEARCH_PARAMS.forEach((key) => {
          if (params.has(key)) search.set(key, params.get(key));
        });
        if (search.size) path += `?${search.toString()}`;
      }
      if (path) navigate(path, { replace: true });
      return;
    }

    if ([...params.keys()].some((key) => SEARCH_PARAMS.includes(key))) {
      const search = new URLSearchParams();
      SEARCH_PARAMS.forEach((key) => {
        if (params.has(key)) search.set(key, params.get(key));
      });
      navigate(`/search?${search.toString()}`, { replace: true });
    }
  }, [activeView, isInitializing, location, navigate, user]);

  const handleSelectProductForPdp = (product) => {
    setCurrentPdpProduct(product);
    setActiveView('pdp', { productSlug: product.slug || product.id || product._id });
    setQuickViewProduct(null);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAuth = (redirectTarget = null) => {
    if (redirectTarget) {
      setRedirectPath(redirectTarget);
    }
    setActiveView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setActiveView('home');
    setCurrentPdpProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWhyAvn = () => {
    setActiveView('why-avn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAbout = () => {
    setActiveView('about-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSearch = (param = '') => {
    setIsSearchOpen(false);
    const paramTrimmed = typeof param === 'string' ? param.trim() : '';
    const normParam = paramTrimmed.toLowerCase().replace(/-/g, ' ');

    // Match against dynamic categories from MongoDB or standard fallbacks
    const matchedCategory = categories.find((c) => {
      const cNameNorm = (c.name || '').toLowerCase().replace(/-/g, ' ');
      const cSlugNorm = (c.slug || '').toLowerCase().replace(/-/g, ' ');
      return cNameNorm === normParam || cSlugNorm === normParam;
    });

    const fallbackCatMatch = [
      'KNEE SUPPORT', 'WRIST SUPPORT', 'LIFTING ACCESSORIES', 'YOGA ACCESSORIES'
    ].find((c) => c.toLowerCase().replace(/-/g, ' ') === normParam);

    const targetCategory = matchedCategory?.name?.toUpperCase() || fallbackCatMatch;

    const params = new URLSearchParams(location.search);
    if (targetCategory) {
      params.set('category', targetCategory);
      params.delete('q');
    } else if (paramTrimmed) {
      params.set('q', paramTrimmed);
      params.delete('category');
    } else {
      params.delete('q');
      params.delete('category');
    }
    ['view', 'product', 'order', 'resetToken', 'token'].forEach((key) => params.delete(key));
    navigate(`/search${params.size ? `?${params.toString()}` : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCart = () => {
    setActiveView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateContact = () => {
    setActiveView('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const handleProceedToCheckout = (data) => {
      setOrderJustPlaced(false);
    const payload = typeof data === 'object' && data.items ? data : {
      items: cart.cartItems,
      subtotal: cart.cartItems.reduce((a, b) => a + b.price * b.quantity, 0),
      discountAmount: 0,
      shippingFee: 0,
      totalAmount: cart.cartItems.reduce((a, b) => a + b.price * b.quantity, 0)
    };
    
    // Store checkout payload
    setCheckoutData(payload);
    
    // Guest Checkout Check
    if (!user) {
      if (setRedirectPath) setRedirectPath('checkout');
      setActiveView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!userAddress) {
      setAddressSourceView('checkout');
      setAddressReturnView('checkout');
      setEditingAddress(null);
      setActiveView('add-address');
    } else {
      setActiveView('checkout');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainContainerClasses = isMobileView
    ? 'min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[#FF1E27] selection:text-white transition-colors duration-300 pb-20'
    : 'min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[#FF1E27] selection:text-white transition-colors duration-300 pb-16 md:pb-0';

  const toastContainerClasses = isMobileView
    ? 'fixed bottom-20 right-4 left-4 z-50 bg-[var(--bg-card-solid)] border border-[#FF1E27]/50 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs font-heading flex items-center justify-between gap-2'
    : 'fixed bottom-6 right-6 z-50 bg-[var(--bg-card-solid)] border border-[#FF1E27]/50 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs font-heading flex items-center justify-between gap-2';

  return (
    <div className={mainContainerClasses}>
      <Navbar
        categories={categories}
        cartCount={cart.totalCartCount}
        onOpenCart={handleNavigateCart}
        onNavigateCart={handleNavigateCart}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateSearch={handleNavigateSearch}
        onNavigateWhyAvn={handleNavigateWhyAvn}
        onNavigateAbout={handleNavigateAbout}
        onOpenAccount={() => {
          if (!user) {
            setActiveView('auth');
          } else {
            setActiveView('profile');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAddresses={() => {
          setAddressReturnView('profile');
          setActiveView('addresses');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateOrders={() => {
          if (!user) {
            setActiveView('auth');
          } else {
            setActiveView('order-history');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateHome={handleNavigateHome}
        onNavigateContact={handleNavigateContact}
        activeView={activeView}
        isMobileView={isMobileView}
      />

      

      <main className="flex-1 space-y-1 lg:space-y-4">
        {activeView === 'checkout' ? (
          <CheckoutPage
            checkoutData={checkoutData}
            userAddress={userAddress}
            onChangeAddress={() => {
              setAddressReturnView('checkout');
              setActiveView('addresses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPlaceOrder={(order) => {
              cart.clearCart();
              setCheckoutData(null);
              setAddressReturnView('profile');
              setOrderJustPlaced(true);
            }}
            onViewOrderDetails={(order) => {
              setSelectedOrder(order);
              setActiveView('order-details', {
                orderId: order.orderId || order.id,
                state: { order }
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateCart={handleNavigateCart}
            onNavigateHome={handleNavigateHome}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'auth' ? (
          <AuthPage
            onLoginSuccess={(userData) => {
              if (redirectPath === 'checkout') {
                if (setRedirectPath) setRedirectPath(null);
                if (!userAddress) {
                  setAddressSourceView('checkout');
                  setAddressReturnView('checkout');
                  setEditingAddress(null);
                  setActiveView('add-address');
                } else {
                  setActiveView('checkout');
                }
              } else if (redirectPath === 'review') {
                if (setRedirectPath) setRedirectPath(null);
                setActiveView('pdp', {
                  productSlug: currentPdpProduct?.slug || currentPdpProduct?.id || currentPdpProduct?._id
                });
              } else if (
                typeof location.state?.from === 'string' &&
                location.state.from.startsWith('/') &&
                !location.state.from.startsWith('//')
              ) {
                if (setRedirectPath) setRedirectPath(null);
                navigate(location.state.from, { replace: true });
              } else {
                setActiveView('profile');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={handleNavigateHome}
            theme={theme}
          />
        ) : activeView === 'profile' ? (
          <UserProfilePage
            currentUser={user}
            savedAddresses={savedAddresses}
            onSetDefaultAddress={handleSetDefaultAddress}
            onDeleteAddress={handleDeleteAddress}
            onEditAddress={(addr) => {
              setEditingAddress(addr);
              setAddressSourceView('profile');
              setAddressReturnView('profile');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddNewAddress={() => {
              setEditingAddress(null);
              setAddressSourceView('profile');
              setAddressReturnView('profile');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateOrders={() => {
              if (!user) {
                setActiveView('auth');
              } else {
                setActiveView('order-history');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateAuth={handleNavigateAuth}
            onOpenAddressManager={() => {
              setAddressReturnView('profile');
              setActiveView('addresses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={handleNavigateHome}
            onSignOut={handleSignOut}
            theme={theme}
          />
        ) : activeView === 'addresses' ? (
          <AddressListPage
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId || userAddress?.id}
            isCheckoutMode={addressReturnView === 'checkout'}
            onBack={() => {
              const nextView = addressReturnView === 'checkout' ? 'checkout' : 'profile';
              setActiveView(nextView);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectAddressForCheckout={(addrId) => {
              handleSetDefaultAddress(addrId);
              setActiveView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddNewAddress={() => {
              setEditingAddress(null);
              setAddressSourceView('addresses');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onEditAddress={(addr) => {
              setEditingAddress(addr);
              setAddressSourceView('addresses');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            theme={theme}
          />
        ) : activeView === 'order-details' ? (
          <OrderDetailsPage
            order={activeOrder}
            onBack={() => setActiveView('order-history')}
            onOrderUpdated={(updatedOrder) => {
              const normalizedOrder = {
                ...updatedOrder,
                orderId: updatedOrder.orderId || updatedOrder.id,
                id: updatedOrder.id || updatedOrder.orderId
              };

              setSelectedOrder(normalizedOrder);
              const savedOrders = JSON.parse(localStorage.getItem('avn-user-orders') || '[]');
              const updatedSavedOrders = savedOrders.map((order) => {
                const orderKey = order.orderId || order.id;
                const updatedKey = normalizedOrder.orderId || normalizedOrder.id;
                if (
                  orderKey === updatedKey ||
                  order.transactionId === normalizedOrder.transactionId ||
                  order.id === normalizedOrder.id ||
                  order.orderId === normalizedOrder.orderId
                ) {
                  return { ...order, ...normalizedOrder, orderId: orderKey || normalizedOrder.orderId, id: order.id || normalizedOrder.id };
                }
                return order;
              });
              localStorage.setItem('avn-user-orders', JSON.stringify(updatedSavedOrders));
            }}
            theme={theme}
          />
        ) : activeView === 'order-history' ? (
          <OrderHistoryPage
            onBack={() => setActiveView('profile')}
            onNavigateSearch={handleNavigateSearch}
            currentUser={user}
            onWriteReviewClick={(productSlug) => {
              const productObj = products.find(p => p.slug === productSlug || p.id === productSlug || p.name.toLowerCase().includes(productSlug.replace(/-/g, ' ')));
              if (productObj) {
                setCurrentPdpProduct(productObj);
                setActiveView('pdp', { productSlug: productObj.slug || productObj.id || productObj._id });
              } else {
                // Try fallback search page or home
                setActiveView('search');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOrderDetails={(order) => {
              setSelectedOrder(order);
              setActiveView('order-details', {
                orderId: order.orderId || order.id,
                state: { order }
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        ) : activeView === 'why-avn' ? (
          <WhyAvnPage
            onBack={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateAbout={() => {
              setActiveView('about-us');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSearch={handleNavigateSearch}
            theme={theme}
          />
        ) : activeView === 'about-us' ? (
          <AboutUsPage
            onBack={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateWhyAvn={() => {
              setActiveView('why-avn');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSearch={handleNavigateSearch}
            onNavigateContact={() => {
              setActiveView('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        ) : activeView === 'contact' ? (
          <ContactPage
            onBack={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSupport={() => {
              setActiveView('support');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        ) : activeView === 'support' ? (
          <SupportPage
            currentUser={user}
            initialOrderId={selectedOrder?.orderId || selectedOrder?.id || ''}
            onNavigateOrders={() => {
              setActiveView('order-history');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        ) : activeView === 'add-address' ? (
          <AddAddressPage
            userAddress={editingAddress}
            onSaveAddress={handleSaveAddress}
            onCancel={() => {
              setEditingAddress(null);
              const target = addressSourceView || (addressReturnView === 'checkout' ? 'checkout' : 'addresses');
              setActiveView(target);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
            isMobileView={isMobileView}
            isCheckoutMode={addressReturnView === 'checkout'}
          />
        ) : activeView === 'cart' ? (
          <CartPage
            cartItems={cart.cartItems}
            onSelectProduct={handleSelectProductForPdp}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
            onUpdateVariant={cart.updateVariant}
            onNavigateHome={handleNavigateHome}
            onNavigateSearch={handleNavigateSearch}
            onProceedToCheckout={handleProceedToCheckout}
            onClearCart={cart.clearCart}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'search' ? (
          <SearchPage
            categories={categories}
            products={products}
            onSelectProduct={handleSelectProductForPdp}
            onAddToCart={cart.addToCart}
            onOpenCart={handleNavigateCart}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'pdp' && activePdpProduct ? (
          <ProductDetailPage
            product={activePdpProduct}
            allProducts={products}
            onBack={handleNavigateHome}
            onAddToCart={cart.addToCart}
            onSelectProduct={handleSelectProductForPdp}
            onOpenCart={handleNavigateCart}
            onNavigateCart={handleNavigateCart}
            cartCount={cart.totalCartCount}
            currentUser={user}
            onNavigateAuth={handleNavigateAuth}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : (
          activeView === 'not-found' || (activeView === 'pdp' && !activePdpProduct) ? (
            <section className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
              <h1 className="text-3xl font-sans font-black uppercase">Page not found</h1>
              <p className="text-sm text-[var(--text-sub)]">The page you requested is unavailable.</p>
              <button
                type="button"
                onClick={handleNavigateHome}
                className="btn-glow-red rounded-xl px-6 py-3 text-sm font-bold uppercase text-white"
              >
                Back to home
              </button>
            </section>
          ) :
          <HomePage
            theme={theme}
            products={products}
            categories={categories}
            onExploreClick={handleNavigateSearch}
            onNavigateWhyAvn={handleNavigateWhyAvn}
            onAddToCart={cart.addToCart}
            onSelectProduct={handleSelectProductForPdp}
            isMobileView={isMobileView}
          />
        )}
      </main>

      <Footer
        theme={theme}
        categories={categories}
        onNavigateSearch={handleNavigateSearch}
        onNavigateHome={handleNavigateHome}
        isMobileView={isMobileView}
        activeView={activeView}
        onNavigateContact={handleNavigateContact}
        onNavigateWhyAvn={handleNavigateWhyAvn}
        onNavigateAbout={handleNavigateAbout}
        onNavigateSupport={() => {
          setActiveView('support');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={cart.addToCart}
        onOpenFullPage={handleSelectProductForPdp}
        isMobileView={isMobileView}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        categories={categories}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProductForPdp}
        onOpenSearchPage={handleNavigateSearch}
        isMobileView={isMobileView}
      />

      {cart.toastMessage && (
        <div className={toastContainerClasses}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF1E27]" />
            <span>{cart.toastMessage}</span>
          </div>
          {(isBackendConnected || cart.isBackendConnected) && (
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded">
              API SYNC
            </span>
          )}
        </div>
      )}
    </div>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AVN App ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6 bg-[#0d0d12] border border-[#FF1E27]/40 p-8 rounded-2xl shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center mx-auto text-xl font-bold font-heading">
              !
            </div>
            <h1 className="text-2xl font-heading font-black italic uppercase text-white">
              Application <span className="text-[#FF1E27]">Recovery</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono bg-black/60 p-3 rounded-xl border border-slate-800 text-left overflow-auto max-h-32">
              {this.state.error?.toString() || 'Render Error'}
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('avn-saved-address');
                } catch (e) {}
                window.location.href = '/';
              }}
              className="w-full py-3.5 bg-[#FF1E27] hover:bg-[#d40008] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              RELOAD AVN APP
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}