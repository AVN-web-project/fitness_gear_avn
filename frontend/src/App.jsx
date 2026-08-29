import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureBar from './components/FeatureBar';
import Bestsellers from './components/Bestsellers';
import WhyChoose from './components/WhyChoose';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CartPage from './pages/CartPage';
import ProductModal from './components/ProductModal';
import SearchModal from './components/SearchModal';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import AddAddressPage from './pages/AddAddressPage';
import CheckoutPage from './pages/CheckoutPage';
import { PRODUCTS as LOCAL_PRODUCTS } from './data/products';
import { fetchProducts, submitOrder } from './services/api';
import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('avn-theme') || 'dark';
  });

  const cart = useCart();

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

  const handleSaveAddress = (addressData) => {
    setUserAddress(addressData);
    try {
      localStorage.setItem('avn-saved-address', JSON.stringify(addressData));
    } catch (e) {}
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setCheckoutData(payload);
    if (!userAddress) {
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

  const toastContainerClasses = isMobileView
    ? 'fixed bottom-20 right-4 left-4 z-50 bg-[var(--bg-card-solid)] border border-[#FF1E27]/50 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs font-heading flex items-center justify-between gap-2'
    : 'fixed bottom-6 right-6 z-50 bg-[var(--bg-card-solid)] border border-[#FF1E27]/50 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs font-heading flex items-center justify-between gap-2';

  return (
    <div className={mainContainerClasses}>
      <Navbar
        cartCount={cart.totalCartCount}
        onOpenCart={handleNavigateCart}
        onNavigateCart={handleNavigateCart}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateSearch={handleNavigateSearch}
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
              setActiveView('add-address');
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
        ) : activeView === 'add-address' ? (
          <AddAddressPage
            userAddress={userAddress}
            onSaveAddress={handleSaveAddress}
            onCancel={() => {
              setActiveView(checkoutData ? 'checkout' : 'cart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : activeView === 'cart' ? (
          <CartPage
            cartItems={cart.cartItems}
            onSelectProduct={handleSelectProductForPdp}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
            onUpdateVariant={cart.updateVariant}
            onNavigateHome={handleNavigateHome}
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
            theme={theme}
            isMobileView={isMobileView}
          />
        ) : (
          <>
            <Hero onExploreClick={handleNavigateSearch} theme={theme} isMobileView={isMobileView} />
            <FeatureBar isMobileView={isMobileView} />
            <Bestsellers
              products={products}
              theme={theme}
              onAddToCart={cart.addToCart}
              onSelectProduct={handleSelectProductForPdp}
              isMobileView={isMobileView}
            />
            <WhyChoose isMobileView={isMobileView} />
          </>
        )}
      </main>

      <Footer theme={theme} isMobileView={isMobileView} activeView={activeView} />

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
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ErrorBoundary>
  );
}






