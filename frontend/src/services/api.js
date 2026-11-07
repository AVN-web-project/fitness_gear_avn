import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Backend origin (API base without the /api/v1 suffix) — the host that serves /uploads.
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

function shouldUseLocalFallback(error) {
  return !error.status || error.status >= 500;
}

/**
 * Resolve a backend image path to a fully-qualified URL served by the backend.
 *  - absolute (http/https/data/blob)       -> returned unchanged
 *  - /uploads/...                          -> backend origin + path
 *  - legacy root-relative (/knee-wrap.png) -> backend origin + /uploads/products/...
 * The database historically stored root-relative paths such as "/knee-wrap.png";
 * the actual files live on the backend under /uploads/products/.
 */
// Fallback chip colours for variant-derived options. The local catalogue carries real hex values;
// this covers anything it does not know about, so a chip is never rendered in a misleading red.
const COLOR_HEX = {
  'STEALTH BLACK': '#181820',
  'CRIMSON RED': '#FF1E27',
  'STEALTH RED': '#C41E24',
  'NATURAL CANVAS': '#D9CBB3',
  'WHITE': '#F5F5F5',
  'MIDNIGHT NAVY': '#1B2A41',
  'GREY': '#6B7280',
  'GRAY': '#6B7280',
};

export function resolveMediaUrl(path) {
  if (!path || typeof path !== 'string') return path || null;
  const url = path.trim();
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${MEDIA_BASE_URL}${url}`;
  if (url.startsWith('/')) return `${MEDIA_BASE_URL}/uploads/products${url}`;
  return url;
}


export function getAuthHeaders() {
  const token = localStorage.getItem('avn-token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Normalizes backend MongoDB product document to frontend component expectations
 */
export function normalizeProduct(p) {
  if (!p) return null;

  // Catalogue card image. Same matching as a cart line, ordered so an image the admin explicitly
  // made a primary is never skipped:
  //   1. the primary chosen for the product's first variant
  //   2. the primary chosen for ANY variant
  //   3. an image merely scoped to the first variant
  //   4. the first image
  // Computed here first so the grid is correct even before the matching `image` virtual ships.
  const cardImageFor = (product) => {
    const imgs = Array.isArray(product.images) ? product.images : [];
    if (imgs.length === 0) return null;

    const variant = (product.variants || [])[0];
    const sku = String(variant?.sku || '').trim().toUpperCase();
    const variantId = String(variant?._id || '');

    const asId = (x) => String(x || '').trim();
    const belongs = (list) =>
      Array.isArray(list) &&
      list.some(
        (x) =>
          (sku && asId(x).toUpperCase() === sku) ||
          (variantId && asId(x) === variantId)
      );
    const hasPrimary = (img) =>
      (Array.isArray(img?.primaryForIds) && img.primaryForIds.length > 0) ||
      (Array.isArray(img?.primaryFor) && img.primaryFor.length > 0);

    const forFirstVariant = imgs.find((i) => belongs(i?.primaryFor) || belongs(i?.primaryForIds));
    if (forFirstVariant?.url) return forFirstVariant.url;

    const anyPrimary = imgs.find(hasPrimary);
    if (anyPrimary?.url) return anyPrimary.url;

    const scoped = imgs.find((i) => belongs(i?.variantSkus) || belongs(i?.variantIds));
    if (scoped?.url) return scoped.url;

    return null;
  };

  const variantImage = cardImageFor(p);
  if (String(p?.name || '').toUpperCase().includes('KNEE')) {
    console.log('[img]', p.name,
      '| variants[0]:', p.variants?.[0]?.sku, p.variants?.[0]?._id,
      '| images:', p.images?.map(i => [i.url, i.primaryForIds]),
      '| chosen:', variantImage);
  }

  const primaryImage = variantImage || p.image || p.images?.[0]?.url || null;
  const categoryStr = typeof p.category === 'object' && p.category?.name
    ? p.category.name.toUpperCase()
    : (typeof p.category === 'string' ? p.category.toUpperCase() : '');

  // The catalogue is product-wise: one card per product, so its price has to represent the whole
  // product. It takes the cheapest variant a customer can actually buy — using variants[0] could
  // land on an inactive variant, which is how a card and the PDP ended up quoting different
  // numbers for the same product. The PDP stays variant-wise and overrides this per selection.
  const variantList = Array.isArray(p.variants) ? p.variants : [];
  const buyableVariants = variantList.filter((v) => v && v.isActive !== false && v.isAvailable !== false);
  const pricePool = buyableVariants.length > 0 ? buyableVariants : variantList;
  const priceSource = pricePool.reduce(
    (min, v) => (Number(v?.price) < Number(min?.price) ? v : min),
    pricePool[0] || null
  );

  // Occasion discount. Layered ON TOP of the base discount: the base is the gap between
  // compareAtPrice and price and is not touched here. The percentage is applied to every price
  // this client shows so the card, the PDP and the cart all agree — the cart and checkout apply
  // the same percentage server-side.
  //
  // The floor mirrors the server (MIN_PRODUCT_PRICE): the backend already clamps the percentage
  // against the product's cheapest variant, so this never binds, but a stale cached product
  // should still never render below ₹200.
  const festiveDiscountPercent = Math.max(0, Math.min(90, Number(p.festiveDiscountPercent) || 0));
  const MIN_PRODUCT_PRICE = 100;
  const applyFestive = (value) => {
    const base = Number(value) || 0;
    if (festiveDiscountPercent <= 0) return Math.round(base);
    return Math.max(MIN_PRODUCT_PRICE, Math.round(base * (1 - festiveDiscountPercent / 100)));
  };

  const rawPrice = priceSource?.price ?? p.price ?? 0;
  const price = applyFestive(rawPrice);
  const compareAtPrice = priceSource?.compareAtPrice ?? p.compareAtPrice ?? 0;

  // A product can span several prices across its variants, so the catalogue card shows the range
  // it covers rather than implying one price for every combination.
  const priceValues = pricePool
    .map((v) => applyFestive(v?.price))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const priceMin = priceValues.length > 0 ? Math.min(...priceValues) : price;
  const priceMax = priceValues.length > 0 ? Math.max(...priceValues) : price;

  return {
    ...p,
    _id: p._id,
    id: p.slug || p._id,
    productId: p._id || p.slug,
    slug: p.slug,
    name: p.name || '',
    category: categoryStr,
    tagline: p.tagline || '',
    badge: p.badge || '',
    description: p.description || '',
    price,
    compareAtPrice,
    priceMin,
    priceMax,
    festiveDiscountPercent,
    // Base discount only, for the admin/debug views that need the two separated.
    baseDiscountPercent:
      compareAtPrice > rawPrice && compareAtPrice > 0
        ? Math.round(((compareAtPrice - rawPrice) / compareAtPrice) * 100)
        : 0,
    image: resolveMediaUrl(primaryImage),
    webpImage: resolveMediaUrl(p.webpImage || primaryImage),
    // ProductGraphic shows imageLight on the light theme. That asset is product-level, so it would
    // override the variant's own picture and make the card disagree with the variant mapping.
    // Defer to the variant image when one is mapped; keep the light asset only when nothing
    // variant-specific was chosen.
    imageLight: resolveMediaUrl(variantImage || p.imageLight || primaryImage),
    images: (p.images && p.images.length > 0
      ? p.images
      : (primaryImage ? [{ url: primaryImage, altText: p.name, isPrimary: true }] : [])
    ).map((img) => (typeof img === 'string'
      ? { url: resolveMediaUrl(img), altText: p.name, isPrimary: false }
      : { ...img, url: resolveMediaUrl(img?.url) })),
    rating: p.ratingsAverage ?? p.rating ?? 0,
    reviewsCount: p.ratingsCount ?? p.reviewsCount ?? 0,
    stockQuantity: p.totalStock ?? p.stockQuantity ?? (Array.isArray(p.variants)
      ? p.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
      : 0),
    status: (p.status || 'Active').charAt(0).toUpperCase() + (p.status || 'Active').slice(1).toLowerCase(),
    sizes: [...new Set(
      (p.variants || [])
        .map(v => v.size)
        .filter(Boolean)
    )],
    // One chip per COLOUR, not one per variant. With a full size x colour matrix this list used to
    // repeat each colour once per size — four chips reading "Black, Red, Black, Red" — because
    // sizes deduped with a Set while colours did not. The hex now comes from the local catalogue
    // where it is known, instead of every chip being hardcoded red.
    colors: p.colors || (() => {
      const derived = [...new Map(
        (p.variants || [])
          .filter((v) => v.color)
          .map((v) => {
            const name = String(v.color).trim();
            return [
              name.toLowerCase(),
              { name, hex: COLOR_HEX[name.toUpperCase()] || '#6B7280' },
            ];
          })
      ).values()];
      // Nothing derivable (no variants, or variants without a colour) — fall back rather than
      // render zero chips.
      return derived;
    })(),
    variants: (p.variants && p.variants.length > 0) ? p.variants.map((v) => ({
      ...v,
      id: v._id || v.sku,
      name: v.title || v.name || `${p.name} - ${v.size || v.color || 'Standard'}`,
      // Same reduction as the product-level price; `rawPrice` as the fallback so a variant with
      // no price of its own is not discounted twice.
      price: applyFestive(v.price || rawPrice),
      compareAtPrice: v.compareAtPrice || compareAtPrice,
      stockQuantity: Number(v.stockQuantity ?? 0),
    })) : [],
    // Specs are per-variant now, read straight off the selected variant by the PDP. This list is
    // the legacy product-level shape, kept only so an un-migrated product still renders. It must
    // not fall back to the local catalogue: those specs are hardcoded and describe products that
    // no longer exist in the database.
    specs: (Array.isArray(p.specifications) && p.specifications.length > 0)
      ? p.specifications.map((s) => typeof s === 'string' ? s : `${s.key}: ${s.value}`)
      : [],
    fullSpecs: p.fullSpecs || {},
    sizeGuide: p.sizeGuide || null,
    // A string, always — the admin writes a multi-line block. Defaulting to [] made the field an
    // array for some products and a string for others, which is what crashed the Usage & Care tab.
    careInstructions: p.careInstructions || '',
    reviews: p.reviews || [],
  };
}

/**
 * Centralized API Client with Cookie Credentials and 401 Interception
 */
export function getGuestId() {
  if (typeof window === 'undefined') return 'guest-default';
  let guestId = sessionStorage.getItem('avn-guest-id');
  if (!guestId) {
    guestId = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('avn-guest-id', guestId);
  }
  return guestId;
}

export function clearGuestCartOnExitBeacon() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('avn-token');
  const guestId = sessionStorage.getItem('avn-guest-id');
  if (!token && guestId) {
    const url = `${API_BASE_URL}/cart/guest/${encodeURIComponent(guestId)}`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { method: 'DELETE', keepalive: true }).catch(() => { });
    }
  }
}

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('avn-token') : null;
  // Always include active guestId from sessionStorage so backend can migrate guest cart on login
  const guestId = typeof window !== 'undefined'
    ? (sessionStorage.getItem('avn-guest-id') || (!token ? getGuestId() : null))
    : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(guestId ? { 'x-guest-id': guestId } : {}),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Global 401 session expiration interceptor
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('avn:auth:unauthorized'));
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch products with compound multi-attribute filtering, sorting, & pagination
 */
export async function fetchSearchProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category && filters.category.toUpperCase() !== 'ALL PRODUCTS') {
      queryParams.append('category', filters.category);
    }
    if (filters.ageGroup && filters.ageGroup !== 'ALL') queryParams.append('ageGroup', filters.ageGroup);
    // if (filters.gender && filters.gender !== 'ALL') queryParams.append('gender', filters.gender);
    if (filters.minPrice !== undefined && filters.minPrice !== '' && filters.minPrice !== null) {
      queryParams.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '' && filters.maxPrice !== null) {
      queryParams.append('maxPrice', filters.maxPrice);
    }
    if (filters.discount) queryParams.append('discount', 'true');
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data?.data?.products) {
      return {
        ...data,
        data: {
          ...data.data,
          products: data.data.products.map(normalizeProduct),
        },
      };
    }
    return data;
  } catch (error) {
    console.warn('Backend API search query failed:', error.message);
    return null;
  }
}

/**
 * Fetch products from the backend.
 * A successful empty response means MongoDB has no products.
 * Local products are used only when the backend request fails.
 */
export async function fetchProductsWithStatus(category = '', search = '') {
  try {
    const queryParams = new URLSearchParams();
    if (category && category !== 'ALL PRODUCTS') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    // The products endpoint pages at 20 by default. Without an explicit limit the storefront only
    // ever saw the first 20 products, so anything beyond that silently fell back to the local
    // catalogue — which is why a variant added in the database could be invisible on the PDP.
    queryParams.append('limit', '100');

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    const rawProducts = Array.isArray(data?.data?.products)
      ? data.data.products
      : Array.isArray(data?.data)
        ? data.data
        : null;

    if (!rawProducts) {
      throw new Error('Unexpected products API response format.');
    }

    return {
      products: rawProducts.map(normalizeProduct).filter(Boolean),
      isBackendConnected: true,
    };
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      console.error('Backend product request failed:', error.message);
      return {
        products: [],
        isBackendConnected: true,
      };
    }

    console.warn('Backend unavailable. Using local offline catalogue:', error.message);
    return {
      products: LOCAL_PRODUCTS,
      isBackendConnected: false,
    };
  }
}

/**
 * Backward-compatible helper for existing callers that expect an array.
 */
export async function fetchProducts(category = '', search = '') {
  const result = await fetchProductsWithStatus(category, search);
  return result.products;
}

/**
 * Fetch single product by ID or Slug from backend API
 */
export async function fetchProductById(idOrSlug) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(idOrSlug)}`);
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    const raw = data.data?.product || data.data;
    return normalizeProduct(raw);
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    if (!shouldUseLocalFallback(error)) {
      console.error(`Backend rejected product request ${idOrSlug}:`, error.message);
      return null;
    }

    console.warn(`Backend unavailable while fetching product ${idOrSlug}:`, error.message);
    const local = LOCAL_PRODUCTS.find((p) => p.slug === idOrSlug || p.id === idOrSlug);
    return local || null;
  }
}

