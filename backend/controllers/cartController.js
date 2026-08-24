import { PRODUCTS } from '../data/products.js';

// In-memory cart database store
let cartItemsStore = [
  {
    itemId: 'item-knee-wrap-default',
    id: 'knee-wrap',
    productId: 'knee-wrap',
    name: 'KNEE WRAP',
    price: 899,
    quantity: 1,
    selectedSize: 'Standard 79"',
    selectedColor: 'Crimson Red',
    selectedPack: 'Single Pair (2 Wraps)',
    image: '/knee-wrap (1).png',
    imageLight: '/knee-wrap.png',
    imageType: 'knee-wrap',
    stockQuantity: 7
  },
  {
    itemId: 'item-wrist-wrap-default',
    id: 'wrist-wrap',
    productId: 'wrist-wrap',
    name: 'WRIST WRAP',
    price: 499,
    quantity: 1,
    selectedSize: '18 Inch Competition',
    selectedColor: 'Crimson Red',
    selectedPack: 'Single Pair (2 Wraps)',
    image: '/wrist-wrap (1).png',
    imageLight: '/wrist-wrap.png',
    imageType: 'wrist-wrap',
    stockQuantity: 18
  }
];

// Active Coupons Database
const COUPONS = {
  'AVN10': { code: 'AVN10', type: 'percentage', value: 10, minSubtotal: 500, description: '10% OFF on all orders over ₹500' },
  'POWER20': { code: 'POWER20', type: 'percentage', value: 20, minSubtotal: 1500, description: '20% OFF on powerlifting gear over ₹1500' },
  'BULK500': { code: 'BULK500', type: 'fixed', value: 500, minSubtotal: 2500, description: 'Flat ₹500 OFF on bulk orders over ₹2500' },
  'MULTI15': { code: 'MULTI15', type: 'percentage', value: 15, minSubtotal: 0, minItems: 2, description: '15% OFF Multi-Item Savings (2+ items)' }
};

// Helper: Calculate cart financial totals with promotions & shipping rules
const calculateCartTotals = (items, couponCode = '') => {
  const FREE_SHIPPING_THRESHOLD = 1499;
  const STANDARD_SHIPPING_FEE = 99;

  let subtotal = 0;
  let totalItemCount = 0;
  const validatedItems = items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === (item.productId || item.id)) || item;
    const maxStock = product.stockQuantity || 10;
    const safeQuantity = Math.min(Math.max(1, item.quantity || 1), maxStock);
    const itemSubtotal = (item.price || product.price || 0) * safeQuantity;
    subtotal += itemSubtotal;
    totalItemCount += safeQuantity;

    let stockWarning = null;
    if (item.quantity > maxStock) {
      stockWarning = `Maximum available stock for ${item.name} is ${maxStock}. Quantity adjusted.`;
    }

    return {
      ...item,
      quantity: safeQuantity,
      stockQuantity: maxStock,
      itemSubtotal,
      stockWarning
    };
  });

  // Calculate promotional discount
  let discountAmount = 0;
  let appliedCoupon = null;
  let couponError = null;

  if (couponCode) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = COUPONS[normalizedCode];

    if (!coupon) {
      couponError = 'Invalid coupon code. Try AVN10, POWER20, BULK500, or MULTI15.';
    } else if (subtotal < coupon.minSubtotal) {
      couponError = `Coupon '${coupon.code}' requires a minimum subtotal of ₹${coupon.minSubtotal}.`;
    } else if (coupon.minItems && totalItemCount < coupon.minItems) {
      couponError = `Coupon '${coupon.code}' requires at least ${coupon.minItems} items in cart.`;
    } else {
      appliedCoupon = coupon;
      if (coupon.type === 'percentage') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(subtotal, coupon.value);
      }
    }
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || validatedItems.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    items: validatedItems,
    itemCount: totalItemCount,
    subtotal,
    discountAmount,
    shippingFee,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    unlockedFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    finalTotal,
    appliedCoupon,
    couponError,
    availableCoupons: Object.values(COUPONS)
  };
};

// @desc    Get active cart items and financial state
// @route   GET /api/cart
export const getCart = (req, res) => {
  const couponCode = req.query.couponCode || '';
  const cartSummary = calculateCartTotals(cartItemsStore, couponCode);

  res.json({
    success: true,
    data: cartSummary
  });
};

