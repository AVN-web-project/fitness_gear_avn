import React, { useState } from 'react';
import { X, Star, ShoppingCart, Check, ShieldCheck, Truck, RefreshCw, ExternalLink } from 'lucide-react';
import ProductGraphic from './ProductGraphic';

export default function ProductModal({ product, onClose, onAddToCart, onOpenFullPage }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart({ ...product, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleFullPageClick = () => {
    if (onOpenFullPage) {
      onOpenFullPage(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl text-[var(--text-main)] grid grid-cols-1 md:grid-cols-2">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[var(--bg-main)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[#FF1E27] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Product Visual */}
        <div className="p-6 bg-[var(--bg-main)] flex items-center justify-center border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
          <ProductGraphic image={product.image} imageLight={product.imageLight} type={product.imageType} className="w-full aspect-square rounded-xl" />
        </div>

        {/* Right Column: Product Details */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 text-left">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-block text-[10px] font-extrabold tracking-widest text-[#FF1E27] uppercase bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/30">
                {product.badge || 'PREMIUM GEAR'}
              </span>

              {onOpenFullPage && (
                <button
                  onClick={handleFullPageClick}
                  className="flex items-center gap-1 text-xs font-bold text-[#FF1E27] hover:underline"
                >
                  <span>Full View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h3 className="text-2xl font-extrabold font-heading tracking-wider uppercase text-[var(--text-main)]">
              {product.name}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex text-[#FF1E27]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[var(--text-sub)] font-medium">
                {product.rating} ({product.reviewsCount} reviews)
              </span>
            </div>

            <div className="text-3xl font-extrabold font-heading text-[var(--text-main)] pt-1">
              ₹{product.price}
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-sub)] leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Specifications list */}
            <div className="pt-2 space-y-1.5">
              <p className="text-xs font-bold text-[var(--text-sub)] uppercase font-heading">HIGHLIGHTS</p>
              {product.specs?.map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-sub)]">
                  <Check className="w-3.5 h-3.5 text-[#FF1E27] shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-main)] px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[var(--text-sub)] hover:text-[var(--text-main)] px-2 font-bold"
                >
                  -
                </button>
                <span className="px-3 font-extrabold font-heading text-sm text-[var(--text-main)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[var(--text-sub)] hover:text-[var(--text-main)] px-2 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 btn-cart-inward-glow py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO CART!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
            </div>

            {onOpenFullPage && (
              <button
                onClick={handleFullPageClick}
                className="w-full py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] hover:bg-[#FF1E27] hover:text-white text-xs font-bold font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>OPEN FULL PRODUCT PAGE</span>
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-[var(--text-sub)] text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#FF1E27]" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#FF1E27]" />
                <span>Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-[#FF1E27]" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
