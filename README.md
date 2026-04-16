# FreshCart Grocery E-Commerce Platform

FreshCart is a comprehensive, production-ready full-stack grocery e-commerce application. The project is split into three core micro-architectural parts: a feature-packed React (Vite) User Frontend, a highly functional Admin Dashboard, and a robust Native PHP API backend.

## 🚀 Architecture and Tech Stack

- **User Frontend (`/grocery-app`)**: React.js (Vite), fully modularized components, Context APIs (`AuthContext`, `CartContext`, `WalletContext`), and Custom CSS. Dark mode supported natively.
- **Admin Panel (`/grocery-admin-panel`)**: React.js (Vite), protected routing, and data table components for inventory and order management.
- **Backend API (`/grocery-backend`)**: Native object-oriented PHP with a MySQL database. Uses secure JWT-like token authentication, precise inventory locking, and CORS support for seamless multi-origin integrations.

---

## 🌟 Key Features

### User Application (Frontend)
- **Blinkit-Style Responsive UI:** Uses grouped "meta-categories" (e.g., *Grocery & Kitchen*, *Snacks & Drinks*) driven by clever frontend mapping to beautifully arrange raw backend items into an interactive grid layout.
- **Dynamic GPS & Maps API Integration:** Natively connects to HTML5 Geolocation and the OpenStreetMap (Nominatim) Reverse Geocoding API to dynamically fetch real-world addresses from user coordinates.
- **Smart Checkout System:** 
  - A responsive Multi-Step Checkout Stepper.
  - Automated GPS Address auto-filling (smart parsing for City and Pincodes).
  - Promo Code Validation and dynamic checkout total updates.
  - Integration with **FreshWallet Balance** for partial/full checkout payments.
- **Holistic Dark Mode:** Implemented globally using dynamic CSS styling `var()` structures ensuring everything from footers, modals, to checkout logic strictly adheres to Deep Dark palettes.
- **State Management:** Fully optimized Cart Add/Remove/Delete iterations natively synched with backend database verifications.

### Admin Dashboard
- **Product & Category Management:** Complete CRUD operations. Categories are safeguarded (preventing deletion of a category if active products exist within it) and dynamically display exact live product stock counts using advanced SQL joining.
- **Sales & Order Tracking:** Admins can view orders, toggle delivery statuses, and oversee analytical statistics right from the Dashboard UI.
- **Customer Directory:** Full access to registered user logs and metrics including order count logs per user.

### Backend PHP API
- **Modular File Structure:** API routes strictly split by features (`/api/auth`, `/api/products`, `/api/orders`, `/api/address`, `/api/coupons`).
- **Data Security:** Hashed passwords (`PASSWORD_BCRYPT`), prepared MySQL statements (preventing SQL injections), and strict transaction-locking during the order placing phase so products don't overdraft during concurrent requests.
- **Dynamic Load Stability:** Refactored for high-performance requests, suitable for deployment on standard public web hosting systems (like `public_html`) and resolving multi-port CORS blocks.

---

## 🔧 Installation & Setup

### Requirements
- **Node.js** (v18+)
- **PHP** (v8.0+)
- **MySQL/MariaDB** server

### 1. Backend Setup
1. Navigate to the `/grocery-backend` directory.
2. Initialize your local MySQL server.
3. Import your database schema to construct the tables (`users`, `products`, `categories`, `orders`, etc.).
4. Update configuration files to match your local Database Username/Password.
5. Start the local PHP development server:
   ```bash
   php -S 0.0.0.0:8000 -t grocery-backend/
   ```

### 2. User Application (Client)
1. Navigate to the `/grocery-app` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### 3. Admin Application
1. Navigate to the `/grocery-admin-panel` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the administration development server:
   ```bash
   npm run dev
   ```

---

## 🌎 Live Environment Deployment Note
When testing on a physical mobile device via a local IP (e.g., `http://192.168.x.x`), the native browser will block Map/GPS capabilities because HTTP is treated as an insecure context. To unleash the full geocoding features, the app must be hosted behind a secure `HTTPS` SSL certificate.

---
*Built with ❤️ focusing on clean components, scalable PHP models, and pixel-perfect design grids.*
