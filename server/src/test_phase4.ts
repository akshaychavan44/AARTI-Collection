/**
 * Automated Test Suite for Phase 4: Product Catalog & Shopping Flow
 * Tests:
 * 1. Product catalog sorting (price_asc, price_desc, newest, featured) and filtering (isFeatured, availability)
 * 2. Unauthenticated cart & wishlist access (401)
 * 3. Cart operations: add variant, price authority from DB, increment existing variant, stock limits, update qty, remove, clear
 * 4. Wishlist operations: add product, idempotent add, remove product, move to cart
 * 5. User isolation: user B cannot access or modify user A's cart or wishlist
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
  console.log("🚀 Starting Phase 4 Automated Test Suite...\n");

  try {
    // ----------------------------------------------------
    // 1. PRODUCT CATALOG FILTERING & SORTING
    // ----------------------------------------------------
    console.log("--- 1. Catalog Sorting & Filtering Tests ---");

    // 1.1 GET /api/products?isFeatured=true
    const featuredRes = await fetch(`${BASE_URL}/products?isFeatured=true`);
    const featuredData = await featuredRes.json();
    await assert(
      "Catalog returns featured products",
      featuredRes.status === 200 &&
        featuredData.success &&
        featuredData.data.length > 0 &&
        featuredData.data.every((p: any) => p.isFeatured === true),
      `Found ${featuredData.data?.length} featured products`
    );

    // 1.2 Price fields check (compareAtPrice and discountPercentage)
    const productWithDiscount = featuredData.data.find(
      (p: any) => p.compareAtPrice !== null && p.discountPercentage !== null
    );
    await assert(
      "Products include compareAtPrice and computed discountPercentage",
      !!productWithDiscount && typeof productWithDiscount.discountPercentage === "number",
      `Sample: ${productWithDiscount?.name} - CompareAt: ${productWithDiscount?.compareAtPrice}, Discount: ${productWithDiscount?.discountPercentage}%`
    );

    // 1.3 GET /api/products?sortBy=price_asc
    const priceAscRes = await fetch(`${BASE_URL}/products?sortBy=price_asc&limit=10`);
    const priceAscData = await priceAscRes.json();
    const pricesAsc = priceAscData.data.map((p: any) => p.priceRange.min);
    const isSortedAsc = pricesAsc.every(
      (val: number, i: number, arr: number[]) => i === 0 || arr[i - 1] <= val
    );
    await assert(
      "Catalog sorts correctly by price_asc",
      priceAscRes.status === 200 && isSortedAsc && pricesAsc.length > 1,
      `Prices: ${pricesAsc.join(", ")}`
    );

    // 1.4 GET /api/products?sortBy=price_desc
    const priceDescRes = await fetch(`${BASE_URL}/products?sortBy=price_desc&limit=10`);
    const priceDescData = await priceDescRes.json();
    const pricesDesc = priceDescData.data.map((p: any) => p.priceRange.max);
    const isSortedDesc = pricesDesc.every(
      (val: number, i: number, arr: number[]) => i === 0 || arr[i - 1] >= val
    );
    await assert(
      "Catalog sorts correctly by price_desc",
      priceDescRes.status === 200 && isSortedDesc && pricesDesc.length > 1,
      `Prices: ${pricesDesc.join(", ")}`
    );

    // 1.5 GET /api/products?availability=in_stock
    const stockRes = await fetch(`${BASE_URL}/products?availability=in_stock`);
    const stockData = await stockRes.json();
    const allHaveStock = stockData.data.every(
      (p: any) => p.overallStockStatus !== "OUT_OF_STOCK"
    );
    await assert(
      "Catalog filters by in_stock availability",
      stockRes.status === 200 && allHaveStock && stockData.data.length > 0,
      `In stock products: ${stockData.data?.length}`
    );

    // ----------------------------------------------------
    // 2. SECURITY & AUTHENTICATION ENFORCEMENT
    // ----------------------------------------------------
    console.log("\n--- 2. Security & Authentication Checks ---");

    // 2.1 Unauthenticated cart request returns 401
    const unauthCartRes = await fetch(`${BASE_URL}/cart`);
    await assert(
      "GET /api/cart without auth cookie returns 401 Unauthorized",
      unauthCartRes.status === 401
    );

    // 2.2 Unauthenticated wishlist request returns 401
    const unauthWishlistRes = await fetch(`${BASE_URL}/wishlist`);
    await assert(
      "GET /api/wishlist without auth cookie returns 401 Unauthorized",
      unauthWishlistRes.status === 401
    );

    // Register & Login Test Buyer
    const timestamp = Date.now();
    const userAEmail = `phase4buyer_${timestamp}@kalyankids.com`;
    const userAPass = "ShopSecure123!";

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Pooja Sharma",
        email: userAEmail,
        password: userAPass,
        confirmPassword: userAPass,
      }),
    });
    const authCookieHeader = regRes.headers.get("set-cookie") || "";
    const userACookie = authCookieHeader.split(";")[0];

    await assert(
      "Test Buyer registration succeeds with auth cookie",
      regRes.status === 201 && userACookie.startsWith("token="),
      `Cookie obtained: ${userACookie.substring(0, 15)}...`
    );

    // ----------------------------------------------------
    // 3. CART OPERATIONS & BUSINESS LOGIC
    // ----------------------------------------------------
    console.log("\n--- 3. Shopping Cart Operations ---");

    // 3.1 Initial empty cart
    const initialCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: userACookie },
    });
    const initialCart = await initialCartRes.json();
    await assert(
      "GET /api/cart returns empty cart initially",
      initialCartRes.status === 200 &&
        initialCart.data.totalItems === 0 &&
        initialCart.data.subtotal === 0 &&
        initialCart.data.items.length === 0
    );

    // Find a sample product and variant
    const testProduct = featuredData.data[0];
    const testVariant = testProduct.variants[0];
    const variantPrice = parseFloat(testVariant.price);

    // 3.2 Add item to cart
    const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        variantId: testVariant.id,
        quantity: 2,
      }),
    });
    const addCartData = await addCartRes.json();
    const addedItem = addCartData.data?.items?.[0];

    await assert(
      "POST /api/cart/items adds product variant with quantity 2",
      addCartRes.status === 200 &&
        addCartData.data.totalItems === 2 &&
        addedItem.quantity === 2 &&
        addedItem.productId === testProduct.id &&
        addedItem.variantId === testVariant.id
    );

    // 3.3 Authoritative unit price check (Cart unit price equals DB variant price)
    await assert(
      "Cart uses authoritative unit price from database",
      addedItem.unitPrice === variantPrice &&
        addedItem.totalPrice === Number((variantPrice * 2).toFixed(2)) &&
        addCartData.data.subtotal === Number((variantPrice * 2).toFixed(2)),
      `DB Price: ${variantPrice}, Cart Unit: ${addedItem.unitPrice}, Subtotal: ${addCartData.data.subtotal}`
    );

    // 3.4 Increment existing variant
    const incCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        variantId: testVariant.id,
        quantity: 1,
      }),
    });
    const incCartData = await incCartRes.json();
    await assert(
      "Adding existing variant increments quantity instead of duplicate line items",
      incCartRes.status === 200 &&
        incCartData.data.items.length === 1 &&
        incCartData.data.totalItems === 3 &&
        incCartData.data.items[0].quantity === 3
    );

    // 3.5 Stock boundary validation (Attempt to exceed stock)
    const excessiveQty = (testVariant.stock || 50) + 100;
    const overstockRes = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        variantId: testVariant.id,
        quantity: excessiveQty,
      }),
    });
    const overstockData = await overstockRes.json();
    await assert(
      "Adding quantity exceeding available inventory returns 400 with friendly message",
      overstockRes.status === 400 && overstockData.success === false,
      `Error Message: ${overstockData.message}`
    );

    // 3.6 Update cart item quantity
    const cartItemId = incCartData.data.items[0].id;
    const updateQtyRes = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({ quantity: 1 }),
    });
    const updateQtyData = await updateQtyRes.json();
    await assert(
      "PUT /api/cart/items/:id updates quantity to 1 and recalculates subtotal",
      updateQtyRes.status === 200 &&
        updateQtyData.data.totalItems === 1 &&
        updateQtyData.data.subtotal === variantPrice
    );

    // 3.7 Add second distinct product/variant
    const secondProduct = featuredData.data[1] || featuredData.data[0];
    const secondVariant =
      secondProduct.id !== testProduct.id
        ? secondProduct.variants[0]
        : testProduct.variants[1];

    if (secondVariant) {
      await fetch(`${BASE_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: userACookie,
        },
        body: JSON.stringify({
          productId: secondProduct.id,
          variantId: secondVariant.id,
          quantity: 1,
        }),
      });
    }

    // 3.8 Remove single item
    const removeRes = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: "DELETE",
      headers: { Cookie: userACookie },
    });
    const removeData = await removeRes.json();
    const removedStillPresent = removeData.data.items.some(
      (i: any) => i.id === cartItemId
    );
    await assert(
      "DELETE /api/cart/items/:id removes the specified item from cart",
      removeRes.status === 200 && !removedStillPresent
    );

    // 3.9 Clear cart
    const clearRes = await fetch(`${BASE_URL}/cart`, {
      method: "DELETE",
      headers: { Cookie: userACookie },
    });
    const clearData = await clearRes.json();
    await assert(
      "DELETE /api/cart clears the entire cart",
      clearRes.status === 200 &&
        clearData.data.items.length === 0 &&
        clearData.data.totalItems === 0
    );

    // ----------------------------------------------------
    // 4. WISHLIST OPERATIONS
    // ----------------------------------------------------
    console.log("\n--- 4. Wishlist Operations ---");

    // 4.1 Initial empty wishlist
    const initialWishlistRes = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Cookie: userACookie },
    });
    const initialWishlist = await initialWishlistRes.json();
    await assert(
      "GET /api/wishlist returns empty initially",
      initialWishlistRes.status === 200 && initialWishlist.data.totalItems === 0
    );

    // 4.2 Add product to wishlist
    const addWishlistRes = await fetch(`${BASE_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({ productId: testProduct.id }),
    });
    const addWishlistData = await addWishlistRes.json();
    await assert(
      "POST /api/wishlist adds product to wishlist with product details",
      addWishlistRes.status === 200 &&
        addWishlistData.data.totalItems === 1 &&
        addWishlistData.data.items[0].productId === testProduct.id &&
        !!addWishlistData.data.items[0].product.name
    );

    // 4.3 Idempotent add to wishlist
    const duplicateWishlistRes = await fetch(`${BASE_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({ productId: testProduct.id }),
    });
    const duplicateWishlistData = await duplicateWishlistRes.json();
    await assert(
      "Adding existing product to wishlist is idempotent (no duplicates)",
      duplicateWishlistRes.status === 200 && duplicateWishlistData.data.totalItems === 1
    );

    // 4.4 Move product from wishlist to cart
    const moveRes = await fetch(
      `${BASE_URL}/wishlist/${testProduct.id}/move-to-cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: userACookie,
        },
        body: JSON.stringify({}),
      }
    );
    const moveData = await moveRes.json();
    await assert(
      "POST /api/wishlist/:id/move-to-cart transfers product to cart and clears from wishlist",
      moveRes.status === 200 &&
        moveData.data.wishlist.totalItems === 0 &&
        moveData.data.cart.totalItems === 1 &&
        moveData.data.cart.items[0].productId === testProduct.id
    );

    // 4.5 Add and remove product from wishlist
    await fetch(`${BASE_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userACookie,
      },
      body: JSON.stringify({ productId: testProduct.id }),
    });
    const delWishlistRes = await fetch(
      `${BASE_URL}/wishlist/${testProduct.id}`,
      {
        method: "DELETE",
        headers: { Cookie: userACookie },
      }
    );
    const delWishlistData = await delWishlistRes.json();
    await assert(
      "DELETE /api/wishlist/:id removes product directly",
      delWishlistRes.status === 200 && delWishlistData.data.totalItems === 0
    );

    // ----------------------------------------------------
    // 5. USER ISOLATION TESTS
    // ----------------------------------------------------
    console.log("\n--- 5. User Isolation & Security Tests ---");

    // Register User B
    const userBEmail = `phase4other_${timestamp}@kalyankids.com`;
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rahul Verma",
        email: userBEmail,
        password: userAPass,
        confirmPassword: userAPass,
      }),
    });
    const userBCookie = (regBRes.headers.get("set-cookie") || "").split(";")[0];

    // User B gets their own cart (should be empty, not User A's cart)
    const userBCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: userBCookie },
    });
    const userBCart = await userBCartRes.json();
    await assert(
      "User B has an isolated empty cart, cannot see User A's items",
      userBCartRes.status === 200 &&
        userBCart.data.totalItems === 0 &&
        userBCart.data.items.length === 0
    );

    // User B cannot tamper with User A's cart item ID
    const userAItemId = moveData.data.cart.items[0].id;
    const tamperRes = await fetch(`${BASE_URL}/cart/items/${userAItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: userBCookie,
      },
      body: JSON.stringify({ quantity: 5 }),
    });
    await assert(
      "User B cannot update User A's cart item (404/Forbidden ownership check)",
      tamperRes.status === 404
    );

    // User B cannot delete User A's cart item
    const tamperDeleteRes = await fetch(`${BASE_URL}/cart/items/${userAItemId}`, {
      method: "DELETE",
      headers: { Cookie: userBCookie },
    });
    await assert(
      "User B cannot delete User A's cart item",
      tamperDeleteRes.status === 404
    );

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log("\n==========================================");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`Phase 4 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test suite encountered fatal error:", error);
    process.exit(1);
  }
}

runTests();
