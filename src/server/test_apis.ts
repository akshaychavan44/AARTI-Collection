/**
 * Automated API Test Suite for Phase 2
 * Tests Categories and Products endpoints against the live Express + Neon server.
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
  console.log("🚀 Starting Comprehensive API Tests for Phase 2...\n");

  try {
    // ----------------------------------------------------
    // CATEGORY TESTS
    // ----------------------------------------------------
    console.log("--- Category Tests ---");

    // 1. GET /api/categories
    const allCatsRes = await fetch(`${BASE_URL}/categories`);
    const allCats = await allCatsRes.json();
    await assert(
      "GET /api/categories returns list of categories",
      allCatsRes.status === 200 && allCats.success === true && Array.isArray(allCats.data) && allCats.data.length > 0,
      `Count: ${allCats.data?.length}`
    );

    // 2. GET /api/categories?gender=GIRLS
    const girlsCatsRes = await fetch(`${BASE_URL}/categories?gender=GIRLS`);
    const girlsCats = await girlsCatsRes.json();
    const allGirls = girlsCats.data.every((c: any) => c.gender === "GIRLS");
    await assert(
      "GET /api/categories?gender=GIRLS filters correctly",
      girlsCatsRes.status === 200 && allGirls && girlsCats.data.length > 0,
      `Count: ${girlsCats.data?.length}`
    );

    // 3. POST /api/categories (Create Category)
    const createCatRes = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nightwear & Loungewear",
        gender: "BOYS",
        description: "Cozy pajama sets and loungewear for boys.",
      }),
    });
    const createdCat = await createCatRes.json();
    const newCatId = createdCat.data?.id;
    await assert(
      "POST /api/categories creates new category",
      createCatRes.status === 201 && createdCat.success === true && createdCat.data?.name === "Nightwear & Loungewear",
      JSON.stringify(createdCat)
    );

    // 4. GET /api/categories/:id
    const singleCatRes = await fetch(`${BASE_URL}/categories/${newCatId}`);
    const singleCat = await singleCatRes.json();
    await assert(
      `GET /api/categories/:id returns newly created category`,
      singleCatRes.status === 200 && singleCat.data?.id === newCatId,
      JSON.stringify(singleCat)
    );

    // 5. PUT /api/categories/:id (Update Category)
    const updateCatRes = await fetch(`${BASE_URL}/categories/${newCatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Updated description for boys sleepwear.",
      }),
    });
    const updatedCat = await updateCatRes.json();
    await assert(
      "PUT /api/categories/:id updates category",
      updateCatRes.status === 200 && updatedCat.data?.description === "Updated description for boys sleepwear.",
      JSON.stringify(updatedCat)
    );

    // 6. DELETE /api/categories/:id
    const deleteCatRes = await fetch(`${BASE_URL}/categories/${newCatId}`, {
      method: "DELETE",
    });
    const deleteCat = await deleteCatRes.json();
    await assert(
      "DELETE /api/categories/:id removes category",
      deleteCatRes.status === 200 && deleteCat.success === true,
      JSON.stringify(deleteCat)
    );

    // ----------------------------------------------------
    // PRODUCT TESTS
    // ----------------------------------------------------
    console.log("\n--- Product Tests ---");

    // 7. GET /api/products (Pagination)
    const paginatedRes = await fetch(`${BASE_URL}/products?page=1&limit=3`);
    const paginated = await paginatedRes.json();
    await assert(
      "GET /api/products returns paginated products",
      paginatedRes.status === 200 &&
        paginated.success === true &&
        paginated.data.length <= 3 &&
        paginated.pagination?.page === 1 &&
        paginated.pagination?.limit === 3 &&
        paginated.pagination?.total > 0,
      `Returned ${paginated.data?.length} items, Total: ${paginated.pagination?.total}`
    );

    // 8. GET /api/products?gender=GIRLS
    const girlsProductsRes = await fetch(`${BASE_URL}/products?gender=GIRLS`);
    const girlsProducts = await girlsProductsRes.json();
    const onlyGirls = girlsProducts.data.every((p: any) => p.gender === "GIRLS");
    await assert(
      "GET /api/products?gender=GIRLS filters by gender",
      girlsProductsRes.status === 200 && onlyGirls && girlsProducts.data.length > 0,
      `Count: ${girlsProducts.data?.length}`
    );

    // 9. GET /api/products?gender=BOYS&ageGroup=6-9
    const boyAgeProductsRes = await fetch(`${BASE_URL}/products?gender=BOYS&ageGroup=6-9`);
    const boyAgeProducts = await boyAgeProductsRes.json();
    const correctAgeAndGender = boyAgeProducts.data.every(
      (p: any) => p.gender === "BOYS" && p.ageGroup === "6-9"
    );
    await assert(
      "GET /api/products?gender=BOYS&ageGroup=6-9 filters by gender and age group",
      boyAgeProductsRes.status === 200 && correctAgeAndGender && boyAgeProducts.data.length > 0,
      `Count: ${boyAgeProducts.data?.length}`
    );

    // 10. GET /api/products?search=frock (Text Search)
    const searchRes = await fetch(`${BASE_URL}/products?search=frock`);
    const searchData = await searchRes.json();
    const hasFrockInNameOrDesc = searchData.data.every(
      (p: any) =>
        p.name.toLowerCase().includes("frock") || (p.description && p.description.toLowerCase().includes("frock"))
    );
    await assert(
      "GET /api/products?search=frock searches by keyword in name/description",
      searchRes.status === 200 && searchData.data.length > 0 && hasFrockInNameOrDesc,
      `Search results: ${searchData.data.map((p: any) => p.name).join(", ")}`
    );

    // 11. GET /api/products?minPrice=500&maxPrice=1500
    const priceRes = await fetch(`${BASE_URL}/products?minPrice=500&maxPrice=1500`);
    const priceData = await priceRes.json();
    await assert(
      "GET /api/products?minPrice=500&maxPrice=1500 filters by price range",
      priceRes.status === 200 && priceData.data.length > 0,
      `Matching products count: ${priceData.data?.length}`
    );

    // 12. GET /api/products?size=6-7Y (Variant level filter)
    const sizeRes = await fetch(`${BASE_URL}/products?size=6-7Y`);
    const sizeData = await sizeRes.json();
    const allHaveSize = sizeData.data.every((p: any) =>
      p.variants.some((v: any) => v.size.toLowerCase() === "6-7y")
    );
    await assert(
      "GET /api/products?size=6-7Y filters by variant size in SQL",
      sizeRes.status === 200 && sizeData.data.length > 0 && allHaveSize,
      `Count: ${sizeData.data?.length}`
    );

    // 13. GET /api/products/slug/:slug
    const slugRes = await fetch(`${BASE_URL}/products/slug/boys-dinosaur-printed-cotton-t-shirt`);
    const slugProduct = await slugRes.json();
    await assert(
      "GET /api/products/slug/:slug returns full product details with relations",
      slugRes.status === 200 &&
        slugProduct.success === true &&
        slugProduct.data?.slug === "boys-dinosaur-printed-cotton-t-shirt" &&
        Array.isArray(slugProduct.data?.variants) &&
        Array.isArray(slugProduct.data?.images) &&
        slugProduct.data?.category !== null,
      `Product: ${slugProduct.data?.name}, Variants: ${slugProduct.data?.variants?.length}`
    );

    // Verify stockStatus calculation
    const variants = slugProduct.data?.variants || [];
    const hasOut = variants.some((v: any) => v.stockStatus === "OUT_OF_STOCK");
    const hasLow = variants.some((v: any) => v.stockStatus === "LOW_STOCK");
    const hasIn = variants.some((v: any) => v.stockStatus === "IN_STOCK");
    await assert(
      "Stock status properly calculates IN_STOCK, LOW_STOCK, and OUT_OF_STOCK",
      hasOut && hasLow && hasIn,
      `Statuses found: OUT=${hasOut}, LOW=${hasLow}, IN=${hasIn}`
    );

    // 14. POST /api/products (Create Product with variants, inventory, and images)
    const firstCat = allCats.data[0];
    const newProductPayload = {
      categoryId: firstCat.id,
      name: "Boys Smart Striped Polo Shirt",
      gender: "BOYS",
      ageGroup: "6-9",
      brand: "Kalyan Kids",
      description: "Classic collar polo t-shirt with knitted stripes.",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800",
          altText: "Front striped polo",
          sortOrder: 0,
        },
      ],
      variants: [
        {
          size: "6-7Y",
          color: "White/Navy",
          price: 649.0,
          sku: "TEST-BOY-POLO-WN-67",
          quantity: 10,
          lowStockThreshold: 3,
        },
        {
          size: "8-9Y",
          color: "White/Navy",
          price: 699.0,
          sku: "TEST-BOY-POLO-WN-89",
          quantity: 2,
          lowStockThreshold: 3,
        },
      ],
    };

    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProductPayload),
    });
    const createdProd = await createProdRes.json();
    const createdProdId = createdProd.data?.id;
    await assert(
      "POST /api/products creates product, variants, inventory, and images",
      createProdRes.status === 201 &&
        createdProd.success === true &&
        createdProd.data?.variants?.length === 2 &&
        createdProd.data?.images?.length === 1,
      JSON.stringify(createdProd)
    );

    // 15. Negative Test: Duplicate SKU
    const dupSkuRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProductPayload,
        name: "Another Polo Shirt",
        slug: "another-polo-shirt",
      }),
    });
    const dupSkuData = await dupSkuRes.json();
    await assert(
      "POST /api/products rejects duplicate SKU with HTTP 400",
      dupSkuRes.status === 400 && dupSkuData.success === false,
      dupSkuData.message
    );

    // 16. Negative Test: Negative Price (Zod validation)
    const negPriceRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProductPayload,
        name: "Invalid Negative Price Shirt",
        variants: [
          {
            size: "6-7Y",
            color: "Red",
            price: -100, // Invalid!
            sku: "TEST-NEG-PRICE-SKU",
          },
        ],
      }),
    });
    const negPriceData = await negPriceRes.json();
    await assert(
      "Zod validates and rejects negative price with HTTP 400",
      negPriceRes.status === 400 && negPriceData.success === false && negPriceData.message === "Validation failed",
      JSON.stringify(negPriceData)
    );

    // 17. Negative Test: Invalid Age Group (Zod validation)
    const invalidAgeRes = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProductPayload,
        name: "Invalid Age Group Shirt",
        ageGroup: "25-30", // Invalid!
        variants: [
          {
            size: "6-7Y",
            color: "Red",
            price: 500,
            sku: "TEST-INV-AGE-SKU",
          },
        ],
      }),
    });
    const invalidAgeData = await invalidAgeRes.json();
    await assert(
      "Zod validates and rejects invalid age group with HTTP 400",
      invalidAgeRes.status === 400 && invalidAgeData.success === false,
      JSON.stringify(invalidAgeData)
    );

    // 18. PUT /api/products/:id (Update product)
    const updateProdRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Updated description for striped polo shirt.",
        brand: "Kalyan Premium Kids",
      }),
    });
    const updatedProd = await updateProdRes.json();
    await assert(
      "PUT /api/products/:id updates product fields",
      updateProdRes.status === 200 && updatedProd.data?.brand === "Kalyan Premium Kids",
      JSON.stringify(updatedProd)
    );

    // 19. DELETE /api/products/:id (Delete product)
    const deleteProdRes = await fetch(`${BASE_URL}/products/${createdProdId}`, {
      method: "DELETE",
    });
    const deleteProd = await deleteProdRes.json();
    await assert(
      "DELETE /api/products/:id removes product",
      deleteProdRes.status === 200 && deleteProd.success === true,
      JSON.stringify(deleteProd)
    );

    // 20. Confirm 404 after deletion
    const getDeletedRes = await fetch(`${BASE_URL}/products/${createdProdId}`);
    await assert(
      "GET /api/products/:id returns 404 for deleted product",
      getDeletedRes.status === 404,
      `Status: ${getDeletedRes.status}`
    );

    console.log("\n=================================");
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`Test Summary: ${passedCount} / ${results.length} PASSED`);
    console.log("=================================");

    if (passedCount === results.length) {
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
      process.exit(0);
    } else {
      console.error("❌ Some tests failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test runner encountered error:", error);
    process.exit(1);
  }
}

runTests();
