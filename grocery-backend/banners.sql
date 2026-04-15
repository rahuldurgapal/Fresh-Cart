-- Add to your grocery_db
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    button_text VARCHAR(100) DEFAULT 'Shop Now',
    button_link VARCHAR(255) DEFAULT '/',
    bg_color VARCHAR(50) DEFAULT '#22c55e',
    image_path VARCHAR(500) DEFAULT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO banners (title, subtitle, bg_color, status) VALUES
('Fresh Vegetables Daily', 'Farm to table in 30 minutes', '#22c55e', 'Active'),
('Fresh Dairy Products', 'Pure and natural from local farms', '#3b82f6', 'Active'),
('Exotic Fruits Sale', 'Up to 30% off on seasonal fruits', '#f59e0b', 'Active');
