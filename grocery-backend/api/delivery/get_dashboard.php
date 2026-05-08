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
$today = date('Y-m-d');

// Today's assigned orders count
$stmt = $db->prepare("SELECT COUNT(*) as total FROM orders WHERE delivery_agent_id = ? AND DATE(created_at) = ?");
$stmt->bind_param("is", $agent_id, $today);
$stmt->execute();
$today_total = $stmt->get_result()->fetch_assoc()['total'];

// Today's delivered orders count
$stmt2 = $db->prepare("SELECT COUNT(*) as delivered FROM orders WHERE delivery_agent_id = ? AND status = 'Delivered' AND DATE(created_at) = ?");
$stmt2->bind_param("is", $agent_id, $today);
$stmt2->execute();
$today_delivered = $stmt2->get_result()->fetch_assoc()['delivered'];

// Total delivered all time
$stmt3 = $db->prepare("SELECT COUNT(*) as total_all FROM orders WHERE delivery_agent_id = ? AND status = 'Delivered'");
$stmt3->bind_param("i", $agent_id);
$stmt3->execute();
$total_all_time = $stmt3->get_result()->fetch_assoc()['total_all'];

// Currently active (Out for Delivery)
$stmt4 = $db->prepare("SELECT COUNT(*) as active_cnt FROM orders WHERE delivery_agent_id = ? AND status = 'Out for Delivery'");
$stmt4->bind_param("i", $agent_id);
$stmt4->execute();
$active = $stmt4->get_result()->fetch_assoc()['active_cnt'];

http_response_code(200);
echo json_encode([
    "today_assigned"  => (int)$today_total,
    "today_delivered" => (int)$today_delivered,
    "total_delivered" => (int)$total_all_time,
    "active_orders"   => (int)$active,
]);
?>
