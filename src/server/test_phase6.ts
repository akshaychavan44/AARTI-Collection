/**
 * Automated Test Suite for Phase 6: Admin Dashboard, Management & Authorization
 * Tests RBAC, Dashboard Stats, Product/Category CRUD with Safeguards,
 * Orders Management, Customer Management, and Coupon Management.
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
  console.log("🚀 Starting Phase 6 Automated Test Suite: Admin Dashboard & Management...\n");

  try {
    // ----------------------------------------------------
    // 1. SETUP: Authenticate Customer and Admin
    // ----------------------------------------------------
    console.log("--- 1. Authentication & RBAC Verification ---");

    // Login as Customer
    const custEmail = `shopper_${Date.now()}@example.com`;
    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: custEmail,
        password: "Password@123",
      }),
    });
    const custRegData = await custRegRes.json();
    const customerToken = custRegData.data?.token;

    // Login as Admin (seeded account)
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@kalyankids.com",
        password: "Admin@12345",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.token;

    await assert("Admin user logs in successfully", adminLoginRes.status === 200 && !!adminToken);

    // Unauthenticated access to /api/admin/stats must return 401
    const unauthRes = await fetch(`${BASE_URL}/admin/stats`);
    await assert(
      "Unauthenticated request to /api/admin/stats returns 401 Unauthorized",
      unauthRes.status === 401
    );

    // Customer access to /api/admin/stats must return 403 Forbidden
    const forbiddenRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    await assert(
      "Customer request to /api/admin/stats returns 403 Forbidden",
      forbiddenRes.status === 403
    );

    // Admin access to /api/admin/stats must return 200 OK
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    await assert(
      "Admin request to /api/admin/stats returns 200 OK with dashboard metrics",
      adminStatsRes.status === 200 &&
        adminStatsData.success === true &&
        typeof adminStatsData.data.totalProducts === "number" &&
        typeof adminStatsData.data.totalOrders === "number" &&
        typeof adminStatsData.data.totalRevenue === "number"
    );

    // ----------------------------------------------------
    // 2. CATEGORY MANAGEMENT & RELATION SAFEGUARDS
    // ----------------------------------------------------
    console.log("\n--- 2. Category Management Tests ---");

    // Admin lists categories with product counts
    const catListRes = await fetch(`${BASE_URL}/admin/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const catListData = await catListRes.json();
    await assert(
      "GET /api/admin/categories returns categories with product count",
      catListRes.status === 200 &&
        Array.isArray(catListData.data) &&
        catListData.data.length > 0 &&
        typeof catListData.data[0]?.productCount === "number"
    );

    // Find a category that currently has products
    const busyCategory = catListData.data.find((c: any) => c.productCount > 0) || catListData.data[0];
    const validCategoryId = busyCategory?.id;

    // Admin creates a new category
    const catName = `Festive Ethnic ${Date.now().toString().slice(-4)}`;
    const createCatRes = await fetch(`${BASE_URL}/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: catName,
        gender: "GIRLS",
        description: "Handcrafted festive sets.",
      }),
    });
    const createCatData = await createCatRes.json();
    const createdCatId = createCatData.data?.id;

    await assert(
      "POST /api/admin/categories creates new category",
      createCatRes.status === 201 && createCatData.success === true && !!createdCatId
    );

    // Delete safeguard: attempting to delete category with products must fail with 400
    const deleteBlockedRes = await fetch(`${BASE_URL}/admin/categories/${busyCategory.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await assert(
      "DELETE /api/admin/categories/:id prevents deletion when products are assigned",
      deleteBlockedRes.status === 400,
      `Status: ${deleteBlockedRes.status}`
    );

    // Delete empty category succeeds
    const deleteCatRes = await fetch(`${BASE_URL}/admin/categories/${createdCatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await assert(
      "DELETE /api/admin/categories/:id safely deletes empty category",
      deleteCatRes.status === 200
    );

    // ----------------------------------------------------
    // 3. PRODUCT MANAGEMENT & DELETION SAFEGUARDS
    // ----------------------------------------------------
    console.log("\n--- 3. Product Management Tests ---");

    // Admin lists products
    const prodListRes = await fetch(`${BASE_URL}/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const prodListData = await prodListRes.json();
    await assert(
      "GET /api/admin/products returns product management list",
      prodListRes.status === 200 && Array.isArray(prodListData.data)
    );

    // Admin creates a new product using validCategoryId
    const newSku = `ADM-TSH-${Date.now().toString().slice(-6)}`;
    const createProdRes = await fetch(`${BASE_URL}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        categoryId: validCategoryId,
        name: "Admin Special Organic Polo",
        gender: "BOYS",
        ageGroup: "6-9",
        brand: "Kalyan Kids Luxury",
        description: "100% fine cotton polo shirt.",
        compareAtPrice: 1299,
        variants: [
          {
            size: "6-7Y",
            color: "Royal Navy",
            price: 799,
            sku: newSku,
            quantity: 25,
            lowStockThreshold: 5,
          },
        ],
      }),
    });
    const createProdData = await createProdRes.json();
    const createdProductId = createProdData.data?.id;

    await assert(
      "POST /api/admin/products creates new product with variants",
      createProdRes.status === 201 && createProdData.success === true && !!createdProductId,
      `Status: ${createProdRes.status}, Message: ${createProdData.message}`
    );

    if (createdProductId) {
      // Admin updates product
      const updateProdRes = await fetch(`${BASE_URL}/admin/products/${createdProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Admin Special Organic Polo (Updated Edition)",
        }),
      });
      const updateProdData = await updateProdRes.json();
      await assert(
        "PUT /api/admin/products/:id updates product details",
        updateProdRes.status === 200 &&
          updateProdData.data?.name === "Admin Special Organic Polo (Updated Edition)",
        `Status: ${updateProdRes.status}`
      );

      // Admin toggles active status
      const toggleProdRes = await fetch(`${BASE_URL}/admin/products/${createdProductId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const toggleProdData = await toggleProdRes.json();
      await assert(
        "PATCH /api/admin/products/:id/status toggles isActive flag",
        toggleProdRes.status === 200 && typeof toggleProdData.data?.isActive === "boolean",
        `Status: ${toggleProdRes.status}`
      );

      // Safe deletion of unpurchased product -> hard deletes
      const delProdRes = await fetch(`${BASE_URL}/admin/products/${createdProductId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const delProdData = await delProdRes.json();
      await assert(
        "DELETE /api/admin/products/:id hard-deletes unpurchased product safely",
        delProdRes.status === 200 && delProdData.data?.deleted === true,
        `Status: ${delProdRes.status}`
      );
    }

    // ----------------------------------------------------
    // 4. ORDER MANAGEMENT
    // ----------------------------------------------------
    console.log("\n--- 4. Order Management Tests ---");

    const ordersRes = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ordersData = await ordersRes.json();
    await assert(
      "GET /api/admin/orders returns all customer orders",
      ordersRes.status === 200 && Array.isArray(ordersData.data)
    );

    if (ordersData.data.length > 0) {
      const firstOrder = ordersData.data[0];

      // Admin views order details
      const detailRes = await fetch(`${BASE_URL}/admin/orders/${firstOrder.orderNumber}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const detailData = await detailRes.json();
      await assert(
        "GET /api/admin/orders/:orderNumber returns full receipt details",
        detailRes.status === 200 && detailData.data?.orderNumber === firstOrder.orderNumber
      );

      // Admin updates order status
      const updateStatusRes = await fetch(
        `${BASE_URL}/admin/orders/${firstOrder.orderNumber}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "CONFIRMED",
            paymentStatus: "PAID",
          }),
        }
      );
      const updateStatusData = await updateStatusRes.json();
      await assert(
        "PATCH /api/admin/orders/:orderNumber/status updates status and paymentStatus",
        updateStatusRes.status === 200 &&
          updateStatusData.data?.status === "CONFIRMED" &&
          updateStatusData.data?.paymentStatus === "PAID"
      );
    }

    // ----------------------------------------------------
    // 5. CUSTOMER MANAGEMENT
    // ----------------------------------------------------
    console.log("\n--- 5. Customer Management Tests ---");

    const custsRes = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const custsData = await custsRes.json();
    await assert(
      "GET /api/admin/customers returns list of registered customers",
      custsRes.status === 200 && Array.isArray(custsData.data)
    );

    const testCust = custsData.data.find((c: any) => c.email === custEmail);
    if (testCust) {
      // Toggle customer status
      const toggleCustRes = await fetch(`${BASE_URL}/admin/customers/${testCust.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const toggleCustData = await toggleCustRes.json();
      await assert(
        "PATCH /api/admin/customers/:id/status toggles customer active/suspended status",
        toggleCustRes.status === 200 && toggleCustData.data?.isActive === false
      );
    }

    // ----------------------------------------------------
    // 6. COUPON MANAGEMENT
    // ----------------------------------------------------
    console.log("\n--- 6. Coupon Management Tests ---");

    const couponCode = `ADMIN${Date.now().toString().slice(-4)}`;
    const createCouponRes = await fetch(`${BASE_URL}/admin/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: couponCode,
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 1000,
        isActive: true,
      }),
    });
    const createCouponData = await createCouponRes.json();
    const createdCouponId = createCouponData.data?.id;

    await assert(
      "POST /api/admin/coupons creates new promotional coupon",
      createCouponRes.status === 201 && createCouponData.success === true && !!createdCouponId
    );

    // Admin updates coupon
    const updateCouponRes = await fetch(`${BASE_URL}/admin/coupons/${createdCouponId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        discountValue: 25,
      }),
    });
    const updateCouponData = await updateCouponRes.json();
    await assert(
      "PUT /api/admin/coupons/:id updates coupon discount value",
      updateCouponRes.status === 200 && parseFloat(updateCouponData.data?.discountValue) === 25
    );

    // Admin deletes coupon
    const deleteCouponRes = await fetch(`${BASE_URL}/admin/coupons/${createdCouponId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await assert(
      "DELETE /api/admin/coupons/:id removes coupon",
      deleteCouponRes.status === 200
    );

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log("\n==========================================");
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`Phase 6 Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==========================================");

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Unexpected test execution error:", err);
    process.exit(1);
  }
}

runTests();
