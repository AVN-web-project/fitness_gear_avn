import React, { useState, useEffect } from 'react';
import {Search, ShoppingBag, Menu, X, ArrowRight, Sun, Moon, User, Home, History, PackageCheck } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  onOpenSearch,
  onNavigateSearch,
  theme = 'dark',
  onToggleTheme,
  onNavigateHome,
  onOpenAccount,
  onNavigateCart,
  activeView = 'home'
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('HOME');
  const [isScrolled, setIsScrolled] = useState(false);

  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
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

    const handleOrderHistoryClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMobileMenuOpen(false);
    if (props.onOpenOrderHistory) {
      props.onOpenOrderHistory();
    } else if (props.onOpenAccount) {
      props.onOpenAccount();
    } else if (onOpenAccount) {
      onOpenAccount();
    }
  };

  const handleNavClick = (label, href) => {
    setActiveNav(label);
    if (label === 'HOME' && onNavigateHome) {
      onNavigateHome();
    } else if (label === 'PRODUCTS' && onNavigateSearch) {
      onNavigateSearch();
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCartClick = () => {
    if (onNavigateCart) {
      onNavigateCart();
    } else if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <>
      {/* Latest Committed Desktop Header: Transparent when at top, Translucent Blur on Scroll */}
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
            {navItems.filter(item => item.label !== 'CONTACT').map((item) => {
              const isActive = activeNav === item.label && activeView === 'home';
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
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#FF1E27] shadow-none" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Icons (Desktop) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Theme Switcher Toggle */}
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

            {/* Search Icon (Desktop) */}
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

            {/* User Account Icon (Desktop) */}
            <button
              onClick={onOpenAccount || (() => {})}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Order History Icon (Desktop) */}
            <button
              onClick={handleOrderHistoryClick}
              className="p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="Order History"
              title="Order History"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              onClick={handleCartClick}
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

      {/* Mobile Slide-Over Navigation Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative flex-1 max-w-xs w-full bg-[var(--bg-main)] p-6 flex flex-col justify-between z-10 shadow-2xl border-r border-[var(--border-subtle)] animate-in slide-in-from-left duration-300">
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <img src={currentLogo} alt="AVN Logo" className="h-10 w-auto object-contain" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] rounded-lg cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navItems.filter(item => !['WHY AVN', 'REVIEWS'].includes(item.label)).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (item.label === 'HOME') e.preventDefault();
                      setMobileMenuOpen(false);
                      handleNavClick(item.label, item.href);
                    }}
                    className={`text-sm font-extrabold uppercase font-heading tracking-wider py-2 px-3 rounded-lg transition-colors ${
                      activeNav === item.label
                        ? 'bg-[#FF1E27] text-white shadow-md'
                        : 'text-[var(--text-main)] hover:bg-[var(--border-subtle)] hover:text-[#FF1E27]'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Orders & Returns Button (Mobile Sidebar ONLY) */}
                <a
                  href="#orders"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (onOpenAccount) onOpenAccount();
                  }}
                  className="text-sm font-extrabold uppercase font-heading tracking-wider py-2 px-3 rounded-lg transition-colors text-[var(--text-main)] hover:bg-[var(--border-subtle)] hover:text-[#FF1E27]"
                >
                  ORDERS & RETURNS
                </a>
              </nav>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-center text-xs text-[var(--text-sub)] font-normal">
                <span>© {new Date().getFullYear()} AVN ATHLETICS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (FOR MOBILE DESIGN ONLY: Home, Profile, Search) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-t border-[var(--border-subtle)] px-6 py-2 transition-colors duration-300 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around h-12">
          {/* 1. Home Button */}
          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              setActiveNav('HOME');
            }}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              activeView === 'home'
                ? 'text-[#FF1E27] font-extrabold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Home</span>
          </button>

          {/* 2. Profile Button */}
          <button
            onClick={onOpenAccount || (() => {})}
            className="flex flex-col items-center justify-center space-y-1 relative text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium cursor-pointer transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Profile</span>
          </button>

          {/* 3. Search Button */}
          <button
            onClick={() => {
              if (onNavigateSearch) onNavigateSearch();
              else if (onOpenSearch) onOpenSearch();
            }}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              activeView === 'search'
                ? 'text-[#FF1E27] font-extrabold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
