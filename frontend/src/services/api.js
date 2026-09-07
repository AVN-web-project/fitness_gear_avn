import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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
  const pSlug = p.slug || p.id || '';
  const localMatch = LOCAL_PRODUCTS.find(
    (lp) => lp.slug === pSlug || lp.id === pSlug || lp.name.toLowerCase() === (p.name || '').toLowerCase()
  );

  const primaryImage = p.image || p.images?.[0]?.url || null;
  const categoryStr = typeof p.category === 'object' && p.category?.name
    ? p.category.name.toUpperCase()
    : (typeof p.category === 'string' ? p.category.toUpperCase() : (localMatch?.category || 'EQUIPMENT'));

  const price = p.variants?.[0]?.price ?? p.price ?? localMatch?.price ?? 0;
  const compareAtPrice = p.variants?.[0]?.compareAtPrice ?? p.compareAtPrice ?? localMatch?.compareAtPrice ?? 0;

  return {
    ...localMatch,
    ...p,
    _id: p._id || localMatch?._id,
    id: p.slug || p._id || localMatch?.id,
    productId: p._id || p.slug || localMatch?.id,
    slug: p.slug || localMatch?.slug,
    name: p.name || localMatch?.name,
    category: categoryStr,
    tagline: p.tagline || localMatch?.tagline || '',
    badge: p.badge || localMatch?.badge || '',
    description: p.description || localMatch?.description || '',
    price,
    compareAtPrice,
    image: primaryImage,
    webpImage: p.webpImage || localMatch?.webpImage || primaryImage,
    imageLight: p.imageLight || localMatch?.imageLight || primaryImage,
    images: p.images && p.images.length > 0 ? p.images : (localMatch?.images || [{ url: primaryImage, altText: p.name, isPrimary: true }]),
    rating: p.ratingsAverage ?? p.rating ?? localMatch?.rating ?? 4.8,
    reviewsCount: p.ratingsCount ?? p.reviewsCount ?? localMatch?.reviewsCount ?? 100,
    stockQuantity: p.totalStock ?? p.stockQuantity ?? (p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)) ?? localMatch?.stockQuantity ?? 10,
    status: (p.status || 'Active').charAt(0).toUpperCase() + (p.status || 'Active').slice(1).toLowerCase(),
    sizes: p.sizes || (p.variants ? [...new Set(p.variants.map((v) => v.size || v.title).filter(Boolean))] : localMatch?.sizes) || ['Standard'],
    colors: p.colors || (p.variants ? p.variants.filter((v) => v.color).map((v) => ({ name: v.color, hex: '#FF1E27' })) : localMatch?.colors) || [{ name: 'Crimson Red', hex: '#FF1E27' }],
    variants: (p.variants && p.variants.length > 0) ? p.variants.map((v) => ({
      ...v,
      id: v._id || v.sku,
      name: v.title || v.name || `${p.name} - ${v.size || v.color || 'Standard'}`,
      price: v.price || price,
      compareAtPrice: v.compareAtPrice || compareAtPrice,
      stockQuantity: v.stockQuantity || 10,
    })) : (localMatch?.variants || []),
    specs: (Array.isArray(p.specifications) && p.specifications.length > 0)
      ? p.specifications.map((s) => typeof s === 'string' ? s : `${s.key}: ${s.value}`)
      : (localMatch?.specs || []),
    fullSpecs: p.fullSpecs || localMatch?.fullSpecs || {},
    careInstructions: p.careInstructions || localMatch?.careInstructions || [],
    reviews: p.reviews || localMatch?.reviews || [],
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
    if (filters.gender && filters.gender !== 'ALL') queryParams.append('gender', filters.gender);
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
 * Fetch all products from backend API with optional category/search filters
 */
export async function fetchProducts(category = '', search = '') {
  try {
    const queryParams = new URLSearchParams();
    if (category && category !== 'ALL PRODUCTS') queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const rawProducts = data.data?.products || (Array.isArray(data.data) ? data.data : []);
    if (rawProducts.length > 0) {
      return rawProducts.map(normalizeProduct);
    }
    return LOCAL_PRODUCTS;
  } catch (error) {
    console.warn('Backend API unavailable, using local product data fallback:', error.message);
    return LOCAL_PRODUCTS;
  }
}

/**
 * Fetch single product by ID or Slug from backend API
 */
export async function fetchProductById(idOrSlug) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(idOrSlug)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const raw = data.data?.product || data.data;
    return normalizeProduct(raw);
  } catch (error) {
    console.warn(`Backend API failed to fetch product ${idOrSlug}:`, error.message);
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
    if (Array.isArray(data?.data?.categories)) return data.data.categories;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.categories)) return data.categories;
    return [];
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
    return data?.data || null;
  } catch (error) {
    console.warn('Fetch category by slug API failed:', error.message);
    return null;
  }
}


/**
 * Fetch active cart items and calculations from backend API
 */
export async function fetchCart(couponCode = '') {
  try {
    const queryParams = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
    const res = await apiFetch(`/cart${queryParams}`);
    return res?.data?.cart || res?.data || null;
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
    return await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
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
    return await apiFetch(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  } catch (error) {
    console.warn('Update cart API failed:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Remove an item from the backend cart
 */
export async function removeCartItemApi(itemId) {
  try {
    return await apiFetch(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE'
    });
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
    return await apiFetch('/cart', {
      method: 'DELETE'
    });
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

export async function requestOrderReturnApi(orderId, reason) {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmedReason) {
    return { success: false, message: 'Please provide a reason for your return request.' };
  }
  try {
    return await apiFetch(`/orders/${encodeURIComponent(orderId)}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason: trimmedReason })
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