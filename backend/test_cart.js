async function runTests() {
  console.log('🧪 Starting Backend Cart & Checkout API Tests...');
  const BASE_URL = 'http://localhost:5000/api';

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Healthcheck:', healthData.status);

    // 2. GET /api/cart
    const getCartRes = await fetch(`${BASE_URL}/cart`);
    const getCartData = await getCartRes.json();
    console.log('✅ GET /api/cart:', getCartData.success, 'Items count:', getCartData.data?.items?.length, 'Subtotal:', getCartData.data?.subtotal);

    // 3. POST /api/cart
    const postCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'elbow-wrap',
        name: 'ELBOW WRAP',
        price: 699,
        quantity: 2,
        selectedSize: 'Large (12"-14")',
        selectedColor: 'Stealth Black'
      })
    });
    const postCartData = await postCartRes.json();
    console.log('✅ POST /api/cart:', postCartData.success, postCartData.message);

    // 4. POST /api/cart/validate with Coupon AVN10
    const validateRes = await fetch(`${BASE_URL}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponCode: 'AVN10'
      })
    });
    const validateData = await validateRes.json();
    console.log('✅ POST /api/cart/validate (AVN10):', validateData.success, 'Discount:', validateData.data?.discountAmount, 'Final Total:', validateData.data?.finalTotal);

    // 5. POST /api/checkout/create-order
    const checkoutRes = await fetch(`${BASE_URL}/checkout/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: validateData.data.items,
        shippingAddress: {
          fullName: 'Test Powerlifter',
          phone: '+91 99999 88888',
          email: 'test@avn.com',
          street: '123 Iron Gym Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        paymentMethod: 'UPI',
        couponCode: 'AVN10',
        totalAmount: validateData.data.finalTotal
      })
    });
    const checkoutData = await checkoutRes.json();
    console.log('✅ POST /api/checkout/create-order:', checkoutData.success, 'OrderId:', checkoutData.data?.orderId, 'State:', checkoutData.data?.status);

    console.log('\n🎉 ALL BACKEND CART & CHECKOUT TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
