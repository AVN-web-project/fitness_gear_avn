# AVN FITNESS GEAR — Full-Stack E-Commerce Platform

> **Built to Support. Designed to Perform.**  
> Commercial-grade e-commerce web application engineered for powerlifters, bodybuilders, and fitness athletes.

---

## ⚡ Architecture Overview

**AVN FITNESS GEAR** is a production-ready, full-stack direct-to-consumer (D2C) fitness gear e-commerce platform. It combines a state-of-the-art **React 19** frontend with an enterprise-grade **Express.js & MongoDB** backend API.

```
AVN/
├── avn_fitness_frontend/       # React 19 + Vite 8 + Tailwind CSS Client Application
│   ├── public/                 # High-resolution product renders, photography & logos
│   └── src/
│       ├── components/         # 3D Hero stage, Bestsellers, CartDrawer, Modals, Navbars
│       ├── context/            # AuthContext (JWT/OTP session) & CartContext (MongoDB sync)
│       ├── pages/              # PDP, Cart, Checkout, OrderHistory, Reviews, Support
│       └── services/           # Centralized API fetch client with cookie/header credentials
│
└── avn_fitness_backend/        # Node.js + Express + MongoDB RESTful Backend Server
    ├── scripts/                # Database seeders (products catalog & authentic reviews)
    ├── tests/                  # Integration test suites & order state machine verification
    └── src/
        ├── config/             # Environment, database connection, constants & enums
        ├── middlewares/        # JWT auth, rate limiting, error handling, activity audit logger
        ├── models/             # Mongoose schemas (Users, Products, Orders, Carts, Reviews, Support)
        └── modules/            # Domain controllers & routes (auth, products, cart, checkout, orders)
```

---

## ✨ Key Features

### 🖥️ Frontend (Client Experience)
- **React 19 & Vite 8**: Blazing-fast hot module reloading and optimized modern JavaScript bundling.
- **Dynamic Dual Theme**: Smooth instant toggle between Dark Mode (`--bg-main: #0B0B0B`) and Light Mode with custom CSS variables and dual-themed brand logos.
- **3D Metallic Hero Stage**: Multi-tier metallic black pedestal stage featuring glowing crimson neon arch, 3D perspective logo tilt (`rotateX(10deg)`), and extruded 3D depth.
- **Responsive Mobile Navigation**: Fixed bottom navigation bar (`Home` | `Menu` | `Search` | `Profile`) and slide-over navigation sidebar with backdrop blur.
- **Product Detail Page (PDP)**: Dedicated PDP with multi-angle galleries, live stock validation, sizing guides, and authentic athlete customer reviews.
- **Live Shopping Cart Drawer**: SKU-first cart with quantity adjustments, free shipping progress indicator, and instant proceed-to-checkout redirect.
- **Direct & Gated Checkout**: Multi-step checkout with address management, order summary, UPI/Card/NetBanking/COD payments, and live confirmation.

### ⚙️ Backend (API & Database)
- **Node.js & Express REST API**: Modular domain structure running on `http://localhost:5000/api/v1`.
- **MongoDB & Mongoose ODM**: 9 integrated collections (`users`, `products`, `categories`, `orders`, `reviews`, `carts`, `coupons`, `supporttickets`, `otps`).
- **Robust Authentication**: Dual auth support with bcrypt password hashing, JWT bearer tokens, and 6-digit email OTP verification.
- **Dual-Key Lookups**: Seamless lookups supporting both MongoDB ObjectIds and human-readable identifiers (`slug` for products, `orderNumber` like `ORD-YYYYMMDD-XXXX` for orders).
- **Cart Lifecycle & Cleanup**:
  - Unauthenticated guests browse with temporary session carts.
  - Active session carts automatically merge into the authenticated account upon login.
  - Placed and confirmed orders instantly delete the cart document from MongoDB, ensuring zero orphaned empty carts.