export async function fetchProductBySlug(slug) {
  return fetchProductById(slug);
}

/**
 * Fetch all categories from backend API
 */
export async function fetchCategoriesApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const rawCats = Array.isArray(data?.data?.categories) ? data.data.categories
      : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.categories) ? data.categories
          : [];
    return rawCats.map((c) => (c && c.image
      ? { ...c, image: { ...c.image, url: resolveMediaUrl(c.image.url) } }
      : c));

  } catch (error) {
    console.warn('Fetch categories API failed:', error.message);
    return [];
  }
}

/**
 * Fetch a single category by its slug from backend API
 */
export async function fetchCategoryBySlugApi(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const cat = data?.data || null;
    return cat && cat.image
      ? { ...cat, image: { ...cat.image, url: resolveMediaUrl(cat.image.url) } }
      : cat;

  } catch (error) {
    console.warn('Fetch category by slug API failed:', error.message);
    return null;
  }
}


/**
 * Fetch active cart items and calculations from backend API
 */
/**
 * Every cart endpoint returns the same envelope, but the mutations were handing back the raw
 * `{ success, data: { cart } }` while fetchCart unwrapped it. Callers then had to know which was
 * which, and getting it wrong failed silently. This normalises all of them to `{ success, cart }`.
 */
function unwrapCart(res) {
  if (!res) return { success: false, message: 'No response from the cart service.' };
  const cart = res?.data?.cart || res?.cart || (res?.data && Array.isArray(res.data.items) ? res.data : null);
  return { ...res, success: res.success !== false, cart: cart || null };
}

