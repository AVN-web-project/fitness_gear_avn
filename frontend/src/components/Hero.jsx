import React from 'react';
import { ArrowRight } from 'lucide-react';
import HeroStage3D from './HeroStage3D';

export default function Hero({ onExploreClick, theme }) {
  return (
    <section id="home" className="relative min-h-[calc(100vh-80px)] flex items-center pt-4 pb-4 overflow-hidden">
      {/* Background Neon Atmospheric Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[420px] bg-gradient-radial from-red-600/15 via-red-950/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[550px] h-[420px] bg-gradient-radial from-red-600/20 via-red-950/5 to-transparent blur-3xl pointer-events-none" />

      {/* Bottom Seamless Fade to Background */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent pointer-events-none z-10 transition-colors duration-300" />

      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left z-10">

            
            {/* Top Red Subtitle Eyebrow Badge */}
            <p className="font-sans text-[11px] sm:text-[12px] font-extrabold tracking-[3px] text-[#FF1E27] uppercase">
              BUILT TO SUPPORT. DESIGNED TO PERFORM.
            </p>

            {/* Main Headline with Sans-Serif Typography */}
            <h1 className="font-sans font-black italic text-5xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.98] uppercase">
              <span className="block text-[var(--text-main)] tracking-wide">STRONGER</span>
              <span className="block text-[#FF1E27] py-0.5 tracking-wide">
                SUPPORT.
              </span>
              <span className="block text-[var(--text-main)] tracking-wider">BETTER YOU.</span>
            </h1>

            {/* Paragraph Description */}
            <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              Premium gear for lifters, athletes and everyday warriors.<br className="hidden sm:block" />
              Engineered for comfort. Built for performance.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#products"
                onClick={onExploreClick}
                className="btn-glow-red px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white flex items-center gap-2 group cursor-pointer shadow-[0_0_20px_rgba(255,30,39,0.5)]"
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

          {/* Right 3D Pedestal Stage */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <HeroStage3D theme={theme} />
          </div>

        </div>
      </div>
    </section>
  );
}
