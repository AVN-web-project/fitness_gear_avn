# 🏋️ AVN FITNESS GEAR — E-Commerce Full-Stack Application

> **Built to Support. Designed to Perform.**  
> Premium e-commerce web application engineered for powerlifters, bodybuilders, and fitness enthusiasts.

---

## 🌟 Overview

**AVN FITNESS GEAR** is a modern, high-performance e-commerce web application featuring a state-of-the-art dark/light dual theme UI, interactive 3D hero stage, dynamic product filtering, slide-over shopping cart drawer, mobile slide-over navigation sidebar drawer, gated authentication modal, product detail pages (PDP), and a RESTful backend API serving real-time catalog data and order checkout processing.

---

## 🚀 Key Features

- **⚡ Full-Stack Architecture**: Clean separation between `frontend` (React 19 + Vite 8) and `backend` (Node.js + Express).
- **🌗 Light & Dark Mode Support**: Dynamic theme toggle with custom CSS variable mapping (`--bg-main`, `--bg-card`, `--text-main`, `--border-subtle`), theme persistence (`localStorage`), and dual-themed brand logos.
- **🛡️ 3D Metallic Hero Stage**: Multi-tier 3D black pedestal cylinder stage featuring a glowing crimson neon arch, 3D perspective logo tilt (`rotateX(10deg)`), multi-layered 3D block extrusion depth, and letter-specific glow highlights.
- **📱 Slide-Over Mobile Navigation Sidebar**: Responsive mobile drawer (`md:hidden`) containing navigation links (`HOME`, `ABOUT`, `PRODUCTS`, `WHY AVN`, `REVIEWS`, `CONTACT`), active highlight badges, backdrop blur overlay, and quick CTA button (`EXPLORE PRODUCTS`).
- **📱 Mobile Bottom Navigation Bar**: Fixed bottom bar (`Home` | `Menu` | `Search` | `Profile`) for seamless single-tap mobile access.
- **📊 Optimized 2-Column Mobile Grids**:
  - **Quality Features Box**: 2 cards per row on mobile (`grid-cols-2 lg:grid-cols-4`).
  - **Trust Badges Container**: 2 items per row on mobile (`grid-cols-2 lg:grid-cols-5`), with the 5th feature (`SECURE PAYMENTS`) centered in the 3rd row (`col-span-2 justify-self-center`).
- **🛒 Direct Seamless Checkout**: Instant order submission drawer allowing users to place orders directly without requiring registration or login steps.
- **📄 Product Detail Page (PDP)**: Dedicated PDP view (`ProductDetailPage.jsx`) featuring high-resolution image galleries, SKU/slug metadata, spec tables, pack options, stock quantities, and customer reviews.
- **🖼️ Native Transparent Brand Logos**: High-resolution, 100% transparent RGBA brand emblem PNG assets (`logo-transparent.png` & `logo-red-black.png`).
- **🎨 Signature Red Corner Borders**: Unified design language (`.red-corner-border`) featuring top silver specular highlights, inverted glass floor mirror reflections (`scale-y-[-0.55] opacity-35 blur-[1px]`), and red corner neon accents across cards and trust containers.
- **🛒 Cart Drawer & Lightbox Modals**: Live cart drawer with quantity adjustments, free shipping progress indicator, and instant search overlay modal.
- **🔄 Fail-Safe API Resilience**: Seamless fallback to local dataset if the backend API is offline.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Custom CSS Variables
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Middlewares**: CORS, Express JSON Parser, Dotenv
- **Dev Tool**: Nodemon

---

## 📁 Project Structure

