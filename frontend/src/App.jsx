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
import HomePage from './pages/HomePage';
import { PRODUCTS as LOCAL_PRODUCTS } from './data/products';
import { fetchProducts, submitOrder } from './services/api';
import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('avn-theme') || 'dark';
  });

  const cart = useCart();

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

  // Active view: 'home', 'search', 'pdp', or 'cart'
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      return 'search';
    }
    return 'home';
  });
  const [currentPdpProduct, setCurrentPdpProduct] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch product catalog from API backend
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

  // Navigation handlers
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

  // Direct Checkout Flow
  const handleProceedToCheckout = async (totalAmount) => {
    await submitOrder(cart.cartItems, totalAmount);
    cart.showToast('Order placed successfully! Thank you for choosing AVN Fitness Gear.');
    cart.clearCart();
    cart.setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[#FF1E27] selection:text-white transition-colors duration-300 pb-16 md:pb-0">
      {/* Top Navbar */}
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
      />

      {/* Main Page Layout */}
      <main className="flex-1 space-y-4">
        {activeView === 'cart' ? (
          <CartPage
            cartItems={cart.cartItems}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
            onUpdateVariant={cart.updateVariant}
            onNavigateHome={handleNavigateHome}
            onClearCart={cart.clearCart}
            theme={theme}
          />
        ) : activeView === 'search' ? (
          <SearchPage
            onSelectProduct={handleSelectProductForPdp}
            onAddToCart={cart.addToCart}
            onOpenCart={handleNavigateCart}
            theme={theme}
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
          />
        ) : (
          <>
            <Hero onExploreClick={handleNavigateSearch} theme={theme} />
            <FeatureBar />
            <Bestsellers
              products={products}
              theme={theme}
              onAddToCart={cart.addToCart}
              onSelectProduct={handleSelectProductForPdp}
            />
            <WhyChoose />
          </>
        )}
      </main>

      {/* Bottom Footer & Badges */}
      <Footer theme={theme} />

      {/* Drawers & Lightboxes */}
      <CartDrawer
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        cartItems={cart.cartItems}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onCheckout={handleProceedToCheckout}
        onOpenFullCart={handleNavigateCart}
        theme={theme}
      />

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={cart.addToCart}
        onOpenFullPage={handleSelectProductForPdp}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProductForPdp}
        onOpenSearchPage={handleNavigateSearch}
      />

      {/* Toast Notification */}
      {cart.toastMessage && (
        <div className="fixed bottom-[#4.5rem] md:bottom-6 right-6 z-50 bg-[var(--bg-card-solid)] border border-[#FF1E27]/50 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs font-heading flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF1E27]" />
          <span>{cart.toastMessage}</span>
          {(isBackendConnected || cart.isBackendConnected) && (
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded ml-2">
              API SYNC
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
