import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Star,
  ShoppingBag,
  Check,
  Eye,
  ArrowUpDown,
  Grid,
  List,
  RotateCcw,
  Tag,
  Sparkles,
  ChevronLeft,
  Filter,
} from "lucide-react";
import ProductGraphic from "../components/ProductGraphic";
import {
  PRODUCTS as LOCAL_PRODUCTS,
  CATEGORIES as LOCAL_CATEGORIES,
} from "../data/products";
import { useCart } from "../context/CartContext";
import { useLocation, useSearchParams } from "react-router-dom";

export default function SearchPage({
  products: propProducts,
  categories: propCategories,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
  theme = "dark",
}) {
  // --- 1. SEO & URL Synchronization State ---
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  // Track the URL that has been observed by this component. When the browser's
  // Back/Forward buttons change location.search, do not write the previous
  // render's filter state back over the destination URL before state restores.
  const lastObservedSearchRef = useRef(location.search);
  const { cartItems: cartItemsList } = useCart();
  const getProductCartQty = (product) => {
    const ids = [product?.id, product?.productId, product?.slug]
      .filter(Boolean)
      .map(String);
    return (cartItemsList || [])
      .filter((item) =>
        [item.id, item.productId, item.slug]
          .filter(Boolean)
          .map(String)
          .some((v) => ids.includes(v)),
      )
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  };

  const parseUrlParams = (search = location.search) => {
    const params = new URLSearchParams(search);
    return {
      q: params.get("q") || "",
      category: params.get("category") || "ALL PRODUCTS",
      ageGroup: params.get("ageGroup") || "ALL",
      gender: params.get("gender") || "ALL",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      discount: params.get("discount") === "true",
      size: params.get("size") || "",
      color: params.get("color") || "",
      sort: params.get("sort") || "reviews",
      page: parseInt(params.get("page") || "1", 10) || 1,
      viewMode: params.get("viewMode") || "grid",
    };
  };

  const initialUrlState = parseUrlParams(location.search);

  const [searchQuery, setSearchQuery] = useState(initialUrlState.q);
  const [selectedCategory, setSelectedCategory] = useState(
    initialUrlState.category,
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    initialUrlState.ageGroup,
  );
  const [selectedGender, setSelectedGender] = useState(initialUrlState.gender);
  const [minPrice, setMinPrice] = useState(initialUrlState.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialUrlState.maxPrice);
  const [discountOnly, setDiscountOnly] = useState(initialUrlState.discount);
  const [selectedSize, setSelectedSize] = useState(initialUrlState.size);
  const [selectedColor, setSelectedColor] = useState(initialUrlState.color);
  const [sortMode, setSortMode] = useState(initialUrlState.sort);
  const [currentPage, setCurrentPage] = useState(initialUrlState.page);
  const [viewLayout, setViewLayout] = useState(initialUrlState.viewMode);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state to URL search parameters without page reload
  const updateUrlParams = useCallback(
    (newParams) => {
      if (lastObservedSearchRef.current !== location.search) {
        lastObservedSearchRef.current = location.search;
        return;
      }

      const params = new URLSearchParams(location.search);
      ["view", "product", "order"].forEach((key) => params.delete(key));

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          val !== undefined &&
          val !== "" &&
          val !== false &&
          val !== "ALL" &&
          val !== "ALL PRODUCTS" &&
          !(key === "page" && val === 1) &&
          !(key === "sort" && val === "reviews") &&
          !(key === "viewMode" && val === "grid")
        ) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });

      if (params.toString() !== location.search.replace(/^\?/, "")) {
        setSearchParams(params, { replace: true });
      }
    },
    [location.search, setSearchParams],
  );

  useEffect(() => {
    updateUrlParams({
      q: searchQuery,
      category: selectedCategory,
      ageGroup: selectedAgeGroup,
      gender: selectedGender,
      minPrice,
      maxPrice,
      discount: discountOnly,
      size: selectedSize,
      color: selectedColor,
      sort: sortMode,
      page: currentPage,
      viewMode: viewLayout,
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedAgeGroup,
    selectedGender,
    minPrice,
    maxPrice,
    discountOnly,
    selectedSize,
    selectedColor,
    sortMode,
    currentPage,
    viewLayout,
    updateUrlParams,
  ]);

  useEffect(() => {
    lastObservedSearchRef.current = location.search;
    const params = parseUrlParams(location.search);
    setSearchQuery(params.q);
    setSelectedCategory(params.category);
    setSelectedAgeGroup(params.ageGroup);
    setSelectedGender(params.gender);
    setMinPrice(params.minPrice);
    setMaxPrice(params.maxPrice);
    setDiscountOnly(params.discount);
    setSelectedSize(params.size);
    setSelectedColor(params.color);
    setSortMode(params.sort);
    setCurrentPage(params.page);
    setViewLayout(params.viewMode);
  }, [location.search]);

  // --- 2. Live MongoDB & Client Catalog Pipeline Engine ---
  // An empty array from the parent means the backend answered and there is nothing to show — not
  // that the backend is down. Swapping in the local catalogue on an empty result is what made a
  // filtered search with no matches look like a disconnected backend.
  const activeProductsSource = Array.isArray(propProducts)
    ? propProducts
    : LOCAL_PRODUCTS;

  const normalizeSize = (value) => {
    const raw = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");
    const aliases = {
      SMALL: "S",
      MEDIUM: "M",
      LARGE: "L",
      "EXTRA LARGE": "XL",
      "2XL": "XXL",
    };
    return aliases[raw] || raw;
  };
  const getVariantSize = (variant) => variant?.size || variant?.title || "";
  const getVariantColor = (variant) => variant?.color || "";
  const isWearablesCategory = (category) =>
    String(typeof category === "object" ? category?.name : category || "")
      .toLowerCase()
      .includes("wearable");

  const fallbackResult = useMemo(() => {
    const products = activeProductsSource.filter(
      (p) => !["discontinued"].includes(String(p.status || "").toLowerCase()),
    );
    const baseList = products.flatMap((parent) => {
      const variants = Array.isArray(parent.variants)
        ? parent.variants.filter(
            (variant) => variant && variant.isActive !== false,
          )
        : [];

      if (!variants.length) {
        return [
          {
            ...parent,
            parentProduct: parent,
            variant: null,
            variantSku: "",
            selectedSize: "",
            selectedColor: "",
            catalogKey: String(parent.id || parent._id || parent.slug),
          },
        ];
      }

      return variants.map((variant, index) => {
        const variantSku = variant.sku || variant.variantSku || "";
        return {
          ...parent,
          id: parent.id || parent._id,
          parentProduct: parent,
          variant,
          variantSku,
          selectedSize: getVariantSize(variant),
          selectedColor: getVariantColor(variant),
          catalogKey: `${parent.id || parent._id || parent.slug}-${variantSku || index}`,
          price: Number(variant.price ?? parent.price ?? 0),
          compareAtPrice: Number(
            variant.compareAtPrice ?? parent.compareAtPrice ?? 0,
          ),
          stockQuantity: Number(
            variant.stockQuantity ?? variant.stock ?? parent.stockQuantity ?? 0,
          ),
          image:
            variant.image ||
            (Array.isArray(variant.images) ? variant.images[0] : "") ||
            parent.image,
          imageLight: variant.imageLight || parent.imageLight,
          imageType: variant.imageType || parent.imageType,
        };
      });
    });

    const searchMatchedList = searchQuery.trim()
      ? (() => {
          const phrase = searchQuery.trim().toLowerCase().replace(/\s+/g, " ");

          return baseList.filter((item) => {
            const p = item.parentProduct;
            const catName =
              typeof p.category === "object" ? p.category?.name : p.category;

            // Search the product name as a complete phrase.
            const productName = String(p.name || "")
              .toLowerCase()
              .replace(/\s+/g, " ");

            return productName.includes(phrase);
          });
        })()
      : baseList;

    const applyFilters = (source, excludedFacet = "") => {
      let result = [...source];

      if (
        excludedFacet !== "category" &&
        selectedCategory &&
        !["ALL", "ALL PRODUCTS"].includes(selectedCategory.toUpperCase())
      ) {
        result = result.filter((item) => {
          const category =
            typeof item.parentProduct.category === "object"
              ? item.parentProduct.category?.name
              : item.parentProduct.category;
          return (
            String(category || "").toUpperCase() ===
            selectedCategory.toUpperCase()
          );
        });
      }

      if (excludedFacet !== "ageGroup" && selectedAgeGroup !== "ALL") {
        result = result.filter((item) => {
          const age = String(item.parentProduct.ageGroup || "").toUpperCase();
          return (
            !age || age === selectedAgeGroup.toUpperCase() || age === "ALL AGES"
          );
        });
      }

      if (excludedFacet !== "gender" && selectedGender !== "ALL") {
        result = result.filter((item) => {
          const gender = String(item.parentProduct.gender || "").toUpperCase();
          return (
            !gender ||
            gender === selectedGender.toUpperCase() ||
            gender === "UNISEX"
          );
        });
      }

      if (minPrice !== "") {
        const minP = Number(minPrice);
        if (!Number.isNaN(minP))
          result = result.filter((item) => item.price >= minP);
      }
      if (maxPrice !== "") {
        const maxP = Number(maxPrice);
        if (!Number.isNaN(maxP))
          result = result.filter((item) => item.price <= maxP);
      }
      if (discountOnly) {
        result = result.filter(
          (item) => item.compareAtPrice > item.price && item.compareAtPrice > 0,
        );
      }

      if (excludedFacet !== "size" && selectedSize) {
        result = result.filter((item) => {
          const wearable = isWearablesCategory(item.parentProduct.category);
          const wanted = wearable
            ? normalizeSize(selectedSize)
            : String(selectedSize).trim().toLowerCase();
          const actual = wearable
            ? normalizeSize(item.selectedSize)
            : String(item.selectedSize || "")
                .trim()
                .toLowerCase();
          return actual === wanted;
        });
      }
      if (excludedFacet !== "color" && selectedColor) {
        result = result.filter(
          (item) =>
            String(item.selectedColor || "")
              .trim()
              .toLowerCase() === selectedColor.trim().toLowerCase(),
        );
      }

      return result;
    };

    let list = applyFilters(searchMatchedList);

    const uniqueProducts = (items) => {
      const map = new Map();
      items.forEach((item) => {
        const parent = item.parentProduct;
        const id = String(
          parent.id || parent._id || parent.slug || parent.name,
        );
        if (!map.has(id)) map.set(id, parent);
      });
      return [...map.values()];
    };

    const countProductValues = (items, getValue) => {
      const counts = {};
      uniqueProducts(items).forEach((product) => {
        const value = getValue(product);
        if (value) counts[value] = (counts[value] || 0) + 1;
      });
      return counts;
    };

    const categoryItems = applyFilters(searchMatchedList, "category");
    const ageItems = applyFilters(searchMatchedList, "ageGroup");
    const genderItems = applyFilters(searchMatchedList, "gender");
    const sizeItems = applyFilters(searchMatchedList, "size");
    const colorItems = applyFilters(searchMatchedList, "color");

    const categoryCounts = countProductValues(categoryItems, (product) =>
      typeof product.category === "object"
        ? product.category?.name
        : product.category,
    );
    const ageGroupCounts = countProductValues(
      ageItems,
      (product) => product.ageGroup,
    );
    const genderCounts = countProductValues(
      genderItems,
      (product) => product.gender,
    );
    const availableSizes = [
      ...new Set(
        sizeItems
          .map((item) => item.selectedSize)
          .filter(Boolean)
          .map(normalizeSize),
      ),
    ].sort((a, b) => a.localeCompare(b));
    const availableColors = [
      ...new Set(
        colorItems
          .map((item) => String(item.selectedColor || "").trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    // Sort
    list.sort((a, b) => {
      if (sortMode === "price_asc") return a.price - b.price;
      if (sortMode === "price_desc") return b.price - a.price;
      if (sortMode === "newest")
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortMode === "reviews") {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      }
      return (
        b.rating * (b.reviewsCount || 1) - a.rating * (a.reviewsCount || 1)
      );
    });

    const limit = 8;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.min(currentPage, totalPages);
    const pageItems = list.slice((safePage - 1) * limit, safePage * limit);

    return {
      data: pageItems,
      total,
      totalPages,
      page: safePage,
      limit,
      facets: {
        categories: categoryCounts,
        priceRange: {
          min: list.length ? Math.min(...list.map((item) => item.price)) : 0,
          max: list.length ? Math.max(...list.map((item) => item.price)) : 0,
        },
        ageGroups: ageGroupCounts,
        genders: genderCounts,
        colors: availableColors,
        sizes: availableSizes,
      },
    };
    // activeProductsSource is the catalogue itself. Without it in the deps, a hard refresh froze the
    // result computed on first render — when App still held LOCAL_PRODUCTS — and the live products
    // that arrived moments later never triggered a recompute. Client-side navigation looked fine
    // because the page mounted after the data was already there.
  }, [
    activeProductsSource,
    searchQuery,
    selectedCategory,
    selectedAgeGroup,
    selectedGender,
    minPrice,
    maxPrice,
    discountOnly,
    selectedSize,
    selectedColor,
    sortMode,
    currentPage,
  ]);

  const searchMatchedCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const phrase = searchQuery.trim().toLowerCase().replace(/\s+/g, " ");

    const products = activeProductsSource.filter(
      (p) => !["discontinued"].includes(String(p.status || "").toLowerCase()),
    );

    return [
      ...new Set(
        products
          .filter((product) => {
            const productName = String(product.name || "")
              .toLowerCase()
              .replace(/\s+/g, " ");

            return productName.includes(phrase);
          })
          .map((product) => {
            const category = product.category;
            return typeof category === "object" ? category?.name : category;
          })
          .filter(Boolean),
      ),
    ];
  }, [searchQuery, activeProductsSource]);

  const activeResult = fallbackResult;
  const productsList = Array.isArray(activeResult?.data)
    ? activeResult.data
    : activeResult?.data?.products || activeResult?.products || [];
  const totalProductsCount = activeResult?.total ?? productsList.length;
  const totalPagesCount = activeResult?.totalPages ?? 1;
  const facetCounts = activeResult?.facets || {};

  // Handlers for quick actions
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL PRODUCTS");
    setSelectedAgeGroup("ALL");
    setSelectedGender("ALL");
    setMinPrice("");
    setMaxPrice("");
    setDiscountOnly(false);
    setSelectedSize("");
    setSelectedColor("");
    setSortMode("reviews");
    setCurrentPage(1);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const popularKeywords = [
    "Knee Wrap",
    "Wrist Wrap",
    "Lifting Straps",
    "Lever Belt",
    "Yoga Belt",
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Search Header Banner */}
      <div className="relative border-b border-[var(--border-subtle)] bg-[var(--bg-main)] py-8 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="max-w-[1536px] mx-auto relative z-10 space-y-6">
          {/* Search Input & Subtitle Centered Container */}
          <div className="max-w-3xl mx-auto text-center space-y-3.5 flex flex-col items-center">
            {/* Search Input Bar (Above Subtitle) */}
            <div className="relative w-full max-w-2xl">
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
                  className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-main)] border-2 border-[#FF1E27] shadow-md rounded-2xl text-sm font-bold text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:ring-2 focus:ring-[#FF1E27] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1 rounded-full hover:bg-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Subtitle Text (Below Search Input Bar) */}
            <p className="text-xs sm:text-sm text-[var(--text-sub)] max-w-xl font-medium leading-relaxed">
              Compound multi-attribute filtering across categories, age groups,
              gender specs, price bounds, and active discounts.
            </p>
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
            {selectedCategory &&
              selectedCategory !== "ALL PRODUCTS" &&
              selectedCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                  Category: {selectedCategory}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                    onClick={() => setSelectedCategory("ALL PRODUCTS")}
                  />
                </span>
              )}

            {selectedAgeGroup && selectedAgeGroup !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Age: {selectedAgeGroup}
                <X
                  className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedAgeGroup("ALL")}
                />
              </span>
            )}

            {selectedGender && selectedGender !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Gender: {selectedGender}
                <X
                  className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedGender("ALL")}
                />
              </span>
            )}

            {selectedSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Size: {selectedSize}
                <X
                  className="w-3.5 h-3.5 cursor-pointer"
                  onClick={() => {
                    setSelectedSize("");
                    setCurrentPage(1);
                  }}
                />
              </span>
            )}

            {selectedColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Color: {selectedColor}
                <X
                  className="w-3.5 h-3.5 cursor-pointer"
                  onClick={() => {
                    setSelectedColor("");
                    setCurrentPage(1);
                  }}
                />
              </span>
            )}

            {(minPrice !== "" || maxPrice !== "") && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-main)] border border-[#FF1E27]/40 text-xs font-bold text-[#FF1E27]">
                Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
                <X
                  className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                />
              </span>
            )}

            {discountOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF1E27]/10 border border-[#FF1E27] text-xs font-bold text-[#FF1E27]">
                <Tag className="w-3 h-3" /> On Sale Only
                <X
                  className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                  onClick={() => setDiscountOnly(false)}
                />
              </span>
            )}

            {(selectedCategory !== "ALL PRODUCTS" ||
              selectedAgeGroup !== "ALL" ||
              selectedGender !== "ALL" ||
              minPrice !== "" ||
              maxPrice !== "" ||
              discountOnly ||
              selectedSize ||
              selectedColor ||
              searchQuery) && (
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
              <span className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider hidden sm:inline">
                Sort By:
              </span>
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
                onClick={() => setViewLayout("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === "grid"
                    ? "bg-[#FF1E27] text-white shadow-sm"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === "list"
                    ? "bg-[#FF1E27] text-white shadow-sm"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
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
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-1.5">
                  {(searchQuery.trim()
                    ? searchMatchedCategories
                    : LOCAL_CATEGORIES
                  ).map((cat) => {
                    const isSelected =
                      selectedCategory.toUpperCase() === cat.toUpperCase();

                    const count =
                      cat === "ALL PRODUCTS"
                        ? LOCAL_PRODUCTS.length
                        : facetCounts.categories?.[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF1E27] text-white shadow-md"
                            : "text-[var(--text-sub)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isSelected ? "bg-white/20 text-white" : "bg-[var(--border-subtle)] text-[var(--text-sub)]"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Age Group Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Age Group
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["ALL", "Adults", "Teens"].map((age) => (
                    <button
                      key={age}
                      onClick={() => {
                        setSelectedAgeGroup(age);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        selectedAgeGroup === age
                          ? "bg-[#FF1E27] text-white shadow-sm"
                          : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Target Gender Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Gender
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Unisex", "Men", "Women"].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGender(g);
                        setCurrentPage(1);
                      }}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                        selectedGender === g
                          ? "bg-[#FF1E27] text-white shadow-sm"
                          : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Size Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(facetCounts.sizes || []).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(selectedSize === size ? "" : size);
                        setCurrentPage(1);
                      }}
                      className={`min-w-10 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedSize === size ? "bg-[#FF1E27] text-white shadow-sm" : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Color Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Color
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(facetCounts.colors || []).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(selectedColor === color ? "" : color);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedColor === color ? "bg-[#FF1E27] text-white shadow-sm" : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Price Range Filter */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase tracking-wider">
                  Price Range (₹)
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-1/2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[#FF1E27]"
                  />
                  <span className="text-[var(--text-sub)] text-xs font-bold">
                    -
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                      setDiscountOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 accent-[#FF1E27] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Catalog Grid Section */}
          <section
            aria-label="Catalog results"
            className="lg:col-span-3 space-y-6"
          >
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#FF1E27] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold font-heading text-[var(--text-sub)] tracking-widest uppercase">
                  Querying Product Pipeline...
                </p>
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
                    We couldn't find any products matching your specific
                    compound filter criteria. Try clearing filters or broadening
                    your search terms.
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
              <div
                className={
                  viewLayout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {productsList.map((product) => {
                  const isOutOfStock =
                    product.status === "Unavailable" ||
                    product.variant?.isAvailable === false ||
                    product.variant?.isActive === false ||
                    product.stockQuantity === 0;
                  const parentProduct = product.parentProduct || product;
                  const addVariantToCart = {
                    ...parentProduct,
                    variant: product.variant,
                    variantSku: product.variantSku,
                    selectedSize: product.selectedSize,
                    selectedColor: product.selectedColor,
                  };
                  const discountPercent =
                    product.compareAtPrice &&
                    product.compareAtPrice > product.price
                      ? Math.round(
                          ((product.compareAtPrice - product.price) /
                            product.compareAtPrice) *
                            100,
                        )
                      : null;

                  if (viewLayout === "list") {
                    // List Item Layout
                    return (
                      <div
                        key={product.catalogKey || product.id}
                        onClick={() =>
                          onSelectProduct(parentProduct, {
                            sku: product.variantSku,
                            size: product.selectedSize,
                            color: product.selectedColor,
                          })
                        }
                        className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/50 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer"
                      >
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                          <div
                            onClick={() =>
                              onSelectProduct(parentProduct, {
                                sku: product.variantSku,
                                size: product.selectedSize,
                                color: product.selectedColor,
                              })
                            }
                            className="relative w-24 h-24 rounded-xl bg-[var(--bg-main)] overflow-hidden shrink-0 cursor-pointer p-2 flex items-center justify-center border border-[var(--border-subtle)]"
                          >
                            <ProductGraphic
                              image={product.image}
                              imageLight={product.imageLight}
                              type={product.imageType}
                              theme={theme}
                              noGlow
                              className="w-full h-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF1E27] font-heading">
                                {product.category}
                              </span>
                              {product.badge && (
                                <span className="bg-[#FF1E27] text-white text-[9px] font-black px-2 py-0.5 rounded font-heading">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h3
                              onClick={() =>
                                onSelectProduct(parentProduct, {
                                  sku: product.variantSku,
                                  size: product.selectedSize,
                                  color: product.selectedColor,
                                })
                              }
                              className="text-sm font-extrabold font-heading uppercase text-[var(--text-main)] hover:text-[#FF1E27] transition-colors cursor-pointer"
                            >
                              {product.name}
                            </h3>
                            <p className="text-xs text-[var(--text-sub)] line-clamp-1">
                              {product.tagline}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF1E27] pt-1">
                              <Star className="w-3.5 h-3.5 fill-[#FF1E27] text-[#FF1E27]" />
                              <span>{product.rating}</span>
                              <span className="text-[10px] text-[var(--text-sub)]">
                                ({product.reviewsCount} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] gap-4">
                          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                            {/* Price group — the compare-at price was missing from this layout
                                entirely, so a discounted product looked like it had no original price. */}
                            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                              <span className="text-lg font-black font-heading text-[#FF1E27]">
                                ₹{product.price}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-lg text-[var(--text-sub)] line-through font-medium">
                                  ₹{product.compareAtPrice}
                                </span>
                              )}
                            </div>
                            {/* Sale pill — the list layout had no discount line at all, so the occasion
                                discount was invisible here. */}
                            {product.festiveDiscountPercent > 0 && (
                              <span className="shrink-0 rounded-full border border-[var(--text-main)]/40 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-main)] font-heading">
                                Sale
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {(() => {
                              const qtyInCart = getProductCartQty(product);
                              return (
                                <button
                                  disabled={isOutOfStock}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(addVariantToCart);
                                  }}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                                    isOutOfStock
                                      ? "opacity-50 cursor-not-allowed bg-slate-700 text-white"
                                      : "btn-glow-red"
                                  }`}
                                >
                                  {isOutOfStock ? (
                                    <span>OUT OF STOCK</span>
                                  ) : qtyInCart > 0 ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span>
                                        Added {qtyInCart}{" "}
                                        {qtyInCart === 1 ? "item" : "items"}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-4 h-4" />
                                      <span>ADD TO CART</span>
                                    </>
                                  )}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Grid Item Card Layout
                  return (
                    <div
                      key={product.catalogKey || product.id}
                      onClick={() =>
                        onSelectProduct(parentProduct, {
                          sku: product.variantSku,
                          size: product.selectedSize,
                          color: product.selectedColor,
                        })
                      }
                      className="glass-panel rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg cursor-pointer"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative h-48 bg-[var(--bg-main)] p-4 flex items-center justify-center overflow-hidden border-b border-[var(--border-subtle)]">
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

                          <ProductGraphic
                            image={product.image}
                            imageLight={product.imageLight}
                            type={product.imageType}
                            theme={theme}
                            noGlow
                            className="w-full h-36"
                          />
                        </div>

                        {/* Product Info Details */}
                        <div className="p-4 space-y-2">
                          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF1E27] font-heading">
                            {product.category}
                          </div>

                          <h3
                            onClick={() =>
                              onSelectProduct(parentProduct, {
                                sku: product.variantSku,
                                size: product.selectedSize,
                                color: product.selectedColor,
                              })
                            }
                            className="text-xs font-black font-heading uppercase text-[var(--text-main)] line-clamp-1 hover:text-[#FF1E27] transition-colors cursor-pointer"
                          >
                            {product.name}
                          </h3>

                          {/* Rating Summary */}
                          <div className="flex items-center gap-1 text-xs font-bold text-[#FF1E27]">
                            <Star className="w-3.5 h-3.5 fill-[#FF1E27] text-[#FF1E27]" />
                            <span>{product.rating}</span>
                            <span className="text-[10px] text-[var(--text-sub)] font-medium">
                              ({product.reviewsCount})
                            </span>
                          </div>

                          {/* Price Display — prices on the left, the Sale pill pinned to the right
                              edge so it lines up across every card in the row. */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                              <span className="text-base font-black font-heading text-[#FF1E27]">
                                ₹{product.price}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-base text-[var(--text-sub)] line-through font-medium">
                                  ₹{product.compareAtPrice}
                                </span>
                              )}
                            </div>
                            {/* Sale pill — only while an occasion discount runs on this product.
                                Monochrome outline: border and text both follow --text-main, so it reads
                                white on the dark card and near-black on the light one with no theme
                                branching, and it doesn't compete with the red price beside it. */}
                            {product.festiveDiscountPercent > 0 && (
                              <span className="shrink-0 rounded-full border border-[var(--text-main)]/40 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-main)] font-heading">
                                Sale
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-4 pt-0">
                        {(() => {
                          const qtyInCart = getProductCartQty(product);
                          return (
                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(addVariantToCart);
                              }}
                              className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase font-heading text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all ${
                                isOutOfStock
                                  ? "opacity-50 cursor-not-allowed bg-slate-700"
                                  : "btn-glow-red"
                              }`}
                            >
                              {isOutOfStock ? (
                                <span>OUT OF STOCK</span>
                              ) : qtyInCart > 0 ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>
                                    Added {qtyInCart}{" "}
                                    {qtyInCart === 1 ? "item" : "items"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>ADD TO CART</span>
                                </>
                              )}
                            </button>
                          );
                        })()}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                            ? "bg-[#FF1E27] text-white shadow-sm"
                            : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)] hover:text-[var(--text-main)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage >= totalPagesCount}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPagesCount, prev + 1),
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)] hover:border-[#FF1E27] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
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
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">
                  Category
                </h4>
                {(searchQuery.trim()
                  ? searchMatchedCategories
                  : LOCAL_CATEGORIES
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      handleCategorySelect(cat);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                      selectedCategory.toUpperCase() === cat.toUpperCase()
                        ? "bg-[#FF1E27] text-white"
                        : "text-[var(--text-sub)] hover:bg-[var(--border-subtle)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Mobile Age Group */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">
                  Age Group
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["ALL", "Adults", "Teens"].map((age) => (
                    <button
                      key={age}
                      onClick={() => {
                        setSelectedAgeGroup(age);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center ${
                        selectedAgeGroup === age
                          ? "bg-[#FF1E27] text-white"
                          : "bg-[var(--bg-main)] text-[var(--text-sub)]"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Gender */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">
                  Gender
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  {["Unisex", "Men", "Women"].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGender(g);
                        setCurrentPage(1);
                      }}
                      className={`py-2 text-[11px] font-bold text-center rounded-xl ${
                        selectedGender === g
                          ? "bg-[#FF1E27] text-white"
                          : "bg-[var(--bg-main)] text-[var(--text-sub)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Size */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">
                  Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(facetCounts.sizes || []).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(selectedSize === size ? "" : size);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${selectedSize === size ? "bg-[#FF1E27] text-white" : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Color */}
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-black text-[var(--text-sub)] uppercase">
                  Color
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(facetCounts.colors || []).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(selectedColor === color ? "" : color);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${selectedColor === color ? "bg-[#FF1E27] text-white" : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-sub)]"}`}
                    >
                      {color}
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
                    onChange={(e) => {
                      setDiscountOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
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
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
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
