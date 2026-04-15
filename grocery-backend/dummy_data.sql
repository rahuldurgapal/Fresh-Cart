-- Select Database
USE grocery_db;

-- Clear existing data if you re-run this script
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM coupons;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM addresses;
DELETE FROM users;

ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE coupons AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE addresses AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- =========================================================
-- 1. USERS (Password for all is: password)
-- =========================================================
-- Note: the hash is exactly 'password' hashed via PHP BCRYPT
INSERT INTO users (id, name, email, password, role, status) VALUES
(1, 'Super Admin', 'admin@freshapp.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'Active'),
(2, 'Vikas Delivery', 'delivery@freshapp.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Delivery Agent', 'Active'),
(3, 'Alice Johnson', 'alice@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer', 'Active'),
(4, 'Bob Smith', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer', 'Active'),
(5, 'Charlie Davis', 'charlie@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer', 'Inactive'),
(6, 'Diana Moore', 'diana@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Customer', 'Active');

-- =========================================================
-- 2. ADDRESSES
-- =========================================================
INSERT INTO addresses (id, user_id, street_address, city, zip_code, phone_number) VALUES
(1, 3, 'Block A, Flat 204, Green Park', 'New Delhi', '110016', '+91 9876543210'),
(2, 4, 'B-45, Vasant Kunj', 'New Delhi', '110070', '+91 9876543211'),
(3, 6, 'Tower 2, Cyber City', 'Gurgaon', '122002', '+91 9876543212');

-- =========================================================
-- 3. CATEGORIES
-- =========================================================
INSERT INTO categories (id, name, status, image_path) VALUES
(1, 'Fresh Vegetables', 'Active', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(2, 'Dairy & Breakfast', 'Active', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(3, 'Sweet Fruits', 'Active', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(4, 'Bakery', 'Active', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(5, 'Snacks & Munchies', 'Active', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
(6, 'Meat & Seafood', 'Active', 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');

-- =========================================================
-- 4. PRODUCTS (20 rich items)
-- =========================================================
INSERT INTO products (id, name, category_id, price, stock, status, image_path) VALUES
(1, 'Farm Fresh Tomatoes', 1, 40.00, 150, 'In Stock', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'),
(2, 'Organic Red Onions', 1, 35.00, 200, 'In Stock', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80'),
(3, 'Green Capsicum', 1, 60.00, 45, 'In Stock', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa8a?w=800&q=80'),
(4, 'Premium Garlic', 1, 120.00, 10, 'Low Stock', 'https://images.unsplash.com/photo-1540148426941-ab3f01c71286?w=800&q=80'),
(5, 'Fresh Coriander Bunch', 1, 15.00, 0, 'Out of Stock', 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=800&q=80'),

(6, 'Amul Taza Milk 1L', 2, 68.00, 100, 'In Stock', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80'),
(7, 'Amul Butter 100g', 2, 58.00, 80, 'In Stock', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=80'),
(8, 'Cream Cheese', 2, 120.00, 20, 'In Stock', 'https://images.unsplash.com/photo-1628191010378-01124fb0fbaf?w=800&q=80'),
(9, 'Greek Yogurt Vanilla', 2, 45.00, 15, 'Low Stock', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80'),

(10, 'Shimla Apples', 3, 180.00, 30, 'In Stock', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=800&q=80'),
(11, 'Nagpur Oranges r5kg', 3, 120.00, 40, 'In Stock', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80'),
(12, 'Ratnagiri Alphonso', 3, 850.00, 5, 'Low Stock', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80'),

(13, 'Multigrain Bread', 4, 55.00, 25, 'In Stock', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'),
(14, 'Chocolate Croissant', 4, 45.00, 50, 'In Stock', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80'),
(15, 'Blueberry Muffins (2)', 4, 99.00, 10, 'Low Stock', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80'),

(16, 'Lays Classic Salted', 5, 20.00, 200, 'In Stock', 'https://images.unsplash.com/photo-1566478989037-e924e50bbd4a?w=800&q=80'),
(17, 'Haldirams Bhujia', 5, 95.00, 120, 'In Stock', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80'),
(18, 'Diet Coke Can', 5, 40.00, 50, 'In Stock', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80'),

(19, 'Chicken Breast 500g', 6, 220.00, 15, 'In Stock', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80'), -- reusing image
(20, 'Prawns Medium', 6, 450.00, 5, 'Low Stock', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80');

-- =========================================================
-- 5. COUPONS
-- =========================================================
INSERT INTO coupons (id, code, discount_type, discount_value, min_order, status) VALUES
(1, 'NEWUSER50', 'Flat', 50.00, 200.00, 'Active'),
(2, 'FRESH10', 'Percentage', 10.00, 500.00, 'Active'),
(3, 'DIWALI25', 'Percentage', 25.00, 1000.00, 'Expired');

-- =========================================================
-- 6. ORDERS
-- =========================================================
INSERT INTO orders (id, user_id, address_id, coupon_code, payment_method, payment_status, final_total, status, created_at) VALUES
(1, 3, 1, 'NEWUSER50', 'Online', 'Success', 420.00, 'Delivered', '2026-10-20 10:30:00'),
(2, 3, 1, NULL, 'COD', 'Pending', 115.00, 'Delivered', '2026-10-24 14:15:00'),
(3, 4, 2, 'FRESH10', 'Online', 'Success', 585.00, 'Processing', '2026-10-24 18:00:00'),
(4, 6, 3, NULL, 'Online', 'Failed', 2000.00, 'Cancelled', '2026-10-21 09:20:00');

-- =========================================================
-- 7. ORDER ITEMS
-- =========================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 2, 40.00),
(1, 6, 1, 68.00),
(1, 12, 1, 850.00), -- High value mangoes
(2, 13, 1, 55.00),
(2, 3, 1, 60.00),
(3, 19, 2, 220.00),
(3, 2, 1, 35.00),
(3, 4, 1, 120.00),
(4, 20, 4, 450.00); 

-- Done!
