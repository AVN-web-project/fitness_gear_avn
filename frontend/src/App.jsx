import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
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
import SupportWidget from './components/SupportWidget';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PRODUCTS as LOCAL_PRODUCTS } from './data/products';
import { fetchProducts, submitOrder } from './services/api';
import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const { user, isAuthenticated, logout, setRedirectPath, redirectPath } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('avn-theme') || 'dark';
  });

  const cart = useCart();



  // Saved Addresses State & Fallbacks
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-saved-addresses');
      return saved ? JSON.parse(saved) : [
        {
          id: 'addr-demo-1',
          fullName: 'Vikram Malhotra',
          phone: '+91 98765 43210',
          houseNo: 'House No. 42-B',
          flatNo: 'Flat 402, 4th Floor',
          street: 'Pinnacle Heights, Cyber City',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122002',
          type: 'HOME',
          landmark: 'Near DLF Cyber Hub',
          isDefault: true
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Address Handlers
  const handleSetDefaultAddress = (addressId) => {
    setSavedAddresses((prev) => {
      const updated = prev.map(a => ({ ...a, isDefault: a.id === addressId }));
      const defaultAddress = updated.find(a => a.id === addressId) || updated[0] || null;
      if (defaultAddress) {
        setUserAddress(defaultAddress);
        localStorage.setItem('avn-saved-address', JSON.stringify(defaultAddress));
      }
      localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteAddress = (addressId) => {
    setSavedAddresses((prev) => {
      const updated = prev.filter(a => a.id !== addressId);
      if (updated.length > 0) {
        const nextDefault = updated.find(a => a.isDefault) || updated[0];
        if (nextDefault) {
          setUserAddress(nextDefault);
          localStorage.setItem('avn-saved-address', JSON.stringify(nextDefault));
        } else {
          setUserAddress(null);
          localStorage.removeItem('avn-saved-address');
        }
      } else {
        setUserAddress(null);
        localStorage.removeItem('avn-saved-address');
      }
      localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAddress = (addressData) => {
    const targetId = addressData.id || ('addr-' + Date.now());
    const isEdit = Boolean(addressData.id);

    setSavedAddresses((prev) => {
      const isDefault = isEdit
        ? (addressData.isDefault ?? false)
        : (prev.length === 0 || addressData.isDefault);

      const savedAddrObj = {
        ...addressData,
        id: targetId,
        isDefault
      };

      let updated;
      if (isEdit) {
        updated = prev.map((a) => (a.id === targetId ? savedAddrObj : a));
      } else {
        updated = [...prev, savedAddrObj];
      }

      if (isDefault || !userAddress || userAddress.id === targetId) {
        setUserAddress(savedAddrObj);
        try {
          localStorage.setItem('avn-saved-address', JSON.stringify(savedAddrObj));
        } catch (e) {}
      }

      try {
        localStorage.setItem('avn-saved-addresses', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setEditingAddress(null);
    const nextView = addressReturnView === 'checkout' ? 'checkout' : (addressReturnView || 'addresses');
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
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      return 'search';
    }
    return 'home';
  });
  const [currentPdpProduct, setCurrentPdpProduct] = useState(null);
  const [userAddress, setUserAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('avn-saved-address');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addressReturnView, setAddressReturnView] = useState('profile');
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (savedAddresses.length > 0 && !userAddress) {
      const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      setUserAddress(defaultAddress);
      try {
        localStorage.setItem('avn-saved-address', JSON.stringify(defaultAddress));
      } catch (e) {}
    }
  }, [savedAddresses, userAddress]);



  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadApiProducts() {
      const apiProducts = await fetchProducts();
      if (apiProducts && apiProducts.length > 0) {
        setProducts(apiProducts);
        setIsBackendConnected(true);
      }
    }
    loadApiProducts();
  }, []);

  const handleSelectProductForPdp = (product) => {
    setCurrentPdpProduct(product);
    setActiveView('pdp');
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

  const handleNavigateSearch = (initialQuery = '') => {
    setActiveView('search');
    setIsSearchOpen(false);
    if (initialQuery && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('q', initialQuery);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCart = () => {
    setActiveView('cart');
    cart.setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const handleProceedToCheckout = (data) => {
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
      cart.setIsCartOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!userAddress) {
      setAddressReturnView('checkout');
      setActiveView('add-address');
    } else {
      setActiveView('checkout');
    }
    cart.setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainContainerClasses = isMobileView
    ? 'min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[#FF1E27] selection:text-white transition-colors duration-300 pb-20'
    : 'min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[#FF1E27] selection:text-white transition-colors duration-300 pb-16 md:pb-0';

    return (
    <div className={mainContainerClasses}>
      <Navbar
        onNavigateContact={() => { setActiveView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        cartCount={cart.totalCartCount}
        onOpenCart={handleNavigateCart}
        onNavigateCart={handleNavigateCart}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateSearch={handleNavigateSearch}
        onOpenAccount={() => {
          if (!user) {
            setActiveView('auth');
          } else {
            setActiveView('profile');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAddresses={() => {
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
            onPlaceOrder={() => {
              cart.clearCart();
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
                  setAddressReturnView('checkout');
                  setActiveView('add-address');
                } else {
                  setActiveView('checkout');
                }
              } else if (redirectPath === 'review') {
                if (setRedirectPath) setRedirectPath(null);
                setActiveView('pdp');
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
              setAddressReturnView('profile');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddNewAddress={() => {
              setEditingAddress(null);
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
            onOpenAddressManager={() => setActiveView('addresses')}
            onBack={handleNavigateHome}
            onSignOut={handleSignOut}
            theme={theme}
          />
        ) : activeView === 'addresses' ? (
          <AddressListPage
            savedAddresses={savedAddresses}
            onBack={() => setActiveView('profile')}
            onAddNewAddress={() => {
              setEditingAddress(null);
              setAddressReturnView('addresses');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onEditAddress={(addr) => {
              setEditingAddress(addr);
              setAddressReturnView('addresses');
              setActiveView('add-address');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            theme={theme}
          />
        ) : activeView === 'order-details' ? (
          <OrderDetailsPage
            order={selectedOrder}
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
        ) : activeView === 'order-history' && !user ? (
          // Auth gate: redirect to auth if not logged in
          (() => { setActiveView('auth'); return null; })()
        ) : activeView === 'order-history' ? (
          <OrderHistoryPage
            onBack={() => setActiveView('profile')}
            currentUser={user}
            onWriteReviewClick={(productSlug) => {
              const productObj = products.find(p => p.slug === productSlug || p.id === productSlug || p.name.toLowerCase().includes(productSlug.replace(/-/g, ' ')));
              if (productObj) {
                setCurrentPdpProduct(productObj);
                setActiveView('pdp');
              } else {
                // Try fallback search page or home
                setActiveView('search');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOrderDetails={(order) => {
              setSelectedOrder(order);
              setActiveView('order-details');
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
            onNavigateContact={() => {
          setActiveView('contact');
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
            key={editingAddress?.id || "new-address"}
            userAddress={editingAddress}
            onSaveAddress={handleSaveAddress}
            onCancel={() => {
              setActiveView(addressReturnView || (checkoutData ? 'checkout' : 'profile'));
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
            onRemoveItem={cart.removeFromCart}
            onUpdateVariant={cart.updateVariant}
            onNavigateHome={handleNavigateSearch}
            onNavigateSearch={handleNavigateSearch}
            onProceedToCheckout={handleProceedToCheckout}
            onClearCart={cart.clearCart}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'search' ? (
          <SearchPage
            onSelectProduct={handleSelectProductForPdp}
            onAddToCart={cart.addToCart}
            onOpenCart={handleNavigateCart}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'pdp' && currentPdpProduct ? (
          <ProductDetailPage
            product={currentPdpProduct}
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
          <HomePage
            theme={theme}
            products={products}
            onExploreClick={handleNavigateSearch}
            onAddToCart={cart.addToCart}
            onSelectProduct={handleSelectProductForPdp}
            isMobileView={isMobileView}
          />
        )}
      </main>

      <Footer
        theme={theme}
        isMobileView={isMobileView}
        activeView={activeView}
        onNavigateContact={() => {
          setActiveView('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSupport={() => {
          setActiveView('support');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <CartDrawer
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        cartItems={cart.cartItems}
        onSelectProduct={(product) => {
          cart.setIsCartOpen(false);
          handleSelectProductForPdp(product);
        }}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onCheckout={handleProceedToCheckout}
        onOpenFullCart={handleNavigateCart}
        theme={theme}
        isMobileView={isMobileView}
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
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProductForPdp}
        onOpenSearchPage={handleNavigateSearch}
        isMobileView={isMobileView}
      />
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
      <CartProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}