```text
FITNESS GEAR/
├── package.json                 # Workspace orchestrator (runs frontend & backend)
├── README.md                    # Project documentation & architecture overview
├── .gitignore                   # Global gitignore configuration
│
├── refernce docs/               # Technical specs & reference assets
│   └── Commercial Fitness Gear E-Com Technical Implementation.docx
│
├── frontend/                    # React 19 + Vite 8 Frontend Web Application
│   ├── package.json             # Frontend dependencies & scripts
│   ├── vite.config.js           # Vite dev server & build configuration
│   ├── index.html               # Main HTML entry point & favicon configuration
│   │
│   ├── public/                  # Product photography & static assets
│   │   ├── knee-wrap.png        # Knee wrap product image
│   │   ├── elbow-wrap.png       # Elbow wrap product image
│   │   ├── wrist-wrap.png       # Wrist wrap product image
│   │   ├── lifting-straps.png   # Lifting straps product image
│   │   ├── yoga-belt.png        # Yoga belt product image
│   │   ├── athelete-squat.png   # Gym athlete squat background photo
│   │   └── avn_logo.svg         # AVN SVG Logo asset
│   │
│   └── src/                     # React application source code
│       ├── assets/              # High-resolution native transparent brand logos
│       │   ├── logo-transparent.png  # White/Red brand logo (Dark Mode)
│       │   └── logo-red-black.png    # Black/Red brand logo (Light Mode)
│       │
│       ├── components/          # Modular React UI components
│       │   ├── Button.jsx       # Universal brand button component (glow, outline, ghost)
│       │   ├── Bestsellers.jsx  # Product catalog grid with category filter tabs
│       │   ├── CartDrawer.jsx   # Slide-over shopping cart drawer
│       │   ├── CartPage.jsx     # Dedicated full shopping cart page
│       │   ├── FeatureBar.jsx   # Quality feature cards with 2-column mobile grid
│       │   ├── Footer.jsx       # Sitemap links & skeletal 5-trust badge container
│       │   ├── Hero.jsx         # Hero section title & CTA buttons
│       │   ├── HeroStage3D.jsx  # 3D pedestal stage with neon arch & 3D logo
│       │   ├── Navbar.jsx       # Header bar, mobile sidebar drawer, theme toggle
│       │   ├── ProductDetailPage.jsx # Dedicated product detail page (PDP)
│       │   ├── ProductGraphic.jsx # Dynamic product visual renderer
│       │   ├── ProductModal.jsx # Product detail lightbox modal
│       │   ├── SearchModal.jsx  # Instant search overlay modal
│       │   ├── SearchPage.jsx   # Full search catalog page with compound filters
│       │   ├── SizeChartModal.jsx # Interactive gear sizing guide modal
│       │   └── WhyChoose.jsx    # Brand narrative & video preview card
│       │
│       ├── services/            # Backend API integration layer
│       │   └── api.js           # Fetch API client connecting to Express server
│       │
│       ├── data/                # Fallback dataset
│       │   └── products.js      # Local product catalog backup
│       │
│       ├── App.jsx              # Main App layout, router view state & cart management
│       ├── main.jsx             # React DOM entry point
│       └── index.css            # Custom CSS variables, Tailwind tokens & animations
│
└── backend/                     # Node.js + Express REST API Server
    ├── package.json             # Backend dependencies & dev scripts
    ├── server.js                # Express API server entry point (Port 5000)
    ├── .env                     # Environment variables (PORT=5000, CLIENT_URL)
    │
    ├── controllers/             # Request controllers
    │   ├── cartController.js    # Handles cart items, stock validation & coupons
    │   ├── productController.js # Handles product search pipeline & catalog queries
    │   └── orderController.js   # Handles checkout order processing
    │
    ├── routes/                  # API endpoint definitions
    │   ├── cartRoutes.js        # Cart management endpoints
    │   ├── productRoutes.js     # Product & category routes
    │   └── orderRoutes.js       # Order checkout routes
    │
    └── data/                    # Backend database
        └── products.js          # Extended product catalog dataset (SKUs, variants, reviews)
```

---

## 📋 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 1. Installation

Install dependencies for `frontend` and `backend`:

```bash
# In frontend directory
cd frontend
npm install

# In backend directory
cd ../backend
npm install
```

---

### 2. Development Servers

#### Option A: Run Backend API Server
```bash
cd backend
npm run dev
```
The Express backend server will start on **`http://localhost:5000`**.

#### Option B: Run Frontend Application
```bash
cd frontend
npm run dev
```
The Vite frontend server will start on **`http://localhost:5173`**.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server status |
| `GET` | `/api/products` | Retrieve all products (Supports `?category=` & `?search=`) |
| `GET` | `/api/products/:id` | Retrieve single product details by ID |
| `GET` | `/api/categories` | Retrieve list of available product categories |
| `POST` | `/api/orders` | Process a new checkout order |

---

## 📄 License

This project is proprietary and confidential — **AVN FITNESS GEAR**. All rights reserved.
