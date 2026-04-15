<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

// Total Revenue
$revenue_result = $db->query("SELECT COALESCE(SUM(final_total), 0) as total FROM orders WHERE status != 'Cancelled'");
$total_revenue  = $revenue_result->fetch_assoc()['total'];

// Total Orders
$orders_result  = $db->query("SELECT COUNT(*) as total FROM orders");
$total_orders   = $orders_result->fetch_assoc()['total'];

// Total Customers
$users_result   = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'Customer'");
$total_customers = $users_result->fetch_assoc()['total'];

// Total Products
$products_result = $db->query("SELECT COUNT(*) as total FROM products");
$total_products  = $products_result->fetch_assoc()['total'];

// Low Stock Count (stock < 10)
$low_stock_result = $db->query("SELECT COUNT(*) as total FROM products WHERE stock < 10 AND stock > 0");
$low_stock        = $low_stock_result->fetch_assoc()['total'];

// Out of Stock Count
$oos_result   = $db->query("SELECT COUNT(*) as total FROM products WHERE stock = 0");
$out_of_stock = $oos_result->fetch_assoc()['total'];

// Orders Today
$today_result  = $db->query("SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = CURDATE()");
$orders_today  = $today_result->fetch_assoc()['total'];

// Revenue Today
$rev_today_res = $db->query("SELECT COALESCE(SUM(final_total), 0) as total FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'Cancelled'");
$revenue_today = $rev_today_res->fetch_assoc()['total'];

// Weekly Sales (last 7 days)
$weekly_query  = "SELECT DATE(created_at) as date, COALESCE(SUM(final_total), 0) as revenue, COUNT(*) as orders 
                  FROM orders 
                  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                  GROUP BY DATE(created_at) 
                  ORDER BY date ASC";
$weekly_result = $db->query($weekly_query);
$weekly_sales  = array();
while($row = $weekly_result->fetch_assoc()) {
    array_push($weekly_sales, $row);
}

// Top 5 Selling Products
$top_products_query = "SELECT p.name, SUM(oi.quantity) as sold 
                       FROM order_items oi 
                       JOIN products p ON oi.product_id = p.id 
                       GROUP BY p.id 
                       ORDER BY sold DESC 
                       LIMIT 5";
$top_result = $db->query($top_products_query);
$top_products = array();
while($row = $top_result->fetch_assoc()) {
    array_push($top_products, $row);
}

// Recent 5 Orders
$recent_query = "SELECT o.id, u.name as customer_name, o.final_total, o.status, o.created_at
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC
                 LIMIT 5";
$recent_result  = $db->query($recent_query);
$recent_orders  = array();
while($row = $recent_result->fetch_assoc()) {
    array_push($recent_orders, $row);
}

http_response_code(200);
echo json_encode(array(
    "total_revenue"   => (float)$total_revenue,
    "total_orders"    => (int)$total_orders,
    "total_customers" => (int)$total_customers,
    "total_products"  => (int)$total_products,
    "low_stock"       => (int)$low_stock,
    "out_of_stock"    => (int)$out_of_stock,
    "orders_today"    => (int)$orders_today,
    "revenue_today"   => (float)$revenue_today,
    "weekly_sales"    => $weekly_sales,
    "top_products"    => $top_products,
    "recent_orders"   => $recent_orders
));
?>
