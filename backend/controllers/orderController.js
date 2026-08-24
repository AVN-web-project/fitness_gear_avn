import { PRODUCTS } from '../data/products.js';

const ordersDb = [];

// @desc    Create a new order / checkout (legacy endpoint)
// @route   POST /api/orders
export const createOrder = (req, res) => {
  const { items, totalAmount, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty. Cannot process order.'
    });
  }

  const newOrder = {
    orderId: `FG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    items,
    totalAmount: totalAmount || items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
    shippingAddress: shippingAddress || 'Standard Delivery',
    status: 'pending_payment',
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString()
  };

  ordersDb.push(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created successfully!',
    data: newOrder
  });
};

// @desc    Direct Checkout Order Creation (Generates pending_payment state)
// @route   POST /api/checkout/create-order
export const createCheckoutOrder = (req, res) => {
  const {
    items = [],
    shippingAddress = {},
    paymentMethod = 'UPI',
    couponCode = '',
    subtotal = 0,
    discountAmount = 0,
    shippingFee = 0,
    totalAmount = 0
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty. Cannot generate checkout order.'
    });
  }

  // Stock Verification
  const stockErrors = [];
  items.forEach((item) => {
    const product = PRODUCTS.find((p) => p.id === (item.productId || item.id));
    if (product && item.quantity > product.stockQuantity) {
      stockErrors.push(`Requested ${item.quantity} of '${item.name}', but only ${product.stockQuantity} available in stock.`);
    }
  });

  if (stockErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock validation failed.',
      errors: stockErrors
    });
  }

  const calculatedSubtotal = subtotal || items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculatedTotal = totalAmount || Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

  const newOrder = {
    orderId: `AVN-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    items: items.map((i) => ({
      id: i.id || i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      selectedSize: i.selectedSize || 'Standard',
      selectedColor: i.selectedColor || 'Stealth Black',
      selectedPack: i.selectedPack || 'Single Pair'
    })),
    shippingAddress: typeof shippingAddress === 'string' ? { addressLine: shippingAddress } : {
      fullName: shippingAddress.fullName || 'Guest Customer',
      phone: shippingAddress.phone || '',
      email: shippingAddress.email || '',
      street: shippingAddress.street || 'Default Street',
      city: shippingAddress.city || 'Mumbai',
      state: shippingAddress.state || 'Maharashtra',
      pincode: shippingAddress.pincode || '400001'
    },
    paymentMethod,
    couponCode,
    financials: {
      subtotal: calculatedSubtotal,
      discountAmount,
      shippingFee,
      totalAmount: calculatedTotal
    },
    status: 'pending_payment',
    paymentStatus: paymentMethod === 'COD' ? 'Pending COD Verification' : 'Awaiting Payment Gateway',
    createdAt: new Date().toISOString()
  };

  ordersDb.push(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created successfully! Proceeding to payment.',
    data: newOrder
  });
};

// @desc    Get order status by ID
// @route   GET /api/orders/:id
export const getOrderById = (req, res) => {
  const order = ordersDb.find((o) => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order with ID '${req.params.id}' not found`
    });
  }

  res.json({
    success: true,
    data: order
  });
};
