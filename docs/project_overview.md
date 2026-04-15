# Smart Canteen App - Project Overview

This document provides a high-level overview of the Smart Canteen application architecture, module structure, and technology stack. It is designed to give mentors and new developers a quick understanding of the project's layout and components.

## 🏗️ Repository Architecture

Our project follows a **Monorepo** structure, consolidating all critical components (frontend, backend, mobile app, and infrastructure) into a single code repository. This design enables easy sharing of types/utilities and simplifies full-stack development and testing.

```text
smart-canteen-app/
├── admin-dashboard/     # Web portal for system administrators
├── backend/             # Primary Node.js/Express.js backend server
├── docs/                # Project documentation and architectural overviews
├── infrastructure/      # Deployment, Docker, Database, and monitoring configurations
├── mobile/              # React Native/Expo bare workflow mobile application
├── shared/              # Reusable types, generic utility functions across projects
└── vendor-dashboard/    # Web portal for canteen vendors/staff
```

---

## 📦 Detailed Module Breakdown

### 1. Mobile Application (`/mobile`)
The primary interface for standard users to browse menus, place orders, and make payments. The project adopts an **Expo Bare Workflow** (hybrid framework approach), meaning it combines the ease of Expo with full custom access to underlying native code.

- **Frontend Tech Stack**: React Native utilizing TypeScript (`.ts`, `.tsx`), occasionally interfacing with JavaScript (`.js`, `.jsx`).
- **Native Android Tech Stack**: 
  - Direct access to native Android folders (`/mobile/android`), containing native configurations via `AndroidManifest.xml` and Kotlin source files (`.kt`).
  - **Gradle System**: Uses `build.gradle`, `local.properties`, and `settings.gradle` to define build compilation constraints and dependencies for local Android execution. 
- **Internal React Structure:** Organized logically by `screens/`, `components/`, `navigation/`, `services/`, `store/` (for state management using Redux toolkit slices), and `utils/`.

### 2. Backend (`/backend`)
The core API serving data to all client applications.
- **Tech Stack:** Node.js, Express.js, Prisma ORM, PostgreSQL.
- **Key Dependencies:** 
  - `bcryptjs` & `jsonwebtoken`: Authentication and authorization.
  - `socket.io`: Real-time bidirectional event-based communication (e.g., live order tracking).
  - `razorpay`: Payment gateway integration.
  - `qrcode`: Dynamic QR code generation for order verification.
- **Internal Structure:** Uses an MVC-like architecture with folders designated for `controllers`, `services`, `middleware`, `models`, `routes`, `sockets`, and `config`.

### 3. Admin Dashboard (`/admin-dashboard`)
Dedicated interface for canteen administrators to manage users, view analytics, and configure platform settings.
- **Tech Stack:** React.js, Vite build tool, TypeScript.
- **Internal Structure:** Standardized into `pages`, `components`, `providers`, `services`, and `utils`.

### 4. Vendor Dashboard (`/vendor-dashboard`)
Interface tailored for canteen vendors and kitchen staff to manage their specific menu items and fulfill incoming orders.
- **Tech Stack:** React.js, Vite build tool, TypeScript.
- **Internal Structure:** Built modularly with `pages`, `components`, `services`, and `utils`.

### 5. Infrastructure (`/infrastructure`)
Contains configuration files outlining how services should be deployed and run in different environments.
- **Components:** Contains isolated configurations for `postgresql`, `redis`, `backend`, `frontend`, `storage`, and `monitoring`.

### 6. Shared (`/shared`)
Houses logic and typings common to multiple components, keeping code DRY (Don't Repeat Yourself).
- **Contents:** Encompasses `types` and `utils` designed to be imported seamlessly into the backend, dashboards, or mobile app.

---

## 🚀 Key Features Identified

- **Deep Native Integrations:** Because of the bare workflow, the mobile application easily supports custom native modules relying on `.kt`/`.java` where standard Expo limits apply.
- **Payment Gateway Integration:** Secure payment flow using Razorpay.
- **Real-time Order Tracking:** Push updates over WebSockets ensures instant notifications regarding order statuses.
- **Type Safety:** Across-the-board TypeScript implementation logic minimizes bugs.
