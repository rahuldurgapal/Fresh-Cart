<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$order_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (empty($order_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Order ID is required."));
    exit;
}

// Get order details
$stmt = $db->prepare("SELECT o.*, u.name as customer_name, a.street_address, a.city, a.zip_code, a.phone_number
                      FROM orders o
                      JOIN users u ON o.user_id = u.id
                      JOIN addresses a ON o.address_id = a.id
                      WHERE o.id = ? LIMIT 1");
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(array("message" => "Order not found."));
    exit;
}

$order = $result->fetch_assoc();

// Get order items
$items_stmt = $db->prepare("SELECT oi.*, p.name as product_name, p.image_path
                             FROM order_items oi
                             JOIN products p ON oi.product_id = p.id
                             WHERE oi.order_id = ?");
$items_stmt->bind_param("i", $order_id);
$items_stmt->execute();
$items_result = $items_stmt->get_result();
$items = array();
while ($row = $items_result->fetch_assoc()) {
    array_push($items, $row);
}

$order['items'] = $items;

http_response_code(200);
echo json_encode($order);
?>
