import React from 'react';
import { ArrowRight, Trophy, ShieldCheck, Flag, Truck, Lock } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Footer({ theme }) {
  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;

  const trustBadges = [
    {
      title: 'TRUSTED BY',
      sub: 'ATHLETES',
      icon: <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'PREMIUM',
      sub: 'MATERIALS',
      icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'DESIGNED',
      sub: 'IN INDIA',
      icon: <Flag className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'EXPRESS',
      sub: 'SHIPPING',
      icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'SECURE',
      sub: 'PAYMENTS',
      icon: <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    }
  ];

  return (
    <footer className="w-full bg-[var(--bg-main)] pt-10 pb-8 transition-colors duration-300">
      
      {/* Feature & Qualities Bar */}
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 mb-14">
        <div className="red-corner-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-8 relative overflow-hidden shadow-lg">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-4 items-center">
            {trustBadges.map((badge, idx) => {
              const isLastOdd = idx === trustBadges.length - 1;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 sm:gap-4 text-left w-full group transition-transform duration-300 hover:translate-y-[-2px] ${
                    isLastOdd
                      ? 'col-span-2 lg:col-span-1 justify-self-center sm:justify-self-center lg:justify-self-start'
                      : ''
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-[#FF1E27]/10 border border-[#FF1E27]/25 group-hover:bg-[#FF1E27]/20 group-hover:border-[#FF1E27]/50 transition-all duration-300 shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-[var(--text-sub)] tracking-widest uppercase font-heading">
                      {badge.title}
                    </p>
                    <p className="text-xs sm:text-sm font-black italic text-[var(--text-main)] tracking-wider uppercase font-sans">
                      {badge.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

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
              <li><a href="#contact" className="hover:text-[#FF1E27] hover:translate-x-1 inline-block transition-all">Contact</a></li>
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
              <button
                type="submit"
                className="w-full py-3 px-5 bg-[#FF1E27] hover:bg-[#ff3b42] text-white text-sm font-extrabold font-heading uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(255,30,39,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SUBSCRIBE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
