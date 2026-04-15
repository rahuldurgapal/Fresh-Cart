<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

if (empty($user_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "user_id is required."));
    exit;
}

$query = "SELECT o.*, a.street_address, a.city,
          GROUP_CONCAT(p.name ORDER BY oi.id SEPARATOR ', ') as item_names,
          SUM(oi.quantity) as total_items
          FROM orders o
          JOIN addresses a ON o.address_id = a.id
          JOIN order_items oi ON oi.order_id = o.id
          JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = ?
          GROUP BY o.id
          ORDER BY o.created_at DESC";

$stmt = $db->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$arr = array("records" => array());
while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
