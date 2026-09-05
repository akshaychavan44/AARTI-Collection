import bcrypt from "bcryptjs";
import { db, sql } from "./index";
import {
  categories,
  products,
  productImages,
  productVariants,
  inventory,
  users,
  passwordResetTokens,
  carts,
  cartItems,
  wishlists,
  wishlistItems,
  orders,
  orderItems,
  coupons,
} from "./schema";

async function seed() {
  console.log("🌱 Starting database seeding for Kalyan Kids Clothing Shop...");

  try {
    // 1. Clean existing records in reverse order of foreign keys
    console.log("🧹 Clearing old data...");
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(coupons);
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(wishlistItems);
    await db.delete(wishlists);
    await db.delete(passwordResetTokens);
    await db.delete(users);
    await db.delete(inventory);
    await db.delete(productVariants);
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(categories);

    // 2. Insert Categories
    console.log("📁 Inserting Categories...");
    const boysCategoryNames = [
      "T-Shirts",
      "Shirts",
      "Jeans",
      "Trousers",
      "Shorts",
      "Ethnic Wear",
      "Party Wear",
      "Jackets",
    ];

    const girlsCategoryNames = [
      "Dresses",
      "Tops",
      "Frocks",
      "Jeans",
      "Skirts",
      "Trousers",
      "Ethnic Wear",
      "Party Wear",
      "Jackets",
    ];

    const categoryInserts = [
      ...boysCategoryNames.map((name) => ({
        name,
        slug: `boys-${name.toLowerCase().replace(/\s+/g, "-")}`,
        gender: "BOYS" as const,
        description: `Trendy and comfortable ${name.toLowerCase()} for boys.`,
      })),
      ...girlsCategoryNames.map((name) => ({
        name,
        slug: `girls-${name.toLowerCase().replace(/\s+/g, "-")}`,
        gender: "GIRLS" as const,
        description: `Elegant and cute ${name.toLowerCase()} for girls.`,
      })),
    ];

    const insertedCategories = await db.insert(categories).values(categoryInserts).returning();
    const categoryMap = new Map(insertedCategories.map((c) => [`${c.gender}_${c.name}`, c.id]));

    // 3. Products Definition
    console.log("👕 Inserting Products, Variants, Images, and Inventory...");
    const sampleProducts = [
      // Product 1: Boys T-Shirt
      {
        name: "Boys Dinosaur Printed Cotton T-Shirt",
        slug: "boys-dinosaur-printed-cotton-t-shirt",
        categoryKey: "BOYS_T-Shirts",
        gender: "BOYS" as const,
        ageGroup: "3-5" as const,
        brand: "Kalyan Kids",
        compareAtPrice: "699.00",
        isFeatured: true,
        description: "Soft 100% combed cotton breathable t-shirt featuring playful dinosaur graphics. Perfect for everyday summer wear.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800", altText: "Front view dinosaur t-shirt", sortOrder: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800", altText: "Close up graphic print", sortOrder: 1 },
        ],
        variants: [
          { size: "3-4Y", color: "Navy Blue", price: "499.00", sku: "BOY-TSH-DINO-NB-34", stock: 15, threshold: 5 },
          { size: "4-5Y", color: "Navy Blue", price: "499.00", sku: "BOY-TSH-DINO-NB-45", stock: 3, threshold: 5 }, // LOW_STOCK
          { size: "3-4Y", color: "Olive Green", price: "499.00", sku: "BOY-TSH-DINO-OG-34", stock: 0, threshold: 5 }, // OUT_OF_STOCK
          { size: "4-5Y", color: "Olive Green", price: "499.00", sku: "BOY-TSH-DINO-OG-45", stock: 20, threshold: 5 },
        ],
      },
      // Product 2: Boys Denim Jeans
      {
        name: "Boys Slim Fit Stretchable Denim Jeans",
        slug: "boys-slim-fit-stretchable-denim-jeans",
        categoryKey: "BOYS_Jeans",
        gender: "BOYS" as const,
        ageGroup: "6-9" as const,
        brand: "Little Denim Co",
        compareAtPrice: "1299.00",
        isFeatured: false,
        description: "Durable mid-wash denim jeans with adjustable elastic waistband and flexible stretch for active school and play.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800", altText: "Boys denim jeans front", sortOrder: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1475403614135-5f1aa0eb5015?w=800", altText: "Denim texture details", sortOrder: 1 },
        ],
        variants: [
          { size: "6-7Y", color: "Dark Blue", price: "899.00", sku: "BOY-JNS-SLIM-DB-67", stock: 12, threshold: 4 },
          { size: "8-9Y", color: "Dark Blue", price: "949.00", sku: "BOY-JNS-SLIM-DB-89", stock: 2, threshold: 4 }, // LOW_STOCK
          { size: "6-7Y", color: "Light Blue", price: "899.00", sku: "BOY-JNS-SLIM-LB-67", stock: 8, threshold: 4 },
          { size: "8-9Y", color: "Light Blue", price: "949.00", sku: "BOY-JNS-SLIM-LB-89", stock: 0, threshold: 4 }, // OUT_OF_STOCK
        ],
      },
      // Product 3: Boys Ethnic Kurta Set
      {
        name: "Boys Traditional Silk Blend Kurta Pajama Set",
        slug: "boys-traditional-silk-blend-kurta-pajama-set",
        categoryKey: "BOYS_Ethnic Wear",
        gender: "BOYS" as const,
        ageGroup: "10-13" as const,
        brand: "Utsav Kids",
        compareAtPrice: "1999.00",
        isFeatured: true,
        description: "Festive silk-blend royal blue kurta with embroidered mandarin collar, paired with crisp white cotton pajama.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800", altText: "Boys ethnic kurta pajama", sortOrder: 0 },
        ],
        variants: [
          { size: "10-11Y", color: "Royal Blue", price: "1499.00", sku: "BOY-ETH-KUR-RB-1011", stock: 10, threshold: 3 },
          { size: "12-13Y", color: "Royal Blue", price: "1599.00", sku: "BOY-ETH-KUR-RB-1213", stock: 7, threshold: 3 },
          { size: "10-11Y", color: "Maroon", price: "1499.00", sku: "BOY-ETH-KUR-MR-1011", stock: 5, threshold: 3 },
          { size: "12-13Y", color: "Maroon", price: "1599.00", sku: "BOY-ETH-KUR-MR-1213", stock: 1, threshold: 3 }, // LOW_STOCK
        ],
      },
      // Product 4: Girls Floral Party Frock
      {
        name: "Girls Floral Layered Party Frock",
        slug: "girls-floral-layered-party-frock",
        categoryKey: "GIRLS_Frocks",
        gender: "GIRLS" as const,
        ageGroup: "3-5" as const,
        brand: "Princess Bloom",
        compareAtPrice: "1499.00",
        isFeatured: true,
        description: "Enchanting fit and flare frock featuring multi-layer net flare, soft cotton lining, and floral lace bodice with satin waist bow.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800", altText: "Pink floral party frock", sortOrder: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800", altText: "Bow detail party frock", sortOrder: 1 },
        ],
        variants: [
          { size: "3-4Y", color: "Peach Pink", price: "999.00", sku: "GRL-FRK-FLOR-PP-34", stock: 14, threshold: 5 },
          { size: "4-5Y", color: "Peach Pink", price: "1099.00", sku: "GRL-FRK-FLOR-PP-45", stock: 4, threshold: 5 }, // LOW_STOCK
          { size: "3-4Y", color: "Sky Blue", price: "999.00", sku: "GRL-FRK-FLOR-SB-34", stock: 18, threshold: 5 },
          { size: "4-5Y", color: "Sky Blue", price: "1099.00", sku: "GRL-FRK-FLOR-SB-45", stock: 0, threshold: 5 }, // OUT_OF_STOCK
        ],
      },
      // Product 5: Girls Embroidered Lehenga Choli
      {
        name: "Girls Festive Foil Print Lehenga Choli",
        slug: "girls-festive-foil-print-lehenga-choli",
        categoryKey: "GIRLS_Ethnic Wear",
        gender: "GIRLS" as const,
        ageGroup: "6-9" as const,
        brand: "Utsav Kids",
        compareAtPrice: "2499.00",
        isFeatured: true,
        description: "Graceful festive lehenga choli set adorned with gold foil ethnic motifs and matching net dupatta with lace borders.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800", altText: "Festive Lehenga Choli front", sortOrder: 0 },
        ],
        variants: [
          { size: "6-7Y", color: "Magenta", price: "1699.00", sku: "GRL-ETH-LHN-MG-67", stock: 9, threshold: 3 },
          { size: "8-9Y", color: "Magenta", price: "1799.00", sku: "GRL-ETH-LHN-MG-89", stock: 3, threshold: 3 }, // LOW_STOCK
          { size: "6-7Y", color: "Yellow", price: "1699.00", sku: "GRL-ETH-LHN-YL-67", stock: 11, threshold: 3 },
          { size: "8-9Y", color: "Yellow", price: "1799.00", sku: "GRL-ETH-LHN-YL-89", stock: 6, threshold: 3 },
        ],
      },
      // Product 6: Girls Casual Summer Dress
      {
        name: "Girls Polka Dot Cotton A-Line Dress",
        slug: "girls-polka-dot-cotton-a-line-dress",
        categoryKey: "GIRLS_Dresses",
        gender: "GIRLS" as const,
        ageGroup: "10-13" as const,
        brand: "Kalyan Kids",
        compareAtPrice: "1199.00",
        isFeatured: false,
        description: "Charming casual A-line sleeveless summer dress with classic polka dots, flutter sleeves, and breathable cotton fabric.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800", altText: "Polka dot dress model", sortOrder: 0 },
        ],
        variants: [
          { size: "10-11Y", color: "Red", price: "799.00", sku: "GRL-DRS-POLK-RD-1011", stock: 15, threshold: 4 },
          { size: "12-13Y", color: "Red", price: "849.00", sku: "GRL-DRS-POLK-RD-1213", stock: 0, threshold: 4 }, // OUT_OF_STOCK
          { size: "10-11Y", color: "Navy", price: "799.00", sku: "GRL-DRS-POLK-NV-1011", stock: 8, threshold: 4 },
          { size: "12-13Y", color: "Navy", price: "849.00", sku: "GRL-DRS-POLK-NV-1213", stock: 12, threshold: 4 },
        ],
      },
      // Product 7: Boys Winter Hooded Jacket
      {
        name: "Boys Colorblock Lightweight Puffer Jacket",
        slug: "boys-colorblock-lightweight-puffer-jacket",
        categoryKey: "BOYS_Jackets",
        gender: "BOYS" as const,
        ageGroup: "14-16" as const,
        brand: "Urban Kids",
        compareAtPrice: "2699.00",
        isFeatured: true,
        description: "Warm and trendy insulated puffer jacket with detachable fleece-lined hood, wind-resistant shell, and dual zipper pockets.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800", altText: "Boys puffer jacket", sortOrder: 0 },
        ],
        variants: [
          { size: "14-15Y", color: "Black/Grey", price: "1899.00", sku: "BOY-JCK-PUFF-BG-1415", stock: 7, threshold: 2 },
          { size: "15-16Y", color: "Black/Grey", price: "1999.00", sku: "BOY-JCK-PUFF-BG-1516", stock: 2, threshold: 2 }, // LOW_STOCK
        ],
      },
      // Product 8: Toddler Unisex Romper (0-2 age group)
      {
        name: "Baby Boys Organic Cotton Romper Suit",
        slug: "baby-boys-organic-cotton-romper-suit",
        categoryKey: "BOYS_Ethnic Wear",
        gender: "BOYS" as const,
        ageGroup: "0-2" as const,
        brand: "BabyJoy",
        compareAtPrice: "599.00",
        isFeatured: false,
        description: "Ultra-soft certified organic cotton one-piece romper with nickel-free snaps for effortless diaper changes.",
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", altText: "Baby cotton romper", sortOrder: 0 },
        ],
        variants: [
          { size: "0-6M", color: "Sky Blue", price: "399.00", sku: "BOY-RMP-ORG-SB-06M", stock: 25, threshold: 5 },
          { size: "6-12M", color: "Sky Blue", price: "449.00", sku: "BOY-RMP-ORG-SB-612M", stock: 16, threshold: 5 },
          { size: "12-18M", color: "Sky Blue", price: "449.00", sku: "BOY-RMP-ORG-SB-1218M", stock: 1, threshold: 5 }, // LOW_STOCK
        ],
      },
    ];

    for (const item of sampleProducts) {
      const categoryId = categoryMap.get(item.categoryKey);
      if (!categoryId) {
        console.warn(`⚠️ Category ${item.categoryKey} not found, skipping product ${item.name}`);
        continue;
      }

      // Insert Product
      const [newProduct] = await db
        .insert(products)
        .values({
          categoryId,
          name: item.name,
          slug: item.slug,
          gender: item.gender,
          ageGroup: item.ageGroup,
          brand: item.brand,
          description: item.description,
          compareAtPrice: item.compareAtPrice,
          isFeatured: (item as any).isFeatured ?? false,
        })
        .returning();

      // Insert Product Images
      if (item.images.length > 0) {
        await db.insert(productImages).values(
          item.images.map((img) => ({
            productId: newProduct.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            sortOrder: img.sortOrder,
          }))
        );
      }

      // Insert Variants & Inventory
      for (const v of item.variants) {
        const [newVariant] = await db
          .insert(productVariants)
          .values({
            productId: newProduct.id,
            size: v.size,
            color: v.color,
            price: v.price,
            sku: v.sku,
          })
          .returning();

        await db.insert(inventory).values({
          variantId: newVariant.id,
          quantity: v.stock,
          lowStockThreshold: v.threshold,
        });
      }
    }

    // 4. Seed Users (Admin & Customer)
    console.log("👤 Seeding Admin and Customer Accounts...");
    const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
    const customerPasswordHash = await bcrypt.hash("Customer@12345", 10);

    const insertedUsers = await db
      .insert(users)
      .values([
        {
          name: "Kalyan Admin",
          email: "admin@kalyankids.com",
          passwordHash: adminPasswordHash,
          role: "ADMIN",
          isActive: true,
        },
        {
          name: "Priya Sharma",
          email: "customer@example.com",
          passwordHash: customerPasswordHash,
          role: "CUSTOMER",
          isActive: true,
        },
      ])
      .returning();

    // 6. Insert Promotional Coupons
    console.log("🎟️ Inserting Seed Coupons...");
    const insertedCoupons = await db
      .insert(coupons)
      .values([
        {
          code: "WELCOME10",
          discountType: "PERCENTAGE",
          discountValue: "10.00",
          minOrderAmount: "0.00",
          isActive: true,
        },
        {
          code: "KALYAN50",
          discountType: "FIXED",
          discountValue: "50.00",
          minOrderAmount: "499.00",
          isActive: true,
        },
        {
          code: "FESTIVE15",
          discountType: "PERCENTAGE",
          discountValue: "15.00",
          minOrderAmount: "999.00",
          isActive: true,
        },
      ])
      .returning();

    console.log("✅ Seeding completed successfully!");
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Products: ${sampleProducts.length}`);
    console.log(`   - Coupons: ${insertedCoupons.length}`);
    console.log(`   - Users: ${insertedUsers.length} (Admin: admin@kalyankids.com, Customer: customer@example.com)`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
