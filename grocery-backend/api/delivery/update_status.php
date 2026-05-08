<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';
require_once '../../config/NotificationHelper.php';

$database = new Database();
$db       = $database->getConnection();

$token   = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['role'] !== 'Delivery Agent') {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit;
}

$data     = json_decode(file_get_contents("php://input"));
$order_id = intval($data->order_id ?? 0);
$status   = htmlspecialchars(strip_tags($data->status ?? ''));
$notes    = htmlspecialchars(strip_tags($data->notes ?? ''));
$agent_id = $payload['id'];

$allowed_statuses = ['Out for Delivery', 'Delivered'];
if (!$order_id || !in_array($status, $allowed_statuses)) {
    http_response_code(400);
    echo json_encode(["message" => "Valid order_id and status (Out for Delivery / Delivered) are required."]);
    exit;
}

// Ensure agent owns this order
$check = $db->prepare("SELECT id FROM orders WHERE id = ? AND delivery_agent_id = ?");
$check->bind_param("ii", $order_id, $agent_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    http_response_code(403);
    echo json_encode(["message" => "You are not assigned to this order."]);
    exit;
}

if ($notes) {
    $stmt = $db->prepare("UPDATE orders SET status = ?, delivery_notes = ? WHERE id = ? AND delivery_agent_id = ?");
    $stmt->bind_param("ssii", $status, $notes, $order_id, $agent_id);
} else {
    $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ? AND delivery_agent_id = ?");
    $stmt->bind_param("sii", $status, $order_id, $agent_id);
}

if ($stmt->execute()) {
    // Send notification to admin only when Delivered
    if ($status === 'Delivered') {
        $agent_name = $payload['name'] ?? 'The Delivery Agent';
        NotificationHelper::onOrderDelivered($db, $order_id, $agent_name);
    }
    http_response_code(200);
    echo json_encode(["message" => "Order status updated to '$status'.", "status" => $status]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to update status."]);
}
?>
