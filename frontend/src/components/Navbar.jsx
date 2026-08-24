import React, { useState } from 'react';
import { Search, User, ShoppingBag, Menu, X, Sun, Moon, Home } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Navbar({
  cartCount = 2,
  onOpenCart,
  onOpenSearch,
  onNavigateSearch,
  theme = 'dark',
  onToggleTheme,
  onNavigateHome,
  activeView = 'home'
}) {
  const [activeNav, setActiveNav] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;

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
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-navbar)] backdrop-blur-md transition-all isolate">
        <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 h-20 flex items-center justify-between">

          {/* Left Mobile Menu Hamburger + Logo Stack */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Sidebar Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[var(--text-main)] hover:text-[#FF1E27] md:hidden cursor-pointer rounded-lg transition-colors"
              aria-label="Open Navigation Sidebar"
              title="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                setActiveNav('HOME');
              }}
              className="flex items-center gap-2 group shrink-0 cursor-pointer border-none bg-transparent"
            >
              <img
                src={currentLogo}
                alt="AVN Brand Logo"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </div>

          {/* Center Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-6">
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
                  {/* Nav Label */}
                  <span className="relative z-10 text-xs sm:text-sm tracking-widest font-heading">
                    {item.label}
                  </span>

                  {/* Shortened Clean Red Dash Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-[2.5px] bg-[#FF1E27] rounded-full z-10" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Utility Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Theme Switcher Toggle (Sun / Moon) */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform cursor-pointer rounded-full"
              aria-label="Toggle Light/Dark Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
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
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform hidden md:block cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account Icon (Desktop) */}
            <button
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors hover:scale-110 transform hidden md:block cursor-pointer"
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

      {/* Mobile Slide-Over Navigation Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Over Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-[var(--bg-card-solid)] border-r border-[var(--border-subtle)] h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-navbar)] backdrop-blur-xl border-t border-[var(--border-subtle)] px-6 py-2 transition-colors duration-300 shadow-lg">
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

          {/* Cart Icon Tab */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center space-y-1 relative text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-[#FF1E27] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] tracking-wider uppercase font-heading">Cart</span>
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

          {/* Menu Sidebar Tab */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center space-y-1 text-[var(--text-sub)] hover:text-[var(--text-main)] font-medium cursor-pointer transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-heading">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
}
