# 🛍️ Kalyan Kids Clothing E-Commerce (AARTI Collection)

A modern, full-stack luxury kids clothing e-commerce web platform for boys' and girls' clothing up to age 16. Built with **Next.js 16 (App Router)**, **React 19**, **Node.js**, **Express**, **TypeScript**, **PostgreSQL (Neon)**, **Drizzle ORM**, **Razorpay**, and **Tailwind CSS**.

---

## 🌟 Key Features

* **Storefront Experience**:
  * Luxury, minimal, and mobile-first responsive design.
  * Product catalog with real-time category, gender, age group (0–16 yrs), and price range filtering.
  * Interactive product detail pages with size/color variant pickers and live inventory indicators.
* **Shopping Flow**:
  * Persistent database shopping basket and wishlist.
  * Server-side authoritative pricing (prevents client-side price tampering).
  * 1-click "Move to Cart" from wishlist.
* **Checkout & Payments**:
  * Streamlined checkout without delivery address friction.
  * Promotional coupon engine (`WELCOME10`, `KALYAN50`, `FESTIVE15`).
  * **Razorpay Payment Gateway** integration with HMAC SHA256 cryptographic signature verification.
  * Automated order confirmation emails via **Resend** (with graceful dev logging fallback).
* **Customer Account & Orders**:
  * Secure JWT authentication with HttpOnly cookies and bcrypt password hashing.
  * Order history with itemized receipts, statuses (`PENDING`, `CONFIRMED`, `CANCELLED`), and payment statuses.
  * Interactive customer cancellation with **automatic inventory restoration**.
* **Admin Management Console (`/admin`)**:
  * Server-guarded Role-Based Access Control (RBAC).
  * Real-time store analytics: Revenue, Orders, Products, and Low-Stock alerts.
  * Complete Product, Category, Customer, and Coupon management.
  * Safeguarded deletions to protect historical order records and referential integrity.

---

## 📁 Repository Structure

```
AARTI-Collection/
├── client/                     # Next.js 16 App Router Frontend
│   ├── src/
│   │   ├── app/                # App Router routes (/products, /cart, /checkout, /admin, etc.)
│   │   ├── components/         # Reusable UI components & Navbar
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   └── lib/                # API client helper
│   ├── package.json
│   └── .env.example
│
├── server/                     # Express.js + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment variables & runtime config
│   │   ├── controllers/        # Route controllers (Admin, Product, Order, Payment, Auth, etc.)
│   │   ├── db/                 # Drizzle schemas, migrations & seed script
│   │   ├── middleware/         # Auth (requireAuth, requireRole), error handling, validations
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Core business logic services
│   │   └── validations/        # Zod request validation schemas
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Neon PostgreSQL Database**: Connection string with SSL mode

---

### 2. Backend Setup
1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Neon database URL and Razorpay test credentials:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations & seed initial data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend running on `http://localhost:5000`*

---

### 3. Frontend Setup
1. Open a second terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Storefront running on `http://localhost:3000`*

---

## 🔑 Default Accounts for Testing

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kalyankids.com` | `Admin@12345` | Storefront & Admin Console (`/admin`) |
| **Customer** | `customer@example.com` | `Customer@12345` | Storefront, Shopping Cart & Orders |

---

## 🧪 Automated Testing

Run the complete test suite across all 6 phases:
```bash
cd server
npm run test:all
```
*(100 / 100 tests passing)*

---

## 📄 License
ISC
