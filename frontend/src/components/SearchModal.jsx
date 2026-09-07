import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import ProductGraphic from './ProductGraphic';

export default function SearchModal({
  isOpen,
  products = DEFAULT_PRODUCTS,
  categories = [],
  onClose,
  onSelectProduct,
  onOpenSearchPage,
  theme
}) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const productList = products && products.length > 0
    ? products.filter((p) => p.status !== 'Discontinued')
    : DEFAULT_PRODUCTS.filter((p) => p.status !== 'Discontinued');

  const results = query.trim() === ''
    ? productList
    : productList.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  const handleOpenFullSearch = () => {
    if (onOpenSearchPage) {
      onOpenSearchPage(query);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl text-[var(--text-main)]">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FF1E27] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleOpenFullSearch();
            }}
            placeholder="Search Knee Wraps, Wrist Wraps, Straps, Belts..."
            className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-sub)] hover:text-[var(--text-main)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Categories Filter Bar */}
        {categories && categories.length > 0 && (
          <div className="px-4 py-2.5 bg-[var(--bg-card-solid)] border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF1E27] font-heading shrink-0">
              CATEGORIES:
            </span>
            {categories.map((cat) => {
              const catName = cat.name || cat;
              return (
                <button
                  key={cat.slug || cat._id || catName}
                  type="button"
                  onClick={() => {
                    if (onOpenSearchPage) onOpenSearchPage(catName);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] hover:bg-[#FF1E27] hover:text-white border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-sub)] transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  {catName}
                </button>
              );
            })}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
          {results.length === 0 ? (
            <p className="text-center text-xs text-[var(--text-sub)] py-8">No matching fitness gear found.</p>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="glass-panel p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#FF1E27]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ProductGraphic image={product.image} imageLight={product.imageLight} type={product.imageType} theme={theme} className="w-12 h-12 rounded-lg" />
                  <div className="text-left">
                    <h4 className="text-xs font-sans font-black italic tracking-wider uppercase text-[var(--text-main)]">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-sub)]">
                      {typeof product.category === 'object' ? product.category?.name : product.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#FF1E27] font-heading">₹{product.price}</span>
                  <span className="text-xs text-[var(--text-sub)] font-medium hover:text-[var(--text-main)]">View &rarr;</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Link */}
        <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] text-center">
          <button
            onClick={handleOpenFullSearch}
            className="text-xs font-bold text-[#FF1E27] hover:underline font-heading tracking-wider uppercase cursor-pointer"
          >
            Explore Full Search Catalog & Compound Filters &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}

