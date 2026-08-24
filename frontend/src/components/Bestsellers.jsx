import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from '../data/products';
import ProductGraphic from './ProductGraphic';
export default function Bestsellers({ products = DEFAULT_PRODUCTS, onAddToCart, onSelectProduct, theme }) {

  const [activeCategory, setActiveCategory] = useState('ALL PRODUCTS');

  const productList = products && products.length > 0 ? products : DEFAULT_PRODUCTS;

  
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
const filteredProducts = activeCategory === 'ALL PRODUCTS'
    ? productList
    : productList.filter(p => p.category === activeCategory);


  return (
    <section id="products" className="py-6 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1536px] mx-auto space-y-6">


      {/* Section Header */}
      <div className="text-center space-y-2">
        <p className="text-sm sm:text-base md:text-lg font-sans font-extrabold tracking-widest text-[#FF1E27] uppercase">
          OUR BESTSELLERS
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)]">
          GEAR THAT POWERS YOU
        </h2>
        {/* Red Dash Under Heading (No Glow) */}
        <div className="w-12 h-[3px] bg-[#FF1E27] mx-auto rounded-full mt-3" />
      </div>

      {/* Category Filter Navigation Bar */}
      <div className="flex overflow-x-auto justify-start sm:justify-center gap-2 sm:gap-8 pb-2 pt-2 px-1 scrollbar-none">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 uppercase cursor-pointer ${isActive
                ? 'text-[var(--text-main)] font-extrabold'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] font-bold'
                }`}
            >
              {/* Tab Title */}
              <span className="relative z-10 text-xs sm:text-sm tracking-wider font-heading whitespace-nowrap">
                {category}
              </span>

              {/* Clean Red Dash Under Active Category Tab */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-[2.5px] bg-[#FF1E27] rounded-full z-10" />
              )}
            </button>
          );
        })}
      </div>

      {/* Products Carousel / Grid Layout with Arrow Controls */}
      <div className="relative">

        {/* Left Arrow Button - Placed Outside Margin */}
        <button
          aria-label="Previous" onClick={() => handleScroll("left")}
          className="absolute -left-5 md:-left-7 lg:-left-10 xl:-left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-white hover:border-[#FF1E27] hover:bg-[#FF1E27] flex items-center justify-center backdrop-blur-md transition-all shadow-xl hidden md:flex cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow Button - Placed Outside Margin */}
        <button
          aria-label="Next" onClick={() => handleScroll("right")}
          className="absolute -right-5 md:-right-7 lg:-right-10 xl:-right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-white hover:border-[#FF1E27] hover:bg-[#FF1E27] flex items-center justify-center backdrop-blur-md transition-all shadow-xl hidden md:flex cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Product Cards Grid */}
        <div ref={scrollRef} className="flex items-stretch gap-5 overflow-x-auto scroll-smooth scrollbar-none py-3 px-1 snap-x snap-mandatory">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="red-corner-border bg-[var(--bg-main)] rounded-2xl p-4 flex flex-col justify-between space-y-4 group cursor-pointer hover:shadow-[0_10px_30px_-10px_rgba(255,30,39,0.45)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden shrink-0 w-[calc(85%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] snap-start"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Visual */}
              <ProductGraphic
                image={product.image}
                imageLight={product.imageLight}
                type={product.imageType}
                theme={theme}
                className="w-full h-56 rounded-xl"
              />

              {/* Product Info & Action matching Reference Screenshot */}
              <div className="flex items-end justify-between pt-1 gap-2">
                {/* Left Stacked Text: Title on Top, Price Below */}
                <div className="space-y-1 text-left">
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[var(--text-main)] font-sans font-black italic uppercase group-hover:text-[#FF1E27] transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-base sm:text-lg font-extrabold text-[var(--text-main)] font-heading tracking-tight leading-none">
                    ₹{product.price}
                  </p>
                </div>

                {/* Right Inward Glow Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  aria-label={`Add ${product.name} to cart`}
                  className="w-10 h-10 rounded-xl btn-cart-inward-glow flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5 filter drop-shadow-[0_0_4px_rgba(255,30,39,0.4)]" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
