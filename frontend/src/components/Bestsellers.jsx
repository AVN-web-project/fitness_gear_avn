import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import ProductGraphic from './ProductGraphic';

export default function Bestsellers({ products = DEFAULT_PRODUCTS, onNavigateSearch, theme }) {
  const [hoveredCardId, setHoveredCardId] = useState(null);
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

  const handleCategoryClick = (categoryQuery) => {
    if (onNavigateSearch) {
      onNavigateSearch(categoryQuery);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/search?category=${encodeURIComponent(categoryQuery)}`;
    }
  };

  return (
    <section id="products" className="py-6 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1536px] mx-auto space-y-4">

      {/* Section Header */}
      <div className="text-center space-y-2">
        <p className="text-sm sm:text-base md:text-lg font-sans font-extrabold tracking-widest text-[#FF1E27] uppercase">
          EXPLORE CATEGORIES
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)]">
          GEAR THAT POWERS YOU
        </h2>
        {/* Red Dash Under Heading */}
        <div className="w-12 h-[3px] bg-[#FF1E27] mx-auto rounded-full mt-3" />
      </div>

      {/* Product Category Cards Carousel Container */}
      <div className="relative py-2">

        {/* Category Cards Carousel Grid */}
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
                className={`red-corner-border bg-[var(--bg-main)] rounded-3xl p-5 flex flex-col justify-between space-y-4 group cursor-pointer transition-all duration-500 ease-out transform-gpu shrink-0 w-[calc(85%-10px)] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-12px)] lg:w-[calc(25%-12px)] snap-start ${
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
