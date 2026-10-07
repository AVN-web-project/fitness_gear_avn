import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, theme }) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroCoverRef = useRef(null);
  const heroBottomCoverRef = useRef(null);

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

  useEffect(() => {
    const image = heroImageRef.current;
    const cover = heroCoverRef.current;
    const bottomCover = heroBottomCoverRef.current;
    const container = cover?.parentElement;
    if (!image || !cover || !bottomCover || !container) return;

    const updateCover = () => {
      if (!image.naturalWidth || !image.naturalHeight || !image.clientWidth || !image.clientHeight) return;

      const imageRect = image.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const fitScale = Math.min(image.clientWidth / image.naturalWidth, image.clientHeight / image.naturalHeight);
      const renderedWidth = image.naturalWidth * fitScale;
      const renderedHeight = image.naturalHeight * fitScale;
      const scaleX = image.offsetWidth ? imageRect.width / image.offsetWidth : 1;
      const scaleY = image.offsetHeight ? imageRect.height / image.offsetHeight : 1;

      const coverLeft = imageRect.left - containerRect.left + ((image.clientWidth - renderedWidth) / 2) * scaleX;
      const coverTop = imageRect.top - containerRect.top + ((image.clientHeight - renderedHeight) / 2) * scaleY;
      const coverWidth = renderedWidth * scaleX;
      const imageHeight = renderedHeight * scaleY;
      const topCoverHeight = imageHeight * 0.4;
      const bottomCoverHeight = imageHeight * 0.3;

      [cover, bottomCover].forEach((element) => {
        element.style.left = `${coverLeft}px`;
        element.style.width = `${coverWidth}px`;
      });
      cover.style.top = `${coverTop}px`;
      cover.style.height = `${topCoverHeight}px`;
      bottomCover.style.top = `${coverTop + imageHeight - bottomCoverHeight}px`;
      bottomCover.style.height = `${bottomCoverHeight}px`;
    };

    updateCover();
    const resizeObserver = new ResizeObserver(updateCover);
    resizeObserver.observe(image);
    resizeObserver.observe(container);
    image.addEventListener('load', updateCover);
    window.addEventListener('resize', updateCover);

    return () => {
      resizeObserver.disconnect();
      image.removeEventListener('load', updateCover);
      window.removeEventListener('resize', updateCover);
    };
  }, [isLight]);

  const scrollRatio = Math.min(1, Math.max(0, scrollY / 300));

  return (
    <section id="home" className={`relative min-h-[100dvh] lg:min-h-screen ${isLight ? 'pt-[80px] sm:pt-24 lg:-mt-20 lg:pt-24 xl:pt-28' : '-mt-20 pt-20 sm:pt-24 lg:pt-24 xl:pt-28'} pb-12 sm:pb-16 lg:pb-16 flex items-start lg:items-center overflow-hidden bg-[var(--bg-main)]`}>
      {/* 1. Background Layer */}
      {isLight ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg-main)]">
          {/* Base Studio Atmosphere Lighting behind the 3D Stage (Desktop) */}
          <div className="hidden lg:block absolute inset-0 bg-[radial-gradient(ellipse_at_72%_55%,rgba(255,30,39,0.045)_0%,rgba(242,245,249,0.75)_35%,var(--bg-main)_80%)]" />
          <div className="hidden lg:block absolute top-1/4 right-[12%] w-[480px] h-[480px] bg-[#FF1E27]/[0.035] rounded-full blur-3xl pointer-events-none" />
          <div className="hidden lg:block absolute bottom-1/4 right-[25%] w-[380px] h-[380px] bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Top-to-Bottom Background Color Transition (behind stage on desktop) */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[var(--bg-main)] via-transparent to-[var(--bg-main)]/80 pointer-events-none z-[1]" />

          {/* Light Theme Hero Stage Image: Full Unclipped Background on Mobile, Locked Stage on Desktop */}
          <div className="absolute inset-0 lg:left-auto lg:top-0 lg:right-0 lg:bottom-0 w-full lg:w-[58%] xl:w-[64%] flex items-center justify-center lg:justify-end pointer-events-none overflow-visible lg:overflow-hidden z-10 lg:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.4)_2%,black_5%,black_100%),linear-gradient(to_bottom,transparent_0%,black_4%,black_94%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.4)_2%,black_5%,black_100%),linear-gradient(to_bottom,transparent_0%,black_4%,black_94%,transparent_100%)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]">
            <img
              ref={heroImageRef}
              src="/avn-hero-light-3.png"
              alt="AVN Hero Light Stage & Logo"
              className="hero-mobile-edge-fade w-full h-full object-contain object-center lg:object-right origin-center lg:origin-right scale-100 lg:scale-[1.02] xl:scale-[1.05] translate-y-0 lg:translate-x-1 xl:translate-x-0 transform-gpu opacity-100 mix-blend-multiply filter contrast-[1.06] saturate-[1.06] transition-all duration-700 pointer-events-none"
            />
            <div ref={heroCoverRef} className="hero-mobile-cover hero-mobile-cover-top lg:hidden" />
            <div ref={heroBottomCoverRef} className="hero-mobile-cover hero-mobile-cover-bottom lg:hidden" />
          </div>

          {/* Seamless Bottom Gradient Fade into FeatureBar (Desktop) */}
          <div className="hidden lg:block absolute bottom-0 inset-x-0 h-24 sm:h-32 lg:h-20 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/70 sm:via-[var(--bg-main)]/30 to-transparent pointer-events-none z-20" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="relative w-full h-full">

            {/* Base Layer: 3D Stage & Athlete Overlay (Full Unclipped Background on Mobile, Locked Stage on Desktop) */}
            <div className="absolute inset-0 lg:left-auto lg:top-0 lg:right-0 lg:bottom-0 w-full lg:w-[58%] xl:w-[64%] flex items-center justify-center lg:justify-end pointer-events-none overflow-visible lg:overflow-hidden z-0 lg:[mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_100%),linear-gradient(to_bottom,black_0%,black_85%,transparent_99%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_100%),linear-gradient(to_bottom,black_0%,black_65%,transparent_98%)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]">
              <img
                ref={heroImageRef}
                src="/avn-hero-4.png"
                alt="AVN Hero Stage & Logo"
                className="hero-mobile-edge-fade w-full h-full object-contain object-center lg:object-right origin-center lg:origin-right scale-100 lg:scale-[1.02] xl:scale-[1.05] translate-y-0 lg:translate-x-1 xl:translate-x-0 transform-gpu opacity-100 filter brightness-[1.05] contrast-[1.08] saturate-[1.12] transition-all duration-700"
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
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08] transform-gpu z-30 mix-blend-screen opacity-85 filter brightness-[1.1] contrast-[1.15] saturate-[1.25] pointer-events-none"
            >
              <source src="/blazing-effect.mp4" type="video/mp4" />
            </video>
            <div ref={heroCoverRef} className="hero-mobile-cover hero-mobile-cover-top lg:hidden" />
            <div ref={heroBottomCoverRef} className="hero-mobile-cover hero-mobile-cover-bottom lg:hidden" />

          </div>

          {/* Soft Left-Side Vignette for Crisp Text Contrast (Desktop) */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[var(--bg-main)]/85 via-[var(--bg-main)]/35 to-transparent z-20" />

          {/* Seamless Soft Gradient Fade at Bottom of Hero Section to Blend directly into FeatureBar (Desktop only) */}
          <div className="hidden lg:block absolute bottom-0 inset-x-0 h-32 sm:h-28 lg:h-20 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 sm:via-[var(--bg-main)]/35 to-transparent pointer-events-none z-20" />
        </div>
      )}

      {/* 2. Hero Content Overlay */}
      <div
        className="relative z-20 max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-16 xl:px-20 w-full pt-0 sm:pt-1 lg:pt-0"
      >
        <div className="max-w-xl lg:max-w-[490px] xl:max-w-[570px] space-y-4 sm:space-y-6 text-left">
          <div>
            <p className="font-sans text-[11px] sm:text-[12px] font-extrabold tracking-[3px] text-[#FF1E27] uppercase pl-1 sm:pl-1.5 pb-1 sm:pb-0">
              BUILT TO SUPPORT. DESIGNED TO PERFORM.
            </p>

            <h1 className="-mt-1 sm:mt-0 font-sans font-black italic text-4xl sm:text-6xl md:text-7xl lg:text-[68px] xl:text-[76px] 2xl:text-[80px] leading-[1.04] sm:leading-[1.02] lg:leading-[0.98] tracking-tight sm:tracking-[-0.015em] uppercase">
              <span className="block text-[var(--text-main)] drop-shadow-sm">STRONGER</span>
              <span className="block text-[#FF1E27] py-0.5 drop-shadow-sm">
                SUPPORT.
              </span>
              <span className="block text-[var(--text-main)] drop-shadow-sm whitespace-nowrap">BETTER YOU.</span>
            </h1>
          </div>

          {/* Subtitle & Buttons: Positioned cleanly below the stage on mobile, normal stacked spacing on desktop */}
          <div className="pt-[32vh] xs:pt-[35vh] sm:pt-[38vh] lg:pt-0 space-y-4 sm:space-y-6">
            <p className="text-[var(--text-sub)] text-sm sm:text-base md:text-lg leading-[1.7] sm:leading-relaxed lg:leading-relaxed font-normal max-w-lg lg:max-w-md xl:max-w-lg">
              Premium gear for lifters, athletes and everyday warriors.<br className="hidden sm:block" />
              Engineered for comfort. Built for performance.
            </p>

            {/* Hero Action Buttons (Side by Side 50/50 Grid on Mobile, Flex on Desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-1 w-full sm:w-auto">
              <a
                href="#products"
                onClick={onExploreClick}
                className="btn-glow-red flex-1 sm:flex-none sm:min-w-[240px] px-2.5 sm:px-7 py-3.5 rounded-xl font-heading font-bold text-[11px] sm:text-sm tracking-wider uppercase text-white flex items-center justify-center gap-1 sm:gap-2 group cursor-pointer text-center whitespace-nowrap shadow-md"
              >
                <span>EXPLORE PRODUCTS</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
              </a>

              <a
                href="#why-avn"
                className="btn-outline-dark flex-1 sm:flex-none sm:min-w-[240px] px-2.5 sm:px-7 py-3.5 rounded-xl font-heading font-bold text-[11px] sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1 sm:gap-2 group text-center whitespace-nowrap shadow-sm"
              >
                <span>DISCOVER MORE</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
