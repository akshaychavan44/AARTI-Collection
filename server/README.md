# Kids Clothing E-Commerce — Full Stack Production Architecture

A clean, modular, production-ready, and beginner-friendly kids clothing e-commerce web platform for a shop in Kalyan selling boys' and girls' clothing up to age 16. Built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL (Neon)**, **Drizzle ORM**, and **Next.js 16 (App Router)**.

---

## 🛠️ Complete Tech Stack

* **Backend Runtime:** Node.js (v18+)
* **Backend Framework:** Express.js (Modular Route & Controller Architecture)
* **Language:** TypeScript 5.7+
* **Database:** Neon Serverless PostgreSQL
* **ORM:** Drizzle ORM (using `@neondatabase/serverless` HTTP driver)
* **Authentication:** JWT in HttpOnly secure cookies + Bearer token support, bcrypt hashing
* **Role-Based Access Control (RBAC):** Customer vs Admin authorization with server-side middleware enforcement
* **Payment Gateway:** Razorpay (Test Mode & Live with HMAC SHA256 signature verification)
* **Email Service:** Resend (with graceful console fallback for local development)
* **Validation:** Zod 3.24+
* **Frontend:** Next.js 16 (App Router with Turbopack), React 19, Tailwind CSS 4, Lucide React

---

## 📁 Key Directories & Modules

* `server/src/db/schema/` — Relational Drizzle schemas: `users`, `password_reset_tokens`, `categories`, `products`, `product_images`, `product_variants`, `inventory`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, `orders`, `order_items`, `coupons`.
* `server/src/services/` — `AdminService`, `ProductService`, `CategoryService`, `OrderService`, `PaymentService`, `CouponService`, `EmailService`, `CartService`, `WishlistService`, `AuthService`.
* `server/src/controllers/` — `AdminController`, `ProductController`, `CategoryController`, `OrderController`, `PaymentController`, `CouponController`, `AuthController`.
* `client/src/app/admin/` — Admin Management Console (`/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/customers`, `/admin/coupons`).
* `client/src/app/` — Customer Storefront (`/`, `/products`, `/products/[slug]`, `/cart`, `/wishlist`, `/checkout`, `/order-success/[orderNumber]`, `/account/orders`, `/profile`).

---

## 🚀 Available NPM Scripts

### Backend (`server/`)
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Express dev server with instant hot reload via `tsx` (`http://localhost:5000`) |
| `npm run build` | Compile TypeScript into production JavaScript in `dist/` |
| `npm run start` | Run compiled production bundle with `node dist/server.js` |
| `npm run db:test` | Test Neon PostgreSQL connectivity |
| `npm run db:generate` | Generate Drizzle SQL migration files |
| `npm run db:migrate` | Apply pending Drizzle migrations to Neon PostgreSQL |
| `npm run db:seed` | Seed database with initial products, variants, categories, inventory, and users |
| `npm run test:phase6` | Run Phase 6 Admin Dashboard, RBAC & Safeguard test suite (**21/21 passing**) |
| `npm run test:phase5` | Run Phase 5 Checkout, Razorpay & Orders test suite (**19/19 passing**) |
| `npm run test:phase4` | Run Phase 4 Catalog, Cart & Wishlist test suite (**24/24 passing**) |
| `npm run test:auth` | Run Phase 3 Authentication test suite (**15/15 passing**) |
| `npm run test:phase2` | Run Phase 2 Products & Categories test suite (**21/21 passing**) |
| `npm run test:all` | Run all test suites consecutively (**100 / 100 TESTS PASSING**) |

### Frontend (`client/`)
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Next.js development server on `http://localhost:3000` |
| `npm run build` | Compile Next.js production build with Turbopack (verified with 0 errors) |
| `npm run start` | Start Next.js production server |

---

## 📡 API Endpoints Reference

### 1. Admin Management Console (`/api/admin`)
*All `/api/admin/*` endpoints strictly require `requireAuth` + `requireRole("ADMIN")`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Dashboard telemetry: Total Products, Categories, Orders, Customers, Revenue, Low Stock |
| `GET` | `/api/admin/products` | All products with category, aggregate stock, and active status |
| `POST` | `/api/admin/products` | Create product with variants, initial inventory, and images |
| `GET` | `/api/admin/products/:id` | Get product details for editing |
| `PUT` | `/api/admin/products/:id` | Update product fields and pricing |
| `DELETE` | `/api/admin/products/:id` | Safe delete: soft-deactivates if ordered, hard-deletes if unpurchased |
| `PATCH` | `/api/admin/products/:id/status` | Toggle product active/inactive showcase status |
| `GET` | `/api/admin/categories` | List categories with count of assigned products |
| `POST` | `/api/admin/categories` | Create new category |
| `PUT` | `/api/admin/categories/:id` | Update category details |
| `DELETE` | `/api/admin/categories/:id` | Safe delete: rejects with 400 if products are assigned |
| `GET` | `/api/admin/orders` | List all customer orders with search & status filters |
| `GET` | `/api/admin/orders/:orderNumber` | Detailed order receipt with customer information |
| `PATCH` | `/api/admin/orders/:orderNumber/status` | Update order/payment status (auto-synchronizes inventory) |
| `GET` | `/api/admin/customers` | List registered customers, order counts, and total spending |
| `PATCH` | `/api/admin/customers/:id/status` | Toggle customer active/suspended account status |
| `GET` | `/api/admin/coupons` | List all promotional discount vouchers |
| `POST` | `/api/admin/coupons` | Create coupon with percentage/fixed discount rules |
| `PUT` | `/api/admin/coupons/:id` | Update coupon parameters |
| `DELETE` | `/api/admin/coupons/:id` | Remove coupon |

---

## 🔒 Security & Data Integrity

1. **Server-Side RBAC Enforcement**:
   - Customer tokens attempting to reach `/api/admin/*` receive HTTP 403 Forbidden.
   - Unauthenticated callers receive HTTP 401 Unauthorized.
2. **Referential Integrity on Deletion**:
   - Deleting a category with active products is rejected with HTTP 400.
   - Deleting a product with existing customer order items preserves historical receipts by automatically soft-deactivating the product (`isActive = false`) rather than throwing a foreign key violation.
3. **Inventory Synchronization**:
   - Marking an order `CONFIRMED` verifies and deducts variant inventory atomically.
   - Marking an order `CANCELLED` restores purchased quantities to `inventory.quantity`.
4. **Authoritative Pricing**:
   - Prices and discounts are calculated strictly in PostgreSQL; frontend amounts are never trusted.
5. **HMAC SHA256 Signature Verification**:
   - Razorpay payment signatures are validated cryptographically on the server before confirming payments.
6. **Secret Keys Isolation**:
   - `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY` are kept exclusively in `server/.env` and are never bundled into client assets.
