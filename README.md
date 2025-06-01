# 🛒 E-Commerce Platform

This is the **E-Commerce web application** built with **Next.js** for the frontend and **Node.js** with **MongoDB** for the backend. It features a variety of e-commerce functionalities like dynamic search, filtering, cart management, wishlist, and checkout, along with user authentication and order management.

The frontend is hosted on **Vercel**, and the backend is hosted on **Google Cloud Platform (GCP)**. The backend also uses **Docker** for containerization.

---

## 🚀 Tech Stack

### Frontend:
- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: CSS / TailwindCSS
- **State Management**: Custom hooks & context
- **API Integration**: Amazon API (for fetching products)
- **Authentication**: Google OAuth (via `googlelogin.tsx`)
- **UI Components**: [Shacdn](https://shacdn.com) (used in UI components)

### Backend:
- **Framework**: [Node.js](https://nodejs.org/)
- **Database**: MongoDB Atlas
- **Containerization**: Docker
- **Hosting**: Google Cloud Platform (GCP)
- **Authentication**: Pasteo with RSA keys (stronger than JWT)


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

## 🛒 Features

### Home Page
- Displays all products using the Amazon API.
- Includes a dynamic search bar and product filters (e.g., by category, price).

### Product Page
- Displays detailed information for a specific product, including images, description, and pricing.

### Cart Page
- Allows users to add/remove items from the cart.
- Cart state is connected to the backend and is persistent across sessions.

### Wishlist
- Users can add items to their wishlist.
- Wishlist is stored in **localStorage** and is not connected to the backend.

### Checkout Page
- Users can review items in their cart and proceed with payment.
- If the card number is **2**, the transaction will be **declined**.
- If the card number is **3**, the transaction will **fail**.
- Any other card number will be processed as **successful**.
- Upon success or failure, users will receive an email notification with the order status.

### Thank You Page
- After a successful transaction, users will be redirected to a thank-you page with an order confirmation.


## 📁 Project Structure

### Frontend Structure:
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


### Backend Structure:
```bash
e-commerce backend/
│
├── config/ # Configuration files
│ └── db.js # Database connection config
│
├── controllers/ # Request handlers for routes
│ ├── google.login.js # Google login controller
│ ├── login.contollers.js # User login logic
│ ├── order.js # Order management
│ └── user.js # User management
│
├── middleware/ # Middleware logic
│ ├── auth/ # Authentication middleware
│ ├── mail/ # Mailing logic
│ ├── rsa/ # RSA encryption keys
│ └── google.auth.js # Google OAuth middleware
│
├── routers/ # Route definitions
│ └── user.js # User-related routes
│
├── .env # Environment variables
├── docker-compose.yml # Docker configuration
├── Dockerfile # Dockerfile for containerization
├── app.js # Entry point for the app
└── package.json # NPM dependencies and scripts

```
---

## 🧪 Getting Started


### Frontend Structure:
```bash
# Install dependencies
npm install  --legacy-peer-deps

# Run the dev server
npm run dev

# Build for production
npm run build

```


### Frontend Structure:
```bash
# Install dependencies
npm install

# Run the server
node app.js


```

## 🌐 Links

Frontend Repository: https://github.com/knightempire/e-commerce-frontend

Backend Repository:  https://github.com/knightempire/e-commerce-backend

Live Site: https://e-commerce-sooty-eight-86.vercel.app/auth/login
