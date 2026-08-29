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
    <section id="products" className="pt-6 pb-1 sm:pb-4 lg:py-6 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1536px] mx-auto space-y-2 lg:space-y-4">

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
                      ? 'shadow-xl border-2 border-[#FF1E27]'
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

      {/* DESKTOP ONLY (>= 640px): 1-to-1 Match of Reference Design media_1787761038166.png */}
      <div className="hidden sm:block relative py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 max-w-[1380px] mx-auto px-4 select-none">
          {categoryCards.map((category) => {
            const isHovered = hoveredCardId === category.id;
            const hasAnyHover = hoveredCardId !== null;

            // When no card is hovered, all cards remain 100% normal & equal. Effect triggers ONLY on hover!
            let cardStateClasses = 'scale-100 z-10 opacity-100 filter blur-none brightness-100';
            if (hasAnyHover) {
              if (isHovered) {
                // Prominently enlarged active card with AVN red border highlight
                cardStateClasses = 'scale-[1.08] -translate-y-3 z-30 opacity-100 border-2 border-[#FF1E27] shadow-xl filter blur-none';
              } else {
                // Inactive cards: Strictly 100% scale (no reduction, no position shift), blurred softly
                cardStateClasses = 'scale-100 z-10 opacity-75 filter blur-[1.8px]';
              }
            }

            return (
              <div
                key={category.id}
                onMouseEnter={() => setHoveredCardId(category.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => handleCategoryClick(category.categoryQuery)}
                className={`red-corner-border bg-[var(--bg-main)] rounded-3xl relative h-[380px] lg:h-[430px] overflow-hidden group cursor-pointer transition-all duration-500 ease-out transform-gpu flex flex-col justify-end p-6 shadow-xl ${cardStateClasses}`}
              >
                {/* 100% Full-Bleed Product Graphic Background */}
                <div className="absolute inset-[2px] rounded-[22px] overflow-hidden bg-[var(--bg-main)] flex flex-col justify-between">
                  {/* Product Graphic Center Stage with Seamless Background Blending */}
                  <div className="relative z-10 w-full h-[70%] pt-6 px-6 flex items-center justify-center transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out">
                    <ProductGraphic
                      image={category.sampleImage}
                      imageLight={category.sampleImageLight}
                      type={category.imageType}
                      theme={theme}
                      className="max-w-full max-h-full object-contain filter contrast-105"
                    />
                  </div>

                  {/* Soft Gradient Fade for Seamless Card Base Blending */}
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/75 to-transparent pointer-events-none z-0" />
                </div>

                {/* Bottom Left Overlay Typography matching reference image */}
                <div className="relative z-10 space-y-1 text-left">
                  <p className={`text-xs font-bold tracking-widest uppercase font-sans transition-colors duration-300 ${
                    isHovered ? 'text-[#FF1E27]' : 'text-[var(--text-sub)]'
                  }`}>
                    {category.name}
                  </p>
                  <h3 className={`text-xl lg:text-2xl font-sans font-black italic uppercase tracking-wide leading-tight transition-all duration-300 text-[var(--text-main)] ${
                    isHovered ? 'scale-105 origin-left text-[#FF1E27]' : ''
                  }`}>
                    {category.subtitle}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}