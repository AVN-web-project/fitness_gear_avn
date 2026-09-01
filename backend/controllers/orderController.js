import { PRODUCTS } from '../data/products.js';

const ordersDb = [];

const buildTimeline = (status) => {
  const statusOrder = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentIndex = Math.max(0, statusOrder.indexOf(status));

  return statusOrder.map((step, index) => ({
    label: step,
    done: index <= currentIndex,
    date: index === 0 ? 'Placed' : index === 1 ? 'Packed' : index === 2 ? 'Shipped' : index === 3 ? 'In transit' : 'Delivered'
  }));
};

// @desc    Create a new order / checkout (legacy endpoint)
// @route   POST /api/orders
export const createOrder = (req, res) => {
  const { items, totalAmount, shippingAddress, customerEmail, customerName } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty. Cannot process order.'
    });
  }

  const newOrder = {
    orderId: `FG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    transactionId: `AVN-TXN-${Date.now()}-${Math.floor(Math.random() * 9000)}`,
    items,
    totalAmount: totalAmount || items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
    shippingAddress: shippingAddress || 'Standard Delivery',
    customerEmail: customerEmail || 'guest@avngear.com',
    customerName: customerName || 'AVN Customer',
    status: 'Processing',
    paymentStatus: 'Paid',
    createdAt: new Date().toISOString(),
    statusTimeline: buildTimeline('Processing')
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
    totalAmount = 0,
    customerEmail = 'guest@avngear.com',
    customerName = 'AVN Customer'
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty. Cannot generate checkout order.'
    });
  }

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
    transactionId: `AVN-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerEmail,
    customerName,
    items: items.map((i) => ({
      id: i.id || i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      slug: i.slug || i.productId || i.id,
      selectedSize: i.selectedSize || 'Standard',
      selectedColor: i.selectedColor || 'Stealth Black',
      selectedPack: i.selectedPack || 'Single Pair',
      acceptedAtDelivery: false,
      deliveryStatus: 'Pending'
    })),
    shippingAddress: typeof shippingAddress === 'string' ? { addressLine: shippingAddress } : {
      fullName: shippingAddress.fullName || customerName,
      phone: shippingAddress.phone || '',
      email: shippingAddress.email || customerEmail,
      street: shippingAddress.street || 'Default Street',
      city: shippingAddress.city || 'Mumbai',
      state: shippingAddress.state || 'Maharashtra',
      pincode: shippingAddress.pincode || '400001',
      type: shippingAddress.type || 'Home'
    },
    paymentMethod,
    couponCode,
    financials: {
      subtotal: calculatedSubtotal,
      discountAmount,
      shippingFee,
      totalAmount: calculatedTotal
    },
    status: 'Processing',
    paymentStatus: paymentMethod === 'COD' ? 'Pending COD Verification' : 'Paid',
    createdAt: new Date().toISOString(),
    statusTimeline: buildTimeline('Processing')
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
export const getOrdersByUserEmail = (req, res) => {
  const email = (req.query.email || '').toLowerCase();
  const filteredOrders = email
    ? ordersDb.filter((order) => (order.customerEmail || '').toLowerCase() === email)
    : ordersDb;

  res.json({
    success: true,
    data: filteredOrders
  });
};

export const getOrderById = (req, res) => {
  const order = ordersDb.find((o) => o.orderId === req.params.id || o.transactionId === req.params.id);

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


// @desc    Update order status (e.g. Cancelled, Return Requested)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, statusTimeline } = req.body;

  const order = ordersDb.find((o) => o.orderId === id || o.transactionId === id || o.id === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order '${id}' not found`
    });
  }

  if (status) {
    order.status = status;
    if (statusTimeline && statusTimeline.length > 0) {
      order.statusTimeline = statusTimeline;
    } else {
      order.statusTimeline = buildTimeline(status);
    }
  }

  res.json({
    success: true,
    message: `Order status updated to '${status}'`,
    data: order
  });
};
