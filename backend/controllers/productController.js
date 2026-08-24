import { PRODUCTS, CATEGORIES } from '../data/products.js';

/**
 * DATABASE INDEXING SPECIFICATION FOR MONGODB:
 * Ensure low-latency query resolution at scale with compound indexes:
 * 1. db.products.createIndex({ status: 1, category: 1, "variants.price": 1 })
 * 2. db.products.createIndex({ status: 1, ageGroup: 1, gender: 1 })
 * 3. db.products.createIndex({ name: "text", tagline: "text", description: "text" })
 */

// @desc    Get filtered, sorted, and paginated product listings
// @route   GET /api/products
// @query   q, category, ageGroup, gender, minPrice, maxPrice, discount, sort, page, limit
export const getProducts = (req, res) => {
  try {
    const {
      q,
      search, // alias for q
      category,
      ageGroup,
      gender,
      minPrice,
      maxPrice,
      discount,
      sort = 'reviews',
      page = 1,
      limit = 12
    } = req.query;

    const searchKeyword = (q || search || '').trim().toLowerCase();
    const targetCategory = (category || '').trim();
    const targetAgeGroup = (ageGroup || '').trim();
    const targetGender = (gender || '').trim();
    const minP = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
    const maxP = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
    const isDiscountOnly = discount === 'true' || discount === '1' || discount === true;

    // --- AGGREGATION PIPELINE STAGE 1: Status Governance ---
    // Exclude 'Discontinued' items completely from search discovery.
    // 'Active' and 'Unavailable' items remain visible (with stock status indicators).
    let candidateList = PRODUCTS.filter((p) => p.status !== 'Discontinued');

    // --- AGGREGATION PIPELINE STAGE 2: Keyword Search ($match text / regex) ---
    if (searchKeyword) {
      candidateList = candidateList.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(searchKeyword);
        const taglineMatch = p.tagline?.toLowerCase().includes(searchKeyword);
        const descMatch = p.description?.toLowerCase().includes(searchKeyword);
        const categoryMatch = p.category?.toLowerCase().includes(searchKeyword);
        const specsMatch = Array.isArray(p.specs) && p.specs.some((s) => s.toLowerCase().includes(searchKeyword));
        return nameMatch || taglineMatch || descMatch || categoryMatch || specsMatch;
      });
    }

    // --- AGGREGATION PIPELINE STAGE 3: Compound Multi-Attribute Filtering ---
    // Category Filter
    if (targetCategory && targetCategory.toUpperCase() !== 'ALL' && targetCategory.toUpperCase() !== 'ALL PRODUCTS') {
      candidateList = candidateList.filter(
        (p) => p.category.toUpperCase() === targetCategory.toUpperCase()
      );
    }

    // Age Group Filter
    if (targetAgeGroup && targetAgeGroup.toUpperCase() !== 'ALL') {
      candidateList = candidateList.filter((p) => {
        if (!p.ageGroup) return true;
        return p.ageGroup.toUpperCase() === targetAgeGroup.toUpperCase() || p.ageGroup.toUpperCase() === 'ALL AGES';
      });
    }

    // Gender Filter
    if (targetGender && targetGender.toUpperCase() !== 'ALL') {
      candidateList = candidateList.filter((p) => {
        if (!p.gender) return true;
        return p.gender.toUpperCase() === targetGender.toUpperCase() || p.gender.toUpperCase() === 'UNISEX';
      });
    }

    // Price Range Filter (using selling price or variant price bounds)
    if (minP !== null && !isNaN(minP)) {
      candidateList = candidateList.filter((p) => {
        const itemMinPrice = p.variants && p.variants.length > 0
          ? Math.min(...p.variants.map((v) => v.price))
          : p.price;
        return itemMinPrice >= minP;
      });
    }

    if (maxP !== null && !isNaN(maxP)) {
      candidateList = candidateList.filter((p) => {
        const itemMinPrice = p.variants && p.variants.length > 0
          ? Math.min(...p.variants.map((v) => v.price))
          : p.price;
        return itemMinPrice <= maxP;
      });
    }

    // Discount Filter (items on sale: compareAtPrice > price)
    if (isDiscountOnly) {
      candidateList = candidateList.filter(
        (p) => p.compareAtPrice && p.compareAtPrice > p.price
      );
    }

    // --- AGGREGATION PIPELINE STAGE 4: Dynamic Sorting ---
    const sortedList = [...candidateList].sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'reviews':
        case 'rating_desc':
          // Sort by rating desc, then reviewsCount desc
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        case 'newest':
          return (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0);
        default:
          // Default sorting: customer reviews & bestseller priority
          return (b.rating * (b.reviewsCount || 1)) - (a.rating * (a.reviewsCount || 1));
      }
    });

    // --- AGGREGATION PIPELINE STAGE 5: Facet Counts Calculation ---
    const allActiveCandidates = PRODUCTS.filter((p) => p.status !== 'Discontinued');
    const categoryCounts = {};
    allActiveCandidates.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const prices = allActiveCandidates.map((p) => p.price);
    const priceBounds = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 5000
    };

    const ageGroupCounts = { Adults: 0, Teens: 0, 'All Ages': 0 };
    const genderCounts = { Unisex: 0, Men: 0, Women: 0 };
    let discountCount = 0;

    allActiveCandidates.forEach((p) => {
      if (p.ageGroup && ageGroupCounts[p.ageGroup] !== undefined) ageGroupCounts[p.ageGroup]++;
      if (p.gender && genderCounts[p.gender] !== undefined) genderCounts[p.gender]++;
      if (p.compareAtPrice && p.compareAtPrice > p.price) discountCount++;
    });

    // --- AGGREGATION PIPELINE STAGE 6: Catalog Pagination ---
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const totalCount = sortedList.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = sortedList.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      count: paginatedItems.length,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      facets: {
        categories: categoryCounts,
        priceRange: priceBounds,
        ageGroups: ageGroupCounts,
        genders: genderCounts,
        discountCount
      },
      data: paginatedItems
    });
  } catch (error) {
    console.error('Error executing product search pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process product search query'
    });
  }
};

// @desc    Get single detailed product payload by ID or Slug
// @route   GET /api/products/:slugOrId
export const getProductById = (req, res) => {
  const param = req.params.id || req.params.slug;
  const product = PRODUCTS.find(
    (p) => p.id === param || p.slug === param || p.sku === param
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with slug or identifier '${param}' not found`
    });
  }

  // Ensure discontinued products return 404 for search detail access if needed
  if (product.status === 'Discontinued') {
    return res.status(404).json({
      success: false,
      message: `Product '${param}' has been discontinued and is no longer available.`
    });
  }

  res.json({
    success: true,
    data: product
  });
};

// @desc    Get all product categories
// @route   GET /api/categories
export const getCategories = (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES
  });
};

