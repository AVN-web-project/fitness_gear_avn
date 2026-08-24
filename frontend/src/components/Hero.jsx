import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, theme }) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic Background Image based on Active Theme
  const isLight = theme === 'light';
  const bgImage = isLight ? '/avn-hero-light.png' : '/avn-hero.png';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollRatio = Math.min(1, Math.max(0, scrollY / 300));

  return (
    <section id="home" className="relative min-h-screen -mt-20 pt-28 pb-16 flex items-center overflow-hidden bg-[var(--bg-main)]">
      {/* 1. Full-Bleed Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={bgImage}
          alt="AVN Hero Background"
          className={`w-full h-full ${
            isLight
              ? 'object-contain object-[65%_center] lg:object-[65%_center] scale-[1.18] transform-gpu filter brightness-[1.02] contrast-[1.05] saturate-[1.06]'
              : 'object-cover object-center opacity-100 filter brightness-[1.04] contrast-[1.08] saturate-[1.12]'
          } transition-all duration-700`}
          style={
            isMobile
              ? {
                  transform: `scale(${1.05 - scrollRatio * 0.08}) translateY(${scrollY * 0.12}px)`,
                  opacity: 1 - scrollRatio * 0.25,
                }
              : {}
          }
        />
        
        {/* Left-Side Gradient Overlay - 100% Original Dark Vignette for Dark Theme */}
        <div className={`hidden lg:block absolute inset-y-0 left-0 w-full ${
          isLight
            ? 'max-w-md bg-gradient-to-r from-[var(--bg-main)]/60 via-[var(--bg-main)]/15 to-transparent'
            : 'max-w-2xl bg-gradient-to-r from-[var(--bg-main)]/85 via-[var(--bg-main)]/35 to-transparent'
        }`} />

        {/* Dynamic Mobile Vignette Fade Overlay on Scroll */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)]/85 via-[var(--bg-main)]/60 to-[var(--bg-main)] transition-opacity duration-150 ease-out lg:hidden"
          style={{ opacity: isMobile ? 0.35 + scrollRatio * 0.6 : 0 }}
        />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[var(--bg-main)] to-transparent opacity-80" />
      </div>

      {/* 2. Hero Content Overlay */}
      <div
        className="relative z-10 max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 w-full"
        style={
          isMobile
            ? {
                transform: `translateY(${-scrollRatio * 28}px)`,
              }
            : {}
        }
      >
        <div className="max-w-2xl space-y-6 text-left">
          <p className="font-sans text-[11px] sm:text-[12px] font-extrabold tracking-[3px] text-[#FF1E27] uppercase pl-1 sm:pl-1.5">
            BUILT TO SUPPORT. DESIGNED TO PERFORM.
          </p>

          <h1 className="font-sans font-black italic text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[0.98] uppercase">
            <span className="block text-[var(--text-main)] tracking-wide">STRONGER</span>
            <span className="block text-[#FF1E27] py-0.5 tracking-wide">
              SUPPORT.
            </span>
            <span className="block text-[var(--text-main)] tracking-wider">BETTER YOU.</span>
          </h1>

          <p className="text-[var(--text-sub)] text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-xl">
            Premium gear for lifters, athletes and everyday warriors.<br className="hidden sm:block" />
            Engineered for comfort. Built for performance.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#products"
              onClick={onExploreClick}
              className="btn-glow-red px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white flex items-center gap-2 group cursor-pointer"
            >
              <span>EXPLORE PRODUCTS</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#why-avn"
              className="btn-outline-dark px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 group"
            >
              <span>DISCOVER MORE</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
