import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Star,
  ShoppingBag,
  Eye,
  ArrowUpDown,
  Grid,
  List,
  RotateCcw,
  Tag,
  Sparkles,
  ChevronLeft,
  Filter
} from 'lucide-react';
import ProductGraphic from './ProductGraphic';
import { fetchSearchProducts } from '../services/api';
import { PRODUCTS as LOCAL_PRODUCTS, CATEGORIES as LOCAL_CATEGORIES } from '../data/products';

export default function SearchPage({
  onSelectProduct,
  onAddToCart,
  onOpenCart,
  theme = 'dark'
}) {
  // --- 1. SEO & URL Synchronization State ---
  const parseUrlParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      category: params.get('category') || 'ALL PRODUCTS',
      ageGroup: params.get('ageGroup') || 'ALL',
      gender: params.get('gender') || 'ALL',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      discount: params.get('discount') === 'true',
      sort: params.get('sort') || 'reviews',
      page: parseInt(params.get('page') || '1', 10) || 1,
      viewMode: params.get('viewMode') || 'grid'
    };
  };

  const initialUrlState = parseUrlParams();

  const [searchQuery, setSearchQuery] = useState(initialUrlState.q);
  const [selectedCategory, setSelectedCategory] = useState(initialUrlState.category);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(initialUrlState.ageGroup);
  const [selectedGender, setSelectedGender] = useState(initialUrlState.gender);
  const [minPrice, setMinPrice] = useState(initialUrlState.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialUrlState.maxPrice);
  const [discountOnly, setDiscountOnly] = useState(initialUrlState.discount);
  const [sortMode, setSortMode] = useState(initialUrlState.sort);
  const [currentPage, setCurrentPage] = useState(initialUrlState.page);
  const [viewLayout, setViewLayout] = useState(initialUrlState.viewMode);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync state to URL search parameters without page reload
  const updateUrlParams = useCallback((newParams) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const params = url.searchParams;

    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== false && val !== 'ALL' && val !== 'ALL PRODUCTS' && !(key === 'page' && val === 1) && !(key === 'sort' && val === 'reviews') && !(key === 'viewMode' && val === 'grid')) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    const newRelativePathQuery = url.pathname + (params.toString() ? `?${params.toString()}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, []);

  useEffect(() => {
    updateUrlParams({
      q: searchQuery,
      category: selectedCategory,
      ageGroup: selectedAgeGroup,
      gender: selectedGender,
      minPrice,
      maxPrice,
      discount: discountOnly,
      sort: sortMode,
      page: currentPage,
      viewMode: viewLayout
    });
  }, [searchQuery, selectedCategory, selectedAgeGroup, selectedGender, minPrice, maxPrice, discountOnly, sortMode, currentPage, viewLayout, updateUrlParams]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const p = parseUrlParams();
      setSearchQuery(p.q);
      setSelectedCategory(p.category);
      setSelectedAgeGroup(p.ageGroup);
      setSelectedGender(p.gender);
      setMinPrice(p.minPrice);
      setMaxPrice(p.maxPrice);
      setDiscountOnly(p.discount);
      setSortMode(p.sort);
      setCurrentPage(p.page);
      setViewLayout(p.viewMode);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- 2. Query Payload Fetcher (API with Local Fallback) ---
  useEffect(() => {
    let isMounted = true;
    async function loadSearchResults() {
      setLoading(true);
      const res = await fetchSearchProducts({
        q: searchQuery,
        category: selectedCategory,
        ageGroup: selectedAgeGroup,
        gender: selectedGender,
        minPrice,
        maxPrice,
        discount: discountOnly,
        sort: sortMode,
        page: currentPage,
        limit: 8
      });

      if (isMounted) {
        if (res && res.success) {
          setApiData(res);
        } else {
          setApiData(null); // Fallback to client calculations
        }
        setLoading(false);
      }
    }

    loadSearchResults();
    return () => { isMounted = false; };
  }, [searchQuery, selectedCategory, selectedAgeGroup, selectedGender, minPrice, maxPrice, discountOnly, sortMode, currentPage]);

  // --- 3. Client Fallback Pipeline Engine ---
  const fallbackResult = useMemo(() => {
    let list = LOCAL_PRODUCTS.filter((p) => p.status !== 'Discontinued');

    if (searchQuery.trim()) {
      const qLower = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(qLower) ||
          p.tagline?.toLowerCase().includes(qLower) ||
          p.description?.toLowerCase().includes(qLower) ||
          p.category?.toLowerCase().includes(qLower) ||
          (Array.isArray(p.specs) && p.specs.some((s) => s.toLowerCase().includes(qLower)))
      );
    }

    if (selectedCategory && selectedCategory.toUpperCase() !== 'ALL PRODUCTS' && selectedCategory.toUpperCase() !== 'ALL') {
      list = list.filter((p) => p.category.toUpperCase() === selectedCategory.toUpperCase());
    }

    if (selectedAgeGroup && selectedAgeGroup !== 'ALL') {
      list = list.filter((p) => !p.ageGroup || p.ageGroup.toUpperCase() === selectedAgeGroup.toUpperCase() || p.ageGroup.toUpperCase() === 'ALL AGES');
    }

    if (selectedGender && selectedGender !== 'ALL') {
      list = list.filter((p) => !p.gender || p.gender.toUpperCase() === selectedGender.toUpperCase() || p.gender.toUpperCase() === 'UNISEX');
    }

    if (minPrice !== '') {
      const minP = Number(minPrice);
      if (!isNaN(minP)) list = list.filter((p) => p.price >= minP);
    }

    if (maxPrice !== '') {
      const maxP = Number(maxPrice);
      if (!isNaN(maxP)) list = list.filter((p) => p.price <= maxP);
    }

    if (discountOnly) {
      list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Sort
    list.sort((a, b) => {
      if (sortMode === 'price_asc') return a.price - b.price;
      if (sortMode === 'price_desc') return b.price - a.price;
      if (sortMode === 'reviews') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      }
      return (b.rating * (b.reviewsCount || 1)) - (a.rating * (a.reviewsCount || 1));
    });

    const limit = 8;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const pageItems = list.slice((currentPage - 1) * limit, currentPage * limit);

    const categoryCounts = {};
    LOCAL_PRODUCTS.filter((p) => p.status !== 'Discontinued').forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    return {
      data: pageItems,
      total,
      totalPages,
      page: currentPage,
      limit,
      facets: {
        categories: categoryCounts,
        priceRange: { min: 399, max: 3499 },
        ageGroups: { Adults: 5, Teens: 1, 'All Ages': 1 },
        genders: { Unisex: 5, Men: 1, Women: 1 }
      }
    };
  }, [searchQuery, selectedCategory, selectedAgeGroup, selectedGender, minPrice, maxPrice, discountOnly, sortMode, currentPage]);

  const activeResult = apiData || fallbackResult;
  const productsList = activeResult.data || [];
  const totalProductsCount = activeResult.total || 0;
  const totalPagesCount = activeResult.totalPages || 1;
  const facetCounts = activeResult.facets || {};

  // Handlers for quick actions
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL PRODUCTS');
    setSelectedAgeGroup('ALL');
    setSelectedGender('ALL');
    setMinPrice('');
    setMaxPrice('');
    setDiscountOnly(false);
    setSortMode('reviews');
    setCurrentPage(1);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const popularKeywords = ['Knee Wrap', 'Wrist Wrap', 'Lifting Straps', 'Lever Belt', 'Yoga Belt'];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* Search Header Banner */}
      <div className="relative border-b border-[var(--border-subtle)] bg-[var(--bg-main)] py-10 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="max-w-[1536px] mx-auto relative z-10 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-sub)]">
            <span className="hover:text-[#FF1E27] cursor-pointer" onClick={handleResetFilters}>Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-sub)]" />
            <span className="text-[var(--text-main)] font-extrabold font-heading">Search Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-sans font-black italic tracking-tight uppercase flex items-center gap-3 text-[var(--text-main)]">
                <span>FIND ATHLETIC GEAR</span>
                <Sparkles className="w-7 h-7 text-[#FF1E27] animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-sub)] mt-1 max-w-xl font-medium">
                Compound multi-attribute filtering across categories, age groups, gender specs, price bounds, and active discounts.
              </p>
            </div>

            {/* Total Results Counter Badge */}
            <div className="flex items-center gap-3">
              <div className="glass-panel px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center gap-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF1E27]" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-sub)] tracking-wider">Catalog Matches</div>
                  <div className="text-lg font-black font-heading text-[#FF1E27]">
                    {totalProductsCount} <span className="text-xs text-[var(--text-main)] font-normal">Products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#FF1E27]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search knee wraps, competition wrist wraps, deadlift straps, lever belts..."
                className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl text-sm font-medium text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[#FF1E27] focus:ring-1 focus:ring-[#FF1E27] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1 rounded-full hover:bg-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Search Keyword Pills */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
              <span className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider">Popular Searches:</span>
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => {
                    setSearchQuery(kw);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === kw.toLowerCase()
                      ? 'bg-[#FF1E27] text-white shadow-sm'
                      : 'bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:border-[#FF1E27]/40'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Body Section */}
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        
        {/* Top Control Bar: Active Filter Chips, Sort Dropdown & Layout Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--border-subtle)]">
          
          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF1E27] text-white font-extrabold text-xs font-heading cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>FILTERS</span>
            </button>

            {/* Filter Chips */}
            {selectedCategory && selectedCategory !== 'ALL PRODUCTS' && selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Category: {selectedCategory}
                <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" onClick={() => setSelectedCategory('ALL PRODUCTS')} />
              </span>
            )}

            {selectedAgeGroup && selectedAgeGroup !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Age: {selectedAgeGroup}
                <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" onClick={() => setSelectedAgeGroup('ALL')} />
              </span>
            )}

            {selectedGender && selectedGender !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Gender: {selectedGender}
                <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" onClick={() => setSelectedGender('ALL')} />
              </span>
            )}

            {(minPrice !== '' || maxPrice !== '') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Price: ₹{minPrice || 0} - ₹{maxPrice || 'Max'}
                <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
              </span>
            )}

            {discountOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF1E27]/10 border border-[#FF1E27] text-xs font-bold text-[#FF1E27]">
                <Tag className="w-3 h-3" /> On Sale Only
                <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" onClick={() => setDiscountOnly(false)} />
              </span>
            )}

            {(selectedCategory !== 'ALL PRODUCTS' || selectedAgeGroup !== 'ALL' || selectedGender !== 'ALL' || minPrice !== '' || maxPrice !== '' || discountOnly || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[var(--text-sub)] hover:text-[#FF1E27] flex items-center gap-1 underline underline-offset-4 cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            )}
          </div>

          {/* Right Sorting & Layout Toggle Controls */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#FF1E27]" />
              <span className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <select
                value={sortMode}
                onChange={(e) => {
                  setSortMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-bold font-heading rounded-xl px-3 py-2 focus:outline-none focus:border-[#FF1E27] cursor-pointer"
              >
                <option value="reviews">⭐ Customer Reviews (Highest)</option>
                <option value="price_asc">🏷️ Price: Low to High</option>
                <option value="price_desc">🏷️ Price: High to Low</option>
                <option value="newest">✨ New Arrivals</option>
              </select>
            </div>

            {/* View Layout Switcher (Grid vs List) */}
            <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl p-1">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === 'grid'
                    ? 'bg-[#FF1E27] text-white shadow-sm'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-[#FF1E27] text-white shadow-sm'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Content Layout Grid (Filter Sidebar + Catalog Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-6 sticky top-28 shadow-xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-sans font-black italic tracking-wider uppercase text-[var(--text-main)] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#FF1E27]" />
                  <span>Compound Filters</span>
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-[#FF1E27] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* 1. Category Filter */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">Category</h4>
                <div className="space-y-1.5">
                  {LOCAL_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory.toUpperCase() === cat.toUpperCase();
                    const count = cat === 'ALL PRODUCTS' ? LOCAL_PRODUCTS.length : (facetCounts.categories?.[cat] || 0);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF1E27] text-white shadow-[0_0_10px_rgba(255,30,39,0.3)]'
                            : 'text-[var(--text-sub)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--border-subtle)] text-[var(--text-sub)]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Age Group Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">Age Group</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['ALL', 'Adults', 'Teens', 'All Ages'].map((age) => (
                    <button
                      key={age}
                      onClick={() => { setSelectedAgeGroup(age); setCurrentPage(1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        selectedAgeGroup === age
                          ? 'bg-[#FF1E27] text-white shadow-sm'
                          : 'bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Target Gender Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">Gender</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {['ALL', 'Unisex', 'Men', 'Women'].map((g) => (
                    <button
                      key={g}
                      onClick={() => { setSelectedGender(g); setCurrentPage(1); }}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                        selectedGender === g
                          ? 'bg-[#FF1E27] text-white shadow-sm'
                          : 'bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Price Range Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">Price Range (₹)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[#FF1E27]"
                  />
                  <span className="text-[var(--text-sub)] text-xs font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[#FF1E27]"
                  />
                </div>
              </div>

              {/* 5. Active Discount Toggle */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[#FF1E27] transition-colors flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#FF1E27]" />
                    <span>On Sale / Discounted</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => { setDiscountOnly(e.target.checked); setCurrentPage(1); }}
                    className="w-4 h-4 accent-[#FF1E27] cursor-pointer"
                  />
                </label>
              </div>

            </div>
          </aside>

          {/* Catalog Grid Section */}
          <main className="lg:col-span-3 space-y-6">
            
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#FF1E27] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold font-heading text-[var(--text-sub)] tracking-widest uppercase">Querying Product Pipeline...</p>
              </div>
            ) : productsList.length === 0 ? (
              
              /* Empty Search Results State */
              <div className="glass-panel p-12 rounded-3xl border border-[var(--border-subtle)] text-center space-y-6 my-8">
                <div className="w-20 h-20 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30 flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-[#FF1E27]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-sans font-black italic tracking-wider uppercase text-[var(--text-main)]">
                    No Matching Gear Found
                  </h3>
                  <p className="text-xs text-[var(--text-sub)] max-w-md mx-auto">
                    We couldn't find any products matching your specific compound filter criteria. Try clearing filters or broadening your search terms.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="btn-glow-red px-6 py-3 rounded-xl text-xs font-extrabold uppercase font-heading text-white inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>

            ) : (

              /* Product Grid / List Display */
              <div className={viewLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {productsList.map((product) => {
                  const isOutOfStock = product.status === 'Unavailable' || product.stockQuantity === 0;
                  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
                    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                    : null;

                  if (viewLayout === 'list') {
                    // List Item Layout
                    return (
                      <div
                        key={product.id}
                        className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/50 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group"
                      >
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                          <div
                            onClick={() => onSelectProduct(product)}
                            className="relative w-24 h-24 rounded-xl bg-[var(--bg-main)] overflow-hidden shrink-0 cursor-pointer p-2 flex items-center justify-center border border-[var(--border-subtle)]"
                          >
                            <ProductGraphic image={product.image} imageLight={product.imageLight} type={product.imageType} theme={theme} className="w-full h-full" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF1E27] font-heading">{product.category}</span>
                              {product.badge && (
                                <span className="bg-[#FF1E27] text-white text-[9px] font-black px-2 py-0.5 rounded font-heading">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h3
                              onClick={() => onSelectProduct(product)}
                              className="text-sm font-extrabold font-heading uppercase text-[var(--text-main)] hover:text-[#FF1E27] transition-colors cursor-pointer"
                            >
                              {product.name}
                            </h3>
                            <p className="text-xs text-[var(--text-sub)] line-clamp-1">{product.tagline}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF1E27] pt-1">
                              <Star className="w-3.5 h-3.5 fill-[#FF1E27] text-[#FF1E27]" />
                              <span>{product.rating}</span>
                              <span className="text-[10px] text-[var(--text-sub)]">({product.reviewsCount} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] gap-4">
                          <div className="text-left sm:text-right">
                            <div className="text-lg font-black font-heading text-[#FF1E27]">₹{product.price}</div>
                            {product.compareAtPrice && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-[var(--text-sub)] line-through">₹{product.compareAtPrice}</span>
                                {discountPercent && <span className="text-emerald-400 font-bold text-[10px]">-{discountPercent}%</span>}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectProduct(product)}
                              className="p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[#FF1E27] transition-colors cursor-pointer"
                              title="Quick View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isOutOfStock}
                              onClick={() => onAddToCart(product)}
                              className={`btn-glow-red px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading flex items-center gap-2 cursor-pointer shadow-md ${
                                isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-700' : ''
                              }`}
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Grid Item Card Layout
                  return (
                    <div
                      key={product.id}
                      className="glass-panel rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div
                          onClick={() => onSelectProduct(product)}
                          className="relative h-48 bg-[var(--bg-main)] p-4 flex items-center justify-center overflow-hidden cursor-pointer border-b border-[var(--border-subtle)]"
                        >
                          {/* Badge Overlay */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                            {product.badge && (
                              <span className="bg-[#FF1E27] text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md font-heading shadow-md">
                                {product.badge}
                              </span>
                            )}
                            {discountPercent && (
                              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono shadow-sm">
                                -{discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Availability Status Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            {isOutOfStock ? (
                              <span className="bg-rose-950/90 text-rose-300 border border-rose-800/80 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-heading">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Out of Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-heading">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> In Stock ({product.stockQuantity || 10})
                              </span>
                            )}
                          </div>

                          <ProductGraphic
                            image={product.image}
                            imageLight={product.imageLight}
                            type={product.imageType}
                            theme={theme}
                            className="w-full h-36"
                          />
                        </div>

                        {/* Product Info Details */}
                        <div className="p-4 space-y-2">
                          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF1E27] font-heading">
                            {product.category}
                          </div>
                          
                          <h3
                            onClick={() => onSelectProduct(product)}
                            className="text-xs font-black font-heading uppercase text-[var(--text-main)] line-clamp-1 hover:text-[#FF1E27] transition-colors cursor-pointer"
                          >
                            {product.name}
                          </h3>

                          {/* Rating Summary */}
                          <div className="flex items-center gap-1 text-xs font-bold text-[#FF1E27]">
                            <Star className="w-3.5 h-3.5 fill-[#FF1E27] text-[#FF1E27]" />
                            <span>{product.rating}</span>
                            <span className="text-[10px] text-[var(--text-sub)] font-medium">({product.reviewsCount})</span>
                          </div>

                          {/* Price Display */}
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-base font-black font-heading text-[#FF1E27]">₹{product.price}</span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-[var(--text-sub)] line-through font-medium">₹{product.compareAtPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-4 pt-0 grid grid-cols-4 gap-2">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="col-span-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:border-[#FF1E27] transition-colors flex items-center justify-center cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => onAddToCart(product)}
                          className={`col-span-3 btn-glow-red py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all ${
                            isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-700' : ''
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            )}

            {/* Pagination Controls */}
            {totalPagesCount > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-[var(--border-subtle)]">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)] hover:border-[#FF1E27] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPagesCount }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold font-heading transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#FF1E27] text-white shadow-sm'
                            : 'bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage >= totalPagesCount}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPagesCount, prev + 1))}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)] hover:border-[#FF1E27] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          
          <div className="relative w-80 max-w-[85vw] bg-[var(--bg-main)] border-r border-[var(--border-subtle)] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 text-[var(--text-main)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-sans font-black italic tracking-wider uppercase text-[var(--text-main)] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF1E27]" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">Category</h4>
                {LOCAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      handleCategorySelect(cat);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                      selectedCategory.toUpperCase() === cat.toUpperCase()
                        ? 'bg-[#FF1E27] text-white'
                        : 'text-[var(--text-sub)] hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Mobile Age Group */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">Age Group</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['ALL', 'Adults', 'Teens', 'All Ages'].map((age) => (
                    <button
                      key={age}
                      onClick={() => { setSelectedAgeGroup(age); setCurrentPage(1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center ${
                        selectedAgeGroup === age ? 'bg-[#FF1E27] text-white' : 'bg-[var(--bg-main)] text-[var(--text-sub)]'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Gender */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">Gender</h4>
                <div className="grid grid-cols-3 gap-1">
                  {['ALL', 'Unisex', 'Men', 'Women'].map((g) => (
                    <button
                      key={g}
                      onClick={() => { setSelectedGender(g); setCurrentPage(1); }}
                      className={`py-2 text-[11px] font-bold text-center rounded-xl ${
                        selectedGender === g ? 'bg-[#FF1E27] text-white' : 'bg-[var(--bg-main)] text-[var(--text-sub)]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Discount Toggle */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <label className="flex items-center justify-between text-xs font-bold">
                  <span>On Sale Only</span>
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => { setDiscountOnly(e.target.checked); setCurrentPage(1); }}
                    className="w-4 h-4 accent-[#FF1E27]"
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full btn-glow-red py-3 rounded-xl text-xs font-extrabold uppercase font-heading text-white shadow-md cursor-pointer"
              >
                Apply Filters ({totalProductsCount} Results)
              </button>
              <button
                onClick={() => { handleResetFilters(); setMobileFilterOpen(false); }}
                className="w-full py-2 text-xs font-bold text-[var(--text-sub)] hover:text-white"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
