# FreshCart - Complete Grocery E-Commerce Platform

Welcome to the **FreshCart Grocery E-Commerce Platform**! This is a complete, production-ready system featuring three dedicated frontend applications and a robust backend REST API.

---

## 🌟 System Architecture

The project is divided into 4 main directories:

1. **`grocery-app/`** (Customer Frontend) - Built with React + Vite.
2. **`grocery-admin-panel/`** (Admin Dashboard) - Built with React + Vite.
3. **`grocery-delivery-app/`** (Delivery Agent Portal) - Built with React + Vite.
4. **`grocery-backend/`** (Backend REST API) - Built with core PHP and MySQL.

---

## ✨ Features & Functionality

### 🛒 1. Customer Application (`grocery-app`)
The core shopping experience optimized for mobile (PWA Ready).
- **Passwordless OTP Login:** Secure login using phone numbers and OTPs (Integrated with Fast2SMS).
- **Dynamic Homepage:** Auto-playing sliders, dynamic category grids, and trending search chips.
- **Advanced State Management:** Centralized Cart and Wallet (FreshWallet) system using React Context.
- **Multi-Step Checkout:** Seamless stepper UI for Address selection, Promo Code application, and Payment Method selection.
- **Online Payments (Razorpay):** Fully functional Razorpay gateway integration with backend signature verification.
- **Order Tracking:** Real-time order status (Pending → Processing → Out for Delivery → Delivered).
- **Subscription Orders:** Support for recurring daily/weekly orders (like milk and bread).
- **PWA Capabilities:** Can be installed on Android/iOS devices for a native-app-like experience.

### 💼 2. Admin Dashboard (`grocery-admin-panel`)
The central control hub for the business owner.
- **Analytics Dashboard:** Real-time metrics on sales, active orders, and revenue.
- **Inventory Management:** Full CRUD (Create, Read, Update, Delete) operations for Products, Categories, and Promotional Banners.
- **Order Processing:** Accept incoming orders and assign them to specific delivery agents.
- **Customer & Staff Management:** View registered customers and manage delivery boy accounts.

### 🛵 3. Delivery Agent App (`grocery-delivery-app`)
A lightweight portal for delivery personnel.
- **Task Management:** View assigned orders with full customer address and contact details.
- **Status Updates:** Agents can update the order status to "Out for Delivery" and finally "Delivered".

### ⚙️ 4. Backend Server (`grocery-backend`)
A highly secure, stateless API architecture.
- **JWT Authentication:** Secure token-based API endpoints. No traditional sessions used.
- **Role-Based Access Control:** Separate logic and tables for Customers (`customers` table) and Admins/Agents (`staff` table).
- **Rate Limiting (Anti-Spam):** Built-in firewall in `send_login_otp.php` that blocks IPs (max 5/15min) and phone numbers (max 3/15min) to prevent SMS abuse.
- **Simulated OTP Mode:** Developers can bypass SMS costs during testing by reading OTPs directly from the API response/logs.
- **Cron Jobs:** Backend scripts available to auto-generate recurring subscription orders daily.

---

## 🚀 Setup & Installation Guide

Follow these steps to run the complete platform on your local machine.

### Prerequisites
- Node.js (v18 or higher)
- XAMPP / LAMP Stack (PHP 8+, MySQL)

### Step 1: Database Setup
1. Open XAMPP and start **Apache** and **MySQL**.
2. Go to `http://localhost/phpmyadmin`.
3. Create a database named `grocery_db`.
4. Import the provided SQL file to create the tables (`customers`, `staff`, `orders`, `products`, `otp_logs`, etc.).

### Step 2: Backend Configuration
1. Navigate to the backend configuration file:
   `grocery-backend/config/database.php`
2. Update the credentials if necessary (Default is `root` with no password).
3. Update the **Fast2SMS API Key** if you plan to use real SMS.
4. **Start the backend server:**
   Open a terminal in the root `My-Project` directory and run the custom start script:
   ```bash
   ./start_backend.sh
   ```
   *(This script ensures the server runs using XAMPP's PHP executable with MySQLi extensions enabled on port `8000`)*.

### Step 3: Frontend Setup
You need to run the three frontend applications. Open 3 separate terminal tabs/windows.

**Terminal 1 (Customer App):**
```bash
cd grocery-app
npm install
npm run dev -- --host
```

**Terminal 2 (Admin Panel):**
```bash
cd grocery-admin-panel
npm install
npm run dev -- --host
```

**Terminal 3 (Delivery App):**
```bash
cd grocery-delivery-app
npm install
npm run dev -- --host
```

*Note: Ensure that the `src/config.js` file inside each frontend folder is pointing to the correct backend IP/Port (e.g., `http://localhost:8000`).*

---

## 🔧 Important Integrations & API Keys

- **Fast2SMS (OTP):** By default, the system might be set to *Simulated Mode* for testing. To send real SMS, ensure your Fast2SMS DLT registration is complete or use the WhatsApp route. Edit `api/auth/send_login_otp.php` to toggle this.
- **Razorpay (Payments):** Test API keys are currently configured in `api/orders/create_razorpay_order.php` and `Checkout.jsx`. Replace these with your Live keys when moving to production.

---
*Built with ❤️ for a seamless grocery shopping experience.*
