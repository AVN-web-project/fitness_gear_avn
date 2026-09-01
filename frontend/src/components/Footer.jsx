import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';
import Button from './Button';

export default function Footer({ onNavigateSupport, onNavigateContact, theme, isMobileView = false, activeView = 'home' }) {
  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  const trustBadges = [
    {
      title: 'TRUSTED BY ATHLETES',
      sub: 'Over 50,000+ lifters & pros trust AVN',
      renderIcon: () => (
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#FF1E27] shrink-0" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 36c-4-5-5-14 0-24M14 36c-2-3-2-8 1-12M14 24c-3-2-4-7-1-10" />
          <path d="M34 36c4-5 5-14 0-24M34 36c2-3 2-8-1-12M34 24c3-2 4-7 1-10" />
          <path d="M18 16h12v6c0 3.3-2.7 6-6 6s-6-2.7-6-6v-6z" />
          <path d="M24 28v6M20 34h8" />
          <circle cx="24" cy="11" r="1.8" fill="currentColor" />
        </svg>
      )
    },
    {
      title: 'PREMIUM MATERIALS',
      sub: 'Reinforced stitching & heavy duty fabric',
      renderIcon: () => (
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#FF1E27] shrink-0" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 5L8 12v12c0 12 7.5 20 16 22 8.5-2 16-10 16-22V12L24 5z" />
          <path d="M24 10L13 15v9c0 8.5 5.5 14 11 15.5 5.5-1.5 11-7 11-15.5v-9L24 10z" strokeWidth="1.5" />
          <path d="M20 16h5c2.2 0 4 1.3 4 3s-1.8 3-4 3h-5v7" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: 'DESIGNED IN INDIA',
      sub: 'Engineered for maximum stability',
      renderIcon: () => (
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#FF1E27] shrink-0" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 5L8 12v12c0 12 7.5 20 16 22 8.5-2 16-10 16-22V12L24 5z" />
          <circle cx="24" cy="19" r="3.5" fill="currentColor" fillOpacity="0.25" />
          <path d="M24 12v2M18 14l1.5 1.5M30 14l-1.5 1.5M16 19h2M30 19h2" strokeWidth="1.8" />
          <path d="M13 28c3 1.5 6 1.5 9 0s6-1.5 9 0 6 1.5 9 0" />
          <path d="M13 33c3 1.5 6 1.5 9 0s6-1.5 9 0 6 1.5 9 0" />
        </svg>
      )
    },
    {
      title: 'EXPRESS SHIPPING',
      sub: 'Fast nationwide doorstep delivery',
      renderIcon: () => (
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#FF1E27] shrink-0" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="14" width="20" height="16" rx="2" />
          <path d="M32 20h7l4 5v5h-11v-10z" />
          <circle cx="19" cy="33" r="3.5" strokeWidth="2" />
          <circle cx="37" cy="33" r="3.5" strokeWidth="2" />
          <path d="M4 18h5M2 23h7M5 28h4" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: 'SECURE PAYMENTS',
      sub: '100% encrypted & safe checkout',
      renderIcon: () => (
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#FF1E27] shrink-0" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="11" y="20" width="26" height="19" rx="4" fill="currentColor" fillOpacity="0.15" />
          <path d="M17 20v-6c0-3.9 3.1-7 7-7s7 3.1 7 7v6" strokeWidth="2.5" />
          <circle cx="24" cy="28" r="2.5" fill="currentColor" />
          <line x1="24" y1="30.5" x2="24" y2="34" strokeWidth="2.5" />
        </svg>
      )
    }
  ];

  // 3x Array for infinite scroll buffer in both left and right directions
  const marqueeBadges = [...trustBadges, ...trustBadges, ...trustBadges];

  // Continuous auto-scroll with automatic initialization on load
  useEffect(() => {
    let animId;
    const container = scrollRef.current;

    // Set initial scroll position once container has scrollWidth
    if (container) {
      const initScroll = () => {
        if (container.scrollWidth > 0 && container.scrollLeft === 0) {
          container.scrollLeft = container.scrollWidth / 3;
        }
      };
      initScroll();
      setTimeout(initScroll, 50);
      setTimeout(initScroll, 200);
    }

    const loop = () => {
      if (container) {
        if (!isPaused) {
          container.scrollLeft += 1;
        }

        const oneThird = container.scrollWidth / 3;
        if (oneThird > 0) {
          if (container.scrollLeft >= oneThird * 2) {
            container.scrollLeft = oneThird;
          } else if (container.scrollLeft <= 5) {
            container.scrollLeft = oneThird;
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, activeView]);

  const handleCardClick = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <footer className={`relative bg-[var(--bg-card-solid)] pb-12 transition-colors duration-300 overflow-hidden ${activeView === 'home' ? 'pt-0 border-t-0' : 'pt-12 sm:pt-16 border-t border-[var(--border-subtle)]'}`}>
      
      {/* Top Guarantee Badges Strip (Auto Scroll on Desktop / Auto + Manual Infinite Scroll on Mobile) */}
      {/* Guarantee Badges Strip */} (
        <div className="pb-6 mb-10 w-full overflow-hidden">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex items-center gap-5 sm:gap-6 px-4 py-4 overflow-x-auto sm:overflow-x-hidden no-scrollbar scroll-smooth cursor-default select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {marqueeBadges.map((badge, idx) => (
              <div
                key={idx}
                onClick={handleCardClick}
                className="shrink-0 w-72 sm:w-80 red-corner-border rounded-2xl p-5 group text-left relative bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              >
                {/* Icon Container with Glass Floor Mirror Reflection */}
                <div className="relative shrink-0 flex flex-col items-start mb-3">
                  <div className="relative z-10 text-[#FF1E27] group-hover:scale-110 transition-transform duration-300">
                    {badge.renderIcon()}
                  </div>
                  <div 
                    className="absolute top-[85%] pointer-events-none transform scale-y-[-0.55] opacity-35 blur-[1px] group-hover:opacity-65 transition-opacity duration-300 overflow-hidden text-[#FF1E27] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]"
                    aria-hidden="true"
                  >
                    {badge.renderIcon()}
                  </div>
                </div>

                {/* Title & Subtext */}
                <div className="space-y-1 mt-2">
                  <h4 className="text-sm font-black tracking-wider text-[var(--text-main)] font-heading italic uppercase group-hover:text-[#FF1E27] transition-colors leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-[var(--text-sub)] leading-relaxed font-normal">
                    {badge.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Main Footer Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 text-left">
          
          {/* Brand Info Column */}
          <div className="md:col-span-4 space-y-3">
            <a href="#home" className="inline-block">
              <img
                src={currentLogo}
                alt="AVN Brand Logo"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </a>
            <p className="text-sm sm:text-base text-[var(--text-sub)] leading-relaxed max-w-sm font-normal">
              Engineered for powerlifters, bodybuilders, and fitness enthusiasts. Uncompromising quality and wrist/knee support gear.
            </p>
            <div className="flex items-center space-x-3.5 pt-1.5">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-white hover:bg-[#FF1E27] transition-all hover:scale-110">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-white hover:bg-[#FF1E27] transition-all hover:scale-110">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-white hover:bg-[#FF1E27] transition-all hover:scale-110">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links & Categories Columns */}
          <div className="col-span-full md:col-span-5 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
            {/* Quick Links Column */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] uppercase tracking-wider font-sans font-black italic">
                QUICK LINKS
              </h4>
              <ul className="space-y-3 text-sm sm:text-base text-[var(--text-sub)] font-normal">
                <li><a href="#home" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Home</a></li>
                <li><a href="#products" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Shop All</a></li>
                <li><a href="#why-avn" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Why AVN</a></li>
                <li><a href="#about" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">About Us</a></li>
                <li><button type="button" onClick={() => onNavigateContact && onNavigateContact()} className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all cursor-pointer text-left">Contact Us</button></li>
                <li><button type="button" onClick={() => onNavigateSupport && onNavigateSupport()} className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all cursor-pointer text-left">Support Hub</button></li>
              </ul>
            </div>

            {/* Categories Column */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] uppercase tracking-wider font-sans font-black italic">
                CATEGORIES
              </h4>
              <ul className="space-y-3 text-sm sm:text-base text-[var(--text-sub)] font-normal">
                <li><a href="#products" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Knee Support Wraps</a></li>
                <li><a href="#products" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Wrist Support Wraps</a></li>
                <li><a href="#products" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Lifting Straps</a></li>
                <li><a href="#products" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Yoga Accessories</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] uppercase tracking-wider font-sans font-black italic">
              JOIN THE AVN CLUB
            </h4>
            <p className="text-sm text-[var(--text-sub)] leading-relaxed">
              Subscribe for exclusive athlete discounts and product drops.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 pt-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[#FF1E27] focus:ring-1 focus:ring-[#FF1E27] transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-14 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-sm text-[var(--text-sub)] gap-4 font-normal">
          <p>© {new Date().getFullYear()} AVN Athletics. All rights reserved.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--text-main)] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[var(--text-main)] transition-colors">Shipping Policy</a>
          </div>
        </div>

      </div>

    </footer>
  );
}