export async function fetchCart(couponCode = '') {
  try {
    const queryParams = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
    const res = await apiFetch(`/cart${queryParams}`);
    return unwrapCart(res).cart;
  } catch (error) {
    console.warn('Cart API fetch failed:', error.message);
    return null;
  }
}

/**
 * Add line item with variant options to backend cart
 */
export async function addToCartApi(itemData) {
  try {
    return unwrapCart(await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    }));
  } catch (error) {
    console.warn('Add to cart API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Update quantity or variant attributes for a line item
 */
export async function updateCartItemApi(itemId, updateData) {
  try {
    return unwrapCart(await apiFetch(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    }));
  } catch (error) {
    console.warn('Update cart API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Remove an item from the backend cart
 */
/**
 * Move an existing line onto a different size/colour. Validated server-side: the combination must
 * exist and have stock, and it merges into an existing line rather than duplicating it.
 */
export async function updateCartItemVariantApi(itemId, { selectedSize, selectedColor }) {
  try {
    return unwrapCart(await apiFetch(`/cart/items/${encodeURIComponent(itemId)}/variant`, {
      method: 'PATCH',
      body: JSON.stringify({ selectedSize, selectedColor })
    }));
  } catch (error) {
    console.warn('Update cart variant API failed:', error.message);
    return { success: false, message: error.message };
  }
}

export async function removeCartItemApi(itemId) {
  try {
    return unwrapCart(await apiFetch(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE'
    }));
  } catch (error) {
    console.warn('Remove cart item API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Clear the entire cart in backend
 */
export async function clearCartApi() {
  try {
    return unwrapCart(await apiFetch('/cart', {
      method: 'DELETE'
    }));
  } catch (error) {
    console.warn('Clear cart API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Apply coupon to backend cart
 */
export async function applyCartCouponApi(code) {
  try {
    return await apiFetch('/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  } catch (error) {
    console.warn('Apply cart coupon API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Validate current stock levels and recalculate totals with coupon code
 */
export async function validateCartApi(items, couponCode = '') {
  try {
    const res = await apiFetch('/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode })
    });
    return res;
  } catch (error) {
    console.warn('Validate cart API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Create checkout order (persists order to MongoDB via authenticated API)
 */
export async function createCheckoutOrderApi(orderPayload) {
  try {
    return await apiFetch('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  } catch (error) {
    console.warn('Create checkout order API failed:', error.message);
    return { success: false, message: error.message };
  }
}

export async function verifyPaymentApi(paymentData) {
  try {
    return await apiFetch('/checkout/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  } catch (error) {
    console.warn('Verify payment API failed:', error.message);
    return { success: false, message: error.message };
  }
}

export async function fetchMyOrdersApi() {
  try {
    const data = await apiFetch('/orders');
    return data?.data?.orders || (Array.isArray(data?.data) ? data.data : []);
  } catch (error) {
    console.warn('Orders API fetch failed:', error.message);
    return [];
  }
}

export const fetchOrdersByEmail = fetchMyOrdersApi;

export async function fetchOrderById(orderId) {
  try {
    const data = await apiFetch(`/orders/${encodeURIComponent(orderId)}`);
    return data?.data?.order || data?.data || null;
  } catch (error) {
    console.warn('Order API fetch failed:', error.message);
    return null;
  }
}

export async function cancelOrderApi(orderId, reason) {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmedReason) {
    return { success: false, message: 'Please provide a reason for cancellation.' };
  }
  try {
    return await apiFetch(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: trimmedReason })
    });
  } catch (error) {
    console.warn('Cancel order API failed:', error.message);
    return { success: false, message: error.message };
  }
}

export async function requestOrderReturnApi(orderId, reason, refundAccountDetails) {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmedReason) {
    return { success: false, message: 'Please provide a reason for your return request.' };
  }
  try {
    return await apiFetch(`/orders/${encodeURIComponent(orderId)}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason: trimmedReason, refundAccountDetails })
    });
  } catch (error) {
    console.warn('Request return API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Product Reviews API Helpers
 */
export async function fetchProductReviewsApi(productId) {
  try {
    const data = await apiFetch(`/reviews/products/${encodeURIComponent(productId)}`);
    return data?.data?.reviews || [];
  } catch (error) {
    console.warn('Fetch product reviews API failed:', error.message);
    return [];
  }
}

export async function submitReviewApi(reviewData) {
  try {
    return await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  } catch (error) {
    console.warn('Submit review API failed:', error.message);
    return { success: false, message: error.message };
  }
}

export async function markReviewHelpfulApi(reviewId) {
  try {
    return await apiFetch(`/reviews/${encodeURIComponent(reviewId)}/helpful`, {
      method: 'POST'
    });
  } catch (error) {
    console.warn('Mark review helpful API failed:', error.message);
    throw error;
  }
}

/**
 * User Auth & Profile Backend API Helpers
 */
export async function loginUserApi(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function sendOtpApi(email, purpose = 'login') {
  return apiFetch('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ email, purpose })
  });
}

export async function verifyOtpApi(email, otp) {
  return apiFetch('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
}

export async function registerUserApi(userData) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function setPasswordApi(password) {
  return apiFetch('/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
}

export async function forgotPasswordApi(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function resetPasswordApi(email, token, password) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password })
  });
}

export async function changePasswordApi(currentPassword, newPassword) {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

export async function logoutUserApi() {
  try {
    return await apiFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.warn('Logout API failed:', error.message);
    return null;
  }
}

export async function fetchUserProfileApi() {
  try {
    return await apiFetch('/auth/profile', { method: 'GET' });
  } catch (error) {
    console.warn('Fetch profile API failed:', error.message);
    return null;
  }
}

/**
 * Update User Profile API Helper
 */
export async function updateUserProfileApi(profileData) {
  try {
    return await apiFetch('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  } catch (error) {
    if (error.status) throw error;
    console.warn('Update profile API failed:', error.message);
    return null;
  }
}

/**
 * User Addresses API Helpers
 */
export async function addAddressApi(addressData) {
  return apiFetch('/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
  });
}

export async function updateAddressApi(addressId, addressData) {
  return apiFetch(`/auth/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    body: JSON.stringify(addressData)
  });
}

export async function deleteAddressApi(addressId) {
  return apiFetch(`/auth/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE'
  });
}

/**
 * Customer Support API Helpers
 */
export async function submitSupportTicketApi(ticketData) {
  try {
    return await apiFetch('/support', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  } catch (error) {
    console.warn('Submit support ticket API failed:', error.message);
    return { success: false, message: error.message || 'Server offline' };
  }
}

export async function fetchSupportTicketsApi() {
  try {
    const data = await apiFetch('/support/my-tickets');
    return data?.data?.tickets || [];
  } catch (error) {
    console.warn('Fetch support tickets API failed:', error.message);
    return [];
  }
}

export async function sendSupportChatMessageApi(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/support/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Send support chat API failed:', error.message);
    return { success: false, reply: 'Chat assistant offline. Please submit a support ticket.' };
  }
}