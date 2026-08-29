import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, theme }) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  const isLight = theme === 'light';

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
    <section id="home" className="relative min-h-screen -mt-20 pt-25 sm:pt-28 pb-16 flex items-center overflow-hidden bg-[var(--bg-main)]">
      {/* 1. Background Layer */}
      {isLight ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Light Theme Hero Stage Overlay Image on Right Half (Fitted, Uncropped) */}
          <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[58%] xl:w-[60%] flex items-center justify-end pointer-events-none overflow-visible p-4 sm:p-6 lg:p-8 z-10">
            <img
              src="/avn-hero-light.png"
              alt="AVN Hero Light Stage & Logo"
              className="max-h-full max-w-full object-contain object-right-center scale-100 translate-y-4 sm:translate-y-0 transform-gpu opacity-100 transition-all duration-700 pointer-events-none"

            />
          </div>
          {/* Soft Left Vignette for Text Contrast */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[var(--bg-main)]/85 via-[var(--bg-main)]/35 to-transparent" />
          {/* Seamless Bottom Gradient Mask */}
          <div className="absolute bottom-0 inset-x-0 h-60 sm:h-48 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/95 via-[var(--bg-main)]/60 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="relative w-full h-full">

            {/* Base Layer: 3D Stage & Athlete Overlay (Behind the Blazing Video Effect, with Soft Left Edge Mask) */}
            <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[58%] xl:w-[60%] flex items-center justify-end pointer-events-none overflow-hidden z-0 [mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_100%),linear-gradient(to_bottom,black_0%,black_85%,transparent_99%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_100%),linear-gradient(to_bottom,black_0%,black_65%,transparent_98%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
              <img
                src="/avn-hero-2.png"
                alt="AVN Hero Stage & Logo"
                className="w-full h-full object-contain object-right-center scale-[1.12] lg:scale-[1.18] translate-y-6 sm:translate-y-3 lg:translate-y-4 transform-gpu opacity-100 filter brightness-[1.05] contrast-[1.08] saturate-[1.12] transition-all duration-700"

              />
            </div>

            {/* Top Video Layer: Blazing Video Effect (Playing directly ON TOP of the stage image with mix-blend-screen) */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08] transform-gpu z-10 mix-blend-screen opacity-85 filter brightness-[1.1] contrast-[1.15] saturate-[1.25] pointer-events-none"
            >
              <source src="/blazing-effect.mp4" type="video/mp4" />
            </video>

          </div>

          {/* Soft Left-Side Vignette for Crisp Text Contrast */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[var(--bg-main)]/85 via-[var(--bg-main)]/35 to-transparent z-20" />

          {/* Dynamic Mobile Vignette Fade Overlay on Scroll */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)]/85 via-[var(--bg-main)]/60 to-[var(--bg-main)] transition-opacity duration-150 ease-out lg:hidden z-20"
            className="hidden"
          />

          {/* Seamless Soft Gradient Fade at Bottom of Hero Section to Blend directly into FeatureBar */}
          <div className="absolute bottom-0 inset-x-0 h-60 sm:h-28 lg:h-20 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/90 sm:via-[var(--bg-main)]/35 to-transparent pointer-events-none z-20" />
        </div>
      )}

      {/* 2. Hero Content Overlay */}
      <div
        className="relative z-10 max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 w-full"

      >
        <div className="max-w-2xl space-y-6 text-left">
          <p className="font-sans text-[11px] sm:text-[12px] font-extrabold tracking-[3px] text-[#FF1E27] uppercase pl-1 sm:pl-1.5">
            BUILT TO SUPPORT. DESIGNED TO PERFORM.
          </p>

          <h1 className="-mt-3 sm:mt-0 font-sans font-black italic text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[0.98] uppercase">
            <span className="block text-[var(--text-main)] tracking-wide">STRONGER</span>
            <span className="block text-[#FF1E27] py-0.5 tracking-wide">
              SUPPORT.
            </span>
            <span className="block text-[var(--text-main)] tracking-wider">BETTER YOU.</span>
          </h1>

          <p className="text-[var(--text-sub)] pt-35 sm:pt-0 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-xl">
            Premium gear for lifters, athletes and everyday warriors.<br className="hidden sm:block" />
            Engineered for comfort. Built for performance.
          </p>

          {/* Hero Action Buttons (Side by Side 50/50 Grid on Mobile, Flex on Desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-2 w-full sm:w-auto">
            <a
              href="#products"
              onClick={onExploreClick}
              className="btn-glow-red flex-1 sm:flex-none sm:min-w-[240px] px-2.5 sm:px-7 py-3.5 rounded-xl font-heading font-bold text-[11px] sm:text-sm tracking-wider uppercase text-white flex items-center justify-center gap-1 sm:gap-2 group cursor-pointer text-center whitespace-nowrap"
            >
              <span>EXPLORE PRODUCTS</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

            <a
              href="#why-avn"
              className="btn-outline-dark flex-1 sm:flex-none sm:min-w-[240px] px-2.5 sm:px-7 py-3.5 rounded-xl font-heading font-bold text-[11px] sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1 sm:gap-2 group text-center whitespace-nowrap"
            >
              <span>DISCOVER MORE</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
