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
 * Centralized API Client with Cookie Credentials and 401 Interception
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('avn-token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    return data.data?.products || (Array.isArray(data.data) ? data.data : []);
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
    return data.data?.product || data.data;
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

export async function fetchOrdersByEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(email || '')}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('Orders API fetch failed:', error.message);
    return [];
  }
}

export async function fetchOrderById(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.warn('Order API fetch failed:', error.message);
    return null;
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


export async function updateOrderStatusApi(orderId, statusData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof statusData === 'string' ? { status: statusData } : statusData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Update order status API failed:', error.message);
    return null;
  }
}


/**
 * Customer Support API Helpers
 */
export async function submitSupportTicketApi(ticketData) {
  try {
    const response = await fetch(`${API_BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Submit support ticket API failed:', error.message);
    return { success: false, message: 'Server offline' };
  }
}

export async function fetchSupportTicketsApi(email = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/support/tickets?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data || [];
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