// @desc    Add a line item with variant attributes to the cart
// @route   POST /api/cart
export const addToCart = (req, res) => {
  const { productId, id, name, price, quantity = 1, selectedSize, selectedColor, selectedPack, image, imageLight, imageType } = req.body;
  const targetId = productId || id;

  if (!targetId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required to add item to cart.'
    });
  }

  const product = PRODUCTS.find((p) => p.id === targetId);
  const itemPrice = price || (product ? product.price : 0);
  const itemName = name || (product ? product.name : 'Fitness Gear');
  const maxStock = product ? product.stockQuantity : 10;

  const itemSize = selectedSize || (product && product.sizes ? product.sizes[0] : 'Standard');
  const itemColor = selectedColor || (product && product.colors ? product.colors[0].name : 'Stealth Black');
  const itemPack = selectedPack || (product && product.packQuantityOptions ? product.packQuantityOptions[0] : 'Single');

  // Unique line item key based on product ID and selected variants
  const itemId = req.body.itemId || `item-${targetId}-${itemSize}-${itemColor}`.replace(/\s+/g, '-').toLowerCase();

  const existingIndex = cartItemsStore.findIndex((i) => i.itemId === itemId || (i.id === targetId && i.selectedSize === itemSize && i.selectedColor === itemColor));

  if (existingIndex > -1) {
    const newQty = cartItemsStore[existingIndex].quantity + quantity;
    if (newQty > maxStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Maximum stock available is ${maxStock}.`
      });
    }
    cartItemsStore[existingIndex].quantity = newQty;
  } else {
    if (quantity > maxStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${maxStock}).`
      });
    }
    cartItemsStore.push({
      itemId,
      id: targetId,
      productId: targetId,
      name: itemName,
      price: itemPrice,
      quantity,
      selectedSize: itemSize,
      selectedColor: itemColor,
      selectedPack: itemPack,
      image: image || (product ? product.image : ''),
      imageLight: imageLight || (product ? product.imageLight : ''),
      imageType: imageType || (product ? product.imageType : 'knee-wrap'),
      stockQuantity: maxStock
    });
  }

  const cartSummary = calculateCartTotals(cartItemsStore);
  res.status(201).json({
    success: true,
    message: `${itemName} added to cart!`,
    data: cartSummary
  });
};

// @desc    Update quantity or variant selection for a line item
// @route   PATCH /api/cart/:itemId
export const updateCartItem = (req, res) => {
  const { itemId } = req.params;
  const { quantity, selectedSize, selectedColor, selectedPack } = req.body;

  const itemIndex = cartItemsStore.findIndex((i) => i.itemId === itemId || i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Cart item '${itemId}' not found.`
    });
  }

  const item = cartItemsStore[itemIndex];
  const product = PRODUCTS.find((p) => p.id === item.id) || item;
  const maxStock = product.stockQuantity || 10;

  if (quantity !== undefined) {
    if (quantity <= 0) {
      cartItemsStore.splice(itemIndex, 1);
      const cartSummary = calculateCartTotals(cartItemsStore);
      return res.json({
        success: true,
        message: 'Item removed from cart.',
        data: cartSummary
      });
    }
    if (quantity > maxStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot increase quantity beyond stock limit (${maxStock}).`
      });
    }
    cartItemsStore[itemIndex].quantity = quantity;
  }

  if (selectedSize !== undefined) cartItemsStore[itemIndex].selectedSize = selectedSize;
  if (selectedColor !== undefined) cartItemsStore[itemIndex].selectedColor = selectedColor;
  if (selectedPack !== undefined) cartItemsStore[itemIndex].selectedPack = selectedPack;

  const cartSummary = calculateCartTotals(cartItemsStore);
  res.json({
    success: true,
    message: 'Cart item updated successfully!',
    data: cartSummary
  });
};

// @desc    Remove a specific item from the cart
// @route   DELETE /api/cart/:itemId
export const removeCartItem = (req, res) => {
  const { itemId } = req.params;
  const initialLength = cartItemsStore.length;

  cartItemsStore = cartItemsStore.filter((i) => i.itemId !== itemId && i.id !== itemId);

  if (cartItemsStore.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: `Item '${itemId}' not found in cart.`
    });
  }

  const cartSummary = calculateCartTotals(cartItemsStore);
  res.json({
    success: true,
    message: 'Item removed from cart.',
    data: cartSummary
  });
};

// @desc    Validate current stock levels and recalculate totals
// @route   POST /api/cart/validate
export const validateCart = (req, res) => {
  const { items = cartItemsStore, couponCode = '' } = req.body;
  const cartSummary = calculateCartTotals(items, couponCode);

  res.json({
    success: true,
    message: 'Cart validated successfully!',
    data: cartSummary
  });
};
