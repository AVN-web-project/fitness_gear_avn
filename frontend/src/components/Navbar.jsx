import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight, Sun, Moon, User } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Navbar({
  cartCount,
  onOpenCart,
  onNavigateCart,
  onOpenSearch,
  onNavigateSearch,
  theme,
  onToggleTheme,
  onNavigateHome,
  activeView
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('HOME');
  const [isScrolled, setIsScrolled] = useState(false);

  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'HOME', href: '#home' },
    { label: 'ABOUT', href: '#about' },
    { label: 'PRODUCTS', href: '#products' },
    { label: 'WHY AVN', href: '#why-avn' },
    { label: 'REVIEWS', href: '#reviews' },
    { label: 'CONTACT', href: '#contact' }
  ];

  const handleNavClick = (label, href) => {
    setActiveNav(label);
    if (label === 'HOME' && onNavigateHome) {
      onNavigateHome();
    } else if (label === 'PRODUCTS' && onNavigateSearch) {
      onNavigateSearch();
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 isolate ${
        activeView === 'home' && !isScrolled
          ? 'bg-transparent border-b border-transparent backdrop-blur-none shadow-none'
          : 'bg-[var(--bg-navbar)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm'
      }`}>
        <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 h-20 flex items-center justify-between">

          {/* Left Mobile Menu Hamburger + Logo Stack */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[var(--text-main)] hover:text-[#FF1E27] lg:hidden cursor-pointer rounded-lg transition-colors"
              aria-label="Open Navigation Sidebar"
              title="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('HOME', '#home');
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <img
                src={currentLogo}
                alt="AVN Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.label === 'HOME') e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                  className={`relative px-4 py-2.5 transition-all duration-300 uppercase whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--text-main)] font-extrabold'
                      : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-bold'
                  }`}
                >
                  <span className="relative z-10 text-xs sm:text-sm tracking-widest font-heading">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Right Utility Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={onToggleTheme}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform cursor-pointer rounded-full"
              aria-label="Toggle Light/Dark Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-slate-400 hover:text-[#FF1E27] transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-colors" />
              )}
            </button>

            <button
              onClick={() => {
                if (onNavigateSearch) onNavigateSearch();
                else if (onOpenSearch) onOpenSearch();
              }}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (onNavigateSearch) onNavigateSearch();
              }}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="User Profile Account"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={onNavigateCart || onOpenCart}
              className="relative p-2 text-[var(--text-main)] hover:text-[#FF1E27] transition-colors cursor-pointer rounded-full group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF1E27] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[var(--bg-main)] p-6 flex flex-col justify-between z-10 shadow-2xl border-r border-[var(--border-subtle)]">
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <img src={currentLogo} alt="AVN Logo" className="h-10 w-auto object-contain" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick(item.label, item.href);
                    }}
                    className={`text-sm font-extrabold uppercase font-heading tracking-wider py-2 px-3 rounded-lg transition-colors ${
                      activeNav === item.label
                        ? 'bg-[#FF1E27] text-white shadow-[0_0_15px_rgba(255,30,39,0.4)]'
                        : 'text-[var(--text-main)] hover:bg-[var(--border-subtle)] hover:text-[#FF1E27]'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateSearch) onNavigateSearch();
                }}
                className="w-full btn-glow-red py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,30,39,0.4)]"
              >
                <span>EXPLORE CATALOG</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-[var(--text-sub)] pt-2">
                <span>© AVN ATHLETICS</span>
                <span className="text-[#FF1E27] font-bold">PREMIUM GEAR</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
