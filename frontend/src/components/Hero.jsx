import React from 'react';
import { ArrowRight } from 'lucide-react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function Hero({ onExploreClick, theme }) {
  const currentLogo = theme === 'light' ? logoRedBlack : logoWhite;

  return (
    <section id="home" className="relative min-h-[calc(100vh-80px)] flex items-center pt-4 pb-4 overflow-hidden bg-[var(--bg-main)]">
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left z-10">
            <p className="font-sans text-[11px] sm:text-[12px] font-extrabold tracking-[3px] text-[#FF1E27] uppercase pl-1 sm:pl-1.5">
              BUILT TO SUPPORT. DESIGNED TO PERFORM.
            </p>

            <h1 className="font-sans font-black italic text-5xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.98] uppercase">
              <span className="block text-[var(--text-main)] tracking-wide">STRONGER</span>
              <span className="block text-[#FF1E27] py-0.5 tracking-wide">
                SUPPORT.
              </span>
              <span className="block text-[var(--text-main)] tracking-wider">BETTER YOU.</span>
            </h1>

            <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              Premium gear for lifters, athletes and everyday warriors.<br className="hidden sm:block" />
              Engineered for comfort. Built for performance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#products"
                onClick={onExploreClick}
                className="btn-glow-red px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white flex items-center gap-2 group cursor-pointer shadow-[0_0_20px_rgba(255,30,39,0.5)]">
                  <span>EXPLORE PRODUCTS</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#why-avn"
                className="btn-outline-dark px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 group">
                  <span>DISCOVER MORE</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Side Clean Red Ring & Logo (No Glow Effect) */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-6 sm:py-10">
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] rounded-full border-[4px] sm:border-[5px] border-[#FF1E27] flex items-center justify-center">
              <div className="p-8 flex items-center justify-center">
                <img
                  src={currentLogo}
                  alt="AVN Athletics"
                  className="w-48 sm:w-60 lg:w-72 h-auto object-contain"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
