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

$agent_id = $payload['id'];

$query = "SELECT o.id, o.final_total, o.status, o.payment_method, o.delivery_notes, o.created_at,
           u.name as customer_name, u.phone as customer_phone,
           a.street_address, a.city, a.zip_code,
           GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', ') as item_names,
           SUM(oi.quantity) as total_items
           FROM orders o
           JOIN customers u ON o.user_id = u.id
           JOIN addresses a ON o.address_id = a.id
           JOIN order_items oi ON oi.order_id = o.id
           JOIN products p ON oi.product_id = p.id
           WHERE o.delivery_agent_id = ?
           GROUP BY o.id
           ORDER BY o.id DESC";

$stmt = $db->prepare($query);
$stmt->bind_param("i", $agent_id);
$stmt->execute();
$result = $stmt->get_result();

$arr = ["records" => []];
while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
