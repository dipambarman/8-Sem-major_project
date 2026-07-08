<div align="center">

# 🍽️ Smart Canteen Management System

**A full-stack, cross-platform canteen digitization platform built with React Native, Node.js, and PostgreSQL**

[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

*An end-to-end mobile-first solution that centralizes order workflows, inventory management, and real-time tracking across students, vendors, and administrators — eliminating manual processing in institutional canteens.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [License](#-license)

---

## 🎯 Overview

Smart Canteen Management System is a **production-grade, cross-platform mobile application** (iOS & Android) designed to digitize and streamline institutional canteen operations. It supports **three concurrent user roles** — Students, Vendors, and Administrators — each with dedicated interfaces and granular access control.

### Problem Statement
Traditional canteens rely on manual ordering, paper-based tracking, and cash-only payments — leading to long queues, order mismanagement, and zero visibility into analytics. This platform solves all of these problems with a single, integrated digital solution.

### Solution Highlights
| Challenge | Solution |
|---|---|
| Long queues & wait times | Mobile ordering with scheduled pickup slots |
| Order mismanagement | Real-time order tracking via WebSockets |
| Cash-only payments | Integrated digital wallet + Razorpay gateway |
| No visibility for admins | Dedicated analytics dashboard with user/vendor management |
| No loyalty incentives | SmartPass subscription tiers (Silver, Gold, Platinum) |

---

## ✨ Key Features

### 👨‍🎓 Student Mobile App
- **Browse & Order** — Browse categorized menus, search items, add to cart, and place orders
- **Real-time Tracking** — Live order status updates (Pending → Confirmed → Preparing → Ready → Completed)
- **Digital Wallet** — Top-up via Razorpay, pay from wallet balance, view transaction history
- **SmartPass Subscriptions** — Tiered loyalty cards (Silver/Gold/Platinum) with automatic discounts
- **Table Reservations** — Reserve dining slots with party size and special requests
- **QR Code Verification** — Unique QR codes generated per order for secure pickup verification
- **Push Notifications** — Real-time alerts for order status changes
- **Reviews & Ratings** — Rate and review menu items

### 🍳 Vendor Dashboard
- **Order Management** — Accept, prepare, and fulfill incoming orders in real-time
- **Menu Management** — Full CRUD operations on menu items with category, pricing, and availability
- **Analytics** — Track sales performance, popular items, and revenue metrics

### 🛡️ Admin Dashboard
- **User Management** — View, activate/deactivate users and vendors
- **Platform Analytics** — Comprehensive overview of orders, revenue, and platform metrics
- **Vendor Oversight** — Monitor vendor performance and menu quality
- **System Configuration** — Platform-level settings and operational controls

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│   │  Mobile App  │   │    Vendor    │   │    Admin     │       │
│   │ React Native │   │  Dashboard   │   │  Dashboard   │       │
│   │   (Expo)     │   │  React+Vite  │   │  React+Vite  │       │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│          │                  │                  │                │
└──────────┼──────────────────┼──────────────────┼────────────────┘
           │                  │                  │
           │         REST API (HTTPS)            │
           │          + WebSockets               │
           │                  │                  │
┌──────────┼──────────────────┼──────────────────┼────────────────┐
│          ▼                  ▼                  ▼                │
│   ┌─────────────────────────────────────────────────────┐      │
│   │              API GATEWAY (Express.js)                │      │
│   │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │      │
│   │  │  Helmet   │ │  CORS    │ │  Rate Limiting     │  │      │
│   │  │ Security  │ │  Config  │ │  Input Sanitization│  │      │
│   │  └──────────┘ └──────────┘ └────────────────────┘  │      │
│   └──────────────────────┬──────────────────────────────┘      │
│                          │                                      │
│   ┌──────────────────────┼──────────────────────────────┐      │
│   │          MIDDLEWARE PIPELINE                         │      │
│   │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │      │
│   │  │   JWT    │ │  RBAC    │ │   Validation       │  │      │
│   │  │  Auth    │ │  Guard   │ │ (express-validator) │  │      │
│   │  └──────────┘ └──────────┘ └────────────────────┘  │      │
│   └──────────────────────┬──────────────────────────────┘      │
│                          │                                      │
│   ┌──────────────────────┼──────────────────────────────┐      │
│   │            SERVICE LAYER                             │      │
│   │  ┌────────┐ ┌───────┐ ┌────────┐ ┌──────────────┐  │      │
│   │  │ Orders │ │ Menu  │ │ Wallet │ │  SmartPass   │  │      │
│   │  ├────────┤ ├───────┤ ├────────┤ ├──────────────┤  │      │
│   │  │Payment │ │ Auth  │ │ Review │ │ Reservation  │  │      │
│   │  └────────┘ └───────┘ └────────┘ └──────────────┘  │      │
│   └──────────────────────┬──────────────────────────────┘      │
│                          │                                      │
│              SERVER LAYER (Node.js)                             │
│                                                                 │
│   ┌──────────────┐       ┌──────────────────────┐              │
│   │  Socket.IO   │       │  Prisma ORM Client   │              │
│   │  (Real-time) │       │  (Query Builder)     │              │
│   └──────┬───────┘       └──────────┬───────────┘              │
│          │                          │                           │
└──────────┼──────────────────────────┼───────────────────────────┘
           │                          │
┌──────────┼──────────────────────────┼───────────────────────────┐
│          ▼                          ▼                           │
│   ┌──────────────┐       ┌──────────────────────┐              │
│   │  WebSocket   │       │    PostgreSQL         │              │
│   │  Connections │       │  (ACID-compliant)     │              │
│   └──────────────┘       └──────────────────────┘              │
│                                                                 │
│              DATA & REAL-TIME LAYER                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Mobile App** | React Native (Expo) · TypeScript | Cross-platform iOS & Android client |
| **State Management** | Redux Toolkit | Predictable state container with slices |
| **Vendor Dashboard** | React.js · Vite · TypeScript | Vendor-facing web portal |
| **Admin Dashboard** | React.js · Vite · TypeScript | Administrator web portal |
| **Backend API** | Node.js · Express.js | RESTful API server |
| **ORM** | Prisma ORM | Type-safe database access layer |
| **Database** | PostgreSQL | Relational database with ACID compliance |
| **Real-time** | Socket.IO | Bidirectional WebSocket communication |
| **Authentication** | JWT (jsonwebtoken) · bcryptjs | Token-based auth with password hashing |
| **Payments** | Razorpay SDK | Payment gateway integration |
| **Security** | Helmet · express-rate-limit · express-validator | HTTP hardening, rate limiting, input validation |
| **QR Codes** | qrcode | Dynamic QR generation for order verification |

---

## 📁 Project Structure

This project follows a **monorepo architecture**, consolidating all components into a single repository for streamlined development and shared utilities.

```
smart-canteen-management-system/
│
├── mobile/                          # React Native (Expo) mobile app
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── screens/                 # Screen modules
│   │   │   ├── auth/                #   Login, Register, OTP flows
│   │   │   ├── home/                #   Home, Menu, Search screens
│   │   │   ├── orders/              #   Cart, Order tracking, History
│   │   │   ├── profile/             #   User profile management
│   │   │   ├── reservations/        #   Table reservation flows
│   │   │   └── wallet/              #   Wallet & transaction screens
│   │   ├── navigation/              # React Navigation config
│   │   ├── services/                # API client & service layer
│   │   ├── store/                   # Redux Toolkit slices & store
│   │   ├── context/                 # React Context providers
│   │   ├── theme/                   # Design tokens & theming
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Shared utility functions
│   └── app.json                     # Expo configuration
│
├── backend/                         # Node.js/Express.js API server
│   ├── src/
│   │   ├── controllers/             # Request handlers (13 controllers)
│   │   ├── routes/                  # Route definitions (14 route files)
│   │   ├── services/                # Business logic layer
│   │   ├── middleware/              # Auth, validation, security, errors
│   │   ├── models/                  # Data access helpers
│   │   ├── sockets/                 # Socket.IO event handlers
│   │   ├── config/                  # App & socket configuration
│   │   ├── constants/               # Enum & category constants
│   │   └── utils/                   # Database client & helpers
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (12 models)
│   │   ├── seed.js                  # Seed data (37 menu items)
│   │   └── migrations/              # Migration history
│   └── server.js                    # Application entry point
│
├── admin-dashboard/                 # React + Vite admin portal
│   └── src/
│       ├── pages/                   # Admin pages
│       ├── components/              # UI components
│       ├── providers/               # Context providers
│       ├── services/                # API services
│       └── utils/                   # Utilities
│
├── vendor-dashboard/                # React + Vite vendor portal
│   └── src/
│       ├── pages/                   # Vendor pages
│       ├── components/              # UI components
│       ├── services/                # API services
│       └── utils/                   # Utilities
│
├── infrastructure/                  # Deployment & DevOps configs
├── docs/                            # Project documentation
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## 🗄️ Database Schema

The PostgreSQL database is managed through **Prisma ORM** with a normalized schema consisting of **12 models** and **8 enums**:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│    Order     │◀────│   Vendor     │
│              │     │              │     │              │
│ - email      │     │ - orderNum   │     │ - name       │
│ - fullName   │     │ - status     │     │ - cuisineType│
│ - userType   │     │ - totalAmt   │     │ - rating     │
│   (RBAC)     │     │ - qrCode     │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │              ┌─────┴─────┐              │
       │              │ OrderItem │              │
       │              │           │              │
       │              │ - qty     │              │
       │              │ - price   │              │
       │              └─────┬─────┘              │
       │                    │                    │
       │              ┌─────┴─────┐              │
       │              │ MenuItem  │──────────────┘
       │              │           │
       │              │ - name    │
       │              │ - price   │
       │              │ - category│
       │              └───────────┘
       │
  ┌────┴────┐   ┌───────────┐   ┌────────────┐
  │ Wallet  │   │ SmartPass │   │Reservation │
  │         │   │           │   │            │
  │-balance │   │ - tier    │   │ - partySize│
  │         │   │ - status  │   │ - status   │
  └────┬────┘   └───────────┘   └────────────┘
       │
  ┌────┴──────────┐
  │ WalletTxn     │
  │               │
  │ - type (CR/DR)│
  │ - amount      │
  └───────────────┘
```

### Models
| Model | Description |
|---|---|
| `User` | Students and admins with RBAC (REGULAR, PREMIUM, ADMIN) |
| `Vendor` | Canteen vendors with profile, ratings, and operating hours |
| `MenuItem` | Food items with category, pricing, and availability flags |
| `Order` | Order records with status tracking and QR codes |
| `OrderItem` | Line items linking orders to menu items |
| `Payment` | Payment records supporting Wallet, Razorpay, and SmartPass |
| `Wallet` | User digital wallet with balance management |
| `WalletTransaction` | Credit/debit transaction ledger |
| `Reservation` | Table reservation with party size and time slots |
| `Notification` | In-app notification system |
| `Review` | User reviews and ratings for menu items |
| `SmartPass` | Subscription loyalty cards (Silver/Gold/Platinum tiers) |

---

## 📡 API Reference

The backend exposes **15+ RESTful API endpoints** across 14 route modules, all prefixed with `/api`:

| Module | Endpoint | Description |
|---|---|---|
| **Auth** | `POST /api/auth/register` | User registration with validation |
| | `POST /api/auth/login` | JWT-based authentication |
| **Menu** | `GET /api/menu` | Browse menu items with filtering |
| | `POST /api/menu` | Create menu item (Vendor only) |
| | `PUT /api/menu/:id` | Update menu item (Vendor only) |
| | `DELETE /api/menu/:id` | Delete menu item (Vendor only) |
| **Orders** | `POST /api/orders` | Place a new order |
| | `GET /api/orders` | Get user's order history |
| | `PATCH /api/orders/:id/status` | Update order status (Vendor) |
| **Wallet** | `GET /api/wallet/balance` | Check wallet balance |
| | `POST /api/wallet/topup` | Top-up wallet via Razorpay |
| **Payments** | `POST /api/payments/create-order` | Initiate Razorpay payment |
| | `POST /api/payments/verify` | Verify payment signature |
| **SmartPass** | `POST /api/smartpass/subscribe` | Subscribe to a SmartPass tier |
| **Reservations** | `POST /api/reservations` | Book a table reservation |
| **Analytics** | `GET /api/analytics` | Platform analytics (Admin only) |
| **Admin** | `GET /api/admin/users` | User management (Admin only) |
| **Vendor** | `GET /api/vendor/orders` | Vendor order management |
| **Reviews** | `POST /api/reviews` | Submit a review |
| **Notifications** | `GET /api/notifications` | Get user notifications |

> All protected routes enforce **JWT-based authentication** with **role-based access control (RBAC)**. Server-side input validation is applied on every route via `express-validator`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** ≥ 14.x (or a cloud instance like Supabase)
- **Expo CLI** (for mobile development)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/dipambarman/smart-canteen-management-system.git
cd smart-canteen-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL and API keys

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start the development server
npm run dev
```

The API server will start on `http://localhost:3000`.

### 3. Mobile App Setup

```bash
cd mobile
npm install

# Start the Expo development server
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera (iOS) to launch the app.

### 4. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
npm run dev
```

### 5. Vendor Dashboard Setup

```bash
cd vendor-dashboard
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the `/backend` directory. Refer to [`.env.example`](./backend/.env.example) for the full template.

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ |
| `PORT` | API server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment (`development` / `production`) | ❌ |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | ✅* |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | ✅* |
| `FRONTEND_URL` | Frontend URL for CORS configuration | ❌ |
| `SOCKET_URL` | Socket.IO server URL | ❌ |

> \* Required only if payment features are enabled.

---

## 🔒 Security

This application implements multiple layers of security:

- **Authentication** — JWT-based token authentication with bcrypt password hashing (salt rounds: 10)
- **Authorization** — Role-based access control (RBAC) enforcing least-privilege across all three roles (Student, Vendor, Admin)
- **Input Validation** — Server-side validation on every route using `express-validator`
- **Rate Limiting** — API rate limiting via `express-rate-limit` to prevent brute-force attacks
- **HTTP Hardening** — `Helmet.js` for secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **Input Sanitization** — Custom middleware to sanitize all incoming request data
- **CORS** — Configurable cross-origin resource sharing
- **ACID Compliance** — PostgreSQL transactions ensure data integrity for payments and orders

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Dipam Barman](https://github.com/dipambarman)**

</div>