- **Order State Machine**: Enforces strict lifecycle transitions (`pending_payment` $\rightarrow$ `paid_confirmed` $\rightarrow$ `processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered`).
- **Reviews & Upvotes**: Authentic athlete reviews registered in MongoDB with verified purchase badges and one-upvote-per-user helpful voting.
- **Customer Support Ticketing**: Ticket management with automatic category normalization (`return_refund`, `shipping`, `product`, `general`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 1. Installation
Install dependencies for both frontend and backend from the root workspace:

```bash
# In backend
cd avn_fitness_backend && npm install

# In frontend
cd ../avn_fitness_frontend && npm install
```

### 2. Environment Configuration
Ensure `avn_fitness_backend/.env` is configured:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/avn_fitness
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5000
```

### 3. Database Seeding
Populate the AVN product catalog and authentic reviews:

```bash
cd avn_fitness_backend
npm run seed                           # Seeds foundational categories
node scripts/seed_avn_products.js      # Seeds 12 active AVN gear products
node scripts/register_pdp_reviews.js   # Seeds authentic athlete reviews
```

### 4. Running the Development Servers

#### Run Fullstack Together (From Root):
```bash
npm run dev
```

#### Or Run Independently:
```bash
# Terminal 1 — Backend API Server (Port 5000)
npm run dev:backend

# Terminal 2 — Frontend Application (Port 5173)
npm run dev:frontend
```

Open **`http://localhost:5173`** in your browser to explore the store!

---

## 📡 API Endpoints Reference (`/api/v1`)

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register new athlete account with OTP | No |
| **Auth** | `POST` | `/auth/login` | Email & password login (returns JWT) | No |
| **Auth** | `POST` | `/auth/otp/send` | Dispatch 6-digit verification code | No |
| **Auth** | `POST` | `/auth/otp/verify` | Verify OTP code & authenticate | No |
| **Auth** | `GET` | `/auth/profile` | Retrieve active user profile & addresses | Yes |
| **Auth** | `POST` | `/auth/addresses` | Add new shipping address | Yes |
| **Products** | `GET` | `/products` | Filter, sort & search live product catalog | No |
| **Products** | `GET` | `/products/:slugOrId` | Retrieve single product details & variants | No |
| **Categories**| `GET` | `/categories` | List active product categories | No |
| **Cart** | `GET` | `/cart` | Retrieve user/guest cart (no empty persistence) | Optional |
| **Cart** | `POST` | `/cart/items` | Add product SKU variant to cart | Optional |
| **Cart** | `PATCH` | `/cart/items/:itemId`| Update quantity of specific cart item | Optional |
| **Cart** | `DELETE`| `/cart/items/:itemId`| Remove item (deletes cart document if empty) | Optional |
| **Cart** | `DELETE`| `/cart` | Clear and delete cart from MongoDB | Optional |
| **Checkout** | `POST` | `/checkout/create-order` | Create confirmed order & delete cart | Yes |
| **Orders** | `GET` | `/orders` | List logged-in user's order history | Yes |
| **Orders** | `GET` | `/orders/:idOrNumber` | Retrieve single order details | Yes |
| **Orders** | `POST` | `/orders/:id/cancel` | Request cancellation & restock items | Yes |
| **Orders** | `POST` | `/orders/:id/return` | Submit order return request | Yes |
| **Orders** | `POST` | `/orders/:id/deliver` | Dev simulation: mark delivered & accept | Yes |
| **Reviews** | `GET` | `/reviews/products/:idOrSlug` | Fetch verified reviews for product | No |
| **Reviews** | `POST` | `/reviews` | Submit verified purchase review & rating | Yes |
| **Reviews** | `POST` | `/reviews/:id/helpful` | Upvote review helpfulness (1 per user) | Optional |
| **Support** | `POST` | `/support` | Create customer care support ticket | Optional |
| **Support** | `GET` | `/support/my-tickets` | List logged-in user's support tickets | Yes |

---

## 🧪 Testing & Verification

```bash
# Run backend foundation verification
node avn_fitness_backend/scripts/verify_foundation.js

# Run full e2e test suite
npm run test:backend
```

---

## 📄 License

This project is proprietary and confidential — **AVN FITNESS GEAR**. All rights reserved.
