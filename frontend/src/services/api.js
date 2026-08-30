const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch products with compound multi-attribute filtering, sorting, & pagination
 */
export async function fetchSearchProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.append('q', filters.q);
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
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn('Backend API unavailable, using local product data fallback:', error.message);
    return null;
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
    return data.data;
  } catch (error) {
    console.warn(`Backend API failed to fetch product ${idOrSlug}:`, error.message);
    return null;
  }
}

export async function fetchProductBySlug(slug) {
  return fetchProductById(slug);
}


/**
 * Fetch active cart items and calculations from backend API
 */
export async function fetchCart(couponCode = '') {
  try {
    const queryParams = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
    const response = await fetch(`${API_BASE_URL}/cart${queryParams}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
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
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Add to cart API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * Update quantity or variant attributes for a line item
 */
export async function updateCartItemApi(itemId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Update cart API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * Remove an item from the backend cart
 */
export async function removeCartItemApi(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(itemId)}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Remove cart item API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * Validate current stock levels and recalculate totals with coupon code
 */
export async function validateCartApi(items, couponCode = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, couponCode })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Validate cart API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * Create checkout order (generates pending_payment order state)
 */
export async function createCheckoutOrderApi(orderPayload) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkout/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Create checkout order API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * Submit checkout order to backend API (legacy)
 */
export async function submitOrder(cartItems, totalAmount) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems, totalAmount })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to submit order to API:', error);
    return { success: false, message: 'Server offline' };
  }
}

/**
 * User Auth & Profile Backend API Helpers
 */
export async function loginUserApi(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.message || 'Login failed');
    error.status = response.status;
    throw error;
  }
  return await response.json();
}

export async function registerUserApi(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.message || 'Registration failed');
    error.status = response.status;
    throw error;
  }
  return await response.json();
}
