# 🛍️ Kalyan Kids Clothing E-Commerce (AARTI Collection)

A modern, full-stack luxury kids clothing e-commerce web platform for boys' and girls' clothing up to age 16. Built with **Next.js 16 (App Router)**, **React 19**, **Node.js**, **Express Serverless**, **TypeScript**, **PostgreSQL (Neon)**, **Drizzle ORM**, **Razorpay**, and **Tailwind CSS**.

---

## 🚀 1-Click Vercel Deployment

This project is unified into a **single full-stack Next.js project**. When imported into Vercel, Vercel automatically detects Next.js at the root and deploys both the frontend pages and the backend API as serverless functions.

### Steps to Deploy on Vercel:

1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"** -> **"Import"**.
2. Select your repository: `akshaychavan44/AARTI-Collection`.
3. **Project Settings**:
   - **Root Directory**: Leave as `./` (default)
   - **Framework Preset**: Next.js (automatically detected)
   - **Build Command**: `next build` (default)
4. **Environment Variables**:
   Under **Environment Variables**, paste the following keys and values:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_YOUR_PASSWORD@ep-cool-cloud-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: `super_secret_jwt_key_kalyan_kids_2026_auth_system_replace_in_prod`
   - `JWT_EXPIRES_IN`: `7d`
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
   - `RAZORPAY_WEBHOOK_SECRET`: Your Razorpay Webhook Secret (optional)
   - `RESEND_API_KEY`: Your Resend API key (optional)
   - `RESEND_FROM_EMAIL`: `orders@kalyankids.com` (optional)
   - `NEXT_PUBLIC_API_URL`: `/api`
5. Click **Deploy**. Vercel will build and launch your full-stack store in under 1 minute!

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

## 📁 Repository Structure (Unified Full-Stack)

```
AARTI-Collection/
├── src/
│   ├── app/                    # Next.js 16 App Router UI
│   │   ├── page.tsx            # Luxury Home Landing Page
│   │   ├── products/           # Catalog & Product Details
│   │   ├── cart/               # Cart Page
│   │   ├── checkout/           # Checkout & Razorpay Modal
│   │   ├── admin/              # Admin Console (Dashboard, Products, Orders, Categories, Coupons)
│   │   ├── account/orders/     # Order History & Tracking
│   │   └── (auth)/             # Login, Register, Forgot Password, Reset Password
│   ├── components/             # Reusable UI (Navbar, Modals, Badges)
│   ├── context/                # Client State (Auth, Cart, Wishlist)
│   ├── lib/                    # API Client (configured for same-origin /api)
│   ├── pages/api/              # Next.js Serverless API Route Adapter (mounts Express)
│   │   └── [[...all]].ts       # Handles all /api/* requests seamlessly on Vercel
│   └── server/                 # Backend Core (Express + Drizzle + Neon)
│       ├── config/             # Environment validation (Zod)
│       ├── controllers/        # Product, Order, Auth, Cart, Wishlist, Admin controllers
│       ├── db/                 # Drizzle Schemas, Migrations & Seed data
│       ├── middleware/         # Auth (JWT), validation & error handling
│       ├── routes/             # Modular API routes
│       └── services/           # Business logic & payment services
├── public/                     # Static media & assets
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js 16 configuration
├── package.json                # Single unified package manifest
├── tsconfig.json               # TypeScript path mappings (@/* -> ./src/*)
├── vercel.json                 # Vercel deployment specification
└── README.md                   # Project documentation
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` contains your Neon PostgreSQL connection string.

### 3. Database Migration & Seed
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Unified Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Both the frontend UI and the `/api` backend endpoints run simultaneously on port 3000!

---

## 🧪 Testing

Run backend and API validation suites:
```bash
npm run test:all
```
