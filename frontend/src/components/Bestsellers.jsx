import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import ProductGraphic from './ProductGraphic';

export default function Bestsellers({ products = DEFAULT_PRODUCTS, onNavigateSearch, theme }) {
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const scrollRef = useRef(null);

  // Map representative categories with valid public image paths
  const categoryCards = [
    {
      id: 'knee-support',
      name: 'KNEE SUPPORT',
      subtitle: 'Max Compression & Joint Stability',
      categoryQuery: 'KNEE SUPPORT',
      imageType: 'knee-wrap',
      sampleImage: products?.find(p => p.category === 'KNEE SUPPORT')?.image || '/knee-wrap.png',
      sampleImageLight: products?.find(p => p.category === 'KNEE SUPPORT')?.imageLight || products?.find(p => p.category === 'KNEE SUPPORT')?.image || '/knee-wrap.png',
    },
    {
      id: 'wrist-support',
      name: 'WRIST SUPPORT',
      subtitle: 'Heavy Duty Joint Lock & Wraps',
      categoryQuery: 'WRIST SUPPORT',
      imageType: 'wrist-wrap',
      sampleImage: products?.find(p => p.category === 'WRIST SUPPORT')?.image || '/wrist-wrap.png',
      sampleImageLight: products?.find(p => p.category === 'WRIST SUPPORT')?.imageLight || products?.find(p => p.category === 'WRIST SUPPORT')?.image || '/wrist-wrap.png',
    },
    {
      id: 'lifting-accessories',
      name: 'LIFTING ACCESSORIES',
      subtitle: 'Power Straps, Belts & Grip Gear',
      categoryQuery: 'LIFTING ACCESSORIES',
      imageType: 'lifting-straps',
      sampleImage: products?.find(p => p.category === 'LIFTING ACCESSORIES')?.image || '/lifting-straps.png',
      sampleImageLight: products?.find(p => p.category === 'LIFTING ACCESSORIES')?.imageLight || products?.find(p => p.category === 'LIFTING ACCESSORIES')?.image || '/lifting-straps.png',
    },
    {
      id: 'yoga-accessories',
      name: 'YOGA ACCESSORIES',
      subtitle: 'Non-Slip Mats & Support Blocks',
      categoryQuery: 'YOGA ACCESSORIES',
      imageType: 'yoga-mat',
      sampleImage: products?.find(p => p.category === 'YOGA ACCESSORIES')?.image || '/yoga-mat.png',
      sampleImageLight: products?.find(p => p.category === 'YOGA ACCESSORIES')?.imageLight || products?.find(p => p.category === 'YOGA ACCESSORIES')?.image || '/yoga-mat.png',
    }
  ];

  const totalCategories = categoryCards.length;

  const handleCategoryClick = (categoryQuery) => {
    if (onNavigateSearch) {
      onNavigateSearch(categoryQuery);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/search?category=${encodeURIComponent(categoryQuery)}`;
    }
  };

  // Touch Swipe Handlers for Infinite 3D Mobile Cover Flow Carousel
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 30) {
      // Infinite Next (wraps around to 0)
      setActiveMobileIndex(prev => (prev + 1) % totalCategories);
    } else if (distance < -30) {
      // Infinite Prev (wraps around to totalCategories - 1)
      setActiveMobileIndex(prev => (prev - 1 + totalCategories) % totalCategories);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section id="products" className="py-6 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1536px] mx-auto space-y-4">

      {/* Section Header */}
      <div className="text-center space-y-2">
        <p className="text-xs sm:text-base md:text-lg font-sans font-extrabold tracking-widest text-[#FF1E27] uppercase">
          EXPLORE CATEGORIES
        </p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)]">
          GEAR THAT POWERS YOU
        </h2>
        {/* Red Dash Under Heading */}
        <div className="w-12 h-[3px] bg-[#FF1E27] mx-auto rounded-full mt-3" />
      </div>

      {/* MOBILE ONLY (< 640px): Infinite 3D Cover Flow perspective Carousel with Floor Reflection (No Dots / Arrows) */}
      <div className="block sm:hidden relative py-4 overflow-hidden">
        <div
          className="relative h-[360px] w-full flex items-center justify-center [perspective:1000px] overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {categoryCards.map((category, index) => {
            // Shortest circular offset for seamless infinite loop from left and right
            let diff = index - activeMobileIndex;
            if (diff > totalCategories / 2) diff -= totalCategories;
            if (diff < -totalCategories / 2) diff += totalCategories;

            const isActive = diff === 0;

            // 3D Perspective Transforms
            let translateX = diff * 110;
            let rotateY = diff < 0 ? 38 : diff > 0 ? -38 : 0;
            let scale = isActive ? 1 : Math.max(0.72, 1 - Math.abs(diff) * 0.18);
            let opacity = isActive ? 1 : Math.max(0.4, 1 - Math.abs(diff) * 0.35);
            let zIndex = 30 - Math.abs(diff) * 10;

            return (
              <div
                key={category.id}
                onClick={() => {
                  if (isActive) {
                    handleCategoryClick(category.categoryQuery);
                  } else {
                    setActiveMobileIndex(index);
                  }
                }}
                className="absolute top-2 w-[265px] transition-all duration-500 ease-out transform-gpu cursor-pointer"
                style={{
                  transform: `translate3d(${translateX}px, 0, ${isActive ? 0 : -90}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                }}
              >
                {/* Primary Card */}
                <div
                  className={`red-corner-border bg-[var(--bg-main)] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl transition-all duration-300 ${
                    isActive
                      ? 'shadow-[0_15px_35px_rgba(255,30,39,0.35)] border-2 border-[#FF1E27]'
                      : 'border border-[var(--border-subtle)]'
                  }`}
                >
                  {/* Category Image */}
                  <ProductGraphic
                    image={category.sampleImage}
                    imageLight={category.sampleImageLight}
                    type={category.imageType}
                    theme={theme}
                    className="w-full h-44 rounded-xl overflow-hidden"
                  />

                  {/* Card Details */}
                  <div className="flex items-end justify-between pt-1 gap-2">
                    <div className="space-y-0.5 text-left">
                      <h3 className="text-xs font-extrabold tracking-wider text-[var(--text-main)] font-sans font-black italic uppercase text-[#FF1E27] leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-[10px] text-[var(--text-sub)] font-normal leading-tight">
                        {category.subtitle}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-lg btn-glow-red flex items-center justify-center shrink-0 text-white">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Mirrored 3D Floor Reflection Effect */}
                <div
                  aria-hidden="true"
                  className="w-full transform scale-y-[-1] opacity-30 filter blur-[1px] pointer-events-none mt-1 [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
                >
                  <ProductGraphic
                    image={category.sampleImage}
                    imageLight={category.sampleImageLight}
                    type={category.imageType}
                    theme={theme}
                    className="w-full h-20 rounded-xl overflow-hidden"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DESKTOP ONLY (>= 640px): Standard Grid / Horizontal Carousel */}
      <div className="hidden sm:block relative py-2">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth scrollbar-none pt-8 pb-8 px-4 sm:px-6 snap-x snap-mandatory overflow-y-visible"
        >
          {categoryCards.map((category, index) => {
            const isHovered = hoveredCardId === category.id;
            const isFirst = index === 0;
            const isLast = index === categoryCards.length - 1;

            let hoverTransform = 'scale-[1.12] -translate-y-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 border-[#FF1E27]';
            if (isFirst) {
              hoverTransform = 'scale-[1.12] origin-left translate-x-1 -translate-y-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 border-[#FF1E27]';
            } else if (isLast) {
              hoverTransform = 'scale-[1.12] origin-right -translate-x-1 -translate-y-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 border-[#FF1E27]';
            }

            return (
              <div
                key={category.id}
                onMouseEnter={() => setHoveredCardId(category.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => handleCategoryClick(category.categoryQuery)}
                className={`red-corner-border bg-[var(--bg-main)] rounded-3xl p-5 flex flex-col justify-between space-y-4 group cursor-pointer transition-all duration-500 ease-out transform-gpu shrink-0 sm:w-[calc(50%-10px)] md:w-[calc(33.333%-12px)] lg:w-[calc(25%-12px)] snap-start ${
                  isHovered
                    ? hoverTransform
                    : 'scale-100 z-10 opacity-100 shadow-md'
                }`}
              >
                {/* Category Product Visual */}
                <ProductGraphic
                  image={category.sampleImage}
                  imageLight={category.sampleImageLight}
                  type={category.imageType}
                  theme={theme}
                  className="w-full h-56 rounded-2xl overflow-hidden"
                />

                {/* Category Title & Red Explore Button */}
                <div className="flex items-end justify-between pt-1 gap-2">
                  <div className="space-y-1 text-left">
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[var(--text-main)] font-sans font-black italic uppercase group-hover:text-[#FF1E27] transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-[var(--text-sub)] font-normal leading-tight">
                      {category.subtitle}
                    </p>
                  </div>

                  {/* Explore Category Arrow Button */}
                  <div className="w-10 h-10 rounded-xl btn-cart-inward-glow flex items-center justify-center shrink-0 group-hover:bg-[#FF1E27] group-hover:text-white transition-all">
                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
