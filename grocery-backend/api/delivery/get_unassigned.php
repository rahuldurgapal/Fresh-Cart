<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';

$database = new Database();
$db       = $database->getConnection();

$token   = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['role'] !== 'Delivery Agent') {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit;
}

// Get all orders that are in 'Processing' and have no delivery agent assigned yet
$query = "SELECT o.id, o.final_total, o.status, o.payment_method, o.created_at,
           u.name as customer_name, u.phone as customer_phone,
           a.street_address, a.city, a.zip_code,
           GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', ') as item_names,
           SUM(oi.quantity) as total_items
           FROM orders o
           JOIN customers u ON o.user_id = u.id
           JOIN addresses a ON o.address_id = a.id
           JOIN order_items oi ON oi.order_id = o.id
           JOIN products p ON oi.product_id = p.id
           WHERE o.status = 'Processing' AND o.delivery_agent_id IS NULL
           GROUP BY o.id
           ORDER BY o.id DESC";

$result = $db->query($query);
$arr = ["records" => []];
while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
