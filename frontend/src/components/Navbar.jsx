import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight, Sun, Moon, User, Home } from 'lucide-react';
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

  return (
    <>
      {/* Latest Committed Desktop Header (219b7cf): Transparent when at top, Translucent Blur on Scroll */}
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

          {/* Center Navigation Links (Desktop - Latest Committed 219b7cf Styling) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                  className={`text-sm font-extrabold uppercase font-heading tracking-wider transition-colors duration-200 cursor-pointer relative py-1 ${
                    isActive
                      ? 'text-[#FF1E27]'
                      : 'text-[var(--text-main)] hover:text-[#FF1E27]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF1E27] shadow-[0_0_8px_#FF1E27]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Icons (Desktop - Latest Committed 219b7cf Layout) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Theme Switcher Toggle (Sun / Moon) */}
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

            {/* Shopping Cart Icon with Badge (Mobile & Desktop) */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF1E27] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slide-Over Navigation Sidebar Drawer (Preserved from 2nd Commit) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-[var(--bg-main)] border-r border-[var(--border-subtle)] h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Sidebar Header: Logo & Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
                <button
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className="border-none bg-transparent"
                >
                  <img
                    src={currentLogo}
                    alt="AVN Brand Logo"
                    className="h-10 w-auto object-contain"
                  />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Navigation Items List */}
              <nav className="py-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = activeNav === item.label;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (item.label === 'HOME') e.preventDefault();
                        handleNavClick(item.label, item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-heading text-sm font-extrabold tracking-widest uppercase transition-all ${
                        isActive
                          ? 'bg-[#FF1E27] text-white shadow-[0_0_15px_rgba(255,30,39,0.4)]'
                          : 'text-[var(--text-main)] hover:bg-[var(--border-subtle)] hover:text-[#FF1E27]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer: Quick Actions */}
            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
              <a
                href="#products"
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-glow-red py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,30,39,0.4)]"
              >
                <span>EXPLORE PRODUCTS</span>
              </a>

              <div className="flex items-center justify-between text-xs text-[var(--text-sub)] pt-2 px-1">
                <span>© {new Date().getFullYear()} AVN Athletics</span>
                <span className="text-[#FF1E27] font-bold">PREMIUM GEAR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Preserved from 2nd Commit) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-navbar)] backdrop-blur-xl border-t border-[var(--border-subtle)] px-6 py-2 transition-colors duration-300 shadow-lg">
        <div className="flex items-center justify-around h-12">
          {/* Home Tab */}
          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              setActiveNav('HOME');
            }}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeNav === 'HOME'
                ? 'text-[#FF1E27] font-extrabold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Home</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={onOpenAccount || (() => {})}
            className="flex flex-col items-center justify-center space-y-1 relative text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium cursor-pointer transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Profile</span>
          </button>

          {/* Search Tab */}
          <button
            onClick={() => {
              if (onNavigateSearch) onNavigateSearch();
              else if (onOpenSearch) onOpenSearch();
            }}
            className="flex flex-col items-center justify-center space-y-1 text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium cursor-pointer transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
