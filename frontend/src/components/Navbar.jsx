import React, { useState, useEffect } from 'react';
import {Search, ShoppingBag, Menu, X, ArrowRight, Sun, Moon, User, Home, History, PackageCheck, MapPin, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Navbar({
  categories = [],
  cartCount = 0,
  onOpenCart,
  onOpenSearch,
  onNavigateSearch,
  onNavigateContact,
  theme = 'dark',
  onToggleTheme,
  onNavigateHome,
  onOpenAccount,
  onSignOut,
  onNavigateAddresses,
  onNavigateOrders,
  onNavigateCart,
  activeView = 'home'
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
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
    if (onNavigateOrders) {
      onNavigateOrders();
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
    } else if (label === 'CONTACT') {
      if (onNavigateContact) {
        onNavigateContact();
      } else {
        const element = document.querySelector(href) || document.querySelector('#contact') || document.querySelector('footer');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
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

  const isLightTheme = theme === 'light';

  return (
    <>
      {/* Mobile Light Theme: Fixed, Static 90% Opaque with no border line; Dark Theme: Exact original sticky scroll */}
      <header className={`z-40 w-full transition-all duration-300 isolate ${
        isLightTheme
          ? 'fixed lg:sticky top-0 bg-[var(--bg-main)]/90 backdrop-blur-md border-b-0 shadow-none ' +
            ((activeView === 'home' || activeView === 'search') && !isScrolled
              ? 'lg:bg-transparent lg:border-transparent lg:backdrop-blur-none lg:shadow-none'
              : 'lg:bg-transparent lg:backdrop-blur-none lg:border-b lg:border-[var(--border-subtle)] lg:shadow-sm')
          : 'sticky top-0 ' +
            ((activeView === 'home' || activeView === 'search') && !isScrolled
              ? 'bg-transparent border-b border-transparent backdrop-blur-none shadow-none'
              : 'bg-[var(--bg-navbar)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm')
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
              className="p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors hover:scale-110 transform cursor-pointer rounded-full"
              aria-label="Toggle Light/Dark Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Search Icon (Desktop) */}
            <button
              onClick={() => {
                if (onNavigateSearch) onNavigateSearch();
                else if (onOpenSearch) onOpenSearch();
              }}
              className="p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="Search"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Fully Functional User Account Dropdown (Visible on Desktop & Mobile) */}
            <div className="relative hidden lg:flex items-center group" onMouseLeave={() => setProfileDropdownOpen(false)}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                onMouseEnter={() => setProfileDropdownOpen(true)}
                className="p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors hover:scale-110 transform cursor-pointer rounded-full"
                aria-label="User Profile Account Menu"
                title="My Profile & Settings"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Profile Dropdown Overlay */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full pt-2 w-64 z-50"
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                >
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-solid)] shadow-2xl p-2.5 opacity-100 z-50">
                  {user ? (
                    <>
                      {/* User Info Header */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                          if (onOpenAccount) onOpenAccount();
                        }}
                        className="p-3 border-b border-[var(--border-subtle)] space-y-0.5 cursor-pointer hover:bg-[#FF1E27]/5 rounded-xl transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black font-heading text-[var(--text-main)] uppercase">
                            {user.name || user.fullName || 'ATHLETE'}
                          </p>
                          <span className="text-[9px] font-extrabold uppercase font-heading bg-[#FF1E27]/10 text-[#FF1E27] border border-[#FF1E27]/30 px-1.5 py-0.5 rounded">
                            {user.tier || 'MEMBER'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-sub)] font-medium">
                          {user.email}
                        </p>
                      </div>

                      {/* Navigation Items */}
                      <div className="py-1 space-y-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            if (onOpenAccount) onOpenAccount();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] hover:bg-[#FF1E27]/10 hover:text-[#FF1E27] transition-colors cursor-pointer text-left"
                        >
                          <User className="w-4 h-4 text-[#FF1E27]" />
                          <span>My Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            if (onNavigateAddresses) onNavigateAddresses();
                            else if (onOpenAccount) onOpenAccount();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] hover:bg-[#FF1E27]/10 hover:text-[#FF1E27] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-[#FF1E27]" />
                            <span>Saved Addresses</span>
                          </div>
                          <span className="text-[10px] font-extrabold bg-[#FF1E27]/10 text-[#FF1E27] px-1.5 py-0.5 rounded-full">
                            Manage
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            if (onNavigateOrders) onNavigateOrders();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] hover:bg-[#FF1E27]/10 hover:text-[#FF1E27] transition-colors cursor-pointer text-left"
                        >
                          <PackageCheck className="w-4 h-4 text-[#FF1E27]" />
                          <span>Orders & Returns</span>
                        </button>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            logout();
                            if (onSignOut) onSignOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black font-heading text-[var(--text-main)] uppercase tracking-wider">GUEST ATHLETE</h4>
                        <p className="text-[10px] text-[var(--text-sub)] leading-relaxed">
                          Sign in to track orders, manage addresses, and view your profile.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                          if (onOpenAccount) onOpenAccount();
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#FF1E27] hover:bg-red-600 text-white text-xs font-black font-heading uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        SIGN IN / REGISTER
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* Order History Icon (Desktop) */}
            <button
              onClick={handleOrderHistoryClick}
              className="p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors hover:scale-110 transform hidden lg:block cursor-pointer"
              aria-label="Orders & Returns"
              title="Orders & Returns"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-[var(--text-sub)] hover:text-[#FF1E27] transition-colors cursor-pointer rounded-full group"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
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
                      e.preventDefault();
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
                    if (onNavigateOrders) onNavigateOrders();
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
            onClick={() => {
              if (onOpenAccount) onOpenAccount();
            }}
            className={`flex flex-col items-center justify-center space-y-1 relative cursor-pointer transition-colors ${
              activeView === 'profile' || activeView === 'auth' || activeView === 'order-history'
                ? 'text-[#FF1E27] font-extrabold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium'
            }`}
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
