/**
 * Automated Test Suite for Phase 5: Simple Checkout, Razorpay Payment & Orders
 * Tests:
 * 1. Coupon validation (invalid, minimum spend, percentage, fixed discount)
 * 2. Checkout order creation from cart (authoritative pricing, order items snapshot)
 * 3. Razorpay payment order initialization
 * 4. Razorpay payment signature verification (invalid rejected, valid confirmed)
 * 5. Stock decrement on payment and cart clearance
 * 6. Idempotency (prevent duplicate stock reduction)
 * 7. Order history and order details retrieval
 * 8. Customer isolation (User B cannot view or modify User A's order)
 * 9. Order cancellation and stock restoration
 */

export {};

const BASE_URL = "http://localhost:5000/api";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function assert(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`❌ FAIL: ${name} - Details: ${details || "Assertion failed"}`);
    results.push({ name, passed: false, details });
  }
}

async function runTests() {
  console.log("🚀 Starting Phase 5 Automated Test Suite: Checkout, Razorpay & Orders...\n");

  try {
    const timestamp = Date.now();
    const userAEmail = `phase5buyer_${timestamp}@kalyankids.com`;
    const userAPass = "LuxuryKids2026!";

    // 1. Register Buyer A
    console.log("--- 1. User Setup ---");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aarti Deshmukh",
        email: userAEmail,
        password: userAPass,
        confirmPassword: userAPass,
      }),
    });
    const userACookie = (regRes.headers.get("set-cookie") || "").split(";")[0];
    await assert(
      "Buyer A registered successfully with auth session",
      regRes.status === 201 && userACookie.startsWith("token=")
    );

    // ----------------------------------------------------
    // 2. COUPON VALIDATION TESTS
    // ----------------------------------------------------
    console.log("\n--- 2. Coupon Validation Tests ---");

    // 2.1 Invalid coupon
    const invalidCouponRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ code: "NONEXISTENT", subtotal: 1000 }),
    });
    const invalidCouponData = await invalidCouponRes.json();
    await assert(
      "Invalid coupon code is rejected with 400",
      invalidCouponRes.status === 400 && invalidCouponData.success === false
    );

    // 2.2 Coupon with minimum order requirement
    const minOrderCouponRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ code: "KALYAN50", subtotal: 200 }), // Requires 499
    });
    const minOrderData = await minOrderCouponRes.json();
    await assert(
      "Coupon requiring minimum spend fails if subtotal is too low",
      minOrderCouponRes.status === 400 && minOrderData.message?.includes("minimum")
    );

    // 2.3 Valid percentage coupon WELCOME10 (10% off)
    const validCouponRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ code: "WELCOME10", subtotal: 1000 }),
    });
    const validCouponData = await validCouponRes.json();
    await assert(
      "Valid coupon WELCOME10 applies 10% discount on server",
      validCouponRes.status === 200 &&
        validCouponData.data.discountAmount === 100 &&
        validCouponData.data.finalTotal === 900,
      `Discount: ₹${validCouponData.data?.discountAmount}, Final: ₹${validCouponData.data?.finalTotal}`
    );

    // ----------------------------------------------------
    // 3. CHECKOUT & ORDER CREATION FROM CART
    // ----------------------------------------------------
    console.log("\n--- 3. Checkout Order Creation Tests ---");

    // 3.1 Empty cart checkout returns 400
    const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({}),
    });
    await assert(
      "Checkout with empty cart is rejected with 400",
      emptyOrderRes.status === 400
    );

    // Get a product and variant
    const productsRes = await fetch(`${BASE_URL}/products?limit=2`);
    const productsData = await productsRes.json();
    const productA = productsData.data[0];
    const variantA = productA.variants[0];
    const initialStockA = variantA.stock;

    // Add 2 items to cart
    await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        productId: productA.id,
        variantId: variantA.id,
        quantity: 2,
      }),
    });

    // Create order from cart with coupon WELCOME10
    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ couponCode: "WELCOME10" }),
    });
    const createOrderData = await createOrderRes.json();
    const order = createOrderData.data;

    const expectedSubtotal = parseFloat(variantA.price) * 2;
    const expectedDiscount = Number(((expectedSubtotal * 10) / 100).toFixed(2));
    const expectedTotal = Number((expectedSubtotal - expectedDiscount).toFixed(2));

    await assert(
      "Order created with PENDING status and correct authoritative totals",
      createOrderRes.status === 201 &&
        order.status === "PENDING" &&
        order.paymentStatus === "PENDING" &&
        order.subtotal === expectedSubtotal &&
        order.discount === expectedDiscount &&
        order.total === expectedTotal &&
        order.couponCode === "WELCOME10",
      `Order #${order.orderNumber}: Subtotal: ₹${order.subtotal}, Total: ₹${order.total}`
    );

    await assert(
      "Order items snapshot accurately preserves product details",
      order.items.length === 1 &&
        order.items[0].productId === productA.id &&
        order.items[0].productName === productA.name &&
        order.items[0].quantity === 2 &&
        order.items[0].price === parseFloat(variantA.price)
    );

    // ----------------------------------------------------
    // 4. RAZORPAY PAYMENT INITIALIZATION
    // ----------------------------------------------------
    console.log("\n--- 4. Razorpay Payment Initialization ---");

    const rzpOrderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ orderNumber: order.orderNumber }),
    });
    const rzpOrderData = await rzpOrderRes.json();
    const rzpOrder = rzpOrderData.data;

    const expectedPaise = Math.round(expectedTotal * 100);
    await assert(
      "POST /api/payments/create-order initializes Razorpay order in paise",
      rzpOrderRes.status === 200 &&
        !!rzpOrder.razorpayOrderId &&
        rzpOrder.amount === expectedPaise &&
        rzpOrder.currency === "INR" &&
        rzpOrder.orderNumber === order.orderNumber,
      `Razorpay Order ID: ${rzpOrder.razorpayOrderId}, Amount: ${rzpOrder.amount} paise`
    );

    // ----------------------------------------------------
    // 5. PAYMENT SIGNATURE VERIFICATION & STOCK REDUCTION
    // ----------------------------------------------------
    console.log("\n--- 5. Payment Signature & Stock Reduction ---");

    // 5.1 Invalid signature rejected
    const invalidSigRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        razorpayOrderId: rzpOrder.razorpayOrderId,
        razorpayPaymentId: "pay_fake_12345",
        razorpaySignature: "fake_tampered_signature_abc123",
      }),
    });
    await assert(
      "Invalid payment signature is rejected with 400",
      invalidSigRes.status === 400
    );

    // 5.2 Valid test payment verification
    const simulatedPaymentId = `pay_test_${Date.now()}`;
    const simulatedSignature = `test_sig_${Date.now()}`;

    const validSigRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        razorpayOrderId: rzpOrder.razorpayOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: simulatedSignature,
      }),
    });
    const validSigData = await validSigRes.json();
    const confirmedOrder = validSigData.data;

    await assert(
      "Valid payment verification updates order to CONFIRMED and payment to PAID",
      validSigRes.status === 200 &&
        confirmedOrder.status === "CONFIRMED" &&
        confirmedOrder.paymentStatus === "PAID" &&
        confirmedOrder.paymentId === simulatedPaymentId
    );

    // 5.3 Verify stock decreased by exactly 2 units
    const updatedProdRes = await fetch(`${BASE_URL}/products/${productA.id}`);
    const updatedProdData = await updatedProdRes.json();
    const updatedVariantA = updatedProdData.data.variants.find((v: any) => v.id === variantA.id);
    await assert(
      "Inventory quantity reduced by ordered amount in database",
      updatedVariantA.stock === initialStockA - 2,
      `Initial: ${initialStockA}, Now: ${updatedVariantA.stock}`
    );

    // 5.4 Verify customer cart is cleared
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: userACookie },
    });
    const cartData = await cartRes.json();
    await assert(
      "Customer shopping cart is cleared upon successful order payment",
      cartRes.status === 200 && cartData.data.totalItems === 0 && cartData.data.items.length === 0
    );

    // 5.5 Idempotent verification (calling verify again doesn't double-reduce stock)
    const repeatVerifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        razorpayOrderId: rzpOrder.razorpayOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: simulatedSignature,
      }),
    });
    const prodAfterRepeatRes = await fetch(`${BASE_URL}/products/${productA.id}`);
    const prodAfterRepeatData = await prodAfterRepeatRes.json();
    const variantAfterRepeat = prodAfterRepeatData.data.variants.find((v: any) => v.id === variantA.id);
    await assert(
      "Payment verification is idempotent (does not double-reduce stock on repeat submission)",
      repeatVerifyRes.status === 200 && variantAfterRepeat.stock === initialStockA - 2
    );

    // ----------------------------------------------------
    // 6. ORDER HISTORY & ORDER DETAILS
    // ----------------------------------------------------
    console.log("\n--- 6. Order History & Details ---");

    const ordersListRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Cookie: userACookie },
    });
    const ordersListData = await ordersListRes.json();
    await assert(
      "GET /api/orders returns user's order history",
      ordersListRes.status === 200 &&
        ordersListData.data.length >= 1 &&
        ordersListData.data.some((o: any) => o.orderNumber === order.orderNumber)
    );

    const singleOrderRes = await fetch(`${BASE_URL}/orders/${order.orderNumber}`, {
      headers: { Cookie: userACookie },
    });
    const singleOrderData = await singleOrderRes.json();
    await assert(
      "GET /api/orders/:orderNumber returns full itemized receipt",
      singleOrderRes.status === 200 &&
        singleOrderData.data.orderNumber === order.orderNumber &&
        singleOrderData.data.items.length === 1
    );

    // ----------------------------------------------------
    // 7. CUSTOMER ISOLATION
    // ----------------------------------------------------
    console.log("\n--- 7. Security & Customer Isolation ---");

    // Register User B
    const userBEmail = `phase5other_${timestamp}@kalyankids.com`;
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vikram Mehta",
        email: userBEmail,
        password: userAPass,
        confirmPassword: userAPass,
      }),
    });
    const userBCookie = (regBRes.headers.get("set-cookie") || "").split(";")[0];

    // User B tries to view User A's order
    const tamperViewRes = await fetch(`${BASE_URL}/orders/${order.orderNumber}`, {
      headers: { Cookie: userBCookie },
    });
    await assert(
      "User B cannot view User A's order (returns 404)",
      tamperViewRes.status === 404
    );

    // User B tries to cancel User A's order
    const tamperCancelRes = await fetch(`${BASE_URL}/orders/${order.orderNumber}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userBCookie },
      body: JSON.stringify({ reason: "Malicious cancel" }),
    });
    await assert(
      "User B cannot cancel User A's order (returns 404)",
      tamperCancelRes.status === 404
    );

    // ----------------------------------------------------
    // 8. ORDER CANCELLATION & STOCK RESTORATION
    // ----------------------------------------------------
    console.log("\n--- 8. Order Cancellation & Stock Restoration ---");

    const cancelRes = await fetch(`${BASE_URL}/orders/${order.orderNumber}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userACookie },
      body: JSON.stringify({ reason: "Changed mind on size" }),
    });
    const cancelData = await cancelRes.json();
    await assert(
      "Customer can cancel order, status becomes CANCELLED",
      cancelRes.status === 200 && cancelData.data.status === "CANCELLED"
    );

    // Verify stock was restored (+2)
    const prodAfterCancelRes = await fetch(`${BASE_URL}/products/${productA.id}`);
    const prodAfterCancelData = await prodAfterCancelRes.json();
    const variantAfterCancel = prodAfterCancelData.data.variants.find((v: any) => v.id === variantA.id);
    await assert(
      "Cancelled order restores inventory stock in database",
      variantAfterCancel.stock === initialStockA,
      `Restored Stock: ${variantAfterCancel.stock} (Initial was ${initialStockA})`
    );

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log("\n==========================================");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`Phase 5 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test suite fatal error:", error);
    process.exit(1);
  }
}

runTests();
