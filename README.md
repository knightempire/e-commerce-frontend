# 🛒 E-Commerce Frontend

This is the frontend for an e-commerce web application built with **Next.js**. It integrates with the **Amazon API** to display products and includes various e-commerce features such as dynamic search, filtering, cart management, wishlist functionality, and checkout process.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: CSS / TailwindCSS (assumed from `globals.css`)
- **State Management**: Custom hooks & context
- **API Integration**: Amazon API (for fetching products)
- **Authentication**: Google OAuth (via `googlelogin.tsx`)
- **Storage**: LocalStorage (for wishlist management)
- **Mailing**: Sends sample email notifications post-purchase

---

## 📁 Project Structure

```bash
e-commerce frontend/
│
├── app/                       # Main app directory (Next.js routing)
│   ├── api/                  # API routes (if used)
│   ├── auth/                 # Authentication pages and logic
│   ├── cart/                 # Shopping cart pages
│   ├── offers/               # Offer-related pages
│   ├── orders/               # Order tracking/management
│   ├── product/              # Product pages
│   │   └── [id]/             # Dynamic product detail pages
│   ├── profile/              # User profile pages
│   ├── saved/                # Saved items/wishlist
│   ├── thank-you/           # Post-checkout confirmation
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # App layout
│   ├── loading.tsx          # Global loading screen
│   └── page.tsx             # Home page
│
├── components/               # Shared and reusable components
│   ├── googlelogin.tsx      # Google login button/integration
│   ├── image-zoom.tsx       # Zoom effect for product images
│   ├── offer-banner.tsx     # Promotional banners
│   ├── product-filters.tsx  # Product filter UI
│   ├── share-modal.tsx      # Modal for sharing products
│   ├── theme-provider.tsx   # Theme context/provider
│   └── ui/                  # UI primitives and common components
│
├── hooks/                    # Custom React hooks
│   ├── use-mobile.tsx       # Mobile detection
│   ├── use-toast.ts         # Toast notifications
│   ├── useInfiniteScroll.ts # Infinite scrolling logic
│   └── useProducts.ts       # Fetch product data
│
├── lib/                      # Utility and global libraries
│   ├── api.ts               # API abstraction
│   ├── cart-store.ts        # Cart state/store
│   └── utils.ts             # General utility functions
│
└── README.md                 # You're reading it 📘

```

---

## 🧭 Navigation Overview

| Path               | Description                    |
|--------------------|--------------------------------|
| `/`                | Home page (Displays all products with search and filter options) |
| `/product/[id]`    | View individual product details |
| `/cart`            | View and manage shopping cart |
| `/saved`           | View and manage wishlist (local storage) |
| `/checkout`        | Checkout page (with payment processing) |
| `/thank-you`       | Order confirmation page |
| `/profile`         | User profile page (optional) |

---

## 🧪 Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Build for production
npm run build
